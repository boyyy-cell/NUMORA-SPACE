/**
 * Data Dokumentasi Hasil Wawancara Siswa (S-001 & S-002)
 * Sumber: Wawancara_Lengkap_NUMORA_SPACE_S001_S002(1).docx
 *
 * Catatan Metodologi & Integritas:
 * - Menampilkan jawaban contoh siswa yang diimpor secara terstruktur dari dokumen sumber.
 * - Tidak mengubah atau mengarang isi pertanyaan dan jawaban.
 * - Digunakan khusus untuk keperluan dokumentasi kualitatif dan tinjauan instrumen peneliti (P-001).
 */

export const INTERVIEW_METADATA = {
  title: 'Dokumentasi Hasil Wawancara Siswa',
  documentSource: 'Wawancara_Lengkap_NUMORA_SPACE_S001_S002(1).docx',
  description: 'Dokumentasi kualitatif komparatif persepsi pembelajaran aljabar antara subjek kontrol (tatap muka langsung) dan subjek eksperimen (pembelajaran berbantuan NUMORA Space).',
  disclaimer: 'Dokumentasi ini bersumber dari dokumen resmi Wawancara_Lengkap_NUMORA_SPACE_S001_S002(1).docx dan memuat jawaban contoh siswa. Teks disajikan sesuai dokumen asli tanpa manipulasi data aktivitas, skor, maupun sesi penelitian.',
  totalSubjects: 2,
  subjects: [
    {
      id: 'S-001',
      name: 'Subjek Kontrol (S-001)',
      group: 'Kontrol',
      treatment: 'Pembelajaran Langsung (Tatap Muka Konvensional)',
      focus: 'Interaksi langsung dengan peneliti, penjelasan verbal terpandu, dan latihan soal manual.',
      badgeColor: 'bg-forest/10 text-forest border-forest/20',
      totalQuestions: 10
    },
    {
      id: 'S-002',
      name: 'Subjek Eksperimen (S-002)',
      group: 'Eksperimen',
      treatment: 'Pembelajaran Berbantuan NUMORA Space',
      focus: 'Eksplorasi mandiri, scaffolding tutor AI NORA, fitur petunjuk (Hint), dan visualisasi aljabar.',
      badgeColor: 'bg-terracotta/10 text-terracotta border-terracotta/20',
      totalQuestions: 10
    }
  ]
};

