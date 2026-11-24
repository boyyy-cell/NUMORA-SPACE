/**
 * BANK SOAL EVALUASI MANDIRI ALJABAR — SMP KELAS VII
 * Sesuai Kurikulum Merdeka & Standar Literasi Matematika NUMORA Space
 * 
 * Distribusi 10 Soal Wajib:
 * 1. Menentukan Variabel: 3 soal (id: 'var-1', 'var-2', 'var-3')
 * 2. Memahami Koefisien: 3 soal (id: 'coef-1', 'coef-2', 'coef-3')
 * 3. Memahami Konstanta: 2 soal (id: 'const-1', 'const-2')
 * 4. Memahami Bentuk Aljabar: 2 soal (id: 'expr-1', 'expr-2')
 * TOTAL = 10 SOAL
 */

export const CATEGORIES = {
  variable: {
    id: 'variable',
    title: 'Menentukan Variabel',
    totalRequired: 3,
    moduleRef: 'Modul 01: Mengenal Variabel'
  },
  coefficient: {
    id: 'coefficient',
    title: 'Memahami Koefisien',
    totalRequired: 3,
    moduleRef: 'Modul 02: Memahami Koefisien'
  },
  constant: {
    id: 'constant',
    title: 'Memahami Konstanta',
    totalRequired: 2,
    moduleRef: 'Modul 03: Mengidentifikasi Konstanta'
  },
  expression: {
    id: 'expression',
    title: 'Memahami Bentuk Aljabar',
    totalRequired: 2,
    moduleRef: 'Modul 04: Menyusun Bentuk Aljabar'
  }
};

export const CATEGORY_COUNTS = {
  'Menentukan Variabel': 3,
  'Memahami Koefisien': 3,
  'Memahami Konstanta': 2,
  'Memahami Bentuk Aljabar': 2
};

