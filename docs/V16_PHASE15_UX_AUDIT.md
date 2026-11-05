# NUMORA Space v1.6 — Phase 1.5 UX Audit & Redesign Plan
**Theme: SAGE & IVORY**
*Algebra, Beyond Formulas.*
*Date: 2026-11-05*

---

## 1. Latar Belakang & Tujuan Audit

NUMORA Space adalah platform pembelajaran aljabar digital untuk siswa SMP kelas VII. Berdasarkan evaluasi ergonomi kognitif dan interaksi siswa:
1. **Kelebihan Beban Kognitif (Cognitive Overload)**: Antarmuka sebelumnya menggunakan tema gelap (Midnight Plum / Deep Aubergine) dengan banyak panel dan kartu bersarang (*nested cards*), glow, dan teks penjelasan yang terlalu panjang, yang menyerupai dashboard developer profesional daripada ruang belajar ramah anak SMP.
2. **Kebutuhan Pedagogis Siswa SMP**: Siswa kelas VII membutuhkan antarmuka yang bersih, lapang (*whitespace* cukup), kontras tinggi yang nyaman di mata pada siang maupun malam hari, dengan teks ringkas (*bite-sized*) dan visualisasi interaktif yang menjadi panggung utama (*focal point*).
3. **Keputusan Desain**: Transisi menyeluruh ke identitas visual **SAGE & IVORY** dengan prinsip *LESS CLUTTER, MORE LEARNING*.

---

## 2. Palet Warna Baru: SAGE & IVORY

| Nama Token | Nilai Hex | Peran Antarmuka | Rasio Kontras WCAG |
|---|:---:|---|:---:|
| **Warm Ivory** | `#F6F5EF` | **Latar Belakang Utama Aplikasi (Canvas)**. Menggantikan plum gelap. Menghadirkan suasana hangat, terang, dan tidak menyilaukan. | Base Canvas |
| **Pure White** | `#FFFFFF` | **Permukaan Kartu, Panel & Modal**. Memberikan elevasi bersih dan memisahkan konten secara rapi. | Elevasi 1 |
| **Forest Green** | `#355B45` | **Warna Tombol Utama & Navigasi Aktif**. Simbol pertumbuhan belajar dan fokus. Kontras tinggi terhadap teks putih. | **6.72 : 1** vs White (AAA/AA) |
| **Soft Sage** | `#A7BCA8` | **Aksen Pendukung & Status Positif**. Digunakan untuk chip aktif halus, border lembut, dan penyeimbang aljabar. | Aksen harmoni |
| **Muted Terracotta** | `#D58B68` | **Highlight Terbatas & Token Negatif**. Digunakan untuk token $-x$ / bilangan negatif aljabar dan penanda penting. | Aksen kontras |
| **Charcoal** | `#28332C` | **Teks Utama**. Menggantikan teks putih. Keterbacaan teks tajam dan sangat jelas di atas Warm Ivory dan Pure White. | **11.85 : 1** vs Ivory (AAA)<br>**13.91 : 1** vs White (AAA) |
| **Secondary Text** | `#707A70` | **Teks Sekunder & Keterangan**. Untuk deskripsi, meta, label waktu, dan instruksi ringkas. | **4.68 : 1** vs Ivory (AA)<br>**5.50 : 1** vs White (AA) |
| **Border** | `#E1E5DC` | **Garis Batas & Pemisah Halus**. Menghilangkan border neon/glow, menggantinya dengan garis batas organik yang bersih. | Border fungsional |

---

## 3. Rencana Penyederhanaan UX per Modul

### 3.1 Student Space & Dashboard
- **Sebelum**: Banyak panel statistik, deskripsi panjang, kartu bertumpuk dengan badge berlapis.
- **Sesudah**:
  - Sapaan singkat: "Halo, [Nama Siswa]! Siap bereksplorasi matematika hari ini?"
  - Ringkasan progres nyata (1 bar progres sederhana).
  - Satu kartu fokus: "Materi Terakhir: Konsep Variabel & Koefisien".
  - Satu tombol aksi utama: **"Lanjutkan Belajar"** berlatar Forest Green.
  - Tautan cepat 4 pilar ringkas tanpa dekorasi berlebih.

