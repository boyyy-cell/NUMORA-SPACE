import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import BackendStatusBadge from '../common/BackendStatusBadge';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import { Menu, X, ArrowRight, Sparkles, Microscope } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { status, checkNow, baseUrl, error } = useBackendStatus();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-lavender/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand */}
        <BrandLogo showTagline={false} size="default" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-lavender">
          <a href="#features" className="hover:text-ivory transition-colors">
            Fitur Utama
          </a>
          <a href="#preview-modules" className="hover:text-orchid transition-colors">
            Modul Aljabar
          </a>
          <a href="#preview-nora" className="hover:text-apricot transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-apricot" />
            NORA AI
          </a>
          <Link to="/researcher-dashboard" className="hover:text-orchid transition-colors flex items-center gap-1">
            <Microscope className="w-3.5 h-3.5" />
            Portal Peneliti
          </Link>
        </nav>

        {/* Right CTA & Backend Badge */}
        <div className="hidden lg:flex items-center gap-4">
          <BackendStatusBadge status={status} checkNow={checkNow} baseUrl={baseUrl} error={error} compact={true} />

          <Link
            to="/login"
            className="text-xs font-semibold text-ivory px-4 py-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-lavender/20"
          >
            Sign In
          </Link>

          <Link
            to="/student-dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orchid to-apricot text-plum shadow-glow-orchid hover:opacity-90 transition-opacity"
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
            className="p-2 rounded-lg bg-aubergine text-ivory hover:bg-aubergine-light border border-lavender/10"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-lavender/10 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-lavender">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-3 rounded-lg hover:bg-white/5 text-ivory"
            >
              Fitur Utama
            </a>
            <a
              href="#preview-modules"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-3 rounded-lg hover:bg-white/5 text-ivory"
            >
              Modul Pembelajaran Aljabar
            </a>
            <a
              href="#preview-nora"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-3 rounded-lg hover:bg-white/5 text-apricot flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              NORA AI Preview
            </a>
            <Link
              to="/researcher-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-3 rounded-lg hover:bg-white/5 text-orchid flex items-center gap-2"
            >
              <Microscope className="w-4 h-4" />
              Dashboard Peneliti (Protokol 2 Siswa)
            </Link>
          </nav>

          <div className="pt-3 border-t border-lavender/10 flex flex-col gap-2">
            <Link
              to="/student-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-orchid to-apricot text-plum"
            >
              Masuk Demo Siswa (Student Space)
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-xs font-semibold bg-aubergine text-ivory border border-lavender/15"
            >
              Halaman Login (Pilihan Demo)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
