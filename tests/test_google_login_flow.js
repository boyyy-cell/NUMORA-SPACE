/**
 * Dedicated Google Login Flow & UI Resilience Test
 * Validates:
 * 1. LoginHandler in App.jsx uses isRestoringSession, keeping LoginPage mounted during login
 * 2. AuthContext provides authError, isRestoringSession, and handles loading transitions cleanly
 * 3. LoginPage binds displayError (error || authError) to ensure error messages are never lost
 * 4. Google button interaction states: aria-busy, pointer-events-none when isLoading
 * 5. apiService.loginGoogle has adequate timeout (>=15s) for OAuth network verification
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('====================================================================');
console.log('--- TEST SUITE: GOOGLE LOGIN BUGFIX & RESILIENCE VERIFICATION ---');
console.log('====================================================================\n');

let total = 0;
let passed = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exit(1);
  }
}

const appFile = fs.readFileSync(path.resolve('frontend/src/App.jsx'), 'utf8');
const authContextFile = fs.readFileSync(path.resolve('frontend/src/context/AuthContext.jsx'), 'utf8');
const loginPageFile = fs.readFileSync(path.resolve('frontend/src/pages/LoginPage.jsx'), 'utf8');
const apiFile = fs.readFileSync(path.resolve('frontend/src/services/api.js'), 'utf8');

test('App.jsx LoginHandler uses isRestoringSession instead of unmounting on isLoading', () => {
  assert(appFile.includes('const { user, isAuthenticated, isRestoringSession } = useAuth();'), 'LoginHandler harus membaca isRestoringSession');
  assert(appFile.includes('if (isRestoringSession)'), 'LoginHandler hanya boleh unmount LoginPage saat isRestoringSession');
  assert(!appFile.includes('const { user, isAuthenticated, isLoading } = useAuth();'), 'LoginHandler tidak boleh unmount saat isLoading interaktif');
});

test('AuthContext memisahkan isRestoringSession dan isLoading', () => {
  assert(authContextFile.includes('const [isRestoringSession, setIsRestoringSession] = useState(Boolean(initialSession));'), 'State isRestoringSession harus ada');
  assert(authContextFile.includes('setIsRestoringSession(false);'), 'isRestoringSession harus diakhiri di finally validateSession');
  assert(authContextFile.includes('isRestoringSession,'), 'isRestoringSession harus diekspor di context value');
});

test('AuthContext menyimpan authError secara terpusat untuk mencegah kehilangan pesan error', () => {
  assert(authContextFile.includes('const [authError, setAuthError] = useState('), 'AuthContext harus memelihara authError state');
  assert(authContextFile.includes('authError,'), 'authError harus diekspor di context value');
  assert(authContextFile.includes('setAuthError,'), 'setAuthError harus diekspor di context value');
  assert(authContextFile.includes('setAuthError(getGoogleLoginError(error));'), 'authError harus diisi saat catch loginWithGoogle');
});

test('LoginPage membaca displayError (error || authError) dan menampilkan alert secara persisten', () => {
  assert(loginPageFile.includes('authError'), 'LoginPage harus membaca authError dari context');
  assert(loginPageFile.includes('displayError'), 'LoginPage harus menghitung displayError');
  assert(loginPageFile.includes('{displayError && ('), 'LoginPage harus merender displayError dalam alert');
});

test('LoginPage memberikan feedback visual aria-busy dan pointer-events-none saat proses autentikasi', () => {
  assert(loginPageFile.includes('aria-busy={isLoading}'), 'Button wrapper harus menyertakan aria-busy');
  assert(loginPageFile.includes("isLoading ? 'pointer-events-none opacity-50' : ''"), 'Button wrapper harus dicegah double-click saat loading');
  assert(loginPageFile.includes('Memverifikasi akun Google dan menyiapkan sesi...'), 'Pesan status verifikasi akun Google harus tersedia');
});

test('apiService.loginGoogle memiliki timeout >= 15 detik untuk mengakomodasi roundtrip OAuth', () => {
  assert.match(apiFile, /loginGoogle\(id_token\)[\s\S]*?15000\);/, 'loginGoogle harus menggunakan timeout 15000ms');
});

console.log('\n====================================================================');
console.log(`--- HASIL: ${passed}/${total} UJIAN LULUS (100% PASS) ---`);
console.log('====================================================================\n');
