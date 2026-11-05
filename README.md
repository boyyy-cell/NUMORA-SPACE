# NUMORA Space — Algebra, Beyond Formulas.

**Platform Pembelajaran Matematika Digital Berbasis AI untuk Siswa SMP Kelas VII**  
*Phase 01: Project Foundation & Initial Visual Studio*

---

## 1. Deskripsi Produk
**NUMORA Space** adalah platform pembelajaran matematika digital masa depan yang didesain secara khusus untuk membantu siswa SMP kelas VII memahami konsep esensial aljabar. Alih-alih menghafal rumus mekanis tanpa makna, siswa dibimbing untuk membangun pemahaman konseptual yang kokoh melalui representasi visual interaktif, manipulasi model mental, dan pendampingan AI sokratik bernama **NORA**.

## 2. Tujuan Produk
1. **Mengurangi Kecemasan Matematika (*Math Anxiety*)**: Menghilangkan stigma bahwa aljabar adalah materi yang menakutkan dan abstrak dengan menyajikan analogi visual yang ramah dan intuitif.
2. **Menjembatani Transisi Kognitif**: Membantu siswa berpindah dari pemikiran aritmetika konkret ke penalaran aljabar simbolik melalui visualisasi wadah variabel, kelipatan koefisien, dan unit konstanta mandiri.
3. **Mendukung Riset Pedagogi Berbasis Bukti**: Menyediakan dasbor analitik pembelajaran bagi pendidik dan peneliti untuk memantau indikator beban kognitif (*Cognitive Load Theory*) siswa selama berinteraksi dengan media digital.

## 3. Fitur Utama (Phase 01)
- **Landing Page Futuristik**: Hero section interaktif dengan animasi geometri abstrak, preview NORA AI, dan eksplorasi 4 modul aljabar.
- **Visual Studio & Interactive 2D Canvas**: Slider manipulasi interaktif untuk nilai variabel $x$, visualisasi wadah nilai, kelipatan koefisien, dan keseimbangan bentuk aljabar.
- **NORA AI Tutor (Preview DEMO MODE)**: Chat tutor dengan karakter ramah, sabar, dan terstruktur dalam 4 mode interaksi: *Explain*, *Ask*, *Hint*, dan *Review*.
- **Portal Siswa (Student Dashboard)**: Gambaran kemajuan belajar, shortcut modul, metrik pemahaman, dan aktivitas terkini (*SAMPLE DATA*).
- **Portal Peneliti (Researcher Dashboard)**: Pratinjau metrik kognitif (*Germane*, *Intrinsic*, *Extraneous Load*), status pre/post-test, dan keterlibatan modul (*DEMO DATA*).
- **Indikator Konektivitas Real-Time**: Status *Backend Connected* / *Disconnected* yang melakukan pemeriksaan langsung ke backend FastAPI secara berkala.
- **PWA Foundation**: Dukungan Web App Manifest dan ikon resolusi tinggi siap dipasang pada perangkat desktop maupun Android.

## 4. Stack Teknologi

### Frontend
- **Framework**: React.js 18 & Vite
- **Styling**: Tailwind CSS & Glassmorphism kustom
- **Ikonografi**: Lucide React
- **Routing**: React Router DOM (v6)
- **Math Rendering**: KaTeX

### Backend
- **Framework**: Python FastAPI
- **Server**: Uvicorn ASGI
- **Config & Validasi**: Pydantic v2 & Pydantic Settings
- **Pengujian**: HTTPX & Pytest / TestClient

### Database & Visualisasi Lanjutan (Fase Mendatang)
- Supabase PostgreSQL (Phase 02)
- Three.js 3D Animations & Voice Narration (Phase 03)

---

## 5. Struktur Folder Proyek
```
NUMORA-SPACE/
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── manifest.webmanifest
│   │   └── icons/
│   │       ├── icon-192.svg
│   │       └── icon-512.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── BackendStatusBadge.jsx
│   │   │   │   ├── BrandLogo.jsx
│   │   │   │   └── MathView.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── ui/
│   │   ├── features/
│   │   │   ├── authentication/
│   │   │   ├── learning/
│   │   │   │   └── AlgebraModulePreview.jsx
│   │   │   ├── nora/
│   │   │   │   └── NoraChatPreview.jsx
│   │   │   └── research/
│   │   ├── hooks/
│   │   │   └── useBackendStatus.js
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── ResearcherDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── .env
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   └── health.py
│   │   │       └── api.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── models/
│   │   ├── schemas/
│   │   │   └── common.py
│   │   ├── services/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── venv/
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── database/
│   ├── migrations/
│   └── seed/
├── docs/
│   ├── architecture/
│   │   └── ARCHITECTURE.md
│   ├── research/
│   │   └── RESEARCH_FOUNDATION.md
│   └── learning-content/
│       └── ALGEBRA_GRADE_7.md
├── tests/
│   └── test_api.py
├── .gitignore
├── .env.example
└── README.md
```

