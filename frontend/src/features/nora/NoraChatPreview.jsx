import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calculator
} from 'lucide-react';
import MathView from '../../components/common/MathView';
import { voiceService } from '../../services/voiceService';
import { apiService } from '../../services/api';

const QUICK_PROMPTS = [
  'Apa itu variabel dan mengapa dilambangkan huruf?',
  'Kalau pada -5x, kenapa koefisiennya -5 bukan 5?',
  'Bagaimana cara menyelesaikan persamaan neraca 2x + 4 = 12?',
  'Di luar matematika, kamu bisa bantu jelaskan apa saja?',
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    text: 'Halo! Aku NORA, asisten AI pendamping belajarmu di NUMORA Space. 👋\n\nKamu bisa berdiskusi secara bebas denganku — mulai dari memahami konsep dasar variabel, bertanya cara menyelesaikan persamaan aljabar, meminta contoh soal, hingga topik sains atau sejarah aljabar. Apa yang ingin kamu tanyakan hari ini?',
    math: '3x + 5 = 17',
    timestamp: '10:00',
    spokenText: 'Halo! Aku NORA, asisten AI pendamping belajarmu di NUMORA Space. Apa yang ingin kamu tanyakan hari ini?'
  }
];

export default function NoraChatPreview({ compact = false }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState('explain'); // explain | hint | ask | review | chat
  const [hintTier, setHintTier] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  const handleNewChat = () => {
    voiceService.stop();
    setActiveSpeakingId(null);
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        text: 'Percakapan baru telah dimulai! Silakan ketik pertanyaan apa pun yang ingin kamu diskusikan.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spokenText: 'Percakapan baru telah dimulai. Silakan ajukan pertanyaanmu!'
      }
    ]);
  };

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    // Siapkan riwayat percakapan untuk konteks multi-turn
    const conversationHistory = updatedMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      const response = await apiService.noraChat(text, selectedMode, hintTier, conversationHistory);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: response.reply,
          math: response.math_latex,
          spokenText: response.voice_spoken_text || response.reply,
          verifiedMath: response.verified_math,
          isGenerative: response.is_generative,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      // Natural pedagogical fallback if offline
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            text: `Pertanyaan yang sangat bagus tentang "${text}". Dalam matematika aljabar, kita memodelkan persoalan nyata ke dalam lambang dan variabel terstruktur. Setiap simbol memiliki peran teratur agar kita bisa menemukan solusi secara logis.`,
            math: '3x + 5 = 17',
            spokenText: 'Pertanyaan yang bagus. Dalam aljabar kita memodelkan persoalan nyata ke dalam simbol yang logis.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`bg-pure-white rounded-3xl flex flex-col overflow-hidden border border-border-clean shadow-card-clean ${compact ? 'h-[500px]' : 'h-[620px]'}`}>
      {/* NORA Header */}
      <div className="p-4 sm:px-6 bg-pure-white border-b border-border-clean flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-pure-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-charcoal text-sm sm:text-base leading-tight">
                NORA <span className="text-forest font-semibold text-xs sm:text-sm">Open Conversational AI</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage/20 text-forest border border-sage/30 hidden sm:inline">
                Hybrid Engine
              </span>
            </div>
            <p className="text-[11px] text-secondary-text">Tutor Cerdas Percakapan Bebas & Verifikasi Aljabar</p>
          </div>
        </div>

        {/* Action Button: Percakapan Baru */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#707A70] hover:text-[#28332C] hover:bg-ivory border border-border-clean transition"
            title="Mulai Percakapan Baru"
          >
            <Plus className="w-3.5 h-3.5 text-forest" />
            <span className="hidden sm:inline">Percakapan Baru</span>
          </button>
        </div>
      </div>

      {/* Mode Bar (Optional Contextual Shortcuts) */}
      <div className="px-4 sm:px-6 py-2 bg-ivory/60 border-b border-border-clean flex items-center justify-between gap-2 text-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text mr-1">
            Gaya Bimbingan:
          </span>
          {[
            { id: 'explain', label: 'Jelaskan Konsep', icon: BookOpen },
            { id: 'hint', label: 'Beri Petunjuk Bertahap', icon: Lightbulb },
            { id: 'ask', label: 'Pertanyaan Balik', icon: HelpCircle },
            { id: 'review', label: 'Ulas Rangkuman', icon: RotateCcw },
          ].map((m) => {
            const Icon = m.icon;
            const active = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  active
                    ? 'bg-forest text-pure-white font-semibold shadow-xs'
                    : 'text-secondary-text hover:text-charcoal hover:bg-pure-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {selectedMode === 'hint' && (
          <div className="flex items-center gap-1 bg-pure-white px-2 py-0.5 rounded-lg border border-border-clean text-[10px] shrink-0">
            <span className="text-secondary-text font-semibold">Tahap:</span>
            {[1, 2, 3].map((t) => (
              <button
                key={t}
                onClick={() => setHintTier(t)}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  hintTier === t ? 'bg-forest text-pure-white' : 'text-secondary-text hover:text-charcoal'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-sm bg-[#FBFBFA]/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'assistant' ? (
              <div className="w-8 h-8 rounded-xl bg-forest/15 text-forest flex items-center justify-center shrink-0 border border-forest/20 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#28332C] text-pure-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 space-y-2 shadow-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-forest text-pure-white rounded-tr-none'
                  : 'bg-pure-white border border-border-clean text-charcoal rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line text-xs sm:text-sm">
                {msg.text}
              </div>

              {msg.math && (
                <div className={`p-2.5 rounded-xl text-center font-mono my-2 border ${
                  msg.role === 'user'
                    ? 'bg-forest-600 text-pure-white border-forest-500'
                    : 'bg-ivory text-forest font-semibold border-border-clean'
                }`}>
                  <MathView math={msg.math} block={true} />
                </div>
              )}

              {msg.verifiedMath && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                  <Calculator className="w-3 h-3 text-emerald-600" />
                  <span>Diverifikasi oleh Verified Math Engine</span>
                </div>
              )}

              {/* Message Footer: Timestamp & Audio */}
              <div className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${
                msg.role === 'user' ? 'border-forest-600/60 text-pure-white/70' : 'border-border-clean text-secondary-text'
              }`}>
                <span>{msg.role === 'assistant' ? 'NORA' : 'Kamu'} • {msg.timestamp}</span>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleSpeak(msg.id, msg.spokenText || msg.text)}
                    className="flex items-center gap-1 text-forest hover:underline font-semibold"
                    title="Dengarkan Suara"
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

        {/* Thinking Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-forest/15 text-forest flex items-center justify-center shrink-0 border border-forest/20">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-pure-white border border-border-clean text-secondary-text text-xs flex items-center gap-2 shadow-xs rounded-tl-none">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="font-medium text-charcoal">NORA sedang memikirkan jawaban terbaik...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions (Jika pesan masih sedikit) */}
      {messages.length <= 2 && (
        <div className="px-4 sm:px-6 py-2 bg-ivory/40 border-t border-border-clean flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-secondary-text shrink-0 uppercase tracking-wider">
            Saran:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-full bg-pure-white border border-border-clean text-charcoal hover:border-forest hover:bg-forest/5 text-[11px] whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Free-form Chat Input Bar */}
      <div className="p-3 sm:p-4 bg-pure-white border-t border-border-clean">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder="Ketik pertanyaan bebas untuk NORA (misal: 'Apa bedanya variabel dan konstanta?')..."
            className="flex-1 bg-ivory border border-border-clean rounded-2xl px-4 py-3 text-xs sm:text-sm text-charcoal placeholder-secondary-text/70 focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            className="px-5 py-3 rounded-2xl bg-forest hover:bg-forest-600 text-pure-white font-bold text-xs sm:text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-subtle shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>
      </div>
    </div>
  );
}
