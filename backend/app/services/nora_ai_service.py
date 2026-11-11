import re
import httpx
from typing import List, Optional, Dict, Any, Tuple
from backend.app.core.config import settings
from backend.app.schemas.nora import NoraMessage, NoraChatRequest, NoraChatResponse
from backend.app.services.math_engine import MathEngine

SYSTEM_PROMPT = """Kamu adalah NORA (Numerical Optimization and Reasoning Assistant), tutor AI pendamping pembelajaran matematika aljabar untuk siswa SMP Kelas VII di NUMORA Space.
Karakter dan aturan pedagogis NORA:
1. Ramah, to the point, langsung menjawab inti pertanyaan siswa terlebih dahulu sebelum memberi penjelasan tambahan.
2. Gunakan Bahasa Indonesia yang alami, bersahabat, dan mudah dipahami siswa SMP.
3. Hindari pengulangan salam (seperti "Halo!", "Senang sekali...") di setiap giliran pesan lanjutan. Langsung jawab pertanyaannya.
4. Pahami konteks percakapan sebelumnya secara menyeluruh:
   - Jika siswa bertanya "kenapa?", jelaskan langkah perhitungan dari jawaban sebelumnya.
   - Jika siswa bertanya "kalau x = 5?", gunakan bentuk aljabar yang sedang dibahas sebelumnya dan hitung hasilnya.
   - Jika siswa bertanya "kalau dikurangi 2?", jelaskan baik untuk hasil numerik maupun penyederhanaan aljabar, dan minta klarifikasi jika belum jelas.
   - Jika siswa bertanya "itu hasilnya berapa", berikan hasil akhirnya secara langsung.
5. Gunakan analogi konkret (seperti 'wadah penampung nilai' untuk variabel, 'timbangan seimbang' untuk persamaan).
6. PENTING (Guardrail Asesmen): Tolak secara halus dan edukatif jika siswa meminta membocorkan atau mengerjakan soal pre-test / post-test instrumen penelitian demi kejujuran riset.
7. Tidak bertele-tele dan tidak memberikan jawaban template umum jika siswa menanyakan hal spesifik."""


