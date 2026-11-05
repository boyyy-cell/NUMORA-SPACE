# NUMORA Space v1.6 — UX Cleanup Revision Report
**Focus: Professional Simplicity, Dominant Math Visualization & Ergonomic Learning**
*Date: 2026-11-05*

---

## 1. Latar Belakang & Tujuan Revisi

Berdasarkan hasil evaluasi antarmuka, NUMORA Space diperbaiki secara menyeluruh untuk mengatasi kendala utama:
- **Kepadatan Informasi Berlebih**: Teks penjelasan terlalu panjang dan berulang yang mengalihkan perhatian siswa dari esensi matematika.
- **Hierarki yang Belum Rapi**: Beberapa area terasa terlalu padat sementara area lain memiliki ruang kosong tanpa fungsi.
- **Fokus Visualisasi**: Objek 2D dan 3D matematika perlu diperbesar dan diposisikan sebagai panggung utama (*focal point*).

Melalui revisi ini, antarmuka disederhanakan dengan filosofi **"LESS CLUTTER, MORE LEARNING"** tetap berpegang pada palet **SAGE & IVORY**:
- **Warm Ivory** (`#F6F5EF`) sebagai kanvas utama.
- **Pure White** (`#FFFFFF`) sebagai latar kartu dan panel.
- **Forest Green** (`#355B45`) sebagai warna tombol aksi utama (*CTA*) dan penanda aktif.
- **Soft Sage** (`#A7BCA8`) dan **Muted Terracotta** (`#D58B68`) sebagai aksen pembantu.
- **Charcoal** (`#28332C`) sebagai teks utama kontras tinggi.

---

## 2. Rincian Perbaikan Pengalaman Pengguna (6 Area Utama)

### 2.1 Algebra Lab
1. **Panggung Visualisasi Diperbesar**:
   - Area wadah variabel dan neraca aljabar dibuat lebih tinggi, lapang, dan dominan di tengah layar.
   - Ukuran model neraca 3D Three.js ditingkatkan dari tinggi 240px menjadi **320px**, dengan balok lengan lebih tebal dan piringan lebih lebar sehingga orientasi keseimbangan terlihat sangat jelas.
2. **Navigasi 6 Mode yang Rapi**:
   - Keenam mode (Wadah Variabel, Koefisien, Konstanta, Bentuk Aljabar, Neraca 3D, Simulasi Belanja) ditata dalam grid 6 tombol pill yang seragam dan rapi tanpa berdesakan.
   - Masing-masing pill dilengkapi formula matematika ringkas ($x$, $ax$, $c$, $ax+b$, $ax+b=c$, $B=ax+b$).
3. **Kontrol Interaksi Terintegrasi**:
   - Slider pengatur nilai ditempatkan tepat di bawah objek visualisasi sehingga siswa dapat langsung melihat hubungan sebab-akibat antara pergeseran nilai dan perubahan bentuk visual.
4. **Penjelasan Ringkas (2–3 Kalimat)**:
   - Menghilangkan paragraf panjang teoritis; penjelasan difokuskan langsung pada pemaknaan konsep.
5. **Preservasi Fitur**:
   - Seluruh 6 mode asli dipertahankan 100%, termasuk narasi audio berbahasa Indonesia dan 5 contoh uji aljabar standar ($3x+5, 5x, -3x, 7x-4, 4x+6$).

### 2.2 NORA Socratic Tutor
1. **Ruang Tutor Bersih & Sederhana**:
   - Mengubah layout chat menjadi jendela percakapan yang tenang tanpa ornamen bersaing.
2. **Respons Awal Terukur (2–4 Kalimat)**:
   - NORA tidak memberikan esai panjang yang membingungkan siswa SMP, melainkan jawaban langsung yang bertahap.
3. **Pertanyaan Lanjutan Tunggal (One at a Time)**:
   - Setiap akhir penjelasan memuat satu tombol/pertanyaan lanjutan terarah (misalnya: *"Pahamkah kamu bedanya jika bentuknya positif seperti 3x?"*).
4. **Mode & Guardrail Utuh**:
   - Mempertahankan mode *Explain*, *Ask*, *Hint* (Tahap 1, 2, 3), dan *Review*, serta penolakan otomatis terhadap permintaan contekan jawaban instan.

