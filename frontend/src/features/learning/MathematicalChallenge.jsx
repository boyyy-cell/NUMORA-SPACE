import React, { useState } from 'react';
import MathView, { MathText } from '../../components/common/MathView';
import { apiService } from '../../services/api';
import { voiceService } from '../../services/voiceService';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ArrowRight
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
    hint: 'Tanda negatif di depan angka merupakan bagian utuh dari koefisiennya.',
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
        diagnosed_type: isCorrect ? 'Konsep Dikuasai' : 'Periksa Tanda Bilangan',
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
    <div className="bg-pure-white rounded-2xl p-6 border border-[#28332C]/20 shadow-card-clean space-y-5 animate-fade-page">
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

        <button
          onClick={() => handleVoice(`${currentChallenge.context} ${currentChallenge.question}`)}
          className="btn-interactive p-2 rounded-xl bg-ivory hover:bg-sage/20 text-forest border border-[#28332C]/20 flex items-center gap-1.5 text-xs self-start sm:self-auto transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span>Bacakan Soal</span>
        </button>
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
            placeholder="Tuliskan jawaban analisismu..."
            className="input-interactive flex-1 bg-ivory/60 border border-[#28332C]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-charcoal placeholder-secondary-text/60 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !userAnswer.trim()}
            className="btn-interactive px-5 py-2.5 rounded-xl font-semibold text-xs bg-forest text-pure-white hover:bg-forest-600 disabled:opacity-40 transition-colors shadow-subtle"
          >
            {isLoading ? 'Menganalisis...' : 'Periksa Jawaban'}
          </button>
        </div>
      </form>

      {/* Diagnostic Socratic Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border space-y-2 text-xs animate-in fade-in duration-200 ${
          feedback.is_correct
            ? 'bg-sage/15 border-sage/30 text-forest'
            : 'bg-terracotta/10 border-terracotta/30 text-terracotta'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {feedback.is_correct ? <CheckCircle2 className="w-4 h-4 text-forest" /> : <AlertCircle className="w-4 h-4 text-terracotta" />}
            <span>Diagnosis: {feedback.diagnosed_type}</span>
          </div>
          <p className="text-charcoal leading-relaxed">{feedback.feedback}</p>
          {feedback.recommended_hint && (
            <div className="p-2.5 rounded-lg bg-pure-white border border-[#28332C]/20 text-[11px] text-forest font-medium">
              💡 {feedback.recommended_hint}
            </div>
          )}

          {feedback.is_correct && (
            <div className="pt-1">
              <button
                onClick={handleNext}
                className="btn-interactive px-4 py-1.5 rounded-lg bg-forest text-pure-white font-semibold text-xs flex items-center gap-1.5 hover:bg-forest-600 transition-colors"
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
