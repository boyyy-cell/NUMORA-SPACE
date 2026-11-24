# NUMORA SPACE — LAPORAN IMPLEMENTASI PHASE 1
## Additive Database Schema Migration, Idempotency Verification & Data Preservation Report

**Tanggal Eksekusi:** 23 November 2026  
**Fase:** PHASE 1 — ADDITIVE DATABASE SCHEMA MIGRATION  
**Status Evaluasi:** SELESAI, 100% IDEMPOTEN & TERVERIFIKASI  
**Database Aktif:** `backend/app/data/security_store.db`  
**Konfigurasi SQLite:** `journal_mode = WAL`, `foreign_keys = ON`, `busy_timeout = 15000`  

---

## 1. RINGKASAN EKSEKUSI PRA-MIGRASI & CADANGAN DATABASE

Sebelum struktur database dimodifikasi, seluruh pengamanan data dijalankan secara ketat:

1. **Verifikasi Keberadaan & Integritas Backup Phase 0:**
   - Berkas: `backend/app/data/backups/security_store_backup_20261123_092957.db`
   - Status Integritas: `PRAGMA integrity_check` $\rightarrow$ **`ok`**
   - Hasil: Backup Phase 0 dipastikan utuh dan tidak disentuh.
2. **Pemeriksaan Kesehatan Database Asli Sebelum Migrasi:**
   - Status Integritas Awal: `PRAGMA integrity_check` $\rightarrow$ **`ok`**
   - Jumlah Akun Awal: 4 akun terdaftar.
3. **Pembuatan Backup Tambahan Pre-Phase 1:**
   - Dibuat menggunakan SQLite Online Backup API (`sqlite3.backup`).
   - Berkas: `backend/app/data/backups/security_store_backup_pre_phase1_20261123_094045.db`
   - Ukuran: 36.864 bytes.
   - Status Integritas: `PRAGMA integrity_check` $\rightarrow$ **`ok`**

---

## 2. SPESIFIKASI SKEMA TABEL BARU YANG DITERAPKAN (ADDITIVE & IDEMPOTENT)

Migrasi dijalankan menggunakan transaksi atomik (`BEGIN IMMEDIATE ... COMMIT`) dan mencatat versi di tabel `schema_migrations` (Versi 1: `v1_persistent_storage_foundation`).

Tidak ada tabel lama yang di-DROP, di-DELETE, atau di-ALTER. Seluruh tabel baru ditambahkan secara aditif:

```mermaid
erDiagram
    USERS ||--o{ STUDENT_MODULE_PROGRESS : "has"
    USERS ||--o{ STUDENT_EVALUATIONS : "takes"
    USERS ||--o{ STUDENT_RUNNER_STATS : "owns"
    USERS ||--o{ STUDENT_RUNNER_SESSIONS : "records"
    USERS ||--o{ LEARNING_ACTIVITIES : "generates"
    RESEARCH_SUBJECTS ||--o{ RESEARCH_SESSIONS : "participates_in"
    RESEARCH_SUBJECTS ||--o{ RESEARCH_COGNITIVE_LOAD_RECORDS : "evaluates"

    USERS {
        TEXT email PK
        TEXT hashed_password
        TEXT role
        TEXT name
        TEXT subject_id
        TEXT grade
        TEXT description
        TEXT auth_provider
        INTEGER created_at
        INTEGER is_provisioned_researcher
    }

    STUDENT_MODULE_PROGRESS {
        INTEGER id PK
        TEXT user_email FK
        TEXT module_id
        TEXT status
        INTEGER slider_explored
        INTEGER time_spent_seconds
        INTEGER completed_at
        INTEGER updated_at
    }

    STUDENT_EVALUATIONS {
        TEXT evaluation_id PK
        TEXT idempotency_key UQ
        TEXT user_email FK
        INTEGER attempt_number
        REAL score
        REAL accuracy
        INTEGER total_questions
        INTEGER correct_count
        INTEGER wrong_count
        TEXT category_breakdown
        TEXT detailed_answers
        INTEGER completed_at
    }

    STUDENT_RUNNER_STATS {
        TEXT user_email PK, FK
        INTEGER high_score_beginner
        INTEGER high_score_intermediate
        INTEGER high_score_advanced
        INTEGER high_score_expert
        INTEGER total_games
        INTEGER total_coins
        INTEGER total_distance
        INTEGER total_math_answered
        INTEGER total_math_correct
        INTEGER updated_at
    }

    STUDENT_RUNNER_SESSIONS {
        TEXT session_id PK
        TEXT idempotency_key UQ
        TEXT user_email FK
        TEXT level
        INTEGER score
        INTEGER coins
        INTEGER distance
        INTEGER answered
        INTEGER correct
        REAL accuracy
        INTEGER mistakes_count
        INTEGER created_at
    }

    LEARNING_ACTIVITIES {
        TEXT activity_id PK
        TEXT user_email FK
        TEXT activity_type
        TEXT module_or_feature_id
        TEXT metadata_json
        INTEGER created_at
    }

    RESEARCH_SUBJECTS {
        TEXT subject_id PK
        TEXT group_name
        TEXT role_description
        TEXT grade
        TEXT active_module
        TEXT pretest_status
        REAL pretest_score
        TEXT posttest_status
        REAL posttest_score
        TEXT cognitive_load_status
        INTEGER total_sessions_logged
        TEXT protocol_category
        INTEGER created_at
        INTEGER updated_at
    }

    RESEARCH_SESSIONS {
        TEXT session_id PK
        TEXT subject_id FK
        TEXT session_date
        TEXT module_id
        TEXT concept_studied
        REAL duration_minutes
        INTEGER hints_used
        TEXT misconceptions_detected
        TEXT researcher_notes
        INTEGER verified_by_researcher
        INTEGER created_at
    }

    RESEARCH_COGNITIVE_LOAD_RECORDS {
        TEXT record_id PK
        TEXT subject_id FK
        TEXT session_id FK
        TEXT framework_name
        REAL intrinsic_load
        REAL extraneous_load
        REAL germane_load
        TEXT instrument_status
        INTEGER measured_at
    }
```

