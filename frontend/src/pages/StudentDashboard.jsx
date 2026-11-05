import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import NoraChatPreview from '../features/nora/NoraChatPreview';
import AlgebraModulePreview, { MODULES_DATA } from '../features/learning/AlgebraModulePreview';
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
  Flame,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, modules, nora, progress
  const [selectedModule, setSelectedModule] = useState(null);

  return (
    <div className="min-h-screen bg-numora-bg text-numora-white flex">
      {/* Sidebar */}
      <Sidebar
        role="student"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 sm:h-20 bg-numora-surface/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-numora-white hover:bg-white/10"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-numora-white">
                  Dashboard Siswa
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-numora-cyan/15 text-numora-cyan border border-numora-cyan/30">
                  SAMPLE DATA
                </span>
              </div>
              <p className="text-xs text-numora-muted hidden sm:block">
                Ruang Eksplorasi Konseptual Aljabar SMP Kelas VII
              </p>
            </div>
          </div>

          {/* Student Profile Demo Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-numora-bg/80 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-numora-cyan to-numora-violet flex items-center justify-center font-bold text-xs text-numora-bg">
                RP
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-numora-white leading-tight">
                  Rizky Pratama
                </div>
                <div className="text-[10px] text-numora-muted">
                  Kelas VII-A · SMP Demo
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Disclaimer Banner Sample Data */}
          <div className="p-3.5 rounded-2xl bg-numora-surface/60 border border-white/10 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-numora-muted">
              <AlertCircle className="w-4 h-4 text-numora-cyan shrink-0" />
              <span>
                <strong className="text-numora-white">Mode Demonstrasi:</strong> Semua statistik kemajuan, skor, dan waktu di halaman ini berstatus <span className="text-numora-cyan font-mono font-bold">SAMPLE DATA</span> untuk tujuan evaluasi antarmuka Phase 01.
              </span>
            </div>
            <span className="hidden md:inline-block text-[11px] font-mono text-numora-muted bg-white/5 px-2 py-1 rounded">
              Local Mock Engine
            </span>
          </div>

          {/* GREETING & CONTINUE LEARNING HERO */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-numora-surface via-numora-card to-numora-surface border border-numora-cyan/20 relative overflow-hidden shadow-card-soft">
            <div className="absolute top-0 right-0 w-80 h-80 bg-numora-cyan/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-numora-cyan flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Selamat Belajar Kembali, Rizky!
                  </span>
                  <span className="text-[10px] bg-numora-cyan/15 text-numora-cyan px-2 py-0.5 rounded-full font-mono">
                    SMP Kelas VII
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-numora-white">
                  Lanjutkan Modul 02: Memahami Koefisien
                </h2>

                <p className="text-xs sm:text-sm text-numora-muted leading-relaxed max-w-2xl">
                  Kamu telah menyelesaikan konsep dasar variabel. Hari ini mari kita pelajari bagaimana sebuah angka dapat melipatgandakan nilai wadah aljabar secara visual.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('modules')}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg hover:opacity-90 flex items-center gap-2 shadow-glow-cyan/20 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Continue Learning</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('nora')}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/5 hover:bg-white/10 text-numora-white border border-white/10 flex items-center gap-2 transition-colors"
                  >
                    <Bot className="w-4 h-4 text-numora-cyan" />
                    <span>Tanya NORA AI</span>
                  </button>
                </div>
              </div>

              {/* Progress Summary Pill */}
              <div className="lg:col-span-4 rounded-2xl bg-numora-bg/70 border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-numora-muted">Total Kemajuan (SAMPLE DATA)</span>
                  <span className="font-bold text-numora-cyan font-mono">57.5%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-numora-surface overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-numora-cyan to-numora-violet"
                    style={{ width: '57.5%' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-numora-muted">
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="block text-numora-white font-bold">2 dari 4</span>
                    <span>Modul Dipelajari</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="block text-numora-success font-bold">3 Hari</span>
                    <span>Streak Belajar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & 4 MODULES */}
          {(activeTab === 'overview' || activeTab === 'modules') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-numora-white">
                    4 Modul Inti Aljabar SMP Kelas VII
                  </h3>
                  <p className="text-xs text-numora-muted">
                    Selesaikan setiap modul konseptual untuk membuka pemahaman aljabar seutuhnya.
                  </p>
                </div>
                <span className="text-xs font-mono text-numora-muted">
                  Semua persentase berlabel <strong className="text-numora-cyan">SAMPLE DATA</strong>
                </span>
              </div>

              {/* 4 MODULE CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {MODULES_DATA.map((mod, index) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={mod.id}
                      onClick={() => setSelectedModule(mod)}
                      className="glass-card-interactive rounded-2xl p-5 flex flex-col justify-between border border-white/10 hover:border-numora-cyan/40 cursor-pointer space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} bg-opacity-20 flex items-center justify-center text-white shadow-sm`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-numora-cyan border border-white/10">
                            Modul 0{index + 1}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-numora-white text-sm line-clamp-1">
                            {mod.title}
                          </h4>
                          <p className="text-xs text-numora-cyan font-medium">
                            {mod.subtitle}
                          </p>
                        </div>

                        <p className="text-xs text-numora-muted line-clamp-2 leading-relaxed">
                          {mod.description}
                        </p>

                        <div className="p-2 rounded-lg bg-numora-bg/60 border border-white/5 text-center text-xs font-mono text-numora-white">
                          <MathView math={mod.math} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-numora-muted text-[10px]">Kemajuan (SAMPLE):</span>
                          <span className="font-bold text-numora-white font-mono">{mod.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-numora-surface overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-numora-cyan to-numora-violet"
                            style={{ width: `${mod.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Visual Studio embedded */}
              <div className="pt-4">
                <AlgebraModulePreview />
              </div>
            </div>
          )}

          {/* TAB 2: NORA AI TUTOR */}
          {activeTab === 'nora' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-numora-white">
                    Sesi Bimbingan Sokratik NORA
                  </h3>
                  <p className="text-xs text-numora-muted">
                    Eksplorasi konsep matematika dengan tanya-jawab interaktif. (DEMO MODE)
                  </p>
                </div>
              </div>
              <NoraChatPreview compact={false} />
            </div>
          )}

          {/* TAB 3: LEARNING PROGRESS & RECENT ACTIVITY */}
          {(activeTab === 'overview' || activeTab === 'progress') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-numora-cyan" />
                    <h4 className="text-sm font-bold text-numora-white">Aktivitas Terkini</h4>
                  </div>
                  <span className="text-[10px] font-mono text-numora-muted px-2 py-0.5 rounded bg-white/5">
                    SAMPLE DATA
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Menyelesaikan Simulasi Wadah Variabel', time: 'Hari ini, 09:30', badge: '100% Selesai', color: 'text-numora-success' },
                    { title: 'Tanya Jawab Mode Hint bersama NORA AI', time: 'Kemarin, 14:15', badge: 'Diskusi Sokratik', color: 'text-numora-cyan' },
                    { title: 'Mencoba Manipulasi Nilai Koefisien 3x', time: '2 hari lalu, 11:00', badge: 'Eksplorasi Visual', color: 'text-numora-violet' },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-numora-bg/50 border border-white/5 text-xs">
                      <div>
                        <div className="font-medium text-numora-white">{act.title}</div>
                        <div className="text-[11px] text-numora-muted">{act.time}</div>
                      </div>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 ${act.color}`}>
                        {act.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Stats Card */}
              <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-numora-violet" />
                    <h4 className="text-sm font-bold text-numora-white">Metrik Pemahaman</h4>
                  </div>
                  <span className="text-[10px] font-mono text-numora-muted px-2 py-0.5 rounded bg-white/5">
                    SAMPLE DATA
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-numora-bg/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-numora-muted block">Waktu Belajar Simulasi</span>
                      <span className="text-sm font-bold text-numora-white">1 Jam 45 Menit</span>
                    </div>
                    <Clock className="w-5 h-5 text-numora-cyan" />
                  </div>

                  <div className="p-3 rounded-xl bg-numora-bg/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-numora-muted block">Tingkat Penguasaan Konsep</span>
                      <span className="text-sm font-bold text-numora-white">Mahir (Taraf Konseptual)</span>
                    </div>
                    <Award className="w-5 h-5 text-numora-violet" />
                  </div>

                  <div className="p-3 rounded-xl bg-numora-bg/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-numora-muted block">Interaksi Sokratik NORA</span>
                      <span className="text-sm font-bold text-numora-white">12 Pertanyaan Reflektif</span>
                    </div>
                    <Bot className="w-5 h-5 text-numora-success" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