export const S001_INTERVIEW_QUESTIONS = [
  {
    id: 's001-q1',
    number: 1,
    subjectId: 'S-001',
    category: 'Pemahaman Materi',
    question: 'Apakah kamu memahami materi bentuk aljabar yang dijelaskan oleh peneliti?',
    answer: 'Iya, saya cukup memahami setelah peneliti menjelaskan dan memberikan beberapa contoh soal. Kalau dijelaskan pelan-pelan, saya lebih mudah mengikuti.'
  },
  {
    id: 's001-q2',
    number: 2,
    subjectId: 'S-001',
    category: 'Materi Termudah',
    question: 'Bagian materi mana yang paling mudah kamu pahami?',
    answer: 'Menurut saya menentukan variabel paling mudah, karena variabel biasanya berupa huruf seperti x atau y yang mewakili suatu nilai.'
  },
  {
    id: 's001-q3',
    number: 3,
    subjectId: 'S-001',
    category: 'Materi Tersulit',
    question: 'Bagian materi mana yang menurutmu paling sulit?',
    answer: 'Saya kadang masih bingung menentukan koefisien, terutama kalau bentuk aljabarnya memiliki beberapa suku.'
  },
  {
    id: 's001-q4',
    number: 4,
    subjectId: 'S-001',
    category: 'Diferensiasi Konsep',
    question: 'Apakah kamu bisa membedakan variabel, koefisien, dan konstanta?',
    answer: 'Bisa. Variabel itu huruf, koefisien adalah angka yang mengalikan variabel, sedangkan konstanta adalah angka yang berdiri sendiri.'
  },
  {
    id: 's001-q5',
    number: 5,
    subjectId: 'S-001',
    category: 'Peran Contoh Soal',
    question: 'Apakah contoh soal yang diberikan membantu kamu memahami materi?',
    answer: 'Iya, karena setelah melihat contoh, saya jadi tahu langkah-langkah mengerjakan soal. Contoh juga membuat penjelasan lebih jelas.'
  },
  {
    id: 's001-q6',
    number: 6,
    subjectId: 'S-001',
    category: 'Strategi Mengatasi Kesulitan',
    question: 'Apa yang kamu lakukan ketika menemukan soal yang sulit?',
    answer: 'Biasanya saya membaca soal lagi, mencoba mengerjakan dari awal, lalu bertanya kepada peneliti kalau masih belum mengerti.'
  },
  {
    id: 's001-q7',
    number: 7,
    subjectId: 'S-001',
    category: 'Efikasi Diri',
    question: 'Apakah kamu merasa percaya diri ketika mengerjakan soal aljabar?',
    answer: 'Cukup percaya diri untuk soal yang mirip dengan contoh. Kalau bentuk soalnya berbeda atau lebih panjang, saya masih takut salah.'
  },
  {
    id: 's001-q8',
    number: 8,
    subjectId: 'S-001',
    category: 'Minat Belajar',
    question: 'Apakah pembelajaran langsung membuat kamu lebih tertarik mempelajari matematika?',
    answer: 'Iya, karena saya bisa bertanya secara langsung dan peneliti bisa menjelaskan lagi kalau ada bagian yang belum saya pahami.'
  },
  {
    id: 's001-q9',
    number: 9,
    subjectId: 'S-001',
    category: 'Kesulitan Soal Cerita',
    question: 'Apakah kamu masih mengalami kesulitan ketika menyelesaikan soal cerita tentang aljabar?',
    answer: 'Masih, terutama ketika harus menentukan huruf yang cocok untuk mewakili sesuatu di dalam cerita, lalu mengubahnya menjadi bentuk aljabar.'
  },
  {
    id: 's001-q10',
    number: 10,
    subjectId: 'S-001',
    category: 'Saran Pembelajaran',
    question: 'Apa saranmu agar pembelajaran aljabar menjadi lebih mudah dipahami?',
    answer: 'Menurut saya, sebaiknya diberikan lebih banyak contoh dari kehidupan sehari-hari, misalnya tentang belanja, uang, atau jumlah barang.'
  }
];

