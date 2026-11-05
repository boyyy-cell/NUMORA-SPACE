import React, { useMemo } from 'react';
import katex from 'katex';
import MathText from './MathText';

export { MathText };

export default function MathView({ math, block = false, className = '' }) {
  const html = useMemo(() => {
    if (!math) return '';
    try {
      // Strip outer $ or $$ if user passed them into pure MathView
      let cleanMath = String(math).trim();
      if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
        cleanMath = cleanMath.slice(2, -2).trim();
      } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
        cleanMath = cleanMath.slice(1, -1).trim();
      }

      return katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      return String(math);
    }
  }, [math, block]);

  return (
    <span
      className={`inline-math font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
