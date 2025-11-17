/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        beagle: {
          orange: '#ff7a00',
          dark: '#3a2415',
          light: '#f8f5f0',
        },
      },
      fontFamily: {
        bricolage: ['var(--font-bricolage)', 'sans-serif'],
      },
      spacing: {
        '6xl': '4rem',
        '7xl': '5rem',
      },
      maxWidth: {
        '3xl': '48rem',
      },
    },
  },
  plugins: [],
}

