# NUMORA SPACE — PHASE 1 SCHEMA-TO-DESIGN RECONCILIATION REPORT

**Status Audit:** COMPLETED — 100% RECONCILED (ALL PASS)  
**Tanggal Audit:** 23 November 2026  
**Ruang Lingkup:** Verifikasi Skema Database Aktif terhadap Dokumen Desain Teknis Final  
**Dokumen Referensi:**
1. `docs/NUMORA_PERSISTENT_STORAGE_IMPLEMENTATION_PLAN.md`
2. `docs/NUMORA_PHASE1_SCHEMA_MIGRATION_REPORT.md`
3. `docs/NUMORA_PHASE1_FINAL_REVIEW.md`
**Target Database:** `backend/app/data/security_store.db` (Active SQLite Database)

---

## 1. Executive Summary

Audit rekonsiliasi Phase 1 dilakukan secara menyeluruh dan *read-only* untuk memvalidasi bahwa skema fisik pada database SQLite aktif (`security_store.db`) telah memenuhi secara presisi seluruh spesifikasi teknis yang didefinisikan dalam dokumen desain arsitektur penyimpanan permanen (`NUMORA_PERSISTENT_STORAGE_IMPLEMENTATION_PLAN.md`).

### Rangkuman Temuan Kunci:
1. **Kesesuaian Skema 9 Tabel Baru:** **100% PASS**. Seluruh nama tabel, kolom, tipe data, `NOT NULL` constraint, default value, Primary Key, Foreign Key (dengan klausa `CASCADE` / `RESTRICT` / `SET NULL` yang tepat), Unique Constraint, dan Secondary Indexes terpasang dan cocok sempurna dengan rancangan desain.
2. **Kesiapan Runner (Delta Incremental & MAX High Score):** **PASS**. Tabel `student_runner_stats` memiliki kolom terpisah untuk high score per tingkatan kesulitan dan akumulasi counter yang mendukung mutasi atomik inkremental.
3. **Penyimpanan Seluruh Sesi NUMORA RUN:** **PASS**. Tabel `student_runner_sessions` dirancang secara *append-only* tanpa batasan DDL 10 sesi, sehingga seluruh riwayat gameplay siswa tersimpan permanen untuk keperluan evaluasi longitudinal.
4. **Idempotensi Evaluasi Belajar:** **PASS**. Tabel `student_evaluations` menerapkan `CONSTRAINT uq_eval_idempotency UNIQUE(user_email, idempotency_key)`, mencegah duplikasi submission nilai evaluasi siswa.
5. **Dukungan Protokol Penelitian S-001 & S-002:** **PASS**. Tabel `research_subjects`, `research_sessions`, dan `research_cognitive_load_records` terhubung dengan relasi relasional kuat (`RESTRICT`), memisahkan subjek tatap muka (S-001) dari subjek berbantuan NUMORA (S-002) tanpa kontaminasi data.
6. **Rekonsiliasi Backup Ganda Pre-Phase 1:** **RECONCILED**. Telah diverifikasi bahwa `_094017.db` adalah snapshot baseline murni sebelum DDL pertama, sedangkan `_094045.db` adalah snapshot sebelum re-run migrasi. Keduanya berstatus `ok` dan valid.
7. **Perlindungan Akun Eksisting:** **PASS**. Keempat akun (termasuk `siswa.demo` dan `peneliti.demo`) tetap utuh tanpa modifikasi atau kehilangan data.

---

## 2. Matriks Rekonsiliasi 9 Tabel Baru

