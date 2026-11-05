import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export function useBackendStatus(autoCheck = true, pollIntervalMs = 15000) {
  const [status, setStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = useCallback(async () => {
    setStatus('checking');
    try {
      const result = await apiService.checkHealth();
      setData(result);
      setError(null);
      setStatus('connected');
    } catch (err) {
      setError(err.message || 'Gagal terhubung ke backend server');
      setData(null);
      setStatus('disconnected');
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      checkStatus();
      const interval = setInterval(checkStatus, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [autoCheck, pollIntervalMs, checkStatus]);

  return { status, data, error, checkNow: checkStatus, lastChecked, baseUrl: apiService.getBaseUrl() };
}