export const EVALUATION_QUESTIONS = [
  // --- 1. MENENTUKAN VARIABEL (3 SOAL) ---
  {
    id: 'var-1',
    category: 'variable',
    categoryTitle: 'Menentukan Variabel',
    question: 'Pada bentuk aljabar 5p + 3q - 8, huruf manakah yang bertindak sebagai variabel?',
    expressionLatex: '5p + 3q - 8',
    options: [
      '5 dan 3',
      'p dan q',
      '-8',
      '5p dan 3q'
    ],
    correctAnswer: 'p dan q',
    explanation: 'Variabel adalah lambang pengganti suatu bilangan yang belum diketahui nilainya secara pasti, yang dilambangkan dengan huruf (pada soal ini adalah p dan q). Angka 5 dan 3 adalah koefisien, sedangkan -8 adalah konstanta.'
  },
  {
    id: 'var-2',
    category: 'variable',
    categoryTitle: 'Menentukan Variabel',
    question: 'Seorang pedagang membeli m kardus biskuit dan n dus susu di pasar grosir. Huruf m dan n dalam konteks aljabar tersebut berperan sebagai...',
    expressionLatex: 'm \\text{ dan } n',
    options: [
      'Konstanta bernilai tetap yang tidak berubah',
      'Koefisien pengali harga satuan barang',
      'Variabel yang menyatakan banyaknya kardus yang belum diketahui isinya',
      'Suku sejenis yang bernilai identik'
    ],
    correctAnswer: 'Variabel yang menyatakan banyaknya kardus yang belum diketahui isinya',
    explanation: 'Huruf m dan n bertindak sebagai variabel karena mewakili kuantitas fisik (jumlah kardus) yang nilainya dapat bervariasi tergantung pembelian.'
  },
  {
    id: 'var-3',
    category: 'variable',
    categoryTitle: 'Menentukan Variabel',
    question: 'Perhatikan bentuk aljabar 2x² - 4x + 7. Variabel dasar yang digunakan pada bentuk aljabar tersebut adalah...',
    expressionLatex: '2x^2 - 4x + 7',
    options: [
      'Hanya x',
      'x dan x² sebagai dua huruf berbeda',
      '2 dan -4',
      '7'
    ],
    correctAnswer: 'Hanya x',
    explanation: 'Variabel dasarnya hanyalah x. Pangkat 2 pada x² merupakan derajat eksponen dari variabel yang sama, bukan merupakan variabel baru.'
  },

  // --- 2. MEMAHAMI KOEFISIEN (3 SOAL) ---
  {
    id: 'coef-1',
    category: 'coefficient',
    categoryTitle: 'Memahami Koefisien',
    question: 'Pada bentuk aljabar 12 - 7y + 4x, berapakah nilai bilangan koefisien dari variabel y?',
    expressionLatex: '12 - 7y + 4x',
    options: [
      '7',
      '-7',
      '12',
      '4'
    ],
    correctAnswer: '-7',
    explanation: 'Koefisien adalah faktor pengali numerik dari suatu variabel. Tanda pengurangan di depan 7y merupakan bagian yang melekat pada koefisien tersebut, sehingga koefisien y bernilai -7.'
  },
  {
    id: 'coef-2',
    category: 'coefficient',
    categoryTitle: 'Memahami Koefisien',
    question: 'Berapakah nilai koefisien dari suku -a pada bentuk aljabar 5b - a + 10?',
    expressionLatex: '5b - a + 10',
    options: [
      '0',
      '1',
      '-1',
      'Tidak memiliki koefisien'
    ],
    correctAnswer: '-1',
    explanation: 'Secara matematis, suku -a bermakna (-1) × a. Angka 1 biasanya tidak dituliskan secara eksplisit, sehingga koefisien dari variabel a adalah -1.'
  },
  {
    id: 'coef-3',
    category: 'coefficient',
    categoryTitle: 'Memahami Koefisien',
    question: 'Diberikan bentuk aljabar 9x - 4y + 25. Pasangan nilai koefisien dari variabel x dan y berturut-turut adalah...',
    expressionLatex: '9x - 4y + 25',
    options: [
      '9 dan 4',
      '9 dan -4',
      '9 dan 25',
      '-4 dan 25'
    ],
    correctAnswer: '9 dan -4',
    explanation: 'Koefisien x adalah 9, dan koefisien y adalah -4. Angka 25 adalah konstanta mandiri yang tidak mengalikan variabel mana pun.'
  },

  // --- 3. MEMAHAMI KONSTANTA (2 SOAL) ---
  {
    id: 'const-1',
    category: 'constant',
    categoryTitle: 'Memahami Konstanta',
    question: 'Bentuk aljabar saldo tabungan siswa setelah biaya administrasi dinyatakan dengan 4k - 15. Bilangan yang bertindak sebagai konstanta adalah...',
    expressionLatex: '4k - 15',
    options: [
      '4',
      'k',
      '15',
      '-15'
    ],
    correctAnswer: '-15',
    explanation: 'Konstanta adalah suku berupa bilangan tunggal yang tidak memuat variabel. Pengurangan 15 setara dengan penambahan (-15), sehingga nilai konstantanya adalah -15.'
  },
  {
    id: 'const-2',
    category: 'constant',
    categoryTitle: 'Memahami Konstanta',
    question: 'Pada bentuk aljabar 3a² + 5b - 2a + 20, suku manakah yang nilainya selalu tetap dan tidak dipengaruhi oleh perubahan nilai variabel a maupun b?',
    expressionLatex: '3a^2 + 5b - 2a + 20',
    options: [
      '3',
      '5',
      '-2',
      '20'
    ],
    correctAnswer: '20',
    explanation: 'Bilangan 20 berdiri sendiri tanpa variabel (konstanta), sehingga nilainya tetap konstan berapapun nilai a dan b yang disubstitusikan.'
  },

  // --- 4. MEMAHAMI BENTUK ALJABAR (2 SOAL) ---
  {
    id: 'expr-1',
    category: 'expression',
    categoryTitle: 'Memahami Bentuk Aljabar',
    question: 'Setelah disederhanakan dengan mengelompokkan suku-suku sejenis, berapa banyak suku yang terdapat pada bentuk aljabar 7x - 3y + 5x - 4?',
    expressionLatex: '7x - 3y + 5x - 4',
    options: [
      '4 suku',
      '3 suku (yaitu 12x - 3y - 4)',
      '2 suku (yaitu 9xy - 4)',
      '1 suku'
    ],
    correctAnswer: '3 suku (yaitu 12x - 3y - 4)',
    explanation: 'Suku sejenis 7x dan +5x dijumlahkan menjadi 12x. Bentuk sederhananya adalah 12x - 3y - 4, yang terdiri dari tepat 3 suku yang tidak dapat disederhanakan lagi.'
  },
  {
    id: 'expr-2',
    category: 'expression',
    categoryTitle: 'Memahami Bentuk Aljabar',
    question: 'Jika harga sebuah buku tulis dinyatakan dengan variabel b = 4 (dalam ribuan rupiah), maka nilai dari bentuk aljabar 3b + 7 adalah...',
    expressionLatex: '3b + 7 \\quad (b = 4)',
    options: [
      '19 (Rp19.000)',
      '12 (Rp12.000)',
      '34 (Rp34.000)',
      '28 (Rp28.000)'
    ],
    correctAnswer: '19 (Rp19.000)',
    explanation: 'Substitusikan nilai b = 4 ke dalam bentuk aljabar: 3(4) + 7 = 12 + 7 = 19 (atau setara dengan Rp19.000).'
  }
];

