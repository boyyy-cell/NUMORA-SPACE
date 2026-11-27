/**
 * Data Instrumen Penelitian NUMORA Space
 * Kurikulum: Aljabar SMP Kelas VII
 *
 * Memuat:
 * 1. Tes Evaluasi Pemahaman Aljabar (10 soal baku)
 * 2. Pedoman Wawancara Siswa (10 pertanyaan utama + 5 pendalaman)
 * 3. Lembar Observasi Pembelajaran (15 indikator dalam 4 aspek)
 * 4. Prosedur Pengumpulan Data Komparatif (S-001 Kontrol vs S-002 Eksperimen)
 */

export const INSTRUMENT_METADATA = {
  title: 'Instrumen Penelitian Aljabar SMP Kelas VII',
  subtitle: 'Kumpulan instrumen pengumpulan data kuantitatif dan kualitatif untuk penelitian pembelajaran aljabar.',
  targetGrade: 'SMP Kelas VII',
  subjectArea: 'Matematika - Bentuk Aljabar (Kurikulum Merdeka)',
  disclaimer: 'Seluruh instrumen dirancang sebagai instrumen baku siap pakai di lapangan. Kunci jawaban dilindungi untuk akses peneliti dan data observasi/wawancara diisi secara empiris saat sesi pengumpulan data nyata berlangsung.'
};

