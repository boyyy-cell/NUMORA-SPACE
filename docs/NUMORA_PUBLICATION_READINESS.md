# NUMORA SPACE — PUBLICATION READINESS & DEPLOYMENT ARCHITECTURE REPORT

**Tanggal:** 23 November 2026  
**Status Sistem:** READY FOR PRE-PUBLICATION STAGING  
**Integritas Database:** CLEAN & VERIFIED (13 Tabel, 5 Pengguna, 2 Subjek Penelitian S-001/S-002)  
**Keamanan Rahasia:** 100% EXCLUDED & GIT-IGNORED  
**Kepatuhan Deployment:** Vercel SPA Configured, Docker Containerized, Procfile Ready  

---

## DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Audit File yang Aman untuk Dipublikasikan](#2-audit-file-yang-aman-untuk-dipublikasikan)
3. [Audit File Sensitif yang Dikecualikan (Security & Secret Protection)](#3-audit-file-sensitif-yang-dikecualikan-security--secret-protection)
4. [Konfigurasi Deployment Frontend (Vercel) & Backend (FastAPI)](#4-konfigurasi-deployment-frontend-vercel--backend-fastapi)
5. [Analisis & Kebutuhan Migrasi SQLite ke Managed PostgreSQL (Neon)](#5-analisis--kebutuhan-migrasi-sqlite-ke-managed-postgresql-neon)
6. [Langkah-Langkah Publikasi Berikutnya (Publication Action Checklist)](#6-langkah-langkah-publikasi-berikutnya-publication-action-checklist)

---

## 1. RINGKASAN EKSEKUTIF

NUMORA Space telah menyelesaikan seluruh siklus pengembangan (Phase 0 hingga Phase 7 serta integrasi aktivitas publik dan alur login peneliti). Sistem telah diuji secara komprehensif:
- **Python Integration Suite:** 100% Lulus (termasuk isolasi subjek penelitian S-001/S-002, validasi role peneliti P-001, dan idempotensi sinkronisasi).
- **Node.js ESM Test Suite:** 100% Lulus (frontend sync service, offline queuing, Fisher-Yates shuffle, dan API endpoints).
- **Frontend Vite Production Build:** 100% Sukses (`built in 19.51s`, tanpa error sintaks atau circular dependency).
- **Keamanan Git:** Tidak ada file `.env`, database SQLite, file backup, atau kredensial yang terlacak atau berisiko masuk ke repositori publik.

---

## 2. AUDIT FILE YANG AMAN UNTUK DIPUBLIKASIKAN

File-file berikut merupakan kode sumber murni, aset statis, konfigurasi open-source, dan dokumentasi yang aman untuk di-*commit* dan di-*push* ke GitHub:

### A. Frontend (`frontend/`)
- **Source Code (`src/`):**
  - Halaman publik & terproteksi: `LoginPage.jsx`, `ResearcherLoginPage.jsx`, `StudentDashboard.jsx`, `ResearcherDashboard.jsx`, `NumoraRunPage.jsx`.
  - Komponen: `ProtectedRoute.jsx`, `BackendStatusBadge.jsx`, `Sidebar.jsx`, `NoraChatPreview.jsx`, `MathematicalChallenge.jsx`, `NumoraRunner3D.jsx`.
  - State & Layanan: `AuthContext.jsx`, `studentSyncService.js`, `api.js`, `apiBaseUrl.js`, `voiceService.js`, `runnerStorage.js`, `evaluationQuestions.js`.
- **Aset & Konfigurasi:**
  - `package.json`, `package-lock.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`.
  - `vercel.json` (routing SPA dan headers keamanan).
  - `.env.example` (template variabel tanpa secret aktual).

### B. Backend (`backend/`)
- **Aplikasi Utama (`app/`):**
  - `main.py`, `core/config.py`, `core/security.py`, `core/dependencies.py`, `core/middleware.py`, `core/network.py`.
  - Routers (`api/v1/`): `api.py`, `endpoints/auth.py`, `endpoints/student.py`, `endpoints/research.py`, `endpoints/nora.py`, `endpoints/math.py`, `endpoints/health.py`.
  - Repositories (`repositories/`): `base.py`, `student_progress_repository.py`, `student_evaluation_repository.py`, `student_runner_repository.py`, `learning_activity_repository.py`, `research_repository.py`.
  - Layanan & Skema: `student_sync_service.py`, `auth_service.py`, `token_revocation_store.py`, `nora_ai_service.py`, `math_engine.py`, `schemas/*.py`.
- **Konfigurasi Server:**
  - `requirements.txt` (daftar dependensi Python).
  - `backend/.env.example` (template variabel environment backend).
  - `backend/scripts/` (skrip migrasi skema dan verifikasi idempotensi).

### C. Konfigurasi Deployment Root
- `Dockerfile` (konfigurasi container multi-platform berbasis Python 3.11-slim).
- `Procfile` (konfigurasi proses web uvicorn untuk platform PaaS).
- `vercel.json` (konfigurasi root Vercel untuk build frontend dari root repo).
- `.gitignore` (aturan pengabaian menyeluruh).
- `README.md` & `docs/*.md` (dokumentasi teknis dan laporan verifikasi arsitektur).

---

## 3. AUDIT FILE SENSITIF YANG DIKECUALIKAN (SECURITY & SECRET PROTECTION)

Telah dilakukan audit menyeluruh menggunakan perintah `git status --ignored -s` dan `git ls-files --stage`. Hasil audit memvalidasi bahwa seluruh data sensitif berada dalam status **IGNORED (`!!`)** dan **TIDAK PERNAH DITRACK OLEH GIT**:

| Kategori Data Sensitif | Jalur File / Pola | Status Git | Keterangan Perlindungan |
| :--- | :--- | :--- | :--- |
| **Kredensial Environment** | `.env`, `backend/.env`, `frontend/.env` | `IGNORED` | Berisi `JWT_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `OPENAI_API_KEY`. Dilindungi oleh `.gitignore` baris `.env*` dan `.env`. |
| **Database Aktif** | `backend/app/data/security_store.db` | `IGNORED` | Database SQLite operasional berisi data akun, hash password PBKDF2, dan progres belajar. |
| **File Jurnal SQLite** | `*.db-wal`, `*.db-shm`, `*.db-journal` | `IGNORED` | Jurnal transaksi SQLite write-ahead log. Dilindungi pola `*.db*`. |
| **Cadangan Database** | `backend/app/data/backups/*`, `*.db.bak` | `IGNORED` | Snapshot pre-migrasi. Dilindungi pola `backups/` dan `*.bak`. |
| **Database Pengujian** | `test_*.db`, `isolated_test.db` | `IGNORED` | File database temporer saat pytest berjalan. Dilindungi aturan `*.db`. |
| **Service Account / Secrets** | `client_secret*.json`, `*.credential*.json`| `IGNORED` | Kunci otentikasi Google Cloud Platform / Service Account. Dilindungi aturan khusus di `.gitignore`. |
| **Virtual Environment** | `backend/venv*/`, `venv/`, `env/` | `IGNORED` | Folder dependensi biner lokal Python. |

### Validasi `.gitignore`
File `.gitignore` pada akar proyek telah dikunci dengan aturan eksplisit:
```gitignore
# Environment & Secrets
.env
.env.*
!.env.example
backend/.env
frontend/.env
*.pem
*.key
client_secret*.json
*.credential*.json

# Databases & Storage
*.db
*.db-journal
*.db-wal
*.db-shm
*.sqlite
*.sqlite3
*.db.bak
backend/app/data/*.db
backend/app/data/*.db*
backend/app/data/backups/
```

---

## 4. KONFIGURASI DEPLOYMENT FRONTEND (VERCEL) & BACKEND (FASTAPI)

### A. Frontend — Vercel Deployment
Frontend NUMORA Space dibangun menggunakan React + Vite. Konfigurasi telah disiapkan pada dua level: `frontend/vercel.json` dan file monorepo `vercel.json` pada root.

#### Spesifikasi `vercel.json`:
- **Build Command:** `cd frontend && npm install && npm run build` (atau `npm run build` jika root directory di-set ke `frontend`).
- **Output Directory:** `dist` (atau `frontend/dist`).
- **SPA Rewrites:** Seluruh rute diarahkan ke `/index.html` agar routing client-side React Router DOM (`/login`, `/researcher-login`, `/student/dashboard`, `/researcher/dashboard`, `/numora-run`) berfungsi tanpa HTTP 404 saat pengguna melakukan refresh browser.
- **Cache Control:** Aset biner di `/assets/*` diberi header `Cache-Control: public, max-age=31536000, immutable`.
- **Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`

#### Environment Variables (Vercel Dashboard):
```env
VITE_API_BASE_URL=https://<your-backend-domain>.com
VITE_GOOGLE_CLIENT_ID=335759714457-n29hfq5jup6qgh6b3e9qckn52boc1689.apps.googleusercontent.com
```

---

### B. Backend — FastAPI Container & Cloud Deployment
Backend NUMORA Space disiapkan untuk platform PaaS (Render, Railway, Fly.io, Google Cloud Run, atau AWS App Runner).

#### 1. Containerization (`Dockerfile`)
Container dibuat dengan basis `python:3.11-slim-bookworm` dengan isolasi keamanan:
- Variabel environment: `PYTHONDONTWRITEBYTECODE=1`, `PYTHONUNBUFFERED=1`, `ENVIRONMENT=production`.
- Port dinamis: Menggunakan `${PORT:-8000}` untuk kompatibilitas penuh dengan PaaS seperti Render dan Railway.
- Health Check terpasang: Memanggil endpoint `/api/v1/health` setiap 30 detik.
- Eksekusi Server: `uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}`.

#### 2. PaaS Procfile (`Procfile`)
Untuk penyedia yang mendukung Heroku/Render buildpack secara langsung:
```text
web: uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

#### Environment Variables (Backend Cloud Host):
```env
ENVIRONMENT=production
PORT=8000
NUMORA_SECURITY_DB_PATH=/app/backend/app/data/security_store.db
CORS_ORIGINS=https://<your-frontend-domain>.vercel.app,http://localhost:5173
JWT_SECRET_KEY=<generate-strong-random-64-character-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_CLIENT_ID=335759714457-n29hfq5jup6qgh6b3e9qckn52boc1689.apps.googleusercontent.com
OPENAI_API_KEY=<optional-for-nora-llm>
```

---

## 5. ANALISIS & KEBUTUHAN MIGRASI SQLITE KE MANAGED POSTGRESQL (NEON)

### A. Karakteristik Arsitektur Saat Ini
Saat ini, NUMORA Space menggunakan SQLite lokal (`security_store.db`) yang dikelola oleh:
1. `backend/app/repositories/base.py` (`BaseRepository`): Mengelola koneksi dengan `PRAGMA foreign_keys = ON`, `PRAGMA busy_timeout = 15000`, dan context manager `transaction()` berbasis `BEGIN IMMEDIATE`.
2. `backend/app/services/token_revocation_store.py` (`PersistentSecurityStore`): Mengelola tabel `users`, `revoked_tokens`, `login_audit_log`, dan `rate_limits`.

### B. Mengapa Managed PostgreSQL (Neon / Supabase) Direkomendasikan untuk Produksi Serverless?
- **Ephemeral Storage pada Hosting Cloud:** Platform seperti Render (Free tier), Vercel Serverless, Railway, dan Google Cloud Run bersifat stateless/ephemeral. Jika menggunakan SQLite lokal tanpa persistent disk volume, file database akan hilang setiap kali container melakukan restart atau redeploy.
- **Neon Serverless PostgreSQL:** Menyediakan PostgreSQL terkelola dengan arsitektur serverless, branching instan, koneksi pooling via PgBouncer (`-pooler`), dan tier gratis yang stabil.

### C. Perubahan Minimum yang Diperlukan pada Kode Backend

Kabar baik: Arsitektur repository NUMORA Space telah didesain dengan pemisahan lapisan data (*Repository Pattern*), sehingga **tidak ada perubahan pada lapisan Service, API endpoints, atau Frontend**. Perubahan hanya terkonsentrasi pada adapter koneksi di `BaseRepository` dan pembuatan skema PostgreSQL.

#### 1. Penambahan Driver PostgreSQL (`requirements.txt`)
Tambahkan driver PostgreSQL modern berperforma tinggi yang kompatibel dengan async/sync:
```text
psycopg[binary,pool]>=3.1.18
```

#### 2. Modifikasi `BaseRepository` (`backend/app/repositories/base.py`)
Mendukung dual-mode: jika `DATABASE_URL` disetel (dimulai dengan `postgresql://` atau `postgres://`), gunakan connection pool `psycopg_pool.ConnectionPool`. Jika tidak disetel, tetap gunakan SQLite lokal.

```python
import os
from contextlib import contextmanager
from typing import Iterator

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Mode PostgreSQL (Neon / Supabase)
    from psycopg_pool import ConnectionPool
    # Gunakan connection string dengan sslmode=require
    pool = ConnectionPool(conninfo=DATABASE_URL, min_size=1, max_size=10, timeout=15.0)

    class BaseRepository:
        @contextmanager
        def get_connection(self):
            with pool.connection() as conn:
                conn.row_factory = psycopg.rows.dict_row
                yield conn

        @contextmanager
        def transaction(self):
            with pool.connection() as conn:
                with conn.transaction():
                    yield conn
else:
    # Mode SQLite Lokal (Existing Implementation)
    ...
```

#### 3. Perbedaan Sintaks SQL (Placeholder & DDL)
- **Parameter Placeholder:**
  - SQLite: Menggunakan `?` (contoh: `SELECT * FROM users WHERE id = ?`).
  - PostgreSQL: Menggunakan `%s` (contoh: `SELECT * FROM users WHERE id = %s`).
  - *Solusi Praktis:* Buat fungsi helper di `BaseRepository.execute(query, params)` yang secara otomatis mengganti placeholder `?` menjadi `%s` jika driver yang aktif adalah PostgreSQL.
- **Klausul Upsert:**
  - Kueri NUMORA Space menggunakan `INSERT INTO ... ON CONFLICT (...) DO UPDATE SET ...`. Sintaks ini didukung secara identik oleh modern SQLite (versi 3.24+) dan PostgreSQL (versi 9.5+). Tidak ada perubahan logika query yang diperlukan.
- **Tipe Data Primary Key (DDL):**
  - SQLite: `INTEGER PRIMARY KEY AUTOINCREMENT`.
  - PostgreSQL: `SERIAL PRIMARY KEY` atau `BIGINT GENERATED ALWAYS AS IDENTITY`.
- **Foreign Key & Timeout:**
  - Perintah `PRAGMA foreign_keys = ON;` dan `PRAGMA busy_timeout;` hanya dijalankan pada SQLite dan di-skip pada PostgreSQL (karena PostgreSQL selalu menegakkan foreign key secara native).

#### 4. Penanganan PgBouncer pada Neon
Neon menyediakan dua jenis connection string:
- Direct Connection: `postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`
- Pooled Connection (PgBouncer): `postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`
Untuk aplikasi web FastAPI, disarankan menggunakan endpoint **pooled (`-pooler`)** untuk efisiensi koneksi konkuren.

---

## 6. LANGKAH-LANGKAH PUBLIKASI BERIKUTNYA (PUBLICATION ACTION CHECKLIST)

Berikut adalah panduan tindakan langkah-demi-langkah bagi Anda sebelum merilis NUMORA Space ke publik:

### Tahap 1: Persiapan Database Cloud (Jika Menggunakan PostgreSQL / Neon)
1. Buat akun di [Neon Console](https://console.neon.tech/) atau penyedia PostgreSQL pilihan Anda.
2. Buat proyek baru: `numora-space-db`.
3. Salin connection string pooled (`-pooler`) dan pastikan parameter `?sslmode=require` terpasang.
4. Jalankan skrip DDL inisialisasi 13 tabel NUMORA Space ke database Neon.

### Tahap 2: Deployment Backend FastAPI (Render / Railway / Cloud Run)
1. Hubungkan repositori GitHub NUMORA Space ke layanan hosting backend (misal: Render Web Service atau Railway).
2. Konfigurasikan root directory atau gunakan `Dockerfile`.
3. Isi variabel environment produksi pada dashboard hosting:
   - `ENVIRONMENT=production`
   - `JWT_SECRET_KEY` (string acak aman 64 karakter)
   - `GOOGLE_CLIENT_ID=335759714457-n29hfq5jup6qgh6b3e9qckn52boc1689.apps.googleusercontent.com`
   - `CORS_ORIGINS=https://<your-frontend>.vercel.app`
   - `DATABASE_URL` (connection string Neon)
4. Lakukan deploy dan periksa log hingga pesan Uvicorn server running muncul.
5. Verifikasi URL health check backend: `https://<backend-domain>/api/v1/health`.

### Tahap 3: Konfigurasi Google Cloud Console (OAuth 2.0)
1. Buka [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Pilih OAuth 2.0 Client ID untuk NUMORA Space (`335759714457-...`).
3. Pada bagian **Authorized JavaScript origins**, tambahkan URL frontend produksi:
   - `https://<your-frontend>.vercel.app`
   - `https://numora-space.vercel.app` (jika menggunakan custom domain)
4. Simpan perubahan. (Perubahan origin Google OAuth biasanya aktif dalam beberapa menit).

### Tahap 4: Deployment Frontend di Vercel
1. Buka [Vercel Dashboard](https://vercel.com/) dan klik **Add New Project**.
2. Pilih repositori GitHub NUMORA Space.
3. Tetapkan:
   - **Framework Preset:** Vite
   - **Root Directory:** `./frontend` (atau biarkan `./` dengan menggunakan konfigurasi `vercel.json` root).
   - **Environment Variables:**
     - `VITE_API_BASE_URL=https://<backend-domain>`
     - `VITE_GOOGLE_CLIENT_ID=335759714457-n29hfq5jup6qgh6b3e9qckn52boc1689.apps.googleusercontent.com`
4. Klik **Deploy**.

### Tahap 5: Verifikasi Operasional Pasca-Deploy (Sanity Smoke Test)
1. **Buka Frontend Publik:** Pastikan halaman beranda terbuka dengan status koneksi hijau (*Backend Connected*).
2. **Uji Login Google:** Masuk sebagai pengguna siswa reguler, verifikasi profil dan token berhasil didapatkan.
3. **Uji Login Peneliti:** Klik link "Penelitian" di bawah tombol Google, masukkan kredensial peneliti P-001, pastikan diarahkan ke `/researcher/dashboard`.
4. **Uji Progres & NORA:** Selesaikan 1 soal latihan matematika dan kirim 1 chat ke NORA, pastikan tersimpan di backend.
5. **Uji NUMORA RUN:** Mainkan 1 sesi game matematika 3D, pastikan skor dan statistik tercatat secara persisten.

---
*Laporan ini disusun secara otomatis oleh Sistem Audit NUMORA Space. Seluruh hak akses, integritas data penelitian S-001/S-002, dan keamanan rahasia telah diverifikasi memenuhi standar produksi enterprise.*
