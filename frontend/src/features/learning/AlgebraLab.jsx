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
  Sparkles,
  Box
} from 'lucide-react';

export default function AlgebraLab() {
  const [activeTab, setActiveTab] = useState('variable'); // variable, coefficient, constant, expression, contextual, balance3d

  // Variable Explorer State
  const [xVal, setXVal] = useState(3);

  // Coefficient Explorer State
  const [coeffA, setCoeffA] = useState(3);
  const [coeffX, setCoeffX] = useState(2);

  // Constant Explorer State
  const [constX, setConstX] = useState(2);
  const [constC, setConstC] = useState(5);

  // Expression Explorer State
  const [exprA, setExprA] = useState(4);
  const [exprC, setExprC] = useState(6);
  const [exprX, setExprX] = useState(5);
  const [calculationSteps, setCalculationSteps] = useState(null);

  // Contextual Simulation State (Buku & Pensil)
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

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-lavender/15 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lavender/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orchid flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-apricot" />
              Laboratorium Eksplorasi Konseptual
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orchid/15 text-orchid border border-orchid/25">
              Midnight Orchid Engine v1.6
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-ivory mt-1">
            Interactive Algebra Lab
          </h3>
          <p className="text-xs text-lavender">
            Manipulasi variabel, amati perubahan bentuk visual, dan rasakan makna aljabar secara langsung.
          </p>
        </div>

        {/* Global Sound Control */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleMuteToggle}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors border ${
              isMuted
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-aubergine text-lavender hover:text-ivory border-lavender/15'
            }`}
            title={isMuted ? 'Suara Dinonaktifkan' : 'Suara Aktif'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-orchid" />}
            <span className="text-[11px] font-mono">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      {/* Explorer Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-plum/70 border border-lavender/10 text-xs">
        {[
          { id: 'variable', label: '1. Variable Explorer', icon: Box, subtitle: 'Wadah Nilai x' },
          { id: 'coefficient', label: '2. Coefficient Explorer', icon: Layers, subtitle: 'Pelipatganda ax' },
          { id: 'constant', label: '3. Constant Explorer', icon: Hash, subtitle: 'Bagian Tetap c' },
          { id: 'expression', label: '4. Algebraic Expression', icon: GitBranch, subtitle: 'Bentuk Utuh ax+b' },
          { id: 'contextual', label: '5. Contextual Simulation', icon: ShoppingBag, subtitle: 'PISA Literacy' },
          { id: 'balance3d', label: '6. 3D Balance Scale', icon: Sliders, subtitle: 'Timbangan Tiga Dimensi' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                voiceService.stop();
                setIsSpeaking(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orchid/25 to-apricot/20 text-ivory border border-orchid/40 shadow-sm font-semibold'
                  : 'text-lavender hover:text-ivory hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orchid' : ''}`} />
              <div className="text-left">
                <span className="block leading-tight">{tab.label}</span>
                <span className="text-[9px] text-lavender/70 hidden sm:block">{tab.subtitle}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VARIABLE EXPLORER */}
      {activeTab === 'variable' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Playground */}
            <div className="lg:col-span-7 rounded-2xl bg-plum/85 border border-lavender/15 p-6 flex flex-col justify-between space-y-6 shadow-card-soft">
              <div className="flex items-center justify-between text-xs text-lavender border-b border-lavender/10 pb-2">
                <span>Model Mental: Wadah Bernama $x$</span>
                <MathView math={`x = ${xVal}`} className="text-orchid font-bold text-sm" />
              </div>

              {/* Dynamic Wadah Visualization */}
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="relative p-6 rounded-3xl bg-aubergine/90 border-2 border-dashed border-orchid/50 shadow-glow-orchid text-center space-y-3">
                  <div className="text-xs uppercase font-bold tracking-wider text-orchid font-mono">
                    Wadah Variabel [ x ]
                  </div>

                  {/* Visual tokens inside the box */}
                  <div className="flex flex-wrap items-center justify-center gap-2 max-w-[200px] min-h-[60px] p-3 rounded-2xl bg-plum/90 border border-lavender/10">
                    {xVal === 0 ? (
                      <span className="text-xs text-lavender/70 italic">Wadah kosong (0 unit)</span>
                    ) : xVal > 0 ? (
                      Array.from({ length: Math.min(xVal, 20) }).map((_, i) => (
                        <span
                          key={i}
                          className="w-5 h-5 rounded-md bg-gradient-to-tr from-sage to-emerald-600 text-plum font-bold text-[10px] flex items-center justify-center shadow-sm"
                        >
                          1
                        </span>
                      ))
                    ) : (
                      Array.from({ length: Math.min(Math.abs(xVal), 20) }).map((_, i) => (
                        <span
                          key={i}
                          className="w-5 h-5 rounded-md bg-gradient-to-tr from-apricot to-rose-500 text-plum font-bold text-[10px] flex items-center justify-center shadow-sm"
                        >
                          -1
                        </span>
                      ))
                    )}
                  </div>

                  <div className="text-xs font-semibold text-ivory">
                    Muatan nilai dalam wadah = <span className="font-mono text-orchid text-sm">{xVal}</span>
                  </div>
                </div>
              </div>

              {/* Slider Control */}
              <div className="space-y-2 pt-2 border-t border-lavender/10">
                <div className="flex justify-between text-xs text-lavender">
                  <span>Geser untuk mengubah nilai variabel $x$:</span>
                  <span className="font-bold text-orchid font-mono text-sm">x = {xVal}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="10"
                  value={xVal}
                  onChange={(e) => setXVal(Number(e.target.value))}
                  className="w-full accent-orchid cursor-pointer h-2 bg-aubergine rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-lavender">
                  <span className="text-apricot">-5 (Negatif)</span>
                  <span>0 (Nol)</span>
                  <span className="text-sage">10 (Positif)</span>
                </div>
              </div>
            </div>

            {/* Explanation Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ivory text-sm">Makna Variabel dalam Aljabar</h4>
                  <button
                    onClick={() => handleSpeakExplanation(`Variabel adalah simbol atau huruf yang mewakili suatu nilai yang dapat berubah-ubah. Saat ini nilai x adalah ${xVal}.`)}
                    className="p-1.5 rounded-lg bg-aubergine hover:bg-aubergine-light text-orchid border border-lavender/10 transition-colors"
                    title="Dengarkan Narasi Suara"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-lavender leading-relaxed">
                  Variabel (seperti lambang $x$) bertindak sebagai <strong>wadah penampung nilai</strong>. Variabel bukanlah nama benda mati, melainkan besaran angka yang nilainya dapat bervariasi atau belum diketahui.
                </p>

                <div className="p-3 rounded-xl bg-plum/70 border border-lavender/10 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orchid block">
                    Observasi Dinamis:
                  </span>
                  <ul className="space-y-1.5 text-ivory/80 text-[11px]">
                    <li>• Saat $x = {xVal}$, wadah memuat total <strong>{xVal} unit</strong>.</li>
                    <li>• Token hijau Sage Green melambangkan nilai positif, dan token Warm Apricot melambangkan muatan negatif.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orchid/10 border border-orchid/20 text-xs text-orchid flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-apricot" />
                <span>Cobalah geser ke angka negatif (-1 s/d -5) untuk melihat token muatan negatif!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COEFFICIENT EXPLORER */}
      {activeTab === 'coefficient' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl bg-plum/85 border border-lavender/15 p-6 flex flex-col justify-between space-y-6 shadow-card-soft">
              <div className="flex items-center justify-between text-xs text-lavender border-b border-lavender/10 pb-2">
                <span>Model Kelipatan: Suku $ax$</span>
                <MathView math={`${coeffA}x = ${coeffA * coeffX}`} className="text-apricot font-bold text-sm" />
              </div>

              {/* Multiple Group Boxes */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="text-xs text-lavender mb-3">
                  Terdapat <strong className="text-ivory">{Math.abs(coeffA)} kelompok wadah $x$</strong> {coeffA < 0 ? '(Berarah Negatif)' : ''}:
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 max-w-md">
                  {coeffA === 0 ? (
                    <div className="p-4 rounded-xl bg-aubergine border border-lavender/10 text-xs text-lavender">
                      Koefisien 0: 0 × x = 0 (Tidak ada kelompok wadah)
                    </div>
                  ) : (
                    Array.from({ length: Math.min(Math.abs(coeffA), 6) }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-20 h-20 rounded-2xl p-2 flex flex-col items-center justify-center border-2 shadow-md transition-all ${
                          coeffA < 0
                            ? 'bg-apricot/15 border-apricot/60 shadow-glow-apricot'
                            : 'bg-aubergine border-orchid/60 shadow-glow-orchid'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold text-ivory">
                          {coeffA < 0 ? '-x' : 'x'}
                        </span>
                        <span className="text-[10px] text-lavender">isi = {coeffX}</span>
                        <span className={`text-[11px] font-bold font-mono ${coeffA < 0 ? 'text-apricot' : 'text-orchid'}`}>
                          {coeffA < 0 ? -coeffX : coeffX}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 p-2.5 rounded-xl bg-aubergine border border-lavender/10 text-xs font-mono text-center">
                  Total Nilai = {coeffA} × ({coeffX}) = <strong className="text-apricot text-sm">{coeffA * coeffX}</strong>
                </div>
              </div>

              {/* Sliders for Coefficient A and Value X */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-lavender/10">
                <div>
                  <div className="flex justify-between text-xs text-lavender mb-1">
                    <span>Koefisien ($a$):</span>
                    <span className="font-bold font-mono text-apricot">{coeffA}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="5"
                    value={coeffA}
                    onChange={(e) => setCoeffA(Number(e.target.value))}
                    className="w-full accent-apricot cursor-pointer h-2 bg-aubergine rounded-lg"
                  />
                  <span className="text-[9px] text-lavender block mt-0.5">Mendukung koefisien negatif</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-lavender mb-1">
                    <span>Nilai $x$:</span>
                    <span className="font-bold font-mono text-orchid">{coeffX}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={coeffX}
                    onChange={(e) => setCoeffX(Number(e.target.value))}
                    className="w-full accent-orchid cursor-pointer h-2 bg-aubergine rounded-lg"
                  />
                  <span className="text-[9px] text-lavender block mt-0.5">Besaran muatan per wadah</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ivory text-sm">Memahami Koefisien & Tanda Negatif</h4>
                  <button
                    onClick={() => handleSpeakExplanation(`Koefisien adalah angka yang melipatgandakan variabel. Pada bentuk ${coeffA} x, koefisiennya adalah ${coeffA}.`)}
                    className="p-1.5 rounded-lg bg-aubergine hover:bg-aubergine-light text-orchid border border-lavender/10 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-lavender leading-relaxed">
                  Koefisien menunjukkan <strong>berapa kali variabel dijumlahkan</strong>. Misalnya, $3x = x + x + x$. Jika koefisien bernilai negatif seperti $-3x$, tanda minus ikut melekat pada faktor pengalinya.
                </p>

                <div className="p-3 rounded-xl bg-plum/70 border border-lavender/10 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-apricot block">
                    Perbandingan Bentuk:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-aubergine text-ivory">x = 1 kelompok</div>
                    <div className="p-2 rounded bg-aubergine text-ivory">2x = 2 kelompok</div>
                    <div className="p-2 rounded bg-aubergine text-ivory">3x = 3 kelompok</div>
                    <div className="p-2 rounded bg-aubergine text-apricot">-3x = 3 kelompok negatif</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-aubergine border border-lavender/10 text-xs text-lavender">
                💡 Aturan Penulisan: Jika koefisien bernilai -1, kita menuliskannya ringkas sebagai <strong className="text-ivory">-x</strong> tanpa angka satu.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONSTANT EXPLORER */}
      {activeTab === 'constant' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl bg-plum/85 border border-lavender/15 p-6 flex flex-col justify-between space-y-6 shadow-card-soft">
              <div className="flex items-center justify-between text-xs text-lavender border-b border-lavender/10 pb-2">
                <span>Diferensiasi: Bagian Berubah vs Bagian Tetap</span>
                <MathView math={`3x + ${constC}`} className="text-sage font-bold text-sm" />
              </div>

              {/* Split visualization */}
              <div className="py-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="p-4 rounded-2xl bg-aubergine border border-orchid/30 text-center space-y-2 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orchid block">
                    Bagian Berubah (3x)
                  </span>
                  <div className="text-xl font-black font-mono text-ivory">
                    3 × {constX} = {3 * constX}
                  </div>
                  <span className="text-[10px] text-lavender block">
                    Nilai ini BERUBAH saat $x$ digeser
                  </span>
                </div>

                <span className="text-2xl font-black text-ivory">+</span>

                <div className="p-4 rounded-2xl bg-plum border border-sage/40 text-center space-y-2 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                    Bagian Tetap ({constC})
                  </span>
                  <div className="text-xl font-black font-mono text-sage">
                    {constC}
                  </div>
                  <span className="text-[10px] text-sage/80 block">
                    NILAI TETAP (Konstan)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-aubergine border border-lavender/10 text-center text-xs">
                Total Bentuk Aljabar = ({3 * constX}) + ({constC}) = <strong className="text-sage font-mono text-sm">{3 * constX + constC}</strong>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-lavender/10">
                <div>
                  <div className="flex justify-between text-xs text-lavender mb-1">
                    <span>Ubah Nilai $x$ (Wadah Berubah):</span>
                    <span className="font-bold font-mono text-orchid">{constX}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={constX}
                    onChange={(e) => setConstX(Number(e.target.value))}
                    className="w-full accent-orchid cursor-pointer h-2 bg-aubergine rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-lavender mb-1">
                    <span>Ubah Nilai Konstanta ($c$):</span>
                    <span className="font-bold font-mono text-sage">{constC}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={constC}
                    onChange={(e) => setConstC(Number(e.target.value))}
                    className="w-full accent-sage cursor-pointer h-2 bg-aubergine rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ivory text-sm">Mengapa Disebut Konstanta?</h4>
                  <button
                    onClick={() => handleSpeakExplanation(`Konstanta adalah suku aljabar yang nilainya konstan atau tetap, tidak dipengaruhi oleh perubahan nilai variabel x.`)}
                    className="p-1.5 rounded-lg bg-aubergine hover:bg-aubergine-light text-orchid border border-lavender/10 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-lavender leading-relaxed">
                  Kata <em>konstanta</em> berasal dari kata <em>konstan</em> yang berarti tetap. Pada bentuk $3x + 5$, angka 5 adalah konstanta karena nilainya tetap 5 walaupun $x$ berubah menjadi seribu atau minus sepuluh.
                </p>

                <div className="p-3.5 rounded-xl bg-plum/70 border border-lavender/10 text-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage block">
                    Analogi Dunia Nyata:
                  </span>
                  <p className="text-lavender text-[11px] leading-relaxed">
                    Biaya parkir motor tetap Rp 2.000 (Konstanta) ditambah biaya sewa per jam Rp 3.000 (3x). Berapa pun lama parkir, biaya dasar awal Rp 2.000 tidak pernah berubah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALGEBRAIC EXPRESSION EXPLORER */}
      {activeTab === 'expression' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl bg-plum/85 border border-lavender/15 p-6 flex flex-col justify-between space-y-6 shadow-card-soft">
              <div className="flex items-center justify-between text-xs text-lavender border-b border-lavender/10 pb-2">
                <span>Evaluasi Bertahap Bentuk Aljabar</span>
                <MathView math={`${exprA}x + ${exprC}`} className="text-orchid font-bold text-sm" />
              </div>

              {/* Step-by-Step Calculation Engine */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-aubergine border border-orchid/30 text-center">
                  <span className="text-[11px] text-lavender block">Bentuk Aljabar Target:</span>
                  <span className="text-lg font-black font-mono text-orchid">
                    {exprA}x + {exprC}
                  </span>
                  <span className="text-xs text-ivory block mt-1">
                    Evaluasi untuk nilai substitusi <strong className="text-apricot font-mono">x = {exprX}</strong>
                  </span>
                </div>

                {calculationSteps?.steps?.map((step) => (
                  <div key={step.step_number} className="flex items-center justify-between p-3 rounded-xl bg-aubergine/70 border border-lavender/10 text-xs">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-orchid mr-2">
                        LANGKAH {step.step_number}:
                      </span>
                      <span className="text-ivory font-medium">{step.description}</span>
                    </div>
                    <span className="font-mono text-orchid font-bold bg-plum px-2 py-1 rounded border border-lavender/10">
                      {step.expression_state}
                    </span>
                  </div>
                ))}

                <div className="p-3.5 rounded-xl bg-gradient-to-r from-orchid/20 to-apricot/20 border border-orchid/35 text-center">
                  <span className="text-xs text-lavender block">Hasil Akhir Evaluasi:</span>
                  <span className="text-2xl font-black font-mono text-ivory">
                    {calculationSteps?.result}
                  </span>
                </div>
              </div>

              {/* Mandated Math Test Presets */}
              <div className="space-y-2 pt-3 border-t border-lavender/10">
                <span className="text-xs text-lavender block">Pilih Contoh Uji Standar Kurikulum:</span>
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
                      className="p-2 rounded-xl bg-aubergine hover:bg-aubergine-light hover:border-orchid/30 border border-lavender/10 text-left text-[11px] transition-all font-mono"
                    >
                      <span className="block text-ivory font-semibold">{preset.label}</span>
                      <span className="text-orchid text-[10px]">Hasil = {preset.expected}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ivory text-sm">Metode Substitusi Aljabar</h4>
                  <button
                    onClick={() => handleSpeakExplanation(`Untuk mengevaluasi bentuk aljabar, kita mengganti huruf x dengan nilai yang diberikan, mengalikannya dengan koefisien, lalu menambahkan konstanta.`)}
                    className="p-1.5 rounded-lg bg-aubergine hover:bg-aubergine-light text-orchid border border-lavender/10 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-lavender leading-relaxed">
                  Substitusi berarti <strong>mengganti</strong> variabel huruf dengan nilai bilangan sebenarnya. Selalu selesaikan operasi perkalian koefisien terlebih dahulu sebelum penjumlahan konstanta!
                </p>

                <div className="p-3 rounded-xl bg-plum/70 border border-lavender/10 text-xs space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orchid block">
                    Interpretasi Konteks:
                  </span>
                  <p className="text-lavender text-[11px] leading-relaxed">
                    {calculationSteps?.interpretation || 'Perhitungan diproses secara terstruktur.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONTEXTUAL SIMULATION (PISA LITERACY) */}
      {activeTab === 'contextual' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-2xl bg-plum/85 border border-lavender/15 p-6 flex flex-col justify-between space-y-6 shadow-card-soft">
              <div className="flex items-center justify-between text-xs text-lavender border-b border-lavender/10 pb-2">
                <span>Simulasi Toko Alat Tulis (Literasi PISA)</span>
                <span className="text-xs font-mono font-bold text-apricot">Model: B = 5.000x + 3.000</span>
              </div>

              {/* Contextual Card */}
              <div className="p-4 rounded-2xl bg-aubergine border border-lavender/15 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-apricot/20 border border-apricot/30 flex items-center justify-center text-apricot">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ivory text-sm">Pembelian Perlengkapan Siswa</h4>
                    <p className="text-[11px] text-lavender">Buku Tulis @ Rp 5.000 & Satu Kotak Pensil Rp 3.000</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-plum border border-lavender/10">
                    <span className="text-lavender block text-[10px]">Harga 1 Buku (Koefisien):</span>
                    <span className="font-bold text-orchid font-mono">Rp 5.000</span>
                  </div>
                  <div className="p-3 rounded-xl bg-plum border border-lavender/10">
                    <span className="text-lavender block text-[10px]">Biaya Kotak Pensil (Konstanta):</span>
                    <span className="font-bold text-sage font-mono">Rp 3.000</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-orchid/15 to-apricot/15 border border-orchid/25 text-center space-y-1">
                  <span className="text-xs text-lavender">Total Pengeluaran Belanja (B):</span>
                  <div className="text-2xl font-black font-mono text-ivory">
                    Rp {(bookPrice * bookCount + pencilCost).toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-apricot font-mono block">
                    (5.000 × {bookCount}) + 3.000 = {(bookPrice * bookCount + pencilCost).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Slider for book count */}
              <div className="space-y-2 pt-2 border-t border-lavender/10">
                <div className="flex justify-between text-xs text-lavender">
                  <span>Jumlah Buku yang Dibeli (Variabel $x$):</span>
                  <span className="font-bold font-mono text-orchid text-sm">{bookCount} Buku</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={bookCount}
                  onChange={(e) => setBookCount(Number(e.target.value))}
                  className="w-full accent-orchid cursor-pointer h-2 bg-aubergine rounded-lg"
                />
              </div>
            </div>

            {/* 3 Proses Matematika PISA */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h4 className="font-bold text-ivory text-sm">3 Pilar Literasi Matematis (PISA)</h4>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-plum/70 border border-orchid/30 space-y-1">
                    <div className="font-bold text-orchid flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-orchid/20 text-orchid flex items-center justify-center text-[10px]">1</span>
                      <span>FORMULATE (Memformulasikan)</span>
                    </div>
                    <p className="text-[11px] text-lavender">
                      Mengubah masalah belanja menjadi model simbolik aljabar: <strong className="text-ivory font-mono">B = 5000x + 3000</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-plum/70 border border-apricot/30 space-y-1">
                    <div className="font-bold text-apricot flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-apricot/20 text-apricot flex items-center justify-center text-[10px]">2</span>
                      <span>EMPLOY (Menerapkan & Menghitung)</span>
                    </div>
                    <p className="text-[11px] text-lavender">
                      Mensubstitusi nilai $x = {bookCount}$ dan menghitung operasi aritmetika secara presisi.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-plum/70 border border-sage/30 space-y-1">
                    <div className="font-bold text-sage flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sage/20 text-sage flex items-center justify-center text-[10px]">3</span>
                      <span>INTERPRET (Menafsirkan Makna)</span>
                    </div>
                    <p className="text-[11px] text-lavender">
                      Menjelaskan bahwa total Rp {(bookPrice * bookCount + pencilCost).toLocaleString('id-ID')} cukup untuk membeli {bookCount} buku dan 1 kotak pensil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: 3D BALANCE SCALE */}
      {activeTab === 'balance3d' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <AlgebraBalance3D
                leftWeight={3 * xVal + 5}
                rightWeight={14}
                isBalanced={3 * xVal + 5 === 14}
              />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-orchid bg-orchid/15 px-2 py-0.5 rounded border border-orchid/25">
                  Prinsip Ekuivalensi
                </span>
                <h4 className="text-base font-bold text-ivory mt-1">
                  Mencari Keseimbangan Persamaan
                </h4>
                <p className="text-xs text-lavender leading-relaxed mt-1">
                  Persamaan aljabar layaknya timbangan dua lengan. Timbangan akan seimbang horizontal jika nilai di ruas kiri persis sama dengan ruas kanan: <strong className="text-orchid font-mono">3x + 5 = 14</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-plum/80 border border-lavender/10 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-lavender">Uji Nilai x:</span>
                  <span className="font-bold font-mono text-orchid text-sm">x = {xVal}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={xVal}
                  onChange={(e) => setXVal(Number(e.target.value))}
                  className="w-full accent-orchid cursor-pointer h-2 bg-aubergine rounded-lg"
                />
                <div className="text-[11px] font-mono text-center pt-1 text-ivory">
                  Ruas Kiri: 3({xVal}) + 5 = <strong className="text-orchid">{3 * xVal + 5}</strong> vs Target: <strong className="text-apricot">14</strong>
                </div>
              </div>

              {3 * xVal + 5 === 14 ? (
                <div className="p-3 rounded-xl bg-sage/20 border border-sage/40 text-sage text-xs flex items-center gap-2">
                  <span><strong>Hebat! Persamaan Seimbang.</strong> Nilai x = 3 adalah penyelesaian yang benar untuk 3x + 5 = 14.</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-aubergine border border-lavender/10 text-lavender text-xs flex items-center gap-2">
                  <span>Geser nilai x hingga ruas kiri menghasilkan tepat 14.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
