import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * MathText Component
 * Renders prose text containing inline math ($...$) and display math ($$...$$)
 * using KaTeX without displaying raw dollar characters.
 *
 * Example:
 *   <MathText text="Variabel $x$ bertindak sebagai wadah penampung nilai." />
 */
export default function MathText({ text, className = '' }) {
  const renderedElements = useMemo(() => {
    if (text === null || text === undefined) return null;
    if (typeof text !== 'string') return text;

    // Fast-path: if text contains no '$', return as plain text
    if (!text.includes('$')) {
      return text;
    }

    // Regex to capture:
    // 1. Display math: $$...$$
    // 2. Inline math: $...$ (minimum 1 char inside, excluding single unclosed dollars)
    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
    const parts = text.split(mathRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Display math ($$...$$)
      if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        const mathContent = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(mathContent, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={`display-math-${idx}`}
              className="katex-display-wrapper my-2 block text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={`err-display-${idx}`} className="font-mono text-forest">
              {mathContent}
            </span>
          );
        }
      }

      // Inline math ($...$)
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const mathContent = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(mathContent, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={`inline-math-${idx}`}
              className="katex-inline-wrapper font-mono mx-0.5 inline-block text-forest font-semibold"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={`err-inline-${idx}`} className="font-mono italic text-forest">
              {mathContent}
            </span>
          );
        }
      }

      // Regular text
      return <React.Fragment key={`text-${idx}`}>{part}</React.Fragment>;
    });
  }, [text]);

  return <span className={className}>{renderedElements}</span>;
}

