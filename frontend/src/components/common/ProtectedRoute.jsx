import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Alihkan pengunjung yang belum login kembali ke Sign In, simpan lokasi tujuan
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Jika memerlukan role tertentu dan tidak cocok, arahkan ke ruang yang tepat
  if (requiredRole && user.role !== requiredRole) {
    const targetDashboard = user.role === 'researcher' ? '/researcher-dashboard' : '/student-dashboard';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
}