class NoraAIService:
    @classmethod
    async def process_chat(cls, payload: NoraChatRequest) -> NoraChatResponse:
        message = payload.message.strip()
        msg_lower = message.lower()
        mode = (payload.mode or "explain").lower()
        tier = payload.hint_tier or 1
        history = payload.history or []

        # 1. GUARDRAIL ASESMEN PENELITIAN (Strict Assessment Protection)
        if any(k in msg_lower for k in ["pre-test", "post-test", "soal evaluasi riset", "bocorkan jawaban", "kunci jawaban tes", "kunci jawaban post"]):
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

        # 2. EKSTRAKSI KONTEKS PERCAKAPAN LALU (Conversation Context Tracking)
        context = cls._extract_conversation_context(history)

        # 3. VERIFIED MATH ENGINE HOOK (Analisis Formula Aljabar di Pesan & Konteks)
        verified_data = cls._verify_math_with_context(message, context)

        # 4. JIKA GENERATIVE AI API TERSEDIA, GUNAKAN LLM
        if settings.GEMINI_API_KEY:
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
            except Exception:
                pass

        if settings.OPENAI_API_KEY:
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
            except Exception:
                pass

        # 5. ADAPTIVE SOCRATIC KNOWLEDGE ENGINE (Deep Context Awareness)
        return cls._generate_adaptive_socratic_response(message, mode, tier, history, context, verified_data)

    @classmethod
    def _extract_conversation_context(cls, history: List[NoraMessage]) -> Dict[str, Any]:
        """
        Menyusuri riwayat percakapan dari belakang untuk mengekstrak bentuk aljabar,
        nilai variabel x, hasil perhitungan terakhir, dan topik yang sedang dibahas.
        """
        ctx: Dict[str, Any] = {
            "last_expression": None,
            "last_x": None,
            "last_result": None,
            "last_topic": None,
        }

        for msg in reversed(history):
            content = msg.content
            cl = content.lower()

            # Cari nilai x
            if ctx["last_x"] is None:
                xm = re.search(r"x\s*=\s*(-?\d+(?:\.\d+)?)", cl)
                if xm:
                    try:
                        ctx["last_x"] = float(xm.group(1))
                    except ValueError:
                        pass

            # Cari ekspresi aljabar (seperti 3x + 5, 5x, -3x, 4x + 6, 7x - 4)
            if ctx["last_expression"] is None:
                # Bersihkan bagian 'x = N' agar tidak rancu
                no_x_val = re.sub(r"x\s*=\s*-?\d+", "", cl)
                em = re.search(r"([+-]?\s*\d*x(?:\s*[+-]\s*\d+)?)", no_x_val)
                if em:
                    cand = em.group(1).replace(" ", "")
                    # Pastikan ekspresi valid aljabar
                    if len(cand) >= 2 and "x" in cand:
                        ctx["last_expression"] = cand

            # Cari angka hasil perhitungan
            if ctx["last_result"] is None:
                rm = re.search(r"(?:hasilnya\s*(?:adalah|=)?|hasil\s*=\s*|=\s*|\badalah\s*)(-?\d+(?:\.\d+)?)", cl)
                if rm:
                    try:
                        ctx["last_result"] = float(rm.group(1))
                    except ValueError:
                        pass

            # Cari topik
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
        """
        Mendeteksi formula aljabar pada pesan terkini atau memanfaatkan konteks percakapan sebelumnya.
        """
        tl = text.lower()

        # 1. Cari apakah ada nilai x pada pesan saat ini
        x_match = re.search(r"x\s*=\s*(-?\d+)", tl)
        current_x = float(x_match.group(1)) if x_match else None

        # 2. Cari apakah ada ekspresi aljabar pada pesan saat ini
        cleaned = re.sub(r"x\s*=\s*-?\d+", "", tl) if x_match else tl
        expr_match = re.search(r"([+-]?\s*\d*x(?:\s*[+-]\s*\d+)?)", cleaned)
        current_expr = None
        if expr_match:
            cand = expr_match.group(1).replace(" ", "")
            if len(cand) >= 2 and "x" in cand:
                current_expr = cand

        # Resolusi: jika salah satu ada di pesan saat ini dan pasangannya ada di konteks
        eval_expr = current_expr or context.get("last_expression")
        eval_x = current_x if current_x is not None else context.get("last_x")

        # Jika pengguna menyebut x baru (misal "Kalau x = 5?"), gunakan eval_expr dari konteks!
        if eval_expr and eval_x is not None:
            # Hanya jalankan jika pesan saat ini memuat x atau memuat ekspresi aljabar
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
                except Exception:
                    pass

        # 3. Deteksi pertanyaan koefisien spesifik
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
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_AI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        
        contents = []
        contents.append({
            "role": "user",
            "parts": [{"text": f"SYSTEM INSTRUCTION: {SYSTEM_PROMPT}"}]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Dimengerti. Saya NORA, asisten AI percakapan terbuka yang to-the-point, memahami konteks riwayat obrolan, dan akurat secara matematis."}]
        })

        for h in history[-10:]:
            role = "user" if h.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.content}]})

        user_prompt = message
        if verified:
            user_prompt += f"\n[CATATAN MESIN MATEMATIKA TERVERIFIKASI: Hasil perhitungan terbukti matematis adalah {verified}. Pastikan jawabanmu konsisten dengan hasil ini.]"

        contents.append({"role": "user", "parts": [{"text": user_prompt}]})

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={"contents": contents})
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                latex_match = re.search(r"\$([^$]+)\$", text)
                latex = latex_match.group(1) if latex_match else None
                return text.strip(), latex
            else:
                raise Exception(f"Gemini API Error: {resp.status_code}")

    @classmethod
    async def _call_openai(cls, message: str, history: List[NoraMessage], verified: Optional[Dict[str, Any]]) -> Tuple[str, Optional[str]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in history[-10:]:
            messages.append({"role": "user" if h.role == "user" else "assistant", "content": h.content})

        user_content = message
        if verified:
            user_content += f"\n[VERIFIED MATH ENGINE: Perhitungan terverifikasi adalah {verified}.]"
        messages.append({"role": "user", "content": user_content})

        async with httpx.AsyncClient(timeout=10.0) as client:
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
            else:
                raise Exception(f"OpenAI API Error: {resp.status_code}")

    @classmethod
    def _generate_adaptive_socratic_response(
        cls,
        message: str,
        mode: str,
        tier: int,
        history: List[NoraMessage],
        context: Dict[str, Any],
        verified: Optional[Dict[str, Any]]
    ) -> NoraChatResponse:
        """
        Adaptive engine multi-turn dengan fokus pada jawaban langsung, relevan,
        dan pemahaman konteks pertanyaan sebelumnya.
        """
        msg_l = message.lower().strip()
        is_first_turn = (len(history) == 0)

        # KASUS A: PERTANYAAN LANJUTAN "KENAPA?" / "MENGAPA?" / "DARI MANA HASILNYA?"
        if any(msg_l == k or msg_l.startswith(k + " ") or msg_l.endswith(" " + k) or msg_l == (k + "?") for k in ["kenapa", "mengapa", "kok bisa", "dari mana", "jelaskan caranya", "cara hitungnya"]):
            last_expr = context.get("last_expression")
            last_x = context.get("last_x")
            last_res = context.get("last_result")

            if last_expr and last_x is not None:
                x_str = str(int(last_x)) if last_x.is_integer() else str(last_x)
                res_str = str(int(last_res)) if (last_res is not None and last_res.is_integer()) else (str(last_res) if last_res is not None else "")
                
                # Evaluasi langkah-langkah
                try:
                    eval_res = MathEngine.evaluate_linear_expression(last_expr, {"x": last_x})
                    res_val = int(eval_res.result) if eval_res.result.is_integer() else eval_res.result
                    reply = (
                        f"Karena pada bentuk {last_expr}, kita mengganti nilai variabel x dengan {x_str}.\n\n"
                        f"Langkah perhitungannya:\n"
                        f"1. Kalikan terlebih dahulu: suku aljabarnya dihitung ({last_expr.replace('x', f' × {x_str}')})\n"
                        f"2. Jumlahkan atau selesaikan operasinya sehingga menghasilkan {res_val}."
                    )
                    return NoraChatResponse(
                        reply=reply,
                        mode_used=mode,
                        math_latex=eval_res.formatted_latex,
                        voice_spoken_text=f"Karena variabel x kita ganti dengan {x_str}, lalu dikalikan dan dijumlahkan sehingga hasilnya {res_val}.",
                        hint_tier=tier,
                        demo_mode=True,
                        is_generative=False
                    )
                except Exception:
                    pass

            # Jika konteks adalah koefisien
            if context.get("last_topic") == "koefisien":
                reply = (
                    "Karena koefisien adalah faktor pengali yang melekat langsung di depan variabel. "
                    "Jika di depan angka terdapat tanda negatif (-), maka tanda tersebut adalah bagian utuh dari koefisiennya."
                )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex=None,
                    voice_spoken_text="Karena koefisien adalah faktor pengali di depan variabel, dan tanda negatif ikut melekat padanya.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )

        # KASUS B: PERTANYAAN LANJUTAN DENGAN OPERASI ("Kalau dikurangi 2?", "Gimana kalau ditambah 3?")
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
                        f"maka konstantanya dioperasikan dengan {op_num_str}.\n\n"
                        f"Apakah yang kamu maksud adalah operasi pada hasil akhirnya atau pada bentuk aljabarnya?"
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

        # KASUS C: PERHITUNGAN TERVERIFIKASI (Langsung Jawab Inti Hasilnya!)
        if verified and verified["type"] == "substitution":
            expr = verified["expression"]
            x = verified["x"]
            res = int(verified["result"]) if verified["result"].is_integer() else verified["result"]
            x_str = str(int(x)) if x.is_integer() else str(x)

            reply = (
                f"Hasilnya adalah {res}.\n\n"
                f"Penjelasannya: kita substitusi x = {x_str} ke dalam {expr}:\n"
                f"{expr.replace('x', f'({x_str})')} = {res}."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=verified["latex"],
                voice_spoken_text=f"Hasilnya adalah {res}. Didapat dari memasukkan nilai x sama dengan {x_str} ke bentuk {expr}.",
                hint_tier=tier,
                demo_mode=True,
                verified_math=verified,
                is_generative=False
            )

        # KASUS D: PERTANYAAN "ITU HASILNYA BRP?" / "BERAPA HASILNYA?"
        if any(k in msg_l for k in ["hasilnya brp", "hasilnya berapa", "berapa hasilnya", "jadi berapa hasilnya", "berapa nilainya"]):
            last_res = context.get("last_result")
            last_expr = context.get("last_expression")
            last_x = context.get("last_x")

            if last_res is not None:
                res_str = str(int(last_res)) if last_res.is_integer() else str(last_res)
                reply = f"Hasilnya adalah {res_str}."
                if last_expr and last_x is not None:
                    x_str = str(int(last_x)) if last_x.is_integer() else str(last_x)
                    reply += f" (didapat dari evaluasi {last_expr} dengan x = {x_str})."
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

        # KASUS E: PERTANYAAN UMUM DI LUAR MATEMATIKA
        if any(k in msg_l for k in ["di luar matematika", "bisa jawab apa saja", "topik lain", "selain matematika", "bisa bantu yang lain"]):
            reply = (
                "Tentu saja! Selain matematika aljabar, kamu bisa berdiskusi tentang sains, teknologi, "
                "sejarah peradaban (seperti asal-usul aljabar oleh ilmuwan Al-Khawarizmi), cara kerja komputer, "
                "atau topik umum lainnya. Aku siap membantu menjelaskannya dengan bahasa yang mudah kamu pahami."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Tentu saja! Selain matematika aljabar, kamu bisa berdiskusi tentang sains, teknologi, atau topik umum lainnya.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # KASUS F: SAPAAN DAN ETIKA PERCAKAPAN (Bisa diucapkan di giliran mana pun)
        greeting_words = ["halo", "hai", "hei", "assalamu", "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "pagi", "siang", "sore", "malam", "apa kabar"]
        if any(msg_l == k or msg_l.startswith(k + " ") or msg_l.startswith(k + "!") or msg_l.startswith(k + ",") or msg_l.startswith(k + "?") for k in greeting_words):
            reply = (
                "Halo! Aku NORA, tutor pendamping aljabar untukmu di NUMORA Space. 👋\n\n"
                "Kamu bisa bertanya bebas tentang konsep variabel, koefisien, konstanta, atau penyelesaian persamaan aljabar. "
                "Ada materi atau soal aljabar tertentu yang ingin kita bahas sekarang?"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Halo! Aku NORA, tutor pendamping aljabar di NUMORA Space. Ada materi atau soal aljabar yang ingin kita bahas?",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # UCAPAN TERIMA KASIH & APRESIASI
        thanks_words = ["terima kasih", "makasih", "thanks", "tengkyu", "terimakasih", "syukron"]
        if any(k in msg_l for k in thanks_words):
            reply = (
                "Sama-sama! Senang sekali bisa menemanimu belajar matematika aljabar. 🌟\n"
                "Jika ada konsep atau soal yang masih membingungkan, jangan ragu untuk bertanya lagi ke NORA ya!"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Sama-sama! Senang bisa menemanimu belajar. Jika ada soal lain, silakan tanyakan ya!",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # KONFIRMASI PEMAHAMAN
        ok_words = ["oke", "ok", "siap", "paham", "mengerti", "baiklah", "sip"]
        if any(msg_l == k or msg_l.startswith(k + " ") for k in ok_words) and len(msg_l) < 15:
            reply = (
                "Hebat! Pemahaman yang bagus. 👏 Kamu bisa melanjutkan ke modul tantangan literasi, "
                "berlatih di Algebra Lab, atau memberi tahu NORA jika ingin mencoba contoh soal lainnya."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Hebat! Kamu bisa melanjutkan ke tantangan aljabar atau mencoba contoh soal lainnya.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # KASUS G: PERTANYAAN KONFIRMASI KOEFISIEN ("Berarti kalau 5x koefisiennya 5?", "kalau -3x?")
        if "berarti kalau" in msg_l or "apakah kalau" in msg_l or "gimana kalau" in msg_l or "kalau 5x" in msg_l or "kalau -3x" in msg_l:
            if "5x" in msg_l and ("5" in msg_l or "koefisien" in msg_l):
                reply = (
                    "Betul sekali! 🌟 Pada bentuk 5x, angka 5 mengalikan variabel x, sehingga koefisiennya adalah 5."
                )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex="5x \\implies a = 5",
                    voice_spoken_text="Betul sekali! Pada bentuk 5x, koefisiennya adalah 5.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )
            if "-3x" in msg_l:
                reply = (
                    "Tepat! Pada -3x, tanda negatif melekat erat pada angkanya. Maka koefisiennya adalah -3, bukan 3."
                )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex="-3x \\implies a = -3",
                    voice_spoken_text="Tepat! Pada negatif 3x, koefisiennya adalah negatif 3.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )

        # KASUS H: PERTANYAAN TENTANG KOEFISIEN
        if "koefisien" in msg_l:
            if "-5x" in msg_l:
                if mode == "hint":
                    if tier == 1:
                        reply = "💡 [Petunjuk Tahap 1]: Ingat kembali, koefisien adalah bilangan atau angka yang menempel tepat di depan huruf variabel."
                        speech = "Koefisien adalah bilangan yang menempel tepat di depan huruf variabel."
                    elif tier == 2:
                        reply = "💡 [Petunjuk Tahap 2]: Perhatikan apakah ada tanda khusus seperti tanda tambah (+) atau tanda kurang/negatif (-) di depan angkanya."
                        speech = "Perhatikan apakah ada tanda tambah atau tanda negatif di depan angkanya."
                    else:
                        reply = "💡 [Petunjuk Tahap 3]: Tanda minus negatif (-) merupakan bagian utuh dari angka tersebut. Jadi angka yang mengalikan x adalah bilangan bulat negatif -5."
                        speech = "Tanda negatif merupakan bagian utuh dari angka tersebut, sehingga koefisiennya adalah negatif 5."
                else:
                    reply = (
                        "Pada bentuk -5x, koefisiennya adalah -5, bukan 5. Tanda negatif di depan angka merupakan "
                        "bagian utuh yang melekat pada koefisien pengali variabel x tersebut."
                    )
                    speech = "Pada bentuk negatif 5x, koefisiennya adalah negatif 5, bukan 5."
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex="-5x \\implies a = -5",
                    voice_spoken_text=speech,
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )
            else:
                reply = (
                    "Koefisien adalah angka atau bilangan pengali yang berada tepat di depan variabel. "
                    "Contohnya pada bentuk 3x + 5, angka 3 merupakan koefisien dari x karena melipatgandakan nilai x sebanyak 3 kali."
                )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex="3x \\implies a = 3",
                    voice_spoken_text="Koefisien adalah bilangan pengali di depan variabel. Pada 3x, angka 3 merupakan koefisiennya.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )

        # KASUS I: PERTANYAAN TENTANG VARIABEL
        if "variabel" in msg_l or "apa itu x" in msg_l or "kenapa huruf" in msg_l:
            reply = (
                "Variabel adalah lambang atau huruf (seperti x, y, atau a) yang digunakan untuk mewakili "
                "suatu nilai yang belum diketahui atau nilainya dapat berubah-ubah. "
                "Bayangkan variabel seperti wadah penampung: kita bisa memasukkan bilangan berapa pun ke dalamnya!"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="x \\in \\mathbb{R}",
                voice_spoken_text="Variabel adalah lambang atau huruf yang mewakili nilai yang belum diketahui atau dapat berubah.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # KASUS J: PERTANYAAN TENTANG KONSTANTA
        if "konstanta" in msg_l:
            reply = (
                "Konstanta adalah suku aljabar yang berupa bilangan mandiri yang berdiri sendiri tanpa variabel pengali. "
                "Contohnya pada 3x + 7, angka 7 adalah konstanta karena nilainya tetap konstan."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="3x + 7 \\implies c = 7",
                voice_spoken_text="Konstanta adalah bilangan mandiri yang nilainya tetap tanpa variabel.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # KASUS K: PERSAMAAN NERACA / TIMBANGAN
        if any(k in msg_l for k in ["timbangan", "neraca", "seimbang", "persamaan", "ruas kiri"]):
            reply = (
                "Persamaan aljabar bekerja persis seperti timbangan neraca seimbang! ⚖️\n"
                "Prinsip utamanya adalah keadilan: operasi apa pun yang kamu lakukan di ruas kiri (misal dikurangi 4), "
                "harus kamu lakukan juga di ruas kanan agar timbangan tetap seimbang."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="2x + 4 = 12 \\iff 2x = 8 \\iff x = 4",
                voice_spoken_text="Persamaan aljabar bekerja persis seperti timbangan neraca seimbang. Perlakuan ruas kiri harus sama dengan ruas kanan.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # KASUS L: TOPIK UMUM SEJARAH AL-KHAWARIZMI
        if any(k in msg_l for k in ["khawarizmi", "sejarah aljabar", "penemu aljabar", "asal usul"]):
            reply = (
                "Aljabar berasal dari kata Arab 'Al-Jabr' dari kitab karya ilmuwan Muhammad bin Musa Al-Khawarizmi pada abad ke-9. "
                "Al-Jabr bermakna 'mengembalikan atau menyeimbangkan', persis seperti menyeimbangkan kedua ruas persamaan hingga saat ini."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Aljabar berasal dari kata Al-Jabr karya ilmuwan Al-Khawarizmi yang bermakna menyeimbangkan.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # KASUS M: PANDUAN PETUNJUK (HINT MODE)
        if mode == "hint":
            hints = {
                1: "💡 [Petunjuk Tahap 1 - Panduan Ringan]: Identifikasi dulu mana komponen variabel (wadah nilai) dan mana angka tetapnya.",
                2: "💡 [Petunjuk Tahap 2 - Panduan Konseptual]: Coba bayangkan bentuk ini dalam timbangan: ruas kiri dan ruas kanan harus selalu seimbang.",
                3: "💡 [Petunjuk Tahap 3 - Langkah Khusus]: Lakukan operasi yang sama pada kedua ruas untuk mengisolasi variabel x."
            }
            reply = hints.get(tier, hints[1])
            return NoraChatResponse(
                reply=reply,
                mode_used="hint",
                math_latex="ax + b = c",
                voice_spoken_text=reply.replace("💡", ""),
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # JAWABAN UMUM DIRECT & EDUKATIF (Honest Offline Fallback)
        has_math_tokens = any(c in msg_l for c in ["x", "y", "a", "+", "-", "=", "*", "/", "aljabar", "hitung", "berapa"])
        if has_math_tokens:
            reply = (
                f"Mengenai '{message}', NORA siap membantu menghitung atau menganalisisnya. "
                "Kamu bisa menuliskan bentuk aljabar beserta nilai variabelnya (contoh: '3x + 5 dengan x = 4') "
                "atau menanyakan bagian komponen seperti koefisien, variabel, atau konstantanya."
            )
            math_rep = "ax + b"
        else:
            reply = (
                f"NORA mencatat pertanyaanmu: \"{message}\".\n\n"
                "Sebagai asisten belajar aljabar SMP Kelas VII, NORA berfokus pada materi:\n"
                "• Variabel (lambang penampung nilai)\n"
                "• Koefisien (bilangan pengali variabel)\n"
                "• Konstanta (bilangan mandiri tanpa variabel)\n"
                "• Bentuk aljabar & penyelesaian persamaan linier.\n\n"
                "Tuliskan pertanyaan aljabar yang ingin kamu pelajari atau diskusikan bersama NORA!"
            )
            math_rep = None

        return NoraChatResponse(
            reply=reply,
            mode_used=mode,
            math_latex=math_rep,
            voice_spoken_text="NORA siap membantumu mempelajari materi aljabar kelas VII. Tuliskan pertanyaanmu ya!",
            hint_tier=tier,
            demo_mode=True,
            is_generative=False
        )

    @staticmethod
    def _clean_speech_text(text: str) -> str:
        clean = re.sub(r"[\*\_#`]", "", text)
        clean = re.sub(r"\$[^$]+\$", "rumus aljabar", clean)
        return clean[:200]
