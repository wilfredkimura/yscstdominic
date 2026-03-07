export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#7B1F3A',
          light: '#9A2A4B',
          dark: '#5A1529',
        },
        gold: {
          DEFAULT: '#D4A843',
          light: '#E5C06A',
          dark: '#B38A30',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          dark: '#F2E8DC',
        },
        navy: {
          DEFAULT: '#1A1A2E',
          light: '#2A2A4A',
        },
        softWhite: '#FEFEFE',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(26, 26, 46, 0.05)',
        'glow': '0 0 15px rgba(212, 168, 67, 0.3)',
      }
    },
  },
  plugins: [],
}