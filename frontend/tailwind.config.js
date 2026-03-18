/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E8580A',
        'primary-dark': '#C44A08',
        'primary-light': '#FFF0E8',
        dark: '#1A1208',
        warm: '#FDF6EE',
        card: '#FFFBF5',
        success: '#2D7A4F',
        danger: '#C0392B',
        muted: '#7A6A5A',
        gold: '#C8960C',
        border: '#EDE5D8',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(26,18,8,0.08)',
        'card-hover': '0 8px 30px rgba(26,18,8,0.15)',
        primary: '0 4px 20px rgba(232,88,10,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseRing: { '0%': { transform: 'scale(1)', opacity: 1 }, '100%': { transform: 'scale(2)', opacity: 0 } },
      },
    },
  },
  plugins: [],
};
