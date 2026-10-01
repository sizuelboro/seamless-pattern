/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        ink: { 50: '#f7f7f8', 100: '#eeeef0', 200: '#dcdce0', 300: '#bfc0c6', 400: '#8f9099', 500: '#6b6c75', 600: '#4f5058', 700: '#393a41', 800: '#25262b', 850: '#1c1d21', 900: '#151518', 950: '#0e0e10' },
        brand: { 50: '#f1f0ff', 100: '#e4e2ff', 200: '#cbc7ff', 300: '#a9a1ff', 400: '#8a7cff', 500: '#6f5cf6', 600: '#5d47e6', 700: '#4d39c4', 800: '#3f309e', 900: '#342b7d' },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(16,16,20,0.04), 0 1px 1px rgba(16,16,20,0.03)',
        float: '0 8px 30px rgba(16,16,20,0.12), 0 2px 6px rgba(16,16,20,0.06)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': { from: { opacity: '0', transform: 'translateY(6px) scale(0.98)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'slide-left': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'toast-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
        'pop-in': 'pop-in 200ms cubic-bezier(0.2,0.8,0.2,1)',
        'sheet-up': 'sheet-up 240ms cubic-bezier(0.2,0.8,0.2,1)',
        'slide-left': 'slide-left 240ms cubic-bezier(0.2,0.8,0.2,1)',
        'toast-in': 'toast-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