| No | Nama Tabel | Status Desain | Status Fisik SQLite | PK / FK / UQ Constraints | Indeks Sekunder | Rekonsiliasi |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| 1 | `schema_migrations` | Ada | Ada (3 Kolom) | PK(`version`) | - | **PASS** |
| 2 | `student_module_progress` | Ada | Ada (8 Kolom) | PK(`id`), FK->`users(email)` ON DELETE CASCADE, UQ(`user_email`, `module_id`) | `idx_mod_prog_user_mod` | **PASS** |
| 3 | `student_evaluations` | Ada | Ada (12 Kolom) | PK(`evaluation_id`), FK->`users(email)` ON DELETE CASCADE, UQ(`user_email`, `idempotency_key`) | `idx_eval_user`, `idx_eval_completed` | **PASS** |
| 4 | `student_runner_stats` | Ada | Ada (11 Kolom) | PK(`user_email`), FK->`users(email)` ON DELETE CASCADE | `idx_runner_stats_user` | **PASS** |
| 5 | `student_runner_sessions` | Ada | Ada (12 Kolom) | PK(`session_id`), FK->`users(email)` ON DELETE CASCADE, UQ(`user_email`, `idempotency_key`) | `idx_runner_sess_user`, `idx_runner_sess_created` | **PASS** |
| 6 | `learning_activities` | Ada | Ada (6 Kolom) | PK(`activity_id`), FK->`users(email)` ON DELETE CASCADE | `idx_activities_user_created` | **PASS** |
| 7 | `research_subjects` | Ada | Ada (14 Kolom) | PK(`subject_id`) | `idx_research_subj_group` | **PASS** |
| 8 | `research_sessions` | Ada | Ada (11 Kolom) | PK(`session_id`), FK->`research_subjects(subject_id)` ON DELETE RESTRICT | `idx_research_sess_subj_date` | **PASS** |
| 9 | `research_cognitive_load_records` | Ada | Ada (9 Kolom) | PK(`record_id`), FK->`research_subjects(subject_id)` ON DELETE RESTRICT, FK->`research_sessions(session_id)` ON DELETE SET NULL | `idx_cog_load_subj` | **PASS** |

---

## 3. Detail Verifikasi Kolom dan Constraints per Tabel

### 3.1. Tabel `schema_migrations`
*Tujuan: Pencatatan versi migrasi skema database.*
- **Kolom:**
  - `version` (INTEGER, PK, NOT NULL)
  - `name` (TEXT, NOT NULL)
  - `applied_at` (INTEGER, NOT NULL)
- **Data Saat Ini:**
  - Version `1`: `initial_persistent_storage_phase1` (applied_at: 1763890845).
- **Hasil:** **PASS**

---

### 3.2. Tabel `student_module_progress`
*Tujuan: Menyimpan progres modul aljabar siswa (Linear Equations, System of Linear Equations, Quadratic Relations).*
- **Kolom & Tipe:**
  - `id` (INTEGER, PK, AUTOINCREMENT)
  - `user_email` (TEXT, NOT NULL, FK -> `users(email)` ON DELETE CASCADE)
  - `module_id` (TEXT, NOT NULL)
  - `status` (TEXT, NOT NULL, CHECK: `'NOT_STARTED'`, `'IN_PROGRESS'`, `'COMPLETED'`)
  - `slider_explored` (INTEGER, NOT NULL, DEFAULT 0)
  - `time_spent_seconds` (INTEGER, NOT NULL, DEFAULT 0)
  - `completed_at` (INTEGER, NULLABLE)
  - `updated_at` (INTEGER, NOT NULL)
- **Constraints & Indeks:**
  - `UNIQUE(user_email, module_id)` -> Mencegah duplikasi modul per siswa.
  - Indeks: `idx_mod_prog_user_mod` ON `(user_email, module_id)`.
- **Hasil:** **PASS**

---

### 3.3. Tabel `student_evaluations`
*Tujuan: Menyimpan hasil evaluasi/kuis siswa secara append-only.*
- **Kolom & Tipe:**
  - `evaluation_id` (TEXT, PK, NOT NULL)
  - `idempotency_key` (TEXT, NOT NULL)
  - `user_email` (TEXT, NOT NULL, FK -> `users(email)` ON DELETE CASCADE)
  - `attempt_number` (INTEGER, NOT NULL, DEFAULT 1)
  - `score` (REAL, NOT NULL, CHECK: `score >= 0.0 AND score <= 100.0`)
  - `accuracy` (REAL, NOT NULL, CHECK: `accuracy >= 0.0 AND accuracy <= 100.0`)
  - `total_questions` (INTEGER, NOT NULL, DEFAULT 10)
  - `correct_count` (INTEGER, NOT NULL)
  - `wrong_count` (INTEGER, NOT NULL)
  - `category_breakdown` (TEXT, NOT NULL — JSON payload)
  - `detailed_answers` (TEXT, NOT NULL — JSON payload)
  - `completed_at` (INTEGER, NOT NULL)
