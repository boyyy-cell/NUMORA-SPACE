# NUMORA SPACE — FULL FUNCTIONALITY AUDIT & REPAIR REPORT
**Dokumen Audit Fungsionalitas Menyeluruh & Verifikasi Kesiapan Operasional**
**Tanggal:** 23 November 2026
**Lingkungan Audit:** Windows 11, Node.js v20+, Python 3.14.7, FastAPI, SQLite, React 18, Vite 5.

---

## 1. INVENTARISASI SELURUH FITUR & KOMPONEN APLIKASI

Berdasarkan inspeksi langsung pada kode sumber backend (`backend/app/...`), frontend (`frontend/src/...`), dan database runtime:

| No | Modul / Halaman | Komponen / Endpoint | Deskripsi & Alur Pengguna |
| :--- | :--- | :--- | :--- |
| 1 | **Landing Page** (`/` & `/landing`) | `LandingPage.jsx`, `Navbar.jsx`, `Footer.jsx`, `BackendStatusBadge.jsx` | Halaman etalase publik: Hero banner, pengenalan kurikulum Merdeka, indikator status koneksi backend real-time, audio pengantar, tautan ke login dan game. |
| 2 | **Autentikasi & Login** (`/login`) | `LoginPage.jsx`, `AuthContext.jsx`, `POST /api/v1/auth/google`, `POST /api/v1/auth/logout` | Autentikasi tunggal berbasis Google Identity Services (GIS). Verifikasi token Google di backend, pembuatan sesi JWT HS256, isolasi peran, logout & pencabutan sesi di database (JTI blacklist). |
| 3 | **Session Recovery & Profil** | `GET /api/v1/auth/me`, `ProtectedRoute.jsx` | Validasi sesi aktif dari `localStorage`/`sessionStorage` ke backend. Pengalihan otomatis: Siswa ke `/student-dashboard`, Peneliti ke `/researcher-dashboard`. Tamu dicegat kembali ke `/login`. |
| 4 | **Dashboard Siswa** (`/student-dashboard`) | `StudentDashboard.jsx`, `Sidebar.jsx`, `ModuleLearningModal.jsx` | Ruang belajar interaktif: statistik progres belajar terisolasi per akun, kartu 4 modul aljabar, pelacak persentase kelulusan materi, peluncur kuis dan game. |
| 5 | **Materi Pembelajaran Aljabar** | `MODULES_DATA`, `MODULE_DETAILS`, `MathView.jsx` | 4 Modul Interaktif: (01) Mengenal Variabel (Wadah Nilai), (02) Memahami Koefisien (Pengali Suku), (03) Memahami Konstanta (Nilai Tetap), (04) PLSV (Timbangan Neraca). Dilengkapi formula KaTeX dan tombol penyelesaian materi. |
| 6 | **Algebra Lab & 3D Balance** | `AlgebraLab.jsx`, `AlgebraBalance3D.jsx`, `POST /api/v1/math/evaluate` | Laboratorium matematika: 6 mode eksplorasi (Variabel, Koefisien, Konstanta, Ekspresi, Neraca 3D Three.js, Simulasi Toko Kontekstual Buku/Pensil). Kalkulasi langkah demi langkah dan audio narasi. |
| 7 | **NORA AI Chat & Socratic Tutor** | `NoraChatPreview.jsx`, `POST /api/v1/nora/chat`, `voiceService.js` | Asisten AI Sokratik: 4 mode pedagogi (Explain, Ask, Hint, Review). Integrasi Hybrid Gemini/OpenAI dengan Verified Math Engine dan fallback offline *Adaptive Socratic Knowledge Engine*. Guardrail penolakan bocoran ujian, Text-to-Speech Web Speech API. |
| 8 | **Evaluasi & Tantangan Aljabar** | `MathematicalChallenge.jsx`, `evaluationQuestions.js`, `POST /api/v1/math/diagnose-misconception` | Bank soal 10 butir terstandar (3 variabel, 3 koefisien, 2 konstanta, 2 bentuk aljabar). Pengacakan Fisher-Yates, diagnosis miskonsepsi otomatis, pembahasan langkah demi langkah, riwayat skor mandiri. |
| 9 | **NUMORA RUN (3D Game)** (`/numora-run`) | `NumoraRunPage.jsx`, `NumoraRunner3D.jsx`, `questionBank.js`, `runnerStorage.js`, `soundEffects.js` | Permainan 3D Endless Runner matematika Three.js: 3 jalur rintangan, gerbang tantangan aljabar berwaktu (10 detik), sintesis audio Web Audio API, sistem skor & rekor per tingkat kesulitan. |
| 10 | **Dashboard Peneliti** (`/researcher-dashboard`) | `ResearcherDashboard.jsx`, `GET /api/v1/research/...` | Ruang evaluator penelitian: verifikasi status subjek S-001 (Kontrol) dan S-002 (Eksperimen), status instrumen beban kognitif Leppink, log sesi riset, ekspor berkas CSV dan JSON. |
| 11 | **Backend Security & Health** | `main.py`, `health.py`, `token_revocation_store.py` | Health probes (`/api/v1/health`, `/ready`, `/live`, `/info`), mitigasi brute force sliding-window IP rate limiting, pembatasan ukuran payload request (12 KB Auth, 32 KB Chat). |

