import React, { useState } from 'react';
import {
  Send,
  HelpCircle,
  BookOpen,
  Lightbulb,
  RotateCcw,
  Bot,
  User,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import MathView from '../../components/common/MathView';
import { voiceService } from '../../services/voiceService';
import { apiService } from '../../services/api';

const MODES = [
  { id: 'explain', label: 'Jelaskan (Explain)', icon: BookOpen },
  { id: 'ask', label: 'Tanya (Ask)', icon: HelpCircle },
  { id: 'hint', label: 'Petunjuk (Hint)', icon: Lightbulb },
  { id: 'review', label: 'Ulas (Review)', icon: RotateCcw },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'nora',
    text: 'Halo! Aku NORA, tutor matematika pendampingmu. 👋\n\nKamu bisa berdiskusi tentang variabel, koefisien, atau cara menyelesaikan persamaan. Apa konsep yang ingin kamu pelajari hari ini?',
    math: '3x + 5 = 17',
    timestamp: '10:00',
    spokenText: 'Halo! Aku NORA, tutor pendampingmu di NUMORA Space. Apa yang ingin kamu diskusikan hari ini?'
  },
  {
    id: 2,
    sender: 'user',
    text: 'NORA, apa koefisien dari bentuk -5x?',
    timestamp: '10:01'
  },
  {
    id: 3,
    sender: 'nora',
    text: 'Pada bentuk -5x, koefisiennya adalah -5, bukan 5. Tanda negatif di depan angka merupakan bagian utuh dari koefisiennya.',
    math: '-5x \\implies a = -5',
    followUp: 'Pahamkah kamu bedanya jika bentuknya positif seperti 3x?',
    timestamp: '10:02',
    spokenText: 'Pada bentuk negatif 5 x, koefisiennya adalah negatif 5, bukan 5. Tanda negatif ikut melekat pada angkanya.'
  }
];