- **Constraints & Indeks:**
  - `CONSTRAINT uq_eval_idempotency UNIQUE(user_email, idempotency_key)` -> Perlindungan ganda dari pengiriman jaringan berulang.
  - Indeks: `idx_eval_user` ON `(user_email)`
  - Indeks: `idx_eval_completed` ON `(completed_at)`
- **Hasil:** **PASS**

---

### 3.4. Tabel `student_runner_stats`
*Tujuan: Menyimpan agregat statistik permainan NUMORA RUN per pengguna.*
- **Kolom & Tipe:**
  - `user_email` (TEXT, PK, FK -> `users(email)` ON DELETE CASCADE)
  - `high_score_beginner` (INTEGER, NOT NULL, DEFAULT 0)
  - `high_score_intermediate` (INTEGER, NOT NULL, DEFAULT 0)
  - `high_score_advanced` (INTEGER, NOT NULL, DEFAULT 0)
  - `high_score_expert` (INTEGER, NOT NULL, DEFAULT 0)
  - `total_games` (INTEGER, NOT NULL, DEFAULT 0)
  - `total_coins` (INTEGER, NOT NULL, DEFAULT 0)
  - `total_distance` (INTEGER, NOT NULL, DEFAULT 0)
  - `total_math_answered` (INTEGER, NOT NULL, DEFAULT 0)
  - `total_math_correct` (INTEGER, NOT NULL, DEFAULT 0)
  - `updated_at` (INTEGER, NOT NULL)
- **Evaluasi Khusus:**
  - **Mendukung High Score MAX:** Desain skema memisahkan high score per tier, memungkinkan backend mengeksekusi operasi atomik SQL:
    ```sql
    high_score_<tier> = MAX(high_score_<tier>, :new_score)
    ```
  - **Mendukung Incremental Delta:** Kolom counter kumulatif (`total_games`, `total_coins`, `total_distance`, dll.) menggunakan bilangan bulat non-null dengan default 0, memungkinkan agregasi inkremental:
    ```sql
    total_games = total_games + :delta_games,
    total_coins = total_coins + :delta_coins,
    ...
    ```
- **Hasil:** **PASS**

---

### 3.5. Tabel `student_runner_sessions`
*Tujuan: Menyimpan log setiap sesi bermain NUMORA RUN tanpa batas.*
- **Kolom & Tipe:**
  - `session_id` (TEXT, PK, NOT NULL)
  - `idempotency_key` (TEXT, NOT NULL)
  - `user_email` (TEXT, NOT NULL, FK -> `users(email)` ON DELETE CASCADE)
  - `level` (TEXT, NOT NULL, CHECK: `level IN ('beginner', 'intermediate', 'advanced', 'expert')`)
  - `score` (INTEGER, NOT NULL)
  - `coins` (INTEGER, NOT NULL)
  - `distance` (INTEGER, NOT NULL)
  - `answered` (INTEGER, NOT NULL)
  - `correct` (INTEGER, NOT NULL)
  - `accuracy` (REAL, NOT NULL)
  - `mistakes_count` (INTEGER, NOT NULL, DEFAULT 0)
  - `created_at` (INTEGER, NOT NULL)
- **Evaluasi Khusus:**
  - **Penyimpanan Seluruh Sesi (Bukan Hanya 10 Sesi):** Tidak ada trigger atau batasan `LIMIT 10` pada level database. Semua baris sesi disimpan secara permanen. Pengambilan data histori pada UI frontend dapat melakukan paginasi atau limit query, namun data mentah historis tetap utuh untuk keperluan analisis penelitian.
  - **Idempotensi Sesi:** Dilindungi oleh `CONSTRAINT uq_runner_sess_idempotency UNIQUE(user_email, idempotency_key)`.
- **Indeks:**
  - `idx_runner_sess_user` ON `(user_email)`
  - `idx_runner_sess_created` ON `(created_at)`
- **Hasil:** **PASS**

---

