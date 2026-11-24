import assert from 'node:assert/strict';
import { fetchWithTimeout } from '../frontend/src/services/api.js';

const originalFetch = globalThis.fetch;
const originalSetTimeout = globalThis.setTimeout;

globalThis.setTimeout = (callback, delay, ...args) =>
  originalSetTimeout(callback, Math.min(delay, 25), ...args);
globalThis.fetch = async (_url, { signal }) => ({
  ok: true,
  json: () => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      const error = new Error('request aborted');
      error.name = 'AbortError';
      reject(error);
    }, { once: true });
  }),
});

try {
  let caughtError;
  try {
    await fetchWithTimeout(
      'http://127.0.0.1:8000/api/v1/auth/google',
      { method: 'POST', body: JSON.stringify({ id_token: 'test-token' }) },
      6000,
    );
  } catch (error) {
    caughtError = error;
  }

  assert.equal(caughtError?.isTimeout, true);
  assert.equal(caughtError?.isOffline, true);
  console.log('PASS: request timeout covers stalled response-body parsing.');
} finally {
  globalThis.fetch = originalFetch;
  globalThis.setTimeout = originalSetTimeout;
}
