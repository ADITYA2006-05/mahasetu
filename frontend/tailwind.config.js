/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        maha: {
          saffron: '#ff9933',
          'saffron-hover': '#e68524',
          navy: '#0b1d3a',
          'navy-light': '#162b4d',
          green: '#138808',
          'green-light': '#16a34a',
          gold: '#d97706',
          border: '#e2e8f0',
          'border-dark': '#334155',
          card: '#ffffff',
          'card-dark': '#1e293b',
          bg: '#f8fafc',
          'bg-dark': '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
