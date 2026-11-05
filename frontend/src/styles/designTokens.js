/**
 * NUMORA Space — Centralized Design Tokens (v1.6 Phase 1.5)
 * Design Concept: SAGE & IVORY
 *
 * Core Palette:
 * - Warm Ivory: #F6F5EF (Primary canvas background)
 * - Pure White: #FFFFFF (Card surfaces, panels, modal dialogs)
 * - Forest Green: #355B45 (Primary buttons, active navigation, key brand elements)
 * - Soft Sage: #A7BCA8 (Supporting accent, positive tokens, balance indicators)
 * - Muted Terracotta: #D58B68 (Highlights, negative algebraic tokens, warnings)
 * - Charcoal: #28332C (Primary typography, high contrast)
 * - Secondary Text: #707A70 (Secondary typography, captions, metadata)
 * - Border: #E1E5DC (Dividers, borders, subtle outlines)
 */

export const designTokens = {
  colors: {
    // Canvas & Surfaces
    bg: {
      primary: '#F6F5EF',       // Warm Ivory
      card: '#FFFFFF',          // Pure White
      panel: '#FFFFFF',         // Pure White
      subtle: '#EFEFE8',        // Slightly deeper ivory for nested insets
      darkInset: '#E8ECE4',     // Muted sage inset
    },
    // Primary Brand & Accents
    brand: {
      forest: '#355B45',        // Forest Green
      forestHover: '#2B4B38',   // Deeper Forest Green
      sage: '#A7BCA8',          // Soft Sage
      terracotta: '#D58B68',    // Muted Terracotta
    },
    // Typography
    text: {
      primary: '#28332C',       // Charcoal
      secondary: '#707A70',     // Muted Secondary Text
      inverted: '#FFFFFF',      // White text on dark buttons
      terracotta: '#D58B68',
      forest: '#355B45',
    },
    // Semantics
    semantic: {
      success: '#355B45',       // Forest Green
      successBg: '#EFF5F1',
      warning: '#D58B68',       // Muted Terracotta
      warningBg: '#FDF5F0',
      error: '#C85A5A',
      errorBg: '#FDF0F0',
      info: '#5B7A8C',
      infoBg: '#F0F6FA',
    },
    // Borders & Dividers
    border: {
      default: '#E1E5DC',       // Border
      focus: '#355B45',         // Forest Green focus ring
      subtle: '#ECEFE8',
      terracotta: 'rgba(213, 139, 104, 0.40)',
      forest: 'rgba(53, 91, 69, 0.35)',
    }
  },
  typography: {
    fontSans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
  },
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  shadows: {
    subtle: '0 1px 3px 0 rgba(40, 51, 44, 0.05), 0 1px 2px -1px rgba(40, 51, 44, 0.05)',
    card: '0 2px 8px -2px rgba(40, 51, 44, 0.06), 0 1px 4px -1px rgba(40, 51, 44, 0.04)',
    elevated: '0 10px 25px -5px rgba(40, 51, 44, 0.08), 0 8px 10px -6px rgba(40, 51, 44, 0.04)',
  }
};
