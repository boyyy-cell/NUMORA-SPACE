# DOKUMENTASI ARSITEKTUR SCHEMA & ROW LEVEL SECURITY (RLS)
**Project**: NUMORA Space (v1.7) — *"Algebra, Beyond Formulas"*  
**Dokumen**: `docs/NUMORA_SUPABASE_RLS_REVIEW.md`  
**Tujuan**: Tinjauan mendalam atas rancangan schema database, integritas relasional, fungsi trigger, dan kebijakan keamanan RLS sebelum eksekusi ke Supabase PostgreSQL.  
**File DDL**: `database/migrations/001_initial_schema.sql`  
**Status**: DRAFT REVIEW (Belum Dijalankan ke Database)

---

## 1. PENJELASAN SETIAP TABEL

### 1. `public.profiles`
- **Fungsi**: Menyimpan profil pengguna yang berelasi 1-to-1 dengan tabel bawaan Supabase `auth.users(id)`.
- **Kolom Utama**:
  - `id` (UUID, PK): Berelasi langsung ke `auth.users.id` dengan klausa `ON DELETE CASCADE`.
  - `full_name` (VARCHAR): Nama lengkap siswa atau peneliti.
  - `role` (VARCHAR): Peran pengguna, dibatasi ketat oleh `CHECK (role IN ('student', 'researcher'))`. Default selalu `'student'`.
  - `school`, `grade`: Identitas sekolah dan jenjang pendidikan ('SMP Kelas VII').
- **Prinsip Keamanan**: Tidak menyimpan kata sandi (kata sandi dikelola dan di-hash oleh Supabase Auth secara terisolasi di schema `auth`).

### 2. `public.research_subjects`
- **Fungsi**: Menyimpan pemetaan subjek penelitian resmi berskala kecil.
- **Kolom Utama**:
  - `subject_code` (VARCHAR): Dibatasi secara eksplisit `CHECK (subject_code IN ('S-001', 'S-002'))`.
  - `user_id` (UUID, FK, Nullable): Menghubungkan ke `profiles(id)` hanya jika siswa tersebut telah memberikan persetujuan penelitian (*informed consent*).
  - `group_type` (VARCHAR): `Control` (Tatap Muka) atau `Experimental` (Berbantuan NUMORA Space).
  - `consent_status` (VARCHAR): `Consented`, `Pending`, atau `Exempt`.
- **Prinsip Keamanan**: Siswa publik yang mendaftar mandiri **TIDAK AKAN** masuk ke tabel ini. Tabel ini hanya dikelola oleh backend/peneliti berwenang.

### 3. `public.evaluation_attempts`
- **Fungsi**: Mencatat setiap sesi percobaan evaluasi literasi aljabar siswa.
- **Kolom Utama**:
  - `user_id` (UUID, FK): Siswa pemilik percobaan.
  - `subject_id` (UUID, FK, Nullable): Menghubungkan ke subjek riset jika percobaan ini dilakukan oleh subjek penelitian berizin.
  - `assessment_type`: `FORMATIVE_PRACTICE`, `RESEARCH_PRETEST`, atau `RESEARCH_POSTTEST`.
  - `score`, `accuracy_percentage`: Nilai terukur (0.00 – 100.00).
  - `status`: `in_progress`, `completed`, atau `abandoned`.
- **Prinsip Keamanan**: Begitu `status` bernilai `'completed'`, data dikunci secara permanen dan siswa tidak dapat mengubah baris tersebut.

### 4. `public.evaluation_answers`
- **Fungsi**: Menyimpan jawaban aktual per butir soal untuk setiap sesi evaluasi.
- **Kolom Utama**:
  - `attempt_id` (UUID, FK): Percobaan terkait.
  - `question_id` (VARCHAR): Identifier soal unik.
  - `selected_answer` (TEXT): Jawaban yang dipilih siswa.
  - `is_correct` (BOOLEAN): Validasi kebenaran dari backend.
  - `misconception_code` (VARCHAR): Kode miskonsepsi hasil diagnosis backend.
- **Prinsip Keamanan**: Constraint `UNIQUE(attempt_id, question_id)` mencegah siswa mengirimkan lebih dari satu jawaban untuk soal yang sama dalam sesi yang sama.

