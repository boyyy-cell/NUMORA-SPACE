/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        numora: {
          bg: "#0B1426",
          surface: "#111F34",
          card: "#16243A",
          cyan: "#62D9F5",
          violet: "#8875F8",
          white: "#F3F6FC",
          muted: "#A8B6CA",
          success: "#54C9A4",
          warning: "#E8B66C",
          error: "#E87989",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(98, 217, 245, 0.25)',
        'glow-violet': '0 0 25px -5px rgba(136, 117, 248, 0.25)',
        'card-soft': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}

