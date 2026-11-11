# LAPORAN AUDIT TEKNIS & BLUEPRINT INTEGRASI SUPABASE (PHASE 2A)
**Project**: NUMORA Space (v1.7) — *"Algebra, Beyond Formulas"*  
**Dokumen**: `docs/NUMORA_SUPABASE_PHASE_2A_AUDIT.md`  
**Fokus**: Kesiapan Backend FastAPI, Database Supabase PostgreSQL, Autentikasi Publik, dan Pipeline Telemetri Riset  
**Tanggal**: November 2026  
**Status Audit**: SELESAI (Analisis Komprehensif — Tanpa Perubahan Kode)

---

## 1. KONDISI SISTEM SAAT INI

### A. Frontend (React 18 + Vite)
- **Komponen & Routing**: Menggunakan React Router DOM v6 dengan proteksi rute (`ProtectedRoute.jsx`) dan pembagian role (`student` vs `researcher`).
- **Autentikasi Klien**: State autentikasi berada di `AuthContext.jsx` dengan dua akun demo penelitian (`siswa.demo@numora.space` dan `peneliti.demo@numora.space`). Sesi disimpan di `localStorage` jika `rememberMe = true` dan `sessionStorage` jika `rememberMe = false`.
- **Progres Belajar**: Progres modul aljabar (0–100%) tersimpan di `localStorage` terisolasi per akun siswa (`numora_student_progress_<subjectId>`).
- **Evaluasi Literasi**: Komponen `MathematicalChallenge.jsx` saat ini baru memiliki 2 butir soal statis, mengalami looping indeks `(prev + 1) % 2`, dan belum memiliki perhitungan skor akhir maupun integrasi penyimpanan ke server.
- **NUMORA RUN 3D**: Permainan 3D endless runner (Three.js) menyimpan sesi permainan dan rekor skor ke `localStorage` (`numora_runner_data_v1`), belum terhubung ke identitas akun siswa yang login dan belum mengirim telemetri ke server.
- **Client Supabase**: Belum ada SDK `@supabase/supabase-js` terpasang di frontend.

### B. Backend (FastAPI + Python)
- **Framework & Config**: FastAPI dengan `pydantic-settings` (`Settings` class di `backend/app/core/config.py`).
- **Status `.env`**: 
  - `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` **sudah tersedia** di file `backend/.env`.
  - File `backend/.env` telah terdaftar di `.gitignore` sehingga terlindungi dari pelacakan git.
  - Namun, variabel `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` **belum didaftarkan** sebagai atribut pada kelas `Settings` di `backend/app/core/config.py`.
- **Router Aktif (`backend/app/api/v1/api.py`)**:
  - `/health` — Cek status sistem.
  - `/math` — Evaluasi aljabar linear SymPy & diagnosis miskonsepsi.
  - `/research` — Subjek penelitian (S-001 & S-002), sesi template demo, dan status instrumen kognitif Leppink.
  - `/nora` — Bimbingan percakapan sokratik AI.
  - **Belum ada** endpoint `/auth` maupun endpoint `/evaluations`.
- **Store Penelitian (`research_store.py`)**:
  - Bersifat in-memory read-only template dengan 2 subjek resmi (S-001 Kontrol Tatap Muka dan S-002 Eksperimen NUMORA Space).
  - Belum memiliki method penulisan data (`add_session`) maupun adapter ke Supabase.

### C. Database & Folder Migrasi
- Direktori `database/migrations/` dan `database/seed/` telah disiapkan sejak v1.5 dengan file `README.md` placeholder.
- Belum ada skrip migrasi DDL SQL `.sql` yang dibuat atau dieksekusi ke project Supabase.

---

## 2. FILE YANG PERLU DIUBAH PADA TAHAP IMPLEMENTASI

