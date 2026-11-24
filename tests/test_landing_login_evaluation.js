/**
 * AUTOMATED TEST SUITE: NUMORA SPACE REVISION VALIDATION
 * Landing Page, Official OAuth & Meta Policy, 10-Question Evaluation, and Researcher Isolation
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  EVALUATION_QUESTIONS,
  CATEGORY_COUNTS,
  getShuffledEvaluationQuestions,
  calculateEvaluationResult
} from '../frontend/src/features/learning/evaluationQuestions.js';

console.log('================================================================');
console.log('--- TEST SUITE: NUMORA SPACE LANDING, LOGIN & EVALUATION AUDIT ---');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(description, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`  ✓ [PASS] ${description}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
    process.exit(1);
  }
}

// ====================================================================
// GROUP 1: EVALUATION QUESTION BANK INTEGRITY & EXACT 3+3+2+2 DISTRIBUTION
// ====================================================================
console.log('▶ GROUP 1: Evaluasi Mandiri — Bank Soal & Distribusi 3+3+2+2...');

runTest('Total soal evaluasi tepat 10 butir soal', () => {
  assert.strictEqual(EVALUATION_QUESTIONS.length, 10, 'Bank soal harus memiliki tepat 10 butir soal');
});

runTest('Distribusi kategori: Menentukan Variabel tepat 3 soal', () => {
  const count = EVALUATION_QUESTIONS.filter(q => q.categoryTitle === 'Menentukan Variabel').length;
  assert.strictEqual(count, 3, `Menentukan Variabel harus 3 soal, ditemukan: ${count}`);
  assert.strictEqual(CATEGORY_COUNTS['Menentukan Variabel'], 3);
});

runTest('Distribusi kategori: Memahami Koefisien tepat 3 soal', () => {
  const count = EVALUATION_QUESTIONS.filter(q => q.categoryTitle === 'Memahami Koefisien').length;
  assert.strictEqual(count, 3, `Memahami Koefisien harus 3 soal, ditemukan: ${count}`);
  assert.strictEqual(CATEGORY_COUNTS['Memahami Koefisien'], 3);
});

runTest('Distribusi kategori: Memahami Konstanta tepat 2 soal', () => {
  const count = EVALUATION_QUESTIONS.filter(q => q.categoryTitle === 'Memahami Konstanta').length;
  assert.strictEqual(count, 2, `Memahami Konstanta harus 2 soal, ditemukan: ${count}`);
  assert.strictEqual(CATEGORY_COUNTS['Memahami Konstanta'], 2);
});

runTest('Distribusi kategori: Memahami Bentuk Aljabar tepat 2 soal', () => {
  const count = EVALUATION_QUESTIONS.filter(q => q.categoryTitle === 'Memahami Bentuk Aljabar').length;
  assert.strictEqual(count, 2, `Memahami Bentuk Aljabar harus 2 soal, ditemukan: ${count}`);
  assert.strictEqual(CATEGORY_COUNTS['Memahami Bentuk Aljabar'], 2);
});

runTest('Setiap butir soal memiliki 4 opsi jawaban, kunci jawaban valid, dan pembahasan', () => {
  EVALUATION_QUESTIONS.forEach((q, idx) => {
    assert(q.id, `Soal index ${idx} harus memiliki ID`);
    assert(q.question, `Soal ${q.id} harus memiliki teks pertanyaan`);
    assert(Array.isArray(q.options) && q.options.length === 4, `Soal ${q.id} harus memiliki tepat 4 opsi pilihan ganda`);
    assert(q.correctAnswer, `Soal ${q.id} harus memiliki correctAnswer`);
    assert(q.options.includes(q.correctAnswer), `Opsi soal ${q.id} harus memuat jawaban benar "${q.correctAnswer}"`);
    assert(q.explanation && q.explanation.length > 20, `Soal ${q.id} harus memiliki pembahasan komprehensif`);
  });
});

// ====================================================================
// GROUP 2: SHUFFLE FAIRNESS & DETERMINISTIC RETRIEVAL
// ====================================================================
console.log('\n▶ GROUP 2: Pengacakan Soal (Fisher-Yates) & Konsistensi Opsi...');

runTest('Pengacakan mengembalikan tepat 10 butir soal tanpa duplikasi ID', () => {
  const shuffled = getShuffledEvaluationQuestions();
  assert.strictEqual(shuffled.length, 10, 'Hasil acak harus 10 soal');
  const ids = new Set(shuffled.map(q => q.id));
  assert.strictEqual(ids.size, 10, 'Seluruh ID soal hasil acak harus unik');
});

runTest('Distribusi kategori 3+3+2+2 tetap utuh setelah pengacakan', () => {
  const shuffled = getShuffledEvaluationQuestions();
  const catCounts = {};
  shuffled.forEach(q => {
    catCounts[q.categoryTitle] = (catCounts[q.categoryTitle] || 0) + 1;
  });
  assert.strictEqual(catCounts['Menentukan Variabel'], 3);
  assert.strictEqual(catCounts['Memahami Koefisien'], 3);
  assert.strictEqual(catCounts['Memahami Konstanta'], 2);
  assert.strictEqual(catCounts['Memahami Bentuk Aljabar'], 2);
});

runTest('Kunci jawaban tetap valid pada opsi yang telah diacak', () => {
  for (let i = 0; i < 5; i++) {
    const shuffled = getShuffledEvaluationQuestions();
    shuffled.forEach(q => {
      assert(q.options.includes(q.correctAnswer), `Soal ${q.id} kehilangan jawaban benar setelah acak opsi`);
    });
  }
});

// ====================================================================
// GROUP 3: AUTOMATED SCORING & CATEGORY MASTERY CALCULATION
// ====================================================================
console.log('\n▶ GROUP 3: Perhitungan Nilai Otomatis (0-100) & Diagnosis Kategori...');

runTest('Skor 100/100 jika seluruh 10 soal dijawab dengan benar', () => {
  const answers = {};
  EVALUATION_QUESTIONS.forEach(q => {
    answers[q.id] = q.correctAnswer;
  });
  const res = calculateEvaluationResult(answers, EVALUATION_QUESTIONS);
  assert.strictEqual(res.score, 100, 'Skor harus 100');
  assert.strictEqual(res.correctCount, 10, 'Jumlah benar harus 10');
  assert.strictEqual(res.percentage, 100);
  assert(Array.isArray(res.categoryAnalysis));
  res.categoryAnalysis.forEach(cat => {
    assert.strictEqual(cat.percentage, 100, `Kategori ${cat.title} harus 100%`);
    assert.strictEqual(cat.masteryStatus, 'Sangat Baik');
  });
});

runTest('Skor 0/100 jika seluruh jawaban salah', () => {
  const answers = {};
  EVALUATION_QUESTIONS.forEach(q => {
    const wrong = q.options.find(opt => opt !== q.correctAnswer);
    answers[q.id] = wrong;
  });
  const res = calculateEvaluationResult(answers, EVALUATION_QUESTIONS);
  assert.strictEqual(res.score, 0, 'Skor harus 0');
  assert.strictEqual(res.correctCount, 0, 'Jumlah benar harus 0');
  assert.strictEqual(res.percentage, 0);
  assert(Array.isArray(res.categoryAnalysis));
  res.categoryAnalysis.forEach(cat => {
    assert.strictEqual(cat.percentage, 0);
    assert.strictEqual(cat.masteryStatus, 'Perlu Pendalaman');
    assert(cat.recommendation.includes('Disarankan mempelajari kembali'));
  });
});

runTest('Skor parsial dihitung secara akurat dan adil (misal 70/100)', () => {
  const answers = {};
  // Jawab 7 benar, 3 salah
  EVALUATION_QUESTIONS.forEach((q, idx) => {
    if (idx < 7) {
      answers[q.id] = q.correctAnswer;
    } else {
      answers[q.id] = q.options.find(opt => opt !== q.correctAnswer);
    }
  });
  const res = calculateEvaluationResult(answers, EVALUATION_QUESTIONS);
  assert.strictEqual(res.score, 70, 'Skor harus 70');
  assert.strictEqual(res.correctCount, 7);
  assert.strictEqual(res.percentage, 70);
});

// ====================================================================
// GROUP 4: ROUTING, LANDING PAGE FIRST & OAUTH/META DISCLOSURE
// ====================================================================
console.log('\n▶ GROUP 4: Verifikasi Landing Page Utama, OAuth & Kebijakan Meta...');

runTest('Route root (/) menampilkan Landing Page secara langsung', () => {
  const appPath = path.resolve('frontend/src/App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert(appContent.includes('path="/" element={<LandingPage />}'), 'Route "/" harus merender <LandingPage /> secara langsung');
  assert(appContent.includes('path="/landing" element={<LandingPage />}'), 'Route "/landing" harus merender <LandingPage />');
  assert(appContent.includes('path="/login" element={<LoginHandler />}'), 'Route "/login" harus merender <LoginHandler />');
});

runTest('Landing Page memuat Hero Section, Brand Logo (Navbar), dan tombol navigasi aktif', () => {
  const landingPath = path.resolve('frontend/src/pages/LandingPage.jsx');
  const landingContent = fs.readFileSync(landingPath, 'utf8');
  assert(landingContent.includes('Memahami Aljabar dengan Makna') || landingContent.includes('Bukan Menghafal Rumus'), 'Landing page harus memuat headline utama aljabar');
  assert(landingContent.includes('Navbar'), 'Landing page harus memuat Navbar');
  assert(landingContent.includes('/login'), 'Landing page harus memiliki tautan/tombol ke login');
});

runTest('Halaman Login memiliki tombol Google OAuth resmi', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(loginContent.includes('Masuk dengan Google') || loginContent.includes('Google'), 'Halaman login harus memuat Google OAuth');
  assert(loginContent.includes('loginWithGoogle'), 'LoginPage harus memanggil fungsi loginWithGoogle');
});

runTest('Halaman Login tidak menawarkan autentikasi Instagram yang tidak didukung', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(!loginContent.includes('Masuk dengan Instagram'), 'Login tidak boleh memiliki tombol Instagram');
  assert(!loginContent.includes('showInstagramModal'), 'Login tidak boleh memiliki modal Instagram');
});

runTest('Halaman Login tidak menyediakan kredensial atau kontrol demo', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(!loginContent.includes('Demo Siswa'), 'Tidak boleh ada tombol demo siswa');
  assert(!loginContent.includes('Demo Peneliti'), 'Tidak boleh ada tombol demo peneliti');
  assert(!loginContent.includes('DEMO_ACCOUNTS'), 'Login tidak boleh mengimpor daftar akun demo');
});

// ====================================================================
// GROUP 5: CLIENT-SIDE SCORES ARE NOT RESEARCH RECORDS
// ====================================================================
console.log('\n▶ GROUP 5: Integritas Data Evaluasi Penelitian...');

runTest('ResearcherDashboard tidak menggunakan skor localStorage sebagai data penelitian', () => {
  const researcherPath = path.resolve('frontend/src/pages/ResearcherDashboard.jsx');
  const researcherContent = fs.readFileSync(researcherPath, 'utf8');
  assert(!researcherContent.includes('numora_evaluation_results_S-002'), 'Skor browser S-002 bukan data penelitian terverifikasi');
  assert(!researcherContent.includes('numora_evaluation_results_S-001'), 'Skor browser S-001 bukan data penelitian terverifikasi');
  assert(!researcherContent.includes('localStorage'), 'Dashboard peneliti tidak boleh membaca hasil dari browser');
  assert(researcherContent.includes('S-001 (Kontrol)'), 'Dashboard harus menampilkan S-001 sebagai kontrol');
  assert(researcherContent.includes('S-002 (Eksperimen)'), 'Dashboard harus menampilkan S-002 sebagai eksperimen');
  assert(researcherContent.includes('PROTOCOL_TEMPLATE'), 'Data subjek tetap harus dilabeli sebagai template protokol');
  assert(researcherContent.includes('tidak ditampilkan atau diekspor sebagai data penelitian'), 'Dashboard harus menjelaskan eksklusi skor lokal');
});

runTest('Ekspor hanya menandai skor evaluasi sebagai belum dikumpulkan dari sumber tepercaya', () => {
  const researcherPath = path.resolve('frontend/src/pages/ResearcherDashboard.jsx');
  const researcherContent = fs.readFileSync(researcherPath, 'utf8');
  assert(researcherContent.includes('Evaluation_Score'), 'Header CSV harus menyertakan Evaluation_Score');
  assert(researcherContent.includes('NOT_COLLECTED'), 'CSV tidak boleh mengklaim skor browser sebagai hasil penelitian');
  assert(researcherContent.includes('research_data_integrity_notice'), 'JSON harus menjelaskan keterbatasan sumber data');
  assert(!researcherContent.includes('evaluation_records'), 'JSON tidak boleh mengekspor skor client-side sebagai record riset');
});

runTest('Hasil evaluasi lokal tetap tersedia untuk pembelajaran siswa', () => {
  const challengePath = path.resolve('frontend/src/features/learning/MathematicalChallenge.jsx');
  const challengeContent = fs.readFileSync(challengePath, 'utf8');
  assert(challengeContent.includes('localStorage.setItem(storageKey'), 'Siswa tetap dapat menyimpan progres belajar lokal');
});

runTest('Hook otomasi evaluasi dan NUMORA RUN hanya aktif pada development', () => {
  const challengeContent = fs.readFileSync(
    path.resolve('frontend/src/features/learning/MathematicalChallenge.jsx'),
    'utf8'
  );
  const runnerContent = fs.readFileSync(
    path.resolve('frontend/src/features/runner/NumoraRunner3D.jsx'),
    'utf8'
  );

  assert(challengeContent.includes('import.meta.env.DEV && typeof window'), 'Hook evaluasi harus development-only');
  assert(runnerContent.includes('import.meta.env.DEV && typeof window'), 'Hook game harus development-only');
});
console.log('\n================================================================');
console.log(`--- HASIL TEST: ${passedTests}/${totalTests} UJIAN LULUS (PASS) ---`);
console.log('================================================================\n');
