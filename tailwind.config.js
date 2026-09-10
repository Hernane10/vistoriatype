/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{css,scss}",
  ],
  theme: {
    extend: {
      colors: {
        // Suas cores personalizadas, se tiver
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Importante para suporte a tema escuro
}