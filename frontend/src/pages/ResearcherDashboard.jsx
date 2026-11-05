import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Users,
  Activity,
  FileCheck2,
  Brain,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  ChevronDown,
  LogOut
} from 'lucide-react';

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, subjects (Partisipan), monitoring, instruments, analytics (Analisis & Ekspor)
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [cogStatus, setCogStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
              group: 'Kelompok Kontrol',
              method: 'Tatap muka konvensional terarah bersama peneliti',
              grade: 'SMP Kelas VII',
              active_module: 'Modul 02: Memahami Koefisien',
              pretest_status: 'Terjadwal',
              posttest_status: 'Terjadwal',
              cognitive_load_status: 'Belum Diukur',
              total_sessions_logged: 0,
              data_source: 'PROTOCOL_TEMPLATE'
            },
            {
              subject_id: 'S-002',
              group: 'Kelompok Eksperimen',
              method: 'Mandiri terpandu melalui platform NUMORA Space & NORA',
              grade: 'SMP Kelas VII',
              active_module: 'Modul 02: Memahami Koefisien',
              pretest_status: 'Terjadwal',
              posttest_status: 'Terjadwal',
              cognitive_load_status: 'Belum Diukur',
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

  // Export handlers
  const handleExportCSV = () => {
    const headers = ['Subject_ID', 'Group', 'Grade', 'Active_Module', 'PreTest_Status', 'PostTest_Status', 'Data_Source'];
    const rows = subjects.map(s => [
      s.subject_id,
      `"${s.group}"`,
      `"${s.grade}"`,
      `"${s.active_module}"`,
      `"${s.pretest_status}"`,
      `"${s.posttest_status}"`,
      `"${s.data_source || 'PROTOCOL_TEMPLATE'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `numora_research_protocol_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage('Berkas CSV berhasil diekspor.');
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleExportJSON = () => {
    const dataToExport = {
      research_title: 'Studi Evaluasi Desain Pembelajaran Matematika Aljabar SMP Kelas VII',
      protocol_version: 'v1.6-SageIvory',
      export_timestamp: new Date().toISOString(),
      subjects: subjects,
      cognitive_load_framework: cogStatus || { status: 'NOT CONFIGURED' },
      sessions_logged: sessions
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `numora_research_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage('Berkas JSON berhasil diekspor.');
    setTimeout(() => setExportMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex">
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
        <header className="sticky top-0 z-30 h-16 sm:h-18 bg-pure-white/95 backdrop-blur-sm border-b border-[#28332C]/14 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-interactive lg:hidden p-2 rounded-xl bg-ivory text-charcoal hover:bg-sage/20 border border-[#28332C]/14"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-charcoal">
                  Ruang Peneliti
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage/20 text-forest border border-sage/30">
                  Protokol 2 Siswa (S-001 & S-002)
                </span>
              </div>
              <p className="text-xs text-secondary-text hidden sm:block">
                Evaluasi Desain Pembelajaran Matematika Aljabar SMP Kelas VII
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-ivory border border-[#28332C]/14">
              <div className="w-7 h-7 rounded-full bg-forest text-pure-white flex items-center justify-center font-bold text-xs">
                P
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-charcoal leading-tight">
                  {user?.name || 'Tim Peneliti'}
                </div>
                <div className="text-[10px] text-secondary-text">
                  {user?.grade || 'Pendidikan Matematika'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-interactive p-2 rounded-xl text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-[#28332C]/14 transition-colors"
              title="Sign Out / Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-7 space-y-6 max-w-6xl mx-auto w-full">
          {/* Collapsible Protocol Transparency Section */}
          <details className="group p-4 rounded-xl bg-pure-white border border-[#28332C]/14 shadow-subtle text-xs">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-charcoal">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span>Rancangan Penelitian: Protokol 2 Siswa (S-001 & S-002)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sage/20 text-forest font-semibold ml-1">
                  Transparan
                </span>
              </div>
              <span className="text-secondary-text text-[11px] group-open:hidden">Buka Detail ▾</span>
              <span className="text-secondary-text text-[11px] hidden group-open:inline">Tutup ▴</span>
            </summary>
            <div className="mt-3 pt-3 border-t border-[#28332C]/14 text-secondary-text leading-relaxed space-y-2">
              <p>
                Penelitian ini menerapkan studi komparatif berskala kecil dengan <strong>dua subjek anonim</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>S-001</strong>: Kelompok Kontrol yang belajar konsep aljabar secara langsung melalui sesi tatap muka bersama peneliti.</li>
                <li><strong>S-002</strong>: Kelompok Eksperimen yang belajar secara mandiri terpandu melalui platform NUMORA Space dan bimbingan NORA AI.</li>
              </ul>
              <p className="text-[11px]">
                Sesuai prinsip integritas ilmiah, tidak ada nilai atau data aktivitas fiktif yang ditampilkan. Data sesi berlabel <em>PROTOCOL_TEMPLATE</em>.
              </p>
            </div>
          </details>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-page">
              {/* 4 Clean Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Subjek Riset</span>
                  <div className="text-2xl font-bold font-mono text-charcoal">2 Siswa</div>
                  <span className="text-[11px] text-forest font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>S-001 & S-002</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Sesi Observasi</span>
                  <div className="text-2xl font-bold font-mono text-charcoal">0 Sesi</div>
                  <span className="text-[11px] text-secondary-text flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Belum Dimulai</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Pre/Post-Test</span>
                  <div className="text-lg font-bold text-charcoal">Terjadwal</div>
                  <span className="text-[11px] text-secondary-text flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Instrumen Siap</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Beban Kognitif</span>
                  <div className="text-lg font-bold text-secondary-text">Belum Diukur</div>
                  <span className="text-[11px] text-secondary-text flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Pasca Sesi</span>
                  </span>
                </div>
              </div>

              {/* S-001 & S-002 Clean Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-charcoal">
                    Subjek Penelitian Terdaftar
                  </h3>
                  <button
                    onClick={() => setActiveTab('subjects')}
                    className="btn-interactive text-xs font-semibold text-forest hover:underline"
                  >
                    Lihat Rincian Lengkap →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((sub) => (
                    <div key={sub.subject_id} className="btn-interactive bg-pure-white rounded-2xl p-5 border border-[#28332C]/14 space-y-3 shadow-subtle">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-forest/10 text-forest font-bold font-mono text-xs flex items-center justify-center">
                            {sub.subject_id}
                          </span>
                          <div>
                            <h4 className="font-bold text-charcoal text-sm">{sub.subject_id}</h4>
                            <span className="text-[11px] text-secondary-text">{sub.grade}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage/20 text-forest">
                          {sub.group}
                        </span>
                      </div>

                      <p className="text-xs text-secondary-text leading-relaxed">
                        {sub.method || sub.role_description}
                      </p>

                      <div className="pt-2 border-t border-[#28332C]/14 flex items-center justify-between text-xs text-secondary-text">
                        <span>Modul: <strong className="text-charcoal">{sub.active_module}</strong></span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ivory text-secondary-text">
                          {sub.data_source || 'PROTOCOL_TEMPLATE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTISIPAN */}
          {activeTab === 'subjects' && (
            <div className="space-y-4 animate-fade-page">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Partisipan Penelitian
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Perbandingan protokol intervensi antara kelompok kontrol dan eksperimen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {subjects.map((sub) => (
                  <div key={sub.subject_id} className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                    <div className="flex items-center justify-between border-b border-[#28332C]/14 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-forest text-pure-white font-bold font-mono text-sm flex items-center justify-center">
                          {sub.subject_id}
                        </span>
                        <div>
                          <h3 className="font-bold text-charcoal text-base">{sub.subject_id}</h3>
                          <span className="text-xs text-secondary-text">{sub.grade}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sage/20 text-forest">
                        {sub.group}
                      </span>
                    </div>

                    <p className="text-xs text-secondary-text leading-relaxed">
                      {sub.method || sub.role_description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#28332C]/14 text-xs">
                      <div className="flex justify-between">
                        <span className="text-secondary-text">Modul Target:</span>
                        <span className="font-semibold text-charcoal">{sub.active_module}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-text">Pre-Test:</span>
                        <span className="text-charcoal font-medium">{sub.pretest_status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-text">Post-Test:</span>
                        <span className="text-charcoal font-medium">{sub.posttest_status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-text">Status Data:</span>
                        <span className="font-mono text-forest font-semibold">{sub.data_source || 'PROTOCOL_TEMPLATE'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MONITORING */}
          {activeTab === 'monitoring' && (
            <div className="space-y-4 animate-fade-page">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Monitoring Sesi Pembelajaran
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Catatan aktivitas dan log interaksi siswa selama sesi pembelajaran berlangsung.
                </p>
              </div>

              <div className="bg-pure-white rounded-2xl p-8 border border-[#28332C]/14 shadow-subtle text-center space-y-3">
                <Activity className="w-8 h-8 text-forest mx-auto" />
                <h3 className="text-sm font-bold text-charcoal">Belum Ada Sesi Lapangan</h3>
                <p className="text-xs text-secondary-text max-w-md mx-auto leading-relaxed">
                  Log aktivitas dan durasi belajar siswa akan dicatat secara otomatis ketika sesi pengujian mandiri dimulai di Ruang Siswa.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: INSTRUMEN */}
          {activeTab === 'instruments' && (
            <div className="space-y-5 animate-fade-page">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Instrumen Pengukuran
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Skala baku pengukuran beban kognitif dan evaluasi pemahaman matematis.
                </p>
              </div>

              {/* Leppink Multidimensional Scale */}
              <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                      <Brain className="w-4 h-4 text-forest" />
                      <span>Skala Beban Kognitif (Leppink et al., 2013)</span>
                    </h3>
                    <p className="text-xs text-secondary-text">
                      Mengukur 3 dimensi beban pemrosesan kognitif siswa dalam pembelajaran aljabar.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ivory text-secondary-text border border-[#28332C]/14">
                    STATUS: BELUM DIUKUR
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/14 space-y-1">
                    <span className="font-bold text-forest block">1. Intrinsic Load (ICL)</span>
                    <p className="text-[11px] text-secondary-text leading-relaxed">
                      Beban dari kesulitan alami materi aljabar (variabel, notasi negatif).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/14 space-y-1">
                    <span className="font-bold text-forest block">2. Extraneous Load (ECL)</span>
                    <p className="text-[11px] text-secondary-text leading-relaxed">
                      Beban dari antarmuka. Diminimalkan melalui desain Sage & Ivory yang bersih.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/14 space-y-1">
                    <span className="font-bold text-forest block">3. Germane Load (GCL)</span>
                    <p className="text-[11px] text-secondary-text leading-relaxed">
                      Beban produktif yang digunakan siswa untuk membangun pemahaman konsep.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pre/Post-Test Blueprint */}
              <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-3">
                <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-forest" />
                  <span>Cetak Biru Pengujian</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-ivory border border-[#28332C]/14 space-y-1">
                    <span className="font-semibold text-charcoal block">Pre-Test Diagnostik</span>
                    <p className="text-[11px] text-secondary-text">Pemahaman awal sebelum sesi aljabar.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-ivory border border-[#28332C]/14 space-y-1">
                    <span className="font-semibold text-charcoal block">Formatif Lab</span>
                    <p className="text-[11px] text-secondary-text">Evaluasi adaptif di setiap akhir modul.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-ivory border border-[#28332C]/14 space-y-1">
                    <span className="font-semibold text-charcoal block">Post-Test Komparasi</span>
                    <p className="text-[11px] text-secondary-text">Pengukuran hasil belajar S-001 vs S-002.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANALISIS & EKSPOR */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 animate-fade-page">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Ekspor Data Penelitian
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Unduh data protokol riset dan instrumen dalam format tabel CSV atau format objek JSON.
                </p>
              </div>

              {exportMessage && (
                <div className="p-3 rounded-xl bg-sage/20 border border-sage/40 text-forest text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{exportMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-charcoal text-base">Ekspor Format CSV</h3>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      Format tabel kompatibel dengan Microsoft Excel, Google Sheets, dan SPSS.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="btn-interactive w-full py-2.5 rounded-xl font-semibold text-xs bg-forest text-pure-white hover:bg-forest-600 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh CSV Protokol (.csv)</span>
                  </button>
                </div>

                <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-charcoal text-base">Ekspor Format JSON</h3>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      Format objek terstruktur lengkap mencakup skema subjek dan instrumen Leppink.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="btn-interactive w-full py-2.5 rounded-xl font-semibold text-xs bg-pure-white hover:bg-ivory text-charcoal border border-[#28332C]/14 hover:border-forest/40 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                  >
                    <Download className="w-4 h-4 text-forest" />
                    <span>Unduh JSON Lengkap (.json)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Global Consistent Footer */}
        <Footer />
      </div>
    </div>
  );
}
