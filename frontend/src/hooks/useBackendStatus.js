import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

/**
 * Hook to monitor backend connectivity.
 * Distinguishes 5 distinct operational states:
 * - 'connecting' (in progress / initial probe)
 * - 'online' (health check returned 200 healthy)
 * - 'offline' (network down / timeout / connection refused)
 * - 'request_failed' (server 5xx error or response failure)
 * - 'unauthorized' (401 / 403 access forbidden)
 */
export function useBackendStatus(autoCheck = true, pollIntervalMs = 15000) {
  const [status, setStatus] = useState('connecting');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = useCallback(async () => {
    setStatus('connecting');
    try {
      const result = await apiService.checkHealth();
      if (result && (result.status === 'healthy' || result.status === 'operational')) {
        setData(result);
        setError(null);
        setStatus('online');
      } else {
        setData(result);
        setError('Respons backend tidak berstatus healthy');
        setStatus('request_failed');
      }
    } catch (err) {
      setData(null);
      setError(err.message || 'Gagal terhubung ke backend server');

      if (err.isUnauthorized) {
        setStatus('unauthorized');
      } else if (err.isHttpError || err.isServerError) {
        setStatus('request_failed');
      } else {
        setStatus('offline');
      }
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

  // Backward compatibility alias: isConnected is true only when strictly 'online'
  const isConnected = status === 'online';

  return {
    status,
    isConnected,
    data,
    error,
    checkNow: checkStatus,
    lastChecked,
    baseUrl: apiService.getBaseUrl()
  };
}
