from fastapi import APIRouter
from backend.app.schemas.nora import NoraChatRequest, NoraChatResponse

router = APIRouter()


@router.post("/chat", response_model=NoraChatResponse, summary="NORA Socratic Interaction")
async def nora_chat(payload: NoraChatRequest):
    """
    Socratic AI interaction endpoint.
    Modes:
    - explain: intuitive analogies and mental models
    - ask: checks student understanding with questions
    - hint: 3-tier scaffolding without instant spoilers
    - review: consolidates concepts
    """
    msg = payload.message.lower().strip()
    mode = payload.mode.lower()
    tier = payload.hint_tier or 1

    # Guardrails check: Refusal to solve research pre-test / post-test
    if any(k in msg for k in ["pre-test", "post-test", "soal evaluasi riset", "bocorkan jawaban"]):
        return NoraChatResponse(
            reply="Maaf ya, untuk instrumen penelitian atau tes mandiri (Pre-Test / Post-Test), NORA tidak diperkenankan memberikan jawaban. Ini penting agar Bapak/Ibu Peneliti dapat melihat daya nalar aslimu. Semangat, kamu pasti bisa mencobanya sendiri!",
            mode_used=mode,
            math_latex=None,
            voice_spoken_text="Maaf, untuk instrumen tes mandiri, NORA tidak diperkenankan memberikan jawaban. Kamu pasti bisa mencobanya sendiri!",
            hint_tier=tier,
            misconception_flag="Assessment Protection Guardrail Triggered",
            demo_mode=True
        )

    # Question specifically about coefficient of -5x
    if "-5x" in msg and "koefisien" in msg:
        if mode == "hint":
            if tier == 1:
                reply = "💡 [Petunjuk Tahap 1]: Ingat kembali, koefisien adalah bilangan atau angka yang menempel tepat di depan huruf variabel."
                speech = "Ingat kembali, koefisien adalah bilangan yang menempel tepat di depan huruf variabel."
            elif tier == 2:
                reply = "💡 [Petunjuk Tahap 2]: Perhatikan apakah ada tanda khusus seperti tanda tambah (+) atau tanda kurang/negatif (-) di depan angkanya."
                speech = "Perhatikan apakah ada tanda tambah atau tanda negatif di depan angkanya."
            else:
                reply = "💡 [Petunjuk Tahap 3]: Tanda minus negatif (-) merupakan bagian utuh dari angka tersebut. Jadi angka yang mengalikan x adalah bilangan bulat negatif."
                speech = "Tanda negatif merupakan bagian utuh dari angka tersebut."
            return NoraChatResponse(
                reply=reply,
                mode_used="hint",
                math_latex="-5x",
                voice_spoken_text=speech,
                hint_tier=tier,
                demo_mode=True
            )

    # General Socratic responses according to mode
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
            demo_mode=True
        )
    elif mode == "ask":
        return NoraChatResponse(
            reply="❓ Pertanyaan NORA untukmu:\nJika kita memiliki bentuk aljabar 4x + 6, apa yang akan terjadi dengan nilai keseluruhannya jika nilai x kita perbesar dari 1 menjadi 5? Coba jelaskan alasannya!",
            mode_used="ask",
            math_latex="4x + 6",
            voice_spoken_text="Pertanyaan NORA untukmu: Jika kita memiliki bentuk 4 x tambah 6, apa yang akan terjadi jika nilai x diperbesar dari satu menjadi lima?",
            socratic_question="Apa hubungan kenaikan x terhadap nilai total bentuk aljabar?",
            demo_mode=True
        )
    elif mode == "review":
        return NoraChatResponse(
            reply="🎯 [Review Pemahaman Konsep]:\nMari kita ulas bersama:\n1. Variabel ($x$) = wadah yang bisa diisi sembarang angka.\n2. Koefisien ($a$) = faktor pengali berapa kali wadah dilipatgandakan.\n3. Konstanta ($b$) = angka mandiri yang tetap nilainya.\nApakah kamu ingin mencoba satu tantangan kontekstual di Laboratorium?",
            mode_used="review",
            math_latex="ax + b",
            voice_spoken_text="Mari kita ulas bersama: variabel adalah wadah nilai, koefisien adalah faktor pengalinya, dan konstanta adalah nilai tetap.",
            demo_mode=True
        )
    else:
        # Default Explain
        return NoraChatResponse(
            reply="✨ [Mode Penjelasan Konsep]:\nAljabar sebenarnya adalah cara kita menulis pola dunia nyata secara ringkas. Huruf $x$ bukan rumus rahasia, melainkan wadah nilai yang sedang kita cari tahu nilainya. Kita bisa memasukkan angka berapa pun ke dalam wadah tersebut untuk melihat hasilnya!",
            mode_used="explain",
            math_latex="x \\in \\mathbb{R}",
            voice_spoken_text="Aljabar sebenarnya adalah cara kita menulis pola dunia nyata secara ringkas. Huruf x bukan rumus rahasia, melainkan wadah nilai.",
            demo_mode=True
        )
