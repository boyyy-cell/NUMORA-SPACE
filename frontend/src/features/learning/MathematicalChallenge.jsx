import React, { useState } from 'react';
import MathView from '../../components/common/MathView';
import { apiService } from '../../services/api';
import { voiceService } from '../../services/voiceService';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

const CHALLENGES = [
  {
    id: 1,
    title: 'Tantangan 1: Mengidentifikasi Koefisien Bertanda Negatif',
    context: 'Dalam suatu simulasi penurunan suhu, perubahan nilai dinyatakan dalam bentuk aljabar -5x.',
    question: 'Berapakah nilai koefisien yang mengalikan variabel x dalam bentuk aljabar tersebut?',
    expression: '-5x',
    questionType: 'identify_coefficient',
    correctAnswer: '-5',
    pisaStage: 'FORMULATE & EMPLOY',
    hint: 'Ingat bahwa tanda positif atau negatif di depan bilangan merupakan bagian utuh dari koefisiennya.',
    explanationText: 'Pada bentuk -5x, koefisiennya adalah -5 karena angka yang melipatgandakan x adalah bilangan bulat negatif lima.'
  },
  {
    id: 2,
    title: 'Tantangan 2: Pengeluaran Buku dan Pensil',
    context: 'Aisyah membeli 4 buku tulis seharga Rp5.000 per buku dan sebuah tempat pensil seharga Rp6.000.',
    question: 'Jika model aljabarnya adalah 4x + 6 (dalam ribuan rupiah), berapa total biaya jika x = 5 (harga per buku 5 ribu)?',
    expression: '4x + 6',
    questionType: 'evaluate_substitution',
    correctAnswer: '26',
    pisaStage: 'INTERPRET',
    hint: 'Substitusikan nilai x = 5 ke dalam 4x + 6, hitung perkalian 4 × 5 terlebih dahulu sebelum menambahkan 6.',
    explanationText: 'Substitusi 4 dikali 5 menghasilkan 20, ditambah 6 menjadi 26 ribu rupiah.'
  }
];

export default function MathematicalChallenge() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const currentChallenge = CHALLENGES[currentIdx];

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
      setFeedback(res);
    } catch (err) {
      // Local fallback checking
      const isCorrect = userAnswer.trim().toLowerCase() === currentChallenge.correctAnswer.toLowerCase();
      setFeedback({
        is_correct: isCorrect,
        student_answer: userAnswer,
        diagnosed_type: isCorrect ? 'Concept Mastered' : 'Check Sign or Variable',
        feedback: isCorrect
          ? 'Tepat sekali! Jawabanmu benar secara konseptual.'
          : `Jawaban '${userAnswer}' belum tepat. Coba perhatikan petunjuk di bawah.`,
        recommended_hint: currentChallenge.hint
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoice = (text) => {
    voiceService.speak(text);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % CHALLENGES.length);
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-orchid-500/20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orchid-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Tantangan Literasi Matematis
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-apricot-500/15 text-apricot-300 border border-apricot-500/30">
              PISA Framework
            </span>
          </div>
          <h3 className="text-lg font-bold text-ivory-100 mt-1">
            {currentChallenge.title}
          </h3>
        </div>

        <button
          onClick={() => handleVoice(`${currentChallenge.context} ${currentChallenge.question}`)}
          className="p-2 rounded-xl bg-plum-900/60 hover:bg-plum-800/80 text-orchid-300 border border-orchid-500/20 flex items-center gap-1.5 text-xs self-start sm:self-auto transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span>Bacakan Soal</span>
        </button>
      </div>

      {/* Context Scenario */}
      <div className="p-4 rounded-xl bg-plum-950/70 border border-white/5 space-y-3 text-xs leading-relaxed">
        <p className="text-lavender-300">{currentChallenge.context}</p>
        <div className="p-3 rounded-lg bg-aubergine-900 border border-orchid-500/30 text-center font-mono text-orchid-300 font-bold text-sm">
          <MathView math={currentChallenge.expression} />
        </div>
        <p className="font-semibold text-ivory-100">{currentChallenge.question}</p>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Tuliskan jawaban analisismu..."
            className="flex-1 bg-plum-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-ivory-100 placeholder-lavender-300/60 focus:outline-none focus:border-orchid-400/50 focus:ring-1 focus:ring-orchid-400/50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !userAnswer.trim()}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-orchid-400 to-apricot-400 text-plum-950 hover:opacity-90 disabled:opacity-40 transition-opacity shadow-sm"
          >
            {isLoading ? 'Menganalisis...' : 'Periksa Jawaban'}
          </button>
        </div>
      </form>

      {/* Diagnostic Socratic Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border space-y-2 text-xs animate-in fade-in duration-300 ${
          feedback.is_correct
            ? 'bg-sage-500/15 border-sage-500/30 text-sage-300'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {feedback.is_correct ? <CheckCircle2 className="w-5 h-5 text-sage-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            <span>Diagnosis: {feedback.diagnosed_type}</span>
          </div>
          <p className="text-ivory-100/90 leading-relaxed">{feedback.feedback}</p>
          {feedback.recommended_hint && (
            <div className="p-2.5 rounded-lg bg-plum-950/70 border border-orchid-500/20 text-[11px] text-orchid-300">
              💡 {feedback.recommended_hint}
            </div>
          )}

          {feedback.is_correct && (
            <div className="pt-2">
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-sage-400 text-plum-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <span>Lanjut ke Tantangan Berikutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

