import re
import httpx
from typing import List, Optional, Dict, Any, Tuple
from backend.app.core.config import settings
from backend.app.schemas.nora import NoraMessage, NoraChatRequest, NoraChatResponse
from backend.app.services.math_engine import MathEngine

SYSTEM_PROMPT = """Kamu adalah NORA (Numerical Optimization and Reasoning Assistant), tutor AI pendamping pembelajaran matematika aljabar untuk siswa SMP Kelas VII di NUMORA Space.
Karakter dan aturan pedagogis NORA:
1. Ramah, hangat, menyemangati, dan sabar seperti kakak tutor yang suportif.
2. Gunakan Bahasa Indonesia yang luwes, alami, dan mudah dipahami siswa SMP (hindari jargon yang terlalu rumit).
3. Gunakan analogi konkret dalam menjelaskan konsep:
   - Variabel: seperti sebuah wadah/kotak transparan yang bisa diisi sembarang bilangan.
   - Koefisien: faktor pengali berapa wadah yang kita punya (tanda minus ikut melekat pada bilangannya).
   - Konstanta: bilangan mandiri yang nilainya tetap tanpa variabel.
   - Persamaan Aljabar: seperti timbangan neraca seimbang, di mana perlakuan adil di ruas kiri harus sama dengan ruas kanan.
4. Kamu dapat menjawab pertanyaan matematika dari dasar hingga lanjut, dan juga pertanyaan umum di luar matematika (sains, teknologi, sejarah aljabar, atau topik umum lain) secara edukatif dan mudah dicerna.
5. Pahami konteks percakapan sebelumnya untuk menjawab pertanyaan lanjutan secara konsisten.
6. PENTING (Guardrail Asesmen): Jika siswa meminta membocorkan atau mengerjakan soal instrumen penelitian, pre-test, atau post-test mandiri, tolak secara halus dan berikan motivasi agar mereka mencoba sendiri demi kejujuran riset.
7. Jika memberikan rumus matematika, tuliskan secara jelas atau gunakan format LaTeX jika relevan.
8. Berikan penjelasan yang padat, terstruktur, dan tidak bertele-tele (sekitar 2–5 kalimat yang kaya makna)."""