export const EVALUATION_TEST_QUESTIONS = [
  // A. Variabel (3 Soal)
  {
    number: 1,
    id: 'var-1',
    category: 'Variabel',
    categoryKey: 'variabel',
    question: 'Perhatikan bentuk aljabar 5x + 7. Huruf yang merupakan variabel adalah ....',
    prompt: 'Perhatikan bentuk aljabar 5x + 7. Huruf yang merupakan variabel adalah ....',
    indicator: 'Mengidentifikasi simbol variabel',
    math: '5x + 7',
    mathContent: '5x + 7',
    answerKey: 'x',
    explanation: 'Variabel adalah lambang pengganti suatu bilangan yang belum diketahui nilainya secara pasti, biasanya dilambangkan dengan huruf kecil. Pada bentuk aljabar 5x + 7, variabelnya adalah x.',
    points: 10
  },
  {
    number: 2,
    id: 'var-2',
    category: 'Variabel',
    categoryKey: 'variabel',
    question: 'Rina memiliki sejumlah buku. Jika jumlah buku tersebut belum diketahui dan dinyatakan dengan huruf n, bentuk yang tepat untuk menyatakan jumlah buku adalah ....',
    prompt: 'Rina memiliki sejumlah buku. Jika jumlah buku tersebut belum diketahui dan dinyatakan dengan huruf n, bentuk yang tepat untuk menyatakan jumlah buku adalah ....',
    indicator: 'Memodelkan kuantitas dengan variabel',
    math: 'n',
    mathContent: 'n',
    answerKey: 'n',
    explanation: 'Karena jumlah buku belum diketahui nilainya, jumlah tersebut dinyatakan dengan simbol variabel n.',
    points: 10
  },
  {
    number: 3,
    id: 'var-3',
    category: 'Variabel',
    categoryKey: 'variabel',
    question: 'Pada bentuk aljabar 3a + 2b - 5, variabel yang digunakan adalah ....',
    prompt: 'Pada bentuk aljabar 3a + 2b - 5, variabel yang digunakan adalah ....',
    indicator: 'Menentukan lebih dari satu variabel',
    math: '3a + 2b - 5',
    mathContent: '3a + 2b - 5',
    answerKey: 'a dan b',
    explanation: 'Bentuk aljabar ini memuat dua huruf pemisal yaitu a dan b sebagai variabel pengali koefisien 3 dan 2.',
    points: 10
  },

  // B. Koefisien (3 Soal)
  {
    number: 4,
    id: 'coef-1',
    category: 'Koefisien',
    categoryKey: 'koefisien',
    question: 'Pada bentuk aljabar 4a - 9, berapakah koefisien dari a?',
    prompt: 'Pada bentuk aljabar 4a - 9, berapakah koefisien dari a?',
    indicator: 'Menentukan koefisien positif',
    math: '4a - 9',
    mathContent: '4a - 9',
    answerKey: '4',
    explanation: 'Koefisien adalah faktor konstanta (faktor pengali numerik) dari suatu suku pada bentuk aljabar. Angka di depan variabel a adalah 4.',
    points: 10
  },
  {
    number: 5,
    id: 'coef-2',
    category: 'Koefisien',
    categoryKey: 'koefisien',
    question: 'Pada bentuk aljabar -6y + 2, berapakah koefisien dari y?',
    prompt: 'Pada bentuk aljabar -6y + 2, berapakah koefisien dari y?',
    indicator: 'Menentukan koefisien bernilai negatif',
    math: '-6y + 2',
    mathContent: '-6y + 2',
    answerKey: '-6',
    explanation: 'Angka yang mengalikan variabel y adalah bilangan negatif 6 (-6), sehingga koefisien dari y adalah -6.',
    points: 10
  },
  {
    number: 6,
    id: 'coef-3',
    category: 'Koefisien',
    categoryKey: 'koefisien',
    question: 'Pada bentuk aljabar 3x + 5y - 8, tentukan semua koefisiennya.',
    prompt: 'Pada bentuk aljabar 3x + 5y - 8, tentukan semua koefisiennya.',
    indicator: 'Menentukan koefisien dua suku berbeda',
    math: '3x + 5y - 8',
    mathContent: '3x + 5y - 8',
    answerKey: '3 dan 5',
    explanation: 'Koefisien dari x adalah 3 dan koefisien dari y adalah 5. Nilai -8 adalah konstanta murni.',
    points: 10
  },

  // C. Konstanta (2 Soal)
  {
    number: 7,
    id: 'const-1',
    category: 'Konstanta',
    categoryKey: 'konstanta',
    question: 'Pada bentuk aljabar 3m - 11, tentukan konstantanya.',
    prompt: 'Pada bentuk aljabar 3m - 11, tentukan konstantanya.',
    indicator: 'Menentukan konstanta bertanda negatif',
    math: '3m - 11',
    mathContent: '3m - 11',
    answerKey: '-11',
    explanation: 'Konstanta adalah suku dari suatu bentuk aljabar yang berupa bilangan dan tidak memuat variabel. Pada suku 3m - 11, nilai tetapnya adalah -11.',
    points: 10
  },
  {
    number: 8,
    id: 'const-2',
    category: 'Konstanta',
    categoryKey: 'konstanta',
    question: 'Pada bentuk aljabar 7p + 4 - 2q, tentukan konstantanya.',
    prompt: 'Pada bentuk aljabar 7p + 4 - 2q, tentukan konstantanya.',
    indicator: 'Menentukan konstanta di antara suku variabel',
    math: '7p + 4 - 2q',
    mathContent: '7p + 4 - 2q',
    answerKey: '4',
    explanation: 'Suku yang berdiri sendiri tanpa terikat variabel p maupun q adalah positif 4 (+4).',
    points: 10
  },

  // D. Bentuk Aljabar (2 Soal)
  {
    number: 9,
    id: 'expr-1',
    category: 'Bentuk Aljabar',
    categoryKey: 'bentuk_aljabar',
    question: 'Sebuah toko menjual kotak pensil. Setiap kotak berisi x pensil. Jika Rani membeli 3 kotak pensil dan 5 pensil lepas, tuliskan bentuk aljabar yang menyatakan jumlah seluruh pensil.',
    prompt: 'Sebuah toko menjual kotak pensil. Setiap kotak berisi x pensil. Jika Rani membeli 3 kotak pensil dan 5 pensil lepas, tuliskan bentuk aljabar yang menyatakan jumlah seluruh pensil.',
    indicator: 'Menyusun bentuk aljabar dari soal cerita',
    math: '3x + 5',
    mathContent: '3x + 5',
    answerKey: '3x + 5',
    explanation: 'Setiap kotak memuat x pensil sehingga 3 kotak bernilai 3 · x = 3x pensil. Ditambah 5 pensil lepas, bentuk aljabar totalnya adalah 3x + 5.',
    points: 10
  },
  {
    number: 10,
    id: 'expr-2',
    category: 'Bentuk Aljabar',
    categoryKey: 'bentuk_aljabar',
    question: 'Tentukan suku, variabel, koefisien, dan konstanta dari bentuk aljabar 6x - 4.',
    prompt: 'Tentukan suku, variabel, koefisien, dan konstanta dari bentuk aljabar 6x - 4.',
    indicator: 'Menganalisis seluruh komponen aljabar',
    math: '6x - 4',
    mathContent: '6x - 4',
    answerKey: 'Suku: 6x dan -4 | Variabel: x | Koefisien: 6 | Konstanta: -4',
    explanation: 'Bentuk aljabar 6x - 4 terdiri atas suku 6x dan -4; variabelnya x; koefisien dari x adalah 6; dan konstantanya adalah -4.',
    points: 10,
    partialScoring: {
      suku: { label: 'Menentukan suku (6x dan -4)', points: 3 },
      variabel: { label: 'Menentukan variabel (x)', points: 2 },
      koefisien: { label: 'Menentukan koefisien (6)', points: 2 },
      konstanta: { label: 'Menentukan konstanta (-4)', points: 3 }
    }
  }
];

