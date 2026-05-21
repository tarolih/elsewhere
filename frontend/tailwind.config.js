/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f8f5ef',
        ocean: '#0e7490',
        coral: '#fb7185',
      },
    },
  },
  plugins: [],
}
