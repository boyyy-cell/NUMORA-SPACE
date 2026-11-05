# NUMORA Space v1.6 — Security & Data Privacy Checklist
**Algebra, Beyond Formulas.**
*Document Version: 1.6-Phase0 | Date: 2026-11-05*

---

## 1. Status Audit Keamanan Saat Ini (Baseline Verification)

| Area Keamanan | Status Audit | Temuan & Tindakan |
|---|:---:|---|
| **Penyimpanan Kredensial & Secrets** | **AMAN (CLEAN)** | Tidak ada API key, token, atau kredensial yang di-commit ke Git. |
| **Proteksi File `.env`** | **AMAN (EXCLUDED)** | `.env`, `backend/.env`, dan `frontend/.env` terdaftar pada `.gitignore` dan terverifikasi **untracked** di Git (`git ls-files` returned 0 entries). Hanya `.env.example` yang di-commit. |
| **Proteksi Folder Sistem** | **AMAN (EXCLUDED)** | `node_modules/`, `backend/venv/`, `frontend/dist/`, `.pytest_cache/`, dan file log telah dikecualikan secara ketat dari repository. |
| **Minimisasi Data Siswa (Privacy)** | **SESUAI PROTOKOL** | Pengguna siswa SMP kelas VII diidentifikasi secara anonim menggunakan kode subjek `S-001` dan `S-002`. Tidak ada Personally Identifiable Information (PII) seperti NIK, nomor telepon, alamat, atau foto siswa yang disimpan. |
| **CORS Middleware** | **TERKONTROL** | CORS pada backend dibatasi melalui environment variable `CORS_ORIGINS` (default: `http://localhost:5173` & `http://127.0.0.1:5173`), mencegah serangan Cross-Origin tanpa izin. |
| **Validasi Input Matematika** | **TERLINDUNGI** | Parser ekspresi matematika menggunakan regex ketat `^([+-]?\d*)x([+-]\d+)?$` dan Pydantic models. Menolak eksekusi kode acak atau *code injection*. |

---

## 2. Checklist Kepatuhan Privasi Subjek Penelitian Siswa SMP

Sesuai kode etik penelitian teknologi pendidikan:
- [x] **Anonimisasi Penuh**: Menggunakan kode subjek S-001 (Kontrol) dan S-002 (Eksperimen).
- [x] **Pemberitahuan Orang Tua & Sekolah (Informed Consent)**: Platform menyediakan banner transparansi penelitian bahwa sesi belajar merupakan bagian dari studi evaluasi media aljabar.
- [x] **Tanpa Pelacakan Lokasi (No Geolocation Tracking)**: Sistem tidak meminta atau merekam koordinat GPS, IP publik secara permanen, atau sensor biometrik.
- [x] **Hak Penarikan Data (Data Withdrawal)**: Data observasi penelitian disimpan terpisah dan dapat dihapus sewaktu-waktu atas permintaan wali siswa.

---

## 3. Rencana Keamanan Tahap Integrasi (Phase 1-7)

1. **Persiapan Supabase Row Level Security (RLS)**:
   - Saat integrasi database diaktifkan, tabel `research_sessions` dan `profiles` wajib menerapkan RLS berbasis token JWT.
   - Siswa tidak boleh membaca data dashboard peneliti (`researcher-dashboard`).
2. **Rate Limiting & Token Budgeting**:
   - Menerapkan pembatasan laju panggilan (e.g. maksimal 15 permintaan per menit per sesi) pada endpoint `/api/v1/nora/chat` guna mencegah *abuse* atau lonjakan biaya API saat model LLM dihubungkan.
3. **Penyaringan Konten Dialog (Content Filtering)**:
   - Filter konten ramah anak pada prompt NORA untuk memastikan interaksi tetap 100% berada dalam koridor pembelajaran matematika kelas VII yang santun.

