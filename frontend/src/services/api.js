/**
 * NUMORA Space API Client Service (v1.5)
 */

import { PRODUCTION_API_URL, resolveApiBaseUrl } from './apiBaseUrl.js';

export { PRODUCTION_API_URL, resolveApiBaseUrl };

export function getApiBaseUrl() {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta?.env)
    ? import.meta.env.VITE_API_BASE_URL
    : undefined;
  return resolveApiBaseUrl(
    envUrl,
    typeof window !== 'undefined' ? window.location : null
  );
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const method = options.method || 'GET';
  const path = new URL(url).pathname;

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errDetail = await response.text();

      if (response.status === 401 && !url.includes('/api/v1/auth/google')) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('numora_auth_unauthorized'));
        }
      }

      const err = new Error(`HTTP ${response.status}: ${errDetail || response.statusText}`);
      err.status = response.status;
      err.isUnauthorized = response.status === 401;
      err.isForbidden = response.status === 403;
      err.isNotFound = response.status === 404;
      err.isHttpError = true;
      err.isServerError = response.status >= 500;
      console.warn('[NUMORA API] request failed', {
        method,
        path,
        category: 'http',
        status: response.status,
      });
      throw err;
    }

    try {
      return await response.json();
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('[NUMORA API] response parsing failed', {
          method,
          path,
          category: 'invalid_json',
        });
      }
      throw error;
    }
  } catch (error) {
    if (controller.signal.aborted || error?.name === 'AbortError') {
      const timeoutError = new Error(
        `Koneksi batas waktu terlampaui (${timeoutMs / 1000}s) saat menghubungi backend di ${url}`
      );
      timeoutError.isTimeout = true;
      timeoutError.isOffline = true;
      console.warn('[NUMORA API] request failed', { method, path, category: 'timeout' });
      throw timeoutError;
    }
    if (error instanceof TypeError) {
      const networkError = new Error(
        `Gagal menghubungi backend NUMORA Space di ${url}; periksa koneksi jaringan dan konfigurasi CORS.`
      );
      networkError.isOffline = true;
      networkError.isNetworkError = true;
      console.warn('[NUMORA API] request failed', { method, path, category: 'network' });
      throw networkError;
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

function getAuthHeaders() {
  try {
    const raw = localStorage.getItem('numora_auth_session') || sessionStorage.getItem('numora_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token ? { 'Authorization': `Bearer ${parsed.token}` } : {};
    }
  } catch (_) {}
  return {};
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

  // Backend Authentication & Session Endpoints (Phase 02)
  async loginGoogle(id_token) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/auth/google`, {
      method: 'POST',
      body: JSON.stringify({ id_token })
    }, 15000);
  },

  async loginResearcher(email, password, remember_me = true) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/auth/researcher/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password, remember_me })
    }, 15000);
  },

  async getMe() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/auth/me`, {
      headers: getAuthHeaders()
    }, 8000);
  },

  async logoutBackend() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
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

  // Research Management (Role Protected)
  async getResearchSubjects() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/subjects`, {
      headers: getAuthHeaders()
    });
  },

  async getResearchSessions(subject_id = null) {
    const baseUrl = getApiBaseUrl();
    const query = subject_id ? `?subject_id=${subject_id}` : '';
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/sessions${query}`, {
      headers: getAuthHeaders()
    });
  },

  async getCognitiveLoadStatus() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/cognitive-load-status`, {
      headers: getAuthHeaders()
    });
  },

  // NORA Open Conversational AI & Socratic System
  async noraChat(message, mode = 'explain', hint_tier = 1, history = []) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/nora/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, mode, hint_tier, history })
    });
  },

  // Student Persistent Data & Multi-Device Sync (Phase 4-5)
  async getStudentSync() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/sync`, {
      headers: getAuthHeaders()
    });
  },

  async bootstrapMigrateStudentData(payload) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/bootstrap-migration`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async getStudentProgress() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/progress`, {
      headers: getAuthHeaders()
    });
  },

  async saveStudentProgress(payload) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async getStudentEvaluations() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/evaluations`, {
      headers: getAuthHeaders()
    });
  },

  async submitEvaluation(payload) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/evaluation`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async getRunnerStats() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/runner/stats`, {
      headers: getAuthHeaders()
    });
  },

  async updateRunnerStatsDelta(deltas = {}) {
    const baseUrl = getApiBaseUrl();
    const q = new URLSearchParams({
      delta_games: deltas.delta_games || 0,
      delta_coins: deltas.delta_coins || 0,
      delta_distance: deltas.delta_distance || 0,
      delta_answered: deltas.delta_answered || 0,
      delta_correct: deltas.delta_correct || 0,
    }).toString();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/runner/stats?${q}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  async getRunnerSessions(limit = 50, offset = 0) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/runner/sessions?limit=${limit}&offset=${offset}`, {
      headers: getAuthHeaders()
    });
  },

  async submitRunnerSession(payload) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/runner/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async logLearningActivity(payload) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/activities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async getResearchSubjects() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/subjects`, {
      headers: getAuthHeaders()
    });
  },

  async getResearchSessions(subjectId = null) {
    const baseUrl = getApiBaseUrl();
    const q = subjectId ? `?subject_id=${encodeURIComponent(subjectId)}` : '';
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/sessions${q}`, {
      headers: getAuthHeaders()
    });
  },

  async getCognitiveLoadStatus() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/cognitive-load-status`, {
      headers: getAuthHeaders()
    });
  },

  async getCognitiveLoadRecords(subjectId = null) {
    const baseUrl = getApiBaseUrl();
    const q = subjectId ? `?subject_id=${encodeURIComponent(subjectId)}` : '';
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/cognitive-load${q}`, {
      headers: getAuthHeaders()
    });
  },

  async getResearchAnalytics() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/analytics`, {
      headers: getAuthHeaders()
    });
  },

  async createResearchSession(payload) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async deleteMyData() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/student/privacy/delete-my-data`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  async getPublicUsersSummary() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/public-users`, {
      headers: getAuthHeaders()
    });
  },

  async getUserDossier(userEmail) {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/users/${encodeURIComponent(userEmail)}/dossier`, {
      headers: getAuthHeaders()
    });
  },

  async getAllActivities(filters = {}) {
    const baseUrl = getApiBaseUrl();
    const params = new URLSearchParams();
    if (filters.activity_type) params.set('activity_type', filters.activity_type);
    if (filters.user_email) params.set('user_email', filters.user_email);
    if (filters.limit) params.set('limit', filters.limit);
    if (filters.offset) params.set('offset', filters.offset);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/activities${q}`, {
      headers: getAuthHeaders()
    });
  },

  async exportResearchJson() {
    const baseUrl = getApiBaseUrl();
    return await fetchWithTimeout(`${baseUrl}/api/v1/research/export/json`, {
      headers: getAuthHeaders()
    });
  },

  async exportResearchCsv() {
    const baseUrl = getApiBaseUrl();
    const headers = getAuthHeaders();
    const res = await fetch(`${baseUrl}/api/v1/research/export/csv`, {
      headers
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal mengunduh CSV riset`);
    return await res.text();
  }
};