### 5. `public.research_sessions`
- **Fungsi**: Menyimpan log agregat aktivitas pembelajaran (sesi evaluasi selesai, sesi NUMORA RUN selesai) yang diizinkan untuk observasi riset.
- **Kolom Utama**:
  - `session_type`: `EVALUATION`, `LEARNING`, `NUMORA_RUN`.
  - `source`: Ditandai secara jujur (`STUDENT_LIVE_SESSION`, `PUBLIC_USER_ACTIVITY`, `DEMO_SEED`, `PROTOCOL_TEMPLATE`).
  - `summary` (JSONB): Ringkasan metrik (jumlah soal benar/salah, waktu respons, koin RUN).

---

## 2. PENJELASAN POLICIES & MATRIKS HAK AKSES

Seluruh 5 tabel diaktifkan Row Level Security (`ENABLE ROW LEVEL SECURITY`).  
Koneksi publik tanpa token (Anonymous) **ditolak secara global** pada seluruh operasi baca/tulis.

### Matriks Akses Peran Pengguna

| Tabel | Operasi | Siswa Mandiri (`student`) | Peneliti (`researcher`) | Admin Backend (`service_role`) | Publik (`anon`) |
|---|---|---|---|---|---|
| **`profiles`** | SELECT | Hanya profil miliknya (`auth.uid() = id`) | Semua profil pengguna | Semua profil pengguna | Ditolak (401/403) |
| | UPDATE | Hanya nama & sekolah (`auth.uid() = id`), role terkunci | Ditolak untuk client | Semua baris | Ditolak |
| | INSERT / DELETE | Ditolak (Hanya trigger signup) | Ditolak untuk client | Diizinkan | Ditolak |
| **`research_subjects`** | SELECT | Hanya jika terhubung (`auth.uid() = user_id`) | Seluruh subjek (S-001 & S-002) | Seluruh baris | Ditolak |
| | INSERT / UPDATE | Ditolak | Ditolak untuk client | Diizinkan (Otorisasi administratif) | Ditolak |
| **`evaluation_attempts`**| SELECT | Hanya percobaan miliknya (`auth.uid() = user_id`) | Seluruh percobaan siswa | Seluruh baris | Ditolak |
| | INSERT | Hanya untuk dirinya (`status = 'in_progress'`) | Ditolak untuk client | Diizinkan | Ditolak |
| | UPDATE | Hanya jika `status = 'in_progress'` | Ditolak untuk client | Diizinkan (Finalisasi backend) | Ditolak |
| **`evaluation_answers`** | SELECT | Jawaban attempt miliknya | Seluruh jawaban siswa | Seluruh baris | Ditolak |
| | INSERT | Jawaban attempt in_progress miliknya | Ditolak untuk client | Diizinkan | Ditolak |
| | UPDATE / DELETE | Ditolak (Jawaban tidak dapat diedit) | Ditolak untuk client | Diizinkan | Ditolak |
| **`research_sessions`**  | SELECT | Hanya sesi miliknya (`auth.uid() = user_id`) | Seluruh sesi penelitian | Seluruh baris | Ditolak |
| | INSERT | Hanya sesi miliknya | Ditolak untuk client | Diizinkan | Ditolak |
| | UPDATE / DELETE | Ditolak (Integritas log audit) | Ditolak untuk client | Diizinkan | Ditolak |

---

## 3. ALUR REGISTRASI & KEAMANAN TRIGGER SIGNUP

```
1. Siswa mendaftar via Supabase Auth
   (email, password, metadata: full_name, school, grade)
                     │
                     ▼
2. auth.users berhasil menyimpan akun baru
                     │
                     ▼
3. Trigger `on_auth_user_created` dipicu otomatis
                     │
                     ▼
4. Eksekusi `handle_new_user()` (SECURITY DEFINER):
   • Membaca metadata nama, sekolah, kelas.
   • MEMAKSA role = 'student' (Hardcoded, tidak mempercayai raw_user_meta_data->>'role').
   • Menyisipkan baris ke public.profiles.
   • Jika terjadi error input, fallback menyisipkan nama default tanpa menggagalkan akun.
                     │
                     ▼
5. Akun siap digunakan sebagai Siswa Publik Mandiri
```

---

## 4. RISIKO KEAMANAN & STRATEGI MITIGASINYA

