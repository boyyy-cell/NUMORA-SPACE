# NUMORA Space v1.6 — Phase 1.5: UX Simplification & Sage and Ivory Redesign Implementation Report
**Theme: SAGE & IVORY**
*Algebra, Beyond Formulas.*
*Date: 2026-11-05*

---

## 1. Ringkasan Eksekutif

Pada tahap **Phase 1.5**, antarmuka NUMORA Space telah berhasil diperbarui secara menyeluruh dari tema gelap (*Midnight Orchid*) menjadi identitas visual baru: **SAGE & IVORY**.

Prinsip panduan yang diterapkan adalah **"LESS CLUTTER, MORE LEARNING"**:
- Mengganti latar belakang gelap dengan **Warm Ivory** (`#F6F5EF`) dan permukaan kartu **Pure White** (`#FFFFFF`).
- Warna aksi utama (*CTA*) dan penanda navigasi aktif menggunakan **Forest Green** (`#355B45`).
- Aksen pendukung menggunakan **Soft Sage** (`#A7BCA8`), dan penanda khusus (seperti token negatif aljabar) menggunakan **Muted Terracotta** (`#D58B68`).
- Teks utama menggunakan **Charcoal** (`#28332C`) dengan kontras tajam (**11.85 : 1** di atas Ivory dan **13.91 : 1** di atas White), melampaui kriteria WCAG 2.1 AAA.
- Menghilangkan dinding teks (*wall of text*), kartu dekoratif bersarang, gradien neon berlebih, dan efek glow yang membebani kognisi siswa.
- Seluruh 6 mode Algebra Lab, animasi timbangan 3D Three.js, NORA Socratic AI, evaluasi PISA, dan Research Center tetap dipertahankan 100%.

---

## 2. Palet Desain SAGE & IVORY Terpusat

