/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./firebase/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./views/**/*.{ts,tsx}",
    "./flipbooks/**/*.{ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-red': '#B90B06',
        'brand-red-dark': '#a20d08',
        'creamy': '#FAF9F6',
        'soft-dark': '#121212',
        'surface-dark': '#1E1E1E',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        pacifico: ['Pacifico', 'cursive'],
        'dancing-script': ['Dancing Script', 'cursive'],
        caveat: ['Caveat', 'cursive'],
        'great-vibes': ['Great Vibes', 'cursive'],
        'homemade-apple': ['Homemade Apple', 'cursive'],
        kalam: ['Kalam', 'cursive'],
      },
      animation: {
        'sparkle': 'sparkle 2s infinite ease-in-out',
        'eraserSmooth': 'eraserSmooth 1.6s infinite ease-in-out',
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { transform: 'scale(0.5)', opacity: '0.5' },
          '50%': { transform: 'scale(1.3)', opacity: '1' },
        },
        eraserSmooth: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(3px) rotate(-1deg)' },
          '50%': { transform: 'translateX(6px) rotate(-2deg)' },
          '75%': { transform: 'translateX(3px) rotate(-1deg)' },
        },
      }
    }
  },
  plugins: [],
}