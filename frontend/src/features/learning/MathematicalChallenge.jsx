import React, { useState, useEffect } from 'react';
import MathView from '../../components/common/MathView';
import { useAuth } from '../../context/AuthContext';
import { voiceService } from '../../services/voiceService';
import { studentSyncService } from '../../services/studentSyncService';
import { apiService } from '../../services/api';
import {
  EVALUATION_QUESTIONS,
  getShuffledEvaluationQuestions,
  calculateEvaluationResult,
  normalizeEvaluationResult,
  CATEGORIES
} from './evaluationQuestions';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  BarChart3,
  Check,
  ListOrdered,
  HelpCircle,
  Flame,
  Volume2,
  X
} from 'lucide-react';

const EVAL_STORAGE_PREFIX = 'numora_evaluation_results_';

/**
 * Format tanggal dan waktu riwayat evaluasi secara aman.
 * Menghindari TypeError: Invalid option : timeStyle pada toLocaleDateString di mesin V8/browser.
 */
function formatEvaluationDate(timestamp) {
  if (!timestamp) return 'Waktu tidak tersedia';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Waktu tidak valid';
    return d.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (_) {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('id-ID');
    } catch {
      return 'Waktu tidak tersedia';
    }
  }
}

export default function MathematicalChallenge() {
  const { user } = useAuth();
  const studentId = user?.subjectId || 'S-002';
  const storageKey = `${EVAL_STORAGE_PREFIX}${studentId}`;

  // Mode: 'overview' | 'quiz' | 'result'
  const [viewMode, setViewMode] = useState('overview');

  // State Pengerjaan Kuis 10 Soal
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [historyResult, setHistoryResult] = useState(null);
  const [activeReviewFilter, setActiveReviewFilter] = useState('all'); // 'all' | 'wrong' | 'correct'
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewErrorMessage, setReviewErrorMessage] = useState('');

  // Buka pembahasan lengkap (baik via modal maupun beralih ke result view)
  const handleOpenReview = (target = historyResult || evaluationResult) => {
    setReviewErrorMessage('');
    const normalized = normalizeEvaluationResult(target);
    if (!normalized || !Array.isArray(normalized.questionReviews) || normalized.questionReviews.length === 0) {
      setReviewErrorMessage('Data pembahasan 10 soal untuk sesi ini tidak ditemukan. Silakan kerjakan evaluasi mandiri terlebih dahulu.');
      return;
    }
    setEvaluationResult(normalized);
    setIsReviewModalOpen(true);
    setViewMode('result');
    setTimeout(() => {
      const el = document.getElementById('evaluation-review-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Muat riwayat evaluasi siswa yang sedang aktif (prioritaskan sync cache terverifikasi)
  useEffect(() => {
    const evals = studentSyncService.getLocalEvaluations(user);
    if (evals && evals.length > 0) {
      setHistoryResult(normalizeEvaluationResult(evals[0]));
    } else {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setHistoryResult(normalizeEvaluationResult(parsed));
        }
      } catch (e) {
        console.warn('Gagal membaca riwayat evaluasi', e);
      }
    }
  }, [storageKey, user]);

  // Expose test hook untuk automasi pengujian
  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      window.__NUMORA_EVALUATION__ = {
        getQuestions: () => questions,
        getCurrentQuestion: () => questions[currentIndex],
        selectAnswer: (qId, answer) => {
          setSelectedAnswers(prev => ({ ...prev, [qId]: answer }));
        },
        submitQuiz: () => {
          const res = calculateEvaluationResult(selectedAnswers, questions);
          setEvaluationResult(res);
          setViewMode('result');
          studentSyncService.recordEvaluation(user, res);
          try {
            localStorage.setItem(storageKey, JSON.stringify(res));
          } catch (_) {}
          window.dispatchEvent(new Event('numora_evaluation_saved'));
          return res;
        },
        startQuiz: handleStartQuiz,
        openReview: handleOpenReview,
        isReviewModalOpen: () => isReviewModalOpen,
        closeReviewModal: () => setIsReviewModalOpen(false),
        normalizeResult: normalizeEvaluationResult,
        getState: () => ({ viewMode, currentIndex, selectedAnswers, evaluationResult, historyResult, isReviewModalOpen })
      };
    }
    return () => {
      if (import.meta.env.DEV && typeof window !== 'undefined') {
        delete window.__NUMORA_EVALUATION__;
      }
    };
  }, [questions, currentIndex, selectedAnswers, evaluationResult, historyResult, isReviewModalOpen, viewMode, storageKey, user]);

  // Mulai kuis: acak urutan soal (tetap 3+3+2+2)
  const handleStartQuiz = () => {
    const shuffled = getShuffledEvaluationQuestions();
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setEvaluationResult(null);
    setViewMode('quiz');
    if (user && user.subjectId !== 'S-001') {
      apiService.logLearningActivity({
        activity_type: 'EVALUATION_START',
        module_or_feature_id: 'EVALUATION_10_QUESTIONS',
        metadata: { total_questions: shuffled.length, time: new Date().toISOString() }
      }).catch(() => {});
    }
  };

  // Pilih jawaban
  const handleSelectOption = (optionText) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionText
    }));
  };

  // Selesaikan kuis & hitung nilai otomatis 0-100
  const handleFinishQuiz = () => {
    const result = calculateEvaluationResult(selectedAnswers, questions);
    setEvaluationResult(result);
    setViewMode('result');

    // Simpan hasil persisten ke backend server & local cache terisolasi per akun siswa
    studentSyncService.recordEvaluation(user, result);
    try {
      localStorage.setItem(storageKey, JSON.stringify(result));
      window.dispatchEvent(new Event('numora_evaluation_saved'));
    } catch (e) {
      console.warn('Gagal menyimpan hasil evaluasi ke storage', e);
    }
  };

  // Hitung jumlah soal yang telah dijawab
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Baca audio soal (aksesibilitas)
  const handleReadQuestion = (text) => {
    voiceService.speak(text);
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. VIEW MODE: OVERVIEW / INFORMASI AWAL EVALUASI                   */}
      {/* =================================================================== */}
      {viewMode === 'overview' && (
        <div className="space-y-6 animate-fade-page">
          {/* Hero Banner Evaluasi */}
          <div className="bg-pure-white rounded-3xl p-6 sm:p-8 border border-[#28332C]/14 shadow-card-clean relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sage/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/20 text-forest text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluasi Literasi Aljabar SMP Kelas VII</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                Evaluasi Mandiri 10 Soal Aljabar
              </h2>

              <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
                Uji pemahaman komprehensif konsep aljabar Kurikulum Merdeka. Soal dirancang untuk menguji nalar konseptual, mengenali variabel, koefisien, konstanta, dan bentuk aljabar tanpa hafalan mekanis.
              </p>

              {/* Info Distribusi 10 Soal Wajib */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-ivory border border-[#28332C]/14 text-center">
                  <span className="text-[10px] text-secondary-text font-semibold uppercase block">Variabel</span>
                  <span className="text-lg font-extrabold text-forest font-mono">3 Soal</span>
                </div>
                <div className="p-3 rounded-2xl bg-ivory border border-[#28332C]/14 text-center">
                  <span className="text-[10px] text-secondary-text font-semibold uppercase block">Koefisien</span>
                  <span className="text-lg font-extrabold text-forest font-mono">3 Soal</span>
                </div>
                <div className="p-3 rounded-2xl bg-ivory border border-[#28332C]/14 text-center">
                  <span className="text-[10px] text-secondary-text font-semibold uppercase block">Konstanta</span>
                  <span className="text-lg font-extrabold text-forest font-mono">2 Soal</span>
                </div>
                <div className="p-3 rounded-2xl bg-ivory border border-[#28332C]/14 text-center">
                  <span className="text-[10px] text-secondary-text font-semibold uppercase block">Bentuk Aljabar</span>
                  <span className="text-lg font-extrabold text-forest font-mono">2 Soal</span>
                </div>
              </div>

              {/* Tombol Mulai Evaluasi */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="btn-interactive py-3.5 px-8 rounded-2xl bg-forest hover:bg-forest-600 text-pure-white font-extrabold text-sm shadow-subtle flex items-center justify-center gap-2 transition"
                >
                  <ListOrdered className="w-4 h-4" />
                  <span>{historyResult ? 'Ulangi Evaluasi Mandiri' : 'Mulai Evaluasi Mandiri'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Riwayat Hasil Terakhir (Jika Ada) */}
          {historyResult && (
            <div className="bg-pure-white rounded-3xl p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#28332C]/14 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-terracotta" />
                  <h3 className="text-base font-bold text-charcoal">
                    Hasil Evaluasi Terakhir ({studentId})
                  </h3>
                </div>
                <span className="text-xs text-secondary-text">
                  {formatEvaluationDate(historyResult?.timestamp)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-ivory text-center border border-[#28332C]/14">
                  <span className="text-xs text-secondary-text block mb-1">Nilai Akhir</span>
                  <span className="text-3xl font-black text-forest font-mono">
                    {typeof historyResult?.score === 'number' ? historyResult.score : 'Tidak tersedia'}
                  </span>
                  <span className="text-[11px] text-secondary-text block mt-1">Skala 0 - 100</span>
                </div>

                <div className="p-4 rounded-2xl bg-ivory text-center border border-[#28332C]/14">
                  <span className="text-xs text-secondary-text block mb-1">Akurasi Jawaban</span>
                  <span className="text-2xl font-black text-charcoal font-mono">
                    {typeof historyResult?.correctCount === 'number' && typeof historyResult?.totalQuestions === 'number'
                      ? `${historyResult.correctCount} / ${historyResult.totalQuestions}`
                      : 'Data tidak lengkap'}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                    {typeof historyResult?.percentage === 'number'
                      ? `${historyResult.percentage}% Berhasil`
                      : 'Tidak tersedia'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-ivory text-center border border-[#28332C]/14">
                  <span className="text-xs text-secondary-text block mb-1">Status Penguasaan</span>
                  <span className="text-sm font-bold text-charcoal block mt-1">
                    {typeof historyResult?.score === 'number'
                      ? historyResult.score >= 80
                        ? '🌟 Sangat Menguasai'
                        : historyResult.score >= 60
                        ? '👍 Cukup Menguasai'
                        : '📚 Perlu Latihan'
                      : 'Data tidak lengkap'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenReview(historyResult)}
                    className="mt-2 text-xs text-forest font-semibold hover:underline inline-flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    title="Buka pembahasan lengkap 10 soal evaluasi"
                  >
                    <span>Lihat Pembahasan Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {reviewErrorMessage && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 text-left">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                      <span>{reviewErrorMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. VIEW MODE: QUIZ ACTIVE (10 SOAL PILIHAN GANDA)                   */}
      {/* =================================================================== */}
      {viewMode === 'quiz' && currentQuestion && (
        <div className="space-y-5 animate-fade-page">
          {/* Header Bar Kuis & Progres */}
          <div className="bg-pure-white rounded-2xl p-4 sm:p-5 border border-[#28332C]/14 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-forest text-pure-white font-extrabold text-sm flex items-center justify-center font-mono">
                {currentIndex + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-charcoal">
                    Soal {currentIndex + 1} dari {questions.length}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage/20 text-forest uppercase">
                    {currentQuestion.categoryTitle}
                  </span>
                </div>
                <span className="text-[11px] text-secondary-text">
                  Terjawab: {answeredCount} dari {questions.length} soal
                </span>
              </div>
            </div>

            {/* Progress Bar Persentase */}
            <div className="w-full sm:w-48 space-y-1 text-right">
              <div className="flex justify-between text-[11px] font-semibold text-secondary-text">
                <span>Progres</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-ivory rounded-full overflow-hidden border border-[#28332C]/14">
                <div
                  className="h-full bg-forest transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Kartu Pertanyaan Soal */}
          <div className="bg-pure-white rounded-3xl p-6 sm:p-8 border border-[#28332C]/14 shadow-card-clean space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base sm:text-lg font-bold text-charcoal leading-relaxed">
                  {currentQuestion.question}
                </p>
                <button
                  type="button"
                  onClick={() => handleReadQuestion(currentQuestion.question)}
                  className="p-2 rounded-xl text-secondary-text hover:text-forest hover:bg-sage/10 transition shrink-0"
                  title="Dengarkan Soal"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Tampilan Matematis LaTeX (MathView) */}
              {currentQuestion.expressionLatex && (
                <div className="p-4 rounded-2xl bg-ivory border border-[#28332C]/14 text-center font-mono text-lg font-bold text-forest">
                  <MathView math={currentQuestion.expressionLatex} />
                </div>
              )}
            </div>

            {/* Pilihan Jawaban A, B, C, D */}
            <div className="space-y-2.5 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const label = ['A', 'B', 'C', 'D'][idx];
                const isSelected = selectedAnswers[currentQuestion.id] === option;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`btn-interactive w-full p-4 rounded-2xl border-2 text-left font-semibold text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-forest bg-sage/15 text-forest shadow-xs'
                        : 'border-[#28332C]/14 bg-pure-white hover:bg-ivory text-charcoal'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-extrabold shrink-0 border ${
                          isSelected
                            ? 'bg-forest text-pure-white border-forest'
                            : 'bg-ivory text-secondary-text border-[#28332C]/20'
                        }`}
                      >
                        {label}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigasi Soal (Sebelumnya, Nomor Soal, Selanjutnya, Selesai) */}
            <div className="pt-4 border-t border-[#28332C]/14 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="btn-interactive flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-[#28332C]/14 text-xs font-semibold text-charcoal hover:bg-ivory disabled:opacity-40 transition flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="btn-interactive flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-[#28332C]/14 text-xs font-semibold text-charcoal hover:bg-ivory disabled:opacity-40 transition flex items-center justify-center gap-1.5"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Tombol Selesaikan Evaluasi */}
              <button
                type="button"
                onClick={handleFinishQuiz}
                className="btn-interactive w-full sm:w-auto py-2.5 px-6 rounded-xl bg-forest hover:bg-forest-600 text-pure-white text-xs font-bold shadow-subtle flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" />
                <span>Selesaikan Evaluasi</span>
              </button>
            </div>
          </div>

          {/* Palet Nomor Soal 1 - 10 (Quick Jump) */}
          <div className="bg-pure-white rounded-2xl p-4 border border-[#28332C]/14 shadow-subtle">
            <span className="text-[11px] font-bold text-secondary-text uppercase tracking-wider block mb-2.5">
              Daftar Nomor Soal (Klik untuk berpindah):
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(selectedAnswers[q.id]);
                const isCurrent = idx === currentIndex;

                let btnStyle = 'bg-ivory border-[#28332C]/14 text-secondary-text';
                if (isCurrent) {
                  btnStyle = 'bg-forest text-pure-white border-forest font-bold ring-2 ring-forest/30';
                } else if (isAnswered) {
                  btnStyle = 'bg-sage/20 border-sage/40 text-forest font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`btn-interactive py-2 rounded-xl border text-xs font-mono transition text-center ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. VIEW MODE: HASIL EVALUASI & ANALISIS 4 MATERI                    */}
      {/* =================================================================== */}
      {viewMode === 'result' && evaluationResult && (
        <div className="space-y-6 animate-fade-page">
          {/* Kartu Skor Utama */}
          <div className="bg-pure-white rounded-3xl p-6 sm:p-8 border border-[#28332C]/14 shadow-card-clean text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/20 text-forest text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Hasil Evaluasi Mandiri Siswa</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal">
              {typeof evaluationResult?.score === 'number' ? (
                <>
                  {evaluationResult.score} <span className="text-base text-secondary-text font-normal">/ 100 Poin</span>
                </>
              ) : (
                <span className="text-xl text-secondary-text">Data Skor Tidak Tersedia</span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-secondary-text max-w-md mx-auto">
              {typeof evaluationResult?.score === 'number'
                ? evaluationResult.score >= 80
                  ? 'Luar biasa! Kamu telah menguasai konsep dasar aljabar SMP Kelas VII dengan sangat baik.'
                  : evaluationResult.score >= 60
                  ? 'Bagus! Sebagian besar konsep sudah kamu pahami, perhatikan kembali beberapa materi yang keliru.'
                  : 'Tetap semangat! Pelajari kembali pembahasan di bawah ini dan latih konsep melalui simulasi Algebra Lab.'
                : 'Data evaluasi telah dimuat. Silakan periksa rincian pembahasan materi di bawah ini.'}
            </p>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              <div className="p-3 bg-ivory rounded-2xl border border-[#28332C]/14">
                <span className="text-[10px] text-secondary-text uppercase font-bold block">Benar</span>
                <span className="text-lg font-bold text-emerald-700 font-mono">
                  {typeof evaluationResult?.correctCount === 'number' ? `${evaluationResult.correctCount} Soal` : 'Tidak tersedia'}
                </span>
              </div>
              <div className="p-3 bg-ivory rounded-2xl border border-[#28332C]/14">
                <span className="text-[10px] text-secondary-text uppercase font-bold block">Salah</span>
                <span className="text-lg font-bold text-rose-700 font-mono">
                  {typeof evaluationResult?.wrongCount === 'number' ? `${evaluationResult.wrongCount} Soal` : 'Tidak tersedia'}
                </span>
              </div>
              <div className="p-3 bg-ivory rounded-2xl border border-[#28332C]/14">
                <span className="text-[10px] text-secondary-text uppercase font-bold block">Akurasi</span>
                <span className="text-lg font-bold text-forest font-mono">
                  {typeof evaluationResult?.percentage === 'number' ? `${evaluationResult.percentage}%` : 'Tidak tersedia'}
                </span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="btn-interactive py-2.5 px-5 rounded-xl bg-pure-white text-forest border border-forest/30 hover:border-forest text-xs font-bold shadow-subtle flex items-center justify-center gap-2 transition cursor-pointer"
                title="Buka pembahasan dalam tampilan modal penuh"
              >
                <BookOpen className="w-4 h-4 text-forest" />
                <span>Buka Modal Pembahasan</span>
              </button>
              <button
                type="button"
                onClick={handleStartQuiz}
                className="btn-interactive py-2.5 px-6 rounded-xl bg-forest hover:bg-forest-600 text-pure-white text-xs font-bold shadow-subtle flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Evaluasi Mandiri</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('overview')}
                className="btn-interactive py-2.5 px-5 rounded-xl bg-ivory text-charcoal border border-[#28332C]/14 text-xs font-bold hover:bg-sage/20 transition"
              >
                Kembali ke Beranda Evaluasi
              </button>
            </div>
          </div>

          {/* Analisis Penguasaan Per Materi (4 Materi Utama) */}
          <div className="bg-pure-white rounded-3xl p-6 sm:p-7 border border-[#28332C]/14 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 border-b border-[#28332C]/14 pb-3">
              <BarChart3 className="w-5 h-5 text-forest" />
              <h3 className="text-base font-bold text-charcoal">
                Analisis Penguasaan Empat Materi Aljabar
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(evaluationResult.categoryAnalysis || []).map((cat) => (
                <div key={cat.categoryKey} className="p-4 rounded-2xl bg-ivory border border-[#28332C]/14 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal">{cat.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.percentage >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : cat.percentage >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {cat.masteryStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondary-text font-mono">
                    <span>Benar: {cat.correct} dari {cat.total} soal</span>
                    <span className="font-bold text-charcoal">{cat.percentage}%</span>
                  </div>

                  {/* Bar Progres Materi */}
                  <div className="w-full h-1.5 bg-pure-white rounded-full overflow-hidden border border-[#28332C]/14">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cat.percentage >= 80 ? 'bg-forest' : cat.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-secondary-text pt-1 leading-relaxed">
                    <strong>Rekomendasi:</strong> {cat.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pembahasan Lengkap Seluruh 10 Soal */}
          <div id="evaluation-review-section" className="bg-pure-white rounded-3xl p-6 sm:p-7 border border-[#28332C]/14 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/14 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-forest" />
                <h3 className="text-base font-bold text-charcoal">
                  Pembahasan Lengkap 10 Soal Evaluasi
                </h3>
              </div>

              {/* Filter Pembahasan */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveReviewFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeReviewFilter === 'all'
                      ? 'bg-forest text-pure-white'
                      : 'bg-ivory text-secondary-text hover:text-charcoal'
                  }`}
                >
                  Semua ({Array.isArray(evaluationResult?.questionReviews) ? evaluationResult.questionReviews.length : 'Tidak tersedia'})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewFilter('wrong')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeReviewFilter === 'wrong'
                      ? 'bg-rose-600 text-pure-white'
                      : 'bg-ivory text-secondary-text hover:text-charcoal'
                  }`}
                >
                  Perlu Dipelajari ({typeof evaluationResult?.wrongCount === 'number' ? evaluationResult.wrongCount : 'Tidak tersedia'})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewFilter('correct')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeReviewFilter === 'correct'
                      ? 'bg-emerald-600 text-pure-white'
                      : 'bg-ivory text-secondary-text hover:text-charcoal'
                  }`}
                >
                  Benar ({typeof evaluationResult?.correctCount === 'number' ? evaluationResult.correctCount : 'Tidak tersedia'})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {(evaluationResult.questionReviews || [])
                .filter((r) => {
                  if (activeReviewFilter === 'wrong') return !r.isCorrect;
                  if (activeReviewFilter === 'correct') return r.isCorrect;
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border text-left space-y-3 ${
                      item.isCorrect
                        ? 'bg-pure-white border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                            item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.questionNumber}
                        </span>
                        <span className="text-xs font-bold text-charcoal">{item.categoryTitle}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Jawaban Benar</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Jawaban Belum Tepat</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-charcoal leading-relaxed">
                      {item.question}
                    </p>

                    {item.expressionLatex && (
                      <div className="p-2.5 rounded-xl bg-ivory text-center font-mono text-sm font-bold text-forest border border-[#28332C]/14">
                        <MathView math={item.expressionLatex} />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-ivory border border-[#28332C]/14">
                        <span className="text-[10px] text-secondary-text uppercase font-semibold block">Jawaban Kamu:</span>
                        <span className={`font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {item.chosenAnswer}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-ivory border border-[#28332C]/14">
                        <span className="text-[10px] text-secondary-text uppercase font-semibold block">Kunci Jawaban:</span>
                        <span className="font-semibold text-emerald-800">
                          {item.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Pembahasan Matematis */}
                    <div className="p-3 bg-ivory rounded-xl border border-[#28332C]/14 text-xs text-charcoal space-y-1">
                      <span className="font-bold text-forest flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Pembahasan Konsep:</span>
                      </span>
                      <p className="text-secondary-text leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MODAL PEMBAHASAN LENGKAP EVALUASI (DESKTOP & MOBILE)             */}
      {/* =================================================================== */}
      {isReviewModalOpen && evaluationResult && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-review-title"
          className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-page"
        >
          <div className="bg-pure-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#28332C]/14 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#28332C]/14 flex items-center justify-between gap-3 bg-ivory/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="modal-review-title" className="text-base sm:text-lg font-bold text-charcoal">
                    Pembahasan Lengkap 10 Soal Evaluasi
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-secondary-text">
                    <span>
                      Skor: <strong className="text-forest font-mono">{typeof evaluationResult?.score === 'number' ? `${evaluationResult.score} / 100` : 'Tidak tersedia'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Akurasi: <strong className="text-charcoal font-mono">{typeof evaluationResult?.percentage === 'number' ? `${evaluationResult.percentage}%` : 'Tidak tersedia'}</strong> (
                      {typeof evaluationResult?.correctCount === 'number' ? `${evaluationResult.correctCount} Benar` : 'Data tidak lengkap'},{' '}
                      {typeof evaluationResult?.wrongCount === 'number' ? `${evaluationResult.wrongCount} Salah` : 'Data tidak lengkap'})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="btn-interactive p-2 rounded-xl text-secondary-text hover:text-charcoal hover:bg-ivory transition-colors cursor-pointer"
                title="Tutup Pembahasan"
                aria-label="Tutup Pembahasan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs Toolbar */}
            <div className="px-4 sm:px-6 py-3 border-b border-[#28332C]/10 bg-pure-white flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveReviewFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeReviewFilter === 'all'
                      ? 'bg-forest text-pure-white shadow-subtle'
                      : 'bg-ivory text-secondary-text hover:text-charcoal'
                  }`}
                >
                  Semua ({Array.isArray(evaluationResult?.questionReviews) ? evaluationResult.questionReviews.length : 'Tidak tersedia'})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewFilter('wrong')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeReviewFilter === 'wrong'
                      ? 'bg-rose-600 text-pure-white shadow-subtle'
                      : 'bg-ivory text-secondary-text hover:text-charcoal'
                  }`}
                >
                  Perlu Dipelajari ({typeof evaluationResult?.wrongCount === 'number' ? evaluationResult.wrongCount : 'Tidak tersedia'})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewFilter('correct')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeReviewFilter === 'correct'
                      ? 'bg-emerald-600 text-pure-white shadow-subtle'
                      : 'bg-ivory text-secondary-text hover:text-charcoal'
                  }`}
                >
                  Benar ({typeof evaluationResult?.correctCount === 'number' ? evaluationResult.correctCount : 'Tidak tersedia'})
                </button>
              </div>

              <span className="text-[11px] text-secondary-text hidden sm:inline">
                Sesuai Kurikulum Merdeka SMP Kelas VII
              </span>
            </div>

            {/* Modal Scrollable Content: 10 Soal */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {(evaluationResult.questionReviews || [])
                .filter((r) => {
                  if (activeReviewFilter === 'wrong') return !r.isCorrect;
                  if (activeReviewFilter === 'correct') return r.isCorrect;
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border text-left space-y-3 shadow-xs ${
                      item.isCorrect
                        ? 'bg-pure-white border-emerald-200'
                        : 'bg-rose-50/30 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 ${
                            item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.questionNumber}
                        </span>
                        <span className="text-xs font-bold text-charcoal">{item.categoryTitle}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Jawaban Benar</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Jawaban Belum Tepat</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-charcoal leading-relaxed">
                      {item.question}
                    </p>

                    {item.expressionLatex && (
                      <div className="p-2.5 rounded-xl bg-ivory text-center font-mono text-sm font-bold text-forest border border-[#28332C]/14">
                        <MathView math={item.expressionLatex} />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`p-2.5 rounded-xl border ${item.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                        <span className="text-[10px] text-secondary-text uppercase font-semibold block">Jawaban Kamu:</span>
                        <span className={`font-semibold ${item.isCorrect ? 'text-emerald-800' : 'text-rose-700'}`}>
                          {item.chosenAnswer}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10px] text-secondary-text uppercase font-semibold block">Kunci Jawaban:</span>
                        <span className="font-semibold text-emerald-800">
                          {item.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Pembahasan Matematis */}
                    <div className="p-3 bg-ivory rounded-xl border border-[#28332C]/14 text-xs text-charcoal space-y-1.5">
                      <span className="font-bold text-forest flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-forest shrink-0" />
                        <span>Pembahasan Konsep & Langkah Penyelesaian:</span>
                      </span>
                      <p className="text-secondary-text leading-relaxed text-xs">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#28332C]/14 bg-ivory/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  handleStartQuiz();
                }}
                className="btn-interactive w-full sm:w-auto py-2.5 px-5 rounded-xl bg-forest hover:bg-forest-600 text-pure-white text-xs font-bold shadow-subtle flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Evaluasi Mandiri</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="btn-interactive w-full sm:w-auto py-2.5 px-5 rounded-xl bg-pure-white text-charcoal border border-[#28332C]/14 text-xs font-bold hover:bg-ivory transition cursor-pointer"
              >
                Tutup Pembahasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