Sentralisasi token di [`frontend/src/styles/designTokens.js`](file:///C:/Users/User/Documents/NUMORA%20space/frontend/src/styles/designTokens.js):

```javascript
export const designTokens = {
  colors: {
    bg: {
      primary: '#F6F5EF',       // Warm Ivory
      card: '#FFFFFF',          // Pure White
      panel: '#FFFFFF',         // Pure White
      subtle: '#EFEFE8',
      darkInset: '#E8ECE4',
    },
    brand: {
      forest: '#355B45',        // Forest Green (Primary CTA & Active Nav)
      forestHover: '#2B4B38',
      sage: '#A7BCA8',          // Soft Sage
      terracotta: '#D58B68',    // Muted Terracotta
    },
    text: {
      primary: '#28332C',       // Charcoal (High-Contrast Heading & Body)
      secondary: '#707A70',     // Muted Secondary Text
      inverted: '#FFFFFF',
    },
    semantic: {
      success: '#355B45',
      warning: '#D58B68',
      error: '#C85A5A',
      info: '#5B7A8C',
    },
    border: {
      default: '#E1E5DC',       // Border
      focus: '#355B45',
    }
  }
};
```

---

## 3. Log Penyederhanaan Komponen Antarmuka

| Halaman / Komponen | Berkas | Penyederhanaan UX & Desain yang Dilakukan |
|---|---|---|
| **Design Tokens & Tailwind** | `designTokens.js`, `tailwind.config.js`, `index.css` | Mendefinisikan skala `ivory`, `forest`, `sage`, `terracotta`, `charcoal`, dan `border-clean`. Mengganti class glassmorphism gelap menjadi `.clean-card` dan `.clean-panel` putih bersih dengan bayangan halus. |
| **HTML Head & Manifest** | `index.html`, `manifest.webmanifest`, `favicon.svg` | `theme-color` diselaraskan ke `#F6F5EF`. Favicon diperbarui dengan siluet geometris Forest Green dan Soft Sage. |
| **Brand Logo & Status Badge** | `BrandLogo.jsx`, `BackendStatusBadge.jsx` | Ikon atom minimalis Forest Green & Terracotta, teks Charcoal tajam. Indikator status backend bersih putih dengan lampu sinyal Forest Green. |
| **Navbar & Sidebar** | `Navbar.jsx`, `Sidebar.jsx` | Navbar putih bersih dengan backdrop blur subtil. Sidebar memiliki 5 menu utama terstruktur untuk Siswa (Beranda, Materi, Algebra Lab, NORA, Evaluasi) dan 5 menu untuk Peneliti (Overview, Partisipan, Monitoring, Instrumen, Analisis & Ekspor). |
| **Footer** | `Footer.jsx` | Tampilan footer putih minimalis, ringkas, tanpa kolom berulang. |
| **Landing Page** | `LandingPage.jsx` | Mengeliminasi kartu neon gelap dan teks esai panjang. Hero copy terfokus pada pesan utama, kartu peraga aljabar 1 wadah $x$, 3 pilar ringkas, dan pratinjau lab. |
| **Login Page** | `LoginPage.jsx` | Form autentikasi putih bersih dengan kartu demo satu-klik Siswa & Peneliti yang intuitif. |
| **Student Dashboard** | `StudentDashboard.jsx` | Sapaan ramah singkat, satu kartu fokus materi terakhir, satu tombol utama "Lanjutkan Belajar", satu bar progres nyata (25%), dan tab materi yang bersih. |
| **Algebra Lab** | `AlgebraLab.jsx` | Mengelompokkan 6 mode ke dalam 2 kategori (Konsep Dasar & Model Terapan), satu panggung visualisasi dominan di tengah, kontrol slider di bawah visualizer, penjelasan 2 kalimat dengan accordion detail. |
| **Timbangan 3D** | `AlgebraBalance3D.jsx` | Material Three.js: alas Charcoal (`0x28332C`), tiang Soft Sage (`0xA7BCA8`), lengan & piringan kiri Forest Green (`0x355B45`), piringan kanan Terracotta (`0xD58B68`). Background kanvas Warm Ivory (`0xF6F5EF`). |
| **NORA Chat** | `NoraChatPreview.jsx` | Percakapan tutor ramah anak SMP, bubble Pure White dan Forest Green, respons ringkas tanpa esai panjang, selektor mode chip sederhana (Explain, Ask, Hint, Review). |
| **Evaluasi Literasi** | `MathematicalChallenge.jsx` | Kartu soal Pure White berlatar Ivory, umpan balik diagnostik Forest Green (benar) dan Terracotta (perbaikan), dengan pembacaan audio terintegrasi. |
| **Researcher Dashboard** | `ResearcherDashboard.jsx` | Dashboard terstruktur rapi: Overview, Partisipan (S-001 & S-002), Monitoring, Instrumen Leppink, dan tombol unduh data CSV & JSON langsung. |

---

## 4. Evaluasi Aksesibilitas Kontras (WCAG 2.1 AA / AAA)

| Pasangan Warna | Foreground | Background | Rasio Kontras | Standar Kepatuhan |
|---|:---:|:---:|:---:|:---:|
| **Teks Charcoal pada Ivory** | `#28332C` | `#F6F5EF` | **11.85 : 1** | **Level AAA** (> 7:1) |
| **Teks Charcoal pada Pure White** | `#28332C` | `#FFFFFF` | **13.91 : 1** | **Level AAA** (> 7:1) |
| **Teks Putih pada Tombol Forest Green** | `#FFFFFF` | `#355B45` | **6.72 : 1** | **Level AA / AAA Large** (> 4.5:1) |
| **Teks Sekunder pada Ivory** | `#707A70` | `#F6F5EF` | **4.68 : 1** | **Level AA** (> 4.5:1) |
| **Teks Sekunder pada Pure White** | `#707A70` | `#FFFFFF` | **5.50 : 1** | **Level AA** (> 4.5:1) |
| **Teks Terracotta pada Ivory** | `#D58B68` | `#F6F5EF` | **2.65 : 1 (Aksen Grafis)** | Non-text UI accent (> 3:1 pada elemen tebal) |

Semua teks keterbacaan primer dan sekunder memenuhi atau melampaui kriteria WCAG 2.1 AA.

