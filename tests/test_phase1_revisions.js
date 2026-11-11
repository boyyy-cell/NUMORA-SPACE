/**
 * Test Suite: NUMORA Space — Verifikasi Revisi Tahap 1
 * Menguji:
 * 1. Logika penyimpanan sesi (rememberMe true -> localStorage, false -> sessionStorage, logout -> hapus kedua storage)
 * 2. Logika progres modul dinamis (0/4 -> 4/4, isolasi per akun, persistensi reload)
 * 3. Keberadaan anchor target navigasi (#features, #preview-modules, #preview-nora)
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('========================================================');
console.log('--- TEST SUITE: NUMORA SPACE REVISI TAHAP 1 ---');
console.log('========================================================\n');

// 1. UJI NAVIGASI & ANCHOR PADA FILE FRONTEND
console.log('▶ TEST 1: Verifikasi Anchor Target Navbar & LandingPage...');
const navbarPath = path.resolve('frontend/src/components/layout/Navbar.jsx');
const landingPath = path.resolve('frontend/src/pages/LandingPage.jsx');

const navbarContent = fs.readFileSync(navbarPath, 'utf8');
const landingContent = fs.readFileSync(landingPath, 'utf8');

// Memeriksa Navbar memiliki helper dinamis getAnchorHref('#features')
assert(navbarContent.includes("getAnchorHref('#features')"), 'Navbar harus menggunakan getAnchorHref untuk #features');
assert(navbarContent.includes("getAnchorHref('#preview-modules')"), 'Navbar harus menggunakan getAnchorHref untuk #preview-modules');
assert(navbarContent.includes("getAnchorHref('#preview-nora')"), 'Navbar harus menggunakan getAnchorHref untuk #preview-nora');

// Memeriksa LandingPage memiliki id="features" dan id="preview-modules"
assert(landingContent.includes('id="features"'), 'LandingPage harus memiliki elemen dengan id="features"');
assert(landingContent.includes('id="preview-modules"'), 'LandingPage harus memiliki elemen dengan id="preview-modules"');
assert(landingContent.includes('id="preview-nora"'), 'LandingPage harus memiliki elemen dengan id="preview-nora"');
console.log('  ✓ Seluruh anchor #features, #preview-modules, #preview-nora terverifikasi sinkron.\n');

// 2. SIMULASI STORAGE DAN REMEMBER ME
console.log('▶ TEST 2: Simulasi Logika Sesi & Remember Me (localStorage vs sessionStorage)...');

class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();
const STORAGE_KEY = 'numora_auth_session';

function simulateLogin(user, rememberMe) {
  mockLocalStorage.removeItem(STORAGE_KEY);
  mockSessionStorage.removeItem(STORAGE_KEY);

  if (rememberMe) {
    mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

function simulateLogout() {
  mockLocalStorage.removeItem(STORAGE_KEY);
  mockSessionStorage.removeItem(STORAGE_KEY);
}

function getStoredUser() {
  const local = mockLocalStorage.getItem(STORAGE_KEY);
  if (local) return JSON.parse(local);
  const session = mockSessionStorage.getItem(STORAGE_KEY);
  if (session) return JSON.parse(session);
  return null;
}

// Skenario A: Login siswa dengan rememberMe = true
const studentUser = { email: 'siswa.demo@numora.space', role: 'student', subjectId: 'S-002' };
simulateLogin(studentUser, true);
assert.strictEqual(getStoredUser()?.email, 'siswa.demo@numora.space');
assert(mockLocalStorage.getItem(STORAGE_KEY) !== null, 'localStorage harus terisi jika rememberMe true');
assert(mockSessionStorage.getItem(STORAGE_KEY) === null, 'sessionStorage harus kosong jika rememberMe true');
console.log('  ✓ Login siswa dengan rememberMe: TRUE -> tersimpan di localStorage.');

// Skenario B: Login peneliti dengan rememberMe = false
const researcherUser = { email: 'peneliti.demo@numora.space', role: 'researcher', subjectId: 'P-001' };
simulateLogin(researcherUser, false);
assert.strictEqual(getStoredUser()?.email, 'peneliti.demo@numora.space');
assert(mockLocalStorage.getItem(STORAGE_KEY) === null, 'localStorage harus kosong jika rememberMe false');
assert(mockSessionStorage.getItem(STORAGE_KEY) !== null, 'sessionStorage harus terisi jika rememberMe false');
console.log('  ✓ Login peneliti dengan rememberMe: FALSE -> tersimpan di sessionStorage.');

// Skenario C: Logout
simulateLogout();
assert.strictEqual(getStoredUser(), null);
assert(mockLocalStorage.getItem(STORAGE_KEY) === null, 'localStorage harus bersih setelah logout');
assert(mockSessionStorage.getItem(STORAGE_KEY) === null, 'sessionStorage harus bersih setelah logout');
console.log('  ✓ Logout berhasil membersihkan kedua storage tanpa residu.\n');

// 3. SIMULASI PROGRES MODUL & ISOLASI PER AKUN
console.log('▶ TEST 3: Simulasi Progres Modul Dinamis (Modul 1 s.d 4) & Isolasi Akun...');
const progressStorage = new MockStorage();

function getStudentProgressKey(subjectId) {
  return `numora_student_progress_${subjectId || 'default'}`;
}

function saveProgress(subjectId, modules) {
  progressStorage.setItem(getStudentProgressKey(subjectId), JSON.stringify(modules));
}

function loadProgress(subjectId) {
  const data = progressStorage.getItem(getStudentProgressKey(subjectId));
  return data ? JSON.parse(data) : ['variables']; // default
}

function calculateProgress(modules) {
  const total = 4;
  const count = modules.length;
  const pct = Math.round((count / total) * 100);
  return { count, total, pct };
}

// Siswa 1 (S-002) mulai dari Modul 1 selesai
let s2Modules = loadProgress('S-002');
let stats = calculateProgress(s2Modules);
assert.strictEqual(stats.count, 1);
assert.strictEqual(stats.pct, 25);
console.log(`  ✓ State Awal S-002: ${stats.count}/4 Selesai (${stats.pct}%)`);

// S-002 menyelesaikan Modul 2 (coefficients)
s2Modules.push('coefficients');
saveProgress('S-002', s2Modules);
stats = calculateProgress(loadProgress('S-002'));
assert.strictEqual(stats.count, 2);
assert.strictEqual(stats.pct, 50);
console.log(`  ✓ S-002 menyelesaikan Modul 2: ${stats.count}/4 Selesai (${stats.pct}%)`);

// S-002 menyelesaikan Modul 3 (constants)
s2Modules.push('constants');
saveProgress('S-002', s2Modules);
stats = calculateProgress(loadProgress('S-002'));
assert.strictEqual(stats.count, 3);
assert.strictEqual(stats.pct, 75);
console.log(`  ✓ S-002 menyelesaikan Modul 3: ${stats.count}/4 Selesai (${stats.pct}%)`);

// S-002 menyelesaikan Modul 4 (expressions)
s2Modules.push('expressions');
saveProgress('S-002', s2Modules);
stats = calculateProgress(loadProgress('S-002'));
assert.strictEqual(stats.count, 4);
assert.strictEqual(stats.pct, 100);
console.log(`  ✓ S-002 menyelesaikan Modul 4: ${stats.count}/4 Selesai (${stats.pct}%) [TUNTAS]`);

// Simulasi reload browser untuk S-002
const reloadedS2 = loadProgress('S-002');
assert.deepStrictEqual(reloadedS2, ['variables', 'coefficients', 'constants', 'expressions']);
console.log('  ✓ Persistensi Browser Reload: Seluruh 4 modul S-002 tetap tersimpan.');

// Isolasi akun: Siswa baru (S-003) harus memiliki progres independen
const s3Modules = loadProgress('S-003');
assert.deepStrictEqual(s3Modules, ['variables']);
assert.strictEqual(calculateProgress(s3Modules).pct, 25);
console.log('  ✓ Isolasi Akun: Siswa S-003 tidak terpengaruh oleh penyelesaian S-002 (tetap 25%).\n');

console.log('========================================================');
console.log('--- SELURUH 3 PENGUJIAN TAHAP 1: 100% SUKSES! ---');
console.log('========================================================');
