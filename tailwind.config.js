/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#40948d",
        background: "#c6dbdc",
        button: "#71a3c1",
      },
    },
  },
  plugins: [],
}
