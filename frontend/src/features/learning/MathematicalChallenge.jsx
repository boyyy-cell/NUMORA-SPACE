import React, { useState, useEffect } from 'react';
import MathView from '../../components/common/MathView';
import { apiService } from '../../services/api';
import { voiceService } from '../../services/voiceService';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check
} from 'lucide-react';

const CHALLENGES = [
  {
    id: 1,
    moduleId: 'modul-1',
    moduleTitle: 'Modul 1: Variabel',
    title: 'Tantangan 1: Mengidentifikasi Lambang Variabel',
    context: 'Di sebuah toko alat tulis, paket bundling pensil dan penghapus dimodelkan dalam bentuk aljabar 7a + 12.',
    question: 'Tentukan lambang huruf yang berperan sebagai variabel dalam bentuk aljabar tersebut!',
    expression: '7a + 12',
    questionType: 'identify_variable',
    correctAnswer: 'a',
    placeholder: 'Tuliskan lambang huruf variabelmu (contoh: a)...',
    pisaStage: 'FORMULATE',
    hint: 'Variabel adalah lambang berupa huruf yang mewakili nilai yang belum diketahui atau dapat berubah.',
    explanationText: 'Pada bentuk 7a + 12, huruf a adalah variabel penampung nilai, sedangkan 7 adalah koefisien dan 12 adalah konstanta.'
  },
  {
    id: 2,
    moduleId: 'modul-2',
    moduleTitle: 'Modul 2: Koefisien',
    title: 'Tantangan 2: Mengidentifikasi Koefisien Bertanda Negatif',
    context: 'Dalam simulasi laboratorium penurunan suhu beku, perubahan nilai per menit dinyatakan dalam bentuk aljabar -5x.',
    question: 'Berapakah nilai bilangan koefisien yang mengalikan variabel x dalam bentuk aljabar tersebut?',
    expression: '-5x',
    questionType: 'identify_coefficient',
    correctAnswer: '-5',
    placeholder: 'Tuliskan angka koefisien beserta tandanya (contoh: -5)...',
    pisaStage: 'EMPLOY',
    hint: 'Tanda negatif (-) di depan angka merupakan bagian utuh dari nilai koefisiennya.',
    explanationText: 'Pada bentuk -5x, koefisiennya adalah -5 karena angka yang melipatgandakan variabel x adalah bilangan bulat negatif lima.'
  },
  {
    id: 3,
    moduleId: 'modul-3',
    moduleTitle: 'Modul 3: Konstanta',
    title: 'Tantangan 3: Mengidentifikasi Nilai Konstanta Bertanda Negatif',
    context: 'Saldo tabungan harian dinyatakan dalam bentuk aljabar 3x - 8 setelah dipotong biaya administrasi tetap.',
    question: 'Berapakah nilai bilangan yang berperan sebagai konstanta pada bentuk aljabar 3x - 8?',
    expression: '3x - 8',
    questionType: 'identify_constant',
    correctAnswer: '-8',
    placeholder: 'Tuliskan angka konstanta beserta tandanya (contoh: -8)...',
    pisaStage: 'FORMULATE & EMPLOY',
    hint: 'Perhatikan tanda pengurangan di depan angka 8. Konstanta mandiri tersebut bernilai negatif.',
    explanationText: 'Pengurangan 8 setara dengan penjumlahan (-8). Sehingga nilai konstanta mandirinya adalah -8.'
  },
  {
    id: 4,
    moduleId: 'modul-4',
    moduleTitle: 'Modul 4: Bentuk Aljabar & Nilai Evaluasi',
    title: 'Tantangan 4: Evaluasi Substitusi Nilai Model Nyata',
    context: 'Aisyah membeli 4 buku tulis seharga x ribu rupiah per buku dan sebuah tempat pensil seharga 6 ribu rupiah.',
    question: 'Jika model matematikanya adalah 4x + 6, berapa total biaya yang harus dibayar (dalam ribuan rupiah) jika harga satu buku adalah x = 5?',
    expression: '4x + 6',
    questionType: 'evaluate_substitution',
    correctAnswer: '26',
    placeholder: 'Tuliskan angka hasil akhir perhitunganmu (contoh: 26)...',
    pisaStage: 'INTERPRET',
    hint: 'Substitusi x = 5 ke bentuk 4x + 6. Kalikan 4 × 5 terlebih dahulu, lalu tambahkan dengan 6.',
    explanationText: 'Substitusi 4(5) + 6 = 20 + 6 = 26 (total biaya Rp26.000).'
  }
];