export const SCORING_RUBRIC = {
  correctPoints: 10,
  incorrectOrEmptyPoints: 0,
  maxTotalScore: 100,
  categories: [
    { name: 'Variabel', count: 3, questionCount: 3, maxPoints: 30, maxScore: 30, questions: [1, 2, 3], description: 'Identifikasi lambang variabel dan kuantitas belum diketahui' },
    { name: 'Koefisien', count: 3, questionCount: 3, maxPoints: 30, maxScore: 30, questions: [4, 5, 6], description: 'Penentuan nilai koefisien positif, negatif, dan multi-suku' },
    { name: 'Konstanta', count: 2, questionCount: 2, maxPoints: 20, maxScore: 20, questions: [7, 8], description: 'Penentuan nilai suku konstan pada ekspresi aljabar' },
    { name: 'Bentuk Aljabar', count: 2, questionCount: 2, maxPoints: 20, maxScore: 20, questions: [9, 10], description: 'Pemodelan soal cerita dan analisis struktur suku-variabel-koefisien-konstanta' }
  ]
};

export const INTERVIEW_PROTOCOL_QUESTIONS = [
  // A. Pertanyaan Utama (10 Pertanyaan)
  {
    id: 'int-1',
    number: 1,
    type: 'main',
    question: 'Apakah kamu memahami materi bentuk aljabar yang dijelaskan atau dipelajari?',
    coreQuestion: 'Apakah kamu memahami materi bentuk aljabar yang dijelaskan atau dipelajari?',
    focus: 'Pemahaman materi umum',
    focusArea: 'Pemahaman materi umum',
    s001_context: 'Fokus pada kejelasan penjelasan tatap muka langsung dan contoh papan tulis dari peneliti.',
    s001Context: 'Fokus pada kejelasan penjelasan tatap muka langsung dan contoh papan tulis dari peneliti.',
    s002_context: 'Fokus pada kejelasan materi modul digital dan penjelasan interaktif dari NORA AI.',
    s002Context: 'Fokus pada kejelasan materi modul digital dan penjelasan interaktif dari NORA AI.'
  },
  {
    id: 'int-2',
    number: 2,
    type: 'main',
    question: 'Bagian materi mana yang paling mudah kamu pahami?',
    coreQuestion: 'Bagian materi mana yang paling mudah kamu pahami?',
    focus: 'Kemudahan konsep (variabel/koefisien/konstanta)',
    focusArea: 'Kemudahan konsep (variabel/koefisien/konstanta)',
    s001_context: 'Mengeksplorasi bagian materi yang paling cepat dipahami saat pembelajaran langsung.',
    s001Context: 'Mengeksplorasi bagian materi yang paling cepat dipahami saat pembelajaran langsung.',
    s002_context: 'Mengeksplorasi modul atau fitur platform yang paling cepat dipahami secara mandiri.',
    s002Context: 'Mengeksplorasi modul atau fitur platform yang paling cepat dipahami secara mandiri.'
  },
  {
    id: 'int-3',
    number: 3,
    type: 'main',
    question: 'Bagian materi mana yang menurutmu paling sulit?',
    coreQuestion: 'Bagian materi mana yang menurutmu paling sulit?',
    focus: 'Faktor hambatan pemahaman',
    focusArea: 'Faktor hambatan pemahaman',
    s001_context: 'Menggali bagian konsep aljabar yang paling membingungkan saat diterangkan langsung.',
    s001Context: 'Menggali bagian konsep aljabar yang paling membingungkan saat diterangkan langsung.',
    s002_context: 'Menggali bagian konsep yang menimbulkan keraguan saat belajar di NUMORA Space.',
    s002Context: 'Menggali bagian konsep yang menimbulkan keraguan saat belajar di NUMORA Space.'
  },
  {
    id: 'int-4',
    number: 4,
    type: 'main',
    question: 'Apakah kamu bisa membedakan variabel, koefisien, dan konstanta?',
    coreQuestion: 'Apakah kamu bisa membedakan variabel, koefisien, dan konstanta?',
    focus: 'Diferensiasi konseptual',
    focusArea: 'Diferensiasi konseptual',
    s001_context: 'Meminta siswa mendiferensiasikan ketiga unsur aljabar secara lisan.',
    s001Context: 'Meminta siswa mendiferensiasikan ketiga unsur aljabar secara lisan.',
    s002_context: 'Meminta siswa mendiferensiasikan ketiga unsur berdasarkan latihan di platform.',
    s002Context: 'Meminta siswa mendiferensiasikan ketiga unsur berdasarkan latihan di platform.'
  },
  {
    id: 'int-5',
    number: 5,
    type: 'main',
    question: 'Apakah contoh soal yang diberikan membantu kamu memahami materi?',
    coreQuestion: 'Apakah contoh soal yang diberikan membantu kamu memahami materi?',
    focus: 'Peran scaffolding contoh',
    focusArea: 'Peran scaffolding contoh',
    s001_context: 'Menilai efektivitas contoh soal yang dikerjakan bersama peneliti di lembar kerja.',
    s001Context: 'Menilai efektivitas contoh soal yang dikerjakan bersama peneliti di lembar kerja.',
    s002_context: 'Menilai efektivitas contoh interaktif dan visualisasi analogi di NUMORA Space.',
    s002Context: 'Menilai efektivitas contoh interaktif dan visualisasi analogi di NUMORA Space.'
  },
  {
    id: 'int-6',
    number: 6,
    type: 'main',
    question: 'Apa yang kamu lakukan ketika menemukan soal yang sulit?',
    coreQuestion: 'Apa yang kamu lakukan ketika menemukan soal yang sulit?',
    focus: 'Strategi pemecahan masalah',
    focusArea: 'Strategi pemecahan masalah',
    s001_context: 'Melihat kebiasaan bertanya langsung kepada guru/peneliti atau membaca ulang buku.',
    s001Context: 'Melihat kebiasaan bertanya langsung kepada guru/peneliti atau membaca ulang buku.',
    s002_context: 'Melihat pemanfaatan fitur petunjuk (Hint) dan re-reading penjelasan NORA.',
    s002Context: 'Melihat pemanfaatan fitur petunjuk (Hint) dan re-reading penjelasan NORA.'
  },
  {
    id: 'int-7',
    number: 7,
    type: 'main',
    question: 'Apakah kamu merasa percaya diri ketika mengerjakan soal aljabar?',
    coreQuestion: 'Apakah kamu merasa percaya diri ketika mengerjakan soal aljabar?',
    focus: 'Efikasi diri matematis',
    focusArea: 'Efikasi diri matematis',
    s001_context: 'Mengukur rasa percaya diri saat mengerjakan soal latihan tatap muka tanpa bantuan.',
    s001Context: 'Mengukur rasa percaya diri saat mengerjakan soal latihan tatap muka tanpa bantuan.',
    s002_context: 'Mengukur rasa percaya diri saat menyelesaikan latihan tantangan di platform.',
    s002Context: 'Mengukur rasa percaya diri saat menyelesaikan latihan tantangan di platform.'
  },
  {
    id: 'int-8',
    number: 8,
    type: 'main',
    question: 'Apakah pembelajaran yang kamu ikuti membuat kamu lebih tertarik mempelajari matematika?',
    coreQuestion: 'Apakah pembelajaran yang kamu ikuti membuat kamu lebih tertarik mempelajari matematika?',
    focus: 'Afektif dan minat belajar',
    focusArea: 'Afektif dan minat belajar',
    s001_context: 'Menilai daya tarik metode pengajaran konvensional terarah bersama peneliti.',
    s001Context: 'Menilai daya tarik metode pengajaran konvensional terarah bersama peneliti.',
    s002_context: 'Menilai daya tarik lingkungan pembelajaran gamifikasi dan AI NUMORA Space.',
    s002Context: 'Menilai daya tarik lingkungan pembelajaran gamifikasi dan AI NUMORA Space.'
  },
  {
    id: 'int-9',
    number: 9,
    type: 'main',
    question: 'Apakah kamu masih mengalami kesulitan ketika menyelesaikan soal cerita tentang aljabar?',
    coreQuestion: 'Apakah kamu masih mengalami kesulitan ketika menyelesaikan soal cerita tentang aljabar?',
    focus: 'Representasi simbolik soal cerita',
    focusArea: 'Representasi simbolik soal cerita',
    s001_context: 'Menelaah hambatan translasi bahasa verbal ke ekspresi aljabar di kelas.',
    s001Context: 'Menelaah hambatan translasi bahasa verbal ke ekspresi aljabar di kelas.',
    s002_context: 'Menelaah hambatan translasi soal cerita pada simulasi digital.',
    s002Context: 'Menelaah hambatan translasi soal cerita pada simulasi digital.'
  },
  {
    id: 'int-10',
    number: 10,
    type: 'main',
    question: 'Apa saranmu agar pembelajaran aljabar menjadi lebih mudah dipahami?',
    coreQuestion: 'Apa saranmu agar pembelajaran aljabar menjadi lebih mudah dipahami?',
    focus: 'Umpan balik perbaikan',
    focusArea: 'Umpan balik perbaikan',
    s001_context: 'Mengumpulkan saran perbaikan untuk pengajaran tatap muka di kelas.',
    s001Context: 'Mengumpulkan saran perbaikan untuk pengajaran tatap muka di kelas.',
    s002_context: 'Mengumpulkan saran perbaikan untuk pengembangan fitur dan antarmuka NUMORA Space.',
    s002Context: 'Mengumpulkan saran perbaikan untuk pengembangan fitur dan antarmuka NUMORA Space.'
  },

  // B. Pertanyaan Pendalaman (5 Pertanyaan)
  {
    id: 'int-11',
    number: 11,
    deepNumber: 1,
    type: 'deepening',
    question: 'Bisa ceritakan contohnya?',
    coreQuestion: 'Bisa ceritakan contohnya?',
    focus: 'Kemampuan abstraksi konkret',
    focusArea: 'Kemampuan abstraksi konkret',
    s001_context: 'Meminta contoh langsung dari catatan materi tatap muka.',
    s001Context: 'Meminta contoh langsung dari catatan materi tatap muka.',
    s002_context: 'Meminta contoh yang diingat siswa dari modul aplikasi NUMORA.',
    s002Context: 'Meminta contoh yang diingat siswa dari modul aplikasi NUMORA.'
  },
  {
    id: 'int-12',
    number: 12,
    deepNumber: 2,
    type: 'deepening',
    question: 'Mengapa kamu memilih jawaban tersebut?',
    coreQuestion: 'Mengapa kamu memilih jawaban tersebut?',
    focus: 'Penalaran dan justifikasi logis',
    focusArea: 'Penalaran dan justifikasi logis',
    s001_context: 'Mengeksplorasi alasan logis berdasarkan penjelasan guru.',
    s001Context: 'Mengeksplorasi alasan logis berdasarkan penjelasan guru.',
    s002_context: 'Mengeksplorasi alasan logis berdasarkan konsep yang dipelajari di aplikasi.',
    s002Context: 'Mengeksplorasi alasan logis berdasarkan konsep yang dipelajari di aplikasi.'
  },
  {
    id: 'int-13',
    number: 13,
    deepNumber: 3,
    type: 'deepening',
    question: 'Bagaimana cara kamu mendapatkan jawaban itu?',
    coreQuestion: 'Bagaimana cara kamu mendapatkan jawaban itu?',
    focus: 'Langkah prosedural metakognisi',
    focusArea: 'Langkah prosedural metakognisi',
    s001_context: 'Mengetahui urutan langkah manual siswa saat menghitung di kertas.',
    s001Context: 'Mengetahui urutan langkah manual siswa saat menghitung di kertas.',
    s002_context: 'Mengetahui langkah siswa dalam memproses petunjuk dan materi di aplikasi.',
    s002Context: 'Mengetahui langkah siswa dalam memproses petunjuk dan materi di aplikasi.'
  },
  {
    id: 'int-14',
    number: 14,
    deepNumber: 4,
    type: 'deepening',
    question: 'Apa yang membuat bagian tersebut sulit?',
    coreQuestion: 'Apa yang membuat bagian tersebut sulit?',
    focus: 'Faktor atribusi kesulitan',
    focusArea: 'Faktor atribusi kesulitan',
    s001_context: 'Mengidentifikasi sumber beban pemrosesan kognitif tatap muka.',
    s001Context: 'Mengidentifikasi sumber beban pemrosesan kognitif tatap muka.',
    s002_context: 'Mengidentifikasi sumber kebingungan atau kendala antarmuka aplikasi.',
    s002Context: 'Mengidentifikasi sumber kebingungan atau kendala antarmuka aplikasi.'
  },
  {
    id: 'int-15',
    number: 15,
    deepNumber: 5,
    type: 'deepening',
    question: 'Apakah kamu bisa menjelaskan kembali dengan bahasamu sendiri?',
    coreQuestion: 'Apakah kamu bisa menjelaskan kembali dengan bahasamu sendiri?',
    focus: 'Artikulasi konseptual orisinal',
    focusArea: 'Artikulasi konseptual orisinal',
    s001_context: 'Mendengar perumusan pengertian aljabar dengan kalimat siswa sendiri.',
    s001Context: 'Mendengar perumusan pengertian aljabar dengan kalimat siswa sendiri.',
    s002_context: 'Mendengar pemahaman mandiri siswa setelah berinteraksi dengan AI NORA.',
    s002Context: 'Mendengar pemahaman mandiri siswa setelah berinteraksi dengan AI NORA.'
  }
];

