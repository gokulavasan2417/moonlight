/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf9f1',
          100: '#f6f1de',
          200: '#ede1be',
          300: '#e1cb97',
          400: '#d5b270',
          500: '#c59a4c',
          600: '#ad7f3c',
          700: '#8b6032',
          800: '#724e2d',
          900: '#5f4129',
          950: '#362314',
        },
        slate: {
          850: '#151f30',
          950: '#0b1120',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
