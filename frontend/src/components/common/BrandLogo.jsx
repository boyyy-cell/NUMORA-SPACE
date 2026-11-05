import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ showTagline = false, size = 'default', linkTo = '/' }) {
  const iconSizes = {
    sm: 'w-7 h-7',
    default: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    default: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-3 select-none group">
      <div className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-forest/10 border border-forest/20 transition-transform group-hover:scale-105`}>
        <svg viewBox="0 0 64 64" className="w-5/6 h-5/6">
          <path
            d="M18 46 L18 18 L34 38 L34 18"
            stroke="#355B45"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="44" cy="20" r="4.5" fill="#355B45" />
          <path d="M34 38 L46 46" stroke="#D58B68" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="46" cy="46" r="3" fill="#A7BCA8" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-wider text-charcoal ${textSizes[size]}`}>
            NUMORA
          </span>
          <span className="font-semibold text-forest tracking-wider text-[0.65em] uppercase px-1.5 py-0.5 rounded bg-sage/20 border border-sage/40">
            SPACE
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-wide text-secondary-text mt-1">
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
