import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import NoraChatPreview from '../features/nora/NoraChatPreview';
import AlgebraModulePreview from '../features/learning/AlgebraModulePreview';
import MathView from '../components/common/MathView';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  GraduationCap,
  Microscope,
  CheckCircle2,
  BrainCircuit,
  Eye
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-numora-bg text-numora-white flex flex-col relative overflow-hidden">
      {/* Background Decorative Gradients & Geometric Orbs */}
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
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-numora-surface border border-numora-cyan/30 text-xs font-semibold text-numora-cyan shadow-glow-cyan/20">
                <Sparkles className="w-3.5 h-3.5 text-numora-cyan" />
                <span>Platform Pembelajaran Matematika Masa Depan SMP Kelas VII</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Memahami Aljabar,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-numora-cyan via-numora-white to-numora-violet">
                  Melampaui Sekadar Rumus.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-numora-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                NUMORA Space mengajak siswa kelas VII menjelajahi konsep esensial aljabar melalui visualisasi interaktif, intuisi matematis nyata, dan pendampingan AI sokratik <strong className="text-numora-cyan">NORA</strong> yang membimbing daya nalar tanpa membocorkan jawaban langsung.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/student-dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg hover:shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Mulai Eksplorasi (Demo Siswa)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-numora-surface/80 hover:bg-numora-card text-numora-white border border-white/10 hover:border-numora-cyan/40 transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-numora-cyan" />
                  <span>Pilih Demo Masuk</span>
                </Link>
              </div>

              {/* Micro proof badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-numora-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-success" />
                  <span>Sesuai Kurikulum Merdeka SMP VII</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span>Bimbingan Sokratik Beretika</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-violet" />
                  <span>Laboratorium Visual 2D</span>
                </div>
              </div>
            </div>

            {/* Hero Abstract Math Illustration / Geometric Visual */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl p-6 glass-card border border-numora-cyan/30 shadow-card-soft">
                {/* Floating mathematical orbs and formulas */}
                <div className="absolute -top-4 -right-4 p-3 rounded-2xl bg-numora-surface/90 border border-numora-cyan/40 shadow-glow-cyan/30 text-xs font-mono text-numora-cyan animate-float-slow">
                  <MathView math="ax + b = c" />
                </div>

                <div className="absolute -bottom-4 -left-4 p-3 rounded-2xl bg-numora-surface/90 border border-numora-violet/40 shadow-glow-violet/30 text-xs font-mono text-numora-violet animate-float-slow [animation-delay:2s]">
                  <MathView math="3x + 7 = 22" />
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
                    <p className="text-sm font-bold text-numora-white">Aljabar Bukanlah Hafalan</p>
                    <p className="text-xs text-numora-muted">
                      Menghubungkan representasi simbolik dengan model mental visual yang kokoh.
                    </p>
                  </div>

                  <div className="w-full pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-numora-cyan/80 font-mono">
                    <span>Phase 01 Visual Engine</span>
                    <span>v0.1.0 Alpha</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: 3 CORE PILLARS / FEATURES */}
        <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-numora-cyan">
              Fitur Unggulan
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-numora-white">
              Mengapa NUMORA Space Berbeda?
            </h2>
            <p className="text-xs sm:text-sm text-numora-muted leading-relaxed">
              Dikembangkan dengan landasan pedagogi matematika terkini untuk membantu siswa kelas VII melewati transisi krusial dari aritmetika konkret ke abstraksi aljabar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-card-interactive rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-numora-cyan/15 border border-numora-cyan/30 flex items-center justify-center text-numora-cyan">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-numora-white">Visualisasi Konseptual Real-Time</h3>
              <p className="text-xs text-numora-muted leading-relaxed">
                Ubah variabel abstrak menjadi wadah konkret yang dapat diisi, disesuaikan, dan diseimbangkan layaknya timbangan fisik nyata.
              </p>
              <div className="pt-2 text-xs font-mono text-numora-cyan">
                4 Modul Dasar Siap Digunakan
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card-interactive rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-numora-violet/15 border border-numora-violet/30 flex items-center justify-center text-numora-violet">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-numora-white">Pendampingan Sokratik NORA AI</h3>
              <p className="text-xs text-numora-muted leading-relaxed">
                NORA tidak memberikan jawaban instan, melainkan mengajukan pertanyaan reflektif untuk memandu proses bernalar siswa.
              </p>
              <div className="pt-2 text-xs font-mono text-numora-violet">
                Explain · Ask · Hint · Review
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card-interactive rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-numora-white">Portal Riset & Analitik Pembelajaran</h3>
              <p className="text-xs text-numora-muted leading-relaxed">
                Menyediakan metrik kognitif terstruktur untuk peneliti dan pendidik guna memantau efektivitas media pembelajaran interaktif.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400">
                Cognitive Load & Session Monitoring
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: NORA AI PREVIEW */}
        <section id="preview-nora" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-numora-cyan/10 border border-numora-cyan/20 text-xs font-semibold text-numora-cyan">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NORA Tutor Preview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-numora-white">
                Temui NORA, Teman Belajar Aljabar Tanpa Tekanan
              </h2>
              <p className="text-xs sm:text-sm text-numora-muted leading-relaxed">
                Karakter NORA ramah, sabar, dan terstruktur. Dirancang khusus untuk mematahkan ketakutan umum siswa terhadap rumus dan huruf dalam aljabar.
              </p>
              <ul className="space-y-2 text-xs text-numora-white/90 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span>Mode <strong>Hint</strong> memberikan petunjuk bertahap tanpa spoiler</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span>Mode <strong>Explain</strong> menjabarkan makna di balik lambang</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-numora-cyan" />
                  <span>Interaksi berbahasa Indonesia santun dan mudah dipahami siswa</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <NoraChatPreview compact={false} />
            </div>
          </div>
        </section>

        {/* SECTION: INTERACTIVE MODULES PREVIEW */}
        <section id="preview-modules" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-numora-violet">
              Pembelajaran Interaktif
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-numora-white">
              Jelajahi Laboratorium Konsep Aljabar
            </h2>
            <p className="text-xs sm:text-sm text-numora-muted">
              Coba manipulasi nilai variabel di bawah ini dan lihat bagaimana koefisien dan konstanta bereaksi secara langsung.
            </p>
          </div>

          <AlgebraModulePreview />
        </section>

        {/* SECTION: CTA BANNER */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-numora-surface via-numora-card to-numora-surface border border-numora-cyan/30 text-center space-y-6 relative overflow-hidden shadow-card-soft">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-numora-cyan/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-numora-violet/15 rounded-full blur-2xl pointer-events-none" />

            <h2 className="text-2xl sm:text-3xl font-extrabold text-numora-white">
              Siap Memulai Eksplorasi Bersama NUMORA Space?
            </h2>
            <p className="text-xs sm:text-sm text-numora-muted max-w-xl mx-auto">
              Akses demo siswa untuk mencoba langsung kurikulum aljabar interaktif, atau masuk sebagai peneliti untuk melihat pratinjau analisis kognitif.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/student-dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg hover:opacity-95 shadow-glow-cyan"
              >
                Buka Student Dashboard (Demo)
              </Link>
              <Link
                to="/researcher-dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/5 text-numora-white hover:bg-white/10 border border-white/10"
              >
                Buka Researcher Dashboard (Demo)
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

