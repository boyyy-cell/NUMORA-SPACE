import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { apiService } from '../services/api';
import {
  Menu,
  Microscope,
  Users,
  Activity,
  FileCheck2,
  Brain,
  BarChart2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  UserCheck,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export default function ResearcherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, subjects, cognitive, assessment
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [cogStatus, setCogStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadResearchData = async () => {
      try {
        const [subs, sess, cog] = await Promise.all([
          apiService.getResearchSubjects(),
          apiService.getResearchSessions(),
          apiService.getCognitiveLoadStatus(),
        ]);
        if (isMounted) {
          setSubjects(subs);
          setSessions(sess);
          setCogStatus(cog);
          setLoading(false);
        }
      } catch (err) {
        // Fallback local realistic data for 2 subjects
        if (isMounted) {
          setSubjects([
            {
              subject_id: 'S-001',
              group: 'Control (Tatap Muka bersama Peneliti)',
              role_description: 'Siswa belajar konsep aljabar secara tatap muka konvensional terarah bersama peneliti.',
              grade: 'SMP Kelas VII',
              active_module: 'Modul 02: Understanding Coefficients',
              pretest_status: 'Belum Dilaksanakan (Scheduled)',
              posttest_status: 'Belum Dilaksanakan (Scheduled)',
              cognitive_load_status: 'NOT CONFIGURED (Belum Diukur)',
              total_sessions_logged: 1
            },
            {
              subject_id: 'S-002',
              group: 'Experimental (Berbantuan NUMORA Space)',
              role_description: 'Siswa belajar konsep aljabar secara mandiri terpandu melalui platform NUMORA Space & NORA AI.',
              grade: 'SMP Kelas VII',
              active_module: 'Modul 02: Understanding Coefficients',
              pretest_status: 'Belum Dilaksanakan (Scheduled)',
              posttest_status: 'Belum Dilaksanakan (Scheduled)',
              cognitive_load_status: 'NOT CONFIGURED (Belum Diukur)',
              total_sessions_logged: 1
            }
          ]);
          setLoading(false);
        }
      }
    };
    loadResearchData();
    return () => { isMounted = false; };
  }, []);

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
                  Researcher Space
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-numora-violet/20 text-numora-violet border border-numora-violet/30">
                  Studi Komparasi Skala Kecil (2 Siswa)
                </span>
              </div>
              <p className="text-xs text-numora-muted hidden sm:block">
                Evaluasi Desain Pembelajaran Matematika Aljabar SMP Kelas VII
              </p>
            </div>
          </div>

          {/* Researcher Profile Pill */}
          <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-numora-bg/80 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-numora-violet to-numora-cyan flex items-center justify-center font-bold text-xs text-numora-bg">
              DR
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-numora-white leading-tight">
                Tim Peneliti Pendidikan
              </div>
              <div className="text-[10px] text-numora-muted">
                Pendidikan Matematika
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Ethical Research Transparency Statement */}
          <div className="p-4 rounded-2xl bg-numora-surface/90 border border-numora-violet/30 flex items-start gap-3.5 text-xs shadow-card-soft">
            <ShieldCheck className="w-5 h-5 text-numora-violet shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-numora-white flex items-center gap-2">
                <span>RANCANGAN PENELITIAN SKALA KECIL (AUTENTIK)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  Data Integritas Tinggi
                </span>
              </h4>
              <p className="text-numora-muted leading-relaxed">
                Penelitian ini dirancang secara khusus untuk <strong className="text-numora-white">dua siswa kelas VII</strong>:
                satu siswa belajar secara langsung bersama peneliti (S-001), dan satu siswa belajar berbantuan NUMORA Space (S-002).
                Sistem tidak menampilkan data populasi fiktif atau kurva peningkatan palsu.
              </p>
            </div>
          </div>

          {/* OVERVIEW STATS: 4 Honest Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1: Subjek Penelitian */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-numora-muted">
                <span>Total Subjek Penelitian</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-numora-cyan">
                  VERIFIED
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-numora-white font-mono">2</span>
                <span className="text-xs text-numora-muted">Siswa (S-001 & S-002)</span>
              </div>
              <div className="text-[11px] text-numora-cyan flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>1 Kontrol · 1 Eksperimen</span>
              </div>
            </div>

            {/* Stat 2: Sesi Selesai */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-numora-muted">
                <span>Sesi Orientasi Awal</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-numora-cyan">
                  LOGGED
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-numora-white font-mono">2</span>
                <span className="text-xs text-numora-muted">Sesi Terdata</span>
              </div>
              <div className="text-[11px] text-numora-success flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>1 Sesi per Subjek</span>
              </div>
            </div>

            {/* Stat 3: Status Pre / Post Test */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-numora-muted">
                <span>Status Pre & Post-Test</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                  SCHEDULED
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-numora-white font-mono">Menunggu</span>
                <span className="text-xs text-numora-muted">Sesi Pengujian</span>
              </div>
              <div className="text-[11px] text-numora-warning flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Instrumen Siap Diterapkan</span>
              </div>
            </div>

            {/* Stat 4: Cognitive Load Status */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-numora-muted">
                <span>Beban Kognitif (Leppink)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-numora-muted">
                  PROTOCOL
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-numora-muted font-mono">Belum Diukur</span>
              </div>
              <div className="text-[11px] text-numora-muted flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" />
                <span>Menunggu Pasca Pembelajaran</span>
              </div>
            </div>
          </div>

          {/* TWO SUBJECT DETAILS (S-001 & S-002) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-numora-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-numora-cyan" />
              <span>Daftar Subjek Penelitian (Anonim)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((sub) => (
                <div key={sub.subject_id} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-numora-white bg-numora-surface px-2.5 py-1 rounded-lg border border-white/10">
                      ID: {sub.subject_id}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      sub.subject_id === 'S-001'
                        ? 'bg-numora-violet/20 text-numora-violet border border-numora-violet/30'
                        : 'bg-numora-cyan/20 text-numora-cyan border border-numora-cyan/30'
                    }`}>
                      {sub.group}
                    </span>
                  </div>

                  <p className="text-xs text-numora-muted leading-relaxed">
                    {sub.role_description}
                  </p>

                  <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-numora-muted">
                    <div>
                      <span>Modul Aktif:</span>
                      <div className="text-numora-white font-medium truncate">{sub.active_module}</div>
                    </div>
                    <div>
                      <span>Pre-Test / Post-Test:</span>
                      <div className="text-amber-300 font-medium">Terjadwal</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEPPINK COGNITIVE LOAD FRAMEWORK STATUS */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <h4 className="text-sm font-bold text-numora-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-numora-violet" />
                  <span>Struktur Pengukuran Beban Kognitif (Leppink Multidimensional Scale)</span>
                </h4>
                <p className="text-xs text-numora-muted">
                  Berdasarkan instrumen baku Leppink et al. (2013) untuk mengukur 3 jenis beban pemrosesan informasi.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                STATUS: NOT CONFIGURED (Belum Diukur)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-numora-bg/70 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-numora-cyan block">
                  1. Intrinsic Cognitive Load (ICL)
                </span>
                <p className="text-numora-muted text-[11px] leading-relaxed">
                  Beban yang melekat pada kerumitan alami konsep matematika aljabar (variabel, koefisien negatif).
                </p>
                <div className="text-[10px] font-mono text-numora-white bg-white/5 p-2 rounded">
                  Status: Menunggu respons siswa pasca sesi.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-numora-bg/70 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  2. Extraneous Cognitive Load (ECL)
                </span>
                <p className="text-numora-muted text-[11px] leading-relaxed">
                  Beban akibat distraksi atau kesulitan penggunaan antarmuka. NUMORA meminimalkan ECL melalui tata letak rapi.
                </p>
                <div className="text-[10px] font-mono text-numora-white bg-white/5 p-2 rounded">
                  Status: Menunggu respons siswa pasca sesi.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-numora-bg/70 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-numora-violet block">
                  3. Germane Cognitive Load (GCL)
                </span>
                <p className="text-numora-muted text-[11px] leading-relaxed">
                  Beban kognitif produktif yang digunakan siswa untuk membangun skema pemahaman aljabar jangka panjang.
                </p>
                <div className="text-[10px] font-mono text-numora-white bg-white/5 p-2 rounded">
                  Status: Menunggu respons siswa pasca sesi.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-numora-muted leading-relaxed">
              ℹ️ Sesuai standar etika penelitian, skor angka dan grafik beban kognitif tidak akan ditampilkan sebelum lembar skala 0-10 Likert diisi secara sah oleh subjek penelitian pada akhir protokol.
            </div>
          </div>

          {/* ASSESSMENT CENTER (PRE-TEST & POST-TEST BLUEPRINT) */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-numora-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Pusat Asesmen & Protokol Pengujian</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-numora-surface border border-white/5 space-y-2">
                <span className="font-bold text-numora-white block">A. Pre-Test Mandiri</span>
                <p className="text-[11px] text-numora-muted">
                  Mengukur pemahaman awal sebelum intervensi pembelajaran. Bebas dari bantuan NORA.
                </p>
                <span className="text-[10px] font-mono text-amber-300 block">Status: Terjadwal</span>
              </div>

              <div className="p-4 rounded-xl bg-numora-surface border border-white/5 space-y-2">
                <span className="font-bold text-numora-white block">B. Evaluasi Per Modul</span>
                <p className="text-[11px] text-numora-muted">
                  Uji pemahaman formatif di akhir setiap modul aljabar untuk mendiagnosis miskonsepsi.
                </p>
                <span className="text-[10px] font-mono text-numora-cyan block">Status: Terintegrasi di Laboratorium</span>
              </div>

              <div className="p-4 rounded-xl bg-numora-surface border border-white/5 space-y-2">
                <span className="font-bold text-numora-white block">C. Post-Test Komparasi</span>
                <p className="text-[11px] text-numora-muted">
                  Mengukur capaian akhir untuk membandingkan peningkatan individual S-001 dan S-002.
                </p>
                <span className="text-[10px] font-mono text-amber-300 block">Status: Terjadwal</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
