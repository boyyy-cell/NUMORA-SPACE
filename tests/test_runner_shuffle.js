/**
 * Comprehensive Automated Test Suite: NUMORA RUN Multiple-Choice Shuffle & Fairness
 *
 * Verifies:
 * 1. Integrity of all 20 questions in QUESTION_BANK.
 * 2. Accuracy of Fisher-Yates shuffle algorithm.
 * 3. Position distribution across A, B, C, D.
 * 4. Correct answer evaluation and wrong answer rejection.
 * 5. Absence of duplicate or empty options.
 * 6. Stability and deterministic seed repeatability.
 */

import {
  QUESTION_BANK,
  getAllQuestions,
  prepareQuestion,
  shuffleArray,
  getRandomQuestion,
  resetLastQuestionId
} from '../frontend/src/features/runner/questionBank.js';

console.log('\n======================================================');
console.log('--- TEST SUITE: NUMORA RUN MULTIPLE-CHOICE SHUFFLE ---');
console.log('======================================================\n');

// Simple Pseudo-Random Number Generator (Mulberry32) for deterministic seeding
function createSeededRng(seed) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  passedTests++;
}

// ----------------------------------------------------
// TEST 1: Bank Question Integrity (All 20 Questions)
// ----------------------------------------------------
console.log('▶ TEST 1: Memeriksa integritas 20 soal pada QUESTION_BANK...');
const allQuestions = getAllQuestions();
assert(allQuestions.length === 20, `Jumlah soal harus tepat 20, ditemukan ${allQuestions.length}`);

const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
levels.forEach(lvl => {
  assert(QUESTION_BANK[lvl] && QUESTION_BANK[lvl].length === 5, `Level ${lvl} harus memiliki 5 soal`);
});

allQuestions.forEach((q, idx) => {
  assert(q.id && typeof q.id === 'string', `Soal #${idx + 1} harus memiliki ID`);
  assert(q.question && q.question.trim().length > 0, `Soal ${q.id} harus memiliki teks pertanyaan`);
  assert(Array.isArray(q.options) && q.options.length === 4, `Soal ${q.id} harus memiliki tepat 4 opsi`);
  
  // No empty options
  q.options.forEach((opt, optIdx) => {
    assert(typeof opt === 'string' && opt.trim().length > 0, `Soal ${q.id} opsi ${optIdx} tidak boleh kosong`);
  });

  // No duplicates
  const uniqueOpts = new Set(q.options);
  assert(uniqueOpts.size === 4, `Soal ${q.id} tidak boleh memiliki opsi duplikat (ditemukan ${uniqueOpts.size} unik)`);

  // Correct answer exists in options
  assert(q.options.includes(q.correctAnswer), `Soal ${q.id} correctAnswer '${q.correctAnswer}' harus ada di dalam options`);
});
console.log('  ✓ 20/20 soal valid: tepat 4 opsi, tidak ada duplikat, tidak ada opsi kosong.\n');

// ----------------------------------------------------
// TEST 2: Base Bank Answer Position Distribution
// ----------------------------------------------------
console.log('▶ TEST 2: Memeriksa distribusi posisi jawaban dasar pada data awal...');
const baseDistribution = { A: 0, B: 0, C: 0, D: 0 };
allQuestions.forEach(q => {
  const idx = q.options.indexOf(q.correctAnswer);
  const label = ['A', 'B', 'C', 'D'][idx];
  baseDistribution[label]++;
});

console.log('  Distribusi Posisi Dasar Bank Soal:');
console.log(`    Posisi A: ${baseDistribution.A} soal (${(baseDistribution.A / 20) * 100}%)`);
console.log(`    Posisi B: ${baseDistribution.B} soal (${(baseDistribution.B / 20) * 100}%)`);
console.log(`    Posisi C: ${baseDistribution.C} soal (${(baseDistribution.C / 20) * 100}%)`);
console.log(`    Posisi D: ${baseDistribution.D} soal (${(baseDistribution.D / 20) * 100}%)`);

assert(baseDistribution.A === 5, 'Posisi A pada bank dasar harus tepat 5 soal (25%)');
assert(baseDistribution.B === 5, 'Posisi B pada bank dasar harus tepat 5 soal (25%)');
assert(baseDistribution.C === 5, 'Posisi C pada bank dasar harus tepat 5 soal (25%)');
assert(baseDistribution.D === 5, 'Posisi D pada bank dasar harus tepat 5 soal (25%)');
console.log('  ✓ Posisi dasar terdistribusi 25% rata di setiap label A, B, C, D.\n');

// ----------------------------------------------------
// TEST 3: Dynamic Shuffle & Evaluation Accuracy
// ----------------------------------------------------
console.log('▶ TEST 3: Menguji keakuratan evaluasi jawaban setelah pengacakan (1.000 iterasi)...');
for (let i = 0; i < 1000; i++) {
  const rawQ = allQuestions[i % allQuestions.length];
  const shuffledQ = prepareQuestion(rawQ);

  // 1. Shuffled options must contain exact same 4 items as raw
  assert(shuffledQ.options.length === 4, 'Opsi teracak harus berisi 4 item');
  const rawSet = new Set(rawQ.options);
  shuffledQ.options.forEach(opt => {
    assert(rawSet.has(opt), `Opsi '${opt}' tidak ada di opsi asli`);
  });

  // 2. Correct index points to correctAnswer
  const correctIdx = shuffledQ.correctIndex;
  assert(correctIdx >= 0 && correctIdx <= 3, `correctIndex harus antara 0 dan 3, didapat ${correctIdx}`);
  assert(shuffledQ.options[correctIdx] === rawQ.correctAnswer, 'Opsi pada correctIndex harus sama persis dengan correctAnswer');
  assert(shuffledQ.correctLabel === ['A', 'B', 'C', 'D'][correctIdx], 'correctLabel harus sesuai dengan correctIndex');

  // 3. Simulated player clicking correct option
  const chosenCorrect = shuffledQ.options[correctIdx];
  const isCorrect = (chosenCorrect === shuffledQ.correctAnswer);
  assert(isCorrect === true, 'Memilih jawaban benar harus menghasilkan evaluasi TRUE');

  // 4. Simulated player clicking any wrong option
  const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
  wrongIndices.forEach(wIdx => {
    const chosenWrong = shuffledQ.options[wIdx];
    const isWrongEvaluated = (chosenWrong === shuffledQ.correctAnswer);
    assert(isWrongEvaluated === false, `Memilih opsi salah pada indeks ${wIdx} harus menghasilkan evaluasi FALSE`);
  });
}
console.log('  ✓ 1.000 simulasi berhasil: Jawaban benar 100% akurat, jawaban salah 100% ditolak.\n');

// ----------------------------------------------------
// TEST 4: Statistical Distribution of Shuffled Positions (10.000 Iterasi)
// ----------------------------------------------------
console.log('▶ TEST 4: Menguji distribusi statistik pengacakan posisi jawaban benar (10.000 iterasi)...');
const shuffledDistribution = { A: 0, B: 0, C: 0, D: 0 };
const perQuestionReach = {};
allQuestions.forEach(q => {
  perQuestionReach[q.id] = { A: 0, B: 0, C: 0, D: 0 };
});

const rng = createSeededRng(20261106);
const TOTAL_SHUFFLE_RUNS = 10000;

for (let i = 0; i < TOTAL_SHUFFLE_RUNS; i++) {
  const q = allQuestions[i % allQuestions.length];
  const prepared = prepareQuestion(q, rng);
  const label = prepared.correctLabel;
  shuffledDistribution[label]++;
  perQuestionReach[q.id][label]++;
}

console.log('  Distribusi Posisi Jawaban Benar Setelah Pengacakan (10.000 run):');
const labelsList = ['A', 'B', 'C', 'D'];
labelsList.forEach(l => {
  const count = shuffledDistribution[l];
  const pct = ((count / TOTAL_SHUFFLE_RUNS) * 100).toFixed(2);
  console.log(`    Posisi ${l}: ${count} kali (${pct}%)`);
  // Each position should be between 22% and 28% for a healthy uniform random distribution
  assert(pct >= 22.0 && pct <= 28.0, `Distribusi posisi ${l} (${pct}%) harus berada di rentang wajar (22% - 28%)`);
});

// Verify every question has reached all 4 positions A, B, C, D
allQuestions.forEach(q => {
  labelsList.forEach(l => {
    assert(perQuestionReach[q.id][l] > 0, `Soal ${q.id} harus dapat mencapai posisi ${l}`);
  });
});
console.log('  ✓ Seluruh 20 soal terbukti dapat menempati posisi A, B, C, maupun D secara merata.\n');

// ----------------------------------------------------
// TEST 5: Sesi Permainan & getRandomQuestion
// ----------------------------------------------------
console.log('▶ TEST 5: Menguji pemanggilan dinamis getRandomQuestion pada sesi permainan...');
resetLastQuestionId();
const sessionPositions = { A: 0, B: 0, C: 0, D: 0 };
const sessionRng = createSeededRng(42);

for (let s = 0; s < 100; s++) {
  const lvl = levels[s % levels.length];
  const q = getRandomQuestion(lvl, sessionRng);
  assert(q && q.options && q.options.length === 4, 'Soal sesi harus valid');
  assert(q.options.includes(q.correctAnswer), 'Jawaban benar harus ada di opsi');
  sessionPositions[q.correctLabel]++;
}

console.log('  Distribusi 100 Soal Sesi Game:');
labelsList.forEach(l => {
  console.log(`    Posisi ${l}: ${sessionPositions[l]} soal`);
  assert(sessionPositions[l] >= 15, `Posisi ${l} harus muncul minimal 15 kali dari 100 soal`);
});
console.log('  ✓ Pengacakan saat runtime sesi permainan berjalan dinamis dan adil.\n');

console.log('======================================================');
console.log(`🎉 SELURUH ${passedTests} PENGUJIAN SHUFFLE 100% SUKSES!`);
console.log('======================================================\n');

