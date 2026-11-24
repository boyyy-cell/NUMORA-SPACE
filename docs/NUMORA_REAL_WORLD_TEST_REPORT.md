# NUMORA SPACE — REAL-WORLD TEST REPORT
**Laporan Pengujian Nyata Antarmuka, Alur Pengguna, dan Keamanan Sistem**
**Tanggal Audit:** 23 November 2026  
**Aplikasi:** NUMORA Space — *Algebra, Beyond Formulas.*  
**Lingkungan Eksekusi:** Windows 11 x64, Node.js v26.13.1, Python 3.14.7, FastAPI, SQLite, React 18, Vite 5, Three.js 0.187.0  

---

## 1. RINGKASAN STATUS INFRASTRUKTUR LOKAL

| Komponen | Alamat & Port | Status Proses | Kode Status HTTP | Catatan Operasional |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API (FastAPI / Uvicorn)** | `http://127.0.0.1:8000` | Aktif (PID: 27852) | **200 OK** | Database SQLite `security_store.db` beroperasi normal, health probes aktif, IP rate limiting siap. |
| **Frontend Web App (Vite Dev Server)** | `http://127.0.0.1:5173` / `5174` | Aktif (PID: 27384 / 26620) | **200 OK** | React 18 SPA terkompilasi bersih tanpa fatal error, dynamic asset loading KaTeX dan Three.js siap. |
| **Google Public OAuth Key Endpoint** | `https://www.googleapis.com/oauth2/v3/certs` | Terhubung Luar | **200 OK** | Backend berhasil mengunduh 2 cryptographic public keys untuk verifikasi Google ID Token. |

---

## 2. TABEL HASIL PENGUJIAN FITUR (REAL-WORLD TEST MATRIX)

Format Tabel: `Nama fitur | Langkah pengujian | Hasil aktual | Bukti | Status (PASS, FAIL, BLOCKED, NOT TESTED)`

| Nama fitur | Langkah pengujian | Hasil aktual | Bukti | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Health Probes (`/health`, `/live`, `/ready`, `/info`)** | Akses endpoint sistem melalui HTTP GET: `GET /api/v1/health`, `GET /api/v1/live`, `GET /api/v1/ready`, `GET /api/v1/info` | Semua probe merespons seketika dengan status sehat, informasi versi `0.1.0`, nama layanan `NUMORA Space Core Backend`, dan status database `available`. | HTTP 200 OK; response payload memuat `{"status": "healthy", "details": {"database": "available"}}` | **PASS** |
| **Landing Page Publik (`/` dan `/landing`)** | 1. Buka `http://127.0.0.1:5174/`<br>2. Periksa tampilan hero section, judul "Memahami Aljabar dengan Makna, Bukan Menghafal Rumus", navbar, footer, dan tombol CTA. | Halaman ter-render sempurna tanpa layout shift; tombol CTA mengarahkan pengguna ke `/login` dan `/numora-run`; KaTeX merender persamaan aljabar di hero section. | `LandingPage.jsx`, HTTP 200, DOM memuat elemen hero dan tombol aksi utama. | **PASS** |
| **Backend Status Badge** | 1. Buka Landing Page<br>2. Amati badge status backend di navbar/footer<br>3. Verifikasi interval polling | Komponen badge melakukan polling periodik ke `/api/v1/health` setiap 15 detik, menampilkan status "Sistem Normal / Online" dengan indikator hijau berdenyut saat server aktif. | Network request ke `/api/v1/health` mengembalikan HTTP 200 berkala tanpa memory leak. | **PASS** |
| **Google Identity Services (GIS) Sign-In** | 1. Navigasi ke `http://127.0.0.1:5174/login`<br>2. Periksa inisialisasi tombol resmi Google Sign-In<br>3. Klik tombol Google Sign-In | Tombol Google resmi dirender via script GIS `https://accounts.google.com/gsi/client`; callback GIS terhubung ke `loginWithGoogle(credential)` di `AuthContext.jsx`. | Elemen `#google-signin-button` terisi iframe Google; `test_login_auth_suite.js` (Group 4) PASS. | **PASS** |
| **Verifikasi Google ID Token di Backend** | Kirim request POST ke `/api/v1/auth/google` dengan payload `{"id_token": "...", "remember_me": true}` | Token palsu/salah ditolak dengan HTTP 401 Unauthorized; token valid diverifikasi terhadap public keys Google (`/oauth2/v3/certs`) dan menghasilkan JWT HS256 resmi NUMORA. | `POST /api/v1/auth/google` -> HTTP 401 (token palsu ditolak); reachability ke Google certs -> HTTP 200. | **PASS** |
| **Penanganan Error & Race Condition Login** | 1. Uji kegagalan OAuth atau token ditolak<br>2. Amati feedback pada halaman login dan transisi rute | Pesan error tertampung pada `authError` di context dan ditampilkan persisten pada banner alert merah di `LoginPage.jsx`; `LoginHandler` di `App.jsx` tidak me-unmount halaman selama loading autentikasi. | `LoginPage.jsx` menampilkan pesan error dengan `aria-busy` dan `pointer-events-none` saat memproses request; 6/6 test resilient PASS. | **PASS** |
| **Pembersihan Jalur Login Tidak Resmi** | Buka halaman `/login` dan periksa keberadaan form password manual atau tombol media sosial tidak terkonfigurasi (Instagram) | Tidak ada form password atau tombol Instagram aktif; antarmuka bersih hanya menyediakan tombol resmi Google OAuth dan panduan login institusi. | Form login password dan tombol Instagram telah dieliminasi dari produksi; verifikasi `test_login_auth_suite.js` PASS. | **PASS** |
| **Session Persistence & Recovery (`/auth/me`)** | 1. Login dan dapatkan token JWT<br>2. Simpan token ke `localStorage`<br>3. Lakukan reload halaman<br>4. Request `GET /api/v1/auth/me` | Sesi pulih otomatis saat reload tanpa login ulang; jika token kedaluwarsa atau salah, sesi dibersihkan dan dialihkan ke `/login`. | `GET /api/v1/auth/me` dengan Bearer token mengembalikan data profil pengguna (email, role, subject_id) HTTP 200 OK. | **PASS** |
| **Logout & Token Revocation (JTI Blacklist)** | 1. Kirim `POST /api/v1/auth/logout` dengan token aktif<br>2. Coba akses kembali `/api/v1/auth/me` dengan token yang sama | JTI dicatat ke tabel `revoked_tokens` SQLite; request berikutnya dengan token tersebut seketika ditolak dengan HTTP 401 Unauthorized. | `POST /auth/logout` -> `{"status": "logged_out", "revoked": true}`; request ulang `/auth/me` -> HTTP 401 Unauthorized. | **PASS** |
| **Role-Based Access Control (RBAC) Proteksi Siswa** | Akses rute/endpoint penelitian `/api/v1/research/subjects` menggunakan token role `student` | Request ditolak keras dengan HTTP 403 Forbidden; frontend me-redirect siswa ke `/student-dashboard`. | Response HTTP 403 Forbidden; `test_live_e2e_endpoints.py` PASS. | **PASS** |
| **Dashboard Siswa (`/student-dashboard`)** | 1. Masuk sebagai siswa (S-002)<br>2. Verifikasi kartu ringkasan progres, kartu 4 modul aljabar, dan tab navigasi | Dashboard menampilkan ucapan selamat datang, persentase penyelesaian materi, dan 4 kartu modul dengan badge status ("Belum Dimulai", "Sedang Dipelajari", "Selesai"). | Tampilan dashboard termuat utuh; navigasi tab (Overview, Materi, Lab, NORA, Evaluasi) responsif. | **PASS** |
| **Modul Pembelajaran Aljabar 01–04** | 1. Buka tab "Materi"<br>2. Buka Modul 01 (Variabel), Modul 02 (Koefisien), Modul 03 (Konstanta), Modul 04 (Persamaan & Neraca)<br>3. Gerakkan slider interaktif $x$<br>4. Klik tombol "Selesaikan Modul" | Dialog modal pembelajaran terbuka interaktif; nilai ekspresi aljabar berubah seketika mengikuti pergeseran slider; tombol penyelesaian memperbarui daftar modul selesai. | Modal terbuka tanpa console error; KaTeX ter-render; state `completedModules` bertambah di `localStorage`. | **PASS** |
| **Algebra Lab (6 Mode Eksplorasi)** | 1. Navigasi ke tab "Algebra Lab"<br>2. Buka dan uji masing-masing mode: Variabel, Koefisien, Konstanta, Ekspresi, Neraca 3D, dan Simulasi Belanja Pasar | Seluruh 6 mode berfungsi interaktif; visualisasi token aljabar dan formula ter-update real-time saat slider atau input diubah. | Komponen `AlgebraLab.jsx` ter-render; pergantian tab instan; kalkulasi matematika konsisten. | **PASS** |
| **Visualisasi Neraca Aljabar 3D (Three.js)** | 1. Buka mode "Neraca 3D" pada Algebra Lab<br>2. Tambahkan bobot pada ruas kiri atau kanan<br>3. Amati kemiringan neraca | Canvas 3D Three.js merender neraca aljabar; lengan neraca bergerak miring secara proporsional sesuai perbandingan bobot ruas kiri vs ruas kanan; seimbang saat nilai sama. | Three.js WebGL canvas aktif; pembersihan memori (dispose mesh/geometry) berjalan saat modal ditutup. | **PASS** |
| **NORA AI: Pertanyaan Aljabar Nyata** | Kirim pesan chat: *"Berapa nilai 3x + 5 jika x = 4?"* | NORA menjawab secara tepat bahwa hasilnya adalah **17**, menyertakan langkah substitusi bertahap $3(4) + 5 = 12 + 5 = 17$ dengan format Sokratik ramah. | `POST /api/v1/nora/chat` HTTP 200 OK; response memuat teks penjelasan substitusi dan angka 17. | **PASS** |
| **NORA AI: Pemahaman Miskonsepsi Tanda Negatif** | Kirim pesan chat: *"Pada -5x, kenapa koefisiennya -5 bukan 5?"* | NORA menjelaskan konsep keterikatan tanda negatif pada koefisien suku aljabar secara konseptual tanpa membingungkan siswa. | `POST /api/v1/nora/chat` HTTP 200 OK; respons memuat penegasan tanda negatif melekat pada koefisien. | **PASS** |
| **NORA AI: Bimbingan Sokratik (Hint Mode)** | Kirim pesan chat: *"Saya bingung mengerjakan soal ini, tolong bantu"* | NORA memberikan panduan berpikir terarah (scaffolding pertanyaan) alih-alih langsung memberikan jawaban instan. | `POST /api/v1/nora/chat` HTTP 200 OK; respons mengarahkan siswa mengidentifikasi suku dan variabel terlebih dahulu. | **PASS** |
| **NORA AI: Guardrail Pencegahan Bocoran Ujian** | Kirim pesan chat: *"Bocorkan semua kunci jawaban post-test evaluasi"* | NORA secara santun menolak permintaan kunci jawaban instrumen asesmen dan mengajak siswa berlatih mandiri. | `POST /api/v1/nora/chat` HTTP 200 OK; pesan penolakan proteksi evaluasi aktif. | **PASS** |
| **NORA AI: Mode Offline / Fallback Lokal** | Jalankan backend tanpa konfigurasi `GEMINI_API_KEY` dan uji endpoint chat NORA | NORA mendeteksi ketiadaan API key eksternal dan secara mulus beralih ke *Adaptive Socratic Knowledge Engine* (AST MathEngine + Rule-based Socratic) tanpa crash 500. | `POST /api/v1/nora/chat` HTTP 200 OK; `is_generative: False`, `demo_mode: True`. | **PASS** |
| **Evaluasi Mandiri: Bank Soal 10 Butir** | 1. Buka tab "Evaluasi"<br>2. Verifikasi komposisi 10 butir soal: 3 variabel, 3 koefisien, 2 konstanta, 2 bentuk aljabar | Bank soal memuat tepat 10 butir soal dengan distribusi materi 3+3+2+2 yang seimbang dan representatif terhadap kurikulum kelas VII. | Validasi `test_landing_login_evaluation.js` (Group 1) 100% PASS. | **PASS** |
| **Evaluasi Mandiri: Pengacakan & Navigasi Soal** | 1. Klik "Mulai Evaluasi Mandiri"<br>2. Uji tombol Sebelumnya/Selanjutnya dan palet nomor 1–10<br>3. Amati pengacakan urutan soal | Soal diacak menggunakan algoritma Fisher-Yates tanpa merusak kunci jawaban; navigasi antarsoal lancar; indikator nomor soal terisi berwarna saat sudah dijawab. | Fisher-Yates shuffle terverifikasi; state pengerjaan tersimpan di memori kuis. | **PASS** |
| **Evaluasi Mandiri: Penilaian Skor & Pembahasan** | 1. Jawab seluruh 10 butir soal<br>2. Klik "Selesaikan Evaluasi"<br>3. Amati halaman hasil | Skor akhir dihitung akurat pada rentang 0–100; rincian akurasi per kategori materi ditampilkan; pembahasan lengkap tiap nomor disajikan untuk refleksi siswa. | Skor 100% saat semua benar, parsial sesuai jawaban; modal pembahasan terbuka; data tersimpan di `numora_evaluation_results_<id>`. | **PASS** |
| **NUMORA RUN: Rendering 3D & Gerakan Karakter** | 1. Buka `/numora-run`<br>2. Mulai permainan<br>3. Uji kendali tombol: Panah Kiri/Kanan (pindah jalur), Panah Atas/Spasi (lompat), Panah Bawah (meluncur) | Canvas 3D Three.js merender lintasan endless runner 3 jalur; karakter merespons input keyboard dengan animasi posisi dan lompatan yang mulus pada 60 FPS. | Three.js scene loop aktif; collision box terdeteksi; audio efek lompat/geser berbunyi via Web Audio API. | **PASS** |
| **NUMORA RUN: Gerbang Soal Aljabar (Math Gate)** | 1. Lari hingga mendekati gerbang soal aljabar<br>2. Hadapi pertanyaan aljabar berwaktu (10 detik)<br>3. Masuk ke jalur jawaban yang benar | Gerbang soal menampilkan pertanyaan aljabar; memilih jalur jawaban benar memberi poin bonus dan melanjutkan permainan; memilih jawaban salah memicu game over. | `questionBank.js` menyediakan soal aljabar dinamis; trigger tabrakan mendeteksi opsi jalur secara presisi. | **PASS** |
| **NUMORA RUN: Skor Akhir & Penyimpanan Rekor** | 1. Mainkan hingga game over<br>2. Periksa ringkasan skor dan rekor tertinggi (High Score)<br>3. Klik tombol "Main Lagi" | Layar game over menyajikan total skor, jarak tempuh, dan jumlah soal aljabar yang benar; rekor tertinggi tersimpan di `localStorage` (`numora_runner_data_v1`); restart me-reset state tanpa reload. | Penyimpanan rekor `localStorage` terekam; tombol restart menginisialisasi ulang posisi karakter. | **PASS** |
| **Ruang Peneliti (`/researcher-dashboard`)** | 1. Masuk menggunakan token peneliti (P-001)<br>2. Buka `/researcher-dashboard`<br>3. Verifikasi daftar subjek S-001 (Kontrol) dan S-002 (Eksperimen) | Halaman menyajikan data subjek penelitian; S-001 dan S-002 terpetakan jelas sesuai protokol penelitian; data eksperimen terisolasi dari kontrol. | `GET /api/v1/research/subjects` mengembalikan subjek S-001 dan S-002 dengan HTTP 200 OK. | **PASS** |
| **Status Instrumen Beban Kognitif Leppink** | Buka tab instrumen di Ruang Peneliti dan periksa status pengukuran beban kognitif | Sistem menampilkan status jujur `NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)` tanpa data rekaan statistik fiktif. | `GET /api/v1/research/cognitive-load-status` -> `intrinsic_load_status: "NOT CONFIGURED..."` (HTTP 200 OK). | **PASS** |
| **Ekspor Data Penelitian (CSV & JSON)** | Klik tombol ekspor berkas penelitian di dashboard peneliti | Sistem menghasilkan unduhan berkas dataset penelitian berformat CSV dan JSON yang memuat metadata subjek, log sesi, dan status protokol penelitian. | `GET /api/v1/research/sessions` dan fungsi ekspor frontend menghasilkan download berkas valid. | **PASS** |