export default function MathematicalChallenge() {
  const { user } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);

  const storageKey = `numora_eval_results_${user?.email || user?.subjectId || 'guest'}`;

  // Load previous persisted results for the current student & ensure account isolation
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.score === 'number') {
          setPreviousResult(parsed);
        } else {
          setPreviousResult(null);
        }
      } else {
        setPreviousResult(null);
      }
    } catch (e) {
      console.warn('Gagal membaca riwayat evaluasi', e);
      setPreviousResult(null);
    }
    // Reset transient session state when active user switches
    setAnswers({});
    setFeedbacks({});
    setCurrentIdx(0);
    setUserAnswer('');
    setShowSummary(false);
  }, [storageKey]);

  const currentChallenge = CHALLENGES[currentIdx];
  const currentFeedback = feedbacks[currentChallenge.id];
  const totalQuestions = CHALLENGES.length;

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!userAnswer.trim()) return;

    setIsLoading(true);
    try {
      const res = await apiService.diagnoseMisconception(
        currentChallenge.questionType,
        currentChallenge.expression,
        userAnswer
      );

      const updatedFeedbacks = {
        ...feedbacks,
        [currentChallenge.id]: res
      };
      const updatedAnswers = {
        ...answers,
        [currentChallenge.id]: userAnswer.trim()
      };

      setFeedbacks(updatedFeedbacks);
      setAnswers(updatedAnswers);
    } catch (err) {
      // Local fallback checking
      const isCorrect = userAnswer.trim().toLowerCase() === currentChallenge.correctAnswer.toLowerCase();
      const fallbackRes = {
        is_correct: isCorrect,
        student_answer: userAnswer,
        diagnosed_type: isCorrect ? 'Konsep Dikuasai (Benar)' : 'Perlu Pendalaman Konsep',
        feedback: isCorrect
          ? 'Tepat sekali! Jawabanmu benar secara konseptual.'
          : `Jawaban '${userAnswer}' belum tepat untuk soal ini. ${currentChallenge.explanationText}`,
        recommended_hint: currentChallenge.hint
      };

      const updatedFeedbacks = {
        ...feedbacks,
        [currentChallenge.id]: fallbackRes
      };
      const updatedAnswers = {
        ...answers,
        [currentChallenge.id]: userAnswer.trim()
      };

      setFeedbacks(updatedFeedbacks);
      setAnswers(updatedAnswers);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setUserAnswer(answers[CHALLENGES[nextIdx].id] || '');
    } else {
      // Finished all questions -> generate summary and persist
      finishEvaluation();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      setUserAnswer(answers[CHALLENGES[prevIdx].id] || '');
    }
  };

  const finishEvaluation = () => {
    // Calculate final metrics
    let correctCount = 0;
    const details = [];

    CHALLENGES.forEach((ch) => {
      const fb = feedbacks[ch.id];
      const isCorrect = fb?.is_correct || false;
      if (isCorrect) correctCount += 1;

      details.push({
        id: ch.id,
        moduleTitle: ch.moduleTitle,
        title: ch.title,
        expression: ch.expression,
        correctAnswer: ch.correctAnswer,
        studentAnswer: answers[ch.id] || '(Belum dijawab)',
        isCorrect,
        diagnosedType: fb?.diagnosed_type || 'Belum diuji',
        feedback: fb?.feedback || ch.explanationText
      });
    });

    const score = Math.round((correctCount / totalQuestions) * 100);

    // Formulate learning recommendations based on missed concepts
    const recommendations = [];
    details.forEach((d) => {
      if (!d.isCorrect) {
        recommendations.push({
          module: d.moduleTitle,
          advice: `Pelajari kembali materi ${d.moduleTitle}: fokus pada pemahaman konsep dasar dan tanda bilangan.`
        });
      }
    });

    const record = {
      score,
      correctCount,
      totalQuestions,
      completedAt: new Date().toISOString(),
      details,
      recommendations
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(record));
      setPreviousResult(record);
    } catch (e) {
      console.warn('Gagal menyimpan hasil evaluasi', e);
    }

    setShowSummary(true);
  };

  const handleRestart = () => {
    setAnswers({});
    setFeedbacks({});
    setCurrentIdx(0);
    setUserAnswer('');
    setShowSummary(false);
  };

  const handleVoice = (text) => {
    voiceService.speak(text);
  };

  // SUMMARY SCREEN
  if (showSummary && previousResult) {
    const { score, correctCount, details, recommendations } = previousResult;
    const isMastered = score >= 75;

    return (
      <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/20 shadow-card-clean space-y-6 animate-fade-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isMastered ? 'bg-sage/20 text-forest' : 'bg-terracotta/15 text-terracotta'
            }`}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                  Hasil Evaluasi Literasi
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sage/20 text-forest border border-sage/30">
                  PISA Framework
                </span>
              </div>
              <h3 className="text-lg font-bold text-charcoal">
                {isMastered ? 'Pemahaman Konseptual Baik!' : 'Tinjauan Penguasaan Aljabar'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="btn-interactive px-4 py-2 rounded-xl bg-ivory hover:bg-sage/20 text-forest border border-[#28332C]/20 flex items-center gap-2 text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Evaluasi</span>
          </button>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/20 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-secondary-text font-medium mb-1">Skor Akhir</span>
            <span className="text-3xl font-extrabold text-forest">{score}</span>
            <span className="text-[11px] text-secondary-text mt-0.5">dari 100 poin</span>
          </div>

          <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/20 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-secondary-text font-medium mb-1">Akurasi Soal</span>
            <span className="text-2xl font-bold text-charcoal">{correctCount} / {totalQuestions}</span>
            <span className="text-[11px] text-forest font-semibold mt-0.5">
              {Math.round((correctCount / totalQuestions) * 100)}% Jawaban Benar
            </span>
          </div>

          <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/20 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-secondary-text font-medium mb-1">Status Penguasaan</span>
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
              isMastered
                ? 'bg-sage/30 text-forest'
                : 'bg-terracotta/15 text-terracotta'
            }`}>
              {isMastered ? 'Memenuhi Standar' : 'Perlu Pendalaman'}
            </span>
            <span className="text-[11px] text-secondary-text mt-1">4 Modul Dasar</span>
          </div>
        </div>

        {/* Diagnostic Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
            <Check className="w-4 h-4 text-forest" />
            <span>Rincian Diagnostik Butir Soal</span>
          </h4>
          <div className="space-y-2.5">
            {details.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-pure-white border border-[#28332C]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">Soal {idx + 1}: {item.title}</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-ivory border border-[#28332C]/10 text-forest font-semibold">
                      {item.expression}
                    </span>
                  </div>
                  <p className="text-secondary-text leading-relaxed text-[11px]">
                    Jawabanmu: <span className="font-semibold text-charcoal">{item.studentAnswer}</span> | Kunci: <span className="font-semibold text-forest">{item.correctAnswer}</span>
                  </p>
                  <p className="text-secondary-text text-[11px] italic">
                    {item.feedback}
                  </p>
                </div>

                <div className="self-start sm:self-center shrink-0">
                  <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] inline-flex items-center gap-1 ${
                    item.isCorrect
                      ? 'bg-sage/20 text-forest border border-sage/30'
                      : 'bg-terracotta/10 text-terracotta border border-terracotta/30'
                  }`}>
                    {item.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{item.diagnosedType}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conceptual Learning Recommendations */}
        {recommendations.length > 0 ? (
          <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/20 space-y-2">
            <div className="flex items-center gap-2 text-forest font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Rekomendasi Pemantapan Konsep Aljabar</span>
            </div>
            <ul className="space-y-1.5 text-xs text-charcoal pl-5 list-disc">
              {recommendations.map((rec, rIdx) => (
                <li key={rIdx} className="leading-relaxed">
                  <span className="font-semibold">{rec.module}:</span> {rec.advice}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-sage/15 border border-sage/30 text-forest text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Pemahaman Konsep Lengkap</span>
            </div>
            <p className="leading-relaxed">
              Selamat! Kamu telah menguasai seluruh konsep dasar aljabar kelas VII (variabel, koefisien, konstanta, dan substitusi aljabar) tanpa terdeteksi miskonsepsi tanda bilangan.
            </p>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRestart}
            className="btn-interactive px-5 py-2 rounded-xl bg-forest text-pure-white font-semibold text-xs flex items-center gap-2 hover:bg-forest-600 transition-colors shadow-subtle"
          >
            <span>Kembali ke Soal Pertama</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  return (
    <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/20 shadow-card-clean space-y-5 animate-fade-page">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Tantangan Literasi Matematika
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sage/20 text-forest border border-sage/30">
              PISA Framework
            </span>
          </div>
          <h3 className="text-base font-bold text-charcoal mt-1">
            {currentChallenge.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {previousResult && (
            <button
              onClick={() => setShowSummary(true)}
              className="btn-interactive px-2.5 py-1.5 rounded-xl bg-sage/20 hover:bg-sage/30 text-forest border border-sage/30 flex items-center gap-1.5 text-xs font-medium transition-colors"
              title="Lihat hasil evaluasi terakhir"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hasil Sebelumnya ({previousResult.score})</span>
            </button>
          )}

          <button
            onClick={() => handleVoice(`${currentChallenge.context} ${currentChallenge.question}`)}
            className="btn-interactive p-2 rounded-xl bg-ivory hover:bg-sage/20 text-forest border border-[#28332C]/20 flex items-center gap-1.5 text-xs transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Bacakan Soal</span>
          </button>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-secondary-text font-medium">
          Soal <strong className="text-charcoal">{currentIdx + 1}</strong> dari {totalQuestions}
        </span>
        <div className="flex items-center gap-1.5">
          {CHALLENGES.map((ch, idx) => {
            const isAnswered = Boolean(feedbacks[ch.id]);
            const isCurrent = idx === currentIdx;
            const isCorrect = feedbacks[ch.id]?.is_correct;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setUserAnswer(answers[ch.id] || '');
                }}
                className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'ring-2 ring-forest bg-forest text-pure-white'
                    : isAnswered
                    ? isCorrect
                      ? 'bg-sage/40 text-forest border border-forest/30'
                      : 'bg-terracotta/20 text-terracotta border border-terracotta/40'
                    : 'bg-ivory text-secondary-text border border-[#28332C]/20 hover:bg-sage/20'
                }`}
                title={`Soal ${idx + 1}: ${ch.title}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Context Scenario */}
      <div className="p-4 rounded-xl bg-ivory border border-[#28332C]/20 space-y-3 text-xs leading-relaxed">
        <p className="text-secondary-text">{currentChallenge.context}</p>
        <div className="p-2.5 rounded-lg bg-pure-white border border-[#28332C]/20 text-center font-mono text-forest font-bold text-sm shadow-subtle">
          <MathView math={currentChallenge.expression} />
        </div>
        <p className="font-semibold text-charcoal">{currentChallenge.question}</p>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={currentChallenge.placeholder}
            className="input-interactive flex-1 bg-ivory/60 border border-[#28332C]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-charcoal placeholder-secondary-text/60 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !userAnswer.trim()}
            className="btn-interactive px-5 py-2.5 rounded-xl font-semibold text-xs bg-forest text-pure-white hover:bg-forest-600 disabled:opacity-40 transition-colors shadow-subtle shrink-0"
          >
            {isLoading ? 'Menganalisis...' : 'Periksa Jawaban'}
          </button>
        </div>
      </form>

      {/* Diagnostic Socratic Feedback */}
      {currentFeedback && (
        <div className={`p-4 rounded-xl border space-y-2 text-xs animate-in fade-in duration-200 ${
          currentFeedback.is_correct
            ? 'bg-sage/15 border-sage/30 text-forest'
            : 'bg-terracotta/10 border-terracotta/30 text-terracotta'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {currentFeedback.is_correct ? (
              <CheckCircle2 className="w-4 h-4 text-forest" />
            ) : (
              <AlertCircle className="w-4 h-4 text-terracotta" />
            )}
            <span>Diagnosis: {currentFeedback.diagnosed_type}</span>
          </div>
          <p className="text-charcoal leading-relaxed">{currentFeedback.feedback}</p>
          {currentFeedback.recommended_hint && (
            <div className="p-2.5 rounded-lg bg-pure-white border border-[#28332C]/20 text-[11px] text-forest font-medium">
              💡 {currentFeedback.recommended_hint}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="btn-interactive px-3 py-1.5 rounded-lg bg-pure-white border border-[#28332C]/20 text-charcoal font-semibold text-xs flex items-center gap-1 hover:bg-ivory disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={handleNext}
              className="btn-interactive px-4 py-1.5 rounded-lg bg-forest text-pure-white font-semibold text-xs flex items-center gap-1.5 hover:bg-forest-600 transition-colors"
            >
              <span>{currentIdx < totalQuestions - 1 ? 'Lanjut ke Soal Berikutnya' : 'Lihat Ringkasan Evaluasi'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
