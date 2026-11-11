/**
 * NUMORA Space API Client Service (v1.5)
 */

export const PRODUCTION_API_URL = 'https://numora-space-api.de2.netrun.io';

/**
 * Dynamic resolution of API base URL.
 * 1. Prioritizes explicit production backend URLs (e.g. https://numora-space-api.de2.netrun.io).
 * 2. Automatically adapts to local LAN IP (e.g. 192.168.x.x) on port 8000 for multi-device testing.
 * 3. Supports localhost / loopback development.
 * 4. Fallback on remote deployments (e.g. Vercel) directly to the official production backend URL.
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. Explicit production backend URL takes highest precedence
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Runtime browser resolution
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';

    const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    const isLanIp = /^192\.168\.\d+\.\d+$|^10\.\d+\.\d+\.\d+$|^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname);

    // If accessing via private LAN IP (e.g. 192.168.1.34)
    if (isLanIp) {
      return `${protocol}//${hostname}:8000`;
    }

    // If accessing via localhost / 127.0.0.1
    if (isLoopback) {
      return envUrl ? envUrl.replace(/\/+$/, '') : 'http://127.0.0.1:8000';
    }

    // Remote deployment domain (e.g. numora-space.vercel.app)
    // If VITE_API_BASE_URL is explicitly set to a production URL, use it
    if (envUrl && envUrl.trim() !== '' && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '');
    }

    // Fallback directly to official production API endpoint (never rely on broken relative proxy)
    return PRODUCTION_API_URL;
  }

  return envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')
    ? envUrl.replace(/\/+$/, '')
    : PRODUCTION_API_URL;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Koneksi batas waktu terlampaui (${timeoutMs / 1000}s) saat menghubungi backend di ${url}`);
    }
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      throw new Error(`Gagal terhubung ke backend server NUMORA Space di ${url}. Pastikan backend Uvicorn aktif di port 8000.`);
    }
    throw error;
  }
}

export const apiService = {
  getBaseUrl() {
    return getApiBaseUrl();
  },

  async checkHealth() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/health`);
  },

  async getAppInfo() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/info`);
  },

  async getRoot() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/`);
  },

  // Math Evaluation Engine
  async evaluateExpression(expression, variables = { x: 4 }) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/math/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ expression, variables })
    });
  },

  async diagnoseMisconception(question_type, expression, student_answer) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/math/diagnose-misconception`, {
      method: 'POST',
      body: JSON.stringify({ question_type, expression, student_answer })
    });
  },

  // Research Management
  async getResearchSubjects() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/subjects`);
  },

  async getResearchSessions(subject_id = null) {
    const baseUrl = getApiBaseUrl();
    const query = subject_id ? `?subject_id=${subject_id}` : '';
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/sessions${query}`);
  },

  async getCognitiveLoadStatus() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/cognitive-load-status`);
  },

  // NORA Open Conversational AI & Socratic System
  async noraChat(message, mode = 'explain', hint_tier = 1, history = []) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/nora/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, mode, hint_tier, history })
    });
  }
};
