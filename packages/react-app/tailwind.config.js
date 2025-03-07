/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo-600
          light: '#6366F1',   // Indigo-500
          dark: '#3730A3'     // Indigo-800
        },
        secondary: {
          DEFAULT: '#10B981', // Emerald-500
          light: '#34D399',   // Emerald-400
          dark: '#047857'     // Emerald-700
        },
        // Behalte die bestehenden Farben für Kompatibilität
        colors: {
          primary: "#1BB775",
          disableCard: "#C8D0CB",
          primaryLight: "#CFF2E5",
          secondary: "#DFFC70",
        },
      },
    },
  },
  plugins: [],
};
