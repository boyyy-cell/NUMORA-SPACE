import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import BackendStatusBadge from '../common/BackendStatusBadge';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import { Menu, X, ArrowRight, Sparkles, Microscope, Gamepad2 } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { status, checkNow, baseUrl, error } = useBackendStatus();

  return (
    <header className="sticky top-0 z-50 w-full bg-pure-white/95 backdrop-blur-sm border-b border-[#28332C]/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand */}
        <BrandLogo showTagline={false} size="default" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary-text">
          <a href="#features" className="hover:text-charcoal transition-colors tab-interactive">
            Fitur Utama
          </a>
          <a href="#preview-modules" className="hover:text-charcoal transition-colors tab-interactive">
            Modul Aljabar
          </a>
          <Link to="/numora-run" className="hover:text-forest text-[#D58B68] font-bold transition-colors flex items-center gap-1.5 tab-interactive">
            <Gamepad2 className="w-4 h-4" />
            NUMORA RUN
          </Link>
          <a href="#preview-nora" className="hover:text-forest transition-colors flex items-center gap-1.5 tab-interactive">
            <Sparkles className="w-3.5 h-3.5 text-forest" />
            NORA AI
          </a>
          <Link to="/researcher-dashboard" className="hover:text-forest transition-colors flex items-center gap-1 tab-interactive">
            <Microscope className="w-3.5 h-3.5" />
            Portal Peneliti
          </Link>
        </nav>

        {/* Right CTA & Backend Badge */}
        <div className="hidden lg:flex items-center gap-3">
          <BackendStatusBadge status={status} checkNow={checkNow} baseUrl={baseUrl} error={error} compact={true} />

          <Link
            to="/login"
            className="btn-interactive text-xs font-semibold text-charcoal px-3.5 py-2 rounded-xl hover:bg-ivory hover:border-forest/40 transition-colors border border-border-clean"
          >
            Sign In
          </Link>

          <Link
            to="/student-dashboard"
            className="btn-interactive flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-forest text-pure-white hover:bg-forest-600 transition-colors shadow-subtle"
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
            className="btn-interactive p-2 rounded-lg bg-ivory text-charcoal hover:bg-sage/20 border border-border-clean"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-pure-white border-b border-[#28332C]/10 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-secondary-text">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-ivory text-charcoal transition-colors"
            >
              Fitur Utama
            </a>
            <a
              href="#preview-modules"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-ivory text-charcoal transition-colors"
            >
              Modul Pembelajaran Aljabar
            </a>
            <Link
              to="/numora-run"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-ivory text-[#D58B68] font-bold flex items-center gap-2 transition-colors"
            >
              <Gamepad2 className="w-4 h-4" />
              NUMORA RUN (Game 3D)
            </Link>
            <a
              href="#preview-nora"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-ivory text-forest flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-forest" />
              NORA AI
            </a>
            <Link
              to="/researcher-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-ivory text-forest flex items-center gap-2 transition-colors"
            >
              <Microscope className="w-4 h-4" />
              Portal Peneliti
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#28332C]/10 flex flex-col gap-2">
            <Link
              to="/student-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-interactive w-full py-2.5 rounded-xl text-center text-xs font-semibold bg-forest text-pure-white hover:bg-forest-600"
            >
              Masuk Demo Siswa
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-interactive w-full py-2.5 rounded-xl text-center text-xs font-semibold bg-pure-white text-charcoal border border-border-clean hover:bg-ivory"
            >
              Halaman Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
