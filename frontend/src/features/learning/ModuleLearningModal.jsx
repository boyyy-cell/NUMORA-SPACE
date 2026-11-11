import React, { useState, useEffect } from 'react';
import MathView, { MathText } from '../../components/common/MathView';
import {
  X,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Target,
  Sparkles,
  Layers,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';

export const MODULE_DETAILS = [
  {
    id: 'variables',
    moduleNumber: '01',
    title: 'Understanding Variables',
    subtitle: 'Memahami Variabel',
    objective:
      'Memahami konsep variabel sebagai lambang atau wadah pengganti bilangan numerik yang nilainya dapat berubah-ubah ($x, y, a$).',
    explanation:
      'Variabel adalah lambang pengganti suatu bilangan yang belum diketahui nilainya secara pasti atau nilainya dapat bervariasi. Dalam aljabar, variabel diibaratkan sebagai sebuah wadah kosong yang siap diisi bilangan berapapun.',
    formulaExample: 'x, y, a \\in \\mathbb{R}',
    examples: [
      {
        label: 'Wadah Bernilai 4',
        expr: 'x = 4',
        desc: 'Jika wadah $x$ diisi 4 butir kelereng, maka nilai variabel $x$ adalah 4.',
      },
      {
        label: 'Wadah Bernilai Negatif',
        expr: 'x = -3',
        desc: 'Variabel juga dapat bernilai bilangan bulat negatif, seperti penurunan suhu sebesar 3 derajat ($x = -3$).',
      },
    ],
  },
  {
    id: 'coefficients',
    moduleNumber: '02',
    title: 'Understanding Coefficients',
    subtitle: 'Memahami Koefisien',
    objective:
      'Memahami bahwa koefisien bertindak sebagai faktor pengali yang menunjukkan berapa kali variabel dilipatgandakan ($ax$).',
    explanation:
      'Koefisien adalah bilangan yang berada tepat di depan variabel. Koefisien menunjukkan berapa banyak wadah variabel yang dijumlahkan secara berulang atau dilipatgandakan.',
    formulaExample: '3x = x + x + x',
    examples: [
      {
        label: 'Pelipatan Positif',
        expr: '3x = 3(4) = 12',
        desc: 'Bentuk $3x$ berarti terdapat 3 buah wadah $x$. Jika satu wadah bernilai 4, totalnya adalah $3 \\times 4 = 12$.',
      },
      {
        label: 'Koefisien Bertanda Negatif',
        expr: '-5x',
        desc: 'Pada bentuk $-5x$, bilangan $-5$ adalah koefisien yang mengalikan variabel $x$. Tanda negatif melekat utuh pada koefisiennya.',
      },
    ],
  },
  {
    id: 'constants',
    moduleNumber: '03',
    title: 'Understanding Constants',
    subtitle: 'Memahami Konstanta',
    objective:
      'Mengidentifikasi konstanta sebagai suku bernilai mandiri yang sifatnya tetap dan tidak dipengaruhi oleh variabel ($c$).',
    explanation:
      'Konstanta adalah suku dari bentuk aljabar yang berdiri sendiri berupa bilangan tetap tanpa memuat variabel pengali. Nilainya selalu konstan berapapun nilai variabel di sekitarnya berubah.',
    formulaExample: 'c = 7',
    examples: [
      {
        label: 'Suku Mandiri',
        expr: '3x + 7 \\implies c = 7',
        desc: 'Pada bentuk $3x + 7$, bilangan $7$ adalah konstanta murni yang nilainya tidak berubah.',
      },
      {
        label: 'Konstanta Negatif',
        expr: '4y - 9 \\implies c = -9',
        desc: 'Pada bentuk $4y - 9$, konstanta bernilai $-9$ karena tanda minus di depannya merupakan bagian suku konstanta.',
      },
    ],
  },
  {
    id: 'expressions',
    moduleNumber: '04',
    title: 'Understanding Algebraic Expressions',
    subtitle: 'Memahami Bentuk Aljabar',
    objective:
      'Menggabungkan koefisien, variabel, dan konstanta ke dalam struktur model matematika terpadu ($ax + b$).',
    explanation:
      'Bentuk aljabar adalah perpaduan suku bervariabel dan suku konstanta yang dihubungkan oleh operasi penjumlahan atau pengurangan untuk memodelkan persoalan nyata secara logis dan terstruktur.',
    formulaExample: '3x + 7 = 22 \\quad (x = 5)',
    examples: [
      {
        label: 'Model Pembelian Nyata',
        expr: 'B = 5000x + 3000',
        desc: 'Membeli $x$ buku tulis seharga Rp5.000 ditambah biaya tempat pensil Rp3.000 dimodelkan sebagai $5000x + 3000$.',
      },
      {
        label: 'Substitusi Nilai',
        expr: '3(5) + 7 = 15 + 7 = 22',
        desc: 'Jika $x = 5$, kita substitusi ke $3x + 7$ sehingga menghasilkan nilai akhir $22$.',
      },
    ],
  },
];

export default function ModuleLearningModal({
  currentModuleId,
  completedModules = [],
  onCompleteModule,
  onClose,
  onOpenLab,
}) {
  const [activeIdx, setActiveIdx] = useState(() => {
    const idx = MODULE_DETAILS.findIndex((m) => m.id === currentModuleId);
    return idx >= 0 ? idx : 0;
  });

  const [varValue, setVarValue] = useState(4);

  // Lock body scroll when modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Keep activeIdx in sync if currentModuleId changes
  useEffect(() => {
    const idx = MODULE_DETAILS.findIndex((m) => m.id === currentModuleId);
    if (idx >= 0) setActiveIdx(idx);
  }, [currentModuleId]);

  const activeModule = MODULE_DETAILS[activeIdx];
  const hasPrev = activeIdx > 0;
  const hasNext = activeIdx < MODULE_DETAILS.length - 1;
  const isCurrentCompleted = completedModules.includes(activeModule.id);

  const handlePrev = () => {
    if (hasPrev) setActiveIdx((prev) => prev - 1);
  };

  const handleNext = () => {
    if (hasNext) setActiveIdx((prev) => prev + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-[#1E2721]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* 100% SOLID MODAL CARD WITH ZERO BLEED-THROUGH */}
      <div
        style={{ backgroundColor: '#FAF9F6', opacity: 1 }}
        className="w-full max-w-3xl max-h-[90vh] bg-[#FAF9F6] rounded-3xl border-1.5 border-[#28332C]/20 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 opacity-100"
      >
        {/* 1. SOLID HEADER (Warm Ivory-50) */}
        <header
          style={{ backgroundColor: '#FAF9F6', opacity: 1 }}
          className="px-6 py-4 bg-[#FAF9F6] border-b-1.5 border-[#28332C]/14 flex items-center justify-between shrink-0 z-10 shadow-xs"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest text-pure-white">
                Modul {activeModule.moduleNumber} dari 04
              </span>
              <span className="text-[11px] font-semibold text-secondary-text hidden sm:inline">
                Kurikulum Aljabar SMP
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-charcoal">
              {activeModule.subtitle}{' '}
              <span className="text-xs sm:text-sm font-normal text-secondary-text">
                ({activeModule.title})
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn-interactive p-2 rounded-xl bg-pure-white hover:bg-rose-50 text-secondary-text hover:text-rose-700 border-1.5 border-[#28332C]/14 transition-colors"
            aria-label="Tutup Materi"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* 2. SCROLLABLE LEARNING BODY (Solid Pure White) */}
        <div
          style={{ backgroundColor: '#FFFFFF', opacity: 1 }}
          className="flex-1 overflow-y-auto px-6 py-5 pb-8 space-y-6 bg-pure-white divide-y-1.5 divide-[#28332C]/10"
        >
          {/* SECTION A: TUJUAN PEMBELAJARAN */}
          <section className="space-y-2 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-forest uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Tujuan Pembelajaran</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-sage/15 border-1.5 border-sage/30 text-xs sm:text-sm text-charcoal leading-relaxed font-medium">
              <MathText text={activeModule.objective} />
            </div>
          </section>

          {/* SECTION B: PENJELASAN KONSEP SINGKAT */}
          <section className="space-y-2.5 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-forest" />
              <span>Penjelasan Konsep</span>
            </div>
            <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
              <MathText text={activeModule.explanation} />
            </p>
          </section>

          {/* SECTION C: CONTOH BENTUK ALJABAR & FORMULA KATEX */}
          <section className="space-y-3 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal uppercase tracking-wider">
              <Layers className="w-4 h-4 text-forest" />
              <span>Contoh Bentuk Aljabar & Rumus</span>
            </div>

            {/* Formula Banner */}
            <div className="p-3.5 rounded-2xl bg-[#F6F5EF] border-1.5 border-[#28332C]/14 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text block mb-1">
                Representasi Matematis:
              </span>
              <div className="text-forest text-base sm:text-lg font-bold font-mono">
                <MathView math={activeModule.formulaExample} block={true} />
              </div>
            </div>

            {/* Cards of Examples */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeModule.examples.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="p-3.5 rounded-xl bg-[#F6F5EF] border-1.5 border-[#28332C]/14 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal">{ex.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-pure-white border-1.5 border-[#28332C]/14 text-forest font-mono font-bold">
                      <MathView math={ex.expr} />
                    </span>
                  </div>
                  <p className="text-xs text-secondary-text leading-relaxed">
                    <MathText text={ex.desc} />
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION D: ILUSTRASI & VISUALISASI INTERAKTIF */}
          <section className="space-y-3 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-charcoal uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-terracotta" />
                <span>Visualisasi & Eksperimen Langsung</span>
              </div>
              <span className="text-[11px] font-mono text-forest font-semibold bg-[#F6F5EF] px-2.5 py-0.5 rounded-lg border-1.5 border-[#28332C]/14">
                x = {varValue}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F6F5EF] border-1.5 border-[#28332C]/14 space-y-4">
              <div className="py-4 flex flex-col items-center justify-center min-h-[140px] bg-pure-white rounded-xl border-1.5 border-[#28332C]/14 shadow-subtle p-4">
                {activeModule.id === 'variables' && (
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border-2 border-forest flex items-center gap-3 shadow-subtle max-w-sm">
                    <div className="w-14 h-14 rounded-xl bg-forest/10 border-2 border-forest flex items-center justify-center text-2xl font-bold text-forest font-mono shadow-xs">
                      x
                    </div>
                    <div className="text-left text-xs space-y-0.5">
                      <p className="font-bold text-charcoal">Wadah Nilai Variabel</p>
                      <p className="text-secondary-text">
                        Nilai tersimpan ={' '}
                        <strong className="text-forest font-mono text-sm">
                          {varValue}
                        </strong>
                      </p>
                      <p className="text-[10px] text-secondary-text">
                        Variabel menampung nilai numerik yang dapat berganti.
                      </p>
                    </div>
                  </div>
                )}

                {activeModule.id === 'coefficients' && (
                  <div className="space-y-3 text-center w-full">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="w-16 h-16 rounded-xl bg-[#FAF9F6] border-2 border-forest flex flex-col items-center justify-center shadow-subtle"
                        >
                          <span className="text-xs text-forest font-bold font-mono">
                            x
                          </span>
                          <span className="text-[10px] font-bold text-charcoal font-mono">
                            isi = {varValue}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-mono text-charcoal bg-[#FAF9F6] px-4 py-1.5 rounded-full border-1.5 border-[#28332C]/14 inline-block font-semibold">
                      3 × {varValue} ={' '}
                      <strong className="text-forest text-sm">
                        {3 * varValue}
                      </strong>
                    </div>
                  </div>
                )}

                {activeModule.id === 'constants' && (
                  <div className="space-y-3 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs mx-auto">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <div
                          key={num}
                          className="w-8 h-8 rounded-lg bg-[#FAF9F6] border-1.5 border-[#28332C]/20 flex items-center justify-center text-xs font-bold text-terracotta shadow-xs"
                        >
                          1
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-secondary-text">
                      Nilai konstanta tetap <strong className="text-terracotta font-mono">7</strong> tanpa ada pengali variabel.
                    </p>
                  </div>
                )}

                {activeModule.id === 'expressions' && (
                  <div className="flex items-center justify-center gap-2 flex-wrap text-center">
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border-1.5 border-[#28332C]/14">
                      <span className="text-xs text-forest font-bold font-mono">
                        3x ({3 * varValue})
                      </span>
                    </div>
                    <span className="text-lg font-bold text-charcoal">+</span>
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border-1.5 border-[#28332C]/14">
                      <span className="text-xs text-terracotta font-bold font-mono">
                        7
                      </span>
                    </div>
                    <span className="text-lg font-bold text-charcoal">=</span>
                    <div className="p-3 rounded-xl bg-forest/15 border-1.5 border-forest/40">
                      <span className="text-sm text-forest font-bold font-mono">
                        {3 * varValue + 7}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Slider Pengubah Nilai */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-secondary-text whitespace-nowrap font-medium">
                  <MathText text="Uji Nilai $x$:" />
                </span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={varValue}
                  onChange={(e) => setVarValue(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
                <span className="text-xs font-bold font-mono text-forest px-2.5 py-1 rounded-lg bg-pure-white border-1.5 border-[#28332C]/14 shrink-0 shadow-subtle">
                  x = {varValue}
                </span>
              </div>
            </div>
          </section>

          {/* SECTION E: STATUS PENYELESAIAN MATERI */}
          <section className="pt-5 border-t-1.5 border-[#28332C]/10">
            <div className="p-4 rounded-2xl bg-[#F6F5EF] border-1.5 border-[#28332C]/14 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-charcoal">
                  <span>Status Pembelajaran Modul {activeModule.moduleNumber}</span>
                </div>
                <p className="text-xs text-secondary-text">
                  {isCurrentCompleted
                    ? 'Kamu telah menyelesaikan materi ini. Progres tersimpan secara otomatis.'
                    : 'Sudah memahami materi ini? Tandai selesai untuk memperbarui progres belajarmu.'}
                </p>
              </div>

              <div className="shrink-0">
                {isCurrentCompleted ? (
                  <div className="px-4 py-2 rounded-xl text-xs font-semibold bg-sage/25 text-forest border-1.5 border-sage/40 flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-forest" />
                    <span>Modul Selesai</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onCompleteModule?.(activeModule.id)}
                    className="btn-interactive px-5 py-2.5 rounded-xl text-xs font-semibold bg-forest text-pure-white hover:bg-forest-600 transition-colors shadow-subtle flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-pure-white" />
                    <span>Tandai Selesai</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* 3. SOLID FOOTER: NAVIGATION & ACTIONS (Warm Ivory-50) */}
        <footer
          style={{ backgroundColor: '#FAF9F6', opacity: 1 }}
          className="px-6 py-4 bg-[#FAF9F6] border-t-1.5 border-[#28332C]/14 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-xs"
        >
          <button
            onClick={onClose}
            className="btn-interactive px-4 py-2 rounded-xl text-xs font-semibold bg-pure-white text-charcoal hover:bg-sage/20 border-1.5 border-[#28332C]/14 transition-colors"
          >
            ← Kembali ke Modul
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="btn-interactive px-3.5 py-2 rounded-xl text-xs font-medium bg-pure-white text-charcoal hover:bg-sage/20 border-1.5 border-[#28332C]/14 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="btn-interactive px-3.5 py-2 rounded-xl text-xs font-medium bg-pure-white text-charcoal hover:bg-sage/20 border-1.5 border-[#28332C]/14 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              <span>Berikutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {!isCurrentCompleted && (
              <button
                onClick={() => onCompleteModule?.(activeModule.id)}
                className="btn-interactive px-4 py-2 rounded-xl text-xs font-semibold bg-forest text-pure-white hover:bg-forest-600 transition-colors shadow-subtle flex items-center gap-1.5"
                title="Tandai materi ini telah dipahami dan selesai"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selesaikan Modul</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose?.();
                onOpenLab?.();
              }}
              className="btn-interactive px-4 py-2 rounded-xl text-xs font-semibold bg-ivory text-charcoal hover:bg-sage/20 border-1.5 border-[#28332C]/14 transition-colors shadow-xs flex items-center gap-1.5 ml-1"
            >
              <FlaskConical className="w-3.5 h-3.5 text-forest" />
              <span>Uji di Lab</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
