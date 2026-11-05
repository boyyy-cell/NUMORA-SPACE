# NUMORA Space — System Architecture Documentation
**Phase 01: Project Foundation & Initial Visual Studio**

## 1. Ikhtisar Arsitektur
NUMORA Space menerapkan arsitektur *decoupled client-server* (terpisah) untuk memastikan skalabilitas, fleksibilitas pengembangan antarmuka visual, dan kemudahan pengujian independen.

```
+-------------------------------------------------------------+
|                     CLIENT APPLICATION                      |
|                                                             |
|  [ React 18 + Vite ] <---> [ Tailwind CSS + KaTeX Math ]   |
|         |                                                   |
|         v                                                   |
|  [ API Service Client ] (HTTP with Timeout & Polling)       |
+-------------------------------------------------------------+
                              |
                              | REST API (JSON)
                              | http://127.0.0.1:8000
                              v
+-------------------------------------------------------------+
|                     BACKEND SERVICES                        |
|                                                             |
|  [ FastAPI Core ] <---> [ Pydantic v2 Settings ]            |
|         |                                                   |
|         +---> GET /                                         |
|         +---> GET /api/v1/health                            |
|         +---> GET /api/v1/info                              |
|         +---> /docs (Auto Swagger UI)                       |
+-------------------------------------------------------------+
                              |
                              | (Phase 02 Integration)
                              v
+-------------------------------------------------------------+
|                  PERSISTENCE & AI SERVICES                  |
|                                                             |
|  [ Supabase PostgreSQL ] <---> [ LLM Tutor / Speech Engine ]|
+-------------------------------------------------------------+
```

## 2. Struktur Modul Frontend
- **Routing**: `react-router-dom` mengelola navigasi berbasis SPA:
  - `/` -> Landing Page interaktif
  - `/login` -> Portal demonstrasi login (Siswa / Peneliti)
  - `/student-dashboard` -> Dashboard pembelajaran siswa kelas VII
  - `/researcher-dashboard` -> Dashboard evaluasi metrik riset
- **Visual & Math Engine**: KaTeX untuk rendering notasi aljabar murni, SVG responsif untuk ilustrasi geometri 2D.
- **Service Layer**: `services/api.js` membungkus fetch API dengan penanganan timeout, loading state, dan pemulihan koneksi.

## 3. Struktur Backend FastAPI
- **Modular Router**: Endpoint diatur dalam `backend/app/api/v1/endpoints/`.
- **Konfigurasi Terpusat**: `backend/app/core/config.py` memanfaatkan `pydantic-settings` membaca `.env`.
- **CORS Support**: Diatur otomatis untuk domain frontend (Vite port 5173).

