/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3B82F6', // main action color — change here to retheme
          secondary: '#6366F1',
          like: '#22C55E', // swipe right / like
          dislike: '#EF4444', // swipe left / dislike
          superlike: '#F59E0B', // swipe up / super like
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F9FAFB',
          card: '#FFFFFF',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          inverse: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
