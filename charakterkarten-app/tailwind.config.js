/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        camissio: {
          dunkelblau: '#1c4554',
          petrol: '#007d99',
          lila: '#a1a5dd',
          orange: '#fa5c33',
          greige: '#f0f2ed',
          'summer-gruen': '#00ab67',
          'missi-gelb': '#f5e563',
          'cam-blau': '#55c1c4',
          'summer-pink': '#de69a8',
          'youth-rot': '#f35b56',
        }
      },
      fontFamily: {
        headline: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Nunito Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