export const OBSERVATION_ASPECTS = [
  {
    id: 'A',
    aspectId: 'A',
    title: 'A. Pemahaman Konsep',
    description: 'Mengamati kemampuan siswa dalam mengenali dan membedakan unsur-unsur dasar aljabar.',
    indicators: [
      { id: 'obs-a1', code: 'A.1', text: 'Siswa mampu mengidentifikasi variabel.' },
      { id: 'obs-a2', code: 'A.2', text: 'Siswa mampu menentukan koefisien.' },
      { id: 'obs-a3', code: 'A.3', text: 'Siswa mampu mengidentifikasi konstanta.' },
      { id: 'obs-a4', code: 'A.4', text: 'Siswa mampu mengenali bentuk aljabar.' }
    ]
  },
  {
    id: 'B',
    aspectId: 'B',
    title: 'B. Aktivitas Pembelajaran',
    description: 'Mengamati partisipasi aktif, atensi, dan inisiatif siswa selama sesi pembelajaran berlangsung.',
    indicators: [
      { id: 'obs-b1', code: 'B.1', text: 'Siswa memperhatikan penjelasan.' },
      { id: 'obs-b2', code: 'B.2', text: 'Siswa mengikuti kegiatan pembelajaran.' },
      { id: 'obs-b3', code: 'B.3', text: 'Siswa mencoba menyelesaikan latihan.' },
      { id: 'obs-b4', code: 'B.4', text: 'Siswa bertanya ketika mengalami kesulitan.' }
    ]
  },
  {
    id: 'C',
    aspectId: 'C',
    title: 'C. Strategi Penyelesaian',
    description: 'Mengamati pendekatan metakognitif siswa dalam mengurai dan menyelesaikan persoalan aljabar.',
    indicators: [
      { id: 'obs-c1', code: 'C.1', text: 'Siswa membaca dan memahami soal.' },
      { id: 'obs-c2', code: 'C.2', text: 'Siswa mengidentifikasi informasi penting.' },
      { id: 'obs-c3', code: 'C.3', text: 'Siswa mencoba langkah penyelesaian.' },
      { id: 'obs-c4', code: 'C.4', text: 'Siswa memeriksa kembali jawabannya.' }
    ]
  },
  {
    id: 'D',
    aspectId: 'D',
    title: 'D. Respons Pembelajaran',
    description: 'Mengamati motivasi, daya juang, dan kepercayaan diri siswa dalam menghadapi tantangan matematis.',
    indicators: [
      { id: 'obs-d1', code: 'D.1', text: 'Siswa menunjukkan ketertarikan.' },
      { id: 'obs-d2', code: 'D.2', text: 'Siswa menunjukkan kepercayaan diri.' },
      { id: 'obs-d3', code: 'D.3', text: 'Siswa menunjukkan usaha ketika menemui kesulitan.' }
    ]
  }
];

