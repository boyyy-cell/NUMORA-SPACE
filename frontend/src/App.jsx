import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import ResearcherDashboard from './pages/ResearcherDashboard';
import NumoraRunPage from './pages/NumoraRunPage';

// Rute Akar (/): Menampilkan Sign In jika belum terautentikasi, atau dashboard jika sudah
function RootHandler() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'researcher' ? (
    <Navigate to="/researcher-dashboard" replace />
  ) : (
    <Navigate to="/student-dashboard" replace />
  );
}

// Rute Login (/login): Jika sudah ada sesi aktif, langsung alihkan ke ruang yang sesuai
function LoginHandler() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return user.role === 'researcher' ? (
      <Navigate to="/researcher-dashboard" replace />
    ) : (
      <Navigate to="/student-dashboard" replace />
    );
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Halaman pertama saat website dibuka: Sign In */}
        <Route path="/" element={<RootHandler />} />
        <Route path="/login" element={<LoginHandler />} />

        {/* Halaman Profil Produk / Presentasi Publik */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Ruang Siswa Terproteksi */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruang Peneliti Terproteksi */}
        <Route
          path="/researcher-dashboard"
          element={
            <ProtectedRoute requiredRole="researcher">
              <ResearcherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Game NUMORA RUN Terproteksi */}
        <Route
          path="/numora-run"
          element={
            <ProtectedRoute>
              <NumoraRunPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/run"
          element={
            <ProtectedRoute>
              <NumoraRunPage />
            </ProtectedRoute>
          }
        />

        {/* Rute tidak dikenal dialihkan ke Sign In */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
