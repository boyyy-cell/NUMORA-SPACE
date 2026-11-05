# NUMORA Space v1.6 — Feature Preservation Matrix & Architecture Guarantees
**Algebra, Beyond Formulas.**
*Document Version: 1.6-Phase0 | Date: 2026-11-05*

---

## 1. Prinsip Preservasi Fitur (Do Not Break Working Code)
Dalam pengembangan NUMORA Space v1.6, seluruh perbaikan dan migrasi identitas visual wajib mematuhi kaidah **Preservation First**:
1. **Tidak Ada Penulisan Ulang Total (No Complete Rewrite)**: Komponen yang sudah berfungsi tidak boleh dihapus atau diganti dari nol.
2. **Kekokohan Komputasi Matematika (Mathematical Invariance)**: Perubahan warna, tema, atau antarmuka sama sekali tidak boleh mengubah formula, logika substitusi, atau hasil komputasi matematika.
3. **Integritas Protokol Penelitian**: Protokol riset skala kecil dengan 2 subjek (S-001 Kontrol dan S-002 Eksperimen) tidak boleh diubah menjadi populasi fiktif.

---

## 2. Matriks Komponen & Kontrak Preservasi

### A. Kontrak Backend & API Endpoints
Semua endpoint berikut **wajib dipertahankan** nama path, format JSON payload, dan kode status HTTP-nya:

| Endpoint Path | HTTP Method | Kontrak Data Preservasi | Status Jaminan |
|---|---|---|---|
| `/` | `GET` | Mengembalikan `RootResponse` (name, tagline, version, status: operational, docs_url: `/docs`). | **TERKUNCI (LOCKED)** |
| `/api/v1/health` | `GET` | Mengembalikan `HealthResponse` (status: healthy, service, version, environment). Digunakan oleh polling badge frontend. | **TERKUNCI (LOCKED)** |
| `/api/v1/info` | `GET` | Mengembalikan `InfoResponse` (app_name, version, tagline, phase, target_audience). | **TERKUNCI (LOCKED)** |
| `/api/v1/math/evaluate` | `POST` | Wajib meloloskan 5 uji matematika kurikulum wajib tanpa deviasi desimal: <br>• $3x + 5$ ($x=4$) $\implies 17.0$<br>• $5x$ ($x=3$) $\implies 15.0$<br>• $-3x$ ($x=2$) $\implies -6.0$<br>• $7x - 4$ ($x=2$) $\implies 10.0$<br>• $4x + 6$ ($x=5$) $\implies 26.0$ | **TERKUNCI (LOCKED)** |
| `/api/v1/math/diagnose-misconception` | `POST` | Mendiagnosa jawaban siswa pada bentuk $-5x$:<br>• $-5 \implies$ Correct<br>• $5 \implies$ Sign Omission Error<br>• $x \implies$ Variable Confusion | **TERKUNCI (LOCKED)** |
| `/api/v1/research/subjects` | `GET` | Strictly mengembalikan 2 objek subjek: S-001 dan S-002. | **TERKUNCI (LOCKED)** |
| `/api/v1/research/sessions` | `GET` | Mengembalikan log sesi riil tanpa data populasi pabrikasi. | **TERKUNCI (LOCKED)** |
| `/api/v1/research/cognitive-load-status` | `GET` | Mengembalikan status transparan: *NOT CONFIGURED (Menunggu Sesi Pengukuran)*. | **TERKUNCI (LOCKED)** |
| `/api/v1/nora/chat` | `POST` | Mendukung mode `explain`, `ask`, `hint` (tier 1-3), `review` serta menolak membocorkan instrumen tes penelitian. | **TERKUNCI (LOCKED)** |

---

### B. Kontrak Frontend & Modul Interaktif
Komponen visual yang dipertahankan fungsinya saat migrasi tema:

1. **Laboratorium Aljabar 6 Tab (`AlgebraLab.jsx`)**:
   - `variable`: State slider $x \in [-5, 10]$ harus tetap terhubung ke visual wadah token.
   - `coefficient`: Dukungan koefisien negatif ($a \in [-4, 5]$) tetap berfungsi dengan pembedaan arah muatan.
   - `constant`: Pemisahan suku dinamis ($3x$) dan suku konstan tetap ($c$) wajib dipertahankan.
   - `expression`: Rangkaian 3 langkah kalkulasi (Substitusi $\to$ Perkalian $\to$ Penjumlahan) tetap terhubung ke backend.
   - `contextual`: Tiga pilar PISA (Formulate, Employ, Interpret) pada studi kasus belanja tetap aktif.
   - `balance3d`: Three.js balance scale harus tetap berayun secara dinamis dan mencapai *equilibrium* pada $x = 3$.

2. **NORA AI Tutor & Speech Engine**:
   - Web Speech API pada `voiceService.js` tetap mempertahankan modul pelafalan matematika ramah Indonesia.
   - Guardrails pencegahan kebocoran instrumen penelitian (*Pre-Test/Post-Test*) tidak boleh dilemahkan.

3. **Status Badge Real-Time (`BackendStatusBadge.jsx`)**:
   - Mekanisme polling reaktif dan deteksi offline/online backend wajib dipertahankan di Navbar dan Sidebar.

---

## 3. Protokol Verifikasi Regresi (Regression Testing Protocol)
Sebelum dan sesudah setiap modifikasi file pada fase-fase berikutnya, pengembang wajib menjalankan:
```powershell
# 1. Verifikasi Test Suite Backend
.\backend\venv\Scripts\python.exe tests/test_api.py

# 2. Verifikasi Bundle Frontend
cd frontend
npm run build
```
Jika terjadi kegagalan pada salah satu uji tersebut, proses pengembangan dihentikan seketika untuk perbaikan regresi sebelum melangkah ke fitur baru.

