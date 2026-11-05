/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SAGE & IVORY Design System
        ivory: {
          DEFAULT: "#F6F5EF",
          50: "#FAF9F6",
          100: "#F6F5EF",
          200: "#EFECE2",
          300: "#E2DDD0",
          400: "#D3CCBC",
        },
        forest: {
          DEFAULT: "#355B45",
          50: "#F2F6F3",
          100: "#E1EDE4",
          200: "#C2DACB",
          300: "#9EC2AD",
          400: "#6EA082",
          500: "#355B45",
          600: "#2B4B38",
          700: "#223B2C",
          800: "#182A1F",
          900: "#101B14",
        },
        sage: {
          DEFAULT: "#A7BCA8",
          50: "#F6F9F6",
          100: "#EDF3EE",
          200: "#DBE6DC",
          300: "#C7D8C8",
          400: "#A7BCA8",
          500: "#8FA890",
          600: "#718972",
          700: "#556A56",
        },
        terracotta: {
          DEFAULT: "#D58B68",
          50: "#FCF7F4",
          100: "#F8ECE5",
          200: "#F1DACD",
          300: "#E6BFAC",
          400: "#DD9E80",
          500: "#D58B68",
          600: "#C2744F",
          700: "#A25735",
        },
        charcoal: {
          DEFAULT: "#28332C",
          50: "#F4F5F4",
          100: "#E5E7E5",
          200: "#C8CCC8",
          300: "#A4ACA5",
          400: "#7B857D",
          500: "#59645C",
          600: "#3E4941",
          700: "#28332C",
          800: "#1D2520",
          900: "#131915",
        },
        'secondary-text': "#707A70",
        'border-clean': "rgba(40, 51, 44, 0.20)",
        'border-soft': "#CCD3C8",
        'pure-white': "#FFFFFF",

        // Backward compatibility mappings
        orchid: {
          DEFAULT: "#355B45",
          300: "#355B45",
          400: "#355B45",
          500: "#2B4B38",
        },
        apricot: {
          DEFAULT: "#D58B68",
          300: "#D58B68",
          400: "#D58B68",
          500: "#C2744F",
        },
        plum: {
          DEFAULT: "#F6F5EF",
          900: "#F6F5EF",
          950: "#EFECE2",
        },
        aubergine: {
          DEFAULT: "#FFFFFF",
          700: "#FFFFFF",
          800: "#FFFFFF",
          900: "#FFFFFF",
        },
        lavender: {
          DEFAULT: "#707A70",
          300: "#707A70",
        },

        numora: {
          bg: "#F6F5EF",            // Warm Ivory
          surface: "#FFFFFF",       // Pure White
          card: "#FFFFFF",          // Pure White
          cyan: "#355B45",          // Forest Green
          violet: "#D58B68",        // Muted Terracotta
          white: "#28332C",         // Charcoal text
          muted: "#707A70",         // Secondary Text
          success: "#355B45",       // Forest Green
          warning: "#D58B68",       // Muted Terracotta
          error: "#C85A5A",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      borderWidth: {
        DEFAULT: '1.5px',
        '0': '0',
        '1': '1px',
        '1.5': '1.5px',
        '2': '2px',
        '3': '3px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(40, 51, 44, 0.05), 0 1px 2px -1px rgba(40, 51, 44, 0.05)',
        'card-clean': '0 2px 8px -2px rgba(40, 51, 44, 0.06), 0 1px 4px -1px rgba(40, 51, 44, 0.04)',
        'card-soft': '0 4px 14px -3px rgba(40, 51, 44, 0.08)',
        'elevated': '0 10px 25px -5px rgba(40, 51, 44, 0.08), 0 8px 10px -6px rgba(40, 51, 44, 0.04)',
        'glow-orchid': 'none',
        'glow-apricot': 'none',
        'glow-sage': 'none',
        'glow-cyan': 'none',
        'glow-violet': 'none',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}