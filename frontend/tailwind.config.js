/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary MIDNIGHT ORCHID Palette
        orchid: {
          DEFAULT: "#B69AD9",
          50: "#FAF7FC",
          100: "#F2EDF8",
          200: "#E3D6F0",
          300: "#CEBBE6",
          400: "#B69AD9",
          500: "#9A78C5",
          600: "#7F5AAB",
          700: "#63438A",
          800: "#482F66",
          900: "#301D47",
        },
        apricot: {
          DEFAULT: "#F0A77E",
          50: "#FEF7F3",
          100: "#FCEEE5",
          200: "#F9D7C4",
          300: "#F5BEA1",
          400: "#F0A77E",
          500: "#E88955",
          600: "#D36D33",
          700: "#A95222",
          800: "#7C3B17",
          900: "#53250E",
        },
        sage: {
          DEFAULT: "#A8BFA9",
          100: "#EBF1EC",
          200: "#D4E1D5",
          300: "#BDD1BE",
          400: "#A8BFA9",
          500: "#8FA890",
          600: "#718972",
        },
        plum: {
          DEFAULT: "#19151F",
          950: "#130F18",
        },
        aubergine: {
          DEFAULT: "#28222F",
          light: "#332C3C",
          dark: "#211B27",
        },
        ivory: {
          DEFAULT: "#F5EFE5",
          muted: "#E8DEC9",
        },
        lavender: {
          DEFAULT: "#C8B9C9",
          dark: "#8E7D90",
        },

        // Semantic & Legacy Alias Mapping for Full Backward-Compatibility
        numora: {
          bg: "#19151F",            // Midnight Plum
          surface: "#28222F",       // Deep Aubergine
          card: "#221C29",          // Elevated card surface
          cyan: "#B69AD9",          // Soft Orchid (Replaced Blue Cyan)
          violet: "#F0A77E",        // Warm Apricot (Replaced Electric Violet)
          white: "#F5EFE5",         // Ivory White
          muted: "#C8B9C9",         // Muted Lavender
          success: "#A8BFA9",       // Sage Green
          warning: "#F0A77E",       // Warm Apricot
          error: "#E87989",         // Soft Muted Coral
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-orchid': '0 0 25px -5px rgba(182, 154, 217, 0.25)',
        'glow-apricot': '0 0 25px -5px rgba(240, 167, 126, 0.25)',
        'glow-sage': '0 0 25px -5px rgba(168, 191, 169, 0.25)',
        'card-soft': '0 12px 32px -8px rgba(14, 10, 19, 0.65)',
        'glow-cyan': '0 0 25px -5px rgba(182, 154, 217, 0.25)',    // alias for compatibility
        'glow-violet': '0 0 25px -5px rgba(240, 167, 126, 0.25)',  // alias for compatibility
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.75' },
        }
      }
    },
  },
  plugins: [],
}
