import logging
import re
import httpx
from fastapi import HTTPException
from typing import List, Optional, Dict, Any, Tuple
from backend.app.core.config import settings
from backend.app.schemas.nora import NoraMessage, NoraChatRequest, NoraChatResponse
from backend.app.services.math_engine import MathEngine

SYSTEM_PROMPT = """Kamu adalah NORA (Numerical Optimization and Reasoning Assistant), tutor AI pendamping pembelajaran matematika aljabar untuk siswa SMP Kelas VII di NUMORA Space.

Pedoman Interaksi NORA:
1. Alur & Intent Percakapan:
   - Jika siswa hanya menyapa (seperti "Halo", "Hai", "Selamat pagi/siang/malam", "Apa kabar?"):
     Jawablah dengan ramah, hangat, singkat, dan natural. Contoh: "Halo! Senang bertemu denganmu. Hari ini mau belajar aljabar atau ada yang ingin kamu tanyakan?"
     JANGAN PERNAH mengeluarkan rumus atau persamaan matematika saat siswa hanya menyapa!
   - Jika siswa menyatakan bingung ("saya bingung", "tidak paham"):
     Tunjukkan empati dan tanyakan bagian mana yang membingungkan secara Sokratik.
   - Jika siswa mengucapkan terima kasih atau pamit:
     Jawab dengan apresiatif dan bersahabat tanpa rumus aljabar.
   - Jika siswa bertanya tentang aljabar:
     Jelaskan bertahap, gunakan analogi konkret (wadah nilai untuk variabel, timbangan untuk persamaan), dan gunakan bahasa Indonesia yang mudah dipahami siswa kelas VII.
2. Guardrail Asesmen Penelitian:
   Tolak secara santun dan edukatif jika siswa meminta membocorkan kunci jawaban instrumen pre-test atau post-test penelitian.
3. Pengucapan & Notasi:
   Bentuk seperti -3x dibaca 'negatif tiga x', bukan 'kurang tiga x'."""

logger = logging.getLogger(__name__)


