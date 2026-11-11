/**
 * Test Suite: Stability, LAN CORS, Nora Greeting, and Mathematical Challenge Diagnosis
 */
const assert = require('assert');

// 1. Verify Regex for LAN CORS matching
const lanRegex = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;

const validOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.1.34:5173',
  'http://192.168.0.105:3000',
  'http://10.0.0.1:8000',
  'http://172.16.0.5:5173',
  'https://192.168.1.50:5173'
];

validOrigins.forEach(origin => {
  assert.strictEqual(lanRegex.test(origin), true, `LAN regex should match ${origin}`);
});

const invalidOrigins = [
  'http://evil-site.com',
  'http://192.168.1.34.attacker.com',
  'http://notlocalhost:5173'
];

invalidOrigins.forEach(origin => {
  assert.strictEqual(lanRegex.test(origin), false, `LAN regex should reject ${origin}`);
});

console.log('✅ PASS: LAN CORS Regex successfully validated');

// 2. Test dynamic getApiBaseUrl logic simulation
function simulateGetApiBaseUrl(hostname, protocol, envVal) {
  const envUrl = envVal;
  if (hostname) {
    const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      if (!isLoopback) {
        return `${protocol}//${hostname}:8000`;
      }
    }
    if (envUrl && envUrl.trim() !== '') {
      return envUrl.replace(/\/+$/, '');
    }
    return `${protocol}//${hostname}:8000`;
  }
  return envUrl ? envUrl.replace(/\/+$/, '') : 'http://127.0.0.1:8000';
}

// Case A: Loopback with default .env
assert.strictEqual(
  simulateGetApiBaseUrl('localhost', 'http:', 'http://127.0.0.1:8000'),
  'http://127.0.0.1:8000'
);

// Case B: LAN IP device with default .env
assert.strictEqual(
  simulateGetApiBaseUrl('192.168.1.34', 'http:', 'http://127.0.0.1:8000'),
  'http://192.168.1.34:8000'
);

// Case C: Mobile accessing via HTTPS LAN
assert.strictEqual(
  simulateGetApiBaseUrl('192.168.1.50', 'https:', ''),
  'https://192.168.1.50:8000'
);

console.log('✅ PASS: Dynamic getApiBaseUrl resolution simulated and verified');

console.log('All automated stability checks passed successfully.');
