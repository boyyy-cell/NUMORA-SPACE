import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NoraChatPreview from '../features/nora/NoraChatPreview';
import AlgebraLab from '../features/learning/AlgebraLab';
import MathView from '../components/common/MathView';
import { voiceService } from '../services/voiceService';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Layers,
  ShieldCheck,
  Zap,
  GraduationCap,
  Microscope,
  CheckCircle2,
  BrainCircuit,
  Eye,
  Sliders,
  Volume2,
  BookOpen,
  Award
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
      "Selamat datang di NUMORA Space. Platform pembelajaran aljabar masa depan untuk siswa SMP kelas tujuh. Memahami aljabar, melampaui sekadar rumus.",
      { onEnd: () => setIsPlayingHeroVoice(false) }
    );
  };

  return (
    <div className="min-h-screen bg-numora-bg text-numora-white flex flex-col relative overflow-hidden">
      {/* Background Decorative Gradients & Subtle Geometric Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-numora-cyan/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-numora-violet/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-numora-cyan/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #62D9F5 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-numora-surface border border-numora-cyan/30 text-xs font-semibold text-numora-cyan shadow-glow-cyan/20">
                <Sparkles className="w-3.5 h-3.5 text-numora-cyan" />
                <span>Pendidikan Matematika Berbasis AI — SMP Kelas VII</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Memahami Aljabar,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-numora-cyan via-numora-white to-numora-violet">
                  Melampaui Sekadar Rumus.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-numora-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                NUMORA Space mengajak siswa kelas VII menjelajahi konsep esensial aljabar melalui visualisasi interaktif, intuisi matematis nyata, dan pendampingan AI sokratik <strong className="text-numora-cyan">NORA</strong> yang membimbing proses bernalar tanpa membocorkan jawaban instan.
              </p>

              {/* Action Buttons & Narration */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/student-dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg hover:shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Mulai Eksplorasi (Student Space)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleHeroVoice}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-xs bg-numora-surface/80 hover:bg-numora-card text-numora-white border border-white/10 hover:border-numora-cyan/40 transition-all flex items-center justify-center gap-2"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingHeroVoice ? 'text-numora-cyan animate-pulse' : 'text-numora-muted'}`} />
                  <span>{isPlayingHeroVoice ? 'Hentikan Audio' : 'Dengarkan Narasi Suara'}</span>
                </button>

                <Link
                  to="/researcher-dashboard"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-xs text-numora-violet hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Microscope className="w-4 h-4" />
                  <span>Portal Peneliti (2 Siswa)</span>
                </Link>
              </div>

              {/* Micro proof badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-numora-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-success" />
                  <span>Kurikulum Merdeka SMP Kelas VII</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span>Socratic Loop Terstruktur</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-violet" />
                  <span>Laboratorium Aljabar 2D & 3D</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Abstract Representation */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl p-6 glass-card border border-numora-cyan/30 shadow-card-soft">
                {/* Floating mathematical formula pills */}
                <div className="absolute -top-4 -right-4 p-3 rounded-2xl bg-numora-surface/90 border border-numora-cyan/40 shadow-glow-cyan/30 text-xs font-mono text-numora-cyan animate-float-slow">
                  <MathView math="3x + 5 = 17" />
                </div>

                <div className="absolute -bottom-4 -left-4 p-3 rounded-2xl bg-numora-surface/90 border border-numora-violet/40 shadow-glow-violet/30 text-xs font-mono text-numora-violet animate-float-slow [animation-delay:2s]">
                  <MathView math="4x + 6 = 26" />
                </div>

                {/* SVG Abstract Geometry */}
                <div className="w-full h-full rounded-2xl bg-gradient-to-b from-numora-bg/90 to-numora-surface/80 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-dashed border-numora-cyan/30 animate-spin [animation-duration:25s]" />
                    <div className="absolute inset-3 rounded-full border border-numora-violet/20" />

                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-numora-cyan/20 to-numora-violet/20 border border-numora-cyan/50 flex flex-col items-center justify-center shadow-glow-cyan/20 backdrop-blur-md">
                      <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-numora-cyan to-numora-white">
                        x
                      </span>
                      <span className="text-[10px] text-numora-muted mt-0.5">Wadah Nilai</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-numora-white">Aljabar Bukanlah Hafalan Rumus</p>
                    <p className="text-xs text-numora-muted leading-relaxed">
                      Menghubungkan representasi simbolik dengan model mental visual yang kokoh.
                    </p>
                  </div>

                  <div className="w-full pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-numora-cyan/80 font-mono">
                    <span>NUMORA Engine v1.5</span>
                    <span>Verified Math Specs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: 3 CORE PEDAGOGICAL PILLARS */}
        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-numora-cyan">
              Fondasi Pedagogis
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-numora-white">
              Mengapa Siswa Membutuhkan NUMORA Space?
            </h2>
            <p className="text-xs sm:text-sm text-numora-muted leading-relaxed">
              Membantu siswa kelas VII melewati masa transisi krusial dari aritmetika angka langsung ke penalaran relasional aljabar melalui manipulasi objek bermakna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card-interactive rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-numora-cyan/15 border border-numora-cyan/30 flex items-center justify-center text-numora-cyan">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-numora-white">Interactive Algebra Lab</h3>
              <p className="text-xs text-numora-muted leading-relaxed">
                Ubah variabel abstrak menjadi wadah interaktif. Slider nilai mengubah koefisien, konstanta, dan timbangan persamaan 3D secara dinamis.
              </p>
            </div>

            <div className="glass-card-interactive rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-numora-violet/15 border border-numora-violet/30 flex items-center justify-center text-numora-violet">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-numora-white">NORA Socratic AI Tutor</h3>
              <p className="text-xs text-numora-muted leading-relaxed">
                NORA mengajukan pertanyaan terarah, memberikan petunjuk bertahap tanpa spoiler jawaban, dan mendiagnosis miskonsepsi tanda negatif.
              </p>
            </div>

            <div className="glass-card-interactive rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-numora-white">Studi Komparasi 2 Siswa</h3>
              <p className="text-xs text-numora-muted leading-relaxed">
                Rancangan penelitian pendidikan skala kecil berintegritas tinggi untuk mengukur efektivitas media aljabar secara objektif dan jujur.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: INTERACTIVE ALGEBRA LAB SHOWCASE */}
        <section id="preview-modules" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-numora-violet">
              Laboratorium Lengkap
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-numora-white">
              Eksplorasi Konsep Aljabar Interaktif
            </h2>
            <p className="text-xs sm:text-sm text-numora-muted">
              Pilih mode penjelajahan di bawah ini dan uji sendiri bagaimana angka dan lambang bereaksi secara matematis.
            </p>
          </div>

          <AlgebraLab />
        </section>

        {/* SECTION: NORA AI TUTOR PREVIEW */}
        <section id="preview-nora" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-numora-cyan/10 border border-numora-cyan/20 text-xs font-semibold text-numora-cyan">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NORA Tutor Loop</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-numora-white">
                Bimbingan Sokratik Berbahasa Indonesia Ramah & Sabar
              </h2>
              <p className="text-xs sm:text-sm text-numora-muted leading-relaxed">
                NORA dirancang khusus dengan proteksi etis agar tidak membocorkan jawaban secara langsung, melainkan melatih siswa mengurai persoalan langkah demi langkah.
              </p>
              <ul className="space-y-2.5 text-xs text-numora-white/90 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span><strong>Explain:</strong> Menjelaskan dengan analogi kehidupan sehari-hari</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span><strong>Ask:</strong> Menguji daya nalar siswa sebelum memberikan simpulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span><strong>Hint:</strong> Memberikan petunjuk bertahap (Tahap 1, 2, dan 3)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span><strong>Voice:</strong> Narasi suara terintegrasi dengan pelafalan matematika presisi</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <NoraChatPreview compact={false} />
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-numora-surface via-numora-card to-numora-surface border border-numora-cyan/30 text-center space-y-6 relative overflow-hidden shadow-card-soft">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-numora-white">
              Siap Menjelajahi Ruang Belajar NUMORA Space?
            </h2>
            <p className="text-xs sm:text-sm text-numora-muted max-w-xl mx-auto leading-relaxed">
              Akses Student Space untuk mencoba langsung seluruh laboratorium dan modul aljabar, atau masuk ke Researcher Space untuk melihat protokol penelitian skala kecil.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/student-dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg hover:opacity-95 shadow-glow-cyan"
              >
                Buka Student Space (Siswa)
              </Link>
              <Link
                to="/researcher-dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/5 text-numora-white hover:bg-white/10 border border-white/10"
              >
                Buka Researcher Space (Peneliti)
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