### Rincian Tabel Baru yang Diterapkan:
1. **`schema_migrations`**: Pencatatan versi migrasi basis data (`version: 1`, `name: v1_persistent_storage_foundation`).
2. **`student_module_progress`**: Progres 4 modul aljabar dengan constraint `UNIQUE(user_email, module_id)` dan foreign key ke `users(email) ON DELETE CASCADE`.
3. **`student_evaluations`**: Hasil pengerjaan kuis evaluasi 10 soal dengan prinsip **Append-Only History** dan constraint `UNIQUE(user_email, idempotency_key)` untuk mencegah duplikasi submission.
4. **`student_runner_stats`**: Agregat statistik dan rekor tertinggi game NUMORA RUN per `user_email`.
5. **`student_runner_sessions`**: Log longitudinal seluruh sesi permainan lari siswa (tanpa batasan 10 sesi) dengan constraint `UNIQUE(user_email, idempotency_key)`.
6. **`learning_activities`**: Log aktivitas belajar siswa (buka modul, interaksi slider, ganti mode lab, tanya NORA).
7. **`research_subjects`**: Data persisten peserta penelitian resmi (diinisialisasi dengan subjek resmi S-001 dan S-002).
8. **`research_sessions`**: Log sesi penelitian terverifikasi dengan foreign key ke `research_subjects(subject_id) ON DELETE RESTRICT`.
9. **`research_cognitive_load_records`**: Rekam jejak pengukuran beban kognitif Leppink (0–10) yang terhubung ke subjek dan sesi riset.

---

## 3. HASIL PENGUJIAN & VERIFIKASI INTEGRITAS

Pengujian dijalankan melalui dua skrip: `backend/scripts/phase1_schema_migration.py` dan suite otomatis `tests/test_phase1_database_migration.py` (7/7 Ujian Lulus, 100% Pass).

### A. Uji Idempotensi Migrasi (Eksekusi Berulang)
- **Migrasi Pertama:** Mengembalikan `{'status': 'SUCCESS', 'version': 1, 'name': 'v1_persistent_storage_foundation'}`.
- **Migrasi Kedua (Eksekusi Ulang):** Mengembalikan `{'status': 'ALREADY_APPLIED', 'version': 1, 'name': 'v1_persistent_storage_foundation'}`.
- **Hasil:** Skema tidak terduplikasi, tidak ada error SQL, dan versioning bekerja sempurna.

### B. Daftar Seluruh Tabel Pasca-Migrasi (12 Tabel)
Semua tabel terdaftar secara valid dalam katalog database:

| No | Nama Tabel | Jumlah Baris Saat Ini | Kategori Skema |
| :---: | :--- | :---: | :--- |
| 1 | `users` | **4** | Tabel Keamanan (Dipertahankan) |
| 2 | `revoked_tokens` | **14** | Tabel Keamanan (Dipertahankan) |
| 3 | `login_rate_limits` | **6** | Tabel Keamanan (Dipertahankan) |
| 4 | `schema_migrations` | **1** | Tabel Tata Kelola Skema (Baru) |
| 5 | `student_module_progress` | **0** | Progres Belajar Siswa (Baru) |
| 6 | `student_evaluations` | **0** | Hasil Evaluasi Append-Only (Baru) |
| 7 | `student_runner_stats` | **0** | Statistik Game Runner Siswa (Baru) |
| 8 | `student_runner_sessions` | **0** | Riwayat Sesi Lari Siswa (Baru) |
| 9 | `learning_activities` | **0** | Riwayat Aktivitas Belajar (Baru) |
| 10 | `research_subjects` | **2** | Peserta Riset S-001 & S-002 (Baru & Di-seed) |
| 11 | `research_sessions` | **0** | Sesi Penelitian Terverifikasi (Baru) |
| 12 | `research_cognitive_load_records` | **0** | Pengukuran Beban Kognitif (Baru) |

