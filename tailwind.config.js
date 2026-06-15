/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        crystal: '0 0 20px rgba(34,211,238,0.5)',
        fuel: '0 0 20px rgba(59,130,246,0.5)',
        mineral: '0 0 20px rgba(34,197,94,0.5)',
        alloy: '0 0 20px rgba(239,68,68,0.5)',
        data: '0 0 20px rgba(139,92,246,0.5)',
        darkMatter: '0 0 20px rgba(251,191,36,0.6)',
      },
    },
  },
  plugins: [],
}
