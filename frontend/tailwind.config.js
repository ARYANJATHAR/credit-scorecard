/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D3557',
          dark: '#152a45',
          muted: 'rgba(29, 53, 87, 0.08)',
        },
        secondary: '#1D3557',
        accent: {
          DEFAULT: '#EC224E',
          dark: '#c91a42',
          muted: 'rgba(236, 34, 78, 0.1)',
        },
        surface: '#FFFFFF',
        ink: '#404969',
        link: '#404969',
      },
      fontFamily: {
        sans: [
          'DM Sans',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
