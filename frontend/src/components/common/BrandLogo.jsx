import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ showTagline = false, size = 'default', linkTo = '/' }) {
  const iconSizes = {
    sm: 'w-7 h-7',
    default: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    default: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-3 select-none group">
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-orchid/20 to-apricot/20 border border-orchid/30 shadow-glow-orchid transition-transform group-hover:scale-105`}>
        <svg viewBox="0 0 64 64" className="w-5/6 h-5/6 drop-shadow-sm">
          <defs>
            <linearGradient id="logoOrchidG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B69AD9" />
              <stop offset="100%" stopColor="#F0A77E" />
            </linearGradient>
          </defs>
          <path
            d="M18 46 L18 18 L34 38 L34 18"
            stroke="url(#logoOrchidG)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="44" cy="20" r="4.5" fill="#B69AD9" />
          <path d="M34 38 L46 46" stroke="#F0A77E" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="46" cy="46" r="3" fill="#F0A77E" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-ivory via-orchid to-apricot ${textSizes[size]}`}>
            NUMORA
          </span>
          <span className={`font-medium text-orchid tracking-widest text-[0.65em] uppercase px-1.5 py-0.5 rounded bg-orchid/15 border border-orchid/25`}>
            SPACE
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-wide text-lavender mt-1">
            Algebra, Beyond Formulas.
          </span>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="inline-block">{content}</Link>;
  }

  return content;
}
