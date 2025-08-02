/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-red': '#B90B06',
        'brand-red-dark': '#a20d08',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        pacifico: ['Pacifico', 'cursive'],
        'dancing-script': ['Dancing Script', 'cursive'],
        caveat: ['Caveat', 'cursive'],
        'great-vibes': ['Great Vibes', 'cursive'],
        'homemade-apple': ['Homemade Apple', 'cursive'],
        kalam: ['Kalam', 'cursive'],
      }
    }
  },
  plugins: [],
}