---

## 2. STATUS SETIAP FITUR

| Fitur | Kategori | Status | Keterangan & Catatan Teknis |
| :--- | :--- | :--- | :--- |
| **Landing Page Publik** | Antarmuka Publik | **BERFUNGSI** | Tampil optimal pada root `/`, visualisasi mental model variabel, audio pengantar berfungsi, navigasi responsif. |
| **Backend Status Badge** | Pemantauan | **BERFUNGSI** | Polling setiap 15 detik ke `/api/v1/health`. Menampilkan status *Online* (titik hijau berdenyut) saat backend aktif. |
| **Google Sign-In Button** | Autentikasi | **BERFUNGSI** | Terintegrasi resmi Google Identity Services (GIS). Validasi ID Token kriptografis di backend. |
| **Session Persistence & Recovery** | Autentikasi | **BERFUNGSI** | Token JWT HS256 disimpan di `localStorage` (rememberMe) atau `sessionStorage`. Terverifikasi via `/api/v1/auth/me`. |
| **Logout & Token Revocation** | Keamanan | **BERFUNGSI** | JTI token dicatat ke tabel `revoked_tokens` SQLite. Token yang dicabut ditolak seketika pada request berikutnya (401). |
| **Role-Based Access Control (RBAC)** | Keamanan | **BERFUNGSI** | Siswa dicegat dari rute dan endpoint `/api/v1/research/...` (HTTP 403 Forbidden). Tamu dialihkan ke `/login`. |
| **Dashboard Siswa** | Portal Siswa | **BERFUNGSI** | Navigasi materi, tab modul, dan status modul terisolasi per akun siswa (`numora_student_progress_<key>`). |
| **4 Modul Pembelajaran Aljabar** | Edukasi | **BERFUNGSI** | Modul 01 s.d 04 lengkap dengan slide interaktif, formula KaTeX, dan tombol penyelesaian modul. |
| **Algebra Lab (6 Mode)** | Eksplorasi | **BERFUNGSI** | Eksplorasi variabel, koefisien, konstanta, bentuk aljabar, dan simulasi kontekstual. |
| **Visualisasi Neraca 3D (Three.js)** | Grafika 3D | **BERFUNGSI** | Animasi kemiringan neraca proporsional terhadap bobot ruas kiri vs ruas kanan. Otomatis membersihkan memori saat unmount. |
| **NORA AI: Percakapan Ramah** | AI Pedagogi | **BERFUNGSI** | Salam ("Halo NORA") dijawab ramah tanpa bocoran rumus aljabar yang tidak relevan. |
| **NORA AI: Pertanyaan Aljabar** | AI Pedagogi | **BERFUNGSI** | Menjelaskan konsep variabel, tanda minus koefisien (`-5x`), dan persamaan neraca secara terstruktur. |
| **NORA AI: Guardrail Asesmen** | Keamanan Ujian | **BERFUNGSI** | Permintaan kunci jawaban tes penelitian ditolak secara santun dan edukatif. |
| **Audio & Narasi Suara (TTS)** | Aksesibilitas | **BERFUNGSI** | Web Speech API dengan fallback aman, tombol dengarkan/hentikan narasi tersedia di Landing Page, Lab, dan NORA. |
| **Evaluasi Mandiri (10 Soal)** | Asesmen | **BERFUNGSI** | Komposisi soal 3+3+2+2 terverifikasi. Pengacakan Fisher-Yates, penilaian skor otomatis (0–100), dan pembahasan. |
| **NUMORA RUN (Gameplay & Audio)** | Gamifikasi | **BERFUNGSI** | Canvas Three.js 3D, kendali panah/spasi, gerbang soal matematika berwaktu, Web Audio API sound effects. |
| **Dashboard Peneliti & Subjek S-001/S-002** | Riset | **BERFUNGSI** | Menampilkan protokol S-001 (Kontrol) dan S-002 (Eksperimen) tanpa mencemari data empiris. |
| **Ekspor Data Riset (CSV & JSON)** | Riset | **BERFUNGSI** | Menghasilkan unduhan file CSV dan JSON berisi metadata sesi dan status subjek penelitian. |
| **AI Generatif Online (Gemini/OpenAI)** | Layanan Luar | **BERFUNGSI / DEPENDS ON KEY** | Jika `GEMINI_API_KEY` terkonfigurasi di backend, NORA memanggil Google Gemini. Jika kosong/offline, fallback otomatis aktif. |
| **Pengukuran Empiris Beban Kognitif** | Instrumen Riset | **BELUM DIIMPLEMENTASIKAN** | Sesuai protokol, instrumen Leppink ditandai secara jujur sebagai `NOT CONFIGURED` hingga sesi penelitian lapangan nyata dimulai. |

