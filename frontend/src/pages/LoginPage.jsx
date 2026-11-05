import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, GraduationCap, Microscope, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoFill = (role) => {
    if (role === 'student') {
      setEmail('siswa.demo@numora.space');
      setPassword('demo-aljabar-7');
    } else {
      setEmail('peneliti.demo@numora.space');
      setPassword('demo-riset-2026');
    }
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Mohon isi email dan kata sandi terlebih dahulu.');
      return;
    }

    if (!email.includes('@')) {
      setError('Format alamat email tidak valid.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Phase 01 Demonstration Auth routing
      if (email.toLowerCase().includes('peneliti') || email.toLowerCase().includes('researcher')) {
        navigate('/researcher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    }, 750);
  };

  return (
    <div className="min-h-screen bg-numora-bg text-numora-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-numora-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-numora-violet/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top return link */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-numora-muted hover:text-numora-white transition-colors bg-numora-surface/60 px-3 py-1.5 rounded-xl border border-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo size="lg" linkTo={null} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-numora-white pt-2">
            Masuk ke NUMORA Space
          </h2>
          <p className="text-xs text-numora-muted">
            Portal Simulasi Pembelajaran & Penelitian Matematika Kelas VII
          </p>
        </div>

        {/* Notice Demo Mode */}
        <div className="p-3.5 rounded-2xl bg-numora-surface/90 border border-numora-cyan/30 text-xs space-y-2 shadow-glow-cyan/10">
          <div className="flex items-center gap-2 text-numora-cyan font-bold">
            <Sparkles className="w-4 h-4" />
            <span>AKSES DEMONSTRASI LOKAL (PHASE 01)</span>
          </div>
          <p className="text-numora-muted text-[11px] leading-relaxed">
            Sistem autentikasi database Supabase sedang disiapkan untuk fase berikutnya. Pada Phase 01 ini, silakan gunakan tombol satu-klik di bawah untuk langsung mencoba:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-numora-cyan/15 hover:bg-numora-cyan/25 border border-numora-cyan/30 text-numora-cyan text-[11px] font-semibold transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Isi Demo Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('researcher')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-numora-violet/15 hover:bg-numora-violet/25 border border-numora-violet/30 text-numora-violet text-[11px] font-semibold transition-colors"
            >
              <Microscope className="w-3.5 h-3.5" />
              <span>Isi Demo Peneliti</span>
            </button>
          </div>
        </div>

        {/* Login Card Form */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-card-soft">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-numora-error/15 border border-numora-error/30 flex items-center gap-2 text-xs text-numora-error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-numora-white/90 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-numora-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: siswa.demo@numora.space"
                  className="w-full pl-10 pr-3 py-2.5 bg-numora-bg/80 border border-white/10 rounded-xl text-xs sm:text-sm text-numora-white placeholder-numora-muted/60 focus:outline-none focus:border-numora-cyan/50 focus:ring-1 focus:ring-numora-cyan/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-numora-white/90">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-numora-muted">
                  Demo Mode (bebas)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-numora-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-numora-bg/80 border border-white/10 rounded-xl text-xs sm:text-sm text-numora-white placeholder-numora-muted/60 focus:outline-none focus:border-numora-cyan/50 focus:ring-1 focus:ring-numora-cyan/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-numora-muted hover:text-numora-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-numora-muted hover:text-numora-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-numora-bg text-numora-cyan focus:ring-0"
                />
                <span>Ingat Sesi Demo</span>
              </label>

              <span className="text-numora-cyan/80 text-[11px]">
                Phase 01 Sandbox
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-glow-cyan/20"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-numora-bg border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Sesi Demo...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>

          {/* Quick Direct Links */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2 text-center">
            <span className="text-[11px] text-numora-muted">Atau langsung buka dashboard:</span>
            <div className="flex items-center justify-center gap-3">
              <Link to="/student-dashboard" className="text-xs text-numora-cyan hover:underline">
                → Langsung ke Student Dashboard
              </Link>
              <span className="text-white/20">|</span>
              <Link to="/researcher-dashboard" className="text-xs text-numora-violet hover:underline">
                → Researcher Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
