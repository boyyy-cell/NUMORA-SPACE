import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  Lightbulb,
  RotateCcw,
  Bot,
  User,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import MathView from '../../components/common/MathView';
import { voiceService } from '../../services/voiceService';
import { apiService } from '../../services/api';

const MODES = [
  { id: 'explain', label: 'Explain (Jelaskan)', icon: BookOpen, desc: 'Penjelasan analogi visual dan konsep bermakna' },
  { id: 'ask', label: 'Ask (Tanya NORA)', icon: HelpCircle, desc: 'NORA mengajukan pertanyaan pemantik berpikir' },
  { id: 'hint', label: 'Hint (Petunjuk Bertahap)', icon: Lightbulb, desc: 'Petunjuk berjenjang tanpa membocorkan jawaban' },
  { id: 'review', label: 'Review (Konsolidasi)', icon: RotateCcw, desc: 'Ulas kembali pemahaman materi sebelumnya' },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'nora',
    text: 'Halo! Aku NORA, pendamping belajarmu di NUMORA Space. 👋\n\nKita tidak akan sekadar menghafal rumus, melainkan memahami apa makna di balik simbol aljabar seperti variabel $x$, koefisien pengali, dan konstanta tetap. Ada yang ingin kamu diskusikan hari ini?',
    math: '2x + 5 = 15',
    timestamp: '10:00',
    spokenText: 'Halo! Aku NORA, pendamping belajarmu di NUMORA Space. Ada yang ingin kamu diskusikan hari ini?'
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
    text: 'Pertanyaan yang sangat esensial! Coba ingat kembali definisi koefisien:\n\nKoefisien adalah bilangan atau angka yang menempel dan mengalikan variabel $x$. Pada bentuk $-5x$, tanda negatif (-) melekat pada angkanya. Jadi koefisiennya adalah -5, bukan 5.\n\nJika tandanya positif seperti $3x$, koefisiennya adalah 3. Pahamkah bedanya?',
    math: '-5x \\implies a = -5',
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
      // Call backend Socratic endpoint
      const response = await apiService.noraChat(userText, selectedMode, hintTier);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'nora',
          text: response.reply,
          math: response.math_latex,
          spokenText: response.voice_spoken_text || response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          flag: response.misconception_flag
        }
      ]);
    } catch (err) {
      // Fallback pedagogical Socratic response
      setTimeout(() => {
        let replyText = '';
        let mathExpr = null;
        let speech = '';

        if (selectedMode === 'hint') {
          replyText = `💡 [Mode Hint - Tahap ${hintTier}]\nMari kita telaah langkah demi langkah. Untuk memecahkan pertanyaanmu, coba ingat prinsip keseimbangan: apa pun yang kita lakukan di ruas kiri, harus kita perlakukan sama di ruas kanan. Apa langkah pertamamu?`;
          mathExpr = 'ax + b = c \\implies ax = c - b';
          speech = 'Mari kita telaah langkah demi langkah dengan prinsip keseimbangan timbangan aljabar.';
        } else if (selectedMode === 'ask') {
          replyText = `❓ [Pertanyaan Reflektif NORA]:\nJika nilai suatu variabel belum kita ketahui, menurutmu mengapa kita memilih menggunakan huruf seperti x atau y daripada membiarkannya kosong?`;
          mathExpr = 'x, y \\in \\mathbb{R}';
          speech = 'Pertanyaan reflektif NORA: mengapa kita memilih menggunakan huruf daripada membiarkannya kosong?';
        } else {
          replyText = `✨ [Mode ${selectedMode.toUpperCase()}]:\nAljabar adalah bahasa untuk memodelkan dunia nyata. Huruf x adalah wadah penampung nilai numerik yang fleksibel!`;
          mathExpr = '3x + 5 = 17';
          speech = 'Aljabar adalah bahasa untuk memodelkan dunia nyata. Huruf x adalah wadah penampung nilai.';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'nora',
            text: replyText,
            math: mathExpr,
            spokenText: speech,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 700);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`glass-card rounded-2xl flex flex-col overflow-hidden border border-numora-cyan/30 shadow-card-soft ${compact ? 'h-[500px]' : 'h-[640px]'}`}>
      {/* NORA Header */}
      <div className="p-4 bg-numora-surface/90 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-numora-cyan to-numora-violet flex items-center justify-center p-0.5 shadow-glow-cyan">
              <div className="w-full h-full rounded-full bg-numora-bg flex items-center justify-center">
                <Bot className="w-5 h-5 text-numora-cyan" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-numora-success rounded-full border-2 border-numora-bg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-numora-white text-sm">NORA Socratic AI Tutor</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-numora-cyan/15 text-numora-cyan border border-numora-cyan/30">
                Socratic Loop v1.5
              </span>
            </div>
            <p className="text-[11px] text-numora-muted">Bimbingan Daya Nalar Aljabar Berbahasa Indonesia</p>
          </div>
        </div>

        {/* Guardrail Info */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-numora-muted bg-numora-bg/60 px-2.5 py-1 rounded-xl border border-white/5">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>Anti-Spoiler Guardrail Active</span>
        </div>
      </div>

      {/* Mode Selector & Hint Tiers */}
      <div className="px-4 py-2.5 bg-numora-bg/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-numora-cyan/20 to-numora-violet/20 border border-numora-cyan/40 text-numora-white font-medium shadow-sm'
                    : 'text-numora-muted hover:text-numora-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-numora-cyan' : ''}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* If Mode is Hint: Show 3 Tiers */}
        {selectedMode === 'hint' && (
          <div className="flex items-center gap-1 bg-numora-surface/80 p-1 rounded-lg border border-white/10 text-[11px]">
            <span className="text-numora-muted px-1">Tahap:</span>
            {[1, 2, 3].map((t) => (
              <button
                key={t}
                onClick={() => setHintTier(t)}
                className={`px-2 py-0.5 rounded font-mono ${
                  hintTier === t
                    ? 'bg-numora-cyan text-numora-bg font-bold'
                    : 'text-numora-muted hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.sender === 'nora' ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-numora-cyan to-numora-violet flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-numora-bg" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-numora-surface border border-white/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-numora-muted" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-numora-violet/30 to-numora-cyan/20 border border-numora-violet/30 text-numora-white rounded-tr-none'
                  : 'bg-numora-surface/90 border border-white/10 text-numora-white/95 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">{msg.text}</p>

              {msg.math && (
                <div className="p-2 rounded-lg bg-numora-bg/70 border border-white/5 text-center my-1.5">
                  <MathView math={msg.math} block={true} className="text-numora-cyan" />
                </div>
              )}

              {msg.flag && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{msg.flag}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-numora-muted pt-1 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span>{msg.sender === 'nora' ? 'NORA' : 'Kamu'}</span>
                  <span>• {msg.timestamp}</span>
                </div>

                {msg.sender === 'nora' && (
                  <button
                    onClick={() => handleSpeak(msg.id, msg.spokenText || msg.text)}
                    className="flex items-center gap-1 text-numora-cyan hover:underline p-1 rounded hover:bg-white/5"
                    title="Dengarkan Suara NORA"
                  >
                    {activeSpeakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-numora-error" />
                        <span className="text-[10px] text-numora-error">Berhenti</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Dengar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-numora-cyan to-numora-violet flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-numora-bg" />
            </div>
            <div className="p-3 rounded-2xl bg-numora-surface/90 border border-white/10 text-numora-muted text-xs flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-numora-cyan animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-numora-cyan animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-numora-cyan animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>NORA sedang menganalisis alur penalaran...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 bg-numora-surface/90 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tanyakan konsep aljabar, misal: 'Apa koefisien dari -5x?'"
            className="flex-1 bg-numora-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-numora-white placeholder-numora-muted/60 focus:outline-none focus:border-numora-cyan/50 focus:ring-1 focus:ring-numora-cyan/50 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg font-bold text-xs hover:opacity-95 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4 text-numora-bg" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-numora-muted px-1">
          <span>🛡️ Protokol Sokratik: NORA membimbing tanpa membocorkan jawaban langsung.</span>
          <span className="font-mono text-numora-cyan/80">Active Socratic Mode</span>
        </div>
      </form>
    </div>
  );
}
