/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sap: {
          blue: '#0070f2',
          dark: '#1a1a2e',
          panel: '#16213e',
          card: '#0f3460',
        },
      },
    },
  },
  plugins: [],
};
