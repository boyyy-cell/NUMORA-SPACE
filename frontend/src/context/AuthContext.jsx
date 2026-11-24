import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { apiService } from '../services/api';
import { studentSyncService } from '../services/studentSyncService';

const STORAGE_KEY = 'numora_auth_session';
const AuthContext = createContext(null);

function isValidStoredSession(session) {
  return Boolean(
    session &&
    (session.role === 'student' || session.role === 'researcher') &&
    typeof session.email === 'string' &&
    typeof session.token === 'string' &&
    session.token.split('.').length === 3
  );
}

function readStoredSession() {
  if (typeof window === 'undefined') return null;

  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) continue;

      const session = JSON.parse(raw);
      if (!isValidStoredSession(session)) {
        storage.removeItem(STORAGE_KEY);
        continue;
      }
      if (isJwtExpired(session.token)) {
        storage.removeItem(STORAGE_KEY);
        continue;
      }
      return session;
    } catch (error) {
      console.warn('Gagal membaca sesi autentikasi dari penyimpanan peramban.');
      storage.removeItem(STORAGE_KEY);
    }
  }
  return null;
}

function clearStoredSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Gagal menghapus sesi autentikasi dari penyimpanan peramban.');
  }
}

function saveStoredSession(user) {
  clearStoredSession();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn('Sesi aktif hanya tersedia hingga halaman ditutup karena penyimpanan peramban gagal.');
  }
}

function createSessionUser(user, token, loginTime) {
  return {
    ...user,
    subjectId: user.subject_id || user.subjectId,
    token,
    loginTime: loginTime || new Date().toISOString()
  };
}

function getGoogleLoginError(error) {
  if (error.isOffline || error.isTimeout) {
    return 'Layanan autentikasi tidak dapat dijangkau. Periksa koneksi jaringan dan konfigurasi CORS lalu coba lagi.';
  }
  if (error.status === 401) {
    return 'Google tidak dapat memverifikasi akun ini. Silakan coba akun lain.';
  }
  if (error.status === 403) return 'Akses autentikasi ditolak oleh backend.';
  if (error.status === 404) return 'Endpoint autentikasi tidak ditemukan. Periksa konfigurasi URL API.';
  if (error.status === 429) return 'Terlalu banyak percobaan masuk. Tunggu sebentar lalu coba lagi.';
  if (error.isServerError) return 'Layanan autentikasi mengalami gangguan. Silakan coba lagi nanti.';
  return error.message || 'Autentikasi gagal. Silakan coba lagi.';
}

/**
 * Validasi masa berlaku JWT secara proaktif di sisi klien.
 */
