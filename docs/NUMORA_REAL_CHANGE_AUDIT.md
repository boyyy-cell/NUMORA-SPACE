# LAPORAN AUDIT PERBANDINGAN REVISI REALISTIS
## NUMORA SPACE: ANALISIS KESENJANGAN PERUBAHAN VS PENGALAMAN PENGGUNA

**Tanggal Audit:** 12 November 2026  
**Status Repositori:** Clean working tree pada commit `ae3e0e9`  
**Baseline Pembanding:** Commit `92d7c66` (*fix: correct Vercel SPA rewrite configuration*, 6 November 2026)  
**Dokumen:** `docs/NUMORA_REAL_CHANGE_AUDIT.md`

---

## 1. JAWABAN ATAS PERTANYAAN KUNCI:
### *"Mengapa tampilan dan pengalaman aplikasi masih terasa sama?"*

Berdasarkan audit komparasi mendalam antara commit baseline `92d7c66` dan commit terkini `ae3e0e9`, ditemukan **5 penyebab utama** mengapa aplikasi terasa belum berubah bagi pengguna:

1. **Perubahan Belum Ter-Deploy ke Vercel (`numora-space.vercel.app`):**
   * Commit `ae3e0e9` baru saja dibuat di repositori lokal.
   * Karena adanya instruksi batasan ketat (*"jangan push GitHub dan jangan deploy"*), seluruh revisi kode (sebanyak 2.997 baris perubahan) **masih berada di lingkungan lokal host dan belum pernah di-push ke GitHub remote maupun di-deploy ke server Vercel**.
   * Jika pengujian dilakukan dengan membuka URL Vercel (`https://numora-space.vercel.app`), browser **masih menampilkan build lama tanggal 6 November 2026** di mana evaluasi masih loop 2 soal, NORA masih berhalusinasi rumus saat offline, dan progres dashboard masih statis.

2. **Aturan "Jangan Redesign" Ditaati Secara Mutlak:**
   * Pengguna secara konsisten menginstruksikan: *"JANGAN mengubah desain visual yang sekarang. Pertahankan palet warna (Sage, Warm Ivory, Charcoal, Terracotta), tipografi, sidebar, navbar, card, spacing, layout."*
   * Kepatuhan ketat ini membuat struktur visual makro halaman (latar belakang, header, kartu-kartu dashboard) tampak 100% identik di pandangan pertama. Tidak ada perombakan visual drastis yang sengaja dibuat mencolok.

3. **Mayoritas Perubahan Berada di "Bawah Kap Mesin" (*Under the Hood*):**
   * Dari total 2.997 baris kode yang ditambahkan/diubah pada commit `ae3e0e9`, **lebih dari 75%** adalah file non-tampilan:
     * DDL Migrasi Skema Supabase & RLS Review: ~500 baris (`database/migrations/` & `database/seed/`).
     * Laporan Audit & Dokumentasi Teknis: ~1.000 baris (`docs/`).
     * Rangkaian Pengujian Otomatis Node.js: ~600 baris (`tests/`).
     * Logika Backend FastAPI, CORS Regex LAN, dan Mesin Diagnosis: ~300 baris (`backend/`).
   * Perubahan tersebut memperkuat keandalan sistem dan logika, namun tidak mengubah visual antarmuka.

4. **Fitur Evaluasi Baru Terlihat Berbeda Jika Siswa Mengerjakan Sampai Tuntas (Soal ke-4):**
   * Di `MathematicalChallenge.jsx`, kartu soal nomor 1 secara visual dirancang menyerupai gaya kartu sebelumnya (hanya *placeholder* dan nomor indikator yang berubah).
   * Fitur baru yang paling signifikan (yaitu **Layar Ringkasan Evaluasi**, persentase akurasi, rincian diagnosis miskonsepsi, dan rekomendasi belajar aljabar) **hanya akan muncul jika siswa menjawab soal 1 sampai soal 4 hingga selesai**. Jika hanya dilihat sepintas di halaman dashboard tanpa dikerjakan, kartu tersebut terlihat serupa.

5. **Algebra Lab dan Dashboard Peneliti Memang Belum Disentuh Kode Barunya:**
   * File `AlgebraLab.jsx`, `AlgebraBalance3D.jsx`, dan `ResearcherDashboard.jsx` **sama sekali tidak mengalami perubahan kode (0 baris diff)** antara commit `92d7c66` dan `ae3e0e9`.
   * Fitur manipulasi neraca timbangan 3D dan tabel dashboard peneliti masih menggunakan kode awal v1.6.

---

## 2. AUDIT GIT DIFF & COMMIT PEMBANDING

