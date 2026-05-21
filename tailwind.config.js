/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8fafc', 100: '#e2e8f0', 200: '#cbd5e1', 300: '#94a3b8',
          400: '#64748b', 500: '#475569', 600: '#334155', 700: '#1e293b',
          800: '#0f172a', 900: '#020617'
        },
        brand: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a'
        }
      }
    },
  },
  plugins: [],
}