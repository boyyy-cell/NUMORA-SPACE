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
  ArrowRight,
  Bot,
  Play,
  CheckCircle2,
  Sliders,
  X
} from 'lucide-react';

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview (Beranda), modules (Materi), lab (Algebra Lab), nora (NORA), challenge (Evaluasi)
  const [selectedModuleModal, setSelectedModuleModal] = useState(null);

  // Real student progress
  const [completedModules, setCompletedModules] = useState(['variables']);

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex">
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
        <header className="sticky top-0 z-30 h-16 sm:h-18 bg-pure-white/95 backdrop-blur-sm border-b border-border-clean px-4 sm:px-8 flex items-center justify-between shadow-subtle">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-ivory text-charcoal hover:bg-sage/20 border border-border-clean"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-charcoal">
                  Ruang Siswa
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage/20 text-forest border border-sage/30">
                  SMP Kelas VII
                </span>
              </div>
              <p className="text-xs text-secondary-text hidden sm:block">
                Eksplorasi Konsep Aljabar Interaktif
              </p>
            </div>
          </div>

          {/* Student Profile Pill */}
          <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-ivory border border-border-clean">
            <div className="w-7 h-7 rounded-full bg-forest text-pure-white flex items-center justify-center font-bold text-xs">
              S
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-charcoal leading-tight">
                Siswa Kelas VII
              </div>
              <div className="text-[10px] text-secondary-text">
                Subjek Belajar
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-7 space-y-6 max-w-6xl mx-auto w-full">
          {/* TAB 1: BERANDA (OVERVIEW) — SIMPLIFIED UX */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Single Hero Card: Sapaan Singkat, Materi Terakhir, Satu Tombol Utama */}
              <div className="rounded-2xl p-6 sm:p-8 bg-pure-white border border-border-clean shadow-card-clean space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/20 text-xs font-semibold text-forest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Halo, Siswa SMP! Siap Belajar Hari Ini?</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
                    Materi Terakhir: Memahami Koefisien
                  </h2>
                  <p className="text-xs sm:text-sm text-secondary-text leading-relaxed max-w-2xl">
                    Pelajari bagaimana bilangan di depan variabel $x$ melipatgandakan nilai wadah aljabar secara visual.
                  </p>
                </div>

                {/* Satu Tombol Utama: Lanjutkan Belajar */}
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('lab')}
                    className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-forest text-pure-white hover:bg-forest-600 transition-colors flex items-center gap-2 shadow-subtle"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Lanjutkan Belajar</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('nora')}
                    className="px-4 py-3 rounded-xl text-xs sm:text-sm font-medium bg-pure-white hover:bg-ivory text-charcoal border border-border-clean flex items-center gap-2 transition-colors"
                  >
                    <Bot className="w-4 h-4 text-forest" />
                    <span>Tanya NORA</span>
                  </button>
                </div>

                {/* Progress Bar Bersih (Hanya Data Nyata) */}
                <div className="pt-4 border-t border-border-clean space-y-2 max-w-md">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-secondary-text">Progres Modul Aljabar:</span>
                    <span className="font-semibold text-forest">1 dari 4 Selesai (25%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ivory overflow-hidden border border-border-clean">
                    <div className="h-full bg-forest rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>

              {/* Tautan Cepat 4 Modul Ringkas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-charcoal">
                    Daftar Modul Belajar
                  </h3>
                  <button
                    onClick={() => setActiveTab('modules')}
                    className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MODULES_DATA.map((mod, idx) => {
                    const isDone = completedModules.includes(mod.id);
                    const isCurrent = mod.id === 'coefficients';

                    return (
                      <div
                        key={mod.id}
                        onClick={() => setSelectedModuleModal(mod)}
                        className="bg-pure-white rounded-xl p-4 border border-border-clean hover:border-forest transition-colors cursor-pointer space-y-3 shadow-subtle"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] font-semibold text-secondary-text">
                            Modul 0{idx + 1}
                          </span>
                          {isDone ? (
                            <span className="text-forest text-[11px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                              Selesai
                            </span>
                          ) : isCurrent ? (
                            <span className="text-terracotta text-[11px] font-semibold">
                              Sedang Dipelajari
                            </span>
                          ) : (
                            <span className="text-secondary-text text-[11px]">
                              Tersedia
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-charcoal text-sm">
                            {mod.subtitle}
                          </h4>
                          <p className="text-xs text-secondary-text line-clamp-1 mt-0.5">
                            {mod.description}
                          </p>
                        </div>

                        <div className="p-1.5 rounded-lg bg-ivory text-center font-mono text-xs font-semibold text-forest">
                          <MathView math={mod.math} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATERI (MODULES) — DAFTAR RAPI & RINGKAS */}
          {activeTab === 'modules' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Materi Pembelajaran Aljabar
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Pahami konsep aljabar langkah demi langkah dari variabel hingga bentuk aljabar utuh.
                </p>
              </div>

              <div className="space-y-3">
                {MODULES_DATA.map((mod, index) => {
                  const isDone = completedModules.includes(mod.id);
                  const isCurrent = mod.id === 'coefficients';

                  return (
                    <div
                      key={mod.id}
                      className="bg-pure-white rounded-2xl p-5 border border-border-clean flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle hover:border-forest transition-colors"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ivory text-secondary-text border border-border-clean">
                            Modul 0{index + 1}
                          </span>
                          {isDone && (
                            <span className="text-xs text-forest font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Tuntas
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-xs text-terracotta font-semibold">
                              Sedang Aktif
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-charcoal">
                          {mod.subtitle} ({mod.title})
                        </h3>
                        <p className="text-xs text-secondary-text leading-relaxed">
                          {mod.description}
                        </p>
                        <div className="inline-block p-1 px-3 rounded-lg bg-ivory font-mono text-xs text-forest font-semibold mt-1">
                          <MathView math={mod.math} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedModuleModal(mod);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest text-pure-white hover:bg-forest-600 transition-colors shadow-subtle"
                        >
                          Pelajari Materi
                        </button>
                        <button
                          onClick={() => setActiveTab('lab')}
                          className="px-3.5 py-2 rounded-xl text-xs font-medium bg-ivory text-charcoal hover:bg-sage/20 border border-border-clean transition-colors"
                        >
                          Uji di Lab
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ALGEBRA LAB */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Algebra Lab & Visualisasi 3D
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Eksplorasi representasi variabel, koefisien, konstanta, dan timbangan aljabar interaktif.
                </p>
              </div>
              <AlgebraLab />
            </div>
          )}

          {/* TAB 4: NORA SOCRATIC TUTOR */}
          {activeTab === 'nora' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Tutor Sokratik NORA
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Tanyakan kesulitan aljabar kapan saja. NORA membimbing tanpa membocorkan jawaban langsung.
                </p>
              </div>
              <NoraChatPreview compact={false} />
            </div>
          )}

          {/* TAB 5: EVALUASI (CHALLENGE) */}
          {activeTab === 'challenge' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Evaluasi Literasi Matematika
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Latihan soal kontekstual aljabar dengan umpan balik diagnostik instan.
                </p>
              </div>
              <MathematicalChallenge />
            </div>
          )}
        </main>
      </div>

      {/* DETAIL MODAL MATERI */}
      {selectedModuleModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-pure-white rounded-2xl p-6 border border-border-clean shadow-elevated space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-border-clean pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
                  Modul Pembelajaran
                </span>
                <h3 className="text-lg font-bold text-charcoal">
                  {selectedModuleModal.subtitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModuleModal(null)}
                className="p-1.5 rounded-lg hover:bg-ivory text-secondary-text hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-secondary-text leading-relaxed">
              {selectedModuleModal.description}
            </p>

            <div className="p-3 rounded-xl bg-ivory border border-border-clean text-center font-mono text-sm font-semibold text-forest">
              <MathView math={selectedModuleModal.math} block={true} />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedModuleModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-ivory text-charcoal hover:bg-sage/20 border border-border-clean"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedModuleModal(null);
                  setActiveTab('lab');
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-forest text-pure-white hover:bg-forest-600 transition-colors shadow-subtle"
              >
                Buka di Algebra Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
