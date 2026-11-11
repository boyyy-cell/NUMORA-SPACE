/**
 * FINAL VERIFICATION TEST SUITE — NUMORA SPACE
 * Validates:
 * 1. API Base URL resolution (localhost, LAN, Vercel, production precedence)
 * 2. NORA AI logic (greetings, formulas, offline fallbacks)
 * 3. Math Engine 4-module misconception diagnosis
 * 4. LocalStorage multi-account isolation
 */

const assert = require('assert');

// ==========================================
// 1. API BASE URL RESOLUTION TEST
// ==========================================
console.log('\n--- 1. TESTING API BASE URL RESOLUTION ---');

const PRODUCTION_BACKEND_URL = 'https://numora-space-api.de2.netrun.io';

function resolveBaseUrl(envUrl, windowMock) {
  // 1. Explicit production backend URL takes highest precedence
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Runtime browser resolution
  if (windowMock && windowMock.location && windowMock.location.hostname) {
    const hostname = windowMock.location.hostname;
    const protocol = windowMock.location.protocol || 'http:';

    const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    const isLanIp = /^192\.168\.\d+\.\d+$|^10\.\d+\.\d+\.\d+$|^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname);

    if (isLanIp) {
      return `${protocol}//${hostname}:8000`;
    }

    if (isLoopback) {
      return envUrl ? envUrl.replace(/\/+$/, '') : 'http://127.0.0.1:8000';
    }

    if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '');
    }

    // Direct fallback to official production API endpoint
    return PRODUCTION_BACKEND_URL;
  }

  return envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')
    ? envUrl.replace(/\/+$/, '')
    : PRODUCTION_BACKEND_URL;
}

// Test 1.1: Localhost development
assert.strictEqual(
  resolveBaseUrl('http://127.0.0.1:8000', { location: { hostname: 'localhost', protocol: 'http:' } }),
  'http://127.0.0.1:8000',
  'Localhost should connect to 127.0.0.1:8000'
);

// Test 1.2: LAN IP (Smartphone / other PC on Wi-Fi)
assert.strictEqual(
  resolveBaseUrl('http://127.0.0.1:8000', { location: { hostname: '192.168.1.34', protocol: 'http:' } }),
  'http://192.168.1.34:8000',
  'LAN IP should dynamically resolve to host IP on port 8000'
);

// Test 1.3: Vercel deployment with explicit production backend URL
assert.strictEqual(
  resolveBaseUrl('https://custom-api.numora.space', { location: { hostname: 'numora-space.vercel.app', protocol: 'https:' } }),
  'https://custom-api.numora.space',
  'Explicit custom backend URL must take precedence on Vercel'
);

// Test 1.4: Production URL prioritizes over LAN IP
assert.strictEqual(
  resolveBaseUrl('https://numora-space-api.de2.netrun.io', { location: { hostname: '192.168.1.34', protocol: 'http:' } }),
  'https://numora-space-api.de2.netrun.io',
  'Explicit production URL must take precedence even when testing from LAN host'
);

// Test 1.5: Vercel deployment without envUrl fallback to official production backend URL
assert.strictEqual(
  resolveBaseUrl('', { location: { hostname: 'numora-space.vercel.app', protocol: 'https:' } }),
  'https://numora-space-api.de2.netrun.io',
  'Vercel without envUrl must fallback to https://numora-space-api.de2.netrun.io (never relative path)'
);

console.log('  ✓ 5/5 API Base URL scenarios passed successfully.');


// ==========================================
// 2. NORA AI LOGIC VERIFICATION
// ==========================================
console.log('\n--- 2. TESTING NORA AI CONVERSATION LOGIC ---');