### Status Git Saat Ini:
* **Branch:** `main`
* **Head Commit:** `ae3e0e9` (*fix: stabilize NUMORA Space and evaluation system*)
* **Working Tree:** Bersih (`nothing to commit, working tree clean`). Seluruh file perbaikan telah di-commit ke branch `main` lokal.

### Ringkasan Statistik Diff (`92d7c66` $\rightarrow$ `ae3e0e9`):
* **24 file diubah**
* **2.997 baris penambahan (+)**
* **157 baris pengurangan (-)**

---

## 3. KLASIFIKASI PERUBAHAN: FRONT-FACING VS UNDER-THE-HOOD

### A. Perubahan Nyata yang Memengaruhi Tampilan & Interaksi Siswa (Front-Facing)
1. **`frontend/src/features/learning/MathematicalChallenge.jsx` (+492, -58 baris):**
   * Menghilangkan putaran tanpa batas (*endless modulo loop*).
   * Menambahkan urutan 4 butir soal berjenjang bernomor 1 s.d. 4.
   * Menambahkan *placeholder* instruktif pada masing-masing jenis soal (contoh: `-5`, `a`, `26`).
   * Menambahkan **Layar Ringkasan Hasil Evaluasi** (*Summary Screen*) setelah soal 4 selesai: menampilkan skor total 0–100, akurasi butir soal, status kelulusan PISA, rincian diagnosis miskonsepsi, serta rekomendasi materi belajar aljabar.
   * Menambahkan tombol *Ulangi Evaluasi* dan *Navigasi Sebelumnya/Berikutnya*.
2. **`frontend/src/pages/StudentDashboard.jsx` (+94, -13 baris):**
   * Menghilangkan nilai statis `1 dari 4 Selesai (25%)`.
   * Progres modul aljabar kini dinamis membaca `localStorage` per akun siswa (`numora_student_progress_<subjectId>`).
   * Banner ucapan selamat datang dan tombol aksi utama kini berubah dinamis sesuai modul aktif yang belum diselesaikan siswa.
3. **`frontend/src/features/learning/ModuleLearningModal.jsx` (+53, -4 baris):**
   * Menambahkan seksi interaktif baru: *"Status Pembelajaran Modul"* di bagian bawah materi.
   * Menambahkan tombol aksi *"Tandai Selesai / Selesaikan Modul"* yang langsung mengupdate progres bar di dashboard siswa.
4. **`frontend/src/features/nora/NoraChatPreview.jsx` (+27, -21 baris):**
   * Menghapus pesan otomatis halusinatif formula aljabar palsu `$3x + 5 = 17$` saat terjadi error koneksi.
   * Menggantinya dengan kartu notifikasi galat jaringan yang transparan dan jujur.
5. **`frontend/src/context/AuthContext.jsx` & `LoginPage.jsx` (+41, -4 baris):**
   * Memperbaiki mekanisme persistensi sesi: checkbox *Remember Me* kini benar-benar memisahkan penyimpanan ke `localStorage` (persisten) vs `sessionStorage` (sementara tab aktif).
   * Membersihkan residu sesi saat logout.
6. **`frontend/src/components/layout/Navbar.jsx` & `LandingPage.jsx` (+47, -13 baris):**
   * Memperbaiki anchor link navigasi landing page agar tepat mengarah ke section `#features`, `#preview-modules`, dan `#preview-nora`.

### B. Perubahan di Bawah Kap Mesin (Backend, Logic, Config, Docs)
1. **`backend/app/services/nora_ai_service.py`:** Logika percakapan diperbaiki agar kata sapaan (*halo, hai, selamat pagi*) dan terima kasih direspons ramah di giliran mana pun tanpa melampirkan rumus matematika acak.
2. **`backend/app/services/math_engine.py`:** Memperluas klasifikasi miskonsepsi untuk 4 modul aljabar (variabel, koefisien, konstanta, substitusi nilai nyata).
3. **`backend/app/main.py` & `backend/app/core/config.py`:** Konfigurasi regex CORS untuk IP LAN dan origin `https://numora-space.vercel.app`.
4. **`frontend/src/services/api.js`:** Fungsi `getApiBaseUrl()` yang otomatis mendeteksi apakah diakses via localhost, IP LAN (`192.168.x.x`), atau Vercel fallback ke `https://numora-space-api.de2.netrun.io`.
5. **`database/migrations/` & `database/seed/`:** Draft SQL DDL 5 tabel PostgreSQL dan RLS policies untuk persiapan Fase 2A.
6. **`tests/`:** 4 test suites otomatis dengan total lebih dari 12.500 iterasi pengujian logika.

---

## 4. TABEL AUDIT: PERMINTAAN AWAL VS REALISASI NYATA