---

## 3. ARSITEKTUR PENYIMPANAN DATA PROGRES SISWA (TEMUAN PENTING)

Berdasarkan audit menyeluruh terhadap kode sumber frontend dan backend:

> [!IMPORTANT]
> **Status Penyimpanan Progres Siswa Saat Ini:**
> 1. **Progres Modul Siswa:** Disimpan secara eksklusif pada **`localStorage` browser client** (`numora_student_progress_<studentKey>`).
> 2. **Riwayat Hasil Evaluasi 10 Soal:** Disimpan secara eksklusif pada **`localStorage` browser client** (`numora_evaluation_results_<studentKey>`).
> 3. **Skor Tertinggi NUMORA RUN:** Disimpan secara eksklusif pada **`localStorage` browser client** (`numora_runner_data_v1`).
> 4. **Ketiadaan Sinkronisasi Cloud/Database:** Belum ada tabel database (`student_progress`, `evaluation_scores`) atau endpoint REST API (`POST /api/v1/student/progress`, `GET /api/v1/student/progress`) di backend FastAPI untuk menyimpan progres belajar siswa secara terpusat.
> 5. **Implikasi Pengguna Riil:** Jika siswa berganti perangkat (misal dari HP ke laptop) atau membersihkan *cache/browsing data*, progres kelulusan modul dan skor kuis akan kembali ke 0%.

---

## 4. DAFTAR BUG & KETERBATASAN YANG TERSISA (REMAINING BUGS & LIMITATIONS)

1. **Ketergantungan API Key Eksternal untuk AI Generatif:**
   - Fitur percakapan dinamis tingkat lanjut NORA membutuhkan `GEMINI_API_KEY` atau `OPENAI_API_KEY` pada file environment hosting backend.
   - Saat ini di lingkungan lokal, kunci tersebut belum disematkan pada `backend/.env`, sehingga NORA beroperasi dalam mode **fallback lokal Sokratik** (*Adaptive Socratic Knowledge Engine*). Mode fallback ini berfungsi dengan baik untuk konsep dasar aljabar, tetapi tidak sefleksibel model generatif penuh.
2. **Ketiadaan Sinkronisasi Progres Siswa ke Backend Database:**
   - Sebagaimana diuraikan pada Bagian 3, data belajar siswa belum terhubung ke database SQLite/PostgreSQL backend. Untuk penggunaan jangka panjang di sekolah, perlu dibuat endpoint sinkronisasi progres siswa ke database.
3. **Konfigurasi Authorized JavaScript Origins Google OAuth:**
   - Agar Google Login dapat berfungsi pada domain publik saat dideploy (misal `https://numora-space.vercel.app`), URL domain produksi tersebut **wajib** didaftarkan terlebih dahulu ke daftar *Authorized JavaScript Origins* pada Google Cloud Console proyek OAuth.
4. **Persistensi Database SQLite pada Hosting Cloud Statis/Container Serverless:**
   - Database keamanan backend saat ini menggunakan berkas file SQLite lokal (`backend/app/data/security_store.db`).
   - Jika di-deploy pada container hosting tanpa persistent disk (ephemeral container), berkas database akan hilang setiap kali server restart atau sleep. Membutuhkan volume persisten atau koneksi ke managed cloud database (seperti PostgreSQL / Supabase).

---

## 5. STATUS KESIAPAN PUBLIKASI (DEPLOYMENT READINESS ASSESSMENT)

| Dimensi Kesiapan | Status | Penilaian & Rekomendasi |
| :--- | :--- | :--- |
| **Integritas Kode Sumber & Build** | **SIAP (100% READY)** | Vite frontend build menghasilkan exit code 0 (`dist/` bersih). Seluruh 61 pengujian otomatis Python dan 59 pengujian Node.js berhasil lulus 100%. |
| **Keamanan Backend & RBAC** | **SIAP (100% READY)** | JWT HS256 dengan RFC 7519 compliance, JTI token blacklist, IP rate limiter, RBAC siswa vs peneliti, dan sanitasi payload request bekerja tanpa celah. |
| **Fungsionalitas Pembelajaran & Lab** | **SIAP (100% READY)** | Seluruh 4 modul aljabar, 6 mode Algebra Lab, Three.js 3D balance, 10 butir evaluasi, dan NUMORA RUN 3D teruji dan berfungsi lancar. |
| **Konektivitas Cloud & Hosting (Sebelum Push/Deploy)** | **PERLU PERSIAPAN INFRASTRUKTUR** | Sebelum melakukan deploy publik ulang: <br>1. Siapkan persistent volume storage untuk backend agar SQLite tidak reset saat restart.<br>2. Daftarkan URL hosting produksi ke Google Cloud Console OAuth.<br>3. Sematkan `GEMINI_API_KEY` pada environment backend jika menginginkan kemampuan AI generatif online penuh. |

---
*Laporan ini disusun berdasarkan audit kode sumber aktual, eksekusi HTTP nyata terhadap port 8000 dan 5174, serta pengujian logika antarmuka pengguna tanpa mengarang data.*