export const RESEARCH_PROCEDURES = {
  s001_control: {
    code: 'S-001',
    label: 'Kelompok Kontrol',
    treatment: 'Pembelajaran Tatap Muka Langsung bersama Peneliti',
    description: 'Prosedur pengumpulan data pada kelompok kontrol yang mengikuti kegiatan pembelajaran aljabar secara tatap muka langsung konvensional bersama Peneliti Utama tanpa intervensi digital NUMORA Space maupun NORA AI.',
    steps: [
      {
        step: 1,
        title: 'Pembelajaran Tatap Muka Langsung bersama Peneliti',
        description: 'Peneliti Utama membuka sesi pembelajaran, mengondisikan kesiapan belajar siswa, serta menyampaikan tujuan pembelajaran konsep dasar aljabar di ruang kelas/tatap muka.',
        activity: 'Orientasi dan apersepsi tatap muka langsung'
      },
      {
        step: 2,
        title: 'Pemberian Materi Aljabar Konvensional',
        description: 'Peneliti Utama menerangkan konsep variabel, koefisien, konstanta, dan pembentukan bentuk aljabar secara verbal menggunakan papan tulis dan lembar materi fisik serta membimbing latihan contoh soal.',
        activity: 'Penjelasan konsep, contoh soal, dan tanya jawab manual'
      },
      {
        step: 3,
        title: 'Pelaksanaan Tes Evaluasi Pemahaman Aljabar',
        description: 'Siswa mengerjakan 10 butir instrumen tes evaluasi pemahaman aljabar secara mandiri pada lembar tes untuk mengukur capaian penguasaan konsep.',
        activity: 'Pengerjaan 10 butir tes evaluasi pemahaman (tertulis)'
      },
      {
        step: 4,
        title: 'Pelaksanaan Wawancara Mendalam Siswa',
        description: 'Peneliti Utama memandu sesi wawancara kualitatif terstruktur menggunakan Pedoman Wawancara (10 pertanyaan utama dan 5 pertanyaan pendalaman) guna menggali refleksi pemahaman konsep, kendala, dan strategi berpikir siswa.',
        activity: 'Wawancara mendalam dan pencatatan respons lisan'
      },
      {
        step: 5,
        title: 'Pencatatan Lembar Observasi Pembelajaran & Dokumentasi',
        description: 'Peneliti Utama melengkapi 15 indikator pada Lembar Observasi Pembelajaran (Aspek A s.d. D), merekapitulasi seluruh lembar kerja fisik, serta mendokumentasikan dan menyimpan berkas hasil penelitian secara aman.',
        activity: 'Pencatatan observasi empiris, verifikasi berkas, dan pengarsipan data riset'
      }
    ]
  },
  s002_experiment: {
    code: 'S-002',
    label: 'Kelompok Eksperimen',
    treatment: 'Pembelajaran Berbantuan NUMORA Space & Pendampingan NORA AI',
    description: 'Prosedur pengumpulan data pada kelompok eksperimen yang melaksanakan pembelajaran mandiri berbantuan platform web interaktif NUMORA Space dengan pendampingan scaffolding pedagogis dari NORA AI.',
    steps: [
      {
        step: 1,
        title: 'Onboarding & Orientasi Platform NUMORA Space',
        description: 'Siswa masuk (login) ke platform web NUMORA Space, memahami tata letak modul, serta menerima orientasi singkat mengenai interaksi fitur belajar dan asisten virtual NORA AI.',
        activity: 'Akses sistem, pengenalan modul, dan orientasi interaksi NORA AI'
      },
      {
        step: 2,
        title: 'Pembelajaran Mandiri & Latihan dengan Pendampingan NORA AI',
        description: 'Siswa mengeksplorasi modul konsep aljabar, memanfaatkan bantuan petunjuk bertahap (Hint), berinteraksi melalui tanya jawab dengan NORA AI, serta mencoba simulasi Algebra Lab secara mandiri.',
        activity: 'Eksplorasi materi digital, interaksi AI scaffolding, dan simulasi lab'
      },
      {
        step: 3,
        title: 'Pelaksanaan Tes Evaluasi Pemahaman Aljabar',
        description: 'Siswa menyelesaikan 10 butir instrumen tes evaluasi pemahaman aljabar yang setara untuk mengukur pemahaman konsep variabel, koefisien, konstanta, dan bentuk aljabar.',
        activity: 'Pengerjaan 10 butir tes evaluasi pemahaman'
      },
      {
        step: 4,
        title: 'Pelaksanaan Wawancara Mendalam Siswa',
        description: 'Peneliti Utama melakukan wawancara mendalam berpedoman pada 10 pertanyaan utama dan 5 pertanyaan pendalaman yang difokuskan pada pengalaman berinteraksi dengan platform NUMORA Space, kemandirian belajar, dan kejelasan bantuan NORA AI.',
        activity: 'Wawancara kualitatif terstruktur dan perekaman persepsi belajar'
      },
      {
        step: 5,
        title: 'Pencatatan Observasi, Integrasi Log Sistem & Dokumentasi',
        description: 'Peneliti Utama mengisi 15 indikator Lembar Observasi Pembelajaran, memvalidasi rekaman log aktivitas belajar dari platform, serta mendokumentasikan dan mengarsipkan data penelitian secara terstruktur.',
        activity: 'Pencatatan observasi, sinkronisasi log sistem, dan penyimpanan data riset'
      }
    ]
  }
};
