/**
 * NUMORA Space API Client Service (v1.5)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
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
      throw new Error(`HTTP Error: ${response.status} - ${errText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Koneksi waktu habis (Timeout)');
    }
    throw error;
  }
}

export const apiService = {
  getBaseUrl() {
    return API_BASE_URL;
  },

  async checkHealth() {
    return await fetchWithTimeout(`${API_BASE_URL}/api/v1/health`);
  },

  async getAppInfo() {
    return await fetchWithTimeout(`${API_BASE_URL}/api/v1/info`);
  },

  async getRoot() {
    return await fetchWithTimeout(`${API_BASE_URL}/`);
  },

  // Math Evaluation Engine
  async evaluateExpression(expression, variables = { x: 4 }) {
    return await fetchWithTimeout(`${API_BASE_URL}/api/v1/math/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ expression, variables })
    });
  },

  async diagnoseMisconception(question_type, expression, student_answer) {
    return await fetchWithTimeout(`${API_BASE_URL}/api/v1/math/diagnose-misconception`, {
      method: 'POST',
      body: JSON.stringify({ question_type, expression, student_answer })
    });
  },

  // Research Management
  async getResearchSubjects() {
    return await fetchWithTimeout(`${API_BASE_URL}/api/v1/research/subjects`);
  },

  async getResearchSessions(subject_id = null) {
    const query = subject_id ? `?subject_id=${subject_id}` : '';
    return await fetchWithTimeout(`${API_BASE_URL}/api/v1/research/sessions${query}`);
  },

  async getCognitiveLoadStatus() {
    return await fetchWithTimeout(`${API_BASE_URL}/api/v1/research/cognitive-load-status`);
  },

  // NORA Open Conversational AI & Socratic System
  async noraChat(message, mode = 'explain', hint_tier = 1, history = []) {
    return await fetchWithTimeout(`${API_BASE_URL}/api/v1/nora/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, mode, hint_tier, history })
    });
  }
};
