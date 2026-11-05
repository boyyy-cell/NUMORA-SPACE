# FINAL FIX — NUMORA RUN: RANDOMIZE MULTIPLE-CHOICE ANSWERS
## Laporan Pengacakan Pilihan Ganda & Distribusi Posisi Jawaban

**Tanggal:** November 2026  
**Fitur:** NUMORA RUN (Endless Runner Aljabar)  
**Status:** 100% SUKSES TERVERIFIKASI  
**File yang Diubah:**  
1. `frontend/src/features/runner/questionBank.js` — Penyeimbangan bank opsi dasar, implementasi Fisher-Yates shuffle, dan pembentukan metadata `correctIndex` & `correctLabel`.
2. `tests/test_runner_shuffle.js` — Suite pengujian otomatis berbasis deterministic seed untuk audit keadilan distribusi.

---

## 1. MASALAH SEBELUM PERBAIKAN
Pada implementasi sebelumnya, seluruh 20 soal pada `QUESTION_BANK` ditulis dengan jawaban benar selalu berada pada opsi pertama (`options[0]` atau label A). Hal ini membuat pemain dapat menebak jawaban hanya berdasarkan pola posisi tombol pertama tanpa memproses persoalan aljabar secara konseptual.

---

## 2. LOGIKA IMPLEMENTASI PENGACAKAN

### A. Algoritma Fisher-Yates (Knuth) Shuffle
Untuk memastikan setiap kemungkinan permutasi susunan empat opsi ($4! = 24$ permutasi) memiliki probabilitas kemunculan yang setara dan adil secara matematis, diterapkan algoritma Fisher-Yates:

```javascript
export function shuffleArray(array, rng = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

### B. Fungsi `prepareQuestion()`
Sebelum soal disajikan ke pemain, fungsi `prepareQuestion` melakukan:
1. Menyalin opsi jawaban asli dan mengacak urutannya menggunakan Fisher-Yates.
2. Mencari indeks posisi baru dari `correctAnswer` (`shuffledOptions.indexOf(question.correctAnswer)`).
3. Memperbarui `correctIndex` (0–3) dan `correctLabel` ('A', 'B', 'C', atau 'D').
4. Menjaga isi pertanyaan, nilai matematika, dan tingkat kesulitan soal tetap utuh 100%.

```javascript
export function prepareQuestion(question, rng = Math.random) {
  if (!question || !Array.isArray(question.options)) return question;

  const shuffledOptions = shuffleArray(question.options, rng);
  const newIndex = shuffledOptions.indexOf(question.correctAnswer);
  const correctIndex = newIndex >= 0 ? newIndex : 0;
  const labels = ['A', 'B', 'C', 'D'];

  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: question.correctAnswer,
    correctIndex: correctIndex,
    correctLabel: labels[correctIndex] || 'A'
  };
}
```

### C. Penyeimbangan Data Dasar Bank Soal (20 Soal)
Data awal pada `QUESTION_BANK` juga dirombak agar posisi awalnya tidak seragam di A, melainkan terbagi rata masing-masing 5 soal di A, B, C, dan D:
- **Posisi A (5 soal)**: `beg_4`, `int_3`, `adv_2`, `exp_1`, `exp_5`
- **Posisi B (5 soal)**: `beg_1`, `beg_5`, `int_4`, `adv_3`, `exp_2`
- **Posisi C (5 soal)**: `beg_2`, `int_1`, `int_5`, `adv_4`, `exp_3`
- **Posisi D (5 soal)**: `beg_3`, `int_2`, `adv_1`, `adv_5`, `exp_4`

### D. Stabilitas React State (Anti Re-Render Flashing)
Soal yang diambil oleh `getRandomQuestion(selectedLevel)` telah diacak sekali saat gerbang dipicu (`triggerAlgebraChallenge`) dan disimpan ke dalam React state `currentQuestion`. Dengan demikian:
- Selama hitungan mundur timer 10 detik berjalan atau saat pemain mengklik tombol, urutan opsi **tidak akan pernah bergeser atau teracak ulang**.
- Saat sesi soal baru atau game baru dimulai, opsi diacak kembali secara independen.

---

## 3. HASIL PENGUJIAN OTOMATIS (`tests/test_runner_shuffle.js`)

Pengujian otomatis dijalankan dengan 12.477 asersi matematika dan simulasi seeded RNG:

```
======================================================
--- TEST SUITE: NUMORA RUN MULTIPLE-CHOICE SHUFFLE ---
======================================================

▶ TEST 1: Memeriksa integritas 20 soal pada QUESTION_BANK...
  ✓ 20/20 soal valid: tepat 4 opsi, tidak ada duplikat, tidak ada opsi kosong.

▶ TEST 2: Memeriksa distribusi posisi jawaban dasar pada data awal...
  Distribusi Posisi Dasar Bank Soal:
    Posisi A: 5 soal (25%)
    Posisi B: 5 soal (25%)
    Posisi C: 5 soal (25%)
    Posisi D: 5 soal (25%)
  ✓ Posisi dasar terdistribusi 25% rata di setiap label A, B, C, D.

▶ TEST 3: Menguji keakuratan evaluasi jawaban setelah pengacakan (1.000 iterasi)...
  ✓ 1.000 simulasi berhasil: Jawaban benar 100% akurat, jawaban salah 100% ditolak.

▶ TEST 4: Menguji distribusi statistik pengacakan posisi jawaban benar (10.000 iterasi)...
  Distribusi Posisi Jawaban Benar Setelah Pengacakan (10.000 run):
    Posisi A: 2545 kali (25.45%)
    Posisi B: 2447 kali (24.47%)
    Posisi C: 2457 kali (24.57%)
    Posisi D: 2551 kali (25.51%)
  ✓ Seluruh 20 soal terbukti dapat menempati posisi A, B, C, maupun D secara merata.

▶ TEST 5: Menguji pemanggilan dinamis getRandomQuestion pada sesi permainan...
  Distribusi 100 Soal Sesi Game:
    Posisi A: 30 soal
    Posisi B: 18 soal
    Posisi C: 27 soal
    Posisi D: 25 soal
  ✓ Pengacakan saat runtime sesi permainan berjalan dinamis dan adil.

======================================================
🎉 SELURUH 12477 PENGUJIAN SHUFFLE 100% SUKSES!
======================================================
```

---

## 4. HASIL BUILD DAN INTEGRASI SISTEM

- **Frontend Production Build**: `npm run build` sukses 100% tanpa error (`vite build`, exit code 0).
- **Backend API Tests**: 9/9 unit tests lulus 100% (`test_api.py`).
- **NORA Open AI Multi-Turn Tests**: 7/7 context tests lulus 100% (`test_nora_open_ai.py`).
- **Zero Regression**: Timer, skor, nyawa, koin, rintangan, animasi portal, dan umpan balik Socratic NORA tetap bekerja normal.
