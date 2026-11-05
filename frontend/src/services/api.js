/**
 * NUMORA Space API Client Service
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
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
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Permintaan waktu habis (Connection Timeout)');
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
  }
};

