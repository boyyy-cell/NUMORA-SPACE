import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowLeft, Lock, Mail, KeyRound } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '../context/AuthContext';

export default function ResearcherLoginPage() {
  const navigate = useNavigate();
  const { loginResearcher, isLoading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState('');

  const displayError = localError || authError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim()) {
      setLocalError('Email peneliti wajib diisi.');
      return;
    }
    if (!password) {
      setLocalError('Kata sandi wajib diisi.');
      return;
    }

    const result = await loginResearcher(email.trim().toLowerCase(), password, rememberMe);
    if (result.success) {
      navigate('/researcher-dashboard', { replace: true });
    } else {
      setLocalError(result.error || 'Autentikasi peneliti gagal.');
    }
  };

  return (
    <main className="min-h-screen bg-ivory text-charcoal flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:absolute sm:top-6 sm:left-6 mb-6 sm:mb-0">
        <Link
          to="/login"
          className="btn-interactive inline-flex items-center gap-2 text-xs font-medium text-secondary-text hover:text-charcoal transition-colors bg-pure-white px-3.5 py-2 rounded-xl border border-[#28332C]/14 shadow-subtle"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Login Siswa</span>
        </Link>
      </div>

      <section className="sm:mx-auto w-full sm:max-w-md space-y-6">
        <header className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo size="lg" linkTo={null} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/20 text-forest text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal Riset Terproteksi (P-001)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">Autentikasi Tim Peneliti</h1>
          <p className="text-xs sm:text-sm text-secondary-text">
            Akses pemantauan pembelajaran mandiri, evaluasi 10 soal, dan analitik empiris.
          </p>
        </header>

        <section className="bg-pure-white rounded-2xl p-6 sm:p-8 border border-[#28332C]/14 shadow-card-clean space-y-5">
          {displayError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs sm:text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="researcher-email" className="block text-xs font-semibold text-charcoal">
                Email Peneliti Resmi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="researcher-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="peneliti.demo@numora.space"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#28332C]/20 bg-ivory/50 text-xs sm:text-sm text-charcoal placeholder:text-secondary-text/60 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="researcher-password" className="block text-xs font-semibold text-charcoal">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-text">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="researcher-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#28332C]/20 bg-ivory/50 text-xs sm:text-sm text-charcoal placeholder:text-secondary-text/60 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#28332C]/30 text-forest focus:ring-forest"
                />
                <span className="text-xs text-secondary-text">Ingat sesi penelitian</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-forest text-pure-white hover:bg-forest/90 active:scale-[0.99] disabled:opacity-50 transition-all shadow-subtle flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi Kredensial...' : 'Masuk ke Dashboard Peneliti'}</span>
            </button>
          </form>

          <div className="rounded-xl bg-ivory border border-[#28332C]/10 p-3 text-[11px] leading-relaxed text-secondary-text space-y-1">
            <p className="font-semibold text-charcoal flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span>Protokol Keamanan & Integritas Data Riset</span>
            </p>
            <p>
              Validasi peran dilakukan secara kriptografis di tingkat backend. Akun siswa, pengguna umum, atau akses tidak sah akan ditolak otomatis dengan kode status HTTP 403 Forbidden.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