### 3.6. Tabel `learning_activities`
*Tujuan: Audit trail interaksi pembelajaran siswa (login, modul, lab aljabar, nora ai, evaluasi).*
- **Kolom & Tipe:**
  - `activity_id` (TEXT, PK, NOT NULL)
  - `user_email` (TEXT, NOT NULL, FK -> `users(email)` ON DELETE CASCADE)
  - `activity_type` (TEXT, NOT NULL, CHECK: `activity_type IN ('LOGIN', 'LOGOUT', 'MODULE_VIEW', 'MODULE_COMPLETE', 'LAB_EXPERIMENT', 'NORA_CHAT', 'EVALUATION_SUBMIT', 'RUNNER_PLAY')`)
  - `module_or_feature_id` (TEXT, NOT NULL)
  - `metadata_json` (TEXT, NULLABLE — konteks JSON)
  - `created_at` (INTEGER, NOT NULL)
- **Indeks:**
  - `idx_activities_user_created` ON `(user_email, created_at)`
- **Hasil:** **PASS**

---

### 3.7. Tabel Penelitian: `research_subjects`, `research_sessions`, `research_cognitive_load_records`
*Tujuan: Manajemen data penelitian empiris pembelajaran matematika berbantuan teknologi.*

#### `research_subjects`
- **PK:** `subject_id` (TEXT)
- **Kolom:** `group_name`, `role_description`, `grade`, `active_module`, `pretest_status`, `pretest_score`, `posttest_status`, `posttest_score`, `cognitive_load_status`, `total_sessions_logged`, `protocol_category`, `created_at`, `updated_at`.
- **Indeks:** `idx_research_subj_group` ON `(group_name)`.
- **Verifikasi Data S-001 & S-002:**
  - `S-001`: Kelompok Pembelajaran Tatap Muka Langsung (Control Group).
  - `S-002`: Kelompok Pembelajaran Berbantuan NUMORA Space (Experimental Group).
  - Kedua subjek tersimpan aman tanpa tercampur data pengujian internal.

#### `research_sessions`
- **PK:** `session_id` (TEXT)
- **FK:** `subject_id` REFERENCES `research_subjects(subject_id)` ON DELETE RESTRICT (Data sesi penelitian terlindungi dari penghapusan subjek secara tidak sengaja).
- **Kolom:** `session_date`, `module_id`, `concept_studied`, `duration_minutes`, `hints_used`, `misconceptions_detected`, `researcher_notes`, `verified_by_researcher`, `created_at`.
- **Indeks:** `idx_research_sess_subj_date` ON `(subject_id, session_date)`.

#### `research_cognitive_load_records`
- **PK:** `record_id` (TEXT)
- **FK 1:** `subject_id` REFERENCES `research_subjects(subject_id)` ON DELETE RESTRICT.
- **FK 2:** `session_id` REFERENCES `research_sessions(session_id)` ON DELETE SET NULL.
- **Kolom:** `framework_name`, `intrinsic_load`, `extraneous_load`, `germane_load`, `instrument_status`, `measured_at`.
- **Indeks:** `idx_cog_load_subj` ON `(subject_id)`.
- **Hasil:** **PASS**

---

## 4. Rekonsiliasi Perbedaan Nama Backup Pre-Phase 1

Pada tahap eksekusi Phase 1, ditemukan dua file backup dengan prefix `security_store_backup_pre_phase1`:

```
backend/app/data/backups/
├── security_store_backup_pre_phase1_20261123_094017.db  (36,864 bytes)
└── security_store_backup_pre_phase1_20261123_094045.db  (151,552 bytes)
```

### Investigasi & Rekonsiliasi Rinci:
1. **`security_store_backup_pre_phase1_20261123_094017.db` (Pukul 09:40:17 UTC):**
   - **Ukuran:** 36,864 bytes.
   - **Jumlah Tabel:** Tepat 3 tabel (`users`: 4 baris, `revoked_tokens`: 14 baris, `login_rate_limits`: 6 baris).
   - **Konteks Pembuatan:** Dihasilkan secara otomatis oleh `phase1_schema_migration.py` pada saat pertama kali dieksekusi, **tepat sebelum pernyataan DDL migrasi pertama dijalankan**.
   - **Status:** Ini adalah **True Pre-Migration Snapshot** murni yang identik dengan status database Phase 0.
   - **Integritas:** `PRAGMA integrity_check` = `ok`.

