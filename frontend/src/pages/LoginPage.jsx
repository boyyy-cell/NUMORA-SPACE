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
    }, 500);
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top return link */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-secondary-text hover:text-charcoal transition-colors bg-pure-white px-3 py-1.5 rounded-xl border border-border-clean shadow-subtle"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-5">
        <div className="text-center space-y-1.5">
          <div className="flex justify-center">
            <BrandLogo size="lg" linkTo={null} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-charcoal pt-2">
            Masuk ke NUMORA Space
          </h2>
          <p className="text-xs text-secondary-text">
            Pilih demo ruang siswa atau ruang peneliti
          </p>
        </div>

        {/* Notice Demo Mode */}
        <div className="p-4 rounded-2xl bg-pure-white border border-border-clean text-xs space-y-2 shadow-subtle">
          <div className="flex items-center gap-2 text-forest font-semibold">
            <Sparkles className="w-4 h-4 text-forest" />
            <span>Akses Demonstrasi Cepat</span>
          </div>
          <p className="text-secondary-text text-[11px] leading-relaxed">
            Klik salah satu tombol di bawah untuk mengisi formulir demo secara otomatis:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-ivory hover:bg-sage/20 border border-border-clean text-charcoal text-[11px] font-medium transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-forest" />
              <span>Demo Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('researcher')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-ivory hover:bg-sage/20 border border-border-clean text-charcoal text-[11px] font-medium transition-colors"
            >
              <Microscope className="w-3.5 h-3.5 text-terracotta" />
              <span>Demo Peneliti</span>
            </button>
          </div>
        </div>

        {/* Login Card Form */}
        <div className="bg-pure-white rounded-2xl p-6 sm:p-7 border border-border-clean shadow-card-clean">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: siswa.demo@numora.space"
                  className="w-full pl-10 pr-3 py-2.5 bg-ivory/60 border border-border-clean rounded-xl text-xs sm:text-sm text-charcoal placeholder-secondary-text/60 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-charcoal">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-secondary-text">
                  Bebas untuk demo
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-ivory/60 border border-border-clean rounded-xl text-xs sm:text-sm text-charcoal placeholder-secondary-text/60 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-text hover:text-charcoal"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-secondary-text hover:text-charcoal">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border-clean text-forest focus:ring-0"
                />
                <span>Ingat Sesi</span>
              </label>

              <span className="text-secondary-text text-[11px]">
                Sage & Ivory v1.6
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-forest text-pure-white hover:bg-forest-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-subtle"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-pure-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Sesi...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>

          {/* Quick Direct Links */}
          <div className="mt-5 pt-4 border-t border-border-clean flex flex-col gap-1.5 text-center">
            <span className="text-[11px] text-secondary-text">Atau langsung ke:</span>
            <div className="flex items-center justify-center gap-3">
              <Link to="/student-dashboard" className="text-xs text-forest font-semibold hover:underline">
                → Ruang Siswa
              </Link>
              <span className="text-border-clean">|</span>
              <Link to="/researcher-dashboard" className="text-xs text-terracotta font-semibold hover:underline">
                → Ruang Peneliti
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