export default function NoraChatPreview({ compact = false }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState('explain');
  const [hintTier, setHintTier] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const handleSpeak = (id, text) => {
    if (activeSpeakingId === id) {
      voiceService.stop();
      setActiveSpeakingId(null);
      return;
    }

    setActiveSpeakingId(id);
    voiceService.speak(text, {
      onEnd: () => setActiveSpeakingId(null)
    });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await apiService.noraChat(userText, selectedMode, hintTier);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'nora',
          text: response.reply,
          math: response.math_latex,
          spokenText: response.voice_spoken_text || response.reply,
          followUp: selectedMode === 'ask' ? 'Coba tuliskan langkah analisismu selanjutnya.' : null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          flag: response.misconception_flag
        }
      ]);
    } catch (err) {
      // Natural, concise pedagogical Socratic fallback response (strictly 2-4 sentences)
      setTimeout(() => {
        let replyText = '';
        let mathExpr = null;
        let speech = '';
        let followUpQuestion = null;

        if (selectedMode === 'hint') {
          replyText = `Petunjuk Tahap ${hintTier}: Pada timbangan aljabar, kedua ruas harus selalu diperlakukan adil.`;
          mathExpr = 'ax + b = c \\implies ax = c - b';
          speech = 'Kedua ruas timbangan harus selalu diperlakukan adil.';
          followUpQuestion = 'Apa operasi pertama yang akan kamu lakukan di kedua ruas?';
        } else if (selectedMode === 'ask') {
          replyText = `Coba telaah kembali: mengapa kita menggunakan huruf x untuk melambangkan nilai yang belum diketahui?`;
          mathExpr = 'x \\in \\mathbb{R}';
          speech = 'Mengapa kita menggunakan huruf x untuk nilai yang belum diketahui?';
          followUpQuestion = 'Apakah nilai x selalu tetap atau bisa berubah?';
        } else {
          replyText = `Aljabar adalah bahasa untuk memodelkan persoalan nyata ke dalam lambang matematika. Huruf x adalah wadah penampung nilai!`;
          mathExpr = '3x + 5 = 17';
          speech = 'Aljabar adalah bahasa untuk memodelkan persoalan nyata.';
          followUpQuestion = 'Ingin mencoba contoh latihan substitusi bersama?';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'nora',
            text: replyText,
            math: mathExpr,
            spokenText: speech,
            followUp: followUpQuestion,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectFollowUp = (question) => {
    setInputValue(question);
  };

  return (
    <div className={`bg-pure-white rounded-2xl flex flex-col overflow-hidden border border-border-clean shadow-card-clean ${compact ? 'h-[460px]' : 'h-[580px]'}`}>
      {/* NORA Header */}
      <div className="p-4 bg-pure-white border-b border-border-clean flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-forest/10 border border-forest/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-forest" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-forest rounded-full border-2 border-pure-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-charcoal text-sm">NORA Tutor Sokratik</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage/20 text-forest border border-sage/30">
                Online
              </span>
            </div>
            <p className="text-[11px] text-secondary-text">Pendamping Berpikir Matematika Aljabar</p>
          </div>
        </div>

        {/* Anti-spoiler guardrail badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-secondary-text bg-ivory px-3 py-1 rounded-xl border border-border-clean">
          <ShieldCheck className="w-3.5 h-3.5 text-forest" />
          <span>Bimbingan Bernalar</span>
        </div>
      </div>

      {/* Mode Selector & Hint Tiers */}
      <div className="px-4 py-2.5 bg-ivory border-b border-border-clean flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-forest text-pure-white font-semibold shadow-subtle'
                    : 'text-secondary-text hover:text-charcoal hover:bg-pure-white border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* If Mode is Hint: Show 3 Tiers */}
        {selectedMode === 'hint' && (
          <div className="flex items-center gap-1 bg-pure-white px-2 py-1 rounded-lg border border-border-clean text-[11px]">
            <span className="text-secondary-text">Tahap:</span>
            {[1, 2, 3].map((t) => (
              <button
                key={t}
                onClick={() => setHintTier(t)}
                className={`px-2 py-0.5 rounded font-semibold ${
                  hintTier === t
                    ? 'bg-forest text-pure-white'
                    : 'text-secondary-text hover:text-charcoal'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-sm bg-ivory/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.sender === 'nora' ? (
              <div className="w-7 h-7 rounded-full bg-forest text-pure-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-charcoal text-pure-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 shadow-subtle ${
                msg.sender === 'user'
                  ? 'bg-forest text-pure-white rounded-tr-none'
                  : 'bg-pure-white border border-border-clean text-charcoal rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">{msg.text}</p>

              {msg.math && (
                <div className={`p-2 rounded-lg text-center font-mono my-1 border ${
                  msg.sender === 'user'
                    ? 'bg-forest-600 text-pure-white border-forest-500'
                    : 'bg-ivory text-forest font-semibold border-border-clean'
                }`}>
                  <MathView math={msg.math} block={true} />
                </div>
              )}

              {/* One Single Follow-up Question at a Time */}
              {msg.followUp && (
                <div
                  onClick={() => handleSelectFollowUp(msg.followUp)}
                  className="mt-2 p-2 rounded-xl bg-sage/15 border border-sage/30 text-[11px] text-forest font-medium cursor-pointer hover:bg-sage/25 transition-colors flex items-center justify-between"
                >
                  <span>💡 Pertanyaan lanjutan: <strong>{msg.followUp}</strong></span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-1.5" />
                </div>
              )}

              {msg.flag && (
                <div className="p-2 rounded-lg bg-terracotta/10 border border-terracotta/30 text-[11px] text-terracotta flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{msg.flag}</span>
                </div>
              )}

              <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                msg.sender === 'user' ? 'border-forest-600 text-pure-white/70' : 'border-border-clean text-secondary-text'
              }`}>
                <span>{msg.sender === 'nora' ? 'NORA' : 'Kamu'} • {msg.timestamp}</span>

                {msg.sender === 'nora' && (
                  <button
                    onClick={() => handleSpeak(msg.id, msg.spokenText || msg.text)}
                    className="flex items-center gap-1 text-forest hover:underline p-0.5 rounded"
                    title="Dengarkan Suara NORA"
                  >
                    {activeSpeakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-rose-600">Berhenti</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Dengar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-forest text-pure-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-pure-white border border-border-clean text-secondary-text text-xs flex items-center gap-2 shadow-subtle">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>NORA sedang menganalisis alur bernalar...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 bg-pure-white border-t border-border-clean">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tanyakan konsep aljabar, misal: 'Apa arti tanda negatif pada -5x?'"
            className="flex-1 bg-ivory border border-border-clean rounded-xl px-4 py-2.5 text-xs sm:text-sm text-charcoal placeholder-secondary-text/60 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-forest text-pure-white font-semibold text-xs hover:bg-forest-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-subtle"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>
      </form>
    </div>
  );
}
