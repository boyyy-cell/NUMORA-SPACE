/**
 * NUMORA Space — Centralized Design Tokens (v1.5)
 * Premium Futuristic Palette & Layout Geometry
 */

export const designTokens = {
  colors: {
    bg: {
      primary: '#0B1426',    // Dark Navy Base
      secondary: '#111F34',  // Elevated Navy Surface
      card: '#16243A',       // Card Surface
      subtle: '#0E192E',     // Deep inset
    },
    accent: {
      cyan: '#62D9F5',       // Soft Cyan (Hero & Primary Focus)
      violet: '#8875F8',     // Soft Violet (Secondary Accent)
      cyanGlow: 'rgba(98, 217, 245, 0.25)',
      violetGlow: 'rgba(136, 117, 248, 0.25)',
    },
    text: {
      white: '#F3F6FC',      // Cloud White (Heading & Body)
      muted: '#A8B6CA',      // Muted Slate Text (Subtitles & Meta)
      dim: '#6C7D93',        // Inactive / Disabled
    },
    semantic: {
      success: '#54C9A4',    // Soft Jade Green
      warning: '#E8B66C',    // Warm Amber
      error: '#E87989',      // Soft Coral Red
      info: '#62D9F5',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      cyan: 'rgba(98, 217, 245, 0.25)',
      violet: 'rgba(136, 117, 248, 0.25)',
    }
  },
  typography: {
    fontSans: "'Inter', system-ui, -apple-system, sans-serif",
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
    soft: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
    glowCyan: '0 0 25px -5px rgba(98, 217, 245, 0.25)',
    glowViolet: '0 0 25px -5px rgba(136, 117, 248, 0.25)',
  }
};

