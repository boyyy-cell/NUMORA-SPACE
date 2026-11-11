import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NoraChatPreview from '../features/nora/NoraChatPreview';
import AlgebraLab from '../features/learning/AlgebraLab';
import MathView, { MathText } from '../components/common/MathView';
import { voiceService } from '../services/voiceService';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Volume2,
  LogIn,
  Gamepad2
} from 'lucide-react';

export default function LandingPage() {
  const [isPlayingHeroVoice, setIsPlayingHeroVoice] = useState(false);

  const handleHeroVoice = () => {
    if (isPlayingHeroVoice) {
      voiceService.stop();
      setIsPlayingHeroVoice(false);
      return;
    }
    setIsPlayingHeroVoice(true);
    voiceService.speak(
      "Selamat datang di NUMORA Space. Platform pembelajaran matematika interaktif untuk siswa SMP kelas tujuh. Memahami aljabar, melampaui sekadar rumus.",
      { onEnd: () => setIsPlayingHeroVoice(false) }
    );
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-10 pb-14 lg:pt-16 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pure-white border border-border-clean text-xs font-semibold text-forest shadow-subtle">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NUMORA Space • Matematika SMP Kelas VII</span>
              </div>

              {/* Single Clear Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-charcoal leading-tight">
                Memahami Aljabar dengan Makna,{' '}
                <span className="text-forest">
                  Bukan Menghafal Rumus.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-secondary-text max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Platform pembelajaran interaktif yang membantu siswa kelas VII memvisualisasikan variabel, menguji persamaan, dan berdiskusi bersama tutor AI NORA.
              </p>

              {/* Action Buttons: Mulai Belajar, Main NUMORA RUN, & Masuk */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/student-dashboard"
                  className="btn-interactive w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-forest text-pure-white hover:bg-forest-600 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                >
                  <span>Mulai Belajar</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/numora-run"
                  className="btn-interactive w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-sm bg-[#D58B68] text-pure-white hover:bg-[#D58B68]/90 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Main NUMORA RUN</span>
                </Link>

                <Link
                  to="/login"
                  className="btn-interactive w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-sm bg-pure-white hover:bg-ivory text-charcoal border border-[#28332C]/14 hover:border-forest/40 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                >
                  <LogIn className="w-4 h-4 text-secondary-text" />
                  <span>Masuk</span>
                </Link>

                <button
                  onClick={handleHeroVoice}
                  className="btn-interactive w-full sm:w-auto px-4 py-3 rounded-xl font-medium text-xs text-secondary-text hover:text-charcoal bg-transparent hover:bg-pure-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingHeroVoice ? 'text-forest animate-pulse' : 'text-secondary-text'}`} />
                  <span>{isPlayingHeroVoice ? 'Hentikan Audio' : 'Dengar Pengantar'}</span>
                </button>
              </div>

              {/* 3 Core Highlights */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-secondary-text">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span>Kurikulum Merdeka</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span>Laboratorium 3D Interaktif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span>Bimbingan Sokratik NORA</span>
                </div>
              </div>
            </div>

            {/* Hero Mathematical Visualization Card */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-md rounded-2xl p-6 bg-pure-white border border-border-clean shadow-card-clean space-y-4 text-center">
                <div className="flex items-center justify-between text-xs text-secondary-text border-b border-border-clean pb-2.5">
                  <span className="font-semibold text-charcoal">Model Mental Variabel</span>
                  <span className="px-2 py-0.5 rounded bg-sage/20 text-forest font-mono text-[11px] font-bold">Interaktif</span>
                </div>

                <div className="py-4 flex flex-col items-center justify-center space-y-3">
                  <div className="w-24 h-24 rounded-2xl bg-forest/10 border-2 border-forest flex flex-col items-center justify-center shadow-subtle">
                    <span className="text-3xl font-extrabold font-mono text-forest">x</span>
                    <span className="text-[11px] text-secondary-text font-medium">Wadah Nilai</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-base font-bold text-charcoal">Variabel sebagai Wadah</p>
                    <p className="text-xs text-secondary-text max-w-xs mx-auto leading-relaxed">
                      <MathText text="Lambang $x$ bukan sekadar huruf asing, melainkan wadah yang menampung bilangan numerik." />
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-ivory border border-border-clean text-center font-mono text-sm font-bold text-forest">
                  <MathView math="3x + 5 = 17 \implies x = 4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: INTERACTIVE ALGEBRA LAB SHOWCASE (FITUR UTAMA & MODUL) */}
        <section id="features" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#28332C]/14 scroll-mt-20">
          <div id="preview-modules" className="scroll-mt-20">
            <div className="text-center max-w-xl mx-auto space-y-1.5 mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                Laboratorium Matematika
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
                Eksplorasi Konsep Aljabar
              </h2>
              <p className="text-xs sm:text-sm text-secondary-text">
                Pilih mode penjelajahan untuk melihat bagaimana angka dan lambang berinteraksi.
              </p>
            </div>

            <AlgebraLab />
          </div>
        </section>

        {/* SECTION: NORA AI TUTOR PREVIEW */}
        <section id="preview-nora" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#28332C]/14 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/20 text-xs font-semibold text-forest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tutor Pendamping</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
                Tanya NORA Kapan Saja
              </h2>
              <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
                NORA membimbing proses berpikir siswa melalui dialog ramah, contoh nyata, dan petunjuk bertahap tanpa membocorkan jawaban langsung.
              </p>
              <ul className="space-y-2 text-xs text-charcoal pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span><strong>Explain:</strong> Penjelasan analogi konsep yang mudah dipahami</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span><strong>Ask:</strong> Pertanyaan reflektif untuk melatih daya nalar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span><strong>Hint:</strong> Petunjuk bertahap (Tahap 1, 2, dan 3)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                  <span><strong>Review:</strong> Mengulang pemahaman materi sebelumnya</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <NoraChatPreview compact={false} />
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#28332C]/14">
          <div className="rounded-2xl p-8 bg-pure-white border border-[#28332C]/14 text-center space-y-4 shadow-card-clean max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
              Siap Bereksplorasi di NUMORA Space?
            </h2>
            <p className="text-xs sm:text-sm text-secondary-text">
              Masuk ke Ruang Siswa untuk mencoba modul dan laboratorium, atau akses Ruang Peneliti.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link
                to="/student-dashboard"
                className="btn-interactive w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-forest text-pure-white hover:bg-forest-600 transition-colors shadow-subtle"
              >
                Mulai Belajar (Ruang Siswa)
              </Link>
              <Link
                to="/login"
                className="btn-interactive w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-pure-white text-charcoal hover:bg-ivory border border-border-clean hover:border-forest/40 transition-colors"
              >
                Halaman Masuk
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
