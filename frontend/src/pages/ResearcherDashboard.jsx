import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import MathView from '../components/common/MathView';
import InterviewResultsView from '../features/research/InterviewResultsView';
import { INTERVIEW_METADATA } from '../data/interviewDocumentationData';
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
  LogOut,
  Microscope,
  BookOpen,
  Award,
  Gamepad2,
  Bot,
  Eye,
  X,
  Search,
  Check,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Filter,
  Sliders,
  ListOrdered,
  AlertCircle,
  Scale,
  GitCompare,
  Layers,
  ArrowRight,
  MessageSquareQuote,
  Compass
} from 'lucide-react';

const DEFAULT_RESEARCH_SUBJECTS = [
  {
    id: 'S-001',
    subject_id: 'S-001',
    name: 'S-001 (Kontrol)',
    group: 'control',
    notes: 'Tatap Muka Konvensional'
  },
  {
    id: 'S-002',
    subject_id: 'S-002',
    name: 'S-002 (Eksperimen)',
    group: 'experimental',
    notes: 'Mandiri Terpandu Digital'
  }
];

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, subjects, public_users, monitoring, instruments, analytics
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [cogStatus, setCogStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [publicUsers, setPublicUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dataFetchErrors, setDataFetchErrors] = useState({});
  const [selectedUserDossier, setSelectedUserDossier] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('ALL'); // ALL, LOGIN, MODULE, EVALUATION, NORA_CHAT, LAB_EXPERIMENT, RUNNER_PLAY
  const [activeUserViewMode, setActiveUserViewMode] = useState('timeline'); // 'timeline' | 'summary'
  const [activeDossierSubTab, setActiveDossierSubTab] = useState('modules'); // modules | evaluations | nora | runner | activities
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const loadResearchData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    try {
      const [subsRes, sessRes, cogRes, anRes, pUsersRes, actRes] = await Promise.allSettled([
        apiService.getResearchSubjects(),
        apiService.getResearchSessions(),
        apiService.getCognitiveLoadStatus(),
        apiService.getResearchAnalytics(),
        apiService.getPublicUsersSummary(),
        apiService.getAllActivities({ limit: 200 }),
      ]);

      const errors = {};

      if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value)) {
        setSubjects(subsRes.value);
      } else {
        errors.subjects = true;
      }

      if (sessRes.status === 'fulfilled' && sessRes.value) {
        setSessions(sessRes.value);
      } else {
        errors.sessions = true;
      }

      if (cogRes.status === 'fulfilled' && cogRes.value) {
        setCogStatus(cogRes.value);
      } else {
        errors.cognitiveLoad = true;
      }

      if (anRes.status === 'fulfilled' && anRes.value) {
        setAnalytics(anRes.value);
      } else {
        errors.analytics = true;
      }

      if (pUsersRes.status === 'fulfilled' && Array.isArray(pUsersRes.value)) {
        setPublicUsers(pUsersRes.value);
      } else {
        errors.publicUsers = true;
      }

      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value)) {
        setActivities(actRes.value);
      } else {
        errors.activities = true;
      }

      setDataFetchErrors(errors);
    } catch (err) {
      console.warn('[Researcher Dashboard] error loading data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadResearchData();
  }, []);

  const handleViewDossier = async (userEmail) => {
    setLoadingDossier(true);
    try {
      const dossier = await apiService.getUserDossier(userEmail);
      setSelectedUserDossier(dossier);
      setActiveDossierSubTab('modules');
    } catch (err) {
      console.error('Gagal mengambil dossier pengguna', err);
    } finally {
      setLoadingDossier(false);
    }
  };

  // Export handlers dengan data riil database
  const handleExportCSV = async () => {
    try {
      const csvText = await apiService.exportResearchCsv();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'numora_research_and_learning_data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportMessage('File CSV data penelitian & aktivitas pengguna aktual berhasil diunduh.');
      setTimeout(() => setExportMessage(''), 4000);
    } catch (err) {
      console.error('Export CSV error', err);
    }
  };

  const handleExportJSON = async () => {
    try {
      const jsonData = await apiService.exportResearchJson();
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'numora_research_and_learning_data.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportMessage('File JSON data penelitian & aktivitas pengguna aktual berhasil diunduh.');
      setTimeout(() => setExportMessage(''), 4000);
    } catch (err) {
      console.error('Export JSON error', err);
    }
  };

  const formatTimestamp = (epochSeconds) => {
    if (!epochSeconds) return '-';
    const date = new Date(epochSeconds * 1000);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case 'LOGIN':
      case 'SESSION_START':
      case 'SESSION_END':
        return { label: 'Sesi / Akun', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'MODULE_VIEW':
        return { label: 'Buka Modul', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'MODULE_COMPLETE':
        return { label: 'Modul Selesai', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'EVALUATION_START':
        return { label: 'Mulai Evaluasi', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'EVALUATION_SUBMIT':
        return { label: 'Selesai Evaluasi', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'NORA_CHAT':
        return { label: 'Bimbingan NORA', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'LAB_EXPERIMENT':
        return { label: 'Algebra Lab', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'RUNNER_PLAY':
        return { label: 'NUMORA RUN', bg: 'bg-orange-50 text-orange-800 border-orange-200' };
      default:
        return { label: type, bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getUserInitial = (act) => {
    if (!act) return 'U';
    if (act.subject_id === 'S-001') return 'S1';
    if (act.subject_id === 'S-002') return 'S2';
    if (act.user_role === 'researcher') return 'P1';
    if (act.user_name && typeof act.user_name === 'string') {
      const parts = act.user_name.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return act.user_name.trim().substring(0, 2).toUpperCase();
    }
    if (act.user_email && typeof act.user_email === 'string') {
      return act.user_email.trim().substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const filteredActivities = activities.filter((act) => {
    if (activityFilter !== 'ALL') {
      if (activityFilter === 'LOGIN' && act.activity_type !== 'LOGIN' && act.activity_type !== 'SESSION_START' && act.activity_type !== 'SESSION_END') {
        return false;
      }
      if (activityFilter === 'MODULE' && !act.activity_type.startsWith('MODULE_')) {
        return false;
      }
      if (activityFilter === 'EVALUATION' && !act.activity_type.startsWith('EVALUATION_')) {
        return false;
      }
      if (activityFilter === 'NORA_CHAT' && act.activity_type !== 'NORA_CHAT') {
        return false;
      }
      if (activityFilter === 'LAB_EXPERIMENT' && act.activity_type !== 'LAB_EXPERIMENT') {
        return false;
      }
      if (activityFilter === 'RUNNER_PLAY' && act.activity_type !== 'RUNNER_PLAY') {
        return false;
      }
    }

    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (act.user_name || '').toLowerCase().includes(q) ||
      (act.user_email || '').toLowerCase().includes(q) ||
      (act.subject_id || '').toLowerCase().includes(q) ||
      (act.activity_type || '').toLowerCase().includes(q) ||
      (act.module_or_feature_id || '').toLowerCase().includes(q)
    );
  });

  const filteredPublicUsers = publicUsers.filter(u => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.subject_id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex">
      {/* Sidebar Khusus Peneliti */}
      <Sidebar
        role="researcher"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Header Peneliti */}
        <header className="h-16 px-4 sm:px-7 bg-pure-white border-b border-[#28332C]/14 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-ivory transition-colors"
              aria-label="Buka Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              <h1 className="text-sm font-bold text-charcoal">
                Dashboard Evaluator Riset (P-001)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 px-3 rounded-full bg-sage/20 border border-forest/20 text-forest text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span className="hidden sm:inline">Lead Researcher:</span>
              <span>{user?.name || 'Tim Peneliti'}</span>
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

        {/* Banner Sesi Tidak Valid atau Kedaluwarsa */}
        {(!user || user.role !== 'researcher') && (
          <div className="mx-4 sm:mx-7 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Sesi login peneliti tidak terdeteksi atau telah kedaluwarsa. Data yang ditampilkan menggunakan proteksi cache lokal.</span>
            </div>
            <button
              onClick={() => navigate('/research-login')}
              className="px-3.5 py-1.5 rounded-lg bg-forest text-pure-white font-semibold hover:bg-forest/90 shrink-0 text-center"
            >
              Masuk Kembali ke Portal Peneliti
            </button>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-7 space-y-6 max-w-6xl mx-auto w-full">
          {/* TAB 1: OVERVIEW — RINGKASAN HASIL WAWANCARA S-001 & S-002 */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-page">
              {/* Header Hero Banner: Ringkasan Hasil Wawancara Penelitian Aljabar */}
              <div className="rounded-2xl p-6 sm:p-8 bg-pure-white border border-[#28332C]/14 shadow-card-clean space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/14 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage/20 text-xs font-semibold text-forest">
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      <span>Fokus Utama Penelitian Kualitatif</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
                      Ringkasan Hasil Wawancara: S-001 (Kontrol) & S-002 (Eksperimen)
                    </h2>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto shrink-0">
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-ivory text-forest border border-[#28332C]/12 font-semibold">
                      Sumber: {INTERVIEW_METADATA.documentSource}
                    </span>
                    <span className="text-[10px] text-secondary-text flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                      <span>Evaluator Riset (P-001)</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-secondary-text leading-relaxed max-w-3xl">
                    Dokumentasi kualitatif komparatif pemahaman bentuk aljabar siswa SMP Kelas VII antara kelompok kontrol (pembelajaran langsung tatap muka) dan kelompok eksperimen (pembelajaran mandiri berbantuan platform NUMORA Space).
                  </p>

                  <button
                    onClick={() => setActiveTab('interviews')}
                    className="btn-interactive px-4 py-2.5 rounded-xl bg-forest text-pure-white text-xs font-semibold hover:bg-forest/90 flex items-center justify-center gap-2 shadow-subtle shrink-0 transition"
                  >
                    <span>Lihat Hasil Wawancara Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* A. RINGKASAN DOKUMENTASI (4 KARTU METRIK) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Subjek Dokumentasi</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-charcoal font-mono">
                    2 Subjek
                  </div>
                  <span className="text-[11px] text-forest font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>S-001 & S-002</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Pertanyaan Wawancara Utama</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-forest font-mono">
                    20 Pertanyaan
                  </div>
                  <span className="text-[11px] text-secondary-text flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                    <span>10 Kontrol + 10 Eksperimen</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Pertanyaan Pendalaman</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-terracotta font-mono">
                    5 Butir
                  </div>
                  <span className="text-[11px] text-secondary-text flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-terracotta" />
                    <span>Analisis Dua Perspektif</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Aspek Ringkasan Tematik</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-charcoal font-mono">
                    5 Aspek
                  </div>
                  <span className="text-[11px] text-forest font-medium flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Sintesis Hasil Wawancara</span>
                  </span>
                </div>
              </div>

              {/* B. TEMUAN UTAMA WAWANCARA (5 ASPEK KUNCI) */}
              <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-forest" />
                      <span>Temuan Utama Wawancara</span>
                    </h3>
                    <p className="text-xs text-secondary-text">
                      Intisari pemahaman konsep, tantangan belajar, dan rekomendasi perbaikan dari subjek penelitian.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-ivory text-forest border border-[#28332C]/10 self-start sm:self-auto font-semibold">
                    Sintesis Kualitatif Resmi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* 1. Pemahaman Konsep */}
                  <div className="p-4 rounded-xl border border-[#28332C]/10 bg-ivory/50 space-y-2">
                    <div className="flex items-center gap-2 border-b border-[#28332C]/8 pb-2">
                      <div className="w-7 h-7 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h4 className="font-bold text-charcoal text-xs sm:text-sm">Pemahaman Konsep</h4>
                    </div>
                    <ul className="text-xs text-secondary-text space-y-1.5 pl-1 list-disc list-inside">
                      <li>Kedua subjek menjelaskan variabel, koefisien, dan konstanta.</li>
                      <li>Keduanya masih membutuhkan latihan untuk menerapkan konsep pada soal yang berbeda.</li>
                    </ul>
                  </div>

                  {/* 2. Kesulitan Pembelajaran */}
                  <div className="p-4 rounded-xl border border-[#28332C]/10 bg-ivory/50 space-y-2">
                    <div className="flex items-center gap-2 border-b border-[#28332C]/8 pb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h4 className="font-bold text-charcoal text-xs sm:text-sm">Kesulitan Pembelajaran</h4>
                    </div>
                    <ul className="text-xs text-secondary-text space-y-1.5 pl-1 list-disc list-inside">
                      <li>Kesulitan mengubah soal cerita menjadi bentuk aljabar.</li>
                      <li>Kesulitan mengidentifikasi unsur-unsur bentuk aljabar.</li>
                    </ul>
                  </div>

                  {/* 3. Strategi Mengatasi Kesulitan */}
                  <div className="p-4 rounded-xl border border-[#28332C]/10 bg-ivory/50 space-y-2">
                    <div className="flex items-center gap-2 border-b border-[#28332C]/8 pb-2">
                      <div className="w-7 h-7 rounded-lg bg-forest/10 text-forest flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <h4 className="font-bold text-charcoal text-xs sm:text-sm">Strategi Mengatasi Kesulitan</h4>
                    </div>
                    <ul className="text-xs text-secondary-text space-y-1.5 pl-1 list-disc list-inside">
                      <li><strong>S-001:</strong> membaca ulang soal, mencoba kembali, dan bertanya langsung kepada peneliti.</li>
                      <li><strong>S-002:</strong> membaca ulang materi, mencoba kembali, dan memanfaatkan fitur Hint.</li>
                    </ul>
                  </div>

                  {/* 4. Pengalaman Pembelajaran */}
                  <div className="p-4 rounded-xl border border-[#28332C]/10 bg-ivory/50 space-y-2">
                    <div className="flex items-center gap-2 border-b border-[#28332C]/8 pb-2">
                      <div className="w-7 h-7 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <h4 className="font-bold text-charcoal text-xs sm:text-sm">Pengalaman Pembelajaran</h4>
                    </div>
                    <ul className="text-xs text-secondary-text space-y-1.5 pl-1 list-disc list-inside">
                      <li><strong>S-001:</strong> menekankan interaksi langsung dengan peneliti.</li>
                      <li><strong>S-002:</strong> menekankan pembelajaran mandiri, penjelasan NORA, dan fitur Hint.</li>
                    </ul>
                  </div>

                  {/* 5. Saran Perbaikan */}
                  <div className="p-4 rounded-xl border border-[#28332C]/10 bg-ivory/50 space-y-2 md:col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-2 border-b border-[#28332C]/8 pb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        5
                      </div>
                      <h4 className="font-bold text-charcoal text-xs sm:text-sm">Saran Perbaikan</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-secondary-text pl-1">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                        <span>Menambah contoh soal kontekstual.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                        <span>Menambah latihan bertahap.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                        <span>Membuat penjelasan lebih ringkas.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                        <span>Memudahkan navigasi aplikasi.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* C. PERBANDINGAN S-001 DAN S-002 (TABEL KOMPARASI) */}
              <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-forest" />
                      <span>Perbandingan S-001 dan S-002</span>
                    </h3>
                    <p className="text-xs text-secondary-text">
                      Pemetaan komparatif respons kualitatif antara subjek kontrol dan subjek eksperimen.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-ivory text-forest border border-[#28332C]/10 self-start sm:self-auto font-semibold">
                    N = 2 Subjek
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#28332C]/12">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-ivory/80 text-charcoal font-bold border-b border-[#28332C]/12">
                      <tr>
                        <th className="py-3 px-4 w-1/4">Aspek</th>
                        <th className="py-3 px-4 w-3/8 text-forest font-semibold">S-001</th>
                        <th className="py-3 px-4 w-3/8 text-terracotta font-semibold">S-002</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#28332C]/10">
                      <tr className="hover:bg-ivory/40 transition">
                        <td className="py-3 px-4 font-bold text-charcoal bg-ivory/30">Pemahaman materi</td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Berdasarkan jawaban wawancara
                        </td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Berdasarkan jawaban wawancara
                        </td>
                      </tr>
                      <tr className="hover:bg-ivory/40 transition">
                        <td className="py-3 px-4 font-bold text-charcoal bg-ivory/30">Kesulitan</td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Soal cerita dan identifikasi konsep
                        </td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Soal cerita dan pemilihan variabel
                        </td>
                      </tr>
                      <tr className="hover:bg-ivory/40 transition">
                        <td className="py-3 px-4 font-bold text-charcoal bg-ivory/30">Strategi belajar</td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Membaca ulang dan bertanya langsung
                        </td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Membaca ulang dan menggunakan Hint
                        </td>
                      </tr>
                      <tr className="hover:bg-ivory/40 transition">
                        <td className="py-3 px-4 font-bold text-charcoal bg-ivory/30">Pengalaman belajar</td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Pembelajaran langsung
                        </td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          NUMORA Space dan NORA
                        </td>
                      </tr>
                      <tr className="hover:bg-ivory/40 transition">
                        <td className="py-3 px-4 font-bold text-charcoal bg-ivory/30">Saran</td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Contoh kehidupan sehari-hari
                        </td>
                        <td className="py-3 px-4 text-secondary-text leading-relaxed">
                          Latihan tambahan dan penjelasan ringkas
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-lg bg-ivory/70 border border-[#28332C]/10 text-[11px] text-secondary-text flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>
                    <strong>Catatan Metodologi:</strong> Dokumentasi wawancara ini tidak menyediakan bukti klaim bahwa salah satu metode lebih efektif atau menghasilkan peningkatan nilai kuantitatif. Perbandingan disajikan murni berbasis respons kualitatif contoh siswa.
                  </span>
                </div>
              </div>

              {/* D. NAVIGASI KE DOKUMENTASI LENGKAP */}
              <div className="bg-sage/15 rounded-2xl p-5 sm:p-6 border border-forest/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-charcoal flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-forest" />
                    <span>Dokumentasi Wawancara Lengkap S-001 & S-002</span>
                  </h4>
                  <p className="text-xs text-secondary-text max-w-2xl leading-relaxed">
                    Akses seluruh 20 transkrip pertanyaan utama, 5 butir pertanyaan pendalaman komparatif, dan filter pencarian instan pada tab Hasil Wawancara.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('interviews')}
                  className="btn-interactive px-5 py-2.5 rounded-xl bg-forest text-pure-white text-xs font-bold hover:bg-forest/90 flex items-center justify-center gap-2 shadow-subtle shrink-0 transition"
                >
                  <span>Lihat Hasil Wawancara Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: AKTIVITAS PENGGUNA & SISWA RISET */}
          {activeTab === 'public_users' && (
            <div className="space-y-5 animate-fade-page">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-charcoal">
                    Aktivitas Pembelajaran Seluruh Siswa & Pengguna
                  </h2>
                  <p className="text-xs sm:text-sm text-secondary-text">
                    Pemantauan linimasa aktivitas riil, progres belajar, evaluasi, dan interaksi NORA secara terperinci.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadResearchData(true)}
                    disabled={isRefreshing}
                    className="btn-interactive inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-pure-white hover:bg-ivory border border-[#28332C]/14 text-charcoal transition-colors shadow-xs"
                    title="Segarkan data aktivitas dari server"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-forest ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Menyegarkan...' : 'Segarkan Data'}</span>
                  </button>
                </div>
              </div>

              {/* View Switcher & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-pure-white p-3 rounded-2xl border border-[#28332C]/14 shadow-subtle">
                <div className="flex items-center gap-1.5 bg-ivory p-1 rounded-xl border border-[#28332C]/10 text-xs font-semibold">
                  <button
                    onClick={() => setActiveUserViewMode('timeline')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeUserViewMode === 'timeline'
                        ? 'bg-forest text-pure-white shadow-xs'
                        : 'text-secondary-text hover:text-charcoal'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Linimasa Aktivitas ({filteredActivities.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveUserViewMode('summary')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeUserViewMode === 'summary'
                        ? 'bg-forest text-pure-white shadow-xs'
                        : 'text-secondary-text hover:text-charcoal'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Tabel Ringkasan Siswa ({filteredPublicUsers.length})</span>
                  </button>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary-text pointer-events-none" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder={activeUserViewMode === 'timeline' ? "Cari aktivitas, nama, email..." : "Cari nama, email, ID..."}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#28332C]/14 text-xs bg-pure-white focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              {/* Category Filter Pills for Timeline View */}
              {activeUserViewMode === 'timeline' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-semibold text-secondary-text mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Kategori:
                  </span>
                  {[
                    { id: 'ALL', label: 'Semua Aktivitas' },
                    { id: 'LOGIN', label: 'Sesi & Akun' },
                    { id: 'MODULE', label: 'Modul Aljabar' },
                    { id: 'EVALUATION', label: 'Evaluasi' },
                    { id: 'NORA_CHAT', label: 'Bimbingan NORA' },
                    { id: 'LAB_EXPERIMENT', label: 'Algebra Lab' },
                    { id: 'RUNNER_PLAY', label: 'NUMORA RUN' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActivityFilter(cat.id)}
                      className={`btn-interactive px-2.5 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors ${
                        activityFilter === cat.id
                          ? 'bg-forest text-pure-white shadow-xs'
                          : 'bg-pure-white text-secondary-text hover:text-charcoal border border-[#28332C]/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Callout Pemisahan Protokol */}
              <div className="p-3.5 rounded-2xl bg-sage/10 border border-forest/20 text-xs text-forest space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pemisahan Kohort Riset & Pengguna Publik</span>
                </div>
                <p className="text-secondary-text text-[11px] leading-relaxed">
                  Peserta resmi protokol komparatif tetap tepat dua siswa (<strong>S-001</strong> dan <strong>S-002</strong>). Pengguna berlabel <em>Siswa Publik</em> di bawah ini mencatat data belajar secara persisten tanpa mengubah alokasi kelompok riset.
                </p>
              </div>

              {/* VIEW 1: TIMELINE STREAM */}
              {activeUserViewMode === 'timeline' && (
                <div className="space-y-3">
                  {filteredActivities.length === 0 ? (
                    <div className="p-8 text-center bg-pure-white rounded-2xl border border-[#28332C]/14 shadow-subtle text-secondary-text text-xs space-y-2">
                      <Activity className="w-8 h-8 text-secondary-text/50 mx-auto" />
                      <p className="font-semibold text-charcoal">Belum ada aktivitas yang sesuai dengan filter.</p>
                      <p className="text-[11px]">Aktivitas belajar siswa akan otomatis muncul secara langsung di sini.</p>
                    </div>
                  ) : (
                    filteredActivities.map((act, idx) => {
                      const badge = getActivityBadge(act.activity_type);
                      return (
                        <div
                          key={act.activity_id || idx}
                          className="p-4 sm:p-5 rounded-2xl bg-pure-white border border-[#28332C]/14 shadow-subtle hover:shadow-card-clean transition-shadow space-y-3.5 overflow-hidden"
                        >
                          {/* Header Baris Identitas & Kategori */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#28332C]/10 pb-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {/* Avatar Kotak Ringkas (1-2 Inisial, Bebas Overflow) */}
                              <div className="w-10 h-10 rounded-xl bg-forest/10 border border-forest/20 text-forest shrink-0 flex items-center justify-center font-bold text-xs font-mono select-none">
                                {getUserInitial(act)}
                              </div>

                              {/* Informasi Pengguna & Identitas */}
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <span className="font-bold text-xs sm:text-sm text-charcoal break-words">
                                    {act.user_name || act.user_email?.split('@')[0]}
                                  </span>

                                  {/* Badge Status Kohort / Peran */}
                                  {act.subject_id === 'S-001' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest text-pure-white font-bold shrink-0">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      S-001 (Kontrol)
                                    </span>
                                  ) : act.subject_id === 'S-002' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-forest text-pure-white font-bold shrink-0">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      S-002 (Eksperimen)
                                    </span>
                                  ) : act.user_role === 'researcher' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sage/30 text-forest font-semibold shrink-0">
                                      <ShieldCheck className="w-2.5 h-2.5" />
                                      Peneliti
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ivory border border-[#28332C]/15 text-secondary-text shrink-0">
                                      Siswa Publik
                                    </span>
                                  )}
                                </div>

                                {/* Email dan Subject ID Berdiri Rapi Tanpa Tumpang Tindih */}
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-secondary-text">
                                  <span className="font-mono text-charcoal/90 break-all select-all">
                                    {act.user_email}
                                  </span>
                                  {act.subject_id && act.subject_id !== 'S-001' && act.subject_id !== 'S-002' && (
                                    <span className="inline-flex items-center font-mono text-[10px] px-1.5 py-0.2 rounded bg-ivory border border-[#28332C]/15 text-secondary-text break-all select-all">
                                      ID: {act.subject_id}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Badge Kategori & Waktu */}
                            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#28332C]/10">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} whitespace-nowrap`}>
                                {badge.label}
                              </span>
                              <span className="text-[11px] text-secondary-text flex items-center gap-1 font-mono whitespace-nowrap">
                                <Clock className="w-3 h-3 text-secondary-text/70 shrink-0" />
                                {formatTimestamp(act.created_at)}
                              </span>
                            </div>
                          </div>

                          {/* Activity Content & Context */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-0.5">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="text-secondary-text flex flex-wrap items-center gap-1.5">
                                <span>Fitur / Modul:</span>
                                <span className="text-charcoal font-mono font-bold uppercase bg-ivory px-2 py-0.5 rounded border border-[#28332C]/10 break-all">
                                  {act.module_or_feature_id}
                                </span>
                              </div>

                              {act.metadata?.score !== undefined && (
                                <div className="text-forest font-semibold flex flex-wrap items-center gap-2">
                                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                                    Skor: {act.metadata.score}/100
                                  </span>
                                  {act.metadata.correct_count !== undefined && (
                                    <span className="text-[11px] text-secondary-text font-normal">
                                      (Benar: {act.metadata.correct_count}, Salah: {act.metadata.wrong_count})
                                    </span>
                                  )}
                                </div>
                              )}

                              {act.metadata?.student_question && (
                                <div className="text-secondary-text bg-ivory p-2.5 rounded-xl border border-[#28332C]/10 text-[11px] break-words">
                                  <span className="font-semibold text-charcoal">Tanya NORA: </span>
                                  <span className="italic">"{act.metadata.student_question}"</span>
                                </div>
                              )}

                              {act.metadata?.active_tab && (
                                <div className="text-secondary-text text-[11px] flex flex-wrap items-center gap-1.5">
                                  <span>Eksplorasi Lab:</span>
                                  <span className="font-semibold text-charcoal uppercase bg-indigo-50 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200">
                                    {act.metadata.active_tab}
                                  </span>
                                  {act.metadata.slider_values && (
                                    <span className="font-mono text-secondary-text break-all">
                                      ({JSON.stringify(act.metadata.slider_values)})
                                    </span>
                                  )}
                                </div>
                              )}

                              {act.metadata?.distance !== undefined && (
                                <div className="text-terracotta font-semibold text-[11px] flex flex-wrap gap-2">
                                  <span>Jarak: {act.metadata.distance} m</span>
                                  <span>Koin: {act.metadata.coins}</span>
                                  <span>Skor: {act.metadata.score}</span>
                                </div>
                              )}
                            </div>

                            <div className="shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => handleViewDossier(act.user_email)}
                                className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-ivory text-charcoal hover:bg-sage/20 hover:text-forest border border-[#28332C]/14 transition-colors shadow-2xs whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5 text-forest" />
                                <span>Lihat Dossier</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* VIEW 2: SUMMARY TABLE */}
              {activeUserViewMode === 'summary' && (
                <div className="bg-pure-white rounded-2xl border border-[#28332C]/14 shadow-card-clean overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-ivory border-b border-[#28332C]/14 text-[11px] font-bold text-secondary-text uppercase tracking-wider">
                          <th className="p-3.5 sm:px-4">Pengguna & Akun</th>
                          <th className="p-3.5 sm:px-4">Status Kohort</th>
                          <th className="p-3.5 sm:px-4 text-center">Modul</th>
                          <th className="p-3.5 sm:px-4 text-center">Evaluasi & Skor</th>
                          <th className="p-3.5 sm:px-4 text-center">NUMORA RUN</th>
                          <th className="p-3.5 sm:px-4 text-center">Aktivitas</th>
                          <th className="p-3.5 sm:px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#28332C]/10 text-charcoal">
                        {filteredPublicUsers.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-6 text-center text-secondary-text text-xs">
                              Tidak ada data pengguna yang cocok dengan pencarian.
                            </td>
                          </tr>
                        ) : (
                          filteredPublicUsers.map((u) => {
                            const isOfficial = u.is_official_research_subject;
                            return (
                              <tr key={u.email} className="hover:bg-ivory/50 transition-colors">
                                <td className="p-3.5 sm:px-4">
                                  <div className="font-bold text-xs text-charcoal break-words">{u.name}</div>
                                  <div className="text-[11px] text-secondary-text font-mono truncate max-w-[180px] sm:max-w-xs">{u.email}</div>
                                  <div className="text-[10px] text-secondary-text/80 font-mono mt-0.5 truncate max-w-[180px] sm:max-w-xs">{u.subject_id}</div>
                                </td>
                                <td className="p-3.5 sm:px-4">
                                  {isOfficial ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-forest text-pure-white">
                                      <Sparkles className="w-3 h-3" />
                                      {u.subject_id === 'S-001' ? 'S-001 (Kontrol)' : 'S-002 (Eksperimen)'}
                                    </span>
                                  ) : u.role === 'researcher' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sage/30 text-forest">
                                      <ShieldCheck className="w-3 h-3" />
                                      Peneliti
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-ivory border border-[#28332C]/20 text-secondary-text">
                                      Siswa Publik
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 sm:px-4 text-center font-mono">
                                  <span className="font-bold text-forest">{u.modules_completed}</span> / 4
                                </td>
                                <td className="p-3.5 sm:px-4 text-center">
                                  {u.evaluations_count > 0 ? (
                                    <div>
                                      <span className="font-bold text-charcoal font-mono">{u.latest_evaluation_score ?? '-'}</span>
                                      <div className="text-[10px] text-secondary-text font-mono">{u.evaluations_count} sesi</div>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-secondary-text">Belum Ada</span>
                                  )}
                                </td>
                                <td className="p-3.5 sm:px-4 text-center">
                                  {u.runner_games > 0 ? (
                                    <div>
                                      <span className="font-bold text-terracotta font-mono">Rekor: {u.runner_high_score}</span>
                                      <div className="text-[10px] text-secondary-text font-mono">{u.runner_games} main</div>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-secondary-text">-</span>
                                  )}
                                </td>
                                <td className="p-3.5 sm:px-4 text-center font-mono font-bold text-xs">
                                  {u.activities_count}
                                </td>
                                <td className="p-3.5 sm:px-4 text-right">
                                  <button
                                    onClick={() => handleViewDossier(u.email)}
                                    className="btn-interactive inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-forest text-pure-white hover:bg-forest/90 transition-colors shadow-subtle"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Dossier</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: HASIL WAWANCARA SISWA (S-001 & S-002) */}
          {activeTab === 'interviews' && (
            <InterviewResultsView />
          )}

          {/* TAB 5: INSTRUMEN */}
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
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 font-semibold">
                    STATUS: {cogStatus?.intrinsic_load_status?.includes('NOT CONFIGURED') ? 'NOT CONFIGURED' : (cogStatus?.intrinsic_load_status || 'NOT CONFIGURED (Belum Diukur di Lapangan)')}
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
            </div>
          )}

          {/* TAB 6: ANALISIS & EKSPOR */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 animate-fade-page">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Ekspor Data Aktual Penelitian & Pengguna
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Unduh data aktual protokol riset dan rekap aktivitas pembelajaran seluruh siswa dalam format CSV atau JSON langsung dari database produksi.
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
                      Format tabel kompatibel dengan Microsoft Excel, Google Sheets, dan SPSS. Memisahkan kohort riset dan pengguna umum secara eksplisit.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="btn-interactive w-full py-2.5 rounded-xl font-semibold text-xs bg-forest text-pure-white hover:bg-forest-600 transition-colors flex items-center justify-center gap-2 shadow-subtle"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh CSV Data Aktual (.csv)</span>
                  </button>
                </div>

                <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-charcoal text-base">Ekspor Format JSON</h3>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      Format objek terstruktur lengkap mencakup skema subjek riset resmi (S-001/S-002), analitik, dan pengguna umum.
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

      {/* MODAL DOSSIER LENGKAP PENGGUNA */}
      {selectedUserDossier && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-pure-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[85vh] flex flex-col border border-[#28332C]/14 shadow-modal">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-[#28332C]/10 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-charcoal">
                    {selectedUserDossier.user.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedUserDossier.is_official_research_subject
                      ? 'bg-forest text-pure-white'
                      : 'bg-sage/20 text-forest'
                  }`}>
                    {selectedUserDossier.user.subject_id}
                  </span>
                </div>
                <div className="text-xs text-secondary-text flex items-center gap-3">
                  <span>Email: <strong className="text-charcoal">{selectedUserDossier.user.email}</strong></span>
                  <span>Peran: <strong className="text-charcoal">{selectedUserDossier.user.role}</strong></span>
                  <span>Tingkat: <strong className="text-charcoal">{selectedUserDossier.user.grade}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDossier(null)}
                className="p-1.5 rounded-xl hover:bg-ivory text-secondary-text hover:text-charcoal transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs Navigasi Dossier */}
            <div className="flex items-center gap-2 pt-3 pb-2 border-b border-[#28332C]/10 text-xs overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveDossierSubTab('modules')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
                  activeDossierSubTab === 'modules' ? 'bg-forest text-pure-white' : 'text-secondary-text hover:bg-ivory'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Modul ({selectedUserDossier.modules?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveDossierSubTab('evaluations')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
                  activeDossierSubTab === 'evaluations' ? 'bg-forest text-pure-white' : 'text-secondary-text hover:bg-ivory'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Evaluasi ({selectedUserDossier.evaluations?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveDossierSubTab('runner')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
                  activeDossierSubTab === 'runner' ? 'bg-forest text-pure-white' : 'text-secondary-text hover:bg-ivory'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>NUMORA RUN ({selectedUserDossier.runner_sessions?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveDossierSubTab('nora')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
                  activeDossierSubTab === 'nora' ? 'bg-forest text-pure-white' : 'text-secondary-text hover:bg-ivory'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Percakapan NORA</span>
              </button>
              <button
                onClick={() => setActiveDossierSubTab('activities')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
                  activeDossierSubTab === 'activities' ? 'bg-forest text-pure-white' : 'text-secondary-text hover:bg-ivory'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Linimasa ({selectedUserDossier.activities?.length || 0})</span>
              </button>
            </div>

            {/* Dossier Content Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* SUBTAB 1: MODUL BELAJAR */}
              {activeDossierSubTab === 'modules' && (
                <div className="space-y-3">
                  {(!selectedUserDossier.modules || selectedUserDossier.modules.length === 0) ? (
                    <p className="text-secondary-text py-4 text-center">Pengguna belum membuka atau menyelesaikan modul aljabar.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedUserDossier.modules.map((m) => (
                        <div key={m.module_id} className="p-3.5 rounded-2xl bg-ivory border border-[#28332C]/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-charcoal uppercase font-mono">{m.module_id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {m.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-secondary-text space-y-1">
                            <div>Waktu Belajar: <strong>{m.time_spent_seconds} detik ({Math.round(m.time_spent_seconds / 60)} mnt)</strong></div>
                            <div>Eksplorasi Slider: <strong>{m.slider_explored}%</strong></div>
                            {m.completed_at && (
                              <div>Selesai: <strong>{new Date(m.completed_at * 1000).toLocaleString('id-ID')}</strong></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 2: EVALUASI 10 SOAL */}
              {activeDossierSubTab === 'evaluations' && (
                <div className="space-y-4">
                  {(!selectedUserDossier.evaluations || selectedUserDossier.evaluations.length === 0) ? (
                    <p className="text-secondary-text py-4 text-center">Pengguna belum mengerjakan evaluasi mandiri 10 soal.</p>
                  ) : (
                    selectedUserDossier.evaluations.map((ev, idx) => (
                      <div key={ev.evaluation_id || idx} className="p-4 rounded-2xl bg-ivory border border-[#28332C]/10 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/10 pb-2.5">
                          <div>
                            <span className="font-bold text-charcoal text-sm">Percobaan #{ev.attempt_number || idx + 1}</span>
                            <span className="text-[11px] text-secondary-text ml-2">
                              {new Date((ev.completed_at || 0) * 1000).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-forest text-pure-white font-mono font-bold text-xs">
                              Skor: {ev.score} / 100
                            </span>
                            <span className="text-[11px] text-secondary-text">
                              Benar: <strong>{ev.correct_count}</strong> | Salah: <strong>{ev.wrong_count}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Rincian Soal & Jawaban */}
                        {Array.isArray(ev.detailed_answers) && ev.detailed_answers.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <p className="font-semibold text-charcoal text-[11px]">Rincian Jawaban Soal:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {ev.detailed_answers.map((ans, aIdx) => (
                                <div key={aIdx} className={`p-2.5 rounded-xl text-[11px] border ${
                                  ans.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                                }`}>
                                  <div className="flex items-center justify-between font-semibold mb-1">
                                    <span>Soal #{aIdx + 1}</span>
                                    {ans.isCorrect ? (
                                      <span className="flex items-center gap-0.5 text-emerald-700 font-bold"><Check className="w-3 h-3" /> Benar</span>
                                    ) : (
                                      <span className="flex items-center gap-0.5 text-rose-700 font-bold"><XCircle className="w-3 h-3" /> Salah</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-charcoal/80 line-clamp-2">{ans.questionText || ans.question}</div>
                                  <div className="mt-1 text-[10px]">
                                    Jawaban Siswa: <strong>{ans.selectedAnswer || '-'}</strong>
                                    {!ans.isCorrect && ans.correctAnswer && (
                                      <span className="block text-secondary-text">Kunci Benar: {ans.correctAnswer}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SUBTAB 3: NUMORA RUN */}
              {activeDossierSubTab === 'runner' && (
                <div className="space-y-4">
                  {/* Stats Agregat */}
                  {selectedUserDossier.runner_stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-ivory border border-[#28332C]/10 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-secondary-text block">Total Main</span>
                        <strong className="text-forest text-sm font-mono">{selectedUserDossier.runner_stats.total_games || 0}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary-text block">Total Koin</span>
                        <strong className="text-amber-700 text-sm font-mono">{selectedUserDossier.runner_stats.total_coins || 0}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary-text block">Total Jarak</span>
                        <strong className="text-charcoal text-sm font-mono">{selectedUserDossier.runner_stats.total_distance || 0} m</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-secondary-text block">Akurasi Soal</span>
                        <strong className="text-forest text-sm font-mono">
                          {selectedUserDossier.runner_stats.total_math_answered > 0
                            ? Math.round((selectedUserDossier.runner_stats.total_math_correct / selectedUserDossier.runner_stats.total_math_answered) * 100)
                            : 0}%
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Riwayat Sesi Runner */}
                  {(!selectedUserDossier.runner_sessions || selectedUserDossier.runner_sessions.length === 0) ? (
                    <p className="text-secondary-text py-4 text-center">Pengguna belum memainkan game NUMORA RUN 3D.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-semibold text-charcoal text-[11px]">Riwayat Sesi Permainan:</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedUserDossier.runner_sessions.map((sess, idx) => (
                          <div key={sess.session_id || idx} className="p-3 rounded-xl bg-ivory border border-[#28332C]/10 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-charcoal uppercase font-mono">{sess.level}</span>
                              <span className="text-[10px] text-secondary-text ml-2">
                                {new Date((sess.created_at || 0) * 1000).toLocaleString('id-ID')}
                              </span>
                              <div className="text-[11px] text-secondary-text mt-0.5">
                                Koin: <strong>{sess.coins}</strong> | Jarak: <strong>{sess.distance} m</strong> | Soal: <strong>{sess.correct}/{sess.answered}</strong>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-xs font-bold text-terracotta">Skor {sess.score}</span>
                              <div className="text-[10px] text-secondary-text">{sess.accuracy}% akurat</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 4: PERCAKAPAN NORA AI */}
              {activeDossierSubTab === 'nora' && (
                <div className="space-y-3">
                  {(() => {
                    const noraActivities = (selectedUserDossier.activities || []).filter(
                      a => a.activity_type === 'NORA_CHAT'
                    );
                    if (noraActivities.length === 0) {
                      return <p className="text-secondary-text py-4 text-center">Pengguna belum berinteraksi dengan AI NORA.</p>;
                    }
                    return noraActivities.map((n, idx) => (
                      <div key={n.activity_id || idx} className="p-3.5 rounded-2xl bg-ivory border border-[#28332C]/10 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-secondary-text border-b border-[#28332C]/10 pb-1.5">
                          <span className="font-semibold text-forest flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5" />
                            Mode: {n.metadata?.mode || n.module_or_feature_id}
                          </span>
                          <span>{new Date(n.created_at * 1000).toLocaleString('id-ID')}</span>
                        </div>
                        {n.metadata?.student_question && (
                          <div className="text-charcoal bg-pure-white p-2.5 rounded-xl border border-[#28332C]/10">
                            <strong className="text-forest text-[11px] block">Pertanyaan Siswa:</strong>
                            <p className="mt-0.5 leading-relaxed">{n.metadata.student_question}</p>
                          </div>
                        )}
                        {n.metadata?.nora_response && (
                          <div className="text-secondary-text bg-sage/10 p-2.5 rounded-xl border border-forest/15">
                            <strong className="text-forest text-[11px] block">Respons Bimbingan NORA:</strong>
                            <p className="mt-0.5 text-charcoal leading-relaxed">{n.metadata.nora_response}</p>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              )}

              {/* SUBTAB 5: LINIMASA LENGKAP (AUDIT TRAIL) */}
              {activeDossierSubTab === 'activities' && (
                <div className="space-y-2">
                  {(!selectedUserDossier.activities || selectedUserDossier.activities.length === 0) ? (
                    <p className="text-secondary-text py-4 text-center">Belum ada linimasa aktivitas tercatat.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {selectedUserDossier.activities.map((act, idx) => (
                        <div key={act.activity_id || idx} className="p-2.5 rounded-xl bg-ivory border border-[#28332C]/10 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-forest font-mono uppercase">{act.activity_type}</span>
                            <span className="text-secondary-text ml-2">({act.module_or_feature_id})</span>
                          </div>
                          <span className="text-[11px] text-secondary-text font-mono">
                            {new Date(act.created_at * 1000).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-[#28332C]/10 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedUserDossier(null)}
                className="px-4 py-2 rounded-xl bg-forest text-pure-white text-xs font-semibold hover:bg-forest/90 transition-colors"
              >
                Tutup Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
