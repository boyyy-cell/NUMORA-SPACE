import React, { useState } from 'react';
import MathView, { MathText } from '../../components/common/MathView';
import { Box, Layers, Hash, GitBranch } from 'lucide-react';

export const MODULES_DATA = [
  {
    id: 'variables',
    title: 'Understanding Variables',
    subtitle: 'Memahami Variabel',
    description: 'Variabel adalah lambang pengganti bilangan yang nilainya dapat bervariasi (misal: x, y, a).',
    math: 'x, y, a \\in \\mathbb{R}',
    icon: Box,
    progress: 100,
    sampleStatus: 'Selesai Dipelajari',
    objectCount: 3,
  },
  {
    id: 'coefficients',
    title: 'Understanding Coefficients',
    subtitle: 'Memahami Koefisien',
    description: 'Faktor pengali dari suatu variabel yang menunjukkan berapa kali variabel dilipatgandakan.',
    math: '3x = x + x + x',
    icon: Layers,
    progress: 40,
    sampleStatus: 'Sedang Dipelajari',
    objectCount: 4,
  },
  {
    id: 'constants',
    title: 'Understanding Constants',
    subtitle: 'Memahami Konstanta',
    description: 'Suku dari bentuk aljabar yang berupa bilangan mandiri dan tidak memuat variabel pengali.',
    math: 'c = 7',
    icon: Hash,
    progress: 0,
    sampleStatus: 'Tersedia',
    objectCount: 7,
  },
  {
    id: 'expressions',
    title: 'Understanding Algebraic Expressions',
    subtitle: 'Memahami Bentuk Aljabar',
    description: 'Kombinasi antara koefisien, variabel, dan konstanta dalam operasi matematika.',
    math: '3x + 7 = 22',
    icon: GitBranch,
    progress: 0,
    sampleStatus: 'Tersedia',
    objectCount: 5,
  },
];

export default function AlgebraModulePreview() {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [varValue, setVarValue] = useState(4);
  const activeModule = MODULES_DATA[activeModuleIndex];

  return (
    <div className="bg-pure-white rounded-2xl p-6 border border-border-clean shadow-card-clean space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-clean pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest">
            Laboratorium Konseptual
          </span>
          <h3 className="text-base font-bold text-charcoal mt-0.5">
            4 Pilar Fondasi Aljabar
          </h3>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-ivory border border-border-clean">
          {MODULES_DATA.map((m, idx) => {
            const Icon = m.icon;
            const isCurrent = idx === activeModuleIndex;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModuleIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-pure-white text-forest font-semibold shadow-subtle border border-border-clean'
                    : 'text-secondary-text hover:text-charcoal hover:bg-pure-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-forest' : ''}`} />
                <span>{m.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-xl bg-ivory border border-border-clean p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs text-secondary-text border-b border-border-clean pb-2">
            <span>Visualisasi Real-Time</span>
            <div className="font-mono text-forest font-bold text-xs bg-pure-white px-2 py-0.5 rounded border border-border-clean">
              {activeModule.math}
            </div>
          </div>

          <div className="py-6 flex flex-col items-center justify-center min-h-[160px]">
            {activeModule.id === 'variables' && (
              <div className="p-4 rounded-xl bg-pure-white border-2 border-forest flex items-center gap-3 shadow-subtle">
                <div className="w-12 h-12 rounded-lg bg-forest/10 border border-forest flex items-center justify-center text-xl font-bold text-forest font-mono">
                  x
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-charcoal">Wadah Nilai Variabel</p>
                  <p className="text-secondary-text">Nilai variabel saat ini = <strong className="text-forest font-mono">{varValue}</strong></p>
                </div>
              </div>
            )}

            {activeModule.id === 'coefficients' && (
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="w-14 h-14 rounded-xl bg-pure-white border-2 border-forest flex flex-col items-center justify-center shadow-subtle"
                    >
                      <span className="text-xs text-forest font-bold font-mono">x</span>
                      <span className="text-[10px] text-secondary-text">isi={varValue}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs font-mono text-charcoal bg-pure-white px-3 py-1 rounded-full border border-border-clean inline-block">
                  3 × {varValue} = <strong className="text-forest">{3 * varValue}</strong>
                </span>
              </div>
            )}

            {activeModule.id === 'constants' && (
              <div className="space-y-2 text-center">
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <div
                      key={num}
                      className="w-8 h-8 rounded-lg bg-pure-white border border-border-clean flex items-center justify-center text-xs font-bold text-terracotta shadow-subtle"
                    >
                      1
                    </div>
                  ))}
                </div>
                <p className="text-xs text-secondary-text">Nilai konstanta tetap 7 tanpa ada pengali.</p>
              </div>
            )}

            {activeModule.id === 'expressions' && (
              <div className="flex items-center justify-center gap-2 flex-wrap text-center">
                <div className="p-2.5 rounded-xl bg-pure-white border border-border-clean">
                  <span className="text-xs text-forest font-bold font-mono">3x ({3 * varValue})</span>
                </div>
                <span className="text-base font-bold text-charcoal">+</span>
                <div className="p-2.5 rounded-xl bg-pure-white border border-border-clean">
                  <span className="text-xs text-terracotta font-bold font-mono">7</span>
                </div>
                <span className="text-base font-bold text-charcoal">=</span>
                <div className="p-2.5 rounded-xl bg-forest/10 border border-forest/30">
                  <span className="text-xs text-forest font-bold font-mono">{3 * varValue + 7}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border-clean flex items-center gap-3">
            <span className="text-xs text-secondary-text whitespace-nowrap">
              <MathText text="Simulasi Nilai $x$:" />
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={varValue}
              onChange={(e) => setVarValue(Number(e.target.value))}
              className="w-full accent-forest cursor-pointer"
            />
            <span className="text-xs font-bold font-mono text-forest px-2 py-0.5 rounded bg-pure-white border border-border-clean">
              x = {varValue}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-charcoal">{activeModule.title}</h4>
            <p className="text-xs text-secondary-text leading-relaxed">
              {activeModule.description}
            </p>

            <div className="p-3 rounded-xl bg-ivory border border-border-clean space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest block">
                Formula KaTeX:
              </span>
              <div className="p-2 rounded bg-pure-white text-center font-mono text-xs font-semibold text-charcoal border border-border-clean">
                <MathView math={activeModule.math} block={true} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-pure-white border border-border-clean flex items-center justify-between text-xs">
            <span className="text-secondary-text">{activeModule.sampleStatus}</span>
            <span className="font-mono font-semibold text-forest">
              {activeModule.progress}% Selesai
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
