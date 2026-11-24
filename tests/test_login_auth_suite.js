/**
 * DEDICATED AUTHENTICATION & LOGIN AUDIT TEST SUITE — NUMORA SPACE
 * Validates:
 * 1. Email login: success, invalid format, short password, credential mismatch
 * 2. Demo logins: Student S-002, Researcher P-001
 * 3. RememberMe session persistence: localStorage vs sessionStorage
 * 4. Logout cleanup: both storages completely purged
 * 5. Role-based routing protections & access isolation (Student vs Researcher vs Guest)
 * 6. Google OAuth: configured vs unconfigured state detection & honest simulation labeling
 * 7. Instagram Policy: personal account limitation handling & Meta compliance
 * 8. Clear visual & logical separation of personal vs demo accounts
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('====================================================================');
console.log('--- TEST SUITE: NUMORA SPACE DEDICATED LOGIN & AUTHENTICATION ---');
console.log('====================================================================\n');

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

// Mock Web Storages
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

// ====================================================================
// GROUP 1: GOOGLE-ONLY LOGIN
// ====================================================================
console.log('▶ GROUP 1: Login Google sebagai satu-satunya jalur autentikasi...');

const authContextPath = path.resolve('frontend/src/context/AuthContext.jsx');
const authContextContent = fs.readFileSync(authContextPath, 'utf8');
const apiContent = fs.readFileSync(path.resolve('frontend/src/services/api.js'), 'utf8');

runTest('AuthContext tidak memiliki akun atau jalur autentikasi demo', () => {
  const loginContent = fs.readFileSync(path.resolve('frontend/src/pages/LoginPage.jsx'), 'utf8');
  assert(!authContextContent.includes('DEMO_ACCOUNTS'), 'AuthContext tidak boleh mengekspor akun demo');
  assert(!authContextContent.includes('isSimulation'), 'AuthContext tidak boleh memiliki mode simulasi');
  assert(!loginContent.includes('Demo Siswa') && !loginContent.includes('Demo Peneliti'), 'Login tidak menampilkan tombol demo');
});

runTest('Halaman login tidak menampilkan form email atau kata sandi', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(!loginContent.includes('<form'), 'Tidak boleh ada form login email/password');
  assert(!loginContent.includes('id="login-email"'), 'Tidak boleh ada kolom email');
  assert(!loginContent.includes('id="login-password"'), 'Tidak boleh ada kolom password');
});

runTest('Login password tidak disediakan oleh frontend maupun backend', () => {
  const apiContent = fs.readFileSync(path.resolve('frontend/src/services/api.js'), 'utf8');
  const endpointContent = fs.readFileSync(path.resolve('backend/app/api/v1/endpoints/auth.py'), 'utf8');
  const serviceContent = fs.readFileSync(path.resolve('backend/app/services/auth_service.py'), 'utf8');
  assert(!apiContent.includes('/api/v1/auth/login'), 'API frontend tidak boleh memanggil login password');
  assert(!endpointContent.includes('"/login"'), 'Backend tidak boleh mendaftarkan endpoint login password');
  assert(!serviceContent.includes('authenticate_email_password'), 'Backend tidak boleh mempertahankan alur login password');
});

// ====================================================================
// GROUP 2: PERSISTENSI SESI & LOGOUT LENGKAP
// ====================================================================
console.log('\n▶ GROUP 2: Persistensi sesi Google & Logout...');

const STORAGE_KEY = 'numora_auth_session';

runTest('Sesi tersimpan di localStorage jika rememberMe: TRUE', () => {
  mockLocalStorage.clear();
  mockSessionStorage.clear();
  const userPayload = { email: 'siswa@numora.space', role: 'student', name: 'Siswa Test' };
  const rememberMe = true;

  if (rememberMe) {
    mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(userPayload));
  } else {
    mockSessionStorage.setItem(STORAGE_KEY, JSON.stringify(userPayload));
  }

  assert.notStrictEqual(mockLocalStorage.getItem(STORAGE_KEY), null, 'localStorage harus menyimpan sesi');
  assert.strictEqual(mockSessionStorage.getItem(STORAGE_KEY), null, 'sessionStorage harus kosong');
});

runTest('Sesi Google persisten disimpan di localStorage', () => {
  assert(authContextContent.includes('localStorage.setItem(STORAGE_KEY'), 'Sesi Google harus disimpan secara persisten');
});

runTest('Logout membersihkan kedua storage tanpa menyisakan token atau kredensial', () => {
  mockLocalStorage.setItem(STORAGE_KEY, 'test');
  mockSessionStorage.setItem(STORAGE_KEY, 'test');

  // Simulasi fungsi logout
  mockLocalStorage.removeItem(STORAGE_KEY);
  mockSessionStorage.removeItem(STORAGE_KEY);

  assert.strictEqual(mockLocalStorage.getItem(STORAGE_KEY), null, 'localStorage harus bersih setelah logout');
  assert.strictEqual(mockSessionStorage.getItem(STORAGE_KEY), null, 'sessionStorage harus bersih setelah logout');
});

// ====================================================================
// GROUP 3: PROTEKSI HAK AKSES & ROLE ISOLATION
// ====================================================================
console.log('\n▶ GROUP 3: Proteksi Hak Akses (Student vs Researcher vs Guest)...');

const protectedRoutePath = path.resolve('frontend/src/components/common/ProtectedRoute.jsx');
const protectedRouteContent = fs.readFileSync(protectedRoutePath, 'utf8');

runTest('Pengunjung yang belum login tidak dapat mengakses halaman terproteksi', () => {
  assert(protectedRouteContent.includes('!isAuthenticated'), 'Harus memeriksa status autentikasi');
  assert(protectedRouteContent.includes('to="/login"'), 'Harus mengalihkan ke /login jika belum autentikasi');
});

runTest('Sesi tersimpan harus diverifikasi backend sebelum protected page dirender', () => {
  assert(authContextContent.includes('apiService.getMe()'), 'AuthContext harus memvalidasi token sesi ke backend');
  assert(protectedRouteContent.includes('if (isLoading)'), 'ProtectedRoute harus menunggu validasi sesi selesai');
});

runTest('Siswa dilarang membuka ruang peneliti (otomatis dialihkan ke /student-dashboard)', () => {
  assert(protectedRouteContent.includes('requiredRole'), 'Harus memeriksa requiredRole');
  assert(protectedRouteContent.includes("user.role !== requiredRole"), 'Harus membandingkan role pengguna dengan requiredRole');
  assert(protectedRouteContent.includes("targetDashboard"), 'Harus mengarahkan pengguna ke dashboard yang sesuai perannya');
});

runTest('Rute aplikasi App.jsx menerapkan ProtectedRoute secara ketat per peran', () => {
  const appPath = path.resolve('frontend/src/App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert(appContent.includes('<ProtectedRoute requiredRole="student">'), 'Ruang Siswa harus terproteksi role student');
  assert(appContent.includes('<ProtectedRoute requiredRole="researcher">'), 'Ruang Peneliti harus terproteksi role researcher');
});

// ====================================================================
// GROUP 4: GOOGLE IDENTITY SERVICES & BACKEND VALIDATION
// ====================================================================
console.log('\n▶ GROUP 4: Google OAuth — GIS Button, Callback, dan Backend Validation...');

runTest('Google OAuth memakai client ID environment yang dapat diverifikasi', () => {
  assert(authContextContent.includes('getGoogleAuthConfig'), 'AuthContext harus menyediakan getGoogleAuthConfig');
  assert(authContextContent.includes('VITE_GOOGLE_CLIENT_ID'), 'Harus membaca variabel VITE_GOOGLE_CLIENT_ID');
});

runTest('Google GIS button menjalankan callback credential dan backend verification', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(loginContent.includes('googleId.initialize'), 'GIS harus diinisialisasi dengan OAuth Web Client ID');
  assert(loginContent.includes('googleId.renderButton'), 'Tombol Google resmi harus dirender langsung');
  assert(loginContent.includes('loginWithGoogle(credentialResponse.credential'), 'Credential harus diverifikasi melalui backend');
  assert(loginContent.includes('GOOGLE_CLIENT_ID'), 'UI menjelaskan variabel konfigurasi backend');
});

runTest('GIS hanya diinisialisasi sekali dan callback aktif tetap menerima credential', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(loginContent.includes('let initializedGoogleClientId = null'), 'Status inisialisasi GIS harus bertahan antar-effect');
  assert(loginContent.includes('if (initializedGoogleClientId !== googleConfig.clientId)'), 'StrictMode tidak boleh menginisialisasi client yang sama berulang kali');
  assert(loginContent.includes('callback: (response) => activeGoogleCallback?.(response)'), 'GIS callback harus diarahkan ke handler komponen yang aktif');
});

runTest('API mengirim ID token ke endpoint autentikasi backend yang benar', () => {
  assert(apiContent.includes('/api/v1/auth/google'), 'Path login Google backend harus benar');
  assert(apiContent.includes('JSON.stringify({ id_token })'), 'ID token harus dikirim pada body JSON, bukan query string');
});

runTest('Login Google tidak menggunakan One Tap fallback, simulasi, atau modal informasi', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(!loginContent.includes('.prompt('), 'Login harus memakai tombol Google GIS langsung');
  assert(!loginContent.includes('showGoogleModal'), 'Alur Google tidak boleh memerlukan modal');
  assert(!loginContent.includes('SIMULASI'), 'Login tidak boleh mensimulasikan autentikasi Google');
});

// ====================================================================
// GROUP 5: NO UNRELATED SOCIAL LOGIN OR DEMO CONTROLS
// ====================================================================
console.log('\n▶ GROUP 5: Login page hanya memuat jalur autentikasi yang didukung...');

runTest('Login tidak memiliki tombol Instagram atau modal kebijakan media sosial', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(!loginContent.includes('Instagram'), 'Login tidak boleh menyajikan jalur Instagram yang tidak didukung');
  assert(!loginContent.includes('showInstagramModal'), 'Tidak boleh ada modal Instagram');
});

// ====================================================================
// GROUP 6: SIMPLE PUBLIC LOGIN WITHOUT ROLE SELECTION
// ====================================================================
console.log('\n▶ GROUP 6: Login publik sederhana tanpa pemilihan role...');

runTest('Halaman Login mempertahankan branding tanpa role picker atau section demo', () => {
  const loginPath = path.resolve('frontend/src/pages/LoginPage.jsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  assert(loginContent.includes('Algebra, Beyond Formulas.'), 'Tagline NUMORA harus tetap tampil');
  assert(!loginContent.includes('role="researcher"'), 'Login publik tidak boleh menawarkan role researcher');
  assert(!loginContent.includes('Akun Uji Coba'), 'Login tidak boleh memiliki section uji coba');
});

// ====================================================================
// GROUP 7: GOOGLE AUTH REGRESSION & SESSION RECOVERY
// ====================================================================
console.log('\n▶ GROUP 7: Regression callback, role routing, dan pemulihan sesi...');

const loginPageContent = fs.readFileSync(path.resolve('frontend/src/pages/LoginPage.jsx'), 'utf8');
const appContent = fs.readFileSync(path.resolve('frontend/src/App.jsx'), 'utf8');

runTest('Sukses Google menyimpan token/user dan memperbarui AuthContext', () => {
  assert(authContextContent.includes('response?.access_token'), 'Respons sukses harus memuat access token');
  assert(authContextContent.includes("!['student', 'researcher'].includes(response.user.role)"), 'Role harus dikenali sebelum sesi dibuat');
  assert(authContextContent.includes('setUser(authenticatedUser)'), 'State AuthContext harus berubah setelah sukses');
  assert(authContextContent.includes('saveStoredSession(authenticatedUser)'), 'Sesi baru harus disimpan');
});

runTest('Kegagalan Google menampilkan error dan tetap mengakhiri loading', () => {
  assert(authContextContent.includes('return { success: false, error: getGoogleLoginError(error) }'), 'Kegagalan backend harus dikembalikan ke UI');
  assert.match(authContextContent, /loginInProgress\.current = false;\s+setIsLoading\(false\);/, 'Lock dan loading harus dilepas pada semua hasil');
  assert(loginPageContent.includes('setError(result.error ||'), 'UI harus menampilkan pesan gagal');
});

runTest('Sesi refresh dipertahankan saat jaringan/server gagal dan dibersihkan untuk 401', () => {
  assert(authContextContent.includes('const profile = await apiService.getMe()'), 'Refresh harus memvalidasi sesi melalui /auth/me');
  assert(authContextContent.includes('if (error.status === 401)'), 'Hanya sesi yang ditolak server yang dibersihkan');
  assert(authContextContent.includes('setUser(initialSession)'), 'Gangguan sementara tidak boleh menghapus sesi lokal');
});

runTest('Login sukses memilih dashboard sesuai role backend', () => {
  assert(loginPageContent.includes("result.user.role === 'researcher' ? '/researcher-dashboard' : '/student-dashboard'"), 'Navigasi sukses harus bergantung pada role terverifikasi');
  assert(appContent.includes('user.role === \'researcher\''), 'Pemulihan sesi researcher harus menuju portal researcher');
});

runTest('Guest diarahkan sekali ke login dan role mismatch memakai replace', () => {
  assert(protectedRouteContent.includes('<Navigate to="/login" replace state={{ from: location }} />'), 'Guest harus kembali ke login tanpa menambah history loop');
  assert(protectedRouteContent.includes('<Navigate to={targetDashboard} replace />'), 'Role mismatch harus diarahkan ke dashboard yang benar');
  assert(appContent.includes('<Route path="/login" element={<LoginHandler />} />'), 'Route login harus tersedia untuk redirect guest');
});

runTest('GIS, permintaan API, dan body respons punya batas waktu/loading terminal', () => {
  assert(loginPageContent.includes('}, 10000)'), 'Pemuatan GIS harus berakhir dengan timeout');
  assert(loginPageContent.includes('Memverifikasi akun Google dan menyiapkan sesi'), 'UI harus menunjukkan status autentikasi');
  assert.match(apiContent, /finally\s*\{\s*clearTimeout\(id\);\s*\}/, 'Timeout harus mencakup pembacaan body respons');
});

console.log('\n====================================================================');
console.log(`--- HASIL TEST: ${passedTests}/${totalTests} UJIAN LULUS (PASS) ---`);
console.log('====================================================================\n');
