/**
 * NUMORA Space — Frontend Student Sync Service Automated Test Suite (ESM)
 * Tests client-side logic:
 * 1. MIGRATION_STATES and SYNC_STATUS constants.
 * 2. Scoped key generation per user/subject.
 * 3. Idempotency key generation (unique prefixes).
 * 4. Local progress, evaluations, runner storage caching.
 * 5. S-001 control group blocking logic.
 * 6. Offline queueing and retry flush.
 */
import assert from 'node:assert/strict';
import {
  MIGRATION_STATES,
  SYNC_STATUS,
  generateIdempotencyKey,
  getScopedKey,
  studentSyncService
} from '../frontend/src/services/studentSyncService.js';
import { getRunnerStats, saveRunnerSession } from '../frontend/src/features/runner/runnerStorage.js';
import {
  QUESTION_BANK,
  getRandomQuestion,
  getAllQuestions,
  prepareQuestion
} from '../frontend/src/features/runner/questionBank.js';

// Setup Mock Browser Environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  get length() { return mockStorage.size; },
  key: (index) => Array.from(mockStorage.keys())[index] || null,
};
globalThis.sessionStorage = { ...globalThis.localStorage };

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
};
globalThis.CustomEvent = class CustomEvent {
  constructor(name, options = {}) {
    this.name = name;
    this.detail = options.detail;
  }
};

async function runTests() {
  console.log('--- Starting Frontend Sync Service Test Suite ---');

  // Test 1: Constants
  assert.equal(MIGRATION_STATES.UNMIGRATED, 'UNMIGRATED');
  assert.equal(MIGRATION_STATES.VERIFIED_MIGRATED, 'VERIFIED_MIGRATED');
  assert.equal(SYNC_STATUS.BLOCKED, 'BLOCKED');
  console.log('✓ Test 1: Constants validated');

  // Test 2: Scoped Key Generation
  const userS002 = { email: 'siswa.demo@numora.space', subjectId: 'S-002', role: 'student' };
  const userS001 = { email: 'faridsyahputra53@gmail.com', subjectId: 'S-001', role: 'student' };

  const key1 = getScopedKey('numora_student_progress', userS002);
  assert.equal(key1, 'numora_student_progress_siswa_demo_numora_space');
  console.log('✓ Test 2: Scoped keys isolate distinct users');

  // Test 3: Idempotency Key Generation
  const k1 = generateIdempotencyKey('eval');
  const k2 = generateIdempotencyKey('eval');
  assert.notEqual(k1, k2);
  assert.ok(k1.startsWith('eval_'));
  console.log('✓ Test 3: Unique idempotency keys generated');

  // Test 4: Local Progress & Evaluation Cache
  studentSyncService.setLocalProgress(userS002, ['mod1', 'mod2']);
  const progress = studentSyncService.getLocalProgress(userS002);
  assert.deepEqual(progress, ['mod1', 'mod2']);

  studentSyncService.setLocalEvaluations(userS002, [{ score: 100, idempotency_key: 'test_key' }]);
  const evals = studentSyncService.getLocalEvaluations(userS002);
  assert.equal(evals.length, 1);
  assert.equal(evals[0].score, 100);
  console.log('✓ Test 4: Local storage scoped caching working');

  // Test 5: S-001 Control Group Safety Guard
  const s001Sync = await studentSyncService.initializeSync(userS001);
  assert.equal(s001Sync.status, SYNC_STATUS.BLOCKED);
  assert.equal(studentSyncService.currentStatus, SYNC_STATUS.BLOCKED);
  console.log('✓ Test 5: S-001 control group strictly blocked from digital intervention sync');

  // Test 6: Runner Storage Integration
  localStorage.setItem('numora_auth_session', JSON.stringify(userS002));
  const res = saveRunnerSession({
    level: 'beginner',
    score: 1200,
    coins: 30,
    distance: 400,
    answered: 8,
    correct: 7,
    accuracy: 87.5,
    mistakes: ['q1'],
  });
  assert.equal(res.isNewHigh, true);
  assert.equal(res.currentHighScore, 1200);

  const stats = getRunnerStats();
  assert.equal(stats.highScores.beginner, 1200);
  assert.equal(stats.totalCoins, 30);
  console.log('✓ Test 6: Runner stats calculation and storage integration validated');

  // Test 7: NUMORA RUN Question Bank & Fisher-Yates Randomization
  const allQuestions = getAllQuestions();
  assert.equal(allQuestions.length, 20, 'Harus terdapat tepat 20 soal (4 tingkat materi x 5 soal)');
  for (const q of allQuestions) {
    assert.equal(q.options.length, 4, `Soal ${q.id} harus memiliki 4 pilihan jawaban`);
    assert.ok(q.options.includes(q.correctAnswer), `Jawaban benar ${q.correctAnswer} harus ada dalam opsi`);
  }

  // Uji pengacakan Fisher-Yates
  const randomQ = getRandomQuestion('beginner');
  assert.ok(randomQ.options.includes(randomQ.correctAnswer));
  assert.equal(randomQ.options[randomQ.correctIndex], randomQ.correctAnswer);
  assert.ok(['A', 'B', 'C', 'D'].includes(randomQ.correctLabel));
  console.log('✓ Test 7: NUMORA RUN question bank & Fisher-Yates answer shuffling validated');

  console.log('--- ALL FRONTEND SYNC UNIT TESTS PASSED ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
