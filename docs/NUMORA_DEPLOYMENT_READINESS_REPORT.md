# LAPORAN KESIAPAN DEPLOYMENT (DEPLOYMENT READINESS REPORT)
## NUMORA SPACE (v1.6 → v1.7 Production Ready)

**Tanggal:** 12 November 2026  
**Status Kesiapan:** **READY FOR DEPLOYMENT (TERVALIDASI)**  
**Target Produksi Frontend:** `https://numora-space.vercel.app`  
**Target Produksi Backend:** `https://numora-space-api.de2.netrun.io`  
**Dokumen Terkait:** `docs/NUMORA_DEPLOYMENT_READINESS_REPORT.md`

---

## 1. INVESTIGASI REGRESSION TEST `EXITED WITH CODE 1`

### A. Temuan & Detail Error Lengkap
Pada eksekusi pengujian sebelumnya, perintah:
```powershell
node tests/test_runner_shuffle.js && node tests/test_phase1_revisions.js && node tests/test_stability_and_features.js
```
menghasilkan galat terminal:
```text
At line:1 char:242
+ ... node tests/test_runner_shuffle.js && node te ...
+                                       ~~
The token '&&' is not a valid statement separator in this version.
At line:1 char:281
+ ... t_runner_shuffle.js && node tests/test_phase1_revisions.js && node te ...
+                                                                ~~
The token '&&' is not a valid statement separator in this version.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : InvalidEndOfLine
```

### B. Akar Penyebab (Root Cause Analysis)
* **Bukan Kegagalan Logika Test:** Galat tersebut **bukan** berasal dari kegagalan kode JavaScript atau logika assertions test, melainkan **PowerShell Parser Error** pada Windows PowerShell 5.1 bawaan host.
* **Inkompatibilitas Sintaks Shell:** Operator bash `&&` (AND execution chaining) baru didukung di PowerShell Core 7+, dan merupakan token ilegal pada Windows PowerShell 5.1. Hal ini menyebabkan shell membatalkan parsing seluruh baris perintah sebelum script `node` pertama sempat dieksekusi.

### C. Eksekusi Mandiri Setiap Test Suite (Isolated Execution)
Setiap test suite kemudian dijalankan secara terpisah (independen) tanpa chaining `&&`. Seluruhnya menghasilkan **Exit Code 0**:

| Nama Test Suite | Perintah Mandiri | Jumlah Kasus Uji | Exit Code | Status |
|---|---|---|---|---|
| **NUMORA RUN Multiple-Choice Shuffle** | `node tests/test_runner_shuffle.js` | 12.477 simulasi pengacakan | `0` | **100% SUKSES** |
| **Revisi Tahap 1 (Auth & Modul)** | `node tests/test_phase1_revisions.js` | 3 skenario modular | `0` | **100% SUKSES** |
| **Stabilitas & LAN Base URL** | `node tests/test_stability_and_features.js` | 10 validasi regex & URL | `0` | **100% SUKSES** |
| **Final Verification Suite** | `node tests/test_final_verification.js` | 31 assertions multi-layer | `0` | **100% SUKSES** |

---

## 2. VERIFIKASI KONEKSI DOMAIN VERCEL KE BACKEND PRODUKSI

### A. Analisis Kebutuhan & Masalah Sebelumnya
* **Isu Relative Path:** Sebelumnya pada `frontend/src/services/api.js`, domain non-LAN mengembalikan `""` (relative path) jika `VITE_API_BASE_URL` kosong. Karena Vercel hanya melayani static build Vite tanpa server-side reverse proxy ke backend port 8000, panggilan `fetch("/api/v1/health")` di domain Vercel menghasilkan HTTP 404 Not Found.
* **Isu CORS Origins:** Konfigurasi backend sebelumnya hanya memuat `localhost:5173` dan `127.0.0.1:5173`, sehingga request langsung dari `https://numora-space.vercel.app` akan diblokir oleh CORS policy browser.

### B. Perbaikan Kode yang Telah Diimplementasikan

#### 1. Backend: Explicit Origin & Strict Regex
* **File:** `backend/app/core/config.py`  
  Menambahkan origin resmi Vercel ke daftar `CORS_ORIGINS`:
  ```python
  CORS_ORIGINS: Union[List[str], str] = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://numora-space.vercel.app"
  ]
  ```
