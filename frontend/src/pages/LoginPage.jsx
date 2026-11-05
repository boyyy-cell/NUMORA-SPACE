import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, GraduationCap, Microscope, AlertCircle, Sparkles } from 'lucide-react';

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
      // Demonstration Auth routing
      if (email.toLowerCase().includes('peneliti') || email.toLowerCase().includes('researcher')) {
        navigate('/researcher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-plum text-ivory flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs — Midnight Orchid Theme */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-orchid/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-apricot/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top return link */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-lavender hover:text-ivory transition-colors bg-aubergine/80 px-3 py-1.5 rounded-xl border border-lavender/15"
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
          <h2 className="text-2xl font-bold tracking-tight text-ivory pt-2">
            Masuk ke NUMORA Space
          </h2>
          <p className="text-xs text-lavender">
            Portal Simulasi Pembelajaran & Penelitian Matematika Kelas VII
          </p>
        </div>

        {/* Notice Demo Mode */}
        <div className="p-3.5 rounded-2xl bg-aubergine/90 border border-orchid/30 text-xs space-y-2 shadow-glow-orchid">
          <div className="flex items-center gap-2 text-orchid font-bold">
            <Sparkles className="w-4 h-4 text-apricot" />
            <span>AKSES DEMONSTRASI LOKAL (v1.6)</span>
          </div>
          <p className="text-lavender text-[11px] leading-relaxed">
            Sistem autentikasi database Supabase sedang disiapkan untuk fase integrasi. Silakan gunakan tombol demonstrasi satu-klik di bawah untuk langsung mencoba ruang belajar atau ruang peneliti:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-orchid/15 hover:bg-orchid/25 border border-orchid/30 text-orchid text-[11px] font-semibold transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-apricot" />
              <span>Isi Demo Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('researcher')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-apricot/15 hover:bg-apricot/25 border border-apricot/30 text-apricot text-[11px] font-semibold transition-colors"
            >
              <Microscope className="w-3.5 h-3.5 text-orchid" />
              <span>Isi Demo Peneliti</span>
            </button>
          </div>
        </div>

        {/* Login Card Form */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-lavender/15 shadow-card-soft">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ivory/90 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-lavender">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: siswa.demo@numora.space"
                  className="w-full pl-10 pr-3 py-2.5 bg-plum/80 border border-lavender/15 rounded-xl text-xs sm:text-sm text-ivory placeholder-lavender/50 focus:outline-none focus:border-orchid/60 focus:ring-1 focus:ring-orchid/60 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-ivory/90">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-lavender">
                  Demo Mode (bebas)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-lavender">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-plum/80 border border-lavender/15 rounded-xl text-xs sm:text-sm text-ivory placeholder-lavender/50 focus:outline-none focus:border-orchid/60 focus:ring-1 focus:ring-orchid/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-lavender hover:text-ivory"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-lavender hover:text-ivory">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-lavender/30 bg-plum text-orchid focus:ring-0"
                />
                <span>Ingat Sesi Demo</span>
              </label>

              <span className="text-orchid/80 text-[11px] font-mono">
                Midnight Orchid
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-orchid to-apricot text-plum hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-glow-orchid"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-plum border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Sesi Demo...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>

          {/* Quick Direct Links */}
          <div className="mt-6 pt-5 border-t border-lavender/10 flex flex-col gap-2 text-center">
            <span className="text-[11px] text-lavender">Atau langsung akses ruangan:</span>
            <div className="flex items-center justify-center gap-3">
              <Link to="/student-dashboard" className="text-xs text-orchid hover:underline">
                → Student Space
              </Link>
              <span className="text-lavender/30">|</span>
              <Link to="/researcher-dashboard" className="text-xs text-apricot hover:underline">
                → Researcher Space
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
