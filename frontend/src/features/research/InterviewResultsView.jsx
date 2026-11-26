import React, { useState, useMemo } from 'react';
import {
  MessageSquareQuote,
  Users,
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  Sparkles,
  AlertTriangle,
  Compass,
  Lightbulb,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Quote
} from 'lucide-react';
import {
  INTERVIEW_METADATA,
  S001_INTERVIEW_QUESTIONS,
  S002_INTERVIEW_QUESTIONS,
  DEEPENING_QUESTIONS,
  INTERVIEW_SUMMARY_ASPECTS
} from '../../data/interviewDocumentationData';

export default function InterviewResultsView() {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 's001' | 's002' | 'deepening' | 'summary'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleExpand = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter questions based on search query
  const filteredS001 = useMemo(() => {
    if (!searchQuery.trim()) return S001_INTERVIEW_QUESTIONS;
    const q = searchQuery.toLowerCase();
    return S001_INTERVIEW_QUESTIONS.filter(
      item => item.question.toLowerCase().includes(q) ||
              item.answer.toLowerCase().includes(q) ||
              item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredS002 = useMemo(() => {
    if (!searchQuery.trim()) return S002_INTERVIEW_QUESTIONS;
    const q = searchQuery.toLowerCase();
    return S002_INTERVIEW_QUESTIONS.filter(
      item => item.question.toLowerCase().includes(q) ||
              item.answer.toLowerCase().includes(q) ||
              item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredDeepening = useMemo(() => {
    if (!searchQuery.trim()) return DEEPENING_QUESTIONS;
    const q = searchQuery.toLowerCase();
    return DEEPENING_QUESTIONS.filter(
      item => item.question.toLowerCase().includes(q) ||
              item.s001_answer.toLowerCase().includes(q) ||
              item.s002_answer.toLowerCase().includes(q) ||
              item.focus.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredSummary = useMemo(() => {
    if (!searchQuery.trim()) return INTERVIEW_SUMMARY_ASPECTS;
    const q = searchQuery.toLowerCase();
    return INTERVIEW_SUMMARY_ASPECTS.filter(
      item => item.aspect.toLowerCase().includes(q) ||
              item.summary.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const getAspectIcon = (iconName) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-forest" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-amber-700" />;
      case 'Compass': return <Compass className="w-5 h-5 text-forest" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-terracotta" />;
      case 'Lightbulb': return <Lightbulb className="w-5 h-5 text-amber-600" />;
      default: return <FileText className="w-5 h-5 text-forest" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-page">
      {/* 1. HEADER UTAMA DOKUMENTASI WAWANCARA */}
      <div className="bg-pure-white rounded-2xl p-6 sm:p-7 border border-[#28332C]/14 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/14 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage/20 text-xs font-semibold text-forest">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Dokumentasi Kualitatif Instrumen Riset</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
              {INTERVIEW_METADATA.title}
            </h2>
            <p className="text-xs sm:text-sm text-secondary-text max-w-3xl leading-relaxed">
              {INTERVIEW_METADATA.description}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto shrink-0">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-ivory text-forest border border-[#28332C]/12 font-semibold">
              Sumber: {INTERVIEW_METADATA.documentSource}
            </span>
            <span className="text-[10px] text-secondary-text flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span>Akses Peneliti Terotorisasi (P-001)</span>
            </span>
          </div>
        </div>

        {/* Disclaimer Metodologis & Keaslian Dokumen */}
        <div className="p-3.5 rounded-xl bg-ivory/80 border border-[#28332C]/10 text-xs text-secondary-text leading-relaxed flex items-start gap-2.5">
          <Quote className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <div>
            <strong className="text-charcoal font-semibold">Catatan Integritas Data & Konteks Dokumen:</strong> {INTERVIEW_METADATA.disclaimer}
          </div>
        </div>

        {/* Ringkasan Metrik Jumlah Subjek & Konten */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-ivory/50 border border-[#28332C]/10 space-y-0.5">
            <span className="text-[11px] text-secondary-text block">Jumlah Subjek</span>
            <span className="text-lg sm:text-xl font-bold text-charcoal font-mono">
              {INTERVIEW_METADATA.totalSubjects} Subjek
            </span>
            <span className="text-[10px] text-forest font-medium block">S-001 & S-002</span>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory/50 border border-[#28332C]/10 space-y-0.5">
            <span className="text-[11px] text-secondary-text block">Total Pertanyaan Inti</span>
            <span className="text-lg sm:text-xl font-bold text-forest font-mono">
              20 Pertanyaan
            </span>
            <span className="text-[10px] text-secondary-text block">10 Kontrol + 10 Eksperimen</span>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory/50 border border-[#28332C]/10 space-y-0.5">
            <span className="text-[11px] text-secondary-text block">Pertanyaan Pendalaman</span>
            <span className="text-lg sm:text-xl font-bold text-terracotta font-mono">
              5 Butir Komparatif
            </span>
            <span className="text-[10px] text-secondary-text block">Analisis 2 Perspektif</span>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory/50 border border-[#28332C]/10 space-y-0.5">
            <span className="text-[11px] text-secondary-text block">Aspek Ringkasan</span>
            <span className="text-lg sm:text-xl font-bold text-charcoal font-mono">
              5 Aspek Tematik
            </span>
            <span className="text-[10px] text-secondary-text block">Sintesis Hasil Wawancara</span>
          </div>
        </div>
      </div>

      {/* 2. KARTU PROFIL KOMPARATIF SUBJEK S-001 & S-002 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTERVIEW_METADATA.subjects.map((subj) => (
          <div
            key={subj.id}
            className="bg-pure-white rounded-2xl p-5 border border-[#28332C]/14 shadow-subtle space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#28332C]/12 pb-3">
              <div className="flex items-center gap-3">
                <span className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center ${
                  subj.id === 'S-001' ? 'bg-forest/10 text-forest' : 'bg-terracotta/10 text-terracotta'
                }`}>
                  {subj.id}
                </span>
                <div>
                  <h3 className="font-bold text-charcoal text-sm">{subj.name}</h3>
                  <span className="text-[11px] text-secondary-text">{subj.treatment}</span>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold border ${subj.badgeColor}`}>
                {subj.group.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-secondary-text leading-relaxed">
              {subj.focus}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#28332C]/10 text-xs">
              <span className="text-secondary-text">Jumlah Butir Wawancara:</span>
              <span className="font-mono font-bold text-charcoal">{subj.totalQuestions} Pertanyaan Lengkap</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BAR NAVIGASI FILTER & PENCARIAN */}
      <div className="bg-pure-white rounded-2xl p-4 border border-[#28332C]/14 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`btn-interactive px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-forest text-pure-white shadow-subtle'
                : 'bg-ivory text-secondary-text hover:text-charcoal border border-[#28332C]/10'
            }`}
          >
            Semua Bagian
          </button>
          <button
            onClick={() => setActiveFilter('s001')}
            className={`btn-interactive px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 's001'
                ? 'bg-forest text-pure-white shadow-subtle'
                : 'bg-ivory text-secondary-text hover:text-charcoal border border-[#28332C]/10'
            }`}
          >
            S-001 (Kontrol · 10)
          </button>
          <button
            onClick={() => setActiveFilter('s002')}
            className={`btn-interactive px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 's002'
                ? 'bg-forest text-pure-white shadow-subtle'
                : 'bg-ivory text-secondary-text hover:text-charcoal border border-[#28332C]/10'
            }`}
          >
            S-002 (Eksperimen · 10)
          </button>
          <button
            onClick={() => setActiveFilter('deepening')}
            className={`btn-interactive px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'deepening'
                ? 'bg-forest text-pure-white shadow-subtle'
                : 'bg-ivory text-secondary-text hover:text-charcoal border border-[#28332C]/10'
            }`}
          >
            Pertanyaan Pendalaman (5)
          </button>
          <button
            onClick={() => setActiveFilter('summary')}
            className={`btn-interactive px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === 'summary'
                ? 'bg-forest text-pure-white shadow-subtle'
                : 'bg-ivory text-secondary-text hover:text-charcoal border border-[#28332C]/10'
            }`}
          >
            Ringkasan Wawancara (5)
          </button>
        </div>

        {/* Input Pencarian Kata Kunci */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-secondary-text absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pertanyaan / jawaban..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-ivory border border-[#28332C]/14 text-xs text-charcoal placeholder:text-secondary-text/70 focus:outline-hidden focus:border-forest transition"
          />
        </div>
      </div>

      {/* 4. BAGIAN A: WAWANCARA S-001 — PEMBELAJARAN LANGSUNG */}
      {(activeFilter === 'all' || activeFilter === 's001') && (
        <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-forest" />
                <h3 className="text-base font-bold text-charcoal">
                  A. Wawancara S-001 — Pembelajaran Langsung (Tatap Muka)
                </h3>
              </div>
              <p className="text-xs text-secondary-text">
                Sepuluh butir pertanyaan dan jawaban evaluatif terkait pembelajaran konvensional bersama peneliti.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-forest/10 text-forest font-semibold self-start sm:self-auto">
              10 Pertanyaan Lengkap
            </span>
          </div>

          {filteredS001.length === 0 ? (
            <p className="text-xs text-secondary-text py-4 text-center">
              Tidak ada pertanyaan S-001 yang cocok dengan pencarian "{searchQuery}".
            </p>
          ) : (
            <div className="space-y-3">
              {filteredS001.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#28332C]/10 bg-ivory/40 hover:bg-ivory transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-forest text-pure-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {item.number}
                      </span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-sage/20 text-forest inline-block">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-charcoal text-xs sm:text-sm leading-snug">
                          {item.question}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="pl-8 sm:pl-8.5 space-y-1">
                    <div className="p-3 rounded-lg bg-pure-white border border-[#28332C]/10 text-xs text-charcoal leading-relaxed shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] text-secondary-text mb-1 border-b border-[#28332C]/6 pb-1">
                        <span className="font-semibold text-forest">Jawaban contoh siswa (S-001):</span>
                        <span className="font-mono">Tatap Muka Langsung</span>
                      </div>
                      <p className="italic text-[#1E2520]">
                        "{item.answer}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. BAGIAN B: WAWANCARA S-002 — PEMBELAJARAN BERBANTUAN NUMORA SPACE */}
      {(activeFilter === 'all' || activeFilter === 's002') && (
        <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
                <h3 className="text-base font-bold text-charcoal">
                  B. Wawancara S-002 — Pembelajaran Berbantuan NUMORA Space
                </h3>
              </div>
              <p className="text-xs text-secondary-text">
                Sepuluh butir pertanyaan dan jawaban evaluatif terkait pengalaman mandiri berbantuan platform digital.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-terracotta/10 text-terracotta font-semibold self-start sm:self-auto">
              10 Pertanyaan Lengkap
            </span>
          </div>

          {filteredS002.length === 0 ? (
            <p className="text-xs text-secondary-text py-4 text-center">
              Tidak ada pertanyaan S-002 yang cocok dengan pencarian "{searchQuery}".
            </p>
          ) : (
            <div className="space-y-3">
              {filteredS002.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#28332C]/10 bg-ivory/40 hover:bg-ivory transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-terracotta text-pure-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {item.number}
                      </span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-terracotta/10 text-terracotta inline-block">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-charcoal text-xs sm:text-sm leading-snug">
                          {item.question}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="pl-8 sm:pl-8.5 space-y-1">
                    <div className="p-3 rounded-lg bg-pure-white border border-[#28332C]/10 text-xs text-charcoal leading-relaxed shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] text-secondary-text mb-1 border-b border-[#28332C]/6 pb-1">
                        <span className="font-semibold text-terracotta">Jawaban contoh siswa (S-002):</span>
                        <span className="font-mono">NUMORA Space Platform</span>
                      </div>
                      <p className="italic text-[#1E2520]">
                        "{item.answer}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. BAGIAN C: PERTANYAAN PENDALAMAN (KOMPARATIF S-001 VS S-002) */}
      {(activeFilter === 'all' || activeFilter === 'deepening') && (
        <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-forest" />
                <h3 className="text-base font-bold text-charcoal">
                  C. Pertanyaan Pendalaman — S-001 dan S-002
                </h3>
              </div>
              <p className="text-xs text-secondary-text">
                Perbandingan respons kedua subjek pada lima butir pertanyaan pendalaman metakognitif.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-forest/10 text-forest font-semibold self-start sm:self-auto">
              5 Butir Komparatif
            </span>
          </div>

          {filteredDeepening.length === 0 ? (
            <p className="text-xs text-secondary-text py-4 text-center">
              Tidak ada pertanyaan pendalaman yang cocok dengan pencarian "{searchQuery}".
            </p>
          ) : (
            <div className="space-y-4">
              {filteredDeepening.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-xl border border-[#28332C]/12 bg-ivory/50 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-forest text-pure-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {item.number}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-sage/20 text-forest inline-block mb-1">
                        Fokus: {item.focus}
                      </span>
                      <h4 className="font-bold text-charcoal text-sm">
                        {item.question}
                      </h4>
                    </div>
                  </div>

                  {/* Komparasi Respons S-001 vs S-002 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Jawaban S-001 */}
                    <div className="p-3.5 rounded-xl bg-pure-white border border-[#28332C]/10 space-y-2">
                      <div className="flex items-center justify-between border-b border-[#28332C]/8 pb-1.5">
                        <span className="text-xs font-bold text-forest flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-forest" />
                          <span>S-001 (Kontrol · Tatap Muka)</span>
                        </span>
                        <span className="text-[9px] font-mono text-secondary-text uppercase">Direct Teaching</span>
                      </div>
                      <p className="text-xs text-charcoal italic leading-relaxed">
                        "{item.s001_answer}"
                      </p>
                    </div>

                    {/* Jawaban S-002 */}
                    <div className="p-3.5 rounded-xl bg-pure-white border border-[#28332C]/10 space-y-2">
                      <div className="flex items-center justify-between border-b border-[#28332C]/8 pb-1.5">
                        <span className="text-xs font-bold text-terracotta flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-terracotta" />
                          <span>S-002 (Eksperimen · NUMORA Space)</span>
                        </span>
                        <span className="text-[9px] font-mono text-secondary-text uppercase">Digital Learning</span>
                      </div>
                      <p className="text-xs text-charcoal italic leading-relaxed">
                        "{item.s002_answer}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. BAGIAN D: RINGKASAN ISI WAWANCARA (5 ASPEK TEMATIK) */}
      {(activeFilter === 'all' || activeFilter === 'summary') && (
        <div className="bg-pure-white rounded-2xl p-5 sm:p-6 border border-[#28332C]/14 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#28332C]/14 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-forest" />
                <h3 className="text-base font-bold text-charcoal">
                  D. Ringkasan Isi Wawancara (Lima Aspek Tematik)
                </h3>
              </div>
              <p className="text-xs text-secondary-text">
                Sintesis tematik kualitatif dari hasil wawancara kedua kelompok subjek penelitian.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-forest/10 text-forest font-semibold self-start sm:self-auto">
              5 Aspek Utama
            </span>
          </div>

          {filteredSummary.length === 0 ? (
            <p className="text-xs text-secondary-text py-4 text-center">
              Tidak ada aspek ringkasan yang cocok dengan pencarian "{searchQuery}".
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSummary.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-xl border border-[#28332C]/12 bg-ivory/50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#28332C]/10 pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pure-white border border-[#28332C]/10 flex items-center justify-center">
                        {getAspectIcon(item.iconName)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-secondary-text font-bold">
                          ASPEK {item.number}
                        </span>
                        <h4 className="font-bold text-charcoal text-sm capitalize">
                          {item.aspect}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Isi Ringkasan Resmi */}
                  <div className="p-3 rounded-lg bg-pure-white border border-[#28332C]/10 text-xs text-charcoal leading-relaxed shadow-2xs space-y-1">
                    <span className="text-[10px] font-semibold text-forest uppercase tracking-wider block">
                      Ringkasan Temuan Wawancara:
                    </span>
                    <p className="text-[#1E2520]">
                      {item.summary}
                    </p>
                  </div>

                  {/* Analisis Komparatif Metodologis */}
                  <div className="text-[11px] text-secondary-text flex items-start gap-1.5 pt-1">
                    <ArrowRight className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-charcoal font-semibold">Tinjauan:</strong> {item.comparativeInsight}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