### A. File Baru yang Akan Dibuat
1. `database/migrations/001_initial_schema.sql` — Skrip DDL lengkap (5 tabel, UUID, constraints, foreign keys, indexes, dan RLS policies).
2. `database/seed/001_initial_seed.sql` — Seed awal khusus untuk 2 subjek riset resmi (S-001 dan S-002).
3. `backend/app/core/supabase.py` — Client layer komunikasi asinkron FastAPI ke Supabase REST & Auth API.
4. `backend/app/core/auth_middleware.py` — Dependency injector untuk memverifikasi JWT Supabase dan mengekstrak `user_id` / `role` yang sah.
5. `backend/app/schemas/evaluation.py` — Schema Pydantic untuk inisialisasi attempt, submisi jawaban, kalkulasi skor, dan miskonsepsi.
6. `backend/app/schemas/auth.py` — Schema Pydantic untuk registrasi dan login Supabase Auth via backend gateway.
7. `backend/app/api/v1/endpoints/evaluations.py` — Endpoint siklus evaluasi (`/attempts`, `/answers`, `/complete`, `/history`).
8. `backend/app/api/v1/endpoints/auth.py` — Endpoint autentikasi publik yang aman tanpa mengekspos role researcher.
9. `backend/app/services/evaluation_service.py` — Backend evaluation engine sebagai **source of truth** (menyimpan kunci jawaban, bobot, validasi SymPy, dan diagnosis miskonsepsi).
10. `frontend/src/features/learning/evaluationQuestionBank.js` — Bank soal publik tanpa kunci jawaban (hanya ID, konteks, pertanyaan, dan opsi acak).
11. `frontend/src/features/learning/EvaluationSummaryModal.jsx` — Tampilan hasil evaluasi (skor, akurasi, analisis miskonsepsi, tombol pembahasan, dan rekomendasi materi).
12. `tests/test_phase2a_integration.py` — Suite pengujian backend untuk memverifikasi autentikasi, RLS, scoring, dan idempotensi.

### B. File yang Perlu Dimodifikasi
1. `backend/app/core/config.py` — Menambahkan field `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` pada `Settings`.
2. `backend/app/api/v1/api.py` — Mendaftarkan router `/auth` dan `/evaluations`.
3. `backend/app/api/v1/endpoints/research.py` — Menambahkan endpoint `POST /sessions` untuk menerima log sesi siswa berizin.
4. `backend/app/services/research_store.py` — Menambahkan integrasi pembacaan dan penulisan log sesi ke tabel `research_sessions`.
5. `frontend/src/services/api.js` — Menambahkan pemanggilan API evaluasi, sesi riset, dan registrasi/login Supabase.
6. `frontend/src/features/learning/MathematicalChallenge.jsx` — Mengubah alur looping menjadi alur terstruktur (Mulai $\rightarrow$ Jawab $\rightarrow$ Selesai $\rightarrow$ Rangkuman).
7. `frontend/src/context/AuthContext.jsx` — Mengintegrasikan Supabase Auth sambil mempertahankan fungsi tombol akun demo.
8. `frontend/src/pages/LoginPage.jsx` — Menambahkan tab pendaftaran siswa mandiri publik (tanpa role researcher) dengan palet visual Sage & Ivory yang sama.
9. `frontend/src/pages/StudentDashboard.jsx` — Menampilkan kartu riwayat skor evaluasi dan akurasi materi di Ruang Siswa.
10. `frontend/src/pages/ResearcherDashboard.jsx` — Menampilkan sesi siswa riil yang masuk dari subjek riset berizin.
11. `.env.example` — Memperbarui dokumentasi variabel environment tanpa menampilkan secret.

---

## 3. RANCANGAN ARSITEKTUR BACKEND DAN SUPABASE

