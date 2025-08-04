// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
  // border classes
  'border-purple-500', 'border-blue-500', 'border-green-500', 'border-red-500', 'border-yellow-500',
  // text classes
  'text-purple-500', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-yellow-500',

  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Quicksand"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