export const S002_INTERVIEW_QUESTIONS = [
  {
    id: 's002-q1',
    number: 1,
    subjectId: 'S-002',
    category: 'Kesan Platform',
    question: 'Bagaimana pendapatmu setelah belajar aljabar menggunakan NUMORA Space?',
    answer: 'Menurut saya menarik, karena saya bisa belajar materi aljabar melalui aplikasi dan mencoba latihan soal sendiri.'
  },
  {
    id: 's002-q2',
    number: 2,
    subjectId: 'S-002',
    category: 'Kemudahan Penjelasan NORA',
    question: 'Apakah penjelasan NORA mudah kamu pahami?',
    answer: 'Cukup mudah dipahami. Saya bisa membaca penjelasannya lagi kalau masih bingung, jadi tidak harus mengingat semuanya sekaligus.'
  },
  {
    id: 's002-q3',
    number: 3,
    subjectId: 'S-002',
    category: 'Efektivitas Petunjuk (Hint)',
    question: 'Apakah fitur petunjuk (Hint) membantu ketika kamu kesulitan mengerjakan soal?',
    answer: 'Iya, karena petunjuknya membantu saya memikirkan langkah berikutnya. Saya jadi punya gambaran cara mengerjakan soal.'
  },
  {
    id: 's002-q4',
    number: 4,
    subjectId: 'S-002',
    category: 'Kontekstualisasi Variabel',
    question: 'Apakah contoh soal dalam NUMORA Space membantu kamu memahami variabel?',
    answer: 'Iya. Contoh tentang harga barang dan jumlah benda membantu saya memahami bahwa huruf bisa digunakan untuk mewakili nilai yang belum diketahui.'
  },
  {
    id: 's002-q5',
    number: 5,
    subjectId: 'S-002',
    category: 'Diferensiasi Konsep',
    question: 'Apakah kamu sudah bisa membedakan variabel, koefisien, dan konstanta?',
    answer: 'Saya sudah lebih paham. Misalnya pada 3x + 5, x adalah variabel, 3 adalah koefisien, dan 5 adalah konstanta.'
  },
  {
    id: 's002-q6',
    number: 6,
    subjectId: 'S-002',
    category: 'Fitur Paling Membantu',
    question: 'Fitur apa yang paling membantu selama pembelajaran?',
    answer: 'Menurut saya penjelasan NORA dan fitur Hint paling membantu, terutama saat saya tidak langsung tahu cara menjawab soal.'
  },
  {
    id: 's002-q7',
    number: 7,
    subjectId: 'S-002',
    category: 'Kemandirian Belajar',
    question: 'Apakah kamu merasa lebih mudah belajar secara mandiri menggunakan NUMORA Space?',
    answer: 'Iya, karena saya bisa membaca materi dan mengerjakan latihan sesuai kecepatan saya sendiri. Kalau salah, saya bisa mencoba memahami lagi.'
  },
  {
    id: 's002-q8',
    number: 8,
    subjectId: 'S-002',
    category: 'Hambatan Penggunaan',
    question: 'Apakah kamu pernah merasa bingung ketika menggunakan aplikasi? Jika iya, bagian apa?',
    answer: 'Pernah. Pada awalnya saya masih mencari letak beberapa menu dan perlu waktu untuk terbiasa dengan urutan pembelajarannya.'
  },
  {
    id: 's002-q9',
    number: 9,
    subjectId: 'S-002',
    category: 'Efikasi Diri Digital',
    question: 'Apakah NUMORA Space membuat kamu lebih percaya diri dalam menyelesaikan soal aljabar?',
    answer: 'Saya merasa lebih berani mencoba karena ada petunjuk ketika mengalami kesulitan. Tetapi saya tetap perlu latihan supaya tidak bergantung pada petunjuk.'
  },
  {
    id: 's002-q10',
    number: 10,
    subjectId: 'S-002',
    category: 'Saran Pengembangan Platform',
    question: 'Menurutmu, apa yang perlu diperbaiki dari NUMORA Space?',
    answer: 'Menurut saya latihan soalnya bisa ditambah dan penjelasannya dibuat singkat tetapi tetap jelas. Menu aplikasi juga sebaiknya mudah ditemukan.'
  }
];

