import React, { createContext, useContext, useState } from 'react';

// Akun demonstrasi protokol penelitian resmi NUMORA Space v1.6
export const DEMO_ACCOUNTS = {
  student: {
    email: 'siswa.demo@numora.space',
    password: 'demo-aljabar-7',
    role: 'student',
    name: 'Siswa Kelas VII (S-002)',
    grade: 'SMP Kelas VII',
    subjectId: 'S-002',
    description: 'Kelompok Eksperimen (Mandiri Terpandu)'
  },
  researcher: {
    email: 'peneliti.demo@numora.space',
    password: 'demo-riset-2026',
    role: 'researcher',
    name: 'Tim Peneliti Matematika',
    grade: 'Evaluator Pembelajaran',
    subjectId: 'P-001',
    description: 'Pengembang & Evaluator Desain Pembelajaran'
  }
};

const STORAGE_KEY = 'numora_auth_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // 1. Periksa localStorage (sesi persisten jika rememberMe aktif)
      const localStored = localStorage.getItem(STORAGE_KEY);
      if (localStored) {
        const parsed = JSON.parse(localStored);
        if (parsed && parsed.role && parsed.email) {
          return parsed;
        }
      }
      // 2. Periksa sessionStorage (sesi tab sementara jika rememberMe tidak aktif)
      const sessionStored = sessionStorage.getItem(STORAGE_KEY);
      if (sessionStored) {
        const parsed = JSON.parse(sessionStored);
        if (parsed && parsed.role && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca sesi autentikasi', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password, rememberMe = true) => {
    setIsLoading(true);
    // Verifikasi kredensial terukur
    await new Promise((resolve) => setTimeout(resolve, 350));

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    let matchedUser = null;
    if (
      cleanEmail === DEMO_ACCOUNTS.student.email.toLowerCase() &&
      cleanPass === DEMO_ACCOUNTS.student.password
    ) {
      matchedUser = {
        ...DEMO_ACCOUNTS.student,
        token: `numora-session-student-${Date.now()}`,
        loginTime: new Date().toISOString()
      };
    } else if (
      cleanEmail === DEMO_ACCOUNTS.researcher.email.toLowerCase() &&
      cleanPass === DEMO_ACCOUNTS.researcher.password
    ) {
      matchedUser = {
        ...DEMO_ACCOUNTS.researcher,
        token: `numora-session-researcher-${Date.now()}`,
        loginTime: new Date().toISOString()
      };
    }

    setIsLoading(false);

    if (matchedUser) {
      setUser(matchedUser);

      // Bersihkan sesi lama dari kedua storage agar tidak terjadi konflik
      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {}

      // Simpan sesuai opsi rememberMe: localStorage jika dicentang, sessionStorage jika tidak
      try {
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedUser));
        } else {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(matchedUser));
        }
      } catch (e) {
        console.warn('Gagal menyimpan sesi autentikasi ke storage', e);
      }

      return { success: true, user: matchedUser };
    }

    return {
      success: false,
      error: 'Kredensial tidak dikenali. Pada mode demonstrasi penelitian v1.6, silakan gunakan akun protokol resmi (siswa.demo@numora.space atau peneliti.demo@numora.space) atau klik tombol demo di atas.'
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Gagal menghapus sesi dari storage', e);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    demoAccounts: DEMO_ACCOUNTS
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