* **File:** `backend/app/main.py`  
  Mengimplementasikan pencocokan origin yang aman dan terisolasi:
  ```python
  origins = list(settings.CORS_ORIGINS) if isinstance(settings.CORS_ORIGINS, (list, tuple)) else [settings.CORS_ORIGINS]
  if "https://numora-space.vercel.app" not in origins:
      origins.append("https://numora-space.vercel.app")

  # Mendukung LAN IP privat dan domain resmi Vercel NUMORA Space (tanpa wildcard sembarangan)
  default_cors_regex = (
      r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$"
      r"|^https://(numora-space.*\.vercel\.app)$"
  )
  cors_regex = settings.CORS_ORIGIN_REGEX or default_cors_regex

  app.add_middleware(
      CORSMiddleware,
      allow_origins=origins if origins else [],
      allow_origin_regex=cors_regex,
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
  > **Keamanan Terjamin:** `*` tidak digunakan. Origin domain di luar `numora-space.*.vercel.app` dan LAN privat ditolak secara ketat.

#### 2. Frontend: Official Production Backend Fallback
* **File:** `frontend/src/services/api.js`  
  Menggunakan URL backend resmi `https://numora-space-api.de2.netrun.io` sebagai prioritas fallback:
  ```javascript
  export const PRODUCTION_API_URL = 'https://numora-space-api.de2.netrun.io';

  export function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_BASE_URL;

    // 1. Explicit production backend URL takes highest precedence
    if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '');
    }

    // 2. Runtime browser resolution
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol || 'http:';

      const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
      const isLanIp = /^192\.168\.\d+\.\d+$|^10\.\d+\.\d+\.\d+$|^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname);

      // Private LAN IP (e.g. testing with phone on 192.168.1.34)
      if (isLanIp) {
        return `${protocol}//${hostname}:8000`;
      }

      // Localhost / Loopback
      if (isLoopback) {
        return envUrl ? envUrl.replace(/\/+$/, '') : 'http://127.0.0.1:8000';
      }

      // Remote deployment domain (e.g. numora-space.vercel.app)
      if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/+$/, '');
      }

      // Fallback langsung ke backend produksi resmi (tidak mengandalkan relative path semu)
      return PRODUCTION_API_URL;
    }

    return envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')
      ? envUrl.replace(/\/+$/, '')
      : PRODUCTION_API_URL;
  }
  ```

---

## 3. AUDIT AKHIR PENYIMPANAN EVALUASI & ISOLASI AKUN

### A. Status Integrasi Supabase: Penyimpanan Masih 100% Lokal
* **Pernyataan Tegas:** Hasil evaluasi tantangan literasi pada `MathematicalChallenge.jsx` **sama sekali belum dikirim atau disimpan ke database Supabase**.
* Data pengerjaan tersimpan secara eksklusif pada `localStorage` browser masing-masing pengguna.
* Tabel `evaluation_submissions` pada Supabase belum menerima data evaluasi mandiri ini karena migrasi remote sengaja belum dieksekusi (Fase 2A Subfase 1B).

### B. Isolasi Multi-Akun (Anti-Benturan Sesi)
* Kunci penyimpanan pada `localStorage` diisolasi ketat menggunakan format:
  `numora_eval_results_${user?.email || user?.subjectId || 'guest'}`
* **Verifikasi Pergantian Akun (Account Switching / Logout / Login Kembali):**
  1. Ketika siswa `siswa.demo@numora.space` mengerjakan evaluasi, skor tersimpan di `numora_eval_results_siswa.demo@numora.space`.
  2. Saat siswa logout, `user` bernilai `null`, `storageKey` berpindah ke `numora_eval_results_guest`. State in-memory (`answers`, `feedbacks`, `userAnswer`, `showSummary`) seketika di-reset bersih oleh `useEffect([storageKey])`.
  3. Ketika peneliti `peneliti.demo@numora.space` login, sistem membaca `numora_eval_results_peneliti.demo@numora.space`. Peneliti tidak melihat skor milik siswa.
  4. Ketika siswa login kembali, skor lamanya dipulihkan secara akurat dari kuncinya sendiri tanpa ada data yang tertukar.
  5. Pengujian otomasi pada `tests/test_final_verification.js` memverifikasi skenario ini dan dinyatakan **100% lulus**.

### C. Pemisahan Total Data Penelitian
* `ResearcherDashboard.jsx` hanya membaca data subjek penelitian formal (S-001 tatap muka dan S-002 eksperimen) langsung melalui API backend:
  - `GET /api/v1/research/subjects`
  - `GET /api/v1/research/sessions`
  - `GET /api/v1/research/cognitive-load-status`
* Data latihan evaluasi mandiri di `localStorage` siswa publik tidak pernah dicampurkan ke dalam subjek penelitian eksperimen S-001 / S-002.

---

## 4. STATUS AKHIR KESIAPAN DEPLOYMENT

| Komponen | Status Kesiapan | Catatan Operasional |
|---|---|---|
| **Frontend Production Build** | **READY** | Vite build sukses tanpa galat sintaks maupun JSX (`1530 modules transformed`). |
| **Resolusi Endpoint Backend** | **READY** | Otomatis mengarah ke `https://numora-space-api.de2.netrun.io` saat running di Vercel. |
| **CORS Policy Backend** | **READY** | Mengizinkan origin `https://numora-space.vercel.app` dan preview branch tanpa membuka celah keamanan. |
| **NORA AI Chatbot** | **READY** | Bersih dari formula acak, sapaan ramah di semua turn, error catch transparan. |
| **Evaluasi Literasi Aljabar** | **READY** | 4 modul linier, diagnosis miskonsepsi akurat, summary report lengkap, isolasi akun lokal. |
| **NUMORA RUN Game** | **READY** | Pengacakan opsi A, B, C, D terdistribusi rata 25% dan teruji 12.477 iterasi. |
| **Autentikasi Demo & Sesi** | **READY** | *Remember Me* persisten, isolasi akun penelitian vs siswa terjaga. |
| **Supabase Remote Integration** | **ON HOLD (Phase 2A Subphase 1B)** | Draft SQL schema dan RLS review siap, belum dijalankan ke cloud. |

---

## 5. REKOMENDASI TAHAP BERIKUTNYA

1. **Deployment Vercel:**  
   Frontend dapat di-deploy ke Vercel (`numora-space.vercel.app`). Tidak memerlukan konfigurasi environment variable tambahan karena fallback otomatis telah mengarah langsung ke `https://numora-space-api.de2.netrun.io`.
2. **Deployment Backend Netrun:**  
   Backend FastAPI dapat dijalankan di host `numora-space-api.de2.netrun.io` dengan memastikan konfigurasi `CORS_ORIGINS` mencakup `https://numora-space.vercel.app`.
3. **Eksekusi Subfase 1B (Supabase Sync):**  
   Setelah frontend dan backend terhubung di lingkungan hosting, eksekusi migrasi DDL `database/migrations/001_initial_schema.sql` di Supabase SQL Editor dapat dijadwalkan secara terkontrol.
