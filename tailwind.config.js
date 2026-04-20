// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A0F2C',
          light: '#111838',
          card: '#141B3C',
        },
        indigo: {
          electric: '#4F35D2',
          hover: '#6348E8',
          glow: '#4F35D260',
        },
        soft: '#F0EEFF',
        teal: {
          accent: '#1DBFA8',
          glow: '#1DBFA820',
        },
        amber: {
          badge: '#F59E0B',
        },
        red: {
          badge: '#EF4444',
        },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
        pulse_slow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px #4F35D260, 0 0 40px #4F35D230' },
          '100%': { boxShadow: '0 0 40px #4F35D2A0, 0 0 80px #4F35D250' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, #4F35D220 0%, transparent 60%), radial-gradient(ellipse at 90% 80%, #1DBFA810 0%, transparent 50%)',
        'card-gradient': 'linear-gradient(135deg, #141B3C 0%, #0F1530 100%)',
      },
    },
  },
  plugins: [],
}
