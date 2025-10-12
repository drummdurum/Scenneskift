/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#800020',
        gold: '#d4af37',
        cream: '#f5f5dc',
      }
    },
  },
  plugins: [],
}