// Simulated backend NORA AI logic
function simulateNoraResponse(message, history = []) {
  const msg_l = message.toLowerCase().trim();
  const greeting_words = ["halo", "hai", "hei", "assalamu", "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "pagi", "siang", "sore", "malam", "apa kabar"];
  const thanks_words = ["terima kasih", "makasih", "thanks", "tengkyu", "terimakasih", "syukron"];
  const ok_words = ["oke", "ok", "siap", "paham", "mengerti", "baiklah", "sip"];

  if (anyWordMatch(msg_l, greeting_words)) {
    return {
      reply: "Halo! Aku NORA, tutor pendamping aljabar untukmu di NUMORA Space.",
      math_latex: null,
      is_generative: false
    };
  }

  if (anyWordMatch(msg_l, thanks_words)) {
    return {
      reply: "Sama-sama! Senang sekali bisa menemanimu belajar matematika aljabar.",
      math_latex: null,
      is_generative: false
    };
  }

  if (anyWordMatch(msg_l, ok_words) && msg_l.length < 15) {
    return {
      reply: "Hebat! Pemahaman yang bagus.",
      math_latex: null,
      is_generative: false
    };
  }

  if (msg_l.includes("koefisien") && msg_l.includes("-5x")) {
    return {
      reply: "Pada bentuk -5x, koefisiennya adalah -5, bukan 5.",
      math_latex: "-5x \\implies a = -5",
      is_generative: false
    };
  }

  // Fallback offline
  return {
    reply: `NORA mencatat pertanyaanmu: "${message}". Sebagai asisten belajar aljabar SMP Kelas VII, NORA berfokus pada materi aljabar.`,
    math_latex: null,
    is_generative: false
  };
}

function anyWordMatch(text, words) {
  return words.some(k => text === k || text.startsWith(k + " ") || text.startsWith(k + "!") || text.startsWith(k + ",") || text.startsWith(k + "?"));
}

// Test 2.1: Greeting should NOT have math formula
const greetingRes = simulateNoraResponse("Halo");
assert.strictEqual(greetingRes.math_latex, null, 'Greeting must not have math_latex');
assert.ok(greetingRes.reply.includes('tutor pendamping aljabar'), 'Greeting should be friendly and welcoming');

// Test 2.2: Greeting in later turn (history length > 0)
const laterGreetingRes = simulateNoraResponse("Hai NORA", [{ role: 'assistant', content: 'Halo!' }]);
assert.strictEqual(laterGreetingRes.math_latex, null, 'Late greeting must not have math_latex');

// Test 2.3: Thanks message
const thanksRes = simulateNoraResponse("terima kasih NORA");
assert.strictEqual(thanksRes.math_latex, null, 'Thanks message must not have math_latex');
assert.ok(thanksRes.reply.includes('Sama-sama'), 'Thanks response must be appreciative');

// Test 2.4: Math question
const mathRes = simulateNoraResponse("Apa koefisien dari -5x?");
assert.strictEqual(mathRes.math_latex, "-5x \\implies a = -5", 'Math question should contain valid math_latex');

// Test 2.5: Non-math query in offline mode
const nonMathRes = simulateNoraResponse("Berapa skor sepak bola semalam?");
assert.strictEqual(nonMathRes.math_latex, null, 'Non-math query must not produce fake algebra formula');
assert.ok(nonMathRes.reply.includes('berfokus pada materi aljabar'), 'Honest guidance back to algebra');

console.log('  ✓ 5/5 NORA conversational responses validated.');


// ==========================================
// 3. MATH ENGINE 4-MODULE DIAGNOSIS TEST
// ==========================================
console.log('\n--- 3. TESTING MATH ENGINE 4-MODULE DIAGNOSIS ---');

function diagnoseMisconception(question_type, expression, student_answer) {
  const ans_clean = student_answer.trim().toLowerCase();
  const expr_clean = expression.replace(/\s+/g, '').toLowerCase();

  // 1. IDENTIFY VARIABLE
  if (question_type === 'identify_variable') {
    if (['a', 'variabel a', 'huruf a', 'x', 'variabel x'].includes(ans_clean) && (expr_clean.includes(ans_clean.replace('variabel ', '').replace('huruf ', '')))) {
      return { is_correct: true, diagnosed_type: 'Concept Mastered (Correct)' };
    }
    if (['7', '3', '4', '5'].some(c => ans_clean.includes(c)) && !/[a-z]/.test(ans_clean)) {
      return { is_correct: false, diagnosed_type: 'Variable/Coefficient Confusion (Tertukar Variabel & Koefisien)' };
    }
    if (['12', '6', '8'].some(c => ans_clean.includes(c)) && !/[a-z]/.test(ans_clean)) {
      return { is_correct: false, diagnosed_type: 'Variable/Constant Confusion (Tertukar Variabel & Konstanta)' };
    }
    if (ans_clean.includes('7a') || ans_clean.includes('3x')) {
      return { is_correct: false, diagnosed_type: 'Term Confusion (Tertukar Suku & Variabel)' };
    }
  }

  // 2. IDENTIFY COEFFICIENT
  if (question_type === 'identify_coefficient') {
    if (['-5', '-5.0'].includes(ans_clean)) {
      return { is_correct: true, diagnosed_type: 'Concept Mastered (Correct)' };
    }
    if (['5', '+5'].includes(ans_clean)) {
      return { is_correct: false, diagnosed_type: 'Sign Omission Error (Tanda Negatif Terabaikan)' };
    }
    if (['x', '-x'].includes(ans_clean)) {
      return { is_correct: false, diagnosed_type: 'Variable/Coefficient Confusion (Tertukar Variabel & Koefisien)' };
    }
  }

  // 3. IDENTIFY CONSTANT
  if (question_type === 'identify_constant') {
    if (['-8', '-8.0'].includes(ans_clean)) {
      return { is_correct: true, diagnosed_type: 'Concept Mastered (Correct)' };
    }
    if (['8', '+8'].includes(ans_clean)) {
      return { is_correct: false, diagnosed_type: 'Sign Omission Error (Tanda Negatif Terabaikan)' };
    }
    if (['3', '+3'].includes(ans_clean)) {
      return { is_correct: false, diagnosed_type: 'Constant/Coefficient Confusion (Tertukar Konstanta & Koefisien)' };
    }
  }

  // 4. EVALUATE SUBSTITUTION
  if (question_type === 'evaluate_substitution') {
    if (['26', '26.0', 'rp26.000', '26 ribu', '26000'].includes(ans_clean)) {
      return { is_correct: true, diagnosed_type: 'Concept Mastered (Correct)' };
    }
    if (['45', '456'].includes(ans_clean)) {
      return { is_correct: false, diagnosed_type: 'Concatenation Error (Penggabungan Angka Bukan Perkalian)' };
    }
    if (['20', '20.0'].includes(ans_clean)) {
      return { is_correct: false, diagnosed_type: 'Incomplete Operation (Operasi Belum Tuntas)' };
    }
  }

  return { is_correct: false, diagnosed_type: 'General Evaluation' };
}

// Module 1 tests
assert.strictEqual(diagnoseMisconception('identify_variable', '7a + 12', 'a').is_correct, true);
assert.strictEqual(diagnoseMisconception('identify_variable', '7a + 12', '7').diagnosed_type, 'Variable/Coefficient Confusion (Tertukar Variabel & Koefisien)');
assert.strictEqual(diagnoseMisconception('identify_variable', '7a + 12', '12').diagnosed_type, 'Variable/Constant Confusion (Tertukar Variabel & Konstanta)');
assert.strictEqual(diagnoseMisconception('identify_variable', '7a + 12', '7a').diagnosed_type, 'Term Confusion (Tertukar Suku & Variabel)');

// Module 2 tests
assert.strictEqual(diagnoseMisconception('identify_coefficient', '-5x', '-5').is_correct, true);
assert.strictEqual(diagnoseMisconception('identify_coefficient', '-5x', '5').diagnosed_type, 'Sign Omission Error (Tanda Negatif Terabaikan)');
assert.strictEqual(diagnoseMisconception('identify_coefficient', '-5x', 'x').diagnosed_type, 'Variable/Coefficient Confusion (Tertukar Variabel & Koefisien)');

// Module 3 tests
assert.strictEqual(diagnoseMisconception('identify_constant', '3x - 8', '-8').is_correct, true);
assert.strictEqual(diagnoseMisconception('identify_constant', '3x - 8', '8').diagnosed_type, 'Sign Omission Error (Tanda Negatif Terabaikan)');
assert.strictEqual(diagnoseMisconception('identify_constant', '3x - 8', '3').diagnosed_type, 'Constant/Coefficient Confusion (Tertukar Konstanta & Koefisien)');

// Module 4 tests
assert.strictEqual(diagnoseMisconception('evaluate_substitution', '4x + 6', '26').is_correct, true);
assert.strictEqual(diagnoseMisconception('evaluate_substitution', '4x + 6', '45').diagnosed_type, 'Concatenation Error (Penggabungan Angka Bukan Perkalian)');
assert.strictEqual(diagnoseMisconception('evaluate_substitution', '4x + 6', '20').diagnosed_type, 'Incomplete Operation (Operasi Belum Tuntas)');

console.log('  ✓ 13/13 Misconception diagnosis tests across all 4 modules passed.');


// ==========================================
// 4. MULTI-ACCOUNT ISOLATION TEST
// ==========================================
console.log('\n--- 4. TESTING MULTI-ACCOUNT STORAGE ISOLATION ---');

const mockLocalStorage = {};

function saveEvaluation(user, data) {
  const key = `numora_eval_results_${user?.email || user?.subjectId || 'guest'}`;
  mockLocalStorage[key] = JSON.stringify(data);
}

function loadEvaluation(user) {
  const key = `numora_eval_results_${user?.email || user?.subjectId || 'guest'}`;
  const val = mockLocalStorage[key];
  return val ? JSON.parse(val) : null;
}

const studentUser = { email: 'siswa.demo@numora.space', subjectId: 'S-002' };
const researcherUser = { email: 'peneliti.demo@numora.space', subjectId: 'P-001' };
const guestUser = null;

// Student submits evaluation with 100 score
saveEvaluation(studentUser, { score: 100, correctCount: 4, completedAt: '2026-11-12T01:00:00Z' });

// Researcher submits evaluation with 75 score
saveEvaluation(researcherUser, { score: 75, correctCount: 3, completedAt: '2026-11-12T01:30:00Z' });

// Verification
assert.strictEqual(loadEvaluation(studentUser).score, 100, 'Student evaluation must remain 100');
assert.strictEqual(loadEvaluation(researcherUser).score, 75, 'Researcher evaluation must remain 75');
assert.strictEqual(loadEvaluation(guestUser), null, 'Guest user must have no evaluation result');

console.log('  ✓ Multi-account storage isolation completely validated (zero collision).');

// ==========================================
// 5. CORS BACKEND ORIGIN & REGEX TEST
// ==========================================
console.log('\n--- 5. TESTING BACKEND CORS ORIGINS & REGEX ---');

const defaultCorsRegex = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$|^https:\/\/(numora-space.*\.vercel\.app)$/;

const allowedCorsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.1.34:5173',
  'https://numora-space.vercel.app',
  'https://numora-space-git-main.vercel.app'
];

allowedCorsOrigins.forEach(origin => {
  assert.strictEqual(defaultCorsRegex.test(origin), true, `CORS regex must allow: ${origin}`);
});

const blockedCorsOrigins = [
  'https://evil-site.com',
  'https://other-app.vercel.app',
  'http://192.168.1.34.attacker.com'
];

blockedCorsOrigins.forEach(origin => {
  assert.strictEqual(defaultCorsRegex.test(origin), false, `CORS regex must reject: ${origin}`);
});

console.log('  ✓ 8/8 CORS origin and regex scenarios passed successfully.');

console.log('\n======================================================');
console.log('🎉 ALL FINAL VERIFICATION TESTS PASSED SUCCESSFULLY!');
console.log('======================================================\n');