### C. Uji Penegakan Foreign Key & Unique Constraints
1. **Foreign Key Enforcement:**
   - Percobaan menyisipkan modul progress dengan email yang tidak terdaftar (`email.tidak.ada@domain.invalid`) $\rightarrow$ **Ditolak seketika oleh `sqlite3.IntegrityError` (FOREIGN KEY constraint failed).**
2. **Unique Idempotency Key Enforcement:**
   - Percobaan menyisipkan evaluasi dengan `idempotency_key` yang sama dua kali pada pengguna yang sama $\rightarrow$ **Ditolak seketika oleh `sqlite3.IntegrityError` (UNIQUE constraint failed: student_evaluations.user_email, student_evaluations.idempotency_key).**

### D. Uji Konfigurasi SQLite Runtime
- `PRAGMA journal_mode` $\rightarrow$ **`wal`** (Write-Ahead Logging aktif untuk pembacaan simultan).
- `PRAGMA foreign_keys` $\rightarrow$ **`1`** (Aktif di setiap koneksi database via `PersistentSecurityStore._get_connection`).
- `PRAGMA busy_timeout` $\rightarrow$ **`15000`** (Toleransi lock 15 detik).
- `PRAGMA integrity_check` $\rightarrow$ **`ok`** (Database sehat tanpa anomali).

---

## 4. PRESERVASI AKUN LAMA & SUBJEK PENELITIAN RESMI

Pemeriksaan data menunjukkan bahwa data lama terjaga 100% tanpa ada perubahan data identitas:

### A. Empat Akun Asli Terdaftar (Preserved Baseline)
1. **`siswa.demo@numora.space`** $\rightarrow$ Role: `student` | Subject ID: **`S-002`** (Kelompok Eksperimen NUMORA Space).
2. **`peneliti.demo@numora.space`** $\rightarrow$ Role: `researcher` | Subject ID: **`P-001`** (Peneliti Utama, Provisioned).
3. **`faridsyahputra53@gmail.com`** $\rightarrow$ Role: `student` | Subject ID: `U-77E16F4FF0862A46` (Siswa Publik).
4. **`popolkupa123@gmail.com`** $\rightarrow$ Role: `student` | Subject ID: `U-343606ACF22D8FE4` (Siswa Publik).

### B. Dua Subjek Penelitian Resmi (`research_subjects`)
1. **`S-001`**: Group: `Control (Tatap Muka Langsung bersama Peneliti)` | Active Module: `Modul 02: Understanding Coefficients` | Status Pretest/Posttest: `Scheduled` | Category: `PROTOCOL_TEMPLATE`.
2. **`S-002`**: Group: `Experimental (Pembelajaran Berbantuan NUMORA Space)` | Active Module: `Modul 02: Understanding Coefficients` | Status Pretest/Posttest: `Scheduled` | Category: `PROTOCOL_TEMPLATE`.

---

## 5. HASIL REGRESI SUITE PENUH PASCA-MIGRASI

Setelah migrasi skema diterapkan, seluruh rangkaian pengujian sistem dijalankan kembali:
- **`pytest tests/test_phase1_database_migration.py`:** **7/7 PASSED (100%)**
- **`tests/test_live_e2e_endpoints.py` (Live HTTP Port 8000):** **23/23 PASSED (100%)**
- **`node tests/test_login_auth_suite.js`:** **23/23 PASSED (100%)**
- **`node tests/test_final_verification.js`:** **36/36 PASSED (100%)**

Backend yang sedang berjalan terus melayani request HTTP 200 tanpa hambatan (*zero downtime*).

---

## 6. KESIMPULAN

> **PHASE 1 (ADDITIVE DATABASE SCHEMA MIGRATION) TELAH SELESAI SECARA SEMPURNA.**  
> Seluruh 8 tabel baru beserta tabel versioning telah aktif di SQLite dalam mode WAL, integritas data lama terjaga 100%, foreign key dan idempotency key terbukti bekerja, dan kedua backup (Phase 0 dan Pre-Phase 1) aman tersimpan.

*Sesuai batasan, Phase 2 belum dimulai. Tidak ada endpoint API baru yang dibuat, tidak ada kode frontend yang diubah, dan tidak ada commit, push, maupun deploy.*
