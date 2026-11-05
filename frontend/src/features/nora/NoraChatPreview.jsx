import React, { useState } from 'react';
import { Sparkles, Send, HelpCircle, BookOpen, Lightbulb, RotateCcw, Bot, User, CheckCircle2 } from 'lucide-react';
import MathView from '../../components/common/MathView';

const MODES = [
  { id: 'explain', label: 'Explain (Jelaskan)', icon: BookOpen, desc: 'Penjelasan konsep secara visual dan intuitif' },
  { id: 'ask', label: 'Ask (Tanya NORA)', icon: HelpCircle, desc: 'Ajukan pertanyaan apa pun seputar aljabar' },
  { id: 'hint', label: 'Hint (Petunjuk)', icon: Lightbulb, desc: 'Petunjuk bertahap tanpa spoiler jawaban langsung' },
  { id: 'review', label: 'Review (Evaluasi)', icon: RotateCcw, desc: 'Ulas kembali pemahaman materi sebelumnya' },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'nora',
    text: 'Halo! Aku NORA, pendamping belajarmu di NUMORA Space. 👋\n\nKita tidak akan sekadar menghafal rumus, tapi memahami apa makna sebenarnya di balik simbol aljabar seperti $x$, koefisien, dan konstanta. Ada yang ingin kamu diskusikan hari ini?',
    math: '2x + 5 = 15',
    timestamp: '10:00'
  },
  {
    id: 2,
    sender: 'user',
    text: 'NORA, apa bedanya koefisien sama konstanta dalam bentuk aljabar 3x + 7?',
    timestamp: '10:01'
  },
  {
    id: 3,
    sender: 'nora',
    text: 'Pertanyaan bagus! Bayangkan kamu membeli buah di pasar:\n\n• Angka 3 adalah Koefisien: ia melekat dan melipatgandakan variabel $x$ (misal 3 kantong buah yang isinya belum diketahui).\n• Angka 7 adalah Konstanta: nilainya tetap dan mandiri, tidak berubah apa pun isi kantong buahnya (misal biaya parkir Rp 7.000).\n\nCoba tebak, jika ada bentuk aljabar $5y - 4$, manakah konstantanya?',
    math: '3x + 7',
    timestamp: '10:02'
  }
];

export default function NoraChatPreview({ compact = false }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState('explain');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
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

    // Simulated pedagogical response from NORA
    setTimeout(() => {
      let replyText = '';
      let mathExpr = null;

      if (selectedMode === 'hint') {
        replyText = `💡 [Mode Hint - DEMO]\nMari kita telaah langkah demi langkah. Untuk memecahkan pertanyaanmu, coba ingat prinsip keseimbangan timbangan aljabar: apa pun yang kita lakukan di ruas kiri, harus kita perlakukan sama di ruas kanan. Apa langkah pertamamu?`;
        mathExpr = 'ax + b = c \\implies ax = c - b';
      } else if (selectedMode === 'review') {
        replyText = `🎯 [Mode Review - DEMO]\nBagus sekali! Mari kita cek kembali: pada bentuk aljabar, variabel melambangkan nilai yang belum pasti, sedangkan koefisien adalah faktor pengalinya. Sudah siap menguji dengan soal interaktif?`;
        mathExpr = '4x + 9';
      } else {
        replyText = `✨ [Mode ${selectedMode.toUpperCase()} - DEMO]\nAku mendengarmu! Dalam aljabar, pemahaman konsep jauh lebih berharga daripada langsung melihat hasil akhir. Coba bayangkan variabel sebagai wadah misteri. Jika kita punya beberapa wadah sejenis, kita bisa menggabungkannya!`;
        mathExpr = '2x + 3x = 5x';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'nora',
          text: replyText,
          math: mathExpr,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className={`glass-card rounded-2xl flex flex-col overflow-hidden border border-numora-cyan/20 shadow-glow-cyan/10 ${compact ? 'h-[480px]' : 'h-[620px]'}`}>
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
              <h3 className="font-semibold text-numora-white text-sm">NORA AI Tutor</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-numora-cyan/15 text-numora-cyan border border-numora-cyan/30">
                DEMO MODE
              </span>
            </div>
            <p className="text-[11px] text-numora-muted">Pendamping Aljabar Interaktif SMP Kelas VII</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-numora-muted bg-numora-bg/60 px-2.5 py-1 rounded-lg border border-white/5">
          <Sparkles className="w-3.5 h-3.5 text-numora-violet" />
          <span>Socratic Guided Learning</span>
        </div>
      </div>

      {/* Interaction Mode Selector */}
      <div className="px-4 py-2 bg-numora-bg/50 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-numora-muted text-[11px] mr-1 hidden md:inline">Mode:</span>
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
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

      {/* Chat Messages Body */}
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
              <div className="flex items-center justify-between text-[10px] text-numora-muted pt-1">
                <span>{msg.sender === 'nora' ? 'NORA' : 'Kamu'}</span>
                <span>{msg.timestamp}</span>
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
              <span>NORA sedang memformulasikan bimbingan...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-numora-surface/90 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tanyakan konsep variabel, koefisien, atau konstanta..."
            className="flex-1 bg-numora-bg/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-numora-white placeholder-numora-muted focus:outline-none focus:border-numora-cyan/50 focus:ring-1 focus:ring-numora-cyan/50 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-numora-cyan to-numora-violet text-numora-bg font-semibold hover:opacity-95 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4 text-numora-bg" />
            <span className="text-xs hidden sm:inline font-bold">Kirim</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-numora-muted px-1">
          <span>💡 Bimbingan sokratik tanpa memberikan jawaban langsung.</span>
          <span className="text-numora-cyan/70 font-mono">Mock Mode v0.1.0</span>
        </div>
      </form>
    </div>
  );
}

