import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import {
  Menu,
  Microscope,
  Users,
  Activity,
  FileCheck2,
  Brain,
  BarChart2,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';

export default function ResearcherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-numora-bg text-numora-white flex">
      {/* Sidebar */}
      <Sidebar
        role="researcher"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
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
                  Dashboard Peneliti Pembelajaran
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-numora-violet/20 text-numora-violet border border-numora-violet/30">
                  DEMO DATA
                </span>
              </div>
              <p className="text-xs text-numora-muted hidden sm:block">
                Evaluasi Desain Pembelajaran Matematika Aljabar SMP Kelas VII
              </p>
            </div>
          </div>

          {/* Researcher Profile Demo Pill */}
          <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-numora-bg/80 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-numora-violet to-numora-cyan flex items-center justify-center font-bold text-xs text-numora-bg">
              DR
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-numora-white leading-tight">
                Tim Peneliti NUMORA
              </div>
              <div className="text-[10px] text-numora-muted">
                Fakultas Pendidikan Matematika
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Critical Ethical & Research Disclaimer */}
          <div className="p-4 rounded-2xl bg-numora-warning/10 border border-numora-warning/30 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-numora-warning shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-numora-warning">
                PERINGATAN ETIS PENELITIAN & INTEGRITAS DATA (DEMO MODE)
              </h4>
              <p className="text-numora-muted leading-relaxed">
                Seluruh metrik kognitif, jumlah subjek, status pre-test/post-test, dan durasi di halaman ini merupakan <strong className="text-numora-white">DATA SIMULASI (DEMO DATA)</strong>. NUMORA Space Phase 01 tidak mengklaim peningkatan hasil belajar siswa nyata sebelum uji empiris dan integrasi database penelitian dilakukan secara sah pada fase mendatang.
              </p>
            </div>
          </div>

          {/* RESEARCH OVERVIEW STATS (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1 */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-numora-muted">
                <span>Subjek Penelitian (Demo)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-numora-violet">
                  DEMO DATA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-numora-white font-mono">32</span>
                <span className="text-xs text-numora-muted">Siswa Terdaftar</span>
              </div>
              <div className="text-[11px] text-numora-cyan flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Kelas VII-A (Kelompok Uji Coba)</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-numora-muted">
                <span>Status Sesi Belajar</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-numora-violet">
                  DEMO DATA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-numora-white font-mono">28</span>
                <span className="text-xs text-numora-muted">Sesi Aktif</span>
              </div>
              <div className="text-[11px] text-numora-success flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Tingkat Partisipasi 87.5%</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-numora-muted">
                <span>Status Pre / Post-Test</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-numora-violet">
                  DEMO DATA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-numora-white font-mono">Pre-Test</span>
                <span className="text-xs text-numora-muted">Selesai</span>
              </div>
              <div className="text-[11px] text-numora-warning flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Post-Test Dijadwalkan (Coming Soon)</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-numora-muted">
                <span>Beban Kognitif (Cognitive Load)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-numora-violet">
                  DEMO DATA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-numora-white font-mono">Optimal</span>
                <span className="text-xs text-numora-muted">Skala NASA-TLX</span>
              </div>
              <div className="text-[11px] text-numora-cyan flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" />
                <span>Indeks Germane Load Terbimbing</span>
              </div>
            </div>
          </div>

          {/* DETAILED RESEARCH ANALYTICS PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Module Engagement Table */}
            <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-numora-white">
                    Pratinjau Keterlibatan Per Modul Aljabar
                  </h3>
                  <p className="text-xs text-numora-muted">
                    Distribusi interaksi visual dan bantuan NORA AI per materi.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-numora-violet border border-white/10">
                  DEMO DATA
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-numora-muted">
                      <th className="pb-3 font-semibold">Nama Modul</th>
                      <th className="pb-3 font-semibold">Rata-rata Waktu</th>
                      <th className="pb-3 font-semibold">Bantuan Hint NORA</th>
                      <th className="pb-3 font-semibold">Status Evaluasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-numora-white">
                    <tr>
                      <td className="py-3 font-medium">Understanding Variables</td>
                      <td className="py-3 font-mono text-numora-muted">18 menit / siswa</td>
                      <td className="py-3 font-mono text-numora-cyan">2.1 petunjuk / sesi</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Tuntas (Demo)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">Understanding Coefficients</td>
                      <td className="py-3 font-mono text-numora-muted">24 menit / siswa</td>
                      <td className="py-3 font-mono text-numora-cyan">3.8 petunjuk / sesi</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-numora-cyan/15 text-numora-cyan border border-numora-cyan/30">
                          Berlangsung (Demo)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">Understanding Constants</td>
                      <td className="py-3 font-mono text-numora-muted">15 menit / siswa</td>
                      <td className="py-3 font-mono text-numora-cyan">1.4 petunjuk / sesi</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Tuntas (Demo)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">Algebraic Expressions</td>
                      <td className="py-3 font-mono text-numora-muted">—</td>
                      <td className="py-3 font-mono text-numora-muted">—</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-numora-muted">
                          Belum Dimulai (Demo)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cognitive Load Dimensions */}
            <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-numora-white">Dimensi Teori Beban Kognitif</h4>
                  <p className="text-[11px] text-numora-muted">Sweller Cognitive Load Framework</p>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-numora-violet">
                  DEMO DATA
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-numora-muted mb-1">
                    <span>Intrinsic Load (Tingkat Kerumitan Materi)</span>
                    <span className="font-mono text-numora-white">Sedang</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-numora-bg overflow-hidden">
                    <div className="h-full bg-numora-cyan" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-numora-muted mb-1">
                    <span>Extraneous Load (Beban Distraksi UI)</span>
                    <span className="font-mono text-numora-success">Rendah (Ideal)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-numora-bg overflow-hidden">
                    <div className="h-full bg-numora-success" style={{ width: '20%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-numora-muted mb-1">
                    <span>Germane Load (Pemrosesan Skema Mental)</span>
                    <span className="font-mono text-numora-violet">Tinggi (Terarah)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-numora-bg overflow-hidden">
                    <div className="h-full bg-numora-violet" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-numora-bg/60 border border-white/5 text-[11px] text-numora-muted leading-relaxed">
                ℹ️ Visualisasi 2D interaktif dirancang untuk menekan <em>extraneous load</em> dan memfokuskan atensi siswa pada representasi konseptual.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