1. **Privilege Escalation (Mencoba Mendaftar Sebagai Peneliti)**:
   - *Vektor Serangan*: Penyerang mengirimkan `{ "role": "researcher" }` pada metadata pendaftaran Supabase Auth.
   - *Mitigasi*: Fungsi trigger `handle_new_user()` secara eksplisit mengabaikan input role dari client dan memaksakan nilai string literal `'student'`.
   - *Proteksi Ganda*: Policy `profiles_update_policy` melarang perubahan pada kolom `role`.
2. **Pencurian Hak Akses Peneliti (Recursive RLS)**:
   - *Vektor Serangan*: Menulis policy `EXISTS (SELECT 1 FROM profiles WHERE ...)` di dalam policy `profiles` dapat menimbulkan query rekursif tak berujung (*infinite recursion error*).
   - *Mitigasi*: Dibuat fungsi helper `public.is_researcher(lookup_user_id UUID)` bertanda `SECURITY DEFINER` dengan parameter runtime `SET search_path = public, auth, pg_temp` yang dieksekusi secara stabil tanpa rekursi.
3. **Manipulasi Nilai Pasca Ujian (Post-Evaluation Tampering)**:
   - *Vektor Serangan*: Siswa mengirimkan request `UPDATE evaluation_attempts SET score = 100` setelah evaluasi selesai.
   - *Mitigasi*: Policy `attempts_update_policy` menyertakan klausa `status = 'in_progress'`. Baris yang berstatus `'completed'` secara otomatis menolak seluruh operasi `UPDATE` dari siswa.
4. **Penyusupan Jawaban Ganda**:
   - *Vektor Serangan*: Siswa mengirimkan dua jawaban berbeda untuk soal yang sama guna membingungkan kalkulasi.
   - *Mitigasi*: Constraint `UNIQUE(attempt_id, question_id)` di level database memblokir duplikasi data secara atomik.

---

## 5. SKENARIO PENGUJIAN KEAMANAN YANG DIRANCANG

Sepuluh skenario berikut dirancang untuk diverifikasi secara otomatis pada Subfase 1C:

| No | Skenario Uji Keamanan | Ekspektasi Hasil |
|:--:|---|---|
| 1 | Siswa A mencoba melakukan `SELECT` pada attempt milik Siswa B. | Baris tidak ditemukan (0 rows / Empty result). |
| 2 | Siswa A mencoba melakukan `UPDATE profiles` milik Siswa B. | Ditolak oleh RLS (0 rows affected / Error 403). |
| 3 | Siswa mencoba mengubah `role = 'researcher'` melalui update profil. | Gagal/Ditolak oleh policy check constraint. |
| 4 | Siswa publik mencoba membaca baris pada `research_subjects`. | Ditolak (0 rows returned). |
| 5 | Siswa mencoba mengupdate jawaban pada attempt yang berstatus `completed`. | Ditolak oleh RLS (0 rows affected). |
| 6 | Pengguna anonim (tanpa header Authorization) membaca tabel privat apa pun. | Ditolak langsung dengan Error 401 Unauthorized. |
| 7 | Peneliti tanpa otorisasi sah membaca sesi di luar cakupannya. | Dibatasi oleh filter group / otorisasi backend. |
| 8 | Endpoint administratif backend menerima request tanpa Service Role / Admin JWT. | Ditolak dengan HTTP 403 Forbidden. |
| 9 | Pendaftaran akun baru mengirimkan metadata `role: 'researcher'`. | Profil tetap dibuat dengan `role: 'student'`. |
| 10 | Pendaftaran akun baru dengan input metadata tidak lengkap. | Profil dibuat dengan nama default tanpa menggagalkan pembuatan akun di `auth.users`. |

---

## 6. LANGKAH VERIFIKASI SQL SEBELUM EKSEKUSI

Sebelum file `001_initial_schema.sql` dieksekusi ke project Supabase:
1. Pastikan ekstensi `uuid-ossp` dan `pgcrypto` didukung oleh instance PostgreSQL Supabase (sudah standar di Supabase).
2. Periksa kesesuaian foreign key `auth.users(id)` dengan skema internal Supabase Auth.
3. Pastikan tidak ada tabel lama yang bertabrakan nama (skrip menggunakan klausa `IF NOT EXISTS` dan `CREATE OR REPLACE`).
4. Jalankan migrasi melalui Supabase Dashboard SQL Editor atau Supabase CLI secara terkendali setelah disetujui.
