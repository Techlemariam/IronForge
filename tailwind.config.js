/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void': '#050505',
        'obsidian': '#0a0a0a',
        'magma': '#ff4d00',
        'rune': '#00aaff',
        'blood': '#ff003c',
        'forge': { // Keeping this for potential legacy or fine-tuning
          DEFAULT: '#1c1917',
          border: '#333',
          muted: '#a8a29e',
        },
      },
      fontFamily: {
        heading: ['"Cinzel"', 'serif'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
      },
      boxShadow: {
        'glow-magma': '0 0 15px rgba(255, 77, 0, 0.4)',
        'glow-rune': '0 0 15px rgba(0, 170, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
