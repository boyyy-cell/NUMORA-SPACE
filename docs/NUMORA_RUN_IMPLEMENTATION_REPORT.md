# LAPORAN IMPLEMENTASI: NUMORA RUN (NUMORA SPACE v1.6)
**Algebra, Beyond Formulas.**

---

## 1. Ringkasan Eksekutif

Fitur baru **NUMORA RUN** telah berhasil diimplementasikan ke dalam **NUMORA Space v1.6** dengan arsitektur **Hybrid Endless Runner** berbasis 3D WebGL (Three.js). Permainan ini mengintegrasikan sensasi permainan aksi 3 jalur yang dinamis (terinspirasi dari Subway Surfers) dengan pembelajaran aljabar SMP Kelas VII melalui gerbang persamaan matematis interaktif dan umpan balik sokratik NORA.

Fitur ini **bukan aplikasi terpisah**, melainkan modul terintegrasi penuh yang menyatu dengan filosofi visual **Sage & Ivory** (`#F6F5EF`, `#FFFFFF`, `#355B45`, `#A7BCA8`, `#D58B68`, `#28332C`).

---

## 2. Fitur & Mekanisme Gameplay

### 2.1. Kendali & Pergerakan 3 Jalur (Three-Lane System)
- **3 Jalur Lintasan**: Kiri ($x = -2.2$), Tengah ($x = 0$), Kanan ($x = 2.2$) dengan transisi horizontal halus (lerp).
- **Lompat (Jump)**: Karakter dapat melompati rintangan rendah (*low hurdles*) dengan fisika gravitasi parabola vertikal ($v_y = 11.2\text{ m/s}, g = -26.0\text{ m/s}^2$).
- **Merunduk (Slide/Crouch)**: Karakter dapat meluncur merunduk (*slide*) selama 0.75 detik untuk melewati palang gantung tinggi (*high overhead barrier*).
- **Rintangan Kotak (Crates)**: Menutup satu jalur penuh sehingga pemain wajib berpindah jalur.
- **Koin Emas Berkilau**: Koin 3D berputar yang dapat dikumpulkan untuk menambah skor (+15 poin/koin dikalikan combo multiplier).
- **Peningkatan Kecepatan Progresif**: Kecepatan lari meningkat secara bertahap seiring bertambahnya jarak tempuh ($14.0\text{ m/s} \to 26.0\text{ m/s}$).

### 2.2. Kontrol Multi-Platform
1. **Keyboard Komputer**:
   - Pindah Jalur: `Panah Kiri` / `Panah Kanan` atau `A` / `D`
   - Melompat: `Panah Atas` / `W` / `Spasi`
   - Merunduk: `Panah Bawah` / `S`
   - Jeda (Pause): `Escape` / `P`
   - Menjawab Soal: Tombol `1`, `2`, `3`, `4` atau `A`, `B`, `C`, `D`
2. **Layar Sentuh (Mobile / Tablet)**:
   - Gesture Swipe: Geser kiri, kanan, atas (lompat), bawah (merunduk).
   - Tombol Virtual D-Pad transparan di sudut bawah layar.

### 2.3. Gerbang Tantangan Aljabar (Algebra Gates)
Setiap interval jarak (~320m), muncul gerbang megah bercahaya yang melintang di lintasan. Ketika karakter mencapai gerbang:
- Permainan memicu jeda dramatis dan menampilkan dialog tantangan aljabar pilihan ganda (A, B, C, D).
- **Hitung Mundur 10 Detik**: Memberikan sensasi tantangan berpikir cepat.
- **Jawaban Benar**:
  - Pintu gerbang bercahaya hijau zamrud dan terbuka.
  - Efek suara akord arpeggio mayor sukses.
  - Pengali combo bertambah ($1\times \to 1.5\times \to 2.0\times \to 3.5\times$).
  - Bonus skor besar ($+150 \times \text{multiplier}$).
  - Karakter melesat kembali melanjutkan lari.
- **Jawaban Salah / Waktu Habis**:
  - Efek suara buzz korektif.
  - Kehilangan 1 nyawa ($\hearts \hearts \hearts \to \hearts \hearts \heartsuit$).
  - Combo ter-reset kembali ke $1.0\times$.
  - **Umpan Balik Sokratik NORA**: Penjelasan konsep ringkas 1–2 kalimat langsung di bawah soal agar siswa memahami kesalahan konseptualnya sebelum menekan tombol *Lanjutkan Lari*.
- **Game Over**:
  - Jika 3 nyawa habis, permainan selesai dan menampilkan rangkuman performa lengkap (skor akhir, koin, jarak, akurasi soal, dan status rekor baru).

---

## 3. Bank Soal Aljabar Tervalidasi (4 Tingkat Kesulitan)

Bank soal disusun dalam `frontend/src/features/runner/questionBank.js` dengan formula KaTeX terintegrasi dan penjelasan pedagogis:

1. **Beginner (Variabel, Koefisien, Konstanta)**:
   - Mengidentifikasi koefisien pada $-5x$ (menghilangkan miskonsepsi tanda negatif).
   - Menemukan konstanta pada $3x + 7$.
   - Mengidentifikasi variabel pada $4y - 9$.
   - Koefisien tunggal pada $-x$ (membuktikan nilai $-1$, bukan $0$).
   - Menghitung jumlah suku pada $2a + 3b - 5$.
