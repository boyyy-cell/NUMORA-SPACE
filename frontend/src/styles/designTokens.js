/**
 * NUMORA Space — Centralized Design Tokens (v1.6)
 * Design Concept: MIDNIGHT ORCHID
 *
 * Core Palette:
 * - Midnight Plum: #19151F (Primary canvas background)
 * - Deep Aubergine: #28222F (Sidebar, navbar, panel surfaces)
 * - Soft Orchid: #B69AD9 (Primary brand & conceptual accent)
 * - Warm Apricot: #F0A77E (Interaction, highlights, CTA, negative tokens)
 * - Sage Green: #A8BFA9 (Success, equilibrium, completed progress)
 * - Ivory White: #F5EFE5 (High-contrast readable text & symbols)
 * - Muted Lavender: #C8B9C9 (Secondary text, metadata, subtle borders)
 */

export const designTokens = {
  colors: {
    // Canvas & Surface
    bg: {
      primary: '#19151F',       // Midnight Plum
      secondary: '#28222F',     // Deep Aubergine
      card: '#221C29',          // Elevated card surface
      inset: '#14101A',         // Deeper dark inset
    },
    // Accents
    accent: {
      orchid: '#B69AD9',        // Soft Orchid
      apricot: '#F0A77E',       // Warm Apricot
      sage: '#A8BFA9',          // Sage Green
      orchidGlow: 'rgba(182, 154, 217, 0.20)',
      apricotGlow: 'rgba(240, 167, 126, 0.25)',
      sageGlow: 'rgba(168, 191, 169, 0.25)',
    },
    // Typography
    text: {
      primary: '#F5EFE5',       // Ivory White
      secondary: '#C8B9C9',     // Muted Lavender
      dim: '#857787',           // Inactive / Disabled
    },
    // Semantics
    semantic: {
      success: '#A8BFA9',       // Sage Green
      warning: '#F0A77E',       // Warm Apricot
      error: '#E87989',         // Muted Coral
      info: '#B69AD9',          // Soft Orchid
    },
    // Borders
    border: {
      subtle: 'rgba(200, 185, 201, 0.12)',
      orchid: 'rgba(182, 154, 217, 0.30)',
      apricot: 'rgba(240, 167, 126, 0.35)',
      sage: 'rgba(168, 191, 169, 0.35)',
    }
  },
  typography: {
    fontSans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },
  radius: {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.25rem',   // 20px
    full: '9999px',
  },
  shadows: {
    soft: '0 10px 30px -10px rgba(10, 7, 14, 0.7)',
    glowOrchid: '0 0 25px -5px rgba(182, 154, 217, 0.22)',
    glowApricot: '0 0 25px -5px rgba(240, 167, 126, 0.25)',
    cardSoft: '0 12px 32px -8px rgba(14, 10, 19, 0.65)',
  }
};