### 2.3 Student Dashboard
1. **Hero Card Tunggal Terfokus**:
   - Sapaan ramah, keterangan materi terakhir (*Memahami Koefisien*), dan satu tombol utama yang mencolok: **"Lanjutkan Belajar"**.
2. **Progres Nyata Tanpa Statistik Dekoratif**:
   - Satu bar progres bersih: `1 dari 4 Selesai (25%)` yang mencerminkan capaian nyata modul siswa.
3. **Daftar Modul Belajar Rapi**:
   - Menampilkan 4 kartu materi sederhana dengan judul, formula KaTeX, dan tombol aksi langsung.

### 2.4 Researcher Dashboard
1. **Informasi Terstruktur & Terpisah**:
   - Memisahkan tampilan secara tegas ke dalam 5 bagian: *Overview*, *Partisipan*, *Monitoring*, *Instrumen*, dan *Analisis & Ekspor*.
2. **Subjek S-001 & S-002 Terbaca Jelas**:
   - Kartu subjek dibuat kontras tinggi: S-001 (Kelompok Kontrol, tatap muka) dan S-002 (Kelompok Eksperimen, berbantuan platform).
3. **Penjelasan Protokol dalam Bagian yang Dapat Dibuka**:
   - Paragraf etika dan metodologi riset panjang dikemas dalam elemen `<details>` yang rapi sehingga tidak membebani halaman utama.
4. **Fungsi Ekspor Lengkap**:
   - Tombol unduh data **CSV** dan **JSON** berfungsi penuh langsung dari browser.
   - Tidak ada data fiktif; pelabelan eksplisit `[PROTOCOL_TEMPLATE]` tetap dijaga.

### 2.5 Landing Page
1. **Satu Headline Utama Kuat**:
   - *"Memahami Aljabar dengan Makna, Bukan Menghafal Rumus."*
2. **Pangkas Teks Promosi**:
   - Mengurangi deskripsi berulang; deskripsi dibuat padat dalam 2 kalimat.
3. **Tombol Navigasi Jelas**:
   - Menyediakan tombol utama **Mulai Belajar** (menuju ruang siswa) dan **Masuk** (menuju halaman login).
4. **Panggung Visual Matematika Menarik**:
   - Menampilkan representasi wadah variabel $x$ dan formula $3x+5=17 \implies x=4$.

### 2.6 Design System (Sage & Ivory)
- Memastikan skala tipografi proporsional untuk judul, subjudul, dan teks isi.
- Kontras teks Charcoal (`#28332C`) pada Warm Ivory (`#F6F5EF`) adalah **11.85 : 1** (Level AAA).
- Jarak antar-elemen (*padding* dan *gap*) konsisten pada skala 4, 6, dan 8 Tailwind.

---

## 3. Hasil Pengujian & Verifikasi

### 3.1 Frontend Production Build
```
vite v5.4.21 building for production...
✓ 1521 modules transformed.
dist/index.html                     1.29 kB
dist/assets/index-C9xfBasL.css     25.07 kB
dist/assets/index-Db1EqlMN.js   1,074.16 kB
✓ built in 36.41s (Exit Code: 0)
```

### 3.2 Backend Regression Tests
```
python tests/test_api.py
✓ System health and root endpoints PASSED
✓ Math Test PASSED: 3x + 5 with x=4 = 17.0
✓ Math Test PASSED: 5x with x=3 = 15.0
✓ Math Test PASSED: -3x with x=2 = -6.0
✓ Math Test PASSED: 7x - 4 with x=2 = 10.0
✓ Math Test PASSED: 4x + 6 with x=5 = 26.0
✓ Misconception diagnosis suite PASSED
✓ Research data integrity suite PASSED (Strictly 2 Subjects, Honest Protocol)
✓ NORA Socratic Guardrails suite PASSED
--- SELURUH SUITE PENGUJIAN 100% SUKSES! --- (Exit Code: 0)
```

---

## 4. Kesimpulan

Revisi pembersihan UX telah berhasil mengembalikan kesederhanaan, keanggunan, dan kenyamanan belajar pada NUMORA Space. Visualisasi matematika kini menjadi pusat pembelajaran yang dominan, interaksi intuitif, dan bebas dari kelebihan teks yang tidak perlu.