2. **Intermediate (Operasi & Penyederhanaan Bentuk Aljabar)**:
   - Penjumlahan suku sejenis: $3x + 4x = 7x$.
   - Pengurangan suku sejenis: $8a - 3a = 5a$.
   - Pengelompokan suku aljabar: $5x + 3 + 2x = 7x + 3$.
   - Operasi bertanda campuran: $-2b + 6b = 4b$.
   - Pengurangan menghasilkan nilai negatif: $7y - 9y = -2y$.
3. **Advanced (Substitusi Nilai Variabel — Termasuk 5 Kasus Wajib Kurikulum)**:
   - Contoh dasar: Jika $x = 5$, berapakah $2x + 3$? (Jawaban: $13$)
   - Kasus Wajib 1: Jika $x = 4$, berapakah nilai $3x + 5$? (Jawaban: $17$)
   - Kasus Wajib 2: Jika $x = 2$, berapakah hasil dari $-3x$? (Jawaban: $-6$)
   - Kasus Wajib 3: Berapakah nilai dari $7x - 4$ jika $x = 2$? (Jawaban: $10$)
   - Kasus Wajib 4: Aisyah membeli $4$ buku tulis seharga $x = 5$ ribu dan tempat pensil $6$ ribu. Berapa total biaya $4x + 6$? (Jawaban: $26$)
4. **Expert (Persamaan Linear Sederhana / Keseimbangan Neraca)**:
   - Keseimbangan $2x + 4 = 12 \implies x = 4$.
   - Keseimbangan neraca $3x + 5 = 14 \implies x = 3$.
   - Persamaan dengan pengurangan $3x - 1 = 14 \implies x = 5$.
   - Persamaan satu langkah $4x = 28 \implies x = 7$.
   - Persamaan dua langkah $5x - 5 = 20 \implies x = 5$.

---

## 4. Sintesis Audio Mandiri (Web Audio API)

Untuk menjamin keandalan tanpa dependensi file eksternal:
- Seluruh efek suara disintesis secara prosedural menggunakan `window.AudioContext`:
  - `playJump()`: Sapuan frekuensi naik sinus ($260\text{Hz} \to 540\text{Hz}$).
  - `playSlide()`: Sapuan frekuensi segitiga meluncur ($320\text{Hz} \to 140\text{Hz}$).
  - `playCoin()`: Denting ganda lonceng harmonis (B5 $987.77\text{Hz} \to$ E6 $1318.5\text{Hz}$).
  - `playGateAlert()`: Panggilan portal beresonansi ($440\text{Hz} \to 880\text{Hz}$).
  - `playCorrect()`: Arpeggio akord mayor ($C_5, E_5, G_5, C_6$).
  - `playWrong()`: Gelombang gigi gergaji korektif ($180\text{Hz} \to 120\text{Hz}$).
  - `playGameOver()`: Rangkaian nada minor melankolis.
- Dilengkapi tombol Mute/Unmute instan di HUD permainan.

---

## 5. Penyimpanan Data & Rekor Lokal (Integritas Data)

- Seluruh riwayat sesi permainan, rekor per tingkat materi, koin, dan akurasi dicatat di peramban siswa melalui `localStorage` (`numora_runner_data_v1`).
- **Tidak mencemari atau memalsukan data penelitian**: Modul ini sepenuhnya terpisah dari `research_store.py` yang khusus menjaga data partisipan penelitian aktual.

---

## 6. Integrasi UI & Navigasi

Fitur dapat diakses dari beberapa pintu masuk yang intuitif:
1. **Student Dashboard (`/student-dashboard`)**:
   - Tab navigasi `NUMORA RUN` di Sidebar (dengan badge `GAME`).
   - Tombol aksi langsung *"Main NUMORA RUN"* di kartu beranda.
   - Mode game dapat dimainkan langsung di dalam dashboard.
2. **Halaman Penuh Khusus (`/numora-run`)**:
   - Dilengkapi panduan cara bermain dan tabel riwayat belajar siswa.
3. **Navbar & Landing Page (`/`)**:
   - Tautan langsung *"NUMORA RUN"* di bilah navigasi atas dan tombol aksi hero.

---

## 7. Bukti Verifikasi Pengujian

1. **Frontend Production Build**:
   ```powershell
   cmd.exe /c "npm run build"
   # Output:
   # dist/assets/index-BSNryJss.css     35.24 kB │ gzip:   6.71 kB
   # dist/assets/index-CJNJ2Ukq.js   1,129.09 kB │ gzip: 304.51 kB
   # ✓ built in 37.68s
   ```
2. **Backend Automated Test Suite**:
   ```powershell
   python tests/test_api.py
   # Output:
   # ✓ System health and root endpoints PASSED
   # ✓ Math Test PASSED: 3x + 5 with x=4 = 17.0
   # ✓ Math Test PASSED: 5x with x=3 = 15.0
   # ✓ Math Test PASSED: -3x with x=2 = -6.0
   # ✓ Math Test PASSED: 7x - 4 with x=2 = 10.0
   # ✓ Math Test PASSED: 4x + 6 with x=5 = 26.0
   # ✓ Misconception diagnosis suite PASSED
   # ✓ Research data integrity suite PASSED (Strictly 2 Subjects, Honest Protocol)
   # ✓ NORA Socratic Guardrails suite PASSED
   # --- SELURUH SUITE PENGUJIAN 100% SUKSES! ---
   ```