export function isJwtExpired(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr);
    return Boolean(payload && payload.exp && Date.now() >= payload.exp * 1000);
  } catch (_) {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [initialSession] = useState(readStoredSession);
  const [user, setUser] = useState(initialSession);
  const [isRestoringSession, setIsRestoringSession] = useState(Boolean(initialSession));
  const [isLoading, setIsLoading] = useState(Boolean(initialSession));
  const [authError, setAuthError] = useState('');
  const loginInProgress = useRef(false);

  useEffect(() => {
    if (!initialSession) return undefined;

    let cancelled = false;
    const validateSession = async () => {
      try {
        const profile = await apiService.getMe();
        if (cancelled) return;
        const verifiedUser = createSessionUser(
          profile,
          initialSession.token,
          initialSession.loginTime
        );
        setUser(verifiedUser);
        saveStoredSession(verifiedUser);
        studentSyncService.initializeSync(verifiedUser).catch(() => {});
      } catch (error) {
        if (cancelled) return;
        if (error.status === 401) {
          clearStoredSession();
          setUser(null);
        } else {
          console.warn('[NUMORA Auth] session verification unavailable; retaining stored session.');
          setUser(initialSession);
        }
      } finally {
        if (!cancelled) {
          setIsRestoringSession(false);
          setIsLoading(false);
        }
      }
    };

    validateSession();
    return () => {
      cancelled = true;
    };
  }, [initialSession]);

  const clearLocalSession = () => {
    setUser(null);
    clearStoredSession();
    setAuthError('');
  };

  useEffect(() => {
    const handleUnauthorized = () => clearLocalSession();
    window.addEventListener('numora_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('numora_auth_unauthorized', handleUnauthorized);
  }, []);

  const getGoogleAuthConfig = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
    const isConfigured = Boolean(
      clientId &&
      clientId.trim() !== '' &&
      !clientId.includes('your_google_client_id') &&
      clientId.includes('.apps.googleusercontent.com')
    );
    return { isConfigured, clientId: isConfigured ? clientId : null };
  };

  const loginWithGoogle = async (credential) => {
    if (typeof credential !== 'string' || !credential) {
      const err = 'Google tidak memberikan kredensial yang dapat diverifikasi.';
      setAuthError(err);
      return { success: false, error: 'Google tidak memberikan kredensial yang dapat diverifikasi.' };
    }
    if (loginInProgress.current) {
      const err = 'Autentikasi Google sedang diproses. Silakan tunggu.';
      setAuthError(err);
      return { success: false, error: 'Autentikasi Google sedang diproses. Silakan tunggu.' };
    }

    loginInProgress.current = true;
    setIsLoading(true);
    setAuthError('');
    try {
      const response = await apiService.loginGoogle(credential);
      if (
        !response?.access_token ||
        !response?.user ||
        !['student', 'researcher'].includes(response.user.role) ||
        typeof response.user.email !== 'string'
      ) {
        const err = 'Backend autentikasi Google memberikan respons tidak valid.';
        setAuthError(err);
        return { success: false, error: 'Backend autentikasi Google memberikan respons tidak valid.' };
      }
      const authenticatedUser = createSessionUser(response.user, response.access_token);
      setUser(authenticatedUser);
      saveStoredSession(authenticatedUser);
      studentSyncService.initializeSync(authenticatedUser).catch(() => {});
      return { success: true, user: authenticatedUser };
    } catch (error) {
      setAuthError(getGoogleLoginError(error));
      return { success: false, error: getGoogleLoginError(error) };
    } finally {
      loginInProgress.current = false;
      setIsLoading(false);
    }
  };

  const loginResearcher = async (email, password, rememberMe = true) => {
    if (!email || !password) {
      const err = 'Email dan kata sandi peneliti wajib diisi.';
      setAuthError(err);
      return { success: false, error: err };
    }
    setIsLoading(true);
    setAuthError('');
    try {
      const response = await apiService.loginResearcher(email, password, rememberMe);
      if (
        !response?.access_token ||
        !response?.user ||
        response.user.role !== 'researcher'
      ) {
        const err = 'Akses ditolak: Hanya akun peneliti terverifikasi resmi yang diizinkan.';
        setAuthError(err);
        return { success: false, error: err };
      }
      const authenticatedUser = createSessionUser(response.user, response.access_token);
      setUser(authenticatedUser);
      saveStoredSession(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (error) {
      let msg = error.message || 'Autentikasi peneliti gagal. Silakan periksa kredensial Anda.';
      if (error.isNetworkError || error.isOffline) {
        msg = `Gagal menghubungi server backend (${apiService.getBaseUrl()}). Pastikan backend sedang aktif dan dapat diakses dari IP jaringan ini.`;
      } else if (error.status === 401 || error.status === 403) {
        msg = 'Kredensial peneliti tidak valid. Hanya akun peneliti resmi (P-001) yang diizinkan.';
      } else if (error.status === 429) {
        msg = 'Terlalu banyak percobaan masuk. Tunggu sebentar demi keamanan lalu coba lagi.';
      }
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    let revoked = true;
    if (user?.token?.split('.').length === 3) {
      try {
        const response = await apiService.logoutBackend();
        revoked = response?.revoked === true;
      } catch (_) {
        revoked = false;
      }
    }
    clearLocalSession();
    if (!revoked) {
      console.error('Sesi lokal dihapus, tetapi server tidak mengonfirmasi pencabutan token.');
      return { success: false, error: 'Sesi lokal dihapus, tetapi pencabutan sesi di server gagal.' };
    }
    return { success: true };
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    isRestoringSession,
    authError,
    setAuthError,
    loginWithGoogle,
    loginResearcher,
    getGoogleAuthConfig,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return ctx;
}
