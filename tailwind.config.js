/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        minecraft: {
          grass: '#5e8d35',
          dirt: '#79553a',
          stone: '#d1d1d1', // Lighter stone for background
          dark: '#1d1d21',  // Obsidian-ish
          accent: '#7c7c7c'
        }
      },
      fontFamily: {
        minecraft: ['"VT323"', 'monospace', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
