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
  ShieldCheck,
  UserCheck
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
              total_sessions_logged: 0,
              data_source: 'PROTOCOL_TEMPLATE'
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
              total_sessions_logged: 0,
              data_source: 'PROTOCOL_TEMPLATE'
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
    <div className="min-h-screen bg-plum text-ivory flex">
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
                  Researcher Space
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orchid/20 text-orchid border border-orchid/30">
                  Studi Komparasi Skala Kecil (2 Siswa)
                </span>
              </div>
              <p className="text-xs text-lavender hidden sm:block">
                Evaluasi Desain Pembelajaran Matematika Aljabar SMP Kelas VII
              </p>
            </div>
          </div>

          {/* Researcher Profile Pill */}
          <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-plum/70 border border-lavender/15">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orchid to-apricot flex items-center justify-center font-bold text-xs text-plum">
              DR
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-ivory leading-tight">
                Tim Peneliti Pendidikan
              </div>
              <div className="text-[10px] text-lavender">
                Pendidikan Matematika
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Ethical Research Transparency Statement */}
          <div className="p-4 rounded-2xl bg-aubergine/90 border border-orchid/30 flex items-start gap-3.5 text-xs shadow-card-soft">
            <ShieldCheck className="w-5 h-5 text-orchid shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-ivory flex items-center gap-2">
                <span>RANCANGAN PENELITIAN SKALA KECIL (AUTENTIK)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sage/20 text-sage font-mono border border-sage/30">
                  Data Integritas Tinggi
                </span>
              </h4>
              <p className="text-lavender leading-relaxed">
                Penelitian ini dirancang secara khusus untuk <strong className="text-ivory">dua siswa kelas VII</strong>:
                satu siswa belajar secara langsung bersama peneliti (S-001), dan satu siswa belajar berbantuan NUMORA Space (S-002).
                S-001 dan S-002 adalah label anonim protokol, bukan klaim data partisipasi yang telah terlaksana. Seluruh data sesi awal berstatus template simulasi (*DEMO_SEED*).
              </p>
            </div>
          </div>

          {/* OVERVIEW STATS: 4 Honest Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1: Subjek Penelitian */}
            <div className="glass-card rounded-2xl p-5 border border-lavender/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-lavender">
                <span>Subjek Protokol Riset</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-plum/70 text-orchid border border-orchid/20">
                  2 TARGET
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-ivory font-mono">2</span>
                <span className="text-xs text-lavender">Siswa (S-001 & S-002)</span>
              </div>
              <div className="text-[11px] text-orchid flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>1 Kontrol · 1 Eksperimen</span>
              </div>
            </div>

            {/* Stat 2: Sesi Selesai */}
            <div className="glass-card rounded-2xl p-5 border border-lavender/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-lavender">
                <span>Sesi Observasi Riil</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-plum/70 text-apricot border border-apricot/20">
                  BELUM ADA
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-ivory font-mono">0</span>
                <span className="text-xs text-lavender">Sesi Lapangan</span>
              </div>
              <div className="text-[11px] text-apricot flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Menunggu Pelaksanaan Sesi</span>
              </div>
            </div>

            {/* Stat 3: Status Pre / Post Test */}
            <div className="glass-card rounded-2xl p-5 border border-lavender/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-lavender">
                <span>Status Pre & Post-Test</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-apricot/20 text-apricot border border-apricot/30">
                  SCHEDULED
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-ivory font-mono">Menunggu</span>
                <span className="text-xs text-lavender">Sesi Pengujian</span>
              </div>
              <div className="text-[11px] text-lavender flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5 text-orchid" />
                <span>Instrumen Siap Diterapkan</span>
              </div>
            </div>

            {/* Stat 4: Cognitive Load Status */}
            <div className="glass-card rounded-2xl p-5 border border-lavender/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-lavender">
                <span>Beban Kognitif (Leppink)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-plum/70 text-lavender">
                  PROTOCOL
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-lavender font-mono">Belum Diukur</span>
              </div>
              <div className="text-[11px] text-lavender flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-sage" />
                <span>Menunggu Pasca Pembelajaran</span>
              </div>
            </div>
          </div>

          {/* TWO SUBJECT DETAILS (S-001 & S-002) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-ivory flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-orchid" />
              <span>Daftar Subjek Protokol Penelitian (Anonim)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((sub) => (
                <div key={sub.subject_id} className="glass-card rounded-2xl p-5 border border-lavender/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-ivory bg-plum/80 px-2.5 py-1 rounded-lg border border-lavender/15">
                      ID: {sub.subject_id}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      sub.subject_id === 'S-001'
                        ? 'bg-orchid/20 text-orchid border border-orchid/30'
                        : 'bg-apricot/20 text-apricot border border-apricot/30'
                    }`}>
                      {sub.group}
                    </span>
                  </div>

                  <p className="text-xs text-lavender leading-relaxed">
                    {sub.role_description}
                  </p>

                  <div className="pt-2 border-t border-lavender/10 grid grid-cols-2 gap-2 text-[11px] text-lavender">
                    <div>
                      <span>Modul Aktif:</span>
                      <div className="text-ivory font-medium truncate">{sub.active_module}</div>
                    </div>
                    <div>
                      <span>Pre-Test / Post-Test:</span>
                      <div className="text-apricot font-medium">Terjadwal</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEPPINK COGNITIVE LOAD FRAMEWORK STATUS */}
          <div className="glass-card rounded-2xl p-6 border border-lavender/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-lavender/10 pb-3">
              <div>
                <h4 className="text-sm font-bold text-ivory flex items-center gap-2">
                  <Brain className="w-4 h-4 text-orchid" />
                  <span>Struktur Pengukuran Beban Kognitif (Leppink Multidimensional Scale)</span>
                </h4>
                <p className="text-xs text-lavender">
                  Berdasarkan instrumen baku Leppink et al. (2013) untuk mengukur 3 jenis beban pemrosesan informasi.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-apricot/15 text-apricot border border-apricot/25">
                STATUS: NOT CONFIGURED (Belum Diukur)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-plum/70 border border-lavender/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orchid block">
                  1. Intrinsic Cognitive Load (ICL)
                </span>
                <p className="text-lavender text-[11px] leading-relaxed">
                  Beban yang melekat pada kerumitan alami konsep matematika aljabar (variabel, koefisien negatif).
                </p>
                <div className="text-[10px] font-mono text-ivory/80 bg-aubergine p-2 rounded border border-lavender/10">
                  Status: Menunggu respons siswa pasca sesi.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-plum/70 border border-lavender/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                  2. Extraneous Cognitive Load (ECL)
                </span>
                <p className="text-lavender text-[11px] leading-relaxed">
                  Beban akibat distraksi atau kesulitan antarmuka. NUMORA meminimalkan ECL melalui tata letak Midnight Orchid yang ergonomis.
                </p>
                <div className="text-[10px] font-mono text-ivory/80 bg-aubergine p-2 rounded border border-lavender/10">
                  Status: Menunggu respons siswa pasca sesi.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-plum/70 border border-lavender/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-apricot block">
                  3. Germane Cognitive Load (GCL)
                </span>
                <p className="text-lavender text-[11px] leading-relaxed">
                  Beban kognitif produktif yang digunakan siswa untuk membangun skema pemahaman aljabar jangka panjang.
                </p>
                <div className="text-[10px] font-mono text-ivory/80 bg-aubergine p-2 rounded border border-lavender/10">
                  Status: Menunggu respons siswa pasca sesi.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-plum/50 border border-lavender/10 text-[11px] text-lavender leading-relaxed">
              ℹ️ Sesuai standar etika penelitian, skor angka dan grafik beban kognitif tidak akan ditampilkan sebelum lembar skala 0-10 Likert diisi secara sah oleh subjek penelitian pada akhir protokol.
            </div>
          </div>

          {/* ASSESSMENT CENTER (PRE-TEST & POST-TEST BLUEPRINT) */}
          <div className="glass-card rounded-2xl p-6 border border-lavender/15 space-y-4">
            <h4 className="text-sm font-bold text-ivory flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-sage" />
              <span>Pusat Asesmen & Protokol Pengujian</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-plum/70 border border-lavender/10 space-y-2">
                <span className="font-bold text-ivory block">A. Pre-Test Mandiri</span>
                <p className="text-[11px] text-lavender">
                  Mengukur pemahaman awal sebelum intervensi pembelajaran. Bebas dari bantuan NORA.
                </p>
                <span className="text-[10px] font-mono text-apricot block">Status: Terjadwal</span>
              </div>

              <div className="p-4 rounded-xl bg-plum/70 border border-lavender/10 space-y-2">
                <span className="font-bold text-ivory block">B. Evaluasi Per Modul</span>
                <p className="text-[11px] text-lavender">
                  Uji formatif di akhir setiap modul aljabar untuk mendiagnosis miskonsepsi secara adaptif.
                </p>
                <span className="text-[10px] font-mono text-orchid block">Status: Terintegrasi di Laboratorium</span>
              </div>

              <div className="p-4 rounded-xl bg-plum/70 border border-lavender/10 space-y-2">
                <span className="font-bold text-ivory block">C. Post-Test Komparasi</span>
                <p className="text-[11px] text-lavender">
                  Mengukur capaian akhir untuk membandingkan peningkatan individual S-001 dan S-002.
                </p>
                <span className="text-[10px] font-mono text-apricot block">Status: Terjadwal</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
