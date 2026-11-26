import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '../context/AuthContext';

let initializedGoogleClientId = null;
let activeGoogleCallback = null;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, getGoogleAuthConfig, isLoading, authError } = useAuth();
  const googleButtonRef = useRef(null);
  const googleCallbackRef = useRef(null);
  const [googleStatus, setGoogleStatus] = useState('loading');
  const [error, setError] = useState('');

  const displayError = error || authError;

  const googleConfig = getGoogleAuthConfig();

  const handleSuccessfulAuth = (result) => {
    const destination = location.state?.from?.pathname;
    if (destination && !destination.startsWith('/login')) {
      navigate(destination, { replace: true });
    } else {
      navigate(result.user.role === 'researcher' ? '/researcher-dashboard' : '/student-dashboard', {
        replace: true
      });
    }
  };

  googleCallbackRef.current = async (credentialResponse) => {
    setError('');
    if (!credentialResponse?.credential) {
      setError('Google tidak memberikan kredensial yang dapat diverifikasi. Silakan coba lagi.');
      return;
    }
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      handleSuccessfulAuth(result);
    } else {
      setError(result.error || 'Autentikasi Google gagal. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    if (!googleConfig.isConfigured) {
      setGoogleStatus('unconfigured');
      return undefined;
    }

    let active = true;
    const script = document.getElementById('google-gis-script') || document.createElement('script');
    let loadTimeoutId;
    const handleLoad = () => {
      clearTimeout(loadTimeoutId);
      if (active) {
        setGoogleStatus(window.google?.accounts?.id ? 'ready' : 'error');
      }
    };
    const handleError = () => {
      clearTimeout(loadTimeoutId);
      if (active) setGoogleStatus('error');
    };

    if (window.google?.accounts?.id) {
      setGoogleStatus('ready');
    } else {
      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
      loadTimeoutId = setTimeout(() => {
        if (active && !window.google?.accounts?.id) setGoogleStatus('error');
      }, 10000);
      if (!script.id) {
        script.id = 'google-gis-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      active = false;
      clearTimeout(loadTimeoutId);
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [googleConfig.isConfigured]);

  useEffect(() => {
    if (googleStatus !== 'ready' || !googleButtonRef.current) return;
    const googleId = window.google?.accounts?.id;
    if (!googleId) {
      setGoogleStatus('error');
      return;
    }

    const callbackHandler = (response) => googleCallbackRef.current?.(response);
    activeGoogleCallback = callbackHandler;
    googleButtonRef.current.replaceChildren();
    if (initializedGoogleClientId !== googleConfig.clientId) {
      googleId.initialize({
        client_id: googleConfig.clientId,
        callback: (response) => activeGoogleCallback?.(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      initializedGoogleClientId = googleConfig.clientId;
    }
    googleId.renderButton(googleButtonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: Math.min(360, Math.floor(googleButtonRef.current.getBoundingClientRect().width))
    });

    return () => {
      if (activeGoogleCallback === callbackHandler) activeGoogleCallback = null;
      if (typeof window !== 'undefined' && window.google?.accounts?.id?.cancel) {
        try {
          window.google.accounts.id.cancel();
        } catch (_) {}
      }
    };
  }, [googleStatus, googleConfig.clientId]);

  return (
    <main className="min-h-screen bg-ivory text-charcoal flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:absolute sm:top-6 sm:left-6 mb-6 sm:mb-0">
        <Link
          to="/"
          className="btn-interactive inline-flex items-center gap-2 text-xs font-medium text-secondary-text hover:text-charcoal transition-colors bg-pure-white px-3.5 py-2 rounded-xl border border-[#28332C]/14 shadow-subtle"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <section className="sm:mx-auto w-full sm:max-w-md space-y-6">
        <header className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo size="lg" linkTo={null} />
          </div>
          <p className="text-xs tracking-wide text-forest font-medium">Algebra, Beyond Formulas.</p>
          <h1 className="text-2xl font-bold tracking-tight text-charcoal">Masuk ke NUMORA Space</h1>
          <p className="text-sm text-secondary-text">Lanjutkan pembelajaran aljabar Anda.</p>
        </header>

        <section className="bg-pure-white rounded-2xl p-6 sm:p-8 border border-[#28332C]/14 shadow-card-clean space-y-5">
          {displayError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <div className="space-y-3">
            {googleStatus === 'ready' && (
              <div
                ref={googleButtonRef}
                className={`w-full min-h-10 flex justify-center ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                aria-label="Masuk dengan Google"
                aria-busy={isLoading}
              />
            )}
            {googleStatus === 'loading' && (
              <p role="status" className="text-center text-sm text-secondary-text">Menyiapkan Login Google...</p>
            )}
            {isLoading && (
              <p role="status" aria-live="polite" className="text-center text-sm text-secondary-text">
                Memverifikasi akun Google dan menyiapkan sesi...
              </p>
            )}
            {googleStatus === 'error' && (
              <>
                <button type="button" disabled className="w-full py-3 rounded-xl font-semibold text-sm bg-forest text-pure-white opacity-50">
                  Login dengan Google
                </button>
                <p role="status" className="text-center text-sm text-rose-700">
                  Tombol Google gagal dimuat. Periksa koneksi lalu muat ulang halaman.
                </p>
              </>
            )}
            {googleStatus === 'unconfigured' && (
              <>
                <button type="button" disabled className="w-full py-3 rounded-xl font-semibold text-sm bg-forest text-pure-white opacity-50">
                  Login dengan Google
                </button>
                <div role="status" className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs leading-relaxed text-amber-900">
                  Login Google belum dikonfigurasi. Admin perlu menetapkan
                  {' '}<code>VITE_GOOGLE_CLIENT_ID</code> di frontend dan <code>GOOGLE_CLIENT_ID</code>
                  {' '}di backend menggunakan OAuth Web Client ID yang sama.
                </div>
              </>
            )}
          </div>

          {/* Menu Akses Khusus Penelitian */}
          <div className="pt-4 border-t border-[#28332C]/10 text-center space-y-2">
            <p className="text-[11px] text-secondary-text">
              Bagian dari studi efektivitas pembelajaran matematika Kurikulum Merdeka
            </p>
            <button
              type="button"
              onClick={() => navigate('/research-login')}
              className="btn-interactive inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-forest bg-sage/15 hover:bg-sage/25 border border-forest/20 transition-all shadow-subtle"
              aria-label="Akses Portal Penelitian"
            >
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>Penelitian</span>
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