/**
 * Mengacak urutan soal (Fisher-Yates) sambil mempertahankan komposisi
 * tepat 10 soal dari 4 materi wajib (3 Variabel + 3 Koefisien + 2 Konstanta + 2 Bentuk Aljabar).
 */
export function getShuffledEvaluationQuestions() {
  const items = [...EVALUATION_QUESTIONS];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Menghitung nilai akhir (0-100) dan analisis per materi secara akurat.
 */
export function calculateEvaluationResult(studentAnswers, questionsList) {
  const list = questionsList || EVALUATION_QUESTIONS;
  let correctCount = 0;
  
  const categoryStats = {
    variable: { correct: 0, total: 3, title: 'Menentukan Variabel', moduleRef: 'Modul 01: Mengenal Variabel' },
    coefficient: { correct: 0, total: 3, title: 'Memahami Koefisien', moduleRef: 'Modul 02: Memahami Koefisien' },
    constant: { correct: 0, total: 2, title: 'Memahami Konstanta', moduleRef: 'Modul 03: Mengidentifikasi Konstanta' },
    expression: { correct: 0, total: 2, title: 'Memahami Bentuk Aljabar', moduleRef: 'Modul 04: Menyusun Bentuk Aljabar' }
  };

  const questionReviews = list.map((q, idx) => {
    const chosen = studentAnswers[q.id];
    const isCorrect = chosen === q.correctAnswer;
    if (isCorrect) {
      correctCount += 1;
      if (categoryStats[q.category]) {
        categoryStats[q.category].correct += 1;
      }
    }
    return {
      questionNumber: idx + 1,
      id: q.id,
      category: q.category,
      categoryTitle: q.categoryTitle,
      question: q.question,
      expressionLatex: q.expressionLatex,
      chosenAnswer: chosen || 'Tidak Dijawab',
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation
    };
  });

  const totalQuestions = list.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const percentage = score;
  const wrongCount = totalQuestions - correctCount;

  // Analisis penguasaan dan rekomendasi per materi
  const categoryAnalysis = Object.keys(categoryStats).map((catKey) => {
    const item = categoryStats[catKey];
    const catPercent = Math.round((item.correct / item.total) * 100);
    
    let masteryStatus = 'Sangat Baik';
    let recommendation = `Pertahankan pemahaman konsep ${item.title}.`;
    
    if (catPercent < 50) {
      masteryStatus = 'Perlu Pendalaman';
      recommendation = `Disarankan mempelajari kembali ${item.moduleRef} dan mencoba simulasi interaktif di Algebra Lab.`;
    } else if (catPercent < 100) {
      masteryStatus = 'Cukup Baik';
      recommendation = `Perbanyak latihan soal pada ${item.moduleRef} untuk memantapkan pemahaman tanda dan simbol.`;
    }

    return {
      categoryKey: catKey,
      title: item.title,
      correct: item.correct,
      total: item.total,
      percentage: catPercent,
      masteryStatus,
      recommendation
    };
  });

  return {
    score,
    percentage,
    correctCount,
    wrongCount,
    totalQuestions,
    categoryAnalysis,
    questionReviews,
    timestamp: new Date().toISOString()
  };
}