Untuk menjamin keamanan tingkat tinggi pada aplikasi publik siswa SMP:

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                           │
│  • Antarmuka visual Sage & Ivory (100% Tidak Berubah)       │
│  • Tidak memiliki kunci jawaban atau aturan skoring         │
│  • Tidak memiliki SUPABASE_SERVICE_ROLE_KEY                 │
│  • Mengirimkan Bearer JWT pada setiap request terotorisasi  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                           │
│  • auth_middleware.py: Memverifikasi JWT Supabase Auth      │
│  • evaluation_service.py: Source of Truth kunci & skoring   │
│  • research_store.py: Isolasi data riset S-001 & S-002      │
│  • supabase.py: Menggunakan SUPABASE_SERVICE_ROLE_KEY       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / PostgREST (Service Role)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               SUPABASE POSTGRESQL DATABASE                  │
│  • auth.users: Pengelolaan akun & enkripsi password mandiri │
│  • public.profiles: Profil publik (Siswa & Peneliti)       │
│  • public.research_subjects: Terisolasi (Hanya S-001/S-002) │
│  • public.evaluation_attempts: Terkunci jika status selesai │
│  • public.evaluation_answers: Jawaban aktual per butir soal │
│  • public.research_sessions: Log aktivitas terverifikasi    │
│  • Row Level Security (RLS) aktif pada seluruh tabel        │
└─────────────────────────────────────────────────────────────┘
```

### Keunggulan Arsitektur:
1. **Frontend Sandboxing**: Frontend tidak memiliki akses langsung ke database dengan hak istimewa, membatalkan risiko pencurian data massal.
2. **Kerahasiaan Kunci Jawaban**: Jawaban benar dihitung di memori server; siswa tidak dapat melihat kunci jawaban melalui inspeksi peramban (*Inspect Element / Network tab*).
3. **Pemisahan Jalur Riset**: Siswa publik tidak secara otomatis masuk ke tabel subjek penelitian.

---

## 4. RANCANGAN TABEL DAN RELASI DATABASE

### A. Tabel `profiles`
Menghubungkan akun Supabase Auth dengan identitas aplikasi.
- `id` (UUID, Primary Key, References `auth.users(id)` ON DELETE CASCADE)
- `full_name` (VARCHAR(150), NOT NULL)
- `role` (VARCHAR(20), NOT NULL, CHECK `role IN ('student', 'researcher')`, DEFAULT 'student')
- `school` (VARCHAR(150), NULL)
- `grade` (VARCHAR(50), DEFAULT 'SMP Kelas VII')
- `created_at` (TIMESTAMPTZ, DEFAULT `now()`)
- `updated_at` (TIMESTAMPTZ, DEFAULT `now()`)

### B. Tabel `research_subjects`
Memisahkan subjek penelitian resmi dari populasi siswa publik.
- `id` (UUID, Primary Key, DEFAULT `gen_random_uuid()`)
- `subject_code` (VARCHAR(20), UNIQUE, NOT NULL, CHECK `subject_code IN ('S-001', 'S-002')`)
- `user_id` (UUID, References `profiles(id)`, NULL)
- `group_type` (VARCHAR(30), NOT NULL, CHECK `group_type IN ('Control', 'Experimental')`)
- `enrollment_status` (VARCHAR(20), DEFAULT 'Active')
- `consent_status` (VARCHAR(20), NOT NULL, CHECK `consent_status IN ('Consented', 'Pending', 'Exempt')`)
- `enrolled_at` (TIMESTAMPTZ, DEFAULT `now()`)
- `created_at` (TIMESTAMPTZ, DEFAULT `now()`)

### C. Tabel `evaluation_attempts`
Mencatat setiap sesi evaluasi literasi aljabar yang dilakukan siswa.
- `id` (UUID, Primary Key, DEFAULT `gen_random_uuid()`)
- `user_id` (UUID, References `profiles(id)`, NOT NULL)
- `subject_id` (UUID, References `research_subjects(id)`, NULL)
- `assessment_type` (VARCHAR(30), NOT NULL, CHECK `assessment_type IN ('FORMATIVE_PRACTICE', 'RESEARCH_PRETEST', 'RESEARCH_POSTTEST')`)
- `total_questions` (INT, NOT NULL, CHECK `total_questions > 0`)
- `correct_answers` (INT, DEFAULT 0)
- `incorrect_answers` (INT, DEFAULT 0)
- `score` (NUMERIC(5,2), DEFAULT 0.00)
- `accuracy_percentage` (NUMERIC(5,2), DEFAULT 0.00)
- `duration_seconds` (INT, DEFAULT 0)
- `status` (VARCHAR(20), NOT NULL, CHECK `status IN ('in_progress', 'completed', 'abandoned')`, DEFAULT 'in_progress')
- `started_at` (TIMESTAMPTZ, DEFAULT `now()`)
- `completed_at` (TIMESTAMPTZ, NULL)
- `created_at` (TIMESTAMPTZ, DEFAULT `now()`)
- *Index*: `idx_attempts_user_id` ON `(user_id)`, `idx_attempts_created_at` ON `(created_at DESC)`

### D. Tabel `evaluation_answers`
Menyimpan jawaban aktual siswa per butir soal.
- `id` (UUID, Primary Key, DEFAULT `gen_random_uuid()`)
- `attempt_id` (UUID, References `evaluation_attempts(id)` ON DELETE CASCADE, NOT NULL)
- `question_id` (VARCHAR(50), NOT NULL)
- `topic` (VARCHAR(50), NOT NULL)
- `selected_answer` (TEXT, NOT NULL)
- `is_correct` (BOOLEAN, NOT NULL)
- `misconception_code` (VARCHAR(50), NULL)
- `answered_at` (TIMESTAMPTZ, DEFAULT `now()`)
- *Constraint*: `UNIQUE(attempt_id, question_id)` (Mencegah pengiriman jawaban ganda untuk soal yang sama).
- *Index*: `idx_answers_attempt_id` ON `(attempt_id)`

### E. Tabel `research_sessions`
Mencatat log agregat sesi aktivitas pembelajaran untuk keperluan observasi peneliti.
- `id` (UUID, Primary Key, DEFAULT `gen_random_uuid()`)
- `user_id` (UUID, References `profiles(id)`, NOT NULL)
- `subject_id` (UUID, References `research_subjects(id)`, NULL)
- `session_type` (VARCHAR(30), NOT NULL, CHECK `session_type IN ('EVALUATION', 'LEARNING', 'NUMORA_RUN')`)
- `source` (VARCHAR(30), NOT NULL, CHECK `source IN ('STUDENT_LIVE_SESSION', 'PUBLIC_USER_ACTIVITY', 'DEMO_SEED', 'PROTOCOL_TEMPLATE')`)
- `duration_seconds` (NUMERIC(8,2), DEFAULT 0.00)
- `summary` (JSONB, NOT NULL, DEFAULT '{}'::jsonb)
- `started_at` (TIMESTAMPTZ, DEFAULT `now()`)
- `completed_at` (TIMESTAMPTZ, DEFAULT `now()`)
- `created_at` (TIMESTAMPTZ, DEFAULT `now()`)
- *Index*: `idx_sessions_subject_id` ON `(subject_id)`, `idx_sessions_type` ON `(session_type)`

---

## 5. RANCANGAN AUTENTIKASI

### A. Alur Registrasi Siswa Publik
1. Pengguna membuka tab *"Daftar Akun Siswa"* pada `LoginPage.jsx`.
2. Input yang diminta: Nama Lengkap, Asal Sekolah, Alamat Email, dan Kata Sandi.
3. Frontend mengirim data ke endpoint `POST /api/v1/auth/register`.
4. Backend mendaftarkan user ke Supabase Auth melalui Admin/Auth API.
5. Role **selalu dikunci** sebagai `'student'`. Role `'researcher'` ditolak jika dicoba dimasukkan melalui endpoint publik.
6. Trigger database otomatis menyisipkan profil ke tabel `public.profiles`.
7. Backend mengembalikan access token JWT ke frontend.

### B. Alur Login & Verifikasi JWT
1. Pengguna memasukkan email dan kata sandi di `LoginPage.jsx`.
2. Frontend memanggil `POST /api/v1/auth/login`.
3. Backend memverifikasi kredensial ke Supabase Auth, memperoleh access token JWT, dan mengembalikannya ke client.
4. Client menyimpan token ke `localStorage` (jika `rememberMe` aktif) atau `sessionStorage` (jika tidak aktif).
5. Pada setiap permintaan berikutnya yang membutuhkan otentikasi, client menyertakan header:
   `Authorization: Bearer <access_token>`.
6. Middleware backend (`auth_middleware.py`) memverifikasi token dan menyuntikkan objek `CurrentUser` (`user_id`, `role`, `email`) ke handler route.

### C. Kompatibilitas Akun Demo
- Akun demo resmi (`siswa.demo@numora.space` dan `peneliti.demo@numora.space`) didaftarkan ke Supabase Auth pada file seed, atau didukung oleh fallback mock terisolasi pada environment luring/evaluasi.
- Tombol 1-klik di `LoginPage.jsx` tetap mengisi kredensial dan melakukan login tanpa memerlukan konfigurasi manual dari penguji.

---

## 6. RANCANGAN ROW LEVEL SECURITY (RLS) POLICIES

Setiap tabel di dalam database diaktifkan Row Level Security (`ALTER TABLE <nama_tabel> ENABLE ROW LEVEL SECURITY;`).

### A. Kebijakan Tabel `profiles`
- **SELECT**:
  ```sql
  CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

  CREATE POLICY "Researchers can read all profiles" ON profiles
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'researcher')
    );
  ```
- **UPDATE**:
  ```sql
  CREATE POLICY "Users can update own details" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
  ```
  *(Kolom `role` tidak dapat diubah oleh siswa untuk mencegah privilege escalation).*

### B. Kebijakan Tabel `evaluation_attempts`
- **SELECT**:
  ```sql
  CREATE POLICY "Students can read own attempts" ON evaluation_attempts
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Researchers can read attempts" ON evaluation_attempts
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'researcher')
    );
  ```
- **INSERT**:
  ```sql
  CREATE POLICY "Students can create own attempt" ON evaluation_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  ```
- **UPDATE**:
  ```sql
  CREATE POLICY "Students can update in-progress attempt" ON evaluation_attempts
    FOR UPDATE USING (auth.uid() = user_id AND status = 'in_progress');
  ```
  *(Percobaan yang sudah berstatus `completed` dikunci dan ditolak jika dicoba diubah kembali).*

### C. Kebijakan Tabel `evaluation_answers`
- **SELECT**:
  ```sql
  CREATE POLICY "Students can read own answers" ON evaluation_answers
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM evaluation_attempts WHERE id = evaluation_answers.attempt_id AND user_id = auth.uid())
    );
  ```
- **INSERT**:
  ```sql
  CREATE POLICY "Students can insert answers for own in-progress attempt" ON evaluation_answers
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM evaluation_attempts WHERE id = evaluation_answers.attempt_id AND user_id = auth.uid() AND status = 'in_progress')
    );
  ```

### D. Kebijakan Tabel `research_subjects` & `research_sessions`
- **research_subjects**: Hanya dapat dibaca oleh peneliti berotorisasi atau oleh siswa yang terhubung secara spesifik ke subjek tersebut.
- **research_sessions**: Siswa dapat menyisipkan log sesi belajarnya sendiri; peneliti dapat membaca seluruh log sesi yang bersumber dari subjek penelitian.

---

## 7. DAFTAR ENDPOINT YANG DIBUTUHKAN

### A. Autentikasi (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Pendaftaran siswa baru (Nama, Sekolah, Email, Password). Role dikunci sebagai `student`.
- `POST /api/v1/auth/login` — Autentikasi pengguna, mengembalikan JWT access token dan profil ringkas.
- `GET /api/v1/auth/me` — Membaca profil pengguna yang sedang login berdasarkan Bearer JWT.

### B. Evaluasi Literasi Matematika (`/api/v1/evaluations`)
- `GET /api/v1/evaluations/questions` — Mengambil butir soal evaluasi aktif tanpa kunci jawaban (soal & opsi acak).
- `POST /api/v1/evaluations/attempts` — Menginisialisasi sesi pengerjaan evaluasi baru (menghasilkan `attempt_id`).
- `POST /api/v1/evaluations/attempts/{attempt_id}/answers` — Mengirimkan jawaban siswa per butir soal (divalidasi dan dicatat di server).
- `POST /api/v1/evaluations/attempts/{attempt_id}/complete` — Memfinalisasi evaluasi, mengunci status, menghitung skor total, akurasi, mendiagnosis miskonsepsi, dan mengembalikan hasil lengkap beserta pembahasan. Bersifat **idempoten**.
- `GET /api/v1/evaluations/history` — Mengambil riwayat percobaan evaluasi milik siswa yang sedang login.

### C. Riset & Telemetri Pembelajaran (`/api/v1/research`)
- `POST /api/v1/research/sessions` — Menerima log ringkasan aktivitas belajar (Evaluasi selesai, NUMORA RUN selesai) untuk disimpan ke `research_sessions`.
- `GET /api/v1/research/subjects` — *(Endpoint lama dipertahankan)* Membaca daftar subjek penelitian (S-001 & S-002).
- `GET /api/v1/research/sessions` — *(Endpoint lama dipertahankan)* Membaca sesi observasi terintegrasi Supabase.
- `GET /api/v1/research/cognitive-load-status` — *(Endpoint lama dipertahankan)* Membaca status instrumen kognitif Leppink.

---

## 8. STRATEGI MIGRASI DARI MOCK / LOCALSTORAGE

1. **Prinsip Transisi Mulus (Non-Breaking Graceful Migration)**:
   - Pengguna lama dengan data sesi di `localStorage` tidak akan mengalami crash atau kehilangan akses.
   - Jika token Supabase belum tersedia di peramban, aplikasi tetap dapat menggunakan akun demo lokal sebagai fallback evaluasi.
2. **Pemisahan Status Penyimpanan (Pending Sync vs Synced)**:
   - Data evaluasi atau permainan yang berhasil dikirim ke server ditandai dengan flag:
     `{ synced: true, remote_id: "uuid-from-supabase" }`.
   - Jika koneksi internet terputus di tengah pengerjaan, jawaban disimpan di `localStorage` dengan penanda jelas:
     `{ synced: false, pending_sync: true }`.
   - Frontend menampilkan status subtil *"Tersimpan lokal (Menunggu sinkronisasi)"*, dan secara otomatis melakukan pengiriman ulang saat koneksi kembali stabil tanpa menciptakan rekaman ganda.
3. **Migrasi Progres Modul**:
   - Helper progres modul membaca data dari server terlebih dahulu. Jika server mengembalikan data kosong, fallback ke `localStorage` lokal akun yang bersangkutan.

---

## 9. RISIKO DAN MITIGASI

| No | Risiko Potensial | Tingkat Risiko | Strategi Mitigasi Terukur |
|:--:|---|:---:|---|
| 1 | **Kebocoran Service Role Key** | Kritis | Service role key **hanya boleh ada di `backend/.env`**. Tidak ada variabel `VITE_` di frontend yang memuat service role key. Backend menjadi satu-satunya entitas yang memegang hak administratif. |
| 2 | **Kecurangan Jawaban (Cheat via Network/DOM)** | Tinggi | Seluruh kunci jawaban, pembobotan nilai, dan pohon diagnosis miskonsepsi disimpan di backend. Frontend hanya menerima pertanyaan dan teks opsi jawaban. |
| 3 | **Pencemaran Data Penelitian Lapangan** | Tinggi | Siswa publik yang mendaftar mandiri dimasukkan ke tabel `profiles` biasa dan **tidak diberi `subject_code`**. Tabel `research_subjects` dikunci hanya untuk S-001 dan S-002. |
| 4 | **Manipulasi Skor Pasca-Ujian** | Tinggi | RLS Policy pada `evaluation_attempts` secara tegas melarang operasi `UPDATE` jika status attempt sudah bernilai `'completed'`. |
| 5 | **Privilege Escalation ke Akun Peneliti** | Sedang | Form registrasi publik mengabaikan parameter role dan memaksa `role = 'student'`. Pembuatan akun peneliti hanya dapat dilakukan melalui seeding administratif database. |
| 6 | **Kegagalan Koneksi Supabase saat Evaluasi** | Sedang | Terapkan pola *Graceful Local Queue*. Evaluasi tetap dapat diselesaikan di sisi klien dengan diagnosis fallback, dan log disimpan sementara dengan flag `pending_sync`. |
| 7 | **Pengiriman Ganda (Double Submission)** | Sedang | Endpoint penyelesaian evaluasi menerapkan pengecekan idempotensi berbasis `attempt_id`. Jika attempt telah berstatus `completed`, backend langsung mengembalikan hasil kalkulasi pertama tanpa mencatat baris baru. |

---

## 10. URUTAN IMPLEMENTASI BERTAHAP (ROADMAP)

Sesuai arahan, implementasi dibagi menjadi subfase terukur dan berhenti pada setiap checkpoint:

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1A: DATABASE DDL, MIGRATION SQL, DAN KEBIJAKAN RLS        │
│ • Membuat database/migrations/001_initial_schema.sql           │
│ • Membuat database/seed/001_initial_seed.sql                    │
│ • Memperbarui .env.example (dokumentasi variabel aman)         │
│ • CHECKPOINT LAPORAN: Peninjauan skrip DDL SQL sebelum eksekusi │
└───────────────────────────────┬─────────────────────────────────┘
                                │ (Setelah Persetujuan 1A)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1B: SUPABASE AUTH & BACKEND JWT VALIDATION GATEWAY         │
│ • Menambahkan SUPABASE_URL & KEY ke Settings config.py          │
│ • Membuat backend/app/core/auth_middleware.py (JWT verifier)    │
│ • Membuat backend/app/api/v1/endpoints/auth.py                  │
│ • Mengintegrasikan AuthContext.jsx dengan tetap menjaga Demo    │
│ • CHECKPOINT LAPORAN: Uji registrasi, login, & proteksi token   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ (Setelah Persetujuan 1B)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1C: BACKEND REPOSITORY LAYER & SECURITY TESTS              │
│ • Membuat backend/app/core/supabase.py (Client layer)           │
│ • Membuat unit test keamanan (RLS verification, no data leaks)  │
│ • CHECKPOINT LAPORAN: Hasil test keamanan sebelum masuk Fase 2  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ (Setelah Persetujuan 1C)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: SISTEM EVALUASI LITERASI MATEMATIKA (NON-LOOPING)       │
│ • Bank Soal 8–10 butir aljabar SMP kelas VII terverifikasi      │
│ • Backend evaluation_service.py (Source of Truth)               │
│ • Endpoint /api/v1/evaluations/attempts & complete              │
│ • Alur linier non-looping & EvaluationSummaryModal.jsx          │
│ • CHECKPOINT LAPORAN: Uji alur evaluasi & akurasi penilaian     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. STRATEGI PENGUJIAN

Pengujian akan dilakukan pada setiap subfase menggunakan suite pengujian otomatis:
1. **Unit Test Bank Soal & Evaluator**:
   - Memverifikasi 10 butir soal aljabar kelas VII bebas dari kesalahan matematika menggunakan MathEngine / SymPy.
   - Memverifikasi posisi opsi teracak dan kunci jawaban benar 100% akurat di server.
2. **Security & Authorization Test**:
   - Menguji bahwa request tanpa token Bearer ditolak dengan HTTP 401 Unauthorized.
   - Menguji bahwa siswa A tidak dapat membaca atau mengubah baris attempt milik siswa B (HTTP 403 / RLS isolation).
   - Menguji bahwa akun yang mencoba mengirimkan `role: researcher` pada registrasi publik ditolak atau dipaksa menjadi `student`.
3. **Idempotency Test**:
   - Menguji pengiriman berulang pada endpoint `/attempts/{id}/complete` mengembalikan respons yang sama tanpa menduplikasi nilai skor.
4. **Non-Regression Test**:
   - Menjalankan build frontend Vite (`npm run build`) untuk memastikan bundle bebas dari error sintaks, import, atau style.
   - Memastikan tombol login akun demo siswa S-002 dan peneliti P-001 tetap berfungsi instan.
