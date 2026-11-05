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
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-numora-cyan flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Tantangan Literasi Matematis
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-numora-violet/20 text-numora-violet border border-numora-violet/30">
              PISA Framework
            </span>
          </div>
          <h3 className="text-lg font-bold text-numora-white mt-1">
            {currentChallenge.title}
          </h3>
        </div>

        <button
          onClick={() => handleVoice(`${currentChallenge.context} ${currentChallenge.question}`)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-numora-cyan border border-white/10 flex items-center gap-1.5 text-xs self-start sm:self-auto"
        >
          <Volume2 className="w-4 h-4" />
          <span>Bacakan Soal</span>
        </button>
      </div>

      {/* Context Scenario */}
      <div className="p-4 rounded-xl bg-numora-bg/80 border border-white/5 space-y-3 text-xs leading-relaxed">
        <p className="text-numora-muted">{currentChallenge.context}</p>
        <div className="p-3 rounded-lg bg-numora-surface border border-numora-cyan/20 text-center font-mono text-numora-cyan font-bold text-sm">
          <MathView math={currentChallenge.expression} />
        </div>
        <p className="font-semibold text-numora-white">{currentChallenge.question}</p>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Tuliskan jawaban analisismu..."
            className="flex-1 bg-numora-bg/90 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-numora-white placeholder-numora-muted/60 focus:outline-none focus:border-numora-cyan/50 focus:ring-1 focus:ring-numora-cyan/50"
          />
          <button
            type="submit"
            disabled={isLoading || !userAnswer.trim()}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? 'Menganalisis...' : 'Periksa Jawaban'}
          </button>
        </div>
      </form>

      {/* Diagnostic Socratic Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border space-y-2 text-xs animate-in fade-in duration-300 ${
          feedback.is_correct
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {feedback.is_correct ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
            <span>Diagnosis: {feedback.diagnosed_type}</span>
          </div>
          <p className="text-numora-white/90 leading-relaxed">{feedback.feedback}</p>
          {feedback.recommended_hint && (
            <div className="p-2.5 rounded-lg bg-numora-bg/60 border border-white/5 text-[11px] text-numora-cyan">
              💡 {feedback.recommended_hint}
            </div>
          )}

          {feedback.is_correct && (
            <div className="pt-2">
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 text-numora-bg font-bold text-xs flex items-center gap-1.5 hover:opacity-90"
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

