import React, { useState } from 'react';
import MathView from '../../components/common/MathView';
import { Box, Layers, Hash, GitBranch, ArrowRight, CheckCircle2 } from 'lucide-react';

export const MODULES_DATA = [
  {
    id: 'variables',
    title: 'Understanding Variables',
    subtitle: 'Memahami Variabel',
    description: 'Variabel adalah lambang pengganti suatu bilangan yang belum diketahui nilainya secara pasti (misal: x, y, a, b).',
    math: 'x, y, a \\in \\mathbb{R}',
    icon: Box,
    color: 'from-orchid-400 to-apricot-400',
    borderColor: 'border-orchid-400/30',
    progress: 75,
    sampleStatus: 'In Progress (SAMPLE DATA)',
    objectCount: 3,
  },
  {
    id: 'coefficients',
    title: 'Understanding Coefficients',
    subtitle: 'Memahami Koefisien',
    description: 'Faktor pengali dari suatu variabel pada bentuk aljabar yang menunjukkan berapa kali variabel tersebut dijumlahkan.',
    math: '3x = x + x + x',
    icon: Layers,
    color: 'from-orchid-500 to-orchid-400',
    borderColor: 'border-orchid-500/30',
    progress: 40,
    sampleStatus: 'In Progress (SAMPLE DATA)',
    objectCount: 4,
  },
  {
    id: 'constants',
    title: 'Understanding Constants',
    subtitle: 'Memahami Konstanta',
    description: 'Suku dari suatu bentuk aljabar yang berupa bilangan mandiri dan tidak memuat variabel apa pun.',
    math: 'c = 7',
    icon: Hash,
    color: 'from-sage-400 to-sage-500',
    borderColor: 'border-sage-400/30',
    progress: 90,
    sampleStatus: 'Mastered (SAMPLE DATA)',
    objectCount: 7,
  },
  {
    id: 'expressions',
    title: 'Understanding Algebraic Expressions',
    subtitle: 'Memahami Bentuk Aljabar',
    description: 'Kombinasi utuh antara koefisien, variabel, dan konstanta yang dihubungkan melalui operasi hitung matematika.',
    math: '3x + 7 = 22',
    icon: GitBranch,
    color: 'from-apricot-400 to-orchid-400',
    borderColor: 'border-apricot-400/30',
    progress: 25,
    sampleStatus: 'Started (SAMPLE DATA)',
    objectCount: 5,
  },
];