class NoraAIService:
    @classmethod
    async def process_chat(cls, payload: NoraChatRequest) -> NoraChatResponse:
        message = payload.message.strip()
        mode = (payload.mode or "explain").lower()
        tier = payload.hint_tier or 1
        history = payload.history or []

        # 1. Deteksi Intent Pesan
        intent = cls._detect_intent(message)

        # 2. GUARDRAIL ASESMEN PENELITIAN
        if intent == "GUARDRAIL_ASSESSMENT":
            reply = (
                "Maaf ya, untuk instrumen penelitian atau tes mandiri (Pre-Test / Post-Test), "
                "NORA tidak diperkenankan memberikan jawaban langsung. Ini penting agar Bapak/Ibu Peneliti "
                "dapat melihat daya nalar dan pemahaman aslimu secara objektif. "
                "Semangat, kamu pasti bisa mencobanya sendiri dengan kemampuan terbaikmu!"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Maaf, untuk instrumen tes mandiri, NORA tidak diperkenankan memberikan jawaban langsung. Kamu pasti bisa mencobanya sendiri!",
                hint_tier=tier,
                misconception_flag="Assessment Protection Guardrail Triggered",
                demo_mode=True,
                is_generative=False
            )

        # 3. PERCAKAPAN UMUM (Salam, Kabar, Terima Kasih, Pamit, Kebingungan)
        # Jangan memaksakan salam atau percakapan umum memanggil MathEngine atau mengeluarkan persamaan!
        if intent.startswith("GENERAL_"):
            return cls._handle_general_conversation(intent, message, mode, tier)

        # 4. EKSTRAKSI KONTEKS PERCAKAPAN LALU (untuk pertanyaan lanjutan aljabar)
        context = cls._extract_conversation_context(history)

        # 5. VERIFIED MATH ENGINE HOOK (Hanya untuk pertanyaan aljabar / kalkulasi)
        verified_data = None
        if intent in ("ALGEBRA_MATH", "ANSWER_CHECKING", "REQUEST_HINT"):
            verified_data = cls._verify_math_with_context(message, context)

        # 6. INTEGRASI GENERATIVE AI (Jika API Key Disediakan)
        provider_attempted = False
        provider_failed = False

        if settings.GEMINI_API_KEY:
            provider_attempted = True
            try:
                gen_reply, math_latex = await cls._call_gemini(message, history, verified_data)
                if gen_reply:
                    speech = cls._clean_speech_text(gen_reply)
                    return NoraChatResponse(
                        reply=gen_reply,
                        mode_used=mode,
                        math_latex=math_latex or (verified_data.get("latex") if verified_data else None),
                        voice_spoken_text=speech,
                        hint_tier=tier,
                        demo_mode=False,
                        verified_math=verified_data,
                        is_generative=True
                    )
                provider_failed = True
                logger.warning("NORA provider request failed provider=gemini category=empty_response")
            except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError) as exc:
                provider_failed = True
                status = exc.response.status_code if isinstance(exc, httpx.HTTPStatusError) else None
                logger.warning(
                    "NORA provider request failed provider=gemini status=%s error_type=%s",
                    status,
                    type(exc).__name__,
                )

        if settings.OPENAI_API_KEY:
            provider_attempted = True
            try:
                gen_reply, math_latex = await cls._call_openai(message, history, verified_data)
                if gen_reply:
                    speech = cls._clean_speech_text(gen_reply)
                    return NoraChatResponse(
                        reply=gen_reply,
                        mode_used=mode,
                        math_latex=math_latex or (verified_data.get("latex") if verified_data else None),
                        voice_spoken_text=speech,
                        hint_tier=tier,
                        demo_mode=False,
                        verified_math=verified_data,
                        is_generative=True
                    )
                provider_failed = True
                logger.warning("NORA provider request failed provider=openai category=empty_response")
            except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError) as exc:
                provider_failed = True
                status = exc.response.status_code if isinstance(exc, httpx.HTTPStatusError) else None
                logger.warning(
                    "NORA provider request failed provider=openai status=%s error_type=%s",
                    status,
                    type(exc).__name__,
                )

        if provider_attempted and provider_failed:
            raise HTTPException(
                status_code=503,
                detail="Layanan AI NORA sedang tidak tersedia. Periksa konfigurasi atau kuota provider, lalu coba lagi.",
            )

        # 7. ADAPTIVE SOCRATIC KNOWLEDGE ENGINE (Honest Offline Fallback)
        return cls._generate_adaptive_socratic_response(
            message, mode, tier, history, context, verified_data, intent
        )

    @classmethod
    def _detect_intent(cls, message: str) -> str:
        msg_l = message.lower().strip()

        # Guardrail Asesmen
        if any(k in msg_l for k in [
            "pre-test", "post-test", "soal evaluasi riset", "bocorkan jawaban",
            "kunci jawaban tes", "kunci jawaban post", "jawaban pre test"
        ]):
            return "GUARDRAIL_ASSESSMENT"

        # Salam / Sapaan
        greeting_patterns = [
            r"^(halo|hai|hei|helo|hi)(\s+nora)?[\!\?\.\s]*$",
            r"^(selamat\s+(pagi|siang|sore|malam))(\s+nora)?[\!\?\.\s]*$",
            r"^(assalamu['\s]?alaikum)[\!\?\.\s]*$",
            r"^(apa\s+kabar)(\s+nora)?[\!\?\.\s]*$"
        ]
        for pat in greeting_patterns:
            if re.match(pat, msg_l):
                return "GENERAL_GREETING"

        # Ucapan Terima Kasih
        if any(msg_l == k or msg_l.startswith(k + " ") or msg_l.endswith(" " + k) for k in [
            "terima kasih", "makasih", "thanks", "terimakasih", "tengkyu", "matur nuwun", "syukron"
        ]):
            return "GENERAL_THANKS"

        # Pamitan / Sampai Jumpa
        if any(msg_l == k or msg_l.startswith(k + " ") for k in [
            "sampai jumpa", "dadah", "bye", "goodbye", "pamit dulu", "sudah selesai"
        ]):
            return "GENERAL_FAREWELL"

        # Kebingungan Siswa
        if any(k in msg_l for k in [
            "saya bingung", "aku bingung", "masih bingung", "tidak mengerti",
            "tidak paham", "nggak ngerti", "gak paham", "pusing", "kurang paham"
        ]):
            return "GENERAL_CONFUSION"

        # Konfirmasi Pemahaman / Oke
        if any(msg_l == k or msg_l.startswith(k + " ") for k in [
            "oke", "ok", "siap", "paham", "mengerti", "baiklah", "sip", "siap paham"
        ]) and len(msg_l) < 20:
            return "GENERAL_ACK"

        # Permintaan Contoh Soal
        if any(k in msg_l for k in [
            "beri contoh", "berikan contoh", "contoh soal", "contoh aljabar",
            "contoh bentuk aljabar", "kasih contoh", "contohnya seperti apa"
        ]):
            return "REQUEST_EXAMPLE"

        # Permintaan Petunjuk / Hint
        if any(k in msg_l for k in [
            "beri petunjuk", "petunjuk", "hint", "bantu langkahnya", "bagaimana caranya",
            "kenapa", "mengapa", "kok bisa", "dari mana", "jelaskan caranya"
        ]):
            return "REQUEST_HINT"

        # Panduan Belajar
        if any(k in msg_l for k in [
            "cara belajar", "tips belajar", "mulai dari mana", "urutan modul", "panduan belajar"
        ]):
            return "LEARNING_GUIDANCE"

        # Pengecekan Jawaban
        if any(k in msg_l for k in [
            "apakah jawabanku benar", "cek jawaban", "betul nggak", "benar tidak",
            "kalau jawabannya", "jawaban saya"
        ]):
            return "ANSWER_CHECKING"

        # Penjelasan Konsep
        if any(k in msg_l for k in [
            "apa itu variabel", "apa itu koefisien", "apa itu konstanta", "apa itu suku",
            "timbangan aljabar", "neraca", "apa maksudnya bentuk aljabar", "al-khawarizmi"
        ]):
            return "CONCEPT_EXPLANATION"

        # Pertanyaan Matematika Aljabar Spesifik
        has_math_ops = bool(re.search(r"(\d*x|\d*y|[=+\-*/]|substitusi|hitung|persamaan)", msg_l))
        if has_math_ops:
            return "ALGEBRA_MATH"

        # Topik di luar aljabar
        return "OUT_OF_SCOPE"

    @classmethod
    def _handle_general_conversation(cls, intent: str, message: str, mode: str, tier: int) -> NoraChatResponse:
        """
        Menangani percakapan umum tanpa menghasilkan rumus matematika palsu atau acak.
        """
        if intent == "GENERAL_GREETING":
            reply = "Halo! Senang bertemu denganmu. Hari ini mau belajar aljabar atau ada yang ingin kamu tanyakan?"
            speech = "Halo! Senang bertemu denganmu. Hari ini mau belajar aljabar atau ada yang ingin kamu tanyakan?"
        elif intent == "GENERAL_THANKS":
            reply = "Sama-sama! Senang sekali bisa menemanimu belajar matematika aljabar. 🌟 Jika ada konsep yang masih membingungkan, tanyakan saja ke NORA ya!"
            speech = "Sama-sama! Senang bisa menemanimu belajar aljabar. Jika ada soal lain, silakan tanyakan ya!"
        elif intent == "GENERAL_FAREWELL":
            reply = "Sampai jumpa lagi! Tetap semangat belajar aljabarnya ya. Kapan pun kamu butuh bimbingan, NORA selalu siap menemanimu di NUMORA Space. 👋"
            speech = "Sampai jumpa lagi! Tetap semangat belajar aljabar ya!"
        elif intent == "GENERAL_CONFUSION":
            reply = (
                "Tenang, merasa bingung saat baru mempelajari aljabar itu sangat wajar dan merupakan bagian dari belajar! 😊\n\n"
                "Bagian mana yang paling membuatmu bingung saat ini?\n"
                "• Variabel (lambang huruf penampung nilai)?\n"
                "• Koefisien (angka pengali di depan huruf)?\n"
                "• Konstanta (angka mandiri)?\n"
                "• Cara menghitung nilai aljabarnya?\n\n"
                "Beri tahu NORA bagian mana yang ingin kita pelajari pelan-pelan bersama ya."
            )
            speech = "Tenang, jangan cemas ya. Merasa bingung saat belajar aljabar itu wajar sekali. Bagian mana yang paling membuatmu bingung? Ceritakan pada NORA ya."
        elif intent == "GENERAL_ACK":
            reply = "Hebat! Pemahaman yang bagus. 👏 Kamu bisa melanjutkan ke modul materi berikutnya, berlatih simulasi di Algebra Lab, atau mengerjakan tantangan aljabar."
            speech = "Hebat! Pemahaman yang bagus. Kamu bisa melanjutkan ke modul materi atau mencoba tantangan aljabar."
        else:
            reply = "Halo! NORA siap membantumu belajar aljabar. Ada hal yang ingin kamu tanyakan?"
            speech = "Halo! Ada yang ingin kamu tanyakan tentang aljabar?"

        return NoraChatResponse(
            reply=reply,
            mode_used=mode,
            math_latex=None,  # STRICTLY NULL UNTUK GENERAL CONVERSATION!
            voice_spoken_text=speech,
            hint_tier=tier,
            demo_mode=True,
            is_generative=False
        )

    @classmethod
    def _extract_conversation_context(cls, history: List[NoraMessage]) -> Dict[str, Any]:
        ctx: Dict[str, Any] = {
            "last_expression": None,
            "last_x": None,
            "last_result": None,
            "last_topic": None,
        }

        for msg in reversed(history):
            content = msg.content
            cl = content.lower()

            if ctx["last_x"] is None:
                xm = re.search(r"x\s*=\s*(-?\d+(?:\.\d+)?)", cl)
                if xm:
                    try:
                        ctx["last_x"] = float(xm.group(1))
                    except ValueError:
                        pass

            if ctx["last_expression"] is None:
                no_x_val = re.sub(r"x\s*=\s*-?\d+", "", cl)
                em = re.search(r"([+-]?\s*\d*x(?:\s*[+-]\s*\d+)?)", no_x_val)
                if em:
                    cand = em.group(1).replace(" ", "")
                    if len(cand) >= 2 and "x" in cand:
                        ctx["last_expression"] = cand

            if ctx["last_result"] is None:
                rm = re.search(r"(?:hasilnya\s*(?:adalah|=)?|hasil\s*=\s*|=\s*|\badalah\s*)(-?\d+(?:\.\d+)?)", cl)
                if rm:
                    try:
                        ctx["last_result"] = float(rm.group(1))
                    except ValueError:
                        pass

            if ctx["last_topic"] is None:
                if "koefisien" in cl:
                    ctx["last_topic"] = "koefisien"
                elif "variabel" in cl:
                    ctx["last_topic"] = "variabel"
                elif "konstanta" in cl:
                    ctx["last_topic"] = "konstanta"
                elif any(k in cl for k in ["persamaan", "neraca", "timbangan", "seimbang"]):
                    ctx["last_topic"] = "persamaan"

        return ctx

    @classmethod
    def _verify_math_with_context(cls, text: str, context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        tl = text.lower()

        # Nilai x pada pesan terkini
        x_match = re.search(r"x\s*=\s*(-?\d+)", tl)
        current_x = float(x_match.group(1)) if x_match else None

        # Ekspresi aljabar pada pesan terkini
        cleaned = re.sub(r"x\s*=\s*-?\d+", "", tl) if x_match else tl
        expr_match = re.search(r"([+-]?\s*\d*x(?:\s*[+-]\s*\d+)?)", cleaned)
        current_expr = None
        if expr_match:
            cand = expr_match.group(1).replace(" ", "")
            if len(cand) >= 2 and "x" in cand:
                current_expr = cand

        eval_expr = current_expr or context.get("last_expression")
        eval_x = current_x if current_x is not None else context.get("last_x")

        if eval_expr and eval_x is not None:
            if current_x is not None or current_expr is not None:
                try:
                    eval_res = MathEngine.evaluate_linear_expression(eval_expr, {"x": eval_x})
                    return {
                        "type": "substitution",
                        "expression": eval_expr,
                        "x": eval_x,
                        "result": eval_res.result,
                        "latex": eval_res.formatted_latex,
                        "steps": [s.description for s in eval_res.steps]
                    }
                except (ValueError, TypeError, ArithmeticError):
                    pass

        # Deteksi koefisien spesifik
        coeff_match = re.search(r"koefisien\s*(?:dari|pada)?\s*([+-]?\d*)x", tl)
        if coeff_match:
            raw_c = coeff_match.group(1).replace(" ", "")
            if raw_c in ("", "+"):
                c_val = 1
            elif raw_c == "-":
                c_val = -1
            else:
                try:
                    c_val = int(raw_c)
                except ValueError:
                    c_val = raw_c
            return {
                "type": "coefficient",
                "term": f"{raw_c}x",
                "coefficient": c_val,
                "latex": f"{raw_c}x \\implies a = {c_val}"
            }

        return None

    @classmethod
    async def _call_gemini(cls, message: str, history: List[NoraMessage], verified: Optional[Dict[str, Any]]) -> Tuple[str, Optional[str]]:
        if not httpx or not settings.GEMINI_API_KEY:
            return None, None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_AI_MODEL}:generateContent"
        headers = {"x-goog-api-key": settings.GEMINI_API_KEY}
        contents = []
        contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION: {SYSTEM_PROMPT}"}]})
        contents.append({"role": "model", "parts": [{"text": "Dimengerti. Saya NORA, asisten AI pendamping aljabar SMP Kelas VII. Saya akan mengenali maksud percakapan, tidak memasukkan rumus matematika pada sapaan umum, dan membimbing siswa secara Sokratik."}]})

        for h in history[-10:]:
            role = "user" if h.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.content}]})

        user_prompt = message
        if verified:
            user_prompt += f"\n[CATATAN MESIN MATEMATIKA TERVERIFIKASI: Hasil perhitungan terbukti matematis adalah {verified}. Pastikan jawabanmu konsisten.]"

        contents.append({"role": "user", "parts": [{"text": user_prompt}]})

        async with httpx.AsyncClient(timeout=2.5) as client:
            resp = await client.post(url, headers=headers, json={"contents": contents})
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                latex_match = re.search(r"\$([^$]+)\$", text)
                latex = latex_match.group(1) if latex_match else None
                return text.strip(), latex
            raise httpx.HTTPStatusError(
                "Gemini API rejected the request.",
                request=resp.request,
                response=resp
            )

    @classmethod
    async def _call_openai(cls, message: str, history: List[NoraMessage], verified: Optional[Dict[str, Any]]) -> Tuple[str, Optional[str]]:
        if not httpx or not settings.OPENAI_API_KEY:
            return None, None

        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in history[-10:]:
            messages.append({"role": "user" if h.role == "user" else "assistant", "content": h.content})

        user_content = message
        if verified:
            user_content += f"\n[VERIFIED MATH ENGINE: Perhitungan terverifikasi adalah {verified}.]"
        messages.append({"role": "user", "content": user_content})

        async with httpx.AsyncClient(timeout=2.5) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.7}
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["choices"][0]["message"]["content"]
                latex_match = re.search(r"\$([^$]+)\$", text)
                latex = latex_match.group(1) if latex_match else None
                return text.strip(), latex
            raise httpx.HTTPStatusError(
                "OpenAI API rejected the request.",
                request=resp.request,
                response=resp
            )

    @classmethod
    def _generate_adaptive_socratic_response(
        cls,
        message: str,
        mode: str,
        tier: int,
        history: List[NoraMessage],
        context: Dict[str, Any],
        verified: Optional[Dict[str, Any]],
        intent: str
    ) -> NoraChatResponse:
        """
        Socratic knowledge engine adaptif ketika AI eksternal offline / demo mode.
        Jujur memberitahukan status dan memberikan bimbingan Sokratik berbasis MathEngine.
        """
        msg_l = message.lower().strip()

        # 1. PERTANYAAN TENTANG CARA / KENAPA DARI LANGKAH SEBELUMNYA
        if any(msg_l == k or msg_l.startswith(k + " ") or msg_l == (k + "?") for k in ["kenapa", "mengapa", "kok bisa", "dari mana"]):
            last_expr = context.get("last_expression")
            last_x = context.get("last_x")
            last_res = context.get("last_result")

            if last_expr and last_x is not None:
                x_str = str(int(last_x)) if last_x.is_integer() else str(last_x)
                try:
                    eval_res = MathEngine.evaluate_linear_expression(last_expr, {"x": last_x})
                    res_val = int(eval_res.result) if eval_res.result.is_integer() else eval_res.result
                    reply = (
                        f"Karena pada bentuk aljabar {last_expr}, kita mengganti nilai variabel x dengan bilangan {x_str}.\n\n"
                        f"Langkah perhitungannya:\n"
                        f"1. Selesaikan perkalian koefisien dengan variabel: ({last_expr.replace('x', f' × {x_str}')})\n"
                        f"2. Hitung operasinya hingga menghasilkan nilai akhir {res_val}."
                    )
                    return NoraChatResponse(
                        reply=reply,
                        mode_used=mode,
                        math_latex=eval_res.formatted_latex,
                        voice_spoken_text=f"Karena variabel x kita ganti dengan {x_str}, dikalikan dan dijumlahkan sehingga hasilnya {res_val}.",
                        hint_tier=tier,
                        demo_mode=True,
                        is_generative=False
                    )
                except (ValueError, TypeError, ArithmeticError):
                    pass

        # 2. PERTANYAAN LANJUTAN DENGAN OPERASI ("Kalau dikurangi 2?", "Gimana kalau ditambah 3?")
        op_match = re.search(r"(?:kalau|bagaimana kalau|gimana kalau)?\s*(dikurangi|ditambah|dikali|dibagi)\s*(\d+)", msg_l)
        if op_match:
            op_type = op_match.group(1)
            op_num = float(op_match.group(2))
            op_num_str = str(int(op_num)) if op_num.is_integer() else str(op_num)
            last_res = context.get("last_result")
            last_expr = context.get("last_expression")

            if last_res is not None:
                res_int = int(last_res) if last_res.is_integer() else last_res
                if op_type == "dikurangi":
                    new_val = last_res - op_num
                    op_symbol = "-"
                elif op_type == "ditambah":
                    new_val = last_res + op_num
                    op_symbol = "+"
                elif op_type == "dikali":
                    new_val = last_res * op_num
                    op_symbol = "×"
                else:
                    new_val = last_res / op_num if op_num != 0 else last_res
                    op_symbol = "÷"

                new_val_str = str(int(new_val)) if new_val.is_integer() else str(new_val)
                reply = (
                    f"Tergantung bagian mana yang dimaksud:\n\n"
                    f"1. Jika hasil sebelumnya ({res_int}) {op_type} {op_num_str}, maka nilainya adalah {new_val_str} ({res_int} {op_symbol} {op_num_str} = {new_val_str}).\n"
                )
                if last_expr:
                    reply += (
                        f"2. Jika yang dimaksud adalah bentuk aljabarnya ({last_expr}) {op_symbol} {op_num_str}, "
                        f"maka konstantanya dioperasikan dengan {op_num_str}."
                    )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex=f"{res_int} {op_symbol} {op_num_str} = {new_val_str}",
                    voice_spoken_text=f"Jika hasil sebelumnya {op_type} {op_num_str}, maka nilainya adalah {new_val_str}.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )

        # 3. PERHITUNGAN TERVERIFIKASI MATHENGINE (Hanya jika ada pertanyaan kalkulasi)
        if verified and verified["type"] == "substitution":
            expr = verified["expression"]
            x = verified["x"]
            res = int(verified["result"]) if verified["result"].is_integer() else verified["result"]
            x_str = str(int(x)) if x.is_integer() else str(x)

            reply = (
                f"Hasil evaluasinya adalah {res}.\n\n"
                f"Langkah perhitungannya: kita substitusikan x = {x_str} ke dalam {expr}:\n"
                f"{expr.replace('x', f'({x_str})')} = {res}."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=verified["latex"],
                voice_spoken_text=f"Hasilnya adalah {res}. Didapat dari memasukkan nilai x sama dengan {x_str} ke dalam bentuk {expr}.",
                hint_tier=tier,
                demo_mode=True,
                verified_math=verified,
                is_generative=False
            )

        # 4. PERTANYAAN DIRECT TENTANG HASIL ("itu hasilnya brp?")
        if any(k in msg_l for k in ["hasilnya brp", "hasilnya berapa", "berapa hasilnya", "jadi berapa hasilnya"]):
            last_res = context.get("last_result")
            last_expr = context.get("last_expression")
            last_x = context.get("last_x")

            if last_res is not None:
                res_str = str(int(last_res)) if last_res.is_integer() else str(last_res)
                reply = f"Hasilnya adalah {res_str}."
                if last_expr and last_x is not None:
                    x_str = str(int(last_x)) if last_x.is_integer() else str(last_x)
                    reply += f" (didapat dari evaluasi {last_expr} untuk x = {x_str})."
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex=f"{last_expr} = {res_str}" if last_expr else None,
                    voice_spoken_text=f"Hasilnya adalah {res_str}.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )
            else:
                reply = "Bisa sebutkan bentuk aljabar dan nilai x yang ingin kamu hitung hasilnya?"
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex=None,
                    voice_spoken_text=reply,
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )

        # 5. PERMINTAAN CONTOH SOAL (REQUEST_EXAMPLE)
        if intent == "REQUEST_EXAMPLE":
            reply = (
                "Ini contoh soal kontekstual aljabar dalam kehidupan sehari-hari: 📘\n\n"
                "\"Budi membeli 4 buku tulis seharga x ribu rupiah dan 1 tempat pensil seharga Rp6.000.\"\n\n"
                "• Bentuk aljabarnya adalah 4x + 6.\n"
                "• Angka 4 adalah koefisien (banyaknya buku).\n"
                "• Huruf x adalah variabel (harga per buku yang belum pasti).\n"
                "• Angka 6 adalah konstanta (biaya tempat pensil yang tetap).\n\n"
                "Coba hitung: jika harga satu buku adalah x = 5 (Rp5.000), berapa total belanja Budi?"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used="explain",
                math_latex="4x + 6 \\quad (x = 5)",
                voice_spoken_text="Ini contoh bentuk aljabar 4 x tambah 6. Jika x sama dengan 5, berapa total belanjaannya?",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # 6. PANDUAN CARA BELAJAR (LEARNING_GUIDANCE)
        if intent == "LEARNING_GUIDANCE":
            reply = (
                "Untuk menguasai aljabar kelas VII, ikuti 4 tahapan fondasi di NUMORA Space: 🎯\n\n"
                "1. Modul 1: Variabel — memahami huruf (seperti x) sebagai wadah penampung bilangan.\n"
                "2. Modul 2: Koefisien — memahami angka di depan huruf sebagai faktor pengali (perhatikan tanda negatif seperti -5x).\n"
                "3. Modul 3: Konstanta — memahami bilangan mandiri yang berdiri sendiri tanpa huruf.\n"
                "4. Modul 4: Bentuk Aljabar — menggabungkan ketiganya dan melakukan substitusi nilai.\n\n"
                "Kamu juga bisa bereksperimen langsung di Algebra Lab untuk melihat visual timbangannya!"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used="explain",
                math_latex=None,
                voice_spoken_text="Ada empat modul utama: variabel, koefisien, konstanta, dan bentuk aljabar.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # 7. PERTANYAAN KONSEP: KOEFISIEN (termasuk tanda negatif)
        if "koefisien" in msg_l:
            if "-5x" in msg_l:
                reply = (
                    "Pada bentuk -5x, koefisiennya adalah -5, bukan 5.\n\n"
                    "Alasannya: tanda negatif (-) di depan angka melekat erat menjadi bagian utuh dari koefisien pengali variabel x tersebut."
                )
                math_rep = "-5x \\implies a = -5"
                speech = "Pada bentuk negatif 5x, koefisiennya adalah negatif 5, bukan 5."
            elif "-3x" in msg_l:
                reply = "Pada bentuk -3x, tanda negatif melekat pada angkanya. Maka koefisiennya adalah -3."
                math_rep = "-3x \\implies a = -3"
                speech = "Pada negatif 3x, koefisiennya adalah negatif 3."
            elif "5x" in msg_l:
                reply = "Pada bentuk 5x, angka 5 mengalikan variabel x. Maka koefisiennya adalah 5."
                math_rep = "5x \\implies a = 5"
                speech = "Pada bentuk 5x, koefisiennya adalah 5."
            else:
                reply = (
                    "Koefisien adalah angka bilangan pengali yang berada tepat di depan variabel. "
                    "Koefisien menunjukkan berapa kali nilai variabel dilipatgandakan. "
                    "Contohnya pada 3x, koefisiennya adalah 3. Jika tandanya negatif seperti -3x, koefisiennya adalah -3."
                )
                math_rep = "ax \\implies a = \\text{koefisien}"
                speech = "Koefisien adalah bilangan pengali di depan variabel. Pada negatif 3x, koefisiennya adalah negatif 3."

            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=math_rep,
                voice_spoken_text=speech,
                hint_tier=tier,
                demo_mode=True,
                verified_math=verified,
                is_generative=False
            )

        # 8. PERTANYAAN KONSEP: VARIABEL
        if "variabel" in msg_l or "apa itu x" in msg_l:
            reply = (
                "Variabel adalah lambang berupa huruf (seperti x, y, atau a) yang digunakan untuk mewakili "
                "suatu nilai yang belum diketahui atau nilainya dapat berubah-ubah. 📦\n\n"
                "Bayangkan variabel seperti sebuah kotak kosong berlabel: kita bisa memasukkan bilangan berapa pun ke dalamnya!"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="x \\in \\mathbb{R}",
                voice_spoken_text="Variabel adalah lambang huruf yang mewakili nilai yang belum diketahui atau dapat berubah.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # 9. PERTANYAAN KONSEP: KONSTANTA
        if "konstanta" in msg_l:
            reply = (
                "Konstanta adalah suku dari bentuk aljabar yang berupa bilangan mandiri yang berdiri sendiri tanpa huruf variabel. 🔢\n\n"
                "Contohnya pada bentuk 3x + 7, angka 7 adalah konstanta karena nilainya tetap. "
                "Jika bentuknya 3x - 8, konstantanya adalah -8 (tanda minus ikut melekat)."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="3x + 7 \\implies c = 7",
                voice_spoken_text="Konstanta adalah bilangan mandiri yang nilainya tetap tanpa variabel pengali.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # 10. TIMBANGAN / PERSAMAAN NERACA
        if any(k in msg_l for k in ["timbangan", "neraca", "seimbang", "persamaan"]):
            reply = (
                "Persamaan aljabar bekerja seperti timbangan neraca seimbang! ⚖️\n\n"
                "Prinsip utamanya adalah menjaga keseimbangan: perlakuan apa pun pada ruas kiri (misal dikurangi 4 atau dibagi 2) "
                "harus dilakukan juga pada ruas kanan agar timbangan tetap seimbang."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="2x + 4 = 12 \\iff 2x = 8 \\iff x = 4",
                voice_spoken_text="Persamaan aljabar bekerja persis seperti timbangan neraca seimbang. Perlakuan kedua ruas harus adil.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # 11. HINT / PETUNJUK BERTAHAP
        if mode == "hint" or intent == "REQUEST_HINT":
            hints = {
                1: "💡 [Petunjuk Tahap 1 - Panduan Awal]: Identifikasi terlebih dahulu mana komponen variabel (huruf penampung nilai) dan mana angka tetapnya.",
                2: "💡 [Petunjuk Tahap 2 - Hubungan Ruas]: Coba bayangkan bentuk ini dalam timbangan: ruas kiri dan ruas kanan harus selalu seimbang.",
                3: "💡 [Petunjuk Tahap 3 - Langkah Solusi]: Lakukan operasi invers (kebalikan) yang sama pada kedua ruas untuk mengisolasi variabel x."
            }
            reply = hints.get(tier, hints[1])
            return NoraChatResponse(
                reply=reply,
                mode_used="hint",
                math_latex="ax + b = c",
                voice_spoken_text=reply.replace("💡", "").replace("[", "").replace("]", ""),
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # 12. TOPIK DI LUAR MATEMATIKA (OUT OF SCOPE)
        if intent == "OUT_OF_SCOPE":
            reply = (
                f"NORA mencatat pertanyaanmu tentang: \"{message}\".\n\n"
                "Sebagai asisten tutor khusus pembelajaran matematika aljabar SMP Kelas VII, "
                "fokus utama NORA adalah membantu memahami konsep variabel, koefisien, konstanta, dan persamaan linier.\n\n"
                "Adakah materi atau soal aljabar yang ingin kita pelajari bersama?"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Sebagai tutor aljabar di NUMORA Space, fokus utama NORA adalah membantu belajar aljabar kelas tujuh. Ada materi aljabar yang ingin ditanyakan?",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # DEFAULT RESPONSE
        reply = (
            f"NORA siap membantu membahas konsep atau soal terkait: \"{message}\".\n\n"
            "Kamu bisa menuliskan bentuk aljabar yang ingin dihitung (contoh: 'Berapa 3x + 5 jika x = 4?'), "
            "atau bertanya tentang komponen aljabar seperti koefisien dan konstanta."
        )
        return NoraChatResponse(
            reply=reply,
            mode_used=mode,
            math_latex=None,
            voice_spoken_text="NORA siap membantumu mempelajari aljabar kelas tujuh. Silakan ajukan pertanyaanmu!",
            hint_tier=tier,
            demo_mode=True,
            is_generative=False
        )

    @staticmethod
    def _clean_speech_text(text: str) -> str:
        clean = re.sub(r"[\*\_#`~]", "", text)
        clean = re.sub(r"\$[^$]+\$", "rumus aljabar", clean)
        return clean[:200]