---

## 3. BUKTI PENGUJIAN SETIAP FITUR

### A. Pengujian Backend API & Security (`pytest`)
Semua pengujian dijalankan langsung pada environment Python 3.14:
1. **`tests/test_full_functionality.py` (12 Ujian):**
   - Health probes (`/`, `/health`, `/live`, `/ready`, `/info`) $\rightarrow$ **100% PASS**
   - Evaluasi matematika ekspresi & substitusi $\rightarrow$ **100% PASS**
   - Diagnosis miskonsepsi koefisien bertanda negatif $\rightarrow$ **100% PASS**
   - NORA sapaan umum tanpa kebocoran rumus $\rightarrow$ **100% PASS**
   - NORA penjelasan konsep variabel & koefisien $\rightarrow$ **100% PASS**
   - NORA guardrail penolakan bocoran kunci jawaban tes $\rightarrow$ **100% PASS**
   - RBAC isolasi peran: Siswa ditolak membuka endpoint riset (403 Forbidden) $\rightarrow$ **100% PASS**
   - Peneliti terotorisasi dapat mengakses data riset $\rightarrow$ **100% PASS**
   - Logout & pencabutan sesi persisten $\rightarrow$ **100% PASS**
   - Persistensi database SQLite bertahan lintas instansiasi baru $\rightarrow$ **100% PASS**
2. **`tests/test_backend_security_phase2.py` (21 Ujian):**
   - Validasi signature HS256, expiration, JTI $\rightarrow$ **21/21 PASS**
3. **`tests/test_backend_security_phase3.py` (23 Ujian):**
   - Rate limiting, streaming body limit (12 KB / 32 KB), audit VULN-01 s.d VULN-07 $\rightarrow$ **23/23 PASS**
