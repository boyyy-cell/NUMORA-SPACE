import React, { useMemo } from 'react';
import katex from 'katex';

export default function MathView({ math, block = false, className = '' }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-math font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

