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
    color: 'from-cyan-500 to-blue-500',
    borderColor: 'border-cyan-500/30',
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
    color: 'from-violet-500 to-purple-500',
    borderColor: 'border-violet-500/30',
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
    color: 'from-emerald-500 to-teal-500',
    borderColor: 'border-emerald-500/30',
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
    color: 'from-pink-500 to-rose-500',
    borderColor: 'border-pink-500/30',
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
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-numora-cyan">
              Laboratorium Konseptual
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-numora-muted border border-white/10">
              Interactive 2D Demo
            </span>
          </div>
          <h3 className="text-lg font-bold text-numora-white mt-1">
            Visualisasi Interaktif: 4 Pilar Fondasi Aljabar
          </h3>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-numora-bg/60 border border-white/5">
          {MODULES_DATA.map((m, idx) => {
            const Icon = m.icon;
            const isCurrent = idx === activeModuleIndex;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModuleIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-numora-card text-numora-white font-semibold border border-numora-cyan/30 shadow-sm'
                    : 'text-numora-muted hover:text-numora-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-numora-cyan' : ''}`} />
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
        <div className="lg:col-span-7 rounded-xl bg-numora-bg/90 border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-numora-muted border-b border-white/5 pb-2">
            <span>Visualisasi Real-Time</span>
            <MathView math={activeModule.math} className="text-numora-cyan font-bold" />
          </div>

          {/* SVG / Canvas Area */}
          <div className="py-8 flex flex-col items-center justify-center min-h-[220px]">
            {activeModule.id === 'variables' && (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-numora-surface/80 border border-numora-cyan/30 shadow-glow-cyan/20 animate-float-slow">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-numora-cyan/20 to-numora-violet/20 border-2 border-dashed border-numora-cyan flex items-center justify-center text-2xl font-black text-numora-cyan font-mono">
                    x
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-numora-muted">Wadah Nilai Misterius</p>
                    <p className="text-sm font-semibold text-numora-white">Nilai variabel saat ini = {varValue}</p>
                    <p className="text-[11px] text-numora-cyan">Dapat menampung sembarang angka</p>
                  </div>
                </div>
              </div>
            )}

            {activeModule.id === 'coefficients' && (
              <div className="text-center space-y-3">
                <div className="text-xs text-numora-muted mb-2">3 Kotak Variabel $x$ yang identik:</div>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-numora-violet/30 to-numora-cyan/20 border-2 border-numora-violet flex flex-col items-center justify-center shadow-glow-violet/20"
                    >
                      <span className="text-xs text-numora-violet font-bold font-mono">x</span>
                      <span className="text-[10px] text-numora-white/70">isi={varValue}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <span className="text-xs font-mono text-numora-white bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    3 × {varValue} = {3 * varValue} total nilai
                  </span>
                </div>
              </div>
            )}

            {activeModule.id === 'constants' && (
              <div className="text-center space-y-3">
                <div className="text-xs text-numora-muted mb-2">7 Unit Nilai Mandiri (Tetap):</div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <div
                      key={num}
                      className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300"
                    >
                      1
                    </div>
                  ))}
                </div>
                <p className="text-xs text-numora-muted pt-2">Nilai konstanta tidak berubah dan tidak memiliki variabel pengali.</p>
              </div>
            )}

            {activeModule.id === 'expressions' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div className="p-2.5 rounded-xl bg-numora-surface border border-numora-violet/40 text-center">
                    <span className="text-xs text-numora-violet font-bold font-mono">3x ({3 * varValue})</span>
                    <span className="block text-[10px] text-numora-muted">Suku Berpengali</span>
                  </div>
                  <span className="text-xl font-bold text-numora-white">+</span>
                  <div className="p-2.5 rounded-xl bg-numora-surface border border-emerald-500/40 text-center">
                    <span className="text-xs text-emerald-300 font-bold font-mono">7</span>
                    <span className="block text-[10px] text-numora-muted">Suku Konstanta</span>
                  </div>
                  <span className="text-xl font-bold text-numora-white">=</span>
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-numora-cyan/20 to-numora-violet/20 border border-numora-cyan text-center">
                    <span className="text-xs text-numora-cyan font-bold font-mono">{3 * varValue + 7}</span>
                    <span className="block text-[10px] text-numora-white/80">Hasil Bentuk Aljabar</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive slider for x value */}
          <div className="pt-3 border-t border-white/5 flex items-center gap-3">
            <span className="text-xs text-numora-muted whitespace-nowrap">Simulasi Nilai $x$:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={varValue}
              onChange={(e) => setVarValue(Number(e.target.value))}
              className="w-full accent-numora-cyan cursor-pointer"
            />
            <span className="text-xs font-bold font-mono text-numora-cyan px-2 py-0.5 rounded bg-numora-cyan/10 border border-numora-cyan/20">
              x = {varValue}
            </span>
          </div>
        </div>

        {/* Right: Explanation & Pedagogical Guide */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-numora-cyan" />
              <h4 className="text-sm font-semibold text-numora-white">{activeModule.title}</h4>
            </div>
            <p className="text-xs text-numora-muted leading-relaxed mb-4">
              {activeModule.description}
            </p>

            <div className="p-3 rounded-xl bg-numora-bg/60 border border-white/5 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-numora-cyan">
                Formula Matematika (KaTeX):
              </div>
              <div className="p-2 rounded bg-numora-surface/80 text-center font-mono text-sm text-numora-white">
                <MathView math={activeModule.math} block={true} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-numora-muted tracking-wider block">
                Status Modul
              </span>
              <span className="text-xs font-semibold text-numora-cyan">
                {activeModule.sampleStatus}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-numora-white px-2 py-1 rounded bg-white/10">
              {activeModule.progress}% Selesai
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