### 3.2 Algebra Lab (Laboratorium Aljabar Interaktif)
- **Sebelum**: 6 tombol panjang, beberapa panel penjelasan sekaligus memenuhi layar.
- **Sesudah**:
  - Mengelompokkan 6 mode ke dalam 2 kategori jelas:
    1. **Fondasi Aljabar**: Variabel ($x$), Koefisien ($ax$), Konstanta ($c$), Bentuk Aljabar ($ax+b$).
    2. **Model Keseimbangan**: Neraca 2D dan Neraca 3D (Three.js).
  - Satu area visualisasi utama yang dominan dan lapang di tengah.
  - Kontrol slider / tombol ditempatkan langsung di bawah area visualisasi.
  - Penjelasan maksimal 2–3 kalimat langsung pada inti konsep.
  - Detail teoritis dapat dibuka melalui accordion "Pelajari Lebih Lanjut" tanpa menutupi panggung utama.
  - Seluruh interaksi Three.js dan 5 formula wajib tetap dipertahankan 100%.

### 3.3 NORA AI Tutor
- **Sebelum**: Teks perkenalan panjang, banyak opsi bersaing, border neon.
- **Sesudah**:
  - Antarmuka chat tutor yang ramah, bersih, berlatar Pure White dengan aksen Soft Sage.
  - Respons awal ringkas (2–3 kalimat langsung pada konsep).
  - Tombol mode yang intuitif: *Explain*, *Ask*, *Hint*, *Review*.
  - Mode *Hint* memberikan petunjuk berjenjang (Tahap 1, 2, 3) tanpa membocorkan jawaban.
  - Guardrail pedagogis dan integrasi suara tetap dipertahankan.

### 3.4 Researcher Space (Ruang Peneliti)
- **Sebelum**: Banyak kartu dekoratif bertema gelap.
- **Sesudah**:
  - Struktur tab yang rapi: **Overview**, **Partisipan**, **Monitoring**, **Instrumen**, **Analisis & Ekspor**.
  - Pembedaan eksplisit antara data aktual, `DEMO_SEED`, dan `PROTOCOL_TEMPLATE`.
  - Tabel dan grafik bersih dengan kontras tinggi (Charcoal pada Pure White).
  - Tombol ekspor CSV dan JSON berfungsi penuh.

---

## 4. Daftar Berkas yang Dimodifikasi

1. Token & Styling:
   - `frontend/src/styles/designTokens.js` (Sentralisasi token Sage & Ivory)
   - `frontend/tailwind.config.js` (Definisi palet ivory, white, forest, sage, terracotta, charcoal, border)
   - `frontend/src/styles/index.css` (CSS variables, glass replacement, light scrollbar)
   - `frontend/index.html` (Theme-color #F6F5EF)
   - `frontend/public/manifest.webmanifest` (Theme-color & background #F6F5EF)
   - `frontend/public/favicon.svg` (Ikon Forest Green & Soft Sage)
2. Komponen Dasar & Navigasi:
   - `frontend/src/components/common/BrandLogo.jsx`
   - `frontend/src/components/common/BackendStatusBadge.jsx`
   - `frontend/src/components/layout/Navbar.jsx`
   - `frontend/src/components/layout/Sidebar.jsx`
   - `frontend/src/components/layout/Footer.jsx`
3. Halaman Utama:
   - `frontend/src/pages/LandingPage.jsx`
   - `frontend/src/pages/LoginPage.jsx`
   - `frontend/src/pages/StudentDashboard.jsx`
   - `frontend/src/pages/ResearcherDashboard.jsx`
4. Fitur Interaktif:
   - `frontend/src/features/learning/AlgebraBalance3D.jsx` (Material Three.js disesuaikan dengan Sage & Ivory)
   - `frontend/src/features/learning/AlgebraLab.jsx` (Penyederhanaan tata letak & palet)
   - `frontend/src/features/learning/AlgebraModulePreview.jsx`
   - `frontend/src/features/learning/MathematicalChallenge.jsx`
   - `frontend/src/features/nora/NoraChatPreview.jsx`

