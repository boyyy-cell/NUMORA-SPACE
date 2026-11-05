import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import BackendStatusBadge from '../common/BackendStatusBadge';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import { Menu, X, ArrowRight, Sparkles, User, GraduationCap, Microscope } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { status, checkNow, baseUrl, error } = useBackendStatus();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand */}
        <BrandLogo showTagline={false} size="default" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-numora-muted">
          <a href="#features" className="hover:text-numora-white transition-colors">
            Fitur Utama
          </a>
          <a href="#preview-nora" className="hover:text-numora-cyan transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-numora-cyan" />
            NORA AI
          </a>
          <a href="#preview-modules" className="hover:text-numora-white transition-colors">
            Modul Aljabar
          </a>
          <Link to="/researcher-dashboard" className="hover:text-numora-violet transition-colors flex items-center gap-1">
            <Microscope className="w-3.5 h-3.5" />
            Portal Peneliti
          </Link>
        </nav>

        {/* Right CTA & Backend Badge */}
        <div className="hidden lg:flex items-center gap-4">
          <BackendStatusBadge status={status} checkNow={checkNow} baseUrl={baseUrl} error={error} compact={true} />

          <Link
            to="/login"
            className="text-xs font-semibold text-numora-white px-4 py-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            Sign In
          </Link>

          <Link
            to="/student-dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg shadow-glow-cyan/20 hover:opacity-90 transition-opacity"
          >
            <span>Masuk Demo Siswa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <BackendStatusBadge status={status} checkNow={checkNow} baseUrl={baseUrl} error={error} compact={true} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-numora-white hover:bg-white/10"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-white/10 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-numora-muted">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-3 rounded-lg hover:bg-white/5 text-numora-white"
            >
              Fitur Utama
            </a>
            <a
              href="#preview-nora"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-3 rounded-lg hover:bg-white/5 text-numora-cyan flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              NORA AI Preview
            </a>
            <a
              href="#preview-modules"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-3 rounded-lg hover:bg-white/5 text-numora-white"
            >
              Modul Pembelajaran Aljabar
            </a>
            <Link
              to="/researcher-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-3 rounded-lg hover:bg-white/5 text-numora-violet flex items-center gap-2"
            >
              <Microscope className="w-4 h-4" />
              Dashboard Peneliti (DEMO)
            </Link>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              to="/student-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-xs font-semibold bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg"
            >
              Masuk Demo Siswa (Student Dashboard)
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-xs font-semibold bg-white/5 text-numora-white border border-white/10"
            >
              Halaman Login (Pilihan Demo)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

