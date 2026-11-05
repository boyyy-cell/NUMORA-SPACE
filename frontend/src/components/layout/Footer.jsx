import React from 'react';
import BrandLogo from '../common/BrandLogo';
import { MathText } from '../common/MathView';
import { Sparkles, GraduationCap, Microscope, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-pure-white border-t border-[#28332C]/20 pt-12 pb-8 mt-16">
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
              <li><MathText text="1. Variabel ($x, y$)" /></li>
              <li><MathText text="2. Koefisien ($ax$)" /></li>
              <li><MathText text="3. Konstanta ($c$)" /></li>
              <li><MathText text="4. Bentuk Aljabar ($ax + b$)" /></li>
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

        {/* Bottom bar with Creator Identity */}
        <div className="pt-6 border-t border-[#28332C]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary-text">
          <div className="space-y-2 text-center md:text-left">
            <div>
              © {new Date().getFullYear()} NUMORA Space. Tagline: <span className="text-forest font-semibold">Algebra, Beyond Formulas.</span>
            </div>

            {/* Identitas Pembuat */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs flex-wrap">
              <span className="text-charcoal font-semibold">Dikembangkan oleh Farid Syahputra</span>
              <span className="text-secondary-text/40 hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/frdsyhptraa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-interactive inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ivory hover:bg-sage/20 border border-[#28332C]/14 text-forest font-medium transition-colors"
                  title="Instagram Farid Syahputra"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
                <span className="text-secondary-text/40">·</span>
                <a
                  href="https://github.com/boyyy-cell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-interactive inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ivory hover:bg-sage/20 border border-[#28332C]/14 text-forest font-medium transition-colors"
                  title="GitHub Farid Syahputra"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-ivory border border-[#28332C]/20 text-charcoal font-medium">
              Sage & Ivory
            </span>
            <span>Platform Pembelajaran Matematika SMP Kelas VII</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
