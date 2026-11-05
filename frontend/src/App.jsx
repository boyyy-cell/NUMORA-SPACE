import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import ResearcherDashboard from './pages/ResearcherDashboard';
import NumoraRunPage from './pages/NumoraRunPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/researcher-dashboard" element={<ResearcherDashboard />} />
      <Route path="/numora-run" element={<NumoraRunPage />} />
      <Route path="/run" element={<NumoraRunPage />} />
      {/* Fallback to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

