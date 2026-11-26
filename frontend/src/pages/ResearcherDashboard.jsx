import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import MathView from '../components/common/MathView';
import InterviewResultsView from '../features/research/InterviewResultsView';
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
  Layers
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
  const [researchTraceFilter, setResearchTraceFilter] = useState('ALL'); // 'ALL' | 'S-001' | 'S-002'

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

  // =========================================================================
  // LOGIKA PENGGABUNGAN DATA PENELITIAN AKTUAL (S-001 & S-002)
  // =========================================================================
  const researchSubjectsList = subjects.length > 0 ? subjects : DEFAULT_RESEARCH_SUBJECTS;
  const s001 = researchSubjectsList.find(s => s.subject_id === 'S-001') || DEFAULT_RESEARCH_SUBJECTS[0];
  const s002 = researchSubjectsList.find(s => s.subject_id === 'S-002') || DEFAULT_RESEARCH_SUBJECTS[1];
  const totalOfficialSubjects = researchSubjectsList.filter(s => s.subject_id === 'S-001' || s.subject_id === 'S-002').length;

  const s001Sessions = (sessions || []).filter(s => s.subject_id === 'S-001');
  const s002Sessions = (sessions || []).filter(s => s.subject_id === 'S-002');
  const s002UserRecord = (publicUsers || []).find(u => u.subject_id === 'S-002' || u.email === 'siswa.demo@numora.space');
  const s002DigitalActivities = (activities || []).filter(a => a.subject_id === 'S-002' || a.user_email === 'siswa.demo@numora.space');

  // Unified research activities map (Deduplikasi ketat dengan ID unik)
  const unifiedResearchActivitiesMap = new Map();

  s001Sessions.forEach(sess => {
    unifiedResearchActivitiesMap.set(sess.session_id, {
      id: sess.session_id,
      timestamp: sess.created_at ? sess.created_at * 1000 : null,
      dateString: sess.session_date || (sess.created_at ? new Date(sess.created_at * 1000).toLocaleDateString('id-ID') : 'Waktu tidak tersedia'),
      subject_id: 'S-001',
      group_name: 'Kontrol (Tatap Muka)',
      activity_type: 'SESI_TATAP_MUKA',
      activity_label: 'Sesi Pembelajaran Tatap Muka Terarah',
      module_id: sess.module_id || 'Modul 02',
      concept: sess.concept_studied || 'Pemahaman Koefisien',
      duration_minutes: sess.duration_minutes || 0,
      source: 'Peneliti Langsung (P-001)',
      notes: sess.notes || 'Pembelajaran tatap muka konvensional terarah bersama peneliti.',
      is_digital: false
    });
  });

  s002Sessions.forEach(sess => {
    unifiedResearchActivitiesMap.set(sess.session_id, {
      id: sess.session_id,
      timestamp: sess.created_at ? sess.created_at * 1000 : null,
      dateString: sess.session_date || (sess.created_at ? new Date(sess.created_at * 1000).toLocaleDateString('id-ID') : 'Waktu tidak tersedia'),
      subject_id: 'S-002',
      group_name: 'Eksperimen (NUMORA Space)',
      activity_type: 'SESI_MONITORING',
      activity_label: 'Monitoring Pembelajaran Mandiri',
      module_id: sess.module_id || 'Modul 02',
      concept: sess.concept_studied || 'Pemahaman Koefisien',
      duration_minutes: sess.duration_minutes || 0,
      source: 'Peneliti Langsung (P-001)',
      notes: sess.notes || 'Observasi interaksi siswa dengan platform digital.',
      is_digital: false
    });
  });

  s002DigitalActivities.forEach(act => {
    const actId = act.activity_id || `act_${act.created_at}_${act.activity_type}`;
    if (!unifiedResearchActivitiesMap.has(actId)) {
      unifiedResearchActivitiesMap.set(actId, {
        id: actId,
        timestamp: act.created_at ? act.created_at * 1000 : null,
        dateString: act.created_at ? new Date(act.created_at * 1000).toLocaleDateString('id-ID') : 'Waktu tidak tersedia',
        subject_id: 'S-002',
        group_name: 'Eksperimen (NUMORA Space)',
        activity_type: act.activity_type,
        activity_label: getActivityBadge(act.activity_type).label,
        module_id: act.module_or_feature_id || 'Platform NUMORA',
        concept: act.module_or_feature_id || 'Aktivitas Belajar Mandiri',
        duration_minutes: null,
        source: 'Log Sistem NUMORA Space',
        notes: typeof act.metadata === 'object' && act.metadata ? JSON.stringify(act.metadata) : 'Log aktivitas mandiri digital.',
        is_digital: true
      });
    }
  });

  const unifiedResearchActivities = Array.from(unifiedResearchActivitiesMap.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const filteredUnifiedActivities = unifiedResearchActivities.filter(item => {
    if (researchTraceFilter === 'S-001') return item.subject_id === 'S-001';
    if (researchTraceFilter === 'S-002') return item.subject_id === 'S-002';
    return true;
  });

  const totalUnifiedActivitiesCount = unifiedResearchActivities.length;
  const s001DurationMinutes = s001Sessions.reduce((acc, s) => acc + (Number(s.duration_minutes) || 0), 0);
  const s002DigitalSeconds = analytics?.s002_digital_learning?.total_time_spent_seconds || 0;
  const s002DurationMinutes = s002Sessions.reduce((acc, s) => acc + (Number(s.duration_minutes) || 0), 0) + Math.round(s002DigitalSeconds / 60);
  const totalCombinedDurationMinutes = s001DurationMinutes + s002DurationMinutes;

  const MODULES_MATRIX = [
    {
      id: 'modul-1',
      title: 'Mengenal Variabel',
      math: 'x + 3 = 7',
      s001_status: s001Sessions.some(s => s.module_id === 'modul-1' || s.module_id === 'Modul 01') ? 'Selesai (Tatap Muka)' : 'Belum Dimulai',
      s002_status: (s002UserRecord?.modules_completed >= 1) ? 'Selesai (Digital)' : 'Belum Selesai',
      is_target: false
    },
    {
      id: 'modul-2',
      title: 'Memahami Koefisien',
      math: '3x + 5 = 20',
      s001_status: s001Sessions.some(s => s.module_id === 'modul-2' || s.module_id === 'Modul 02')
        ? 'Sedang Dipelajari (Tatap Muka)'
        : 'Target Protokol Aktif (Belum Ada Log Sesi)',
      s002_status: s002DigitalActivities.some(a => a.module_or_feature_id === 'modul-2' || a.module_or_feature_id === 'Modul 02')
        ? 'Sedang Dipelajari (Digital NORA)'
        : 'Target Protokol Aktif (Belum Ada Log Aktivitas)',
      is_target: true
    },
    {
      id: 'modul-3',
      title: 'Menentukan Konstanta',
      math: '2x - 8 = 10',
      s001_status: 'Belum Dimulai (Menunggu Rotasi Tatap Muka)',
      s002_status: (s002UserRecord?.modules_completed >= 3) ? 'Selesai (Digital)' : 'Belum Dimulai',
      is_target: false
    },
    {
      id: 'modul-4',
      title: 'Memahami Bentuk Aljabar',
      math: '4x + 2y - 5',
      s001_status: 'Belum Dimulai (Menunggu Rotasi Tatap Muka)',
      s002_status: (s002UserRecord?.modules_completed >= 4) ? 'Selesai (Digital)' : 'Belum Dimulai',
      is_target: false
    }
  ];

  const s001Pretest = s001.pretest_score !== null && s001.pretest_score !== undefined ? s001.pretest_score : null;
  const s002Pretest = s002.pretest_score !== null && s002.pretest_score !== undefined ? s002.pretest_score : null;
  const s001Posttest = s001.posttest_score !== null && s001.posttest_score !== undefined ? s001.posttest_score : null;
  const s002Posttest = s002.posttest_score !== null && s002.posttest_score !== undefined ? s002.posttest_score : null;
  const s002EvalCount = typeof analytics?.s002_digital_learning?.evaluations_count === 'number'
    ? analytics.s002_digital_learning.evaluations_count
    : (typeof s002UserRecord?.evaluations_count === 'number' ? s002UserRecord.evaluations_count : 0);

  const s002LatestScore = typeof analytics?.s002_digital_learning?.latest_evaluation_score === 'number'
    ? analytics.s002_digital_learning.latest_evaluation_score
    : (typeof s002UserRecord?.latest_evaluation_score === 'number' ? s002UserRecord.latest_evaluation_score : null);

  const s002MaxScore = typeof s002UserRecord?.max_evaluation_score === 'number'
    ? s002UserRecord.max_evaluation_score
    : null;

  const actualTestScores = [
    ...(s001Pretest !== null ? [{ subject: 'S-001', test: 'Pre-Test', score: s001Pretest }] : []),
    ...(s002Pretest !== null ? [{ subject: 'S-002', test: 'Pre-Test', score: s002Pretest }] : []),
    ...(s001Posttest !== null ? [{ subject: 'S-001', test: 'Post-Test', score: s001Posttest }] : []),
    ...(s002Posttest !== null ? [{ subject: 'S-002', test: 'Post-Test', score: s002Posttest }] : []),
    ...(s002EvalCount > 0 && s002LatestScore !== null ? [{ subject: 'S-002', test: 'Evaluasi Mandiri', score: s002LatestScore }] : []),
  ];

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
          {/* TAB 1: OVERVIEW — RINGKASAN TERPADU RISET S-001 & S-002 */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-page">
              {/* Header Hero Banner: Ringkasan Terpadu Protokol Penelitian */}
              <div className="rounded-2xl p-6 sm:p-8 bg-pure-white border border-[#28332C]/14 shadow-card-clean space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/14 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage/20 text-xs font-semibold text-forest">
                      <Microscope className="w-3.5 h-3.5" />
                      <span>Ringkasan Terpadu Penelitian Aljabar SMP Kelas VII</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
                      Dashboard Riset Komparatif: S-001 (Kontrol) & S-002 (Eksperimen)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-forest text-pure-white font-mono font-semibold">
                      Lead P-001
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-ivory text-secondary-text border border-[#28332C]/14 font-mono font-medium">
                      Sampel Kohort N = 2
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
                  Bagian ini menyatukan seluruh rekam data aktual dari dua subjek penelitian resmi: <strong>S-001</strong> (Kelompok Kontrol · Pembelajaran Tatap Muka Konvensional) dan <strong>S-002</strong> (Kelompok Eksperimen · Pembelajaran Berbantuan Platform NUMORA Space & NORA AI). Seluruh metrik dihitung secara riil dari database tanpa fabrikasi data atau penghitungan ganda.
                </p>
              </div>

              {/* 4 Ringkasan Metrik Gabungan Riset Aktual (Unified KPI Cards) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Subjek Riset Kohort</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-charcoal font-mono">
                    {totalOfficialSubjects} Subjek
                  </div>
                  <span className="text-[11px] text-forest font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>S-001 (Kontrol) + S-002 (Eksperimen)</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Total Aktivitas & Sesi Terverifikasi</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-forest font-mono">
                    {totalUnifiedActivitiesCount} Sesi / Log
                  </div>
                  <span className="text-[11px] text-secondary-text flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                    <span>{s001Sessions.length} Tatap Muka + {s002DigitalActivities.length} Digital (Deduplikasi)</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Akumulasi Waktu Belajar</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-charcoal font-mono">
                    {totalCombinedDurationMinutes > 0 ? `${totalCombinedDurationMinutes} Menit` : 'Data Berjalan'}
                  </div>
                  <span className="text-[11px] text-secondary-text flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-forest" />
                    <span>S-001: {s001DurationMinutes} mnt · S-002: {s002DurationMinutes} mnt</span>
                  </span>
                </div>

                <div className="bg-pure-white rounded-xl p-4 border border-[#28332C]/14 shadow-subtle space-y-1">
                  <span className="text-xs text-secondary-text">Status Evaluasi & Kognitif</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-charcoal font-mono">
                    {s002EvalCount > 0 ? `${s002EvalCount} Evaluasi` : 'Terjadwal'}
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Leppink Scale: NOT CONFIGURED</span>
                  </span>
                </div>
              </div>

              {/* REKAPITULASI PROGRES 4 MODUL ALJABAR GABUNGAN */}
              <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-forest" />
                      <span>Rekapitulasi Progres Empat Modul Aljabar</span>
                    </h3>
                    <p className="text-xs text-secondary-text">
                      Pemantauan ketercapaian materi aljabar Kurikulum Merdeka pada subjek kontrol dan eksperimen.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-ivory text-forest border border-[#28332C]/10 self-start sm:self-auto">
                    Target Aktif: Modul 02
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {MODULES_MATRIX.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                        m.is_target
                          ? 'bg-sage/10 border-forest/40 shadow-xs'
                          : 'bg-ivory/60 border-[#28332C]/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-secondary-text uppercase">
                          {m.id.replace('-', ' ')}
                        </span>
                        {m.is_target && (
                          <span className="px-2 py-0.5 rounded-full bg-forest text-pure-white text-[9px] font-extrabold uppercase tracking-wider">
                            Target Aktif
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-charcoal text-sm">{m.title}</h4>

                      <div className="py-1 px-2.5 rounded bg-pure-white text-center border border-[#28332C]/10 text-xs text-forest font-semibold">
                        <MathView math={m.math} />
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px] border-t border-[#28332C]/10">
                        <div className="flex justify-between items-center">
                          <span className="text-secondary-text font-medium">S-001 (Kontrol):</span>
                          <span className="font-semibold text-charcoal text-right">{m.s001_status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-secondary-text font-medium">S-002 (Eksperimen):</span>
                          <span className="font-semibold text-charcoal text-right">{m.s002_status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REKAPITULASI HASIL EVALUASI & PENGUKURAN PEMAHAMAN */}
              <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      <Award className="w-4 h-4 text-terracotta" />
                      <span>Rekapitulasi Hasil Evaluasi & Pengukuran Pemahaman</span>
                    </h3>
                    <p className="text-xs text-secondary-text">
                      Pengukuran kuantitatif baseline (pre-test), evaluasi formatif mandiri, dan capaian akhir (post-test).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Pre-Test Baseline */}
                  <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/14 space-y-2">
                    <span className="text-xs font-bold text-charcoal block">1. Pre-Test (Baseline Kompetensi)</span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#28332C]/10">
                        <span className="text-secondary-text">S-001 (Kontrol):</span>
                        <span className="font-semibold text-charcoal">
                          {s001Pretest !== null ? `${s001Pretest} Poin` : 'Belum diukur (Terjadwal)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-secondary-text">S-002 (Eksperimen):</span>
                        <span className="font-semibold text-charcoal">
                          {s002Pretest !== null ? `${s002Pretest} Poin` : 'Belum diukur (Terjadwal)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evaluasi Mandiri Formatif (NUMORA Space) */}
                  <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/14 space-y-2">
                    <span className="text-xs font-bold text-charcoal block">2. Evaluasi Mandiri 10 Soal (Formatif)</span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#28332C]/10">
                        <span className="text-secondary-text">S-001 (Kontrol):</span>
                        <span className="font-mono text-secondary-text">Dinonaktifkan (Isolasi)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-secondary-text">S-002 (Eksperimen):</span>
                        <span className="font-semibold text-forest">
                          {s002EvalCount > 0 ? `${s002EvalCount} Sesi Dikerjakan` : 'Belum Dikerjakan'}
                        </span>
                      </div>
                      {s002EvalCount > 0 && s002LatestScore !== null && (
                        <div className="text-[11px] text-secondary-text pt-1">
                          Skor Terakhir: <strong>{s002LatestScore} / 100</strong> (Tertinggi: <strong>{s002MaxScore ?? s002LatestScore}</strong>)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post-Test Capaian Akhir */}
                  <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/14 space-y-2">
                    <span className="text-xs font-bold text-charcoal block">3. Post-Test (Capaian Akhir)</span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#28332C]/10">
                        <span className="text-secondary-text">S-001 (Kontrol):</span>
                        <span className="font-semibold text-charcoal">
                          {s001Posttest !== null ? `${s001Posttest} Poin` : 'Belum diukur (Menunggu Selesai Modul)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-secondary-text">S-002 (Eksperimen):</span>
                        <span className="font-semibold text-charcoal">
                          {s002Posttest !== null ? `${s002Posttest} Poin` : 'Belum diukur (Menunggu Selesai Modul)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box Distribusi Nilai Empiris */}
                <div className="p-3.5 rounded-xl bg-ivory/80 border border-[#28332C]/10 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-forest shrink-0" />
                    <span className="text-secondary-text">
                      <strong>Distribusi Nilai:</strong> {actualTestScores.length > 0 ? `${actualTestScores.length} data skor tercatat.` : 'Belum tersedia (Data nilai ujian formal belum diukur di lapangan). Pengukuran kuantitatif pre-test dan post-test akan diinput setelah sesi evaluasi serempak di lapangan.'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pure-white text-secondary-text border border-[#28332C]/10 shrink-0">
                    N = 2
                  </span>
                </div>
              </div>

              {/* PERBANDINGAN S-001 vs S-002 (COMPARATIVE DESIGN MATRIX) */}
              <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-forest" />
                      <span>Perbandingan Rancangan & Metrik S-001 (Kontrol) vs S-002 (Eksperimen)</span>
                    </h3>
                    <p className="text-xs text-secondary-text">
                      Perbedaan perlakuan intervensi, lingkungan pembelajaran, durasi, dan tingkat bantuan pada kedua kelompok.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#28332C]/14 bg-ivory/80 text-secondary-text">
                        <th className="py-2.5 px-3 font-semibold">Dimensi Penelitian</th>
                        <th className="py-2.5 px-3 font-semibold text-forest">S-001 (Kelompok Kontrol)</th>
                        <th className="py-2.5 px-3 font-semibold text-forest">S-002 (Kelompok Eksperimen)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#28332C]/10 text-charcoal">
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-secondary-text">Metode Pembelajaran</td>
                        <td className="py-2.5 px-3 font-semibold">Tatap Muka Konvensional (Direct Teaching)</td>
                        <td className="py-2.5 px-3 font-semibold">Mandiri Terpandu (NUMORA Space + NORA AI)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-secondary-text">Media & Alat Bantu</td>
                        <td className="py-2.5 px-3">LKS Kertas & Bimbingan Langsung Peneliti</td>
                        <td className="py-2.5 px-3">Modul Web Interaktif 3D & Tutor Sokratik AI</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-secondary-text">Akses Fitur Digital</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-semibold border border-rose-200 text-[10px]">
                            Diblokir Penuh (Isolasi Kontrol)
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[10px]">
                            Aktif & Tersinkronisasi Persisten
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-secondary-text">Modul Target Aktif</td>
                        <td className="py-2.5 px-3 font-mono font-semibold">Modul 02: Memahami Koefisien</td>
                        <td className="py-2.5 px-3 font-mono font-semibold">Modul 02: Memahami Koefisien</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-secondary-text">Total Sesi / Log Terverifikasi</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-forest">{s001Sessions.length} Sesi Tatap Muka</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-forest">{s002Sessions.length + s002DigitalActivities.length} Sesi & Log Digital</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-secondary-text">Akumulasi Waktu Pembelajaran</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{s001DurationMinutes} Menit</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{s002DurationMinutes} Menit</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-secondary-text">Status Beban Kognitif</td>
                        <td className="py-2.5 px-3 font-mono text-amber-700 font-semibold">NOT CONFIGURED (Belum Diukur)</td>
                        <td className="py-2.5 px-3 font-mono text-amber-700 font-semibold">NOT CONFIGURED (Belum Diukur)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ANALISIS HASIL PENELITIAN & INTEGRITAS METODOLOGIS */}
              <div className="bg-sage/15 rounded-2xl p-5 sm:p-6 border border-forest/20 shadow-subtle space-y-3">
                <div className="flex items-center gap-2 text-forest font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Analisis Hasil Penelitian Berdasarkan Data Aktual & Catatan Metodologis</span>
                </div>
                <div className="space-y-2 text-xs text-charcoal/90 leading-relaxed">
                  <p>
                    <strong>Fase Intervensi Aktif:</strong> Berdasarkan data aktual per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}, kedua subjek berada pada tahap intervensi <strong>Modul 02: Memahami Koefisien</strong>. Kelompok kontrol (S-001) menjalani sesi pembelajaran terarah secara langsung bersama peneliti tanpa intervensi digital, sementara kelompok eksperimen (S-002) mengeksplorasi modul interaktif dan bimbingan NORA secara mandiri.
                  </p>
                  <p className="p-3 rounded-xl bg-pure-white/80 border border-forest/20 text-secondary-text text-[11px]">
                    <strong>Catatan Transparansi Metodologis (N = 2):</strong> Sesuai kaidah integritas ilmiah, efektivitas komparatif platform NUMORA Space belum dapat disimpulkan secara definitif dari data yang berjalan saat ini. Pengukuran komparatif resmi akan disimpulkan setelah pelaksanaan ujian post-test lapangan dan instrumen skala beban kognitif Leppink et al. dilaksanakan secara serempak.
                  </p>
                </div>
              </div>

              {/* TABEL RINCIAN DATA PENELITIAN YANG DAPAT DITELUSURI (UNIFIED TRACEABILITY TABLE) */}
              <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/14 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 text-forest" />
                      <span>Tabel Rincian Data Penelitian yang Dapat Ditelusuri</span>
                    </h3>
                    <p className="text-xs text-secondary-text">
                      Audit trail terpadu sesi tatap muka dan log pembelajaran yang terverifikasi untuk S-001 dan S-002.
                    </p>
                  </div>

                  {/* Filter Subjek Riset */}
                  <div className="flex items-center gap-1.5 bg-ivory p-1 rounded-xl border border-[#28332C]/10 text-xs font-semibold self-start sm:self-auto">
                    <button
                      onClick={() => setResearchTraceFilter('ALL')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        researchTraceFilter === 'ALL'
                          ? 'bg-forest text-pure-white shadow-xs'
                          : 'text-secondary-text hover:text-charcoal'
                      }`}
                    >
                      Semua ({unifiedResearchActivities.length})
                    </button>
                    <button
                      onClick={() => setResearchTraceFilter('S-001')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        researchTraceFilter === 'S-001'
                          ? 'bg-forest text-pure-white shadow-xs'
                          : 'text-secondary-text hover:text-charcoal'
                      }`}
                    >
                      S-001 Kontrol ({s001Sessions.length})
                    </button>
                    <button
                      onClick={() => setResearchTraceFilter('S-002')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        researchTraceFilter === 'S-002'
                          ? 'bg-forest text-pure-white shadow-xs'
                          : 'text-secondary-text hover:text-charcoal'
                      }`}
                    >
                      S-002 Eksperimen ({s002Sessions.length + s002DigitalActivities.length})
                    </button>
                  </div>
                </div>

                {/* Tabel Konten */}
                {filteredUnifiedActivities.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <Clock className="w-8 h-8 text-secondary-text/50 mx-auto" />
                    <p className="text-xs text-secondary-text">
                      Belum ada sesi atau aktivitas penelitian yang tercatat di database untuk filter ini.
                    </p>
                    <p className="text-[11px] text-forest font-medium">
                      Peneliti dapat menambahkan sesi tatap muka baru melalui tab <strong>Monitoring Sesi</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#28332C]/14 bg-ivory/80 text-secondary-text">
                          <th className="py-2.5 px-3 font-semibold">No</th>
                          <th className="py-2.5 px-3 font-semibold">Tanggal / Waktu</th>
                          <th className="py-2.5 px-3 font-semibold">Subjek</th>
                          <th className="py-2.5 px-3 font-semibold">Kelompok</th>
                          <th className="py-2.5 px-3 font-semibold">Aktivitas</th>
                          <th className="py-2.5 px-3 font-semibold">Materi / Modul</th>
                          <th className="py-2.5 px-3 font-semibold">Sumber Verifikasi</th>
                          <th className="py-2.5 px-3 font-semibold">Durasi / Catatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#28332C]/10 text-charcoal">
                        {filteredUnifiedActivities.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-ivory/50 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-secondary-text">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono text-secondary-text">{item.dateString}</td>
                            <td className="py-2.5 px-3 font-bold font-mono text-forest">{item.subject_id}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.subject_id === 'S-001'
                                  ? 'bg-sage/20 text-forest'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}>
                                {item.group_name}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold">{item.activity_label}</td>
                            <td className="py-2.5 px-3 font-mono">{item.module_id}</td>
                            <td className="py-2.5 px-3 text-secondary-text">{item.source}</td>
                            <td className="py-2.5 px-3 text-secondary-text max-w-xs truncate" title={item.notes}>
                              {item.duration_minutes ? `${item.duration_minutes} mnt - ` : ''}{item.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PESERTA RISET RESMI (S-001 & S-002) */}
          {activeTab === 'subjects' && (
            <div className="space-y-4 animate-fade-page">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Peserta Resmi Protokol Penelitian
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Perbandingan protokol intervensi antara kelompok kontrol tatap muka (S-001) dan kelompok eksperimen mandiri (S-002).
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
                        <span className="text-secondary-text">Status Beban Kognitif:</span>
                        <span className="font-mono text-amber-700 font-semibold">{sub.cognitive_load_status || 'NOT CONFIGURED'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-text">Integritas Protokol:</span>
                        <span className="font-mono text-forest font-semibold">
                          {sub.subject_id === 'S-001' ? 'Intervensi Digital Diblokir (Kontrol)' : 'Aktivitas Persisten SQLite'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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

          {/* TAB 4: MONITORING SESI PENELITIAN */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6 animate-fade-page">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-charcoal">
                  Monitoring Sesi & Hasil Evaluasi Riset
                </h2>
                <p className="text-xs sm:text-sm text-secondary-text">
                  Catatan aktivitas belajar terpandu, progres modul, dan hasil evaluasi mandiri per subjek riset.
                </p>
              </div>

              {/* Grid 2 Subjek: S-001 vs S-002 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* S-001 Card (Kontrol) */}
                <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between border-b border-[#28332C]/14 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-forest/10 text-forest font-bold font-mono text-xs flex items-center justify-center">
                        S-001
                      </span>
                      <div>
                        <h4 className="font-bold text-charcoal text-sm">S-001 (Kontrol)</h4>
                        <span className="text-[11px] text-secondary-text">Tatap Muka Konvensional</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sage/20 text-forest font-semibold">
                      KONTROL TERKUNCI
                    </span>
                  </div>

                  <p className="text-xs text-secondary-text leading-relaxed">
                    Siswa belajar aljabar konvensional bersama peneliti secara tatap muka langsung. Intervensi pembelajaran digital dinonaktifkan demi validitas kontrol.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#28332C]/10 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-text">Akses Modul Digital:</span>
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">BLOCKED (403)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-text">Akses Evaluasi Digital:</span>
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">BLOCKED (403)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-text">Akses NUMORA RUN:</span>
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">BLOCKED (403)</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-secondary-text bg-ivory p-2.5 rounded-lg border border-[#28332C]/10 flex items-center justify-between">
                    <span>Sumber Data:</span>
                    <span className="font-mono text-charcoal font-semibold">DIRECT_TEACHING_LOG</span>
                  </div>
                </div>

                {/* S-002 Card (Eksperimen) */}
                <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between border-b border-[#28332C]/14 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-forest text-pure-white font-bold font-mono text-xs flex items-center justify-center">
                        S-002
                      </span>
                      <div>
                        <h4 className="font-bold text-charcoal text-sm">S-002 (Eksperimen)</h4>
                        <span className="text-[11px] text-secondary-text">Intervensi NUMORA Space & NORA</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest text-pure-white font-semibold">
                      AKTIF PERSISTEN
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-text">Progres Modul Aljabar:</span>
                      <span className="font-semibold text-charcoal">
                        {analytics?.s002_digital_learning?.modules_completed || 0} dari 4 Selesai
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-text">Evaluasi Tersimpan:</span>
                      <span className="font-semibold text-charcoal">
                        {analytics?.s002_digital_learning?.evaluations_count || 0} Sesi
                        {analytics?.s002_digital_learning?.latest_evaluation_score !== null && analytics?.s002_digital_learning?.latest_evaluation_score !== undefined
                          ? ` (Skor: ${analytics.s002_digital_learning.latest_evaluation_score})`
                          : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-text">NUMORA RUN:</span>
                      <span className="font-semibold text-charcoal">
                        {analytics?.s002_digital_learning?.runner_stats?.total_games || 0} Main
                        {analytics?.s002_digital_learning?.runner_stats?.high_score_beginner
                          ? ` (Rekor: ${analytics.s002_digital_learning.runner_stats.high_score_beginner})`
                          : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary-text">Waktu Belajar:</span>
                      <span className="font-medium text-charcoal">
                        {Math.round((analytics?.s002_digital_learning?.total_time_spent_seconds || 0) / 60)} Menit
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-secondary-text bg-pure-white p-2.5 rounded-lg border border-[#28332C]/10 flex items-center justify-between">
                    <span>Sumber Data:</span>
                    <span className="font-mono text-forest font-semibold">ACTUAL_EMPIRICAL</span>
                  </div>
                </div>
              </div>

              {/* Log Singkat Aktivitas Terbaru Seluruh Siswa */}
              <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-[#28332C]/10 pb-3">
                  <div>
                    <h3 className="font-bold text-charcoal text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-forest" />
                      <span>Riwayat Aktivitas Belajar Terkini</span>
                    </h3>
                    <p className="text-xs text-secondary-text">
                      Pemantauan langsung sesi belajar dan evaluasi terbaru dari seluruh peserta dan siswa.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('public_users')}
                    className="btn-interactive text-xs font-semibold text-forest hover:underline"
                  >
                    Buka Linimasa Lengkap ({activities.length}) →
                  </button>
                </div>

                <div className="space-y-2">
                  {activities.slice(0, 5).map((act, idx) => {
                    const badge = getActivityBadge(act.activity_type);
                    return (
                      <div key={act.activity_id || idx} className="p-3 rounded-xl bg-ivory border border-[#28332C]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs overflow-hidden">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="font-bold text-charcoal break-words">{act.user_name || act.user_email?.split('@')[0]}</span>
                            <span className="font-mono text-[10px] text-secondary-text break-all">({act.subject_id || act.user_email})</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} shrink-0`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-secondary-text flex flex-wrap gap-1">
                            <span>Fitur: <strong className="text-charcoal uppercase font-mono break-all">{act.module_or_feature_id}</strong></span>
                            {act.metadata?.score !== undefined && <span>• Skor: <strong>{act.metadata.score}/100</strong></span>}
                          </div>
                        </div>
                        <span className="text-[11px] text-secondary-text font-mono shrink-0">
                          {formatTimestamp(act.created_at)}
                        </span>
                      </div>
                    );
                  })}
                  {activities.length === 0 && (
                    <p className="text-xs text-secondary-text text-center py-3">Belum ada aktivitas belajar tercatat.</p>
                  )}
                </div>
              </div>
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
