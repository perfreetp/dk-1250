/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#98D8C8',
          50: '#E8F8F5',
          100: '#D1F1EA',
          200: '#A3E3D5',
          300: '#75D5C0',
          400: '#47C7AB',
          500: '#98D8C8',
          600: '#2AB896',
          700: '#22967B',
          800: '#1A7560',
          900: '#125345',
        },
        secondary: {
          DEFAULT: '#FFB347',
          50: '#FFF5E6',
          100: '#FFEACC',
          200: '#FFD599',
          300: '#FFC066',
          400: '#FFAB33',
          500: '#FFB347',
          600: '#FF9500',
          700: '#CC7700',
          800: '#995900',
          900: '#663C00',
        },
        accent: {
          DEFAULT: '#FF6B6B',
          50: '#FFE8E8',
          100: '#FFD1D1',
          200: '#FFA3A3',
          300: '#FF7575',
          400: '#FF4747',
          500: '#FF6B6B',
          600: '#E63939',
          700: '#B32D2D',
          800: '#802121',
          900: '#4D1414',
        },
        background: '#FFF9F0',
        foreground: '#2D3436',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