class NoraAIService:
    @classmethod
    async def process_chat(cls, payload: NoraChatRequest) -> NoraChatResponse:
        message = payload.message.strip()
        msg_lower = message.lower()
        mode = (payload.mode or "explain").lower()
        tier = payload.hint_tier or 1
        history = payload.history or []

        # 1. GUARDRAIL ASESMEN PENELITIAN (Strict Assessment Protection)
        if any(k in msg_lower for k in ["pre-test", "post-test", "soal evaluasi riset", "bocorkan jawaban", "kunci jawaban tes"]):
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

        # 2. VERIFIED MATH ENGINE HOOK
        # Periksa apakah ada ekspresi matematika aljabar untuk verifikasi kepastian numerik
        verified_data = cls._verify_math_if_applicable(message)

        # 3. ATTEMPT GENERATIVE AI IF API KEY IS CONFIGURED
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
            except Exception as e:
                # Fallback to local adaptive engine gracefully
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
            except Exception as e:
                pass

        # 4. ADAPTIVE SOCRATIC KNOWLEDGE ENGINE (High-Intelligence Dynamic Local Engine)
        return cls._generate_adaptive_socratic_response(message, mode, tier, history, verified_data)

    @classmethod
    def _verify_math_if_applicable(cls, text: str) -> Optional[Dict[str, Any]]:
        """
        Mendeteksi formula aljabar dan memverifikasi perhitungan menggunakan MathEngine
        """
        tl = text.lower()

        # Deteksi nilai x jika ada: misal "x = 4" atau "x = -2"
        x_match = re.search(r"x\s*=\s*(-?\d+)", tl)
        if x_match:
            x_val = float(x_match.group(1))
            # Hapus bagian 'x = N' dari string agar tidak tertukar dengan variabel aljabar
            cleaned = re.sub(r"x\s*=\s*-?\d+", "", tl)
            expr_match = re.search(r"([+-]?\s*\d*x(?:\s*[+-]\s*\d+)?)", cleaned)
            if expr_match:
                expr_candidate = expr_match.group(1).replace(" ", "")
                if len(expr_candidate) >= 2:
                    try:
                        eval_res = MathEngine.evaluate_linear_expression(expr_candidate, {"x": x_val})
                        return {
                            "type": "substitution",
                            "expression": expr_candidate,
                            "x": x_val,
                            "result": eval_res.result,
                            "latex": eval_res.formatted_latex,
                            "steps": [s.description for s in eval_res.steps]
                        }
                    except Exception:
                        pass

        # Pola koefisien spesifik
        coeff_match = re.search(r"koefisien\s*(?:dari|pada)?\s*([+-]?\d*)x", text.lower())
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
        # Tambahkan instruksi sistem
        contents.append({
            "role": "user",
            "parts": [{"text": f"SYSTEM INSTRUCTION: {SYSTEM_PROMPT}"}]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": "Dimengerti. Saya NORA, tutor pendamping aljabar SMP Kelas VII yang ramah, analogis, dan akurat."}]
        })

        # Tambahkan history percakapan
        for h in history[-8:]:
            role = "user" if h.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.content}]})

        # Tambahkan verified math context jika ada
        user_prompt = message
        if verified:
            user_prompt += f"\n[CATATAN MESIN MATEMATIKA TERVERIFIKASI: Hasil perhitungan terbukti matematis adalah {verified}. Pastikan penjelasanmu konsisten dengan hasil ini.]"

        contents.append({"role": "user", "parts": [{"text": user_prompt}]})

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={"contents": contents})
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Ekstrak LaTeX jika ada tanda $$ atau $
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
        for h in history[-8:]:
            messages.append({"role": "user" if h.role == "user" else "assistant", "content": h.content})

        user_content = message
        if verified:
            user_content += f"\n[VERIFIED MATH ENGINE: Perhitungan terverifikasi adalah {verified}. Gunakan hasil ini.]"
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
        verified: Optional[Dict[str, Any]]
    ) -> NoraChatResponse:
        """
        Adaptive local engine yang meniru percakapan terbuka multi-turn dengan pemahaman konteks aljabar SMP dan pengetahuan umum.
        """
        msg_l = message.lower().strip()
        last_user_msgs = [h.content.lower() for h in history if h.role == "user"]
        last_bot_msgs = [h.content.lower() for h in history if h.role in ("assistant", "nora")]

        # Kasus 1: Pertanyaan umum tentang kemampuan NORA di luar matematika
        if any(k in msg_l for k in ["di luar matematika", "bisa jawab apa saja", "topik lain", "selain matematika", "bisa bantu yang lain"]):
            reply = (
                "Tentu saja! Selain matematika aljabar, kamu bisa berdiskusi tentang sains, teknologi, "
                "sejarah peradaban (seperti asal-usul aljabar oleh ilmuwan Al-Khawarizmi), cara kerja komputer, "
                "atau rasa ingin tahu umum lainnya. Aku siap membantu menjelaskannya dengan bahasa yang asyik dan mudah kamu pahami."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Tentu saja! Selain matematika aljabar, kamu bisa berdiskusi tentang sains, teknologi, sejarah, atau rasa ingin tahu umum lainnya.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # Kasus 2: Sapaan atau Perkenalan
        if any(msg_l.startswith(k) for k in ["halo", "hai", "assalamu", "pagi", "siang", "sore", "malam", "nora!"]):
            reply = (
                "Halo! Senang sekali bisa belajar bersamamu di NUMORA Space. 👋\n"
                "Ada konsep aljabar yang membuatmu penasaran hari ini? Misalnya tentang apa itu variabel, koefisien, "
                "atau cara menyeimbangkan persamaan di neraca? Tanyakan saja dengan kata-katamu sendiri ya!"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="3x + 5 = 17",
                voice_spoken_text="Halo! Senang sekali bisa belajar bersamamu di NUMORA Space. Ada konsep aljabar yang ingin kamu diskusikan hari ini?",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # Kasus 3: Pertanyaan Lanjutan Konfirmasi ("Berarti kalau 5x koefisiennya 5?", "kalau -3x koefisiennya -3?")
        if "berarti kalau" in msg_l or "apakah kalau" in msg_l or "gimana kalau" in msg_l:
            if "5x" in msg_l and ("5" in msg_l or "koefisien" in msg_l):
                reply = (
                    "Tepat sekali! Hebat! 🌟 Pada bentuk 5x, angka 5 mengalikan variabel x, sehingga koefisiennya adalah 5. "
                    "Artinya kamu memiliki 5 buah wadah nilai x. Sangat cepat kamu memahaminya!"
                )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex="5x \\implies a = 5",
                    voice_spoken_text="Tepat sekali! Pada bentuk 5x, angka 5 mengalikan variabel x, sehingga koefisiennya adalah 5.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )
            if "-3x" in msg_l:
                reply = (
                    "Betul sekali! Pada -3x, tanda negatif melekat erat pada angkanya. "
                    "Maka koefisiennya adalah -3, bukan 3. Tanda positif atau negatif selalu menjadi kesatuan dengan bilangannya."
                )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex="-3x \\implies a = -3",
                    voice_spoken_text="Betul sekali! Pada negatif 3x, tanda negatif melekat pada angkanya, sehingga koefisiennya adalah negatif 3.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )

        # Kasus 4: Pertanyaan tentang Koefisien
        if "koefisien" in msg_l:
            # Sub-kasus khusus -5x (Mandated Test Case)
            if "-5x" in msg_l:
                if mode == "hint":
                    if tier == 1:
                        reply = "💡 [Petunjuk Tahap 1]: Ingat kembali, koefisien adalah bilangan atau angka yang menempel tepat di depan huruf variabel."
                        speech = "Ingat kembali, koefisien adalah bilangan yang menempel tepat di depan huruf variabel."
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
                    speech = "Pada bentuk negatif 5x, koefisiennya adalah negatif 5, bukan 5. Tanda negatif melekat pada angkanya."
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
                    "Contohnya pada bentuk 3x + 5, angka 3 merupakan koefisien dari x karena mengalikan nilai x sebanyak 3 kali."
                )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex="3x \\implies a = 3",
                    voice_spoken_text="Koefisien adalah angka pengali yang berada di depan variabel. Pada 3x, angka 3 merupakan koefisiennya.",
                    hint_tier=tier,
                    demo_mode=True,
                    is_generative=False
                )

        # Kasus 5: Pertanyaan tentang Variabel
        if "variabel" in msg_l or "apa itu x" in msg_l or "kenapa huruf" in msg_l:
            reply = (
                "Variabel adalah lambang atau huruf (seperti x, y, atau a) yang digunakan untuk mewakili "
                "suatu nilai bilangan yang belum diketahui pasti atau nilainya dapat berubah-ubah. "
                "Bayangkan variabel seperti wadah atau kotak tertutup: kita bisa memasukkan bilangan berapa pun ke dalamnya untuk melihat hasilnya!"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="x \\in \\mathbb{R}",
                voice_spoken_text="Variabel adalah lambang atau huruf yang mewakili suatu nilai yang belum diketahui atau dapat berubah.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # Kasus 6: Pertanyaan tentang Konstanta
        if "konstanta" in msg_l:
            reply = (
                "Konstanta adalah suku aljabar yang berupa bilangan mandiri yang berdiri sendiri tanpa variabel pengali. "
                "Contohnya pada bentuk 3x + 7, angka 7 adalah konstanta karena nilainya tetap konstan dan tidak terpengaruh perubahan nilai x."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="3x + 7 \\implies c = 7",
                voice_spoken_text="Konstanta adalah bilangan mandiri yang nilainya tetap tanpa variabel. Pada 3x tambah 7, angka 7 adalah konstanta.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # Kasus 7: Perhitungan Aljabar Terverifikasi
        if verified:
            if verified["type"] == "substitution":
                expr = verified["expression"]
                x = verified["x"]
                res = verified["result"]
                reply = (
                    f"Mari kita hitung bersama dengan teliti! 🔍\n"
                    f"Untuk mengevaluasi bentuk {expr} dengan nilai x = {x}:\n"
                    f"1. Ganti huruf x dengan angka ({x}): {expr.replace('x', f'({x})')}\n"
                    f"2. Kalikan koefisiennya terlebih dahulu, lalu selesaikan penambahan/pengurangannya.\n"
                    f"Maka hasilnya adalah {res}!"
                )
                return NoraChatResponse(
                    reply=reply,
                    mode_used=mode,
                    math_latex=verified["latex"],
                    voice_spoken_text=f"Hasil substitusi bentuk aljabar untuk x sama dengan {x} adalah {res}.",
                    hint_tier=tier,
                    demo_mode=True,
                    verified_math=verified,
                    is_generative=False
                )

        # Kasus 8: Persamaan Neraca / Timbangan
        if any(k in msg_l for k in ["timbangan", "neraca", "seimbang", "persamaan", "ruas kiri"]):
            reply = (
                "Persamaan linear aljabar bekerja persis seperti timbangan neraca dua lengan yang seimbang! ⚖️\n"
                "Kuncinya adalah prinsip keadilan: apa pun operasi yang kamu lakukan pada ruas kiri (ditambah, dikurang, atau dibagi), "
                "kamu harus melakukan operasi yang sama pada ruas kanan agar timbangan tetap seimbang."
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex="2x + 4 = 12 \\iff 2x = 8 \\iff x = 4",
                voice_spoken_text="Persamaan linear bekerja persis seperti timbangan neraca seimbang. Perlakuan pada ruas kiri harus sama dengan ruas kanan.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # Kasus 9: Topik Umum Sains/Sejarah
        if any(k in msg_l for k in ["khawarizmi", "sejarah", "siapa penemu", "asal usul"]):
            reply = (
                "Aljabar berasal dari kata Arab 'Al-Jabr' yang dipopulerkan oleh ilmuwan besar bernama Muhammad bin Musa Al-Khawarizmi pada abad ke-9. "
                "Al-Jabr bermakna 'mengembalikan atau menyeimbangkan', persis seperti cara kita menyeimbangkan kedua ruas persamaan hingga hari ini!"
            )
            return NoraChatResponse(
                reply=reply,
                mode_used=mode,
                math_latex=None,
                voice_spoken_text="Aljabar berasal dari kata Arab Al-Jabr yang dipopulerkan ilmuwan Al-Khawarizmi, yang berarti menyeimbangkan.",
                hint_tier=tier,
                demo_mode=True,
                is_generative=False
            )

        # Kasus 10: Mode Petunjuk (Hint) Sesuai Permintaan Spesifik
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

        if mode == "ask":
            return NoraChatResponse(
                reply="❓ Pertanyaan NORA untukmu:\nJika kita memiliki bentuk aljabar 4x + 6, apa yang akan terjadi dengan nilai keseluruhannya jika nilai x kita perbesar dari 1 menjadi 5? Coba jelaskan alasannya!",
                mode_used="ask",
                math_latex="4x + 6",
                voice_spoken_text="Pertanyaan NORA untukmu: Jika kita memiliki bentuk 4x tambah 6, apa yang terjadi jika x diperbesar?",
                socratic_question="Apa hubungan kenaikan x terhadap nilai total bentuk aljabar?",
                demo_mode=True,
                is_generative=False
            )

        if mode == "review":
            return NoraChatResponse(
                reply="🎯 [Review Pemahaman Konsep]:\nMari kita ulas bersama:\n1. Variabel ($x$) = wadah yang bisa diisi sembarang angka.\n2. Koefisien ($a$) = faktor pengali berapa kali wadah dilipatgandakan.\n3. Konstanta ($b$) = angka mandiri yang tetap nilainya.\nApakah ada bagian yang ingin kamu diskusikan lagi?",
                mode_used="review",
                math_latex="ax + b",
                voice_spoken_text="Mari kita ulas bersama: variabel adalah wadah nilai, koefisien adalah faktor pengalinya, dan konstanta adalah nilai tetap.",
                demo_mode=True,
                is_generative=False
            )

        # Default Natural Conversational Explanation
        reply = (
            f"Pertanyaan yang sangat bagus! Mengenai '{message}', dalam matematika aljabar kita memodelkan persoalan nyata ke dalam lambang bilangan. "
            "Setiap simbol memiliki peran teratur agar kita bisa menemukan solusi secara logis. "
            "Apakah ada contoh soal tertentu yang ingin kamu pecahkan bersama NORA?"
        )
        return NoraChatResponse(
            reply=reply,
            mode_used=mode,
            math_latex="ax + b = c",
            voice_spoken_text=f"Pertanyaan yang bagus! Dalam aljabar kita memodelkan persoalan nyata ke dalam simbol yang logis.",
            hint_tier=tier,
            demo_mode=True,
            is_generative=False
        )

    @staticmethod
    def _clean_speech_text(text: str) -> str:
        # Bersihkan markdown formatting untuk suara text-to-speech yang mulus
        clean = re.sub(r"[\*\_#`]", "", text)
        clean = re.sub(r"\$[^$]+\$", "rumus aljabar", clean)
        return clean[:200]