2. **`security_store_backup_pre_phase1_20261123_094045.db` (Pukul 09:40:45 UTC):**
   - **Ukuran:** 151,552 bytes.
   - **Jumlah Tabel:** 12 tabel lengkap.
   - **Konteks Pembuatan:** Pada eksekusi pertama (09:40:17), seluruh skema 9 tabel baru telah selesai dibuat ke disk. Namun, skrip mengalami error pada tahap commit catatan versi migrasi (`OperationalError: cannot commit - no transaction is active` karena DDL di SQLite secara default auto-commit). Setelah penyesuaian transaksi dilakukan dan skrip dijalankan ulang (rerun) pada 09:40:45, fungsi backup awal dijalankan kembali sebelum melanjutkan eksekusi. Karena tabel telah terbuat pada percobaan pertama, snapshot pada 09:40:45 mencakup ke-12 tabel tersebut.
   - **Status:** Ini adalah **Pre-Rerun Verification Snapshot** yang mencerminkan status database sebelum pencatatan baris migrasi ke `schema_migrations`.
   - **Integritas:** `PRAGMA integrity_check` = `ok`.

### Kesimpulan Rekonsiliasi Backup:
Kedua file backup bersifat valid, konsisten, dan memiliki integritas sempurna (`ok`). Keduanya **harus tetap dipertahankan** di direktori backup tanpa dihapus, dengan dokumentasi yang jelas bahwa:
- `_094017.db` adalah titik pemulihan jika ingin kembali ke kondisi murni sebelum migrasi Phase 1.
- `_094045.db` adalah checkpoint transisi saat penyelesaian skrip migrasi.

---

## 5. Pemeriksaan Integritas & Perlindungan Akun

Pemeriksaan status database aktif (`backend/app/data/security_store.db`):
- **PRAGMA integrity_check:** `ok`
- **PRAGMA foreign_key_check:** 0 pelanggaran (Clean)
- **Akun Pengguna:** 4 akun eksisting lengkap dan tidak mengalami mutasi:
  - `siswa.demo@numora.space` (Role: `student`, Subject: `S-002`)
  - `peneliti.demo@numora.space` (Role: `researcher`, Subject: `P-001`)
  - Akun Pengguna 3 (Role: `student`, Subject: `S-001`)
  - Akun Pengguna 4 (Role: `student`, Subject: `S-003`)
- Tidak ada password hash, refresh token, atau data sensitif yang diekspos dalam proses rekonsiliasi ini.

---

## 6. Kesimpulan & Status Kesiapan

| Komponen Audit | Hasil Evaluasi |
|:---|:---:|
| Kesesuaian 9 Tabel Baru dengan Dokumen Desain | **PASS** (100% Cocok) |
| Integritas Tipe Data, Default Value, dan Constraint | **PASS** (Valid) |
| Relasi Foreign Key & Action Rules (`CASCADE`/`RESTRICT`/`SET NULL`) | **PASS** (Tepat) |
| Indeks Sekunder Penunjang Query Performance | **PASS** (Lengkap) |
| Arsitektur Inkremental Delta & High Score MAX (Runner Stats) | **PASS** (Didukung Penuh) |
| Penyimpanan Permanen Seluruh Sesi (Runner Sessions) | **PASS** (Append-Only) |
| Perlindungan Idempotensi Evaluasi Belajar | **PASS** (Unique Per User) |
| Perlindungan dan Isolasi Subjek Penelitian S-001 & S-002 | **PASS** (Terjamin) |
| Rekonsiliasi Backup Ganda Pre-Phase 1 | **PASS** (Terdokumentasi Lengkap) |
| Keutuhan Akun & Data Eksisting | **PASS** (Tanpa Efek Samping) |

**Status Akhir:** **READY FOR PHASE 2 (PERSISTENT DATA REPOSITORIES & APIS)**  
*Catatan: Sesuai batasan operasional, Phase 2 TIDAK DIMULAI sampai adanya instruksi spesifik dari pengguna.*
