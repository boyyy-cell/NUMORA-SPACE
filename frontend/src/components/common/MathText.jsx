import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * MathText Component
 * Renders prose text containing inline math ($...$ or \(...\)) and display math ($$...$$ or \[...\])
 * using KaTeX without displaying raw dollar or LaTeX delimiter characters.
 *
 * Example:
 *   <MathText text="Variabel $x$ bertindak sebagai wadah penampung nilai." />
 */
export default function MathText({ text, className = '' }) {
  const renderedElements = useMemo(() => {
    if (text === null || text === undefined) return null;
    if (typeof text !== 'string') return text;

    // Fast-path: if text contains no math indicators, return as plain text
    if (!text.includes('$') && !text.includes('\\(') && !text.includes('\\[') && !text.includes('$$')) {
      return text;
    }

    // Regex to capture:
    // 1. Display math: $$...$$ or \[...\]
    // 2. Inline math: $...$ or \(...\)
    const mathRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([^\n]+?\\\))/g;
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
              key={`display-math-dollar-${idx}`}
              className="katex-display-wrapper my-2 block text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={`err-display-dollar-${idx}`} className="font-mono text-forest">
              {mathContent}
            </span>
          );
        }
      }

      // Display math (\[...\])
      if (part.startsWith('\\[') && part.endsWith('\\]') && part.length > 4) {
        const mathContent = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(mathContent, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={`display-math-bracket-${idx}`}
              className="katex-display-wrapper my-2 block text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={`err-display-bracket-${idx}`} className="font-mono text-forest">
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
              key={`inline-math-dollar-${idx}`}
              className="katex-inline-wrapper font-mono mx-0.5 inline-block text-forest font-semibold"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={`err-inline-dollar-${idx}`} className="font-mono italic text-forest">
              {mathContent}
            </span>
          );
        }
      }

      // Inline math (\(...\))
      if (part.startsWith('\\(') && part.endsWith('\\)') && part.length > 4) {
        const mathContent = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(mathContent, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={`inline-math-paren-${idx}`}
              className="katex-inline-wrapper font-mono mx-0.5 inline-block text-forest font-semibold"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={`err-inline-paren-${idx}`} className="font-mono italic text-forest">
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
