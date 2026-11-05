# LAPORAN PERBAIKAN BUG & REFINEMENT (NUMORA SPACE v1.6)
**Fokus: NUMORA RUN Slow Motion + NORA Chat Scroll & Context**

---

## 1. Ringkasan Masalah & Perbaikan

Sesuai dengan pengujian langsung pada peramban, dilakukan dua perbaikan bug utama:

1. **Perbaikan NUMORA RUN (Slow Motion & Camera)**:
   - **Penyebab**: Script sebelumnya menjalankan *cinematic deceleration lerp* sepanjang 20 meter sebelum gerbang portal dan melakukan *camera zoom in*, sehingga permainan terasa melambat secara berlebihan (*slow motion*) dan mengganggu ritme aksi lari.
   - **Solusi**: Efek perlambatan pra-portal dan pergerakan kamera dihapus sepenuhnya. Kecepatan karakter dipertahankan normal dan konsisten hingga mencapai titik ambang portal ($z = -4.5\text{m}$). Saat titik pemicu tercapai, simulasi permainan berhenti secara tegas dan stabil (`speed = 0`). Panel soal muncul secara instan, halus, dan responsif. Setelah dijawab, permainan langsung kembali melesat dengan kecepatan normal tanpa penundaan.
2. **Perbaikan NORA Chat (Halaman Bergeser & Scroll Viewport)**:
   - **Penyebab**: Penggunaan `messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })` memicu *window viewport scroll* yang menyebabkan seluruh halaman web tersentak bergeser ke bawah saat tombol Enter ditekan.
   - **Solusi**: `scrollIntoView()` dihapus dan digantikan oleh *DOM container direct scroll* (`chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight`). Area percakapan kini memiliki tinggi yang terkontrol mandiri dengan `overflow-y: auto`. Form pengiriman dilengkapi `e.preventDefault()`, pencegahan duplikasi pengiriman saat berpikir, dan dukungan `Enter` (kirim) serta `Shift + Enter` (baris baru). Halaman utama tetap stabil 100% tanpa pergeseran.
3. **Perbaikan Konteks & Kualitas Jawaban NORA**:
   - **Penyebab**: Jawaban sebelumnya hanya mencocokkan kata kunci parsial dan langsung jatuh ke fallback template umum filosofis aljabar, tanpa mengingat ekspresi aljabar dan angka yang sedang dibahas di riwayat pesan sebelumnya.
   - **Solusi**: Dibuat modul ekstraksi konteks riwayat percakapan (`_extract_conversation_context`) yang merekam ekspresi aljabar aktif (misal $3x + 5$), nilai variabel ($x = 4$), dan hasil perhitungan ($17$). NORA kini menjawab inti pertanyaan secara langsung:
     - Jika pengguna bertanya *"Kenapa?"*, NORA menjelaskan langkah perhitungan $3 \times 4 + 5 = 12 + 5 = 17$.
     - Jika pengguna bertanya *"Kalau x = 5?"*, NORA mengaitkan dengan ekspresi $3x + 5$ yang sama dan menghitung hasilnya adalah $20$.
     - Jika pengguna bertanya *"Kalau dikurangi 2?"*, NORA menjelaskan hasil numerik ($20 - 2 = 18$) maupun aljabar ($(3x + 5) - 2 = 3x + 3$).
     - Jika pengguna bertanya *"itu hasilnya brp"*, NORA langsung memberikan hasil perhitungan secara to-the-point tanpa bertele-tele.

---

## 2. Berkas yang Diubah

| Berkas | Modifikasi |
| :--- | :--- |
| [`frontend/src/features/runner/NumoraRunner3D.jsx`](file:///c:/Users/User/Documents/NUMORA%20space/frontend/src/features/runner/NumoraRunner3D.jsx) | Menghapus perlambatan *slow motion* pra-portal, menjaga kamera stabil di posisi lari normal, penghentian tegas di $z = -4.5\text{m}$, dan kelanjutan permainan responsif ($650\text{ms}$). |
| [`frontend/src/features/nora/NoraChatPreview.jsx`](file:///c:/Users/User/Documents/NUMORA%20space/frontend/src/features/nora/NoraChatPreview.jsx) | Mengganti `scrollIntoView()` dengan `chatContainerRef.current.scrollTop` lokal, membungkus form dengan `e.preventDefault()`, menangani pintasan keyboard (Enter / Shift+Enter), dan mengunci posisi halaman utama. |
| [`backend/app/services/nora_ai_service.py`](file:///c:/Users/User/Documents/NUMORA%20space/backend/app/services/nora_ai_service.py) | Mengimplementasikan pemroses riwayat konteks (`_extract_conversation_context`), resolusi formula berbasis konteks sebelumnya, jawaban langsung to-the-point, dan eliminasi pengulangan salam di setiap percakapan lanjutan. |
| [`tests/test_nora_open_ai.py`](file:///c:/Users/User/Documents/NUMORA%20space/tests/test_nora_open_ai.py) | Suite pengujian otomatis mencakup 7 skenario multi-turn bertingkat ($3x + 5$ dengan $x=4$, *"Kenapa?"*, *"Kalau x = 5?"*, *"Kalau dikurangi 2?"*, *"itu hasilnya brp"*, sains umum, dan proteksi pre-test). |

---

## 3. Hasil Pengujian

1. **Pengujian Multi-Turn NORA AI Context (`tests/test_nora_open_ai.py`)**:
   - Turn 1: *"Jika x = 4, berapa hasil 3x + 5?"* $\implies$ Menjawab **17** [LULUS]
   - Turn 2: *"Kenapa?"* $\implies$ Menjelaskan substitusi $3 \times 4 + 5 = 17$ [LULUS]
   - Turn 3: *"Kalau x = 5?"* $\implies$ Menjawab **20** ($3 \times 5 + 5$) [LULUS]
   - Turn 4: *"Kalau dikurangi 2?"* $\implies$ Menjelaskan $20 - 2 = 18$ dan $(3x + 5) - 2$ [LULUS]
   - Turn 5: *"itu hasilnya brp"* $\implies$ Menjawab langsung **18** [LULUS]
   - Turn 6: Pertanyaan di luar matematika $\implies$ Menjawab topik sains/teknologi [LULUS]
   - Turn 7: Guardrail tes penelitian $\implies$ Menolak membocorkan kunci jawaban [LULUS]
   - **Status: 7/7 Skenario LULUS 100%**.

2. **Standard Backend Test Suite (`tests/test_api.py`)**:
   - `✓ System health and root endpoints PASSED`
   - `✓ Math Test PASSED: 3x + 5 with x=4 = 17.0`
   - `✓ Math Test PASSED: 5x with x=3 = 15.0`
   - `✓ Math Test PASSED: -3x with x=2 = -6.0`
   - `✓ Math Test PASSED: 7x - 4 with x=2 = 10.0`
   - `✓ Math Test PASSED: 4x + 6 with x=5 = 26.0`
   - `✓ Misconception diagnosis suite PASSED`
   - `✓ Research data integrity suite PASSED (Strictly 2 Subjects, Honest Protocol)`
   - `✓ NORA Socratic Guardrails suite PASSED`
   - **Status: 9/9 Tests LULUS 100%**.

3. **Frontend Production Build (Vite v5.4.21)**:
   - Transformasi 1526 modul berhasil.
   - Waktu build: **15.69s** tanpa error.
   - Bundle index CSS & JS terkompresi sempurna.

