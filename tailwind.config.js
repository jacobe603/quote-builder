/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        svl: {
          // Blues
          navy: '#042144',
          blue: '#0058A4',
          'blue-bright': '#0583F0',
          'blue-light': '#F0F8FF',
          // Greens
          forest: '#235800',
          green: '#47B100',
          'green-light': '#EFFEE9',
          // Oranges
          burnt: '#A74D00',
          orange: '#E46B03',
          'orange-light': '#FEF6EE',
          // Reds
          burgundy: '#640000',
          red: '#EA1313',
          'red-light': '#FCEFEE',
          // Yellows
          mustard: '#7A7400',
          yellow: '#E4D716',
          'yellow-light': '#FFFCC9',
          // Greyscale
          black: '#070707',
          'gray-dark': '#666D77',
          gray: '#C4CAD5',
          'gray-light': '#F2F5FA',
          white: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
