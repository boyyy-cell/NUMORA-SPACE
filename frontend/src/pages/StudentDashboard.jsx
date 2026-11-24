import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import NoraChatPreview from '../features/nora/NoraChatPreview';
import AlgebraLab from '../features/learning/AlgebraLab';
import MathematicalChallenge from '../features/learning/MathematicalChallenge';
import NumoraRunner3D from '../features/runner/NumoraRunner3D';
import { MODULES_DATA } from '../features/learning/AlgebraModulePreview';
import ModuleLearningModal from '../features/learning/ModuleLearningModal';
import MathView, { MathText } from '../components/common/MathView';
import { useAuth } from '../context/AuthContext';
import { studentSyncService } from '../services/studentSyncService';
import { apiService } from '../services/api';
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
  Gamepad2,
  Maximize2,
  X,
  LogOut,
  AlertCircle,
  ShieldCheck,
  Trash2
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview (Beranda), modules (Materi), lab (Algebra Lab), nora (NORA), challenge (Evaluasi)
  const [selectedModuleModal, setSelectedModuleModal] = useState(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState('idle'); // idle | loading | success | error

  const handleLogout = async () => {
    if (user && user.subjectId !== 'S-001') {
      try {
        await apiService.logLearningActivity({
          activity_type: 'SESSION_END',
          module_or_feature_id: 'auth',
          metadata: { email: user.email, time: new Date().toISOString() }
        });
      } catch (_) {}
    }
    logout();
    navigate('/login', { replace: true });
  };

  const isControlGroup = user?.subjectId === 'S-001';

  // Progres belajar dinamis yang terisolasi per identitas akun siswa dan tersinkronisasi ke server.
  const [completedModules, setCompletedModules] = useState(() => {
    return studentSyncService.getLocalProgress(user);
  });

  // Sinkronisasi data progres saat akun siswa aktif berganti
  useEffect(() => {
    if (!user) return;
    setCompletedModules(studentSyncService.getLocalProgress(user));

    if (!isControlGroup) {
      studentSyncService.initializeSync(user).then((res) => {
        if (res?.state?.progress) {
          const completed = res.state.progress
            .filter((p) => p.status === 'COMPLETED')
            .map((p) => p.module_id);
          setCompletedModules(completed);
        }
      });
    }

    const handleSyncApplied = (e) => {
      if (e?.detail?.progress) {
        const completed = e.detail.progress
          .filter((p) => p.status === 'COMPLETED')
          .map((p) => p.module_id);
        setCompletedModules(completed);
      }
    };

    window.addEventListener('numora_sync_applied', handleSyncApplied);
    return () => window.removeEventListener('numora_sync_applied', handleSyncApplied);
  }, [user, isControlGroup]);

  // Catat sesi login/mulai pembelajaran persisten
  useEffect(() => {
    if (user && !isControlGroup) {
      const sessionKey = `numora_session_start_${user.email}`;
      if (!sessionStorage.getItem(sessionKey)) {
        apiService.logLearningActivity({
          activity_type: 'SESSION_START',
          module_or_feature_id: 'dashboard',
          metadata: { email: user.email, name: user.name, role: user.role, time: new Date().toISOString() }
        }).catch(() => {});
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [user, isControlGroup]);

  // Handler membuka modul pembelajaran
  const handleOpenModule = (moduleItem) => {
    setSelectedModuleModal(moduleItem);
    if (user && !isControlGroup && moduleItem) {
      apiService.logLearningActivity({
        activity_type: 'MODULE_VIEW',
        module_or_feature_id: moduleItem.id,
        metadata: { title: moduleItem.title, time: new Date().toISOString() }
      }).catch(() => {});
    }
  };

  // Handler penghapusan data mandiri (Hak Privasi Pengguna)
  const handleDeleteMyData = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat progres belajar, evaluasi, dan aktivitas pembelajaran Anda secara permanen? Data yang dihapus tidak dapat dipulihkan.')) {
      return;
    }
    setDeletionStatus('loading');
    try {
      await apiService.deleteMyData();
      setCompletedModules([]);
      studentSyncService.setLocalProgress(user, []);
      studentSyncService.setLocalEvaluations(user, []);
      setDeletionStatus('success');
    } catch (err) {
      setDeletionStatus('error');
    }
  };

  // Handler penyelesaian modul belajar (disimpan persisten ke server & local cache)
  const handleCompleteModule = (moduleId) => {
    if (isControlGroup) return;
    setCompletedModules((prev) => {
      if (prev.includes(moduleId)) return prev;
      return [...prev, moduleId];
    });
    studentSyncService.recordModuleProgress(user, moduleId, 'COMPLETED', 100, 300);
  };

  const totalModules = MODULES_DATA.length;
  const completedCount = completedModules.length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  // Modul aktif dinamis: modul pertama yang belum diselesaikan
  const currentModule = MODULES_DATA.find((m) => !completedModules.includes(m.id)) || null;

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
        <header className="sticky top-0 z-30 h-16 sm:h-18 bg-pure-white/95 backdrop-blur-sm border-b border-[#28332C]/20 px-4 sm:px-8 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-interactive lg:hidden p-2 rounded-xl bg-ivory text-charcoal hover:bg-sage/20 border border-[#28332C]/20"
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
                  {user?.grade || 'SMP Kelas VII'}
                </span>
              </div>
              <p className="text-xs text-secondary-text hidden sm:block">
                Eksplorasi Konsep Aljabar Interaktif
              </p>
            </div>
          </div>

          {/* Student Profile Pill & Logout */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-ivory border border-[#28332C]/20">
              <div className="w-7 h-7 rounded-full bg-forest text-pure-white flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-charcoal leading-tight">
                  {user?.name || 'Siswa Kelas VII'}
                </div>
                <div className="text-[10px] text-secondary-text">
                  {user?.subjectId || 'S-002'} • Eksperimen
                </div>
              </div>
            </div>

            <button
              onClick={() => { setPrivacyModalOpen(true); setDeletionStatus('idle'); }}
              className="btn-interactive p-2 rounded-xl text-forest hover:bg-forest/10 border border-[#28332C]/20 transition-colors"
              title="Informasi Privasi & Kelola Data"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="btn-interactive p-2 rounded-xl text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-[#28332C]/20 transition-colors"
              title="Sign Out / Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-7 space-y-6 max-w-6xl mx-auto w-full">
          {isControlGroup && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm">Peserta Kelompok Kontrol (Tatap Muka Langsung)</div>
                <p className="leading-relaxed text-amber-800">
                  Akun ini dialokasikan untuk protokol kelompok kontrol tatap muka langsung bersama peneliti. Sesuai desain riset komparatif, intervensi pembelajaran digital dinonaktifkan untuk menjaga validitas data penelitian.
                </p>
              </div>
            </div>
          )}
          {/* TAB 1: BERANDA (OVERVIEW) — SIMPLIFIED UX */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-page">
              {/* Single Hero Card: Sapaan Singkat, Materi Terakhir, Satu Tombol Utama */}
              <div className="rounded-2xl p-6 sm:p-8 bg-pure-white border border-[#28332C]/20 shadow-card-clean space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage/20 text-xs font-semibold text-forest">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Halo, Siswa SMP! Siap Belajar Hari Ini?</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
                    {currentModule
                      ? `Materi Aktif: ${currentModule.subtitle}`
                      : 'Selamat! Seluruh Modul Aljabar Telah Selesai'}
                  </h2>
                  <p className="text-xs sm:text-sm text-secondary-text leading-relaxed max-w-2xl">
                    <MathText
                      text={
                        currentModule
                          ? currentModule.description
                          : 'Kamu telah berhasil menyelesaikan pemahaman 4 pilar konsep aljabar dasar SMP kelas VII.'
                      }
                    />
                  </p>
                </div>

                {/* Tombol Utama */}
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      if (currentModule) {
                        handleOpenModule(currentModule);
                      } else {
                        setActiveTab('modules');
                      }
                    }}
                    className="btn-interactive px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-forest text-pure-white hover:bg-forest-600 transition-colors flex items-center gap-2 shadow-subtle"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{currentModule ? 'Lanjutkan Belajar' : 'Tinjau Materi'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('run')}
                    className="btn-interactive px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-[#D58B68] text-pure-white hover:bg-[#D58B68]/90 transition-colors flex items-center gap-2 shadow-subtle"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Main NUMORA RUN</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('nora')}
                    className="btn-interactive px-4 py-3 rounded-xl text-xs sm:text-sm font-medium bg-pure-white hover:bg-ivory text-charcoal border border-[#28332C]/20 hover:border-forest/40 flex items-center gap-2 transition-colors"
                  >
                    <Bot className="w-4 h-4 text-forest" />
                    <span>Tanya NORA</span>
                  </button>
                </div>

                {/* Progress Bar Bersih (Hanya Data Nyata) */}
                <div className="pt-4 border-t border-[#28332C]/20 space-y-2 max-w-md">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-secondary-text">Progres Modul Aljabar:</span>
                    <span className="font-semibold text-forest">
                      {completedCount} dari {totalModules} Selesai ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ivory overflow-hidden border border-[#28332C]/20">
                    <div
                      className="h-full bg-forest rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-secondary-text">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                      Penyimpanan sesi peramban aktif (localStorage)
                    </span>
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
                    className="btn-interactive text-xs font-semibold text-forest hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MODULES_DATA.map((mod, idx) => {
                    const isDone = completedModules.includes(mod.id);
                    const isCurrent = currentModule?.id === mod.id;

                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleOpenModule(mod)}
                        className="btn-interactive bg-pure-white rounded-xl p-4 border border-[#28332C]/20 hover:border-forest transition-colors cursor-pointer space-y-3 shadow-subtle"
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
                              Belum Dimulai
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
            <div className="space-y-5 animate-fade-page">
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
                  const isCurrent = currentModule?.id === mod.id;

                  return (
                    <div
                      key={mod.id}
                      className="bg-pure-white rounded-2xl p-5 border border-[#28332C]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle hover:border-forest transition-colors"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ivory text-secondary-text border border-[#28332C]/20">
                            Modul 0{index + 1}
                          </span>
                          {isDone ? (
                            <span className="text-xs text-forest font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Selesai
                            </span>
                          ) : isCurrent ? (
                            <span className="text-xs text-terracotta font-semibold">
                              Sedang Dipelajari
                            </span>
                          ) : (
                            <span className="text-xs text-secondary-text">
                              Belum Dimulai
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
                            handleOpenModule(mod);
                          }}
                          className="btn-interactive px-4 py-2 rounded-xl text-xs font-semibold bg-forest text-pure-white hover:bg-forest-600 transition-colors shadow-subtle"
                        >
                          Pelajari Materi
                        </button>
                        <button
                          onClick={() => setActiveTab('lab')}
                          className="btn-interactive px-3.5 py-2 rounded-xl text-xs font-medium bg-ivory text-charcoal hover:bg-sage/20 border border-[#28332C]/20 transition-colors"
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
            <div className="space-y-4 animate-fade-page">
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

          {/* TAB 3.5: NUMORA RUN — ENDLESS RUNNER GAME */}
          {activeTab === 'run' && (
            isControlGroup ? (
              <div className="bg-pure-white rounded-2xl p-6 sm:p-8 border border-[#28332C]/20 text-center space-y-3 animate-fade-page">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-charcoal">Akses Dinonaktifkan untuk Kelompok Kontrol</h3>
                <p className="text-xs sm:text-sm text-secondary-text max-w-lg mx-auto leading-relaxed">
                  Subjek S-001 dialokasikan untuk protokol pembelajaran tatap muka langsung bersama peneliti. Sesuai desain riset komparatif, aktivitas permainan NUMORA RUN dan modul digital dinonaktifkan agar validitas data penelitian tetap terjaga.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-page">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-charcoal">
                        NUMORA RUN
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D58B68]/15 text-[#D58B68] uppercase">
                        Game Aljabar
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-secondary-text">
                      Kendalikan pelari 3D di 3 jalur, kumpulkan koin, hindari rintangan, dan tembus gerbang aljabar!
                    </p>
                  </div>

                  <Link
                    to="/numora-run"
                    className="btn-interactive inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-ivory text-charcoal hover:bg-sage/20 border border-[#28332C]/20 self-start sm:self-auto transition"
                    title="Buka Halaman Penuh"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-forest" />
                    <span>Mode Layar Penuh</span>
                  </Link>
                </div>

                {/* 3D Runner Component */}
                <div className="bg-pure-white rounded-2xl p-2 sm:p-4 border border-[#28332C]/20 shadow-card-clean">
                  <NumoraRunner3D />
                </div>
              </div>
            )
          )}

          {/* TAB 4: NORA SOCRATIC TUTOR */}
          {activeTab === 'nora' && (
            <div className="space-y-4 animate-fade-page">
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
            <div className="space-y-4 animate-fade-page">
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

        {/* Global Consistent Footer */}
        <Footer />
      </div>

      {/* DETAIL MODAL MATERI — DEDICATED LEARNING VIEW */}
      {selectedModuleModal && (
        <ModuleLearningModal
          currentModuleId={selectedModuleModal.id}
          completedModules={completedModules}
          onCompleteModule={handleCompleteModule}
          onClose={() => setSelectedModuleModal(null)}
          onOpenLab={() => {
            setSelectedModuleModal(null);
            setActiveTab('lab');
          }}
        />
      )}

      {/* MODAL PRIVASI & PENGELOLAAN DATA */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-pure-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-[#28332C]/14 shadow-modal space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#28332C]/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sage/20 text-forest">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal">Privasi & Transparansi Data</h3>
                  <p className="text-[11px] text-secondary-text">Pencatatan persisten aktivitas pembelajaran NUMORA Space</p>
                </div>
              </div>
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="p-1.5 rounded-lg text-secondary-text hover:text-charcoal hover:bg-ivory transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-secondary-text max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-2xl bg-ivory border border-[#28332C]/10 space-y-1.5">
                <p className="font-semibold text-charcoal">Data Pembelajaran yang Dicatat:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li><strong>Sesi Masuk & Keluar:</strong> Waktu autentikasi dan durasi aktif belajar.</li>
                  <li><strong>Materi & Modul:</strong> Modul yang dibuka dan diselesaikan (status COMPLETED).</li>
                  <li><strong>Evaluasi 10 Soal:</strong> Skor, akurasi, waktu pengerjaan, dan pilihan jawaban.</li>
                  <li><strong>NORA AI:</strong> Topik pertanyaan, mode interaksi, dan jawaban bimbingan.</li>
                  <li><strong>NUMORA RUN:</strong> Sesi permainan, koin, jarak, dan akurasi matematika.</li>
                </ul>
              </div>

              <p className="text-[11px]">
                Data ini disimpan secara aman dan persisten di server database SQLite backend NUMORA Space agar kemajuan belajar Anda tidak hilang saat berganti perangkat atau peramban. Peneliti terotorisasi dapat meninjau rekap agregat efektivitas pembelajaran aljabar.
              </p>

              {/* Zona Penghapusan Data */}
              <div className="pt-2 border-t border-[#28332C]/10 space-y-2">
                <p className="font-semibold text-charcoal text-xs">Hak Akses & Penghapusan Data:</p>
                {user?.subjectId === 'S-001' || user?.subjectId === 'S-002' ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    Akun ini ({user?.subjectId}) terdaftar sebagai subjek protokol penelitian resmi. Data pembelajaran dilindungi untuk menjamin validitas studi komparatif dan tidak dapat dihapus secara mandiri.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px]">
                      Sesuai prinsip etika perlindungan privasi data, Anda dapat menghapus seluruh riwayat progres modul, skor kuis, dan log aktivitas pembelajaran Anda kapan saja.
                    </p>
                    {deletionStatus === 'success' && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                        Seluruh data aktivitas pembelajaran Anda telah berhasil dihapus dari server persisten.
                      </div>
                    )}
                    {deletionStatus === 'error' && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                        Gagal menghapus data. Pastikan koneksi ke server aktif lalu coba lagi.
                      </div>
                    )}
                    <button
                      onClick={handleDeleteMyData}
                      disabled={deletionStatus === 'loading'}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletionStatus === 'loading' ? 'Menghapus Data...' : 'Hapus Seluruh Data Pembelajaran Saya'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#28332C]/10 flex justify-end">
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-forest text-pure-white text-xs font-semibold hover:bg-forest/90 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
