/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07111f',
        panel: 'rgba(12, 20, 36, 0.72)',
        panelStrong: 'rgba(12, 20, 36, 0.92)',
        line: 'rgba(148, 163, 184, 0.18)',
        cyanGlow: '#2dd4bf',
        amberGlow: '#fbbf24',
        danger: '#fb7185',
        success: '#34d399',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(2, 6, 23, 0.45)',
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at top, rgba(45, 212, 191, 0.18), transparent 40%), radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.12), transparent 28%)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 7s ease-in-out infinite',
        fadeUp: 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