export default function AlgebraModulePreview() {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [varValue, setVarValue] = useState(4);
  const activeModule = MODULES_DATA[activeModuleIndex];

  return (
    <div className="glass-card rounded-2xl p-6 border border-orchid-500/20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orchid-300">
              Laboratorium Konseptual
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-plum-900/60 text-lavender-300 border border-white/10">
              Interactive 2D Demo
            </span>
          </div>
          <h3 className="text-lg font-bold text-ivory-100 mt-1">
            Visualisasi Interaktif: 4 Pilar Fondasi Aljabar
          </h3>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-plum-950/60 border border-white/5">
          {MODULES_DATA.map((m, idx) => {
            const Icon = m.icon;
            const isCurrent = idx === activeModuleIndex;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModuleIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-aubergine-700 text-ivory-100 font-semibold border border-orchid-400/30 shadow-sm'
                    : 'text-lavender-300 hover:text-ivory-100 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-orchid-300' : ''}`} />
                <span className="hidden sm:inline">{m.subtitle}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Canvas Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-7 rounded-xl bg-plum-950/90 border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-lavender-300 border-b border-white/5 pb-2">
            <span>Visualisasi Real-Time</span>
            <MathView math={activeModule.math} className="text-orchid-300 font-bold" />
          </div>

          {/* SVG / Canvas Area */}
          <div className="py-8 flex flex-col items-center justify-center min-h-[220px]">
            {activeModule.id === 'variables' && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-aubergine-800/80 border border-orchid-500/30 shadow-glow-orchid animate-float-slow">
                  <div className="w-16 h-16 rounded-xl bg-orchid-500/20 border-2 border-dashed border-orchid-400 flex items-center justify-center text-2xl font-black text-orchid-300 font-mono">
                    x
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-lavender-300">Wadah Nilai Misterius</p>
                    <p className="text-sm font-semibold text-ivory-100">Nilai variabel saat ini = {varValue}</p>
                    <p className="text-[11px] text-orchid-300">Dapat menampung sembarang angka</p>
                  </div>
                </div>
              </div>
            )}

            {activeModule.id === 'coefficients' && (
              <div className="text-center space-y-3">
                <div className="text-xs text-lavender-300 mb-2">3 Kotak Variabel $x$ yang identik:</div>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="w-14 h-14 rounded-xl bg-orchid-500/20 border-2 border-orchid-400 flex flex-col items-center justify-center shadow-glow-orchid"
                    >
                      <span className="text-xs text-orchid-300 font-bold font-mono">x</span>
                      <span className="text-[10px] text-ivory-100/70">isi={varValue}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <span className="text-xs font-mono text-ivory-100 bg-aubergine-800/80 px-3 py-1 rounded-full border border-orchid-500/20">
                    3 × {varValue} = {3 * varValue} total nilai
                  </span>
                </div>
              </div>
            )}

            {activeModule.id === 'constants' && (
              <div className="text-center space-y-3">
                <div className="text-xs text-lavender-300 mb-2">7 Unit Nilai Mandiri (Tetap):</div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <div
                      key={num}
                      className="w-9 h-9 rounded-lg bg-sage-500/20 border border-sage-500/40 flex items-center justify-center text-xs font-bold text-sage-300"
                    >
                      1
                    </div>
                  ))}
                </div>
                <p className="text-xs text-lavender-300 pt-2">Nilai konstanta tidak berubah dan tidak memiliki variabel pengali.</p>
              </div>
            )}

            {activeModule.id === 'expressions' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div className="p-2.5 rounded-xl bg-aubergine-800 border border-orchid-500/40 text-center">
                    <span className="text-xs text-orchid-300 font-bold font-mono">3x ({3 * varValue})</span>
                    <span className="block text-[10px] text-lavender-300">Suku Berpengali</span>
                  </div>
                  <span className="text-xl font-bold text-ivory-100">+</span>
                  <div className="p-2.5 rounded-xl bg-aubergine-800 border border-sage-500/40 text-center">
                    <span className="text-xs text-sage-300 font-bold font-mono">7</span>
                    <span className="block text-[10px] text-lavender-300">Suku Konstanta</span>
                  </div>
                  <span className="text-xl font-bold text-ivory-100">=</span>
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-orchid-500/20 to-apricot-500/20 border border-orchid-400 text-center">
                    <span className="text-xs text-apricot-300 font-bold font-mono">{3 * varValue + 7}</span>
                    <span className="block text-[10px] text-ivory-100/90">Hasil Bentuk Aljabar</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive slider for x value */}
          <div className="pt-3 border-t border-white/5 flex items-center gap-3">
            <span className="text-xs text-lavender-300 whitespace-nowrap">Simulasi Nilai $x$:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={varValue}
              onChange={(e) => setVarValue(Number(e.target.value))}
              className="w-full accent-orchid-400 cursor-pointer"
            />
            <span className="text-xs font-bold font-mono text-orchid-300 px-2 py-0.5 rounded bg-orchid-500/10 border border-orchid-500/20">
              x = {varValue}
            </span>
          </div>
        </div>

        {/* Right: Explanation & Pedagogical Guide */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-orchid-400" />
              <h4 className="text-sm font-semibold text-ivory-100">{activeModule.title}</h4>
            </div>
            <p className="text-xs text-lavender-300 leading-relaxed mb-4">
              {activeModule.description}
            </p>

            <div className="p-3 rounded-xl bg-plum-950/60 border border-white/5 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-orchid-300">
                Formula Matematika (KaTeX):
              </div>
              <div className="p-2 rounded bg-aubergine-800/80 text-center font-mono text-sm text-ivory-100">
                <MathView math={activeModule.math} block={true} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-aubergine-800/60 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-lavender-300 tracking-wider block">
                Status Modul
              </span>
              <span className="text-xs font-semibold text-apricot-300">
                {activeModule.sampleStatus}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-ivory-100 px-2 py-1 rounded bg-white/10">
              {activeModule.progress}% Selesai
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

