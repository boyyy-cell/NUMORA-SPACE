/**
 * NUMORA RUN — Validated Algebraic Question Bank
 * Sesuai kurikulum SMP Kelas VII dengan 4 tingkat materi:
 * 1. Beginner: Variabel, Koefisien, Konstanta
 * 2. Intermediate: Operasi & Penyederhanaan Bentuk Aljabar
 * 3. Advanced: Evaluasi Substitusi Nilai Variabel
 * 4. Expert: Persamaan Aljabar Sederhana (Keseimbangan)
 *
 * Masing-masing tingkat berisi 5 soal valid (total 20 soal).
 * Opsi dasar didistribusikan secara seimbang, dan diacak secara dinamis
 * menggunakan algoritma Fisher-Yates pada saat soal dimuat.
 */

export const QUESTION_BANK = {
  beginner: [
    {
      id: 'beg_1',
      level: 'Beginner',
      topic: 'Identifikasi Koefisien',
      question: 'Berapakah nilai koefisien x pada bentuk aljabar -5x?',
      katex: '-5x',
      options: ['5', '-5', 'x', '-1'],
      correctAnswer: '-5',
      explanation: 'Koefisien adalah bilangan pengali di depan variabel. Pada -5x, tanda negatif melekat pada angkanya sehingga koefisiennya adalah -5.'
    },
    {
      id: 'beg_2',
      level: 'Beginner',
      topic: 'Identifikasi Konstanta',
      question: 'Pada bentuk aljabar 3x + 7, manakah yang merupakan konstanta?',
      katex: '3x + 7',
      options: ['3', '3x', '7', 'x'],
      correctAnswer: '7',
      explanation: 'Konstanta adalah suku yang berdiri sendiri berupa bilangan tetap tanpa variabel pengali, yaitu 7.'
    },
    {
      id: 'beg_3',
      level: 'Beginner',
      topic: 'Identifikasi Variabel',
      question: 'Pada bentuk aljabar 4y - 9, huruf apakah yang bertindak sebagai variabel?',
      katex: '4y - 9',
      options: ['4', '-9', '4y', 'y'],
      correctAnswer: 'y',
      explanation: 'Variabel adalah lambang pengganti bilangan yang nilainya dapat berubah-ubah, yaitu huruf y.'
    },
    {
      id: 'beg_4',
      level: 'Beginner',
      topic: 'Koefisien Negatif Tunggal',
      question: 'Berapakah nilai koefisien pada bentuk aljabar -x?',
      katex: '-x',
      options: ['-1', '0', '1', '-x'],
      correctAnswer: '-1',
      explanation: 'Bentuk -x merupakan penulisan ringkas dari -1 dikalikan x. Jadi koefisiennya adalah -1.'
    },
    {
      id: 'beg_5',
      level: 'Beginner',
      topic: 'Jumlah Suku',
      question: 'Berapa banyak suku pada bentuk aljabar 2a + 3b - 5?',
      katex: '2a + 3b - 5',
      options: ['2', '3', '5', '1'],
      correctAnswer: '3',
      explanation: 'Suku-sukunya adalah 2a, 3b, dan -5, sehingga terdapat total 3 suku.'
    }
  ],

  intermediate: [
    {
      id: 'int_1',
      level: 'Intermediate',
      topic: 'Penjumlahan Suku Sejenis',
      question: 'Sederhanakan bentuk aljabar berikut: 3x + 4x = ...',
      katex: '3x + 4x',
      options: ['7x²', '12x', '7x', '7'],
      correctAnswer: '7x',
      explanation: 'Karena variabelnya sama (suku sejenis), kita cukup menjumlahkan koefisiennya: (3 + 4)x = 7x.'
    },
    {
      id: 'int_2',
      level: 'Intermediate',
      topic: 'Pengurangan Suku Sejenis',
      question: 'Hasil pengurangan dari 8a - 3a adalah...',
      katex: '8a - 3a',
      options: ['5', '11a', '5a²', '5a'],
      correctAnswer: '5a',
      explanation: 'Kurangkan koefisien dari suku sejenis: (8 - 3)a = 5a.'
    },
    {
      id: 'int_3',
      level: 'Intermediate',
      topic: 'Pengelompokan Suku',
      question: 'Sederhanakan bentuk aljabar: 5x + 3 + 2x = ...',
      katex: '5x + 3 + 2x',
      options: ['7x + 3', '10x', '5x + 5', '7x + 5'],
      correctAnswer: '7x + 3',
      explanation: 'Kelompokkan suku sejenis: 5x + 2x = 7x, lalu tambahkan konstanta 3 menjadi 7x + 3.'
    },
    {
      id: 'int_4',
      level: 'Intermediate',
      topic: 'Operasi Bertanda Campuran',
      question: 'Berapakah hasil dari -2b + 6b?',
      katex: '-2b + 6b',
      options: ['-4b', '4b', '8b', '-12b'],
      correctAnswer: '4b',
      explanation: 'Jumlahkan koefisien: -2 + 6 = 4, sehingga hasilnya adalah 4b.'
    },
    {
      id: 'int_5',
      level: 'Intermediate',
      topic: 'Pengurangan Negatif',
      question: 'Sederhanakan: 7y - 9y = ...',
      katex: '7y - 9y',
      options: ['2y', '-16y', '-2y', '16y'],
      correctAnswer: '-2y',
      explanation: 'Kurangkan koefisiennya: 7 - 9 = -2, maka bentuk sederhananya adalah -2y.'
    }
  ],

  advanced: [
    {
      id: 'adv_1',
      level: 'Advanced',
      topic: 'Substitusi Nilai Variabel',
      question: 'Jika x = 5, berapakah nilai dari 2x + 3?',
      katex: '2(5) + 3',
      options: ['10', '15', '8', '13'],
      correctAnswer: '13',
      explanation: 'Ganti x dengan 5: kalikan terlebih dahulu (2 × 5 = 10), lalu jumlahkan dengan 3: 10 + 3 = 13.'
    },
    {
      id: 'adv_2',
      level: 'Advanced',
      topic: 'Kasus Wajib Kurikulum: 3x + 5',
      question: 'Jika x = 4, berapakah nilai dari 3x + 5?',
      katex: '3(4) + 5',
      options: ['17', '12', '19', '20'],
      correctAnswer: '17',
      explanation: 'Substitusikan x = 4: 3 × 4 = 12, lalu tambahkan 5 menghasilkan 17.'
    },
    {
      id: 'adv_3',
      level: 'Advanced',
      topic: 'Kasus Wajib Kurikulum: -3x',
      question: 'Jika x = 2, berapakah hasil dari bentuk aljabar -3x?',
      katex: '-3(2)',
      options: ['6', '-6', '-5', '5'],
      correctAnswer: '-6',
      explanation: 'Perkalian bilangan negatif dengan positif: -3 × 2 = -6.'
    },
    {
      id: 'adv_4',
      level: 'Advanced',
      topic: 'Kasus Wajib Kurikulum: 7x - 4',
      question: 'Berapakah nilai dari 7x - 4 jika x = 2?',
      katex: '7(2) - 4',
      options: ['14', '18', '10', '8'],
      correctAnswer: '10',
      explanation: 'Hitung perkalian 7 × 2 = 14, lalu kurangkan 4: 14 - 4 = 10.'
    },
    {
      id: 'adv_5',
      level: 'Advanced',
      topic: 'Kasus Wajib Kurikulum: 4x + 6',
      question: 'Aisyah membeli 4 buku tulis seharga x = 5 ribu rupiah dan tempat pensil 6 ribu. Berapa total biaya 4x + 6?',
      katex: '4(5) + 6',
      options: ['20', '24', '30', '26'],
      correctAnswer: '26',
      explanation: '4 × 5 = 20, ditambah 6 menghasilkan total 26 ribu rupiah.'
    }
  ],

  expert: [
    {
      id: 'exp_1',
      level: 'Expert',
      topic: 'Persamaan Linear Sederhana',
      question: 'Tentukan nilai x yang memenuhi persamaan: 2x + 4 = 12',
      katex: '2x + 4 = 12',
      options: ['4', '3', '6', '8'],
      correctAnswer: '4',
      explanation: 'Kurangkan kedua ruas dengan 4: 2x = 8. Bagi kedua ruas dengan 2: x = 4.'
    },
    {
      id: 'exp_2',
      level: 'Expert',
      topic: 'Keseimbangan Persamaan Neraca',
      question: 'Jika 3x + 5 = 14 seimbang di neraca, berapakah nilai x?',
      katex: '3x + 5 = 14',
      options: ['4', '3', '2', '5'],
      correctAnswer: '3',
      explanation: 'Kurangkan 5 di kedua ruas: 3x = 9. Bagi dengan 3: x = 3.'
    },
    {
      id: 'exp_3',
      level: 'Expert',
      topic: 'Persamaan dengan Pengurangan',
      question: 'Berapakah nilai x pada persamaan: 3x - 1 = 14?',
      katex: '3x - 1 = 14',
      options: ['4', '15', '5', '3'],
      correctAnswer: '5',
      explanation: 'Tambahkan 1 pada kedua ruas: 3x = 15. Bagi kedua ruas dengan 3: x = 5.'
    },
    {
      id: 'exp_4',
      level: 'Expert',
      topic: 'Persamaan Satu Langkah',
      question: 'Tentukan nilai x jika 4x = 28',
      katex: '4x = 28',
      options: ['6', '8', '14', '7'],
      correctAnswer: '7',
      explanation: 'Bagi kedua ruas dengan 4: x = 28 ÷ 4 = 7.'
    },
    {
      id: 'exp_5',
      level: 'Expert',
      topic: 'Persamaan Dua Langkah',
      question: 'Jika 5x - 5 = 20, berapakah nilai x?',
      katex: '5x - 5 = 20',
      options: ['5', '4', '3', '6'],
      correctAnswer: '5',
      explanation: 'Tambahkan 5 di kedua ruas: 5x = 25. Bagi kedua ruas dengan 5: x = 5.'
    }
  ]
};