| No | Permintaan Awal | File Terdampak | Perubahan Nyata yang Terjadi | Bukti Perubahan di Kode | Status |
|:--:|---|---|---|---|:---:|
| 1 | **Bersihkan Simbol `$` Mentah & Notasi LaTeX** | Seluruh UI & konten aljabar | Mengganti string mentah dengan renderer KaTeX `MathView` / `MathText`, menambahkan identitas Farid Syahputra di footer. | Commit `31c2f32` (Lulus verifikasi). | **SELESAI** |
| 2 | **Acak Jawaban Pilihan Ganda NUMORA RUN** | `frontend/src/features/runner/questionBank.js` | Mengacak opsi pilihan ganda A, B, C, D dengan algoritma Fisher-Yates dan meratakan distribusi jawaban awal ke 25% di setiap huruf. | Commit `fdcba25` & `tests/test_runner_shuffle.js` (12.477 uji lulus). | **SELESAI** |
| 3 | **Perbaiki Navigasi Anchor Landing Page** | `Navbar.jsx`, `LandingPage.jsx` | Target anchor `#features`, `#preview-modules`, `#preview-nora` diselaraskan agar saat diklik halaman bergulir ke section yang tepat. | Diff `Navbar.jsx` baris 48–65; `LandingPage.jsx` baris 85–120. | **SELESAI** |
| 4 | **Perbaiki Sesi Remember Me & Akun Demo** | `AuthContext.jsx`, `LoginPage.jsx` | Checkbox Remember Me aktif menyimpan sesi di `localStorage`, tidak aktif di `sessionStorage`. Logout membersihkan kedua storage. Kedua akun demo tetap utuh. | Diff `AuthContext.jsx` baris 32–75; `LoginPage.jsx` baris 68. | **SELESAI** |
| 5 | **Progres Modul Aljabar Dinamis** | `StudentDashboard.jsx`, `ModuleLearningModal.jsx` | Progres tidak lagi statis 25%. Ditambahkan tombol *"Tandai Selesai"* di modal belajar. Progres bar dashboard bertambah dinamis (25% $\rightarrow$ 50% $\rightarrow$ 75% $\rightarrow$ 100%) dan tersimpan per ID siswa. | Diff `StudentDashboard.jsx` baris 41–80; `ModuleLearningModal.jsx` baris 392–435. | **SELESAI** |
| 6 | **Perbaiki Gagal Koneksi Frontend-Backend di LAN** | `frontend/src/services/api.js`, `backend/app/main.py`, `backend/app/core/config.py` | Mengganti URL statis `127.0.0.1` dengan deteksi host dinamis `getApiBaseUrl()`. Menambahkan regex subnet privat pada CORS backend. Menghilangkan pesan galat *Backend Terputus* saat diakses dari IP HP/LAN. | Diff `api.js` baris 11–45; `main.py` baris 31–42. | **SELESAI** |
| 7 | **Hapus Halusinasi Salam & Rumus NORA AI** | `backend/app/services/nora_ai_service.py`, `frontend/src/features/nora/NoraChatPreview.jsx` | Menghapus syarat `is_first_turn` agar salam direspons ramah kapan pun. Menghapus kemunculan rumus acak `$3x + 5 = 17$`. Menghapus fallback matematika palsu dari blok `catch` offline frontend. | Diff `nora_ai_service.py` baris 468–515; `NoraChatPreview.jsx` baris 125–140. | **SELESAI** |
| 8 | **Revitalisasi Evaluasi Literasi (`MathematicalChallenge`)** | `MathematicalChallenge.jsx`, `backend/app/services/math_engine.py` | Menghentikan endless loop, membuat 4 soal berurutan mencakup 4 modul aljabar, placeholder terpandu, layar ringkasan skor dan akurasi, rincian diagnosis miskonsepsi, tombol ulangi evaluasi, dan penyimpanan terisolasi per akun. | Diff `MathematicalChallenge.jsx` baris 13–180 & 260–420; `math_engine.py` baris 106–240. | **SELESAI** |
| 9 | **CORS Domain Vercel & Fallback Backend Produksi** | `backend/app/main.py`, `backend/app/core/config.py`, `frontend/src/services/api.js` | Mengizinkan origin `https://numora-space.vercel.app` dan preview Vercel. Fallback domain publik langsung ke `https://numora-space-api.de2.netrun.io` (tanpa relative path semu). | Diff `config.py` baris 13–16; `main.py` baris 26–36; `api.js` baris 1–35. | **SELESAI** |
| 10 | **Pembaruan Fitur Interaktif Algebra Lab** | `AlgebraLab.jsx`, `AlgebraBalance3D.jsx` | Tidak ada perubahan baru. Kode masih sama persis dengan baseline v1.6. | `git diff` menghasilkan 0 perubahan. | **BELUM DILAKUKAN** |
| 11 | **Pembaruan Tampilan Dashboard Peneliti** | `ResearcherDashboard.jsx` | Tidak ada perubahan UI. Tabel masih menampilkan mock data riset S-001 & S-002 yang sama. | `git diff` menghasilkan 0 perubahan. | **BELUM DILAKUKAN** |
| 12 | **Integrasi Penuh Supabase Cloud (Live Data)** | `database/migrations/`, Backend API | Baru berupa draft skema DDL SQL dan review RLS. Eksekusi migrasi ke remote cloud sengaja ditahan sesuai batasan instruksi keamanan. | Draf SQL di `database/migrations/001_initial_schema.sql`. | **HANYA SEBAGIAN (DRAFT SIAP, BELUM DIEKSEKUSI)** |

