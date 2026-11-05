import React from 'react';
import BrandLogo from '../common/BrandLogo';
import { Sparkles, GraduationCap, Microscope } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-aubergine/80 border-t border-lavender/10 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo showTagline={true} size="default" />
            <p className="text-xs text-lavender leading-relaxed max-w-md">
              NUMORA Space adalah platform pembelajaran matematika digital masa depan yang berfokus pada pemahaman esensial aljabar untuk siswa SMP kelas VII melalui pendekatan visual interaktif, representasi model mental, dan pendampingan AI sokratik NORA.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-orchid bg-plum/70 p-2.5 rounded-xl border border-lavender/10 inline-flex">
              <Sparkles className="w-4 h-4 text-apricot" />
              <span>NUMORA Space v1.6 — Midnight Orchid Edition</span>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ivory mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-orchid" />
              Modul SMP Kelas VII
            </h4>
            <ul className="space-y-2 text-xs text-lavender">
              <li>1. Understanding Variables</li>
              <li>2. Understanding Coefficients</li>
              <li>3. Understanding Constants</li>
              <li>4. Algebraic Expressions</li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ivory mb-3 flex items-center gap-1.5">
              <Microscope className="w-3.5 h-3.5 text-apricot" />
              Portal & Demonstrasi
            </h4>
            <ul className="space-y-2 text-xs text-lavender">
              <li><a href="/login" className="hover:text-orchid transition-colors">Login Portal (Demo)</a></li>
              <li><a href="/student-dashboard" className="hover:text-orchid transition-colors">Student Space (Demo)</a></li>
              <li><a href="/researcher-dashboard" className="hover:text-apricot transition-colors">Researcher Space (2 Subjek)</a></li>
              <li><span className="text-lavender/60">FastAPI Docs: /docs</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-lavender/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-lavender">
          <div>
            © {new Date().getFullYear()} NUMORA Space. Hak Cipta Dilindungi. Tagline: <span className="text-orchid font-medium">Algebra, Beyond Formulas.</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-lavender/15 text-ivory/80">
              Midnight Orchid Design
            </span>
            <span>Dirancang dengan dedikasi untuk pendidikan matematika Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
