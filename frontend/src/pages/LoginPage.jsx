import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowLeft,
  GraduationCap,
  Microscope,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [activeAccountLabel, setActiveAccountLabel] = useState('');

  const handleDemoFill = (role) => {
    if (role === 'student') {
      setEmail(DEMO_ACCOUNTS.student.email);
      setPassword(DEMO_ACCOUNTS.student.password);
      setActiveAccountLabel('Akun Siswa Demo (S-002)');
    } else {
      setEmail(DEMO_ACCOUNTS.researcher.email);
      setPassword(DEMO_ACCOUNTS.researcher.password);
      setActiveAccountLabel('Akun Peneliti Demo (P-001)');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Mohon isi alamat email dan kata sandi terlebih dahulu.');
      return;
    }

    if (!email.includes('@')) {
      setError('Format alamat email tidak valid.');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      // Periksa apakah ada rute asal yang diminta pengunjung
      const destination = location.state?.from?.pathname;
      if (destination && !destination.startsWith('/login')) {
        navigate(destination, { replace: true });
      } else if (result.user.role === 'researcher') {
        navigate('/researcher-dashboard', { replace: true });
      } else {
        navigate('/student-dashboard', { replace: true });
      }
    } else {
      setError(result.error || 'Autentikasi gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top navigation link to product presentation */}
      <div className="absolute top-6 left-6">
        <Link
          to="/landing"
          className="btn-interactive inline-flex items-center gap-2 text-xs font-medium text-secondary-text hover:text-charcoal transition-colors bg-pure-white px-3.5 py-1.5 rounded-xl border border-[#28332C]/14 shadow-subtle"
          title="Buka Halaman Presentasi NUMORA Space"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Lihat Pengantar Produk</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-5 animate-fade-page">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="flex justify-center">
            <BrandLogo size="lg" linkTo={null} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal pt-2">
            Masuk ke NUMORA Space
          </h2>
          <p className="text-xs text-secondary-text">
            Sistem Pembelajaran Aljabar SMP Kelas VII — Kurikulum Merdeka
          </p>
        </div>

        {/* Demo Protocol Access Notice */}
        <div className="p-4 rounded-2xl bg-pure-white border border-[#28332C]/14 text-xs space-y-2.5 shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-forest font-semibold">
              <ShieldCheck className="w-4 h-4 text-forest" />
              <span>Akses Demonstrasi Penelitian v1.6</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage/20 text-forest">
              Resmi
            </span>
          </div>

          <p className="text-secondary-text text-[11px] leading-relaxed">
            Pada rilis evaluasi v1.6, akses dibatasi khusus untuk dua akun protokol penelitian. Klik tombol di bawah untuk mengisi kredensial resmi secara terverifikasi:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => handleDemoFill('student')}
              className="btn-interactive flex flex-col items-center justify-center p-2.5 rounded-xl bg-ivory hover:bg-sage/20 border border-[#28332C]/14 text-charcoal transition-colors text-center"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-forest">
                <GraduationCap className="w-4 h-4 text-forest" />
                <span>Demo Siswa</span>
              </div>
              <span className="text-[10px] text-secondary-text mt-0.5">Kelas VII (S-002)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoFill('researcher')}
              className="btn-interactive flex flex-col items-center justify-center p-2.5 rounded-xl bg-ivory hover:bg-sage/20 border border-[#28332C]/14 text-charcoal transition-colors text-center"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-terracotta">
                <Microscope className="w-4 h-4 text-terracotta" />
                <span>Demo Peneliti</span>
              </div>
              <span className="text-[10px] text-secondary-text mt-0.5">Evaluator (P-001)</span>
            </button>
          </div>

          {activeAccountLabel && (
            <div className="flex items-center gap-1.5 text-[11px] text-forest font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeAccountLabel} siap dimasukkan.</span>
            </div>
          )}
        </div>

        {/* Login Card Form */}
        <div className="bg-pure-white rounded-2xl p-6 sm:p-7 border border-[#28332C]/14 shadow-card-clean">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Alamat Email Protokol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="siswa.demo@numora.space"
                  className="input-interactive w-full pl-10 pr-3 py-2.5 bg-ivory/60 border border-[#28332C]/14 rounded-xl text-xs sm:text-sm text-charcoal placeholder-secondary-text/60 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-charcoal">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-secondary-text">
                  Wajib sesuai protokol demo
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
                  className="input-interactive w-full pl-10 pr-10 py-2.5 bg-ivory/60 border border-[#28332C]/14 rounded-xl text-xs sm:text-sm text-charcoal placeholder-secondary-text/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-interactive absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-text hover:text-charcoal"
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
                  className="rounded border-[#28332C]/20 text-forest focus:ring-0"
                />
                <span>Simpan sesi peramban</span>
              </label>

              <span className="text-secondary-text text-[11px]">
                Sage & Ivory v1.6
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-interactive w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-forest text-pure-white hover:bg-forest-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-subtle"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-pure-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>

          {/* Quick Notice Info */}
          <div className="mt-5 pt-4 border-t border-[#28332C]/14 text-center">
            <p className="text-[11px] text-secondary-text leading-relaxed">
              Belum memiliki akun penelitian? Hubungi tim pengembang di{' '}
              <span className="font-mono text-charcoal font-semibold">riset@numora.space</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
