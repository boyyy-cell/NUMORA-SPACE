import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import NoraChatPreview from '../features/nora/NoraChatPreview';
import AlgebraLab from '../features/learning/AlgebraLab';
import MathematicalChallenge from '../features/learning/MathematicalChallenge';
import { MODULES_DATA } from '../features/learning/AlgebraModulePreview';
import MathView from '../components/common/MathView';
import {
  Menu,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  Bot,
  Play,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sliders
} from 'lucide-react';

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, modules, lab, nora, challenge, progress
  const [selectedModuleModal, setSelectedModuleModal] = useState(null);

  // Honest student learning state
  const [completedModules, setCompletedModules] = useState(['variables']);

  return (
    <div className="min-h-screen bg-plum text-ivory flex">
      {/* Responsive Sidebar */}
      <Sidebar
        role="student"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 sm:h-20 bg-aubergine/85 backdrop-blur-md border-b border-lavender/10 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-plum/70 text-ivory hover:bg-plum border border-lavender/10"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-ivory">
                  Student Space
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orchid/15 text-orchid border border-orchid/30">
                  SMP Kelas VII
                </span>
              </div>
              <p className="text-xs text-lavender hidden sm:block">
                Ruang Eksplorasi Konseptual Aljabar Berbantuan AI Sokratik
              </p>
            </div>
          </div>

          {/* Student Profile Pill */}
          <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-plum/70 border border-lavender/15">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orchid to-apricot flex items-center justify-center font-bold text-xs text-plum">
              S2
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-ivory leading-tight">
                Subjek Siswa (S-002)
              </div>
              <div className="text-[10px] text-lavender">
                Kelompok Eksperimen NUMORA
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Transparent Research & Ethics Banner */}
          <div className="p-3.5 rounded-2xl bg-aubergine/60 border border-lavender/10 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-lavender">
              <AlertCircle className="w-4 h-4 text-orchid shrink-0" />
              <span>
                <strong className="text-ivory">Protokol Penelitian Terpadu:</strong> Aktivitas pembelajaran di ruang ini dipantau secara anonim untuk studi evaluasi efektivitas intervensi media digital aljabar.
              </span>
            </div>
            <span className="hidden md:inline-block text-[11px] font-mono text-lavender bg-plum/70 px-2 py-1 rounded border border-lavender/10">
              Protocol S-002 Active
            </span>
          </div>

          {/* HERO GREETING & CONTINUE LEARNING */}
          {activeTab === 'overview' && (
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-aubergine via-plum to-aubergine border border-orchid/25 relative overflow-hidden shadow-card-soft">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orchid/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-orchid flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-apricot" />
                      Selamat Datang di NUMORA Space
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-ivory">
                    Lanjutkan: Modul 02 — Memahami Koefisien
                  </h2>

                  <p className="text-xs sm:text-sm text-lavender leading-relaxed max-w-2xl">
                    Di modul sebelumnya kamu sudah memahami bahwa variabel $x$ adalah wadah penampung nilai. Sekarang, mari pelajari bagaimana angka di depan $x$ melipatgandakan jumlah wadah tersebut.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('lab')}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-orchid to-apricot text-plum hover:opacity-90 flex items-center gap-2 shadow-glow-orchid transition-all"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Buka Interactive Algebra Lab</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('nora')}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-aubergine hover:bg-aubergine-light text-ivory border border-lavender/15 flex items-center gap-2 transition-colors"
                    >
                      <Bot className="w-4 h-4 text-orchid" />
                      <span>Diskusi bersama NORA AI</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('challenge')}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-aubergine hover:bg-aubergine-light text-ivory border border-lavender/15 flex items-center gap-2 transition-colors"
                    >
                      <Award className="w-4 h-4 text-apricot" />
                      <span>Tantangan Literasi PISA</span>
                    </button>
                  </div>
                </div>

                {/* Honest Progress Card */}
                <div className="lg:col-span-4 rounded-2xl bg-plum/85 border border-lavender/15 p-5 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-lavender">Capaian Modul Inti:</span>
                    <span className="font-bold text-orchid font-mono">1 dari 4 Modul (25%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-aubergine overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orchid to-apricot" style={{ width: '25%' }} />
                  </div>
                  <div className="text-[11px] text-lavender space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span>• Understanding Variables:</span>
                      <span className="text-sage font-semibold">Tuntas (100%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Understanding Coefficients:</span>
                      <span className="text-orchid font-semibold">Sedang Dipelajari</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Understanding Constants:</span>
                      <span className="text-lavender/60">Belum Dimulai</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Algebraic Expressions:</span>
                      <span className="text-lavender/60">Belum Dimulai</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OVERVIEW / MODULES */}
          {(activeTab === 'overview' || activeTab === 'modules') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-ivory">
                    4 Pilar Fondasi Aljabar Kelas VII
                  </h3>
                  <p className="text-xs text-lavender">
                    Setiap modul dirancang sistematis: Tujuan Pembelajaran, Animasi Konsep, Interaksi Lab, dan Evaluasi.
                  </p>
                </div>
              </div>

              {/* 4 Module Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {MODULES_DATA.map((mod, index) => {
                  const Icon = mod.icon;
                  const isDone = completedModules.includes(mod.id);
                  const isCurrent = mod.id === 'coefficients';

                  return (
                    <div
                      key={mod.id}
                      onClick={() => setSelectedModuleModal(mod)}
                      className="glass-card-interactive rounded-2xl p-5 flex flex-col justify-between border border-lavender/15 hover:border-orchid/40 cursor-pointer space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} bg-opacity-20 flex items-center justify-center text-white shadow-sm`}>
                            <Icon className="w-5 h-5 text-ivory" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-plum/70 text-orchid border border-orchid/20">
                            Modul 0{index + 1}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-ivory text-sm line-clamp-1">
                            {mod.title}
                          </h4>
                          <p className="text-xs text-orchid font-medium">
                            {mod.subtitle}
                          </p>
                        </div>

                        <p className="text-xs text-lavender line-clamp-2 leading-relaxed">
                          {mod.description}
                        </p>

                        <div className="p-2 rounded-lg bg-plum/70 border border-lavender/10 text-center text-xs font-mono text-ivory">
                          <MathView math={mod.math} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-lavender/10 flex items-center justify-between text-[11px]">
                        <span className="text-lavender">Status Belajar:</span>
                        {isDone ? (
                          <span className="text-sage font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                            Tuntas
                          </span>
                        ) : isCurrent ? (
                          <span className="text-orchid font-semibold animate-pulse">
                            Aktif Dipelajari
                          </span>
                        ) : (
                          <span className="text-lavender/60">Tersedia</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: INTERACTIVE ALGEBRA LAB */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              <AlgebraLab />
            </div>
          )}

          {/* TAB: NORA AI TUTOR */}
          {activeTab === 'nora' && (
            <div className="space-y-4">
              <NoraChatPreview compact={false} />
            </div>
          )}

          {/* TAB: MATHEMATICAL CHALLENGE */}
          {activeTab === 'challenge' && (
            <div className="space-y-4">
              <MathematicalChallenge />
            </div>
          )}

          {/* TAB: LEARNING PROGRESS (HONEST STATE) */}
          {activeTab === 'progress' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-lavender/15 space-y-4">
                <h4 className="font-bold text-ivory text-sm">
                  Log Aktivitas Belajar Terdata (Subjek S-002)
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-plum/60 border border-lavender/10 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-ivory">Sesi 1: Eksplorasi Wadah Variabel</div>
                      <div className="text-[11px] text-lavender">Durasi: 22.5 menit · Bantuan NORA: 1 petunjuk</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-sage/20 text-sage font-mono text-[10px] border border-sage/30">
                      Tuntas
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-plum/60 border border-lavender/10 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-ivory">Sesi 2: Kelipatan Koefisien & Tanda Negatif</div>
                      <div className="text-[11px] text-lavender">Status: Sedang Berlangsung di Laboratorium Aljabar</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-orchid/20 text-orchid font-mono text-[10px] border border-orchid/30">
                      Berjalan
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-lavender/15 space-y-3">
                <h4 className="font-bold text-ivory text-sm">Indikator Pemahaman</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-plum/60 border border-lavender/10">
                    <span className="text-lavender block text-[10px]">Konsep Variabel:</span>
                    <span className="font-bold text-sage">Mastered (Dipahami Baik)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-plum/60 border border-lavender/10">
                    <span className="text-lavender block text-[10px]">Konsep Koefisien:</span>
                    <span className="font-bold text-orchid">Developing (Sedang Berkembang)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-plum/60 border border-lavender/10">
                    <span className="text-lavender block text-[10px]">Konstanta & Ekspresi:</span>
                    <span className="font-bold text-lavender/60">Not Enough Data</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module Detail Modal */}
          {selectedModuleModal && (
            <div className="fixed inset-0 bg-plum/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-card rounded-3xl p-6 max-w-lg w-full border border-orchid/35 shadow-card-soft space-y-5 animate-scale-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-orchid">
                      Silabus SMP Kelas VII
                    </span>
                    <h3 className="text-lg font-bold text-ivory">
                      {selectedModuleModal.title}
                    </h3>
                    <p className="text-xs text-apricot">{selectedModuleModal.subtitle}</p>
                  </div>
                  <button
                    onClick={() => setSelectedModuleModal(null)}
                    className="p-1.5 rounded-lg bg-plum/60 text-lavender hover:text-ivory border border-lavender/10"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-plum/90 border border-lavender/10 text-center text-sm font-mono text-ivory">
                  <MathView math={selectedModuleModal.math} block={true} />
                </div>

                <div className="space-y-2 text-xs text-lavender leading-relaxed">
                  <strong className="text-ivory block">Tujuan Pembelajaran:</strong>
                  <p>{selectedModuleModal.description}</p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSelectedModuleModal(null)}
                    className="px-4 py-2 rounded-xl text-xs text-lavender hover:text-ivory"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModuleModal(null);
                      setActiveTab('lab');
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orchid to-apricot text-plum hover:opacity-90"
                  >
                    Buka di Laboratorium Aljabar
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