---

## 6. Persyaratan Sistem
- **Node.js**: v18.0.0 atau lebih baru (Disarankan v20 LTS)
- **Python**: v3.10 atau lebih baru (Disarankan v3.12)
- **Sistem Operasi**: Windows 10/11, macOS, atau Linux

---

## 7. Panduan Menjalankan Proyek

### A. Menjalankan Backend FastAPI
Buka terminal PowerShell baru dan jalankan:
```powershell
# 1. Masuk ke direktori backend
cd "C:\Users\User\Documents\NUMORA space\backend"

# 2. Aktifkan virtual environment
.\venv\Scripts\Activate.ps1

# 3. Jalankan server backend uvicorn
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Akses backend pada:
- **API Root**: `http://127.0.0.1:8000/`
- **Health Check**: `http://127.0.0.1:8000/api/v1/health`
- **Info Aplikasi**: `http://127.0.0.1:8000/api/v1/info`
- **Dokumentasi Interaktif Swagger UI**: `http://127.0.0.1:8000/docs`

### B. Menjalankan Frontend React (Vite)
Buka terminal PowerShell kedua dan jalankan:
```powershell
# 1. Masuk ke direktori frontend
cd "C:\Users\User\Documents\NUMORA space\frontend"

# 2. Jalankan server pengembang Vite
npm run dev
```
Akses antarmuka web pada:
- **Aplikasi Web**: `http://localhost:5173/`

### C. Menjalankan Pengujian Otomatis Backend
```powershell
cd "C:\Users\User\Documents\NUMORA space"
.\backend\venv\Scripts\python.exe tests/test_api.py
```

---

## 8. Status Pengembangan Phase 01

| Komponen | Status | Keterangan |
| :--- | :---: | :--- |
| **Arsitektur Modular** | Selesai | Frontend dan backend terpisah rapi |
| **Landing Page** | Selesai | Hero visual, fitur, modul preview, responsif |
| **Login Demo** | Selesai | Autentikasi demo lokal dengan tombol 1-klik |
| **Student Dashboard** | Selesai | 4 kartu modul aljabar, status kemajuan (*SAMPLE DATA*) |
| **Researcher Dashboard**| Selesai | Metrik beban kognitif dan status sesi (*DEMO DATA*) |
| **NORA AI Preview** | Selesai | Mode Explain, Ask, Hint, Review (*DEMO MODE*) |
| **Visual Studio 2D** | Selesai | Slider real-time manipulasi nilai variabel & persamaan |
| **FastAPI Backend** | Selesai | Endpoint `/`, `/health`, `/info`, Swagger docs `/docs` |
| **Live Connection** | Selesai | Status badge otomatis memeriksa respons backend |
| **PWA Manifest** | Selesai | Manifest, favicon, dan ikon siap pasang |

### Fitur yang Berstatus DEMO / SAMPLE DATA
Sesuai batasan Phase 01, fitur-fitur berikut disimulasikan secara transparan dan beretika:
- **NORA AI Response**: Menggunakan respons simulasi berbasis aturan pedagogi (*DEMO MODE*) tanpa koneksi API LLM berbayar.
- **Data Kemajuan Belajar**: Persentase kemajuan siswa berlabel *SAMPLE DATA*.
- **Data Peneliti**: Data kognitif dan subjek berlabel *DEMO DATA* (bukan data penelitian nyata).
- **Autentikasi**: Simulasi lokal tanpa koneksi database.

---

## 9. Rencana Pengembangan Selanjutnya (Phase 02 & Beyond)
1. **Integrasi Supabase PostgreSQL**: Pembuatan tabel pengguna, sesi belajar, butir latihan, dan log kognitif.
2. **Koneksi LLM NORA AI Sungguhan**: Integrasi API model cerdas dengan batasan prompting ketat berbasis pendekatan sokratik.
3. **Audio / Speech Narration (TTS)**: Narasi audio ramah untuk membantu siswa dengan modalitas belajar auditori.
4. **Visualisasi 3D Interaktif (Three.js)**: Model geometri ruang dan keseimbangan timbangan aljabar 3 dimensi.
5. **Instrumen Pengujian Nyata**: Integrasi modul pre-test dan post-test formal bagi subjek penelitian lapangan.

