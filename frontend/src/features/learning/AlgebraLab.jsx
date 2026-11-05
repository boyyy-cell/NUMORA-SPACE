import React, { useState, useEffect } from 'react';
import MathView from '../../components/common/MathView';
import AlgebraBalance3D from './AlgebraBalance3D';
import { voiceService } from '../../services/voiceService';
import { apiService } from '../../services/api';
import {
  Sliders,
  Layers,
  Hash,
  GitBranch,
  ShoppingBag,
  Volume2,
  VolumeX,
  Box,
  Scale
} from 'lucide-react';

export default function AlgebraLab() {
  const [activeTab, setActiveTab] = useState('variable'); // variable, coefficient, constant, expression, balance3d, contextual

  // 1. Variable Explorer State
  const [xVal, setXVal] = useState(3);

  // 2. Coefficient Explorer State
  const [coeffA, setCoeffA] = useState(3);
  const [coeffX, setCoeffX] = useState(2);

  // 3. Constant Explorer State
  const [constX, setConstX] = useState(2);
  const [constC, setConstC] = useState(5);

  // 4. Expression Explorer State
  const [exprA, setExprA] = useState(4);
  const [exprC, setExprC] = useState(6);
  const [exprX, setExprX] = useState(5);
  const [calculationSteps, setCalculationSteps] = useState(null);

  // 5. Balance Scale State
  const [balanceX, setBalanceX] = useState(3);

  // 6. Contextual Simulation State (Buku & Pensil)
  const [bookCount, setBookCount] = useState(3);
  const bookPrice = 5000;
  const pencilCost = 3000;

  // Voice State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Evaluate Expression using Backend API or fallback
  useEffect(() => {
    let isMounted = true;
    const fetchEval = async () => {
      try {
        const exprString = `${exprA}x + ${exprC}`;
        const res = await apiService.evaluateExpression(exprString, { x: exprX });
        if (isMounted) setCalculationSteps(res);
      } catch (e) {
        const term = exprA * exprX;
        const total = term + exprC;
        if (isMounted) {
          setCalculationSteps({
            expression: `${exprA}x + ${exprC}`,
            variables: { x: exprX },
            result: total,
            steps: [
              { step_number: 1, description: `Substitusi x = ${exprX}`, expression_state: `${exprA}(${exprX}) + ${exprC}` },
              { step_number: 2, description: `Kalikan koefisien: ${exprA} × ${exprX} = ${term}`, expression_state: `${term} + ${exprC}` },
              { step_number: 3, description: `Jumlahkan konstanta: ${term} + ${exprC} = ${total}`, expression_state: `${total}` },
            ],
            interpretation: `Nilai bentuk aljabar adalah ${total}.`
          });
        }
      }
    };
    fetchEval();
    return () => { isMounted = false; };
  }, [exprA, exprC, exprX]);

  const handleSpeakExplanation = (text) => {
    if (isSpeaking) {
      voiceService.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    voiceService.speak(text, {
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleMuteToggle = () => {
    const muted = voiceService.toggleMute();
    setIsMuted(muted);
    if (muted) setIsSpeaking(false);
  };

  const MODES = [
    { id: 'variable', label: 'Wadah Variabel', formula: 'x', icon: Box, category: 'Fondasi' },
    { id: 'coefficient', label: 'Koefisien', formula: 'ax', icon: Layers, category: 'Fondasi' },
    { id: 'constant', label: 'Konstanta', formula: 'c', icon: Hash, category: 'Fondasi' },
    { id: 'expression', label: 'Bentuk Aljabar', formula: 'ax + b', icon: GitBranch, category: 'Fondasi' },
    { id: 'balance3d', label: 'Neraca 3D', formula: 'ax + b = c', icon: Scale, category: 'Terapan' },
    { id: 'contextual', label: 'Simulasi Belanja', formula: 'B = ax + b', icon: ShoppingBag, category: 'Terapan' },
  ];

  return (
    <div className="bg-pure-white rounded-2xl p-5 sm:p-7 border border-[#28332C]/14 shadow-card-clean space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28332C]/14 pb-4">
        <div>
          <h3 className="text-xl font-bold text-charcoal">
            Laboratorium Aljabar Interaktif
          </h3>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            Eksplorasi konsep variabel, koefisien, konstanta, dan timbangan aljabar.
          </p>
        </div>

        <button
          onClick={handleMuteToggle}
          className={`btn-interactive p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border self-start sm:self-auto ${
            isMuted
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-ivory text-charcoal hover:bg-sage/20 border-border-clean hover:border-forest/40'
          }`}
          title={isMuted ? 'Suara Dinonaktifkan' : 'Suara Aktif'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-forest" />}
          <span className="text-xs font-medium">{isMuted ? 'Audio Mati' : 'Audio Aktif'}</span>
        </button>
      </div>

      {/* Mode Selector: Clean 6-Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeTab === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveTab(mode.id);
                voiceService.stop();
                setIsSpeaking(false);
              }}
              className={`btn-interactive p-3 rounded-xl text-left transition-all border flex flex-col justify-between space-y-1.5 ${
                isActive
                  ? 'bg-forest text-pure-white border-forest shadow-subtle'
                  : 'bg-pure-white text-secondary-text hover:text-charcoal hover:bg-ivory border-border-clean hover:border-forest/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-pure-white' : 'text-forest'}`} />
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-forest-600 text-pure-white' : 'bg-ivory text-charcoal'
                }`}>
                  {mode.formula}
                </span>
              </div>
              <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-pure-white' : 'text-charcoal'}`}>
                {mode.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* DOMINANT HERO VISUALIZATION & CONTROLS */}

      {/* MODE 1: VARIABLE EXPLORER */}
      {activeTab === 'variable' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-ivory p-6 sm:p-8 border border-border-clean flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center justify-between w-full border-b border-border-clean pb-3">
              <span className="text-xs sm:text-sm font-semibold text-charcoal">Visualisasi Wadah Variabel [ x ]</span>
              <div className="font-mono text-forest font-bold text-base bg-pure-white px-3 py-1 rounded-xl border border-border-clean shadow-subtle">
                x = {xVal}
              </div>
            </div>

            {/* Dominant Container Box with Tokens */}
            <div className="w-full max-w-md p-6 rounded-2xl bg-pure-white border-2 border-forest flex flex-col items-center space-y-4 shadow-subtle">
              <span className="text-xs font-bold uppercase tracking-wider text-forest font-mono">
                Wadah Nilai Variabel
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 p-4 rounded-xl bg-ivory min-h-[90px] w-full border border-border-clean">
                {xVal === 0 ? (
                  <span className="text-xs text-secondary-text italic">Wadah kosong (Nilai = 0)</span>
                ) : xVal > 0 ? (
                  Array.from({ length: Math.min(xVal, 20) }).map((_, i) => (
                    <span key={i} className="w-7 h-7 rounded-lg bg-forest text-pure-white font-bold text-xs flex items-center justify-center shadow-subtle">
                      +1
                    </span>
                  ))
                ) : (
                  Array.from({ length: Math.min(Math.abs(xVal), 20) }).map((_, i) => (
                    <span key={i} className="w-7 h-7 rounded-lg bg-terracotta text-pure-white font-bold text-xs flex items-center justify-center shadow-subtle">
                      -1
                    </span>
                  ))
                )}
              </div>
              <div className="text-xs text-charcoal font-medium">
                Total Muatan Nilai: <strong className="font-mono text-forest text-sm">{xVal} unit</strong>
              </div>
            </div>

            {/* Adjacent Slider Controls */}
            <div className="w-full max-w-md space-y-2 pt-1">
              <div className="flex justify-between text-xs text-secondary-text">
                <span className="font-medium text-charcoal">Ubah Nilai x dengan Slider:</span>
                <span className="font-bold text-forest font-mono text-sm">x = {xVal}</span>
              </div>
              <input
                type="range"
                min="-5"
                max="10"
                value={xVal}
                onChange={(e) => setXVal(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer h-2 bg-pure-white rounded-lg border border-border-clean"
              />
              <div className="flex justify-between text-[11px] font-mono text-secondary-text">
                <span className="text-terracotta font-semibold">-5 (Negatif)</span>
                <span>0 (Nol)</span>
                <span className="text-forest font-semibold">+10 (Positif)</span>
              </div>
            </div>
          </div>

          {/* Concise 2-3 sentence explanation */}
          <div className="p-4 rounded-xl bg-pure-white border border-border-clean space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-charcoal leading-relaxed font-medium">
                Variabel $x$ bertindak sebagai wadah penampung bilangan. Angka di dalam wadah dapat bernilai positif (token hijau) maupun negatif (token oranye).
              </p>
              <button
                onClick={() => handleSpeakExplanation(`Variabel adalah simbol atau wadah penampung nilai numerik. Saat ini nilai x adalah ${xVal}.`)}
                className="p-1.5 rounded-lg bg-ivory text-forest hover:bg-sage/20 transition-colors ml-3 shrink-0"
                title="Dengarkan Penjelasan"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: COEFFICIENT EXPLORER */}
      {activeTab === 'coefficient' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-ivory p-6 sm:p-8 border border-border-clean flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center justify-between w-full border-b border-border-clean pb-3">
              <span className="text-xs sm:text-sm font-semibold text-charcoal">Model Kelipatan Suku: {coeffA}x</span>
              <div className="font-mono text-forest font-bold text-base bg-pure-white px-3 py-1 rounded-xl border border-border-clean shadow-subtle">
                {coeffA}x = {coeffA * coeffX}
              </div>
            </div>

            {/* Boxes Group */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2 max-w-xl min-h-[100px]">
              {coeffA === 0 ? (
                <div className="p-5 rounded-xl bg-pure-white border border-border-clean text-xs text-secondary-text text-center">
                  Koefisien 0: Tidak ada wadah ($0 \times x = 0$).
                </div>
              ) : (
                Array.from({ length: Math.min(Math.abs(coeffA), 6) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-20 h-20 rounded-2xl p-2.5 flex flex-col items-center justify-center border-2 shadow-subtle transition-all ${
                      coeffA < 0
                        ? 'bg-terracotta/10 border-terracotta text-terracotta'
                        : 'bg-pure-white border-forest text-forest'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">
                      {coeffA < 0 ? '-x' : 'x'}
                    </span>
                    <span className="text-[10px] text-secondary-text">isi={coeffX}</span>
                    <span className="text-sm font-bold font-mono mt-0.5">
                      {coeffA < 0 ? -coeffX : coeffX}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Adjacent Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-2 border-t border-border-clean">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-secondary-text">
                  <span className="font-medium text-charcoal">Koefisien ($a$):</span>
                  <span className="font-bold font-mono text-charcoal text-sm">{coeffA}</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="5"
                  value={coeffA}
                  onChange={(e) => setCoeffA(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-secondary-text">
                  <span className="font-medium text-charcoal">Isi Wadah ($x$):</span>
                  <span className="font-bold font-mono text-forest text-sm">{coeffX}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={coeffX}
                  onChange={(e) => setCoeffX(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-pure-white border border-border-clean space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-charcoal leading-relaxed font-medium">
                Koefisien adalah bilangan yang mengalikan variabel untuk melipatgandakan nilai wadah. Jika koefisien bernilai negatif seperti $-3x$, tanda negatif melekat pada angka pengalinya.
              </p>
              <button
                onClick={() => handleSpeakExplanation(`Koefisien adalah angka yang melipatgandakan variabel x. Pada bentuk ${coeffA} x, koefisiennya adalah ${coeffA}.`)}
                className="p-1.5 rounded-lg bg-ivory text-forest hover:bg-sage/20 transition-colors ml-3 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: CONSTANT EXPLORER */}
      {activeTab === 'constant' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-ivory p-6 sm:p-8 border border-border-clean flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center justify-between w-full border-b border-border-clean pb-3">
              <span className="text-xs sm:text-sm font-semibold text-charcoal">Bagian Berubah (3x) vs Bagian Tetap ({constC})</span>
              <div className="font-mono text-forest font-bold text-base bg-pure-white px-3 py-1 rounded-xl border border-border-clean shadow-subtle">
                3x + {constC} = {3 * constX + constC}
              </div>
            </div>

            {/* Split Comparison Cards */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg py-2">
              <div className="p-5 rounded-2xl bg-pure-white border border-border-clean text-center space-y-1.5 flex-1 shadow-subtle">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text block">
                  Bagian Berubah (3x)
                </span>
                <div className="text-2xl font-bold font-mono text-forest">
                  3 × {constX} = {3 * constX}
                </div>
                <span className="text-[11px] text-secondary-text">Berubah saat x digeser</span>
              </div>

              <span className="text-2xl font-bold text-charcoal">+</span>

              <div className="p-5 rounded-2xl bg-pure-white border border-border-clean text-center space-y-1.5 flex-1 shadow-subtle">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text block">
                  Konstanta Tetap ({constC})
                </span>
                <div className="text-2xl font-bold font-mono text-terracotta">
                  {constC}
                </div>
                <span className="text-[11px] text-secondary-text">Nilai selalu konstan</span>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-2 border-t border-border-clean">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-secondary-text">
                  <span className="font-medium text-charcoal">Nilai $x$:</span>
                  <span className="font-bold font-mono text-forest text-sm">{constX}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={constX}
                  onChange={(e) => setConstX(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-secondary-text">
                  <span className="font-medium text-charcoal">Nilai Konstanta ($c$):</span>
                  <span className="font-bold font-mono text-terracotta text-sm">{constC}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={constC}
                  onChange={(e) => setConstC(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-pure-white border border-border-clean space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-charcoal leading-relaxed font-medium">
                Konstanta adalah suku aljabar yang nilainya mandiri dan tidak terpengaruh oleh variabel. Contoh: biaya dasar Rp 5.000 selalu tetap berapapun jumlah $x$.
              </p>
              <button
                onClick={() => handleSpeakExplanation(`Konstanta adalah suku aljabar yang nilainya mandiri dan tidak dipengaruhi oleh perubahan variabel.`)}
                className="p-1.5 rounded-lg bg-ivory text-forest hover:bg-sage/20 transition-colors ml-3 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: ALGEBRAIC EXPRESSION EXPLORER */}
      {activeTab === 'expression' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-ivory p-6 sm:p-8 border border-border-clean flex flex-col items-center justify-center space-y-5">
            <div className="flex items-center justify-between w-full border-b border-border-clean pb-3">
              <span className="text-xs sm:text-sm font-semibold text-charcoal">Evaluasi Bertahap Bentuk Aljabar</span>
              <div className="font-mono text-forest font-bold text-base bg-pure-white px-3 py-1 rounded-xl border border-border-clean shadow-subtle">
                {exprA}x + {exprC} (x={exprX})
              </div>
            </div>

            {/* Steps Rendering */}
            <div className="w-full max-w-lg space-y-2.5">
              {calculationSteps?.steps?.map((step) => (
                <div key={step.step_number} className="flex items-center justify-between p-3.5 rounded-xl bg-pure-white border border-border-clean text-xs shadow-subtle">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-forest mr-2">
                      LANGKAH {step.step_number}:
                    </span>
                    <span className="text-charcoal font-medium">{step.description}</span>
                  </div>
                  <span className="font-mono text-forest font-bold bg-ivory px-2.5 py-1 rounded-lg border border-border-clean">
                    {step.expression_state}
                  </span>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-forest/10 border border-forest/30 text-center">
                <span className="text-xs text-secondary-text block">Hasil Akhir Evaluasi:</span>
                <span className="text-2xl font-bold font-mono text-forest">
                  {calculationSteps?.result}
                </span>
              </div>
            </div>

            {/* Presets: 5 Mandated Cases */}
            <div className="w-full max-w-lg pt-3 border-t border-border-clean space-y-2">
              <span className="text-xs font-semibold text-charcoal block">Pilih Contoh Soal Standar:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { a: 3, c: 5, x: 4, expected: 17, label: '3x + 5 (x=4)' },
                  { a: 5, c: 0, x: 3, expected: 15, label: '5x (x=3)' },
                  { a: -3, c: 0, x: 2, expected: -6, label: '-3x (x=2)' },
                  { a: 7, c: -4, x: 2, expected: 10, label: '7x - 4 (x=2)' },
                  { a: 4, c: 6, x: 5, expected: 26, label: '4x + 6 (x=5)' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setExprA(preset.a);
                      setExprC(preset.c);
                      setExprX(preset.x);
                    }}
                    className="p-2.5 rounded-xl bg-pure-white hover:border-forest border border-border-clean text-left text-xs transition-colors font-mono shadow-subtle"
                  >
                    <span className="block text-charcoal font-semibold">{preset.label}</span>
                    <span className="text-forest text-[11px] font-bold">= {preset.expected}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-pure-white border border-border-clean space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-charcoal leading-relaxed font-medium">
                Metode substitusi mengganti huruf variabel dengan bilangan yang ditentukan, mengalikannya dengan koefisien, lalu menjumlahkan konstanta.
              </p>
              <button
                onClick={() => handleSpeakExplanation(`Substitusi adalah mengganti variabel x dengan nilai bilangan lalu menghitung hasil akhirnya.`)}
                className="p-1.5 rounded-lg bg-ivory text-forest hover:bg-sage/20 transition-colors ml-3 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: 3D BALANCE SCALE */}
      {activeTab === 'balance3d' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-ivory p-6 sm:p-8 border border-border-clean space-y-6">
            <div className="flex items-center justify-between border-b border-border-clean pb-3">
              <div>
                <span className="text-xs font-semibold text-forest uppercase tracking-wider block">Model Persamaan Linear</span>
                <h4 className="text-base sm:text-lg font-bold text-charcoal">Persamaan Neraca: 3x + 5 = 14</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-secondary-text block">Status Target</span>
                <span className="font-mono text-sm font-bold text-charcoal">Ruas Kanan = 14</span>
              </div>
            </div>

            {/* Dominant 3D Balance Scene */}
            <AlgebraBalance3D
              leftWeight={3 * balanceX + 5}
              rightWeight={14}
              isBalanced={3 * balanceX + 5 === 14}
            />

            {/* Integrated Controls & Real-time Indicator */}
            <div className="p-5 rounded-2xl bg-pure-white border border-border-clean space-y-3 max-w-xl mx-auto shadow-subtle">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-charcoal font-medium">Uji Nilai Variabel ($x$):</span>
                <span className="font-bold font-mono text-forest text-base">x = {balanceX}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={balanceX}
                onChange={(e) => setBalanceX(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer h-2 bg-ivory rounded-lg border border-border-clean"
              />
              <div className="text-xs font-mono text-center text-charcoal pt-1">
                Ruas Kiri: 3({balanceX}) + 5 = <strong className="text-forest font-bold text-sm">{3 * balanceX + 5}</strong> vs Ruas Kanan: <strong className="text-charcoal font-bold text-sm">14</strong>
              </div>

              {3 * balanceX + 5 === 14 ? (
                <div className="p-3 rounded-xl bg-sage/20 border border-sage/40 text-forest text-xs font-semibold text-center">
                  ✓ Benar! Neraca seimbang horizontal saat x = 3.
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-ivory border border-border-clean text-secondary-text text-xs text-center">
                  Geser nilai x hingga ruas kiri menghasilkan tepat 14.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-pure-white border border-border-clean space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-charcoal leading-relaxed font-medium">
                Persamaan aljabar bekerja layaknya neraca dua lengan. Nilai $x$ adalah solusi yang membuat timbangan berada dalam keadaan seimbang (*equilibrium*).
              </p>
              <button
                onClick={() => handleSpeakExplanation(`Persamaan aljabar bekerja seperti neraca timbangan dua lengan. Kedua ruas harus memiliki beban yang sama persis agar seimbang.`)}
                className="p-1.5 rounded-lg bg-ivory text-forest hover:bg-sage/20 transition-colors ml-3 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 6: CONTEXTUAL SIMULATION */}
      {activeTab === 'contextual' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-ivory p-6 sm:p-8 border border-border-clean flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center justify-between w-full border-b border-border-clean pb-3">
              <span className="text-xs sm:text-sm font-semibold text-charcoal">Simulasi Pembelian Alat Tulis</span>
              <span className="font-mono text-forest font-bold text-sm">B = 5.000x + 3.000</span>
            </div>

            <div className="w-full max-w-md bg-pure-white rounded-2xl p-6 border border-border-clean space-y-4 shadow-subtle">
              <div className="flex items-center gap-3 border-b border-border-clean pb-3">
                <div className="w-10 h-10 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal text-sm">Buku Tulis & Tempat Pensil</h4>
                  <p className="text-[11px] text-secondary-text">Buku @ Rp 5.000 & Satu Kotak Pensil Rp 3.000</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-forest/10 border border-forest/20 text-center space-y-1">
                <span className="text-xs text-secondary-text block">Total Pengeluaran:</span>
                <span className="text-2xl font-bold font-mono text-forest">
                  Rp {(bookPrice * bookCount + pencilCost).toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-secondary-text font-mono block">
                  (5.000 × {bookCount}) + 3.000
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-border-clean">
                <div className="flex justify-between text-xs text-secondary-text">
                  <span className="font-medium text-charcoal">Jumlah Buku ($x$):</span>
                  <span className="font-bold font-mono text-forest text-sm">{bookCount} Buku</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={bookCount}
                  onChange={(e) => setBookCount(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-pure-white border border-border-clean space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-charcoal leading-relaxed font-medium">
                Model matematika $B = 5000x + 3000$ menghubungkan harga satuan buku (variabel $x$) dengan biaya tetap kotak pensil secara kontekstual.
              </p>
              <button
                onClick={() => handleSpeakExplanation(`Model matematika membantu menghitung total belanja dengan rumus 5000 dikali jumlah buku ditambah biaya kotak pensil 3000 rupiah.`)}
                className="p-1.5 rounded-lg bg-ivory text-forest hover:bg-sage/20 transition-colors ml-3 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