export const DEEPENING_QUESTIONS = [
  {
    id: 'deep-1',
    number: 1,
    focus: 'Contoh Konkret Unsur Aljabar',
    question: 'Bisa ceritakan contohnya?',
    s001_answer: 'Contohnya pada 3x + 5, saya melihat angka 3 berada di depan x dan angka 5 berdiri sendiri.',
    s002_answer: 'Pada 3x + 5, x adalah variabel, 3 koefisien, dan 5 konstanta.'
  },
  {
    id: 'deep-2',
    number: 2,
    focus: 'Dasar Pemilihan Jawaban',
    question: 'Mengapa kamu memilih jawaban tersebut?',
    s001_answer: 'Karena saya mengikuti penjelasan dan contoh yang diberikan saat pembelajaran.',
    s002_answer: 'Karena saya mengingat penjelasan materi dan petunjuk yang saya pelajari di NUMORA Space.'
  },
  {
    id: 'deep-3',
    number: 3,
    focus: 'Prosedur Penyelesaian Masalah',
    question: 'Bagaimana cara kamu mendapatkan jawaban itu?',
    s001_answer: 'Saya membaca soal, mencari informasi yang diketahui, lalu menentukan operasi atau bentuk aljabarnya.',
    s002_answer: 'Saya membaca soal, mencoba menentukan informasi penting, lalu menggunakan materi dan Hint jika diperlukan.'
  },
  {
    id: 'deep-4',
    number: 4,
    focus: 'Faktor Penyebab Kesulitan',
    question: 'Apa yang membuat bagian tersebut sulit?',
    s001_answer: 'Saya kadang bingung mengubah kalimat dalam soal cerita menjadi simbol matematika.',
    s002_answer: 'Saya kadang bingung memilih variabel yang tepat dan memahami soal yang kalimatnya panjang.'
  },
  {
    id: 'deep-5',
    number: 5,
    focus: 'Artikulasi Konsep Mandiri',
    question: 'Apakah kamu bisa menjelaskan kembali dengan bahasamu sendiri?',
    s001_answer: 'Bentuk aljabar adalah bentuk matematika yang memakai angka dan huruf. Hurufnya bisa mewakili nilai yang belum diketahui.',
    s002_answer: 'Bentuk aljabar adalah penulisan matematika yang terdiri dari angka, huruf, dan operasi hitung, misalnya 3x + 5.'
  }
];

export const INTERVIEW_SUMMARY_ASPECTS = [
  {
    id: 'sum-1',
    number: 1,
    aspect: 'Pemahaman konsep',
    iconName: 'BookOpen',
    summary: 'Kedua contoh siswa menyatakan dapat membedakan variabel, koefisien, dan konstanta, tetapi masih memerlukan latihan untuk menerapkan konsep pada soal yang berbeda.',
    comparativeInsight: 'Kedua subjek menguasai pembedaan simbolis dasar (3x + 5), namun fleksibilitas penerapan pada variasi struktur soal memerlukan pembiasaan berkelanjutan.'
  },
  {
    id: 'sum-2',
    number: 2,
    aspect: 'Kesulitan utama',
    iconName: 'AlertTriangle',
    summary: 'Contoh kesulitan yang muncul adalah mengubah soal cerita menjadi bentuk aljabar dan mengidentifikasi unsur-unsur bentuk aljabar.',
    comparativeInsight: 'Transisi dari representasi verbal (bahasa alami) menuju representasi simbolik aljabar menjadi titik krusial beban kognitif pada kedua pendekatan.'
  },
  {
    id: 'sum-3',
    number: 3,
    aspect: 'Strategi saat kesulitan',
    iconName: 'Compass',
    summary: 'S-001 mencontohkan membaca ulang soal dan bertanya langsung. S-002 mencontohkan membaca ulang materi, mencoba kembali, dan menggunakan petunjuk aplikasi.',
    comparativeInsight: 'S-001 mengandalkan bantuan eksternal guru/peneliti secara verbal, sementara S-002 memanfaatkan scaffolding bertahap (Hint) dan re-reading digital mandiri.'
  },
  {
    id: 'sum-4',
    number: 4,
    aspect: 'Pengalaman pembelajaran',
    iconName: 'Sparkles',
    summary: 'Jawaban S-001 menekankan kesempatan bertanya langsung. Jawaban S-002 menekankan belajar mandiri, penjelasan NORA, dan fitur Hint.',
    comparativeInsight: 'Kenyamanan afektif S-001 terbentuk dari interaksi interpersonal, sedangkan S-002 merasakan otonomi belajar (self-paced learning) tanpa tekanan waktu.'
  },
  {
    id: 'sum-5',
    number: 5,
    aspect: 'Saran perbaikan',
    iconName: 'Lightbulb',
    summary: 'Contoh saran meliputi penambahan soal kontekstual, latihan bertahap, penjelasan yang ringkas, dan navigasi aplikasi yang mudah.',
    comparativeInsight: 'Rekomendasi berfokus pada relevansi dunia nyata (belanja/barang konkret), pemadatan teks penjelasan, dan simplifikasi alur menu.'
  }
];