---

## 5. DETAIL PERMINTAAN YANG BELUM DIWUJUDKAN / BELUM TERASA

1. **Interaksi Baru di Algebra Lab:**
   * Laboratorium Aljabar saat ini masih mengandalkan simulasi timbangan neraca dan kotak variabel dasar. Belum ada skenario soal interaktif terpandu yang terhubung langsung ke asesmen di dalam tab Lab.
2. **Dashboard Peneliti Real-Time:**
   * Halaman `ResearcherDashboard.jsx` belum menerima input data baru dari pengerjaan siswa publik karena endpoint Supabase belum dihubungkan.
3. **Tampilan Evaluasi Terkesan Belum Berubah Jika Belum Selesai Dijawab:**
   * Siswa yang hanya membuka menu tantangan tanpa mengisi form jawaban akan melihat komponen yang mirip dengan versi lama (kartu putih berlatar ivory). Perubahan besar baru muncul secara visual setelah soal ke-4 diselesaikan.
4. **Perubahan Belum Terlihat di Perangkat yang Membuka Vercel:**
   * Selama kode di branch `main` lokal belum di-push ke GitHub dan di-deploy ke Vercel, siapa pun yang mengakses `https://numora-space.vercel.app` akan tetap melihat aplikasi versi tanggal 6 November.

---

## 6. STATUS BRANCH GIT & DEPLOYMENT

* **Status Git Lokal:** Seluruh revisi telah aman tercatat pada commit `ae3e0e9` di branch `main`.
* **Status Git Remote (GitHub):** Branch `origin/main` di server GitHub belum disinkronkan dengan commit `ae3e0e9` jika perintah `git push` ditahan.
* **Status Hosting Vercel:** Server Vercel saat ini menyajikan artefak dari commit terakhir yang berhasil di-deploy (`92d7c66`), sehingga fitur perbaikan belum aktif di domain produksi publik.

---

## 7. KESIMPULAN & REKOMENDASI

### Kesimpulan
Kode program NUMORA Space secara teknis **telah berhasil diperbaiki secara substansial pada 9 dari 12 aspek**. Penyebab utama mengapa pengguna merasa *"tampilan dan pengalaman aplikasi masih terasa sama"* adalah kombinasi dari:
1. Pengujian dilakukan pada link hosting Vercel lama yang belum menerima pembaruan kode.
2. Kepatuhan mutlak terhadap aturan "Jangan Redesign" yang mempertahankan palet dan tata letak asli.
3. Perubahan evaluasi literasi memerlukan interaksi penyelesaian hingga soal ke-4 untuk menampilkan layar baru.
4. Algebra Lab dan Dashboard Peneliti memang belum disentuh dalam revisi tahap stabilitas ini.

### Rekomendasi Solusi:
1. **Lakukan Pengujian di Lingkungan Lokal Terlebih Dahulu:**
   Jalankan server lokal (`npm run dev` pada frontend dan `uvicorn` pada backend) untuk membuktikan langsung bahwa NORA tidak lagi mengucapkan rumus palsu, progres modul bertambah saat ditandai selesai, dan ringkasan evaluasi muncul setelah soal ke-4.
2. **Sinkronisasi Deployment (Jika Pengguna Mengizinkan):**
   Ketika pengguna siap menguji secara publik, lakukan `git push origin main` agar Vercel membangun artefak terbaru dari commit `ae3e0e9`.
3. **Peningkatan Pengalaman Visual Ringan (Tanpa Melanggar Desain):**
   Jika diinginkan agar perubahan terasa lebih mencolok sejak awal tanpa merusak desain Sage & Ivory:
   - Tambahkan *badge status* yang lebih hidup pada kartu materi aktif di dashboard.
   - Tambahkan visual progress ring atau checklist interaktif pada modul belajar.
   - Tambahkan tombol preview ringkasan evaluasi yang langsung bisa diklik siswa untuk melihat pencapaian mereka sebelumnya.
