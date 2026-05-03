/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#ff2d7a',
        secondary: '#00f5d4',
        gold: '#ffd700',
        dark: '#0a0a0f',
        card: '#12121a',
        border: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'radar': 'radar 2s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'primary': '0 0 20px rgba(255, 45, 122, 0.3)',
        'secondary': '0 0 20px rgba(0, 245, 212, 0.3)',
        'gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
