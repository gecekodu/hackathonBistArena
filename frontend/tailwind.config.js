/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        arena: {
          bg: '#f8f9fb',
          surface: '#ffffff',
          sidebar: '#1e293b',
          sidebarHover: '#334155',
          sidebarActive: '#4f46e5',
          primary: '#4f46e5',
          primaryHover: '#4338ca',
          primaryLight: '#eef2ff',
          secondary: '#0ea5e9',
          secondaryLight: '#f0f9ff',
          success: '#16a34a',
          successLight: '#f0fdf4',
          successBg: '#dcfce7',
          danger: '#dc2626',
          dangerLight: '#fef2f2',
          dangerBg: '#fee2e2',
          amber: '#d97706',
          amberLight: '#fffbeb',
          amberBg: '#fef3c7',
          text: '#1e293b',
          textSecondary: '#64748b',
          textMuted: '#94a3b8',
          border: '#e2e8f0',
          borderHover: '#cbd5e1',
          hoverBg: '#f1f5f9',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        cardHover: '0 10px 25px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.04)',
        sidebar: '4px 0 24px rgba(0,0,0,0.08)',
        ticker: '0 1px 4px rgba(0,0,0,0.05)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-up': 'slide-up 0.5s ease-out both',
        'ticker-scroll': 'ticker-scroll 40s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