4. **`tests/test_api.py` (5 Ujian):**
   - Diagnostik AST matematika dan parsing ekspresi $\rightarrow$ **5/5 PASS**

**Total Backend Pytest:** **61/61 LULUS (100% PASS, 0 Failure, 0 Error).**

### B. Pengujian Frontend Test Suites (`node`)
1. **`tests/test_login_auth_suite.js` (23 Ujian):**
   - Autentikasi Google tunggal, tidak ada bypass demo, proteksi rute $\rightarrow$ **23/23 PASS**
2. **`tests/test_landing_login_evaluation.js` (21 Ujian):**
   - Struktur bank soal evaluasi (3+3+2+2), Fisher-Yates shuffle, penilaian $\rightarrow$ **21/21 PASS**
3. **`tests/test_google_login_flow.js` (6 Ujian):**
   - Ketahanan UI Google Login, pencegahan unmounting `LoginPage`, timeout request $\rightarrow$ **6/6 PASS**
4. **`tests/test_final_verification.js` (Verifikasi Menyeluruh):**
   - Resolusi base URL, isolasi storage multi-akun, CORS regex $\rightarrow$ **LULUS SEMUA**

**Total Frontend Unit/Integration Tests:** **59/59 LULUS (100% PASS).**

### C. Pengujian Build Produksi (`vite build`)
- Perintah: `npm --prefix frontend run build`
- Hasil: **Exit Code 0 (Success)**
- Modul tertransformasi: **1.532 modul**
- Berkas keluaran bersih: `dist/index.html` (1,29 kB), `dist/assets/index-*.css` (39,19 kB), `dist/assets/index-*.js` (1.193 kB).

---

## 4. BUG YANG DITEMUKAN & PERBAIKAN YANG TELAH DILAKUKAN

### Bug #1: Race Condition Unmounting Komponen di `App.jsx` saat Google Login
- **Gejala:** Pengguna mengklik tombol Google Login, popup muncul, akun dipilih, popup tertutup, layar berkedip kembali ke `/login`, tetapi sesi tidak masuk dan **tidak ada pesan kesalahan yang tampil**.
- **Akar Masalah:** `LoginHandler` di `App.jsx` mengecek `if (isLoading)` untuk me-render `Memverifikasi sesi...`. Panggilan `loginWithGoogle` menyetel `setIsLoading(true)`, yang seketika me-unmount `<LoginPage />` dan memusnahkan state error lokalnya. Ketika login selesai/gagal, `LoginPage` baru di-mount dengan state error kosong, dan error callback terbuang pada instansi unmounted.
- **Perbaikan:**
  - Di `frontend/src/context/AuthContext.jsx`: Menambahkan state `isRestoringSession` terpisah (hanya aktif saat memverifikasi sesi awal aplikasi dibuka) dan memelihara state `authError` di context.
  - Di `frontend/src/App.jsx`: `LoginHandler` kini hanya me-unmount rute login jika `isRestoringSession` bernilai `true`. Komponen `<LoginPage />` tetap ter-mount selama alur login interaktif.
  - Di `frontend/src/pages/LoginPage.jsx`: Menampilkan `displayError = error || authError`, menambahkan atribut `aria-busy` dan proteksi klik ganda saat loading.

### Bug #2: Timeout Request Autentikasi Google Terlalu Sempit
- **Gejala:** Potensi request terputus di tengah jalan pada koneksi internet berlatensi tinggi.
- **Akar Masalah:** `fetchWithTimeout` di `frontend/src/services/api.js` dibatasi default 6.000 ms (6 detik). Sementara itu, verifikasi ID Token di backend memerlukan request ke endpoint certs Google (`/oauth2/v3/certs`) dan hashing PBKDF2 (600.000 iterasi) untuk user baru, yang dapat memakan waktu 3–5 detik.
- **Perbaikan:** Menyesuaikan timeout spesifik `apiService.loginGoogle` menjadi 15.000 ms (15 detik).

### Bug #3: Inkonsistensi Kunci Respon Diagnosis Miskonsepsi
- **Gejala:** Pengecekan schema pada endpoint `/api/v1/math/diagnose-misconception`.
- **Akar Masalah:** Terdapat ekspektasi field `socratic_feedback` pada pengujian, sedangkan schema resmi backend menggunakan `feedback` dan `diagnosed_type`.
- **Perbaikan:** Penyelarasan pengujian fungsionalitas dengan schema resmi backend `DiagnoseMisconceptionResponse`.

---

## 5. FITUR YANG MEMBUTUHKAN API KEY ATAU LAYANAN EKSTERNAL

1. **Google Identity Services (Google OAuth):**
   - Memerlukan `VITE_GOOGLE_CLIENT_ID` (frontend) dan `GOOGLE_CLIENT_ID` (backend).
   - Memerlukan pendaftaran domain produksi (misal `https://numora-space.vercel.app`) pada **Authorized JavaScript Origins** di Google Cloud Console.
2. **NORA AI Online Generative Mode:**
   - Memerlukan `GEMINI_API_KEY` (atau `OPENAI_API_KEY`) di environment backend.
   - *Catatan:* Jika API key tidak diisi, NORA tetap berfungsi penuh menggunakan *Adaptive Socratic Knowledge Engine* bawaan secara offline tanpa error 500.

---

## 6. AUDIT DATABASE & RISIKO PERSISTENSI DATA

1. **Penyimpanan Lokal Saat Ini:**
   - Database runtime berada di `backend/app/data/security_store.db`.
   - Menggunakan SQLite dengan WAL mode, timeout busy 15 detik, dan penguncian transaksi atomik.
2. **Risiko Fatal pada Hosting Ephemeral (Tanpa Disk Persisten):**
   - Jika dideploy ke platform container serverless atau free container tanpa persistent volume (seperti Render Free atau container ephemeral biasa):
     *Setiap kali container melakukan restart atau redeploy, file database SQLite akan musnah.*
   - Akibatnya: seluruh akun siswa/peneliti yang terdaftar dan blacklist token revocation akan hilang.
3. **Solusi Mitigasi Wajib saat Publikasi:**
   - Melampirkan **Persistent Storage Volume** pada direktori `/app/backend/app/data` di penyedia hosting backend (misal Railway Volume atau Fly.io Volume), ATAU
   - Menghubungkan backend ke managed cloud PostgreSQL (misal Supabase via variabel `SUPABASE_URL` yang sudah siap di `config.py`).

---

## 7. DAFTAR MASALAH YANG BELUM TERSELESAIKAN (BLOCKERS UNTUK DEPLOY)

1. **Ketiadaan Hosting Backend Aktif:**
   - URL produksi backend lama (`https://numora-space-api.de2.netrun.io`) mengembalikan **HTTP 503 Service Unavailable**. Backend harus dipublikasikan ke hosting baru yang aktif.
2. **Status Frontend Vercel 404:**
   - Domain `https://numora-space.vercel.app` mengembalikan **DEPLOYMENT_NOT_FOUND**. Proyek Vercel harus di-deploy ulang dengan Root Directory disetel ke `frontend`.
3. **Pendaftaran Domain di Google Cloud Console:**
   - Domain Vercel produksi harus dipastikan terdaftar pada Authorized JavaScript Origins di OAuth Client ID Google.

---

## 8. KESIMPULAN AUDIT FUNGSIONALITAS

* Seluruh kode lokal NUMORA Space (Frontend React, Backend FastAPI, Math Engine, NORA AI, Evaluasi, dan 3D Runner) **100% BERFUNGSI dan LULUS SELURUH PENGUJIAN OTOMATIS** (61 backend pytest pass + 59 frontend tests pass + build clean).
* Tidak ada ketergantungan pada akun demo atau data palsu di kode produksi.
* NUMORA Space telah layak secara fungsional untuk dipublikasikan segera setelah hosting backend persisten dan proyek Vercel disiapkan.
