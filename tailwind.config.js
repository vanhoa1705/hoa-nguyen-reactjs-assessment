/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#2E5BFF',
        nope: '#E5484D',
        super: '#F0A020',
        ink: '#14161A',
        muted: '#6E7075',
        bg: '#F2F1EE',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Helvetica', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      keyframes: {
        dfIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'df-in': 'dfIn .28s ease both',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
