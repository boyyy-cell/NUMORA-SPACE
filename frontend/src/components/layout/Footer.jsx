import React from 'react';
import BrandLogo from '../common/BrandLogo';
import { Sparkles, GraduationCap, Microscope } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-pure-white border-t border-[#28332C]/14 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <BrandLogo showTagline={true} size="default" />
            <p className="text-xs text-secondary-text leading-relaxed max-w-md">
              NUMORA Space membantu siswa SMP kelas VII memahami konsep aljabar melalui visualisasi interaktif dan pendampingan berpikir AI NORA.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-forest bg-sage/15 px-3 py-1.5 rounded-xl border border-sage/30">
              <Sparkles className="w-3.5 h-3.5 text-forest" />
              <span>NUMORA Space v1.6 — Sage & Ivory Edition</span>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-forest" />
              Fondasi Aljabar
            </h4>
            <ul className="space-y-1.5 text-xs text-secondary-text">
              <li>1. Variabel ($x, y$)</li>
              <li>2. Koefisien ($ax$)</li>
              <li>3. Konstanta ($c$)</li>
              <li>4. Bentuk Aljabar ($ax + b$)</li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3 flex items-center gap-1.5">
              <Microscope className="w-3.5 h-3.5 text-terracotta" />
              Navigasi Cepat
            </h4>
            <ul className="space-y-1.5 text-xs text-secondary-text">
              <li><a href="/login" className="hover:text-forest transition-colors">Masuk Platform</a></li>
              <li><a href="/student-dashboard" className="hover:text-forest transition-colors">Ruang Siswa</a></li>
              <li><a href="/researcher-dashboard" className="hover:text-forest transition-colors">Ruang Peneliti</a></li>
              <li><span className="text-secondary-text/80">API Backend: FastAPI</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#28332C]/14 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary-text">
          <div>
            © {new Date().getFullYear()} NUMORA Space. Tagline: <span className="text-forest font-semibold">Algebra, Beyond Formulas.</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-ivory border border-[#28332C]/14 text-charcoal">
              Sage & Ivory
            </span>
            <span>Platform Pembelajaran Matematika SMP Kelas VII</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