/**
 * Mengacak array menggunakan algoritma Fisher-Yates shuffle yang terbukti adil.
 * Menerima fungsi rng opsional untuk mendukung unit test dengan deterministic seed.
 */
export function shuffleArray(array, rng = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Menyiapkan soal dengan mengacak opsi jawaban secara aman.
 * Menghitung ulang indeks dan label jawaban benar ('A' | 'B' | 'C' | 'D')
 * tanpa merusak isi pertanyaan, nilai matematika, maupun validitas jawaban.
 */
export function prepareQuestion(question, rng = Math.random) {
  if (!question || !Array.isArray(question.options)) return question;

  // Acak urutan opsi jawaban menggunakan Fisher-Yates
  const shuffledOptions = shuffleArray(question.options, rng);

  // Cari posisi baru jawaban benar setelah diacak
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

/**
 * Melacak soal terakhir agar tidak muncul berturut-turut pada sesi yang sama
 */
let lastQuestionId = null;

export function resetLastQuestionId() {
  lastQuestionId = null;
}

/**
 * Mengambil soal acak berdasarkan level dengan opsi yang sudah diacak secara aman.
 */
export function getRandomQuestion(level = 'beginner', rng = Math.random) {
  const pool = QUESTION_BANK[level] || QUESTION_BANK.beginner;
  const filtered = pool.filter(q => q.id !== lastQuestionId);
  const candidates = filtered.length > 0 ? filtered : pool;
  const chosen = candidates[Math.floor(rng() * candidates.length)];
  lastQuestionId = chosen.id;
  return prepareQuestion(chosen, rng);
}

/**
 * Mengembalikan seluruh 20 soal untuk keperluan audit, pengujian, dan verifikasi.
 */
export function getAllQuestions() {
  return [
    ...QUESTION_BANK.beginner,
    ...QUESTION_BANK.intermediate,
    ...QUESTION_BANK.advanced,
    ...QUESTION_BANK.expert
  ];
}
