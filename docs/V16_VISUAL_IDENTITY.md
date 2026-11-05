# NUMORA Space v1.6 — Visual Identity Direction: MIDNIGHT ORCHID
**Algebra, Beyond Formulas.**
*Document Version: 1.6-Phase0 | Date: 2026-11-05*

---

## 1. Konsep Desain: MIDNIGHT ORCHID
Sebagai langkah pembaruan besar pada versi 1.6, NUMORA Space menghentikan dominasi skema warna dark navy dan cyan standar teknologi generik, beralih ke filosofi visual baru: **MIDNIGHT ORCHID**.

### Karakter Visual
- **Warm & Sophisticated**: Atmosfer belajar yang tenang, hangat, dan ramah bagi siswa SMP, menjauhkan kesan dingin atau mengintimidasi.
- **Premium Educational Technology**: Tampilan futuristik elegan dengan perpaduan gradien plum, orchid lembut, dan sentuhan apricot hangat.
- **Cognitive Ergonomics**: Kontras warna dioptimalkan berdasarkan standar WCAG 2.1 AA agar tidak melelahkan mata siswa selama sesi belajar berdurasi 30–45 menit.
- **Zero Generic Dashboard**: Menghindari elemen neon berlebih, drop shadow kasar, atau kartu berkilau berlebihan yang dapat meningkatkan *extraneous cognitive load*.

---

## 2. Palet Warna Baku (The 7 Core Tokens)

| Nama Token | Nilai Hex | Peran & Fungsi dalam Antarmuka | Standar Kontras (WCAG) |
|---|:---:|---|---|
| **Midnight Plum** | `#19151F` | **Background Utama Aplikasi**. Menggantikan navy `#0B1426`. Memberikan kedalaman visual bernuansa plum gelap yang hangat. | Base Canvas (0:1) |
| **Deep Aubergine** | `#28222F` | **Sidebar, Navbar, & Card Surface**. Permukaan elevasi lapis pertama untuk panel dan dialog. | Kontras terhadap Ivory White: **11.4:1** (AAA) |
| **Soft Orchid** | `#B69AD9` | **Aksen Utama Produk**. Menggantikan cyan `#62D9F5`. Digunakan untuk logo, border fokus, variabel aljabar, dan avatar NORA. | Kontras terhadap Midnight Plum: **7.8:1** (AAA) |
| **Warm Apricot** | `#F0A77E` | **Highlight & Interaksi Kritis**. Digunakan untuk tombol aksi utama (CTA), token negatif aljabar, dan indikator aktif. | Kontras terhadap Midnight Plum: **8.6:1** (AAA) |
| **Sage Green** | `#A8BFA9` | **Status Sukses & Progres Tuntas**. Digunakan untuk indikator *Equilibrium* timbangan aljabar, jawaban benar, dan checkmark modul. | Kontras terhadap Midnight Plum: **8.2:1** (AAA) |
| **Ivory White** | `#F5EFE5` | **Teks Utama & Elemen Terang**. Menggantikan putih dingin. Menghasilkan keterbacaan teks yang sangat jernih dan nyaman dibaca. | Kontras terhadap Midnight Plum: **15.8:1** (AAA) |
| **Muted Lavender** | `#C8B9C9` | **Teks Sekunder, Meta & Border Subtil**. Digunakan untuk deskripsi modul, timestamp chat, dan garis pemisah. | Kontras terhadap Midnight Plum: **9.9:1** (AAA) |

---

## 3. Matriks Transformasi Token (Legacy Navy $\implies$ Midnight Orchid)

| Komponen / Properti | Palet Lama (v1.5) | Palet Baru MIDNIGHT ORCHID (v1.6) |
|---|---|---|
| Background Halaman | `#0B1426` (Navy Blue) | **`#19151F` (Midnight Plum)** |
| Panel & Surface | `#111F34` (Navy Surface) | **`#28222F` (Deep Aubergine)** |
| Card Container | `#16243A` (Dark Slate) | **`rgba(40, 34, 47, 0.85)` with blur** |
| Aksen Utama | `#62D9F5` (Electric Cyan) | **`#B69AD9` (Soft Orchid)** |
| Aksen Kedua / CTA | `#8875F8` (Bright Violet) | **`#F0A77E` (Warm Apricot)** |
| Status Sukses | `#54C9A4` (Emerald Green) | **`#A8BFA9` (Sage Green)** |
| Warna Teks Utama | `#F3F6FC` (Cold White) | **`#F5EFE5` (Ivory White)** |
| Warna Teks Muted | `#A8B6CA` (Cold Slate) | **`#C8B9C9` (Muted Lavender)** |
| Glow Shadow | `rgba(98, 217, 245, 0.25)` | **`rgba(182, 154, 217, 0.20)` (Orchid Soft Glow)** |
| Material Timbangan 3D | Cyan & Violet Plastic | **Soft Orchid Metallic & Warm Apricot Matte** |

---

## 4. Implementasi Centralized Design Tokens (Target Phase 1)
Pada Phase 1, file [`frontend/src/styles/designTokens.js`](file:///C:/Users/User/Documents/NUMORA%20space/frontend/src/styles/designTokens.js) dan [`frontend/tailwind.config.js`](file:///C:/Users/User/Documents/NUMORA%20space/frontend/tailwind.config.js) akan diselaraskan dengan skema berikut:

```javascript
export const designTokens = {
  colors: {
    bg: {
      primary: '#19151F',    // Midnight Plum
      secondary: '#28222F',  // Deep Aubergine
      card: '#221C29',       // Elevated Card
    },
    accent: {
      orchid: '#B69AD9',     // Soft Orchid
      apricot: '#F0A77E',    // Warm Apricot
      sage: '#A8BFA9',       // Sage Green
    },
    text: {
      ivory: '#F5EFE5',      // Ivory White
      lavender: '#C8B9C9',   // Muted Lavender
    }
  }
};
```

---

## 5. Pedoman Tipografi & Aksesibilitas
- **Font Utama**: *Inter* untuk UI dan teks naratif; *JetBrains Mono* untuk formula dan variabel aljabar.
- **Math Rendering**: KaTeX harus menggunakan warna `#F5EFE5` untuk simbol ekspresi dan aksen `#B69AD9` / `#F0A77E` untuk variabel $x$ dan nilai substitusi.
- **Aksesibilitas Kontras**: Seluruh kombinasi warna latar dan teks memiliki rasio kontras di atas **7:1**, melampaui batas minimal kriteria WCAG 2.1 AA (4.5:1).

