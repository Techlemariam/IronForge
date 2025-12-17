const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          950: '#050505',
          900: '#0b0c0d',
          800: '#151719',
          700: '#1f2225',
          border: '#2c2f33', 
        },
        magma: {
          DEFAULT: '#ff3300',
          light: '#ef4444',
        },
        warrior: {
          DEFAULT: '#c79c6e',
          light: '#ffd700',
        },
        rarity: {
          common: '#a8a29e', // stone-400
          rare: '#0070dd',
          epic: '#a335ee',
          legendary: '#ff8000',
        },
      },
      fontFamily: {
        serif: ['"Cinzel"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 128, 0, 0.4)',
            borderColor: 'rgba(255, 128, 0, 0.7)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(255, 128, 0, 0.8)',
            borderColor: 'rgba(255, 128, 0, 1)'
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'pulse-glow': 'pulse-glow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'legendary-glow': '0 0 20px rgba(255, 128, 0, 0.4)',
      },
      textShadow: {
        'neon-cyan': '0 0 5px rgba(34, 211, 238, 0.8)',
        'neon-cyan-sm': '0 0 3px rgba(34, 211, 238, 0.6)',
      },
      backgroundImage: {
        // This creates a subtle, light noise texture on a dark background.
        // It uses an SVG with feTurbulence to generate noise, then inverts it to white with feColorMatrix.
        // The final rect has a low opacity to make the effect subtle.
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [
    plugin(function({ addUtilities, theme }) {
      const newUtilities = {
        '.custom-scrollbar': {
          '::-webkit-scrollbar': {
            width: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: theme('colors.forge.900'),
          },
          '::-webkit-scrollbar-thumb': {
            background: theme('colors.forge.border'),
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: theme('colors.warrior.DEFAULT'),
          },
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }),
    plugin(function({ theme, e, addUtilities }) {
      const textShadows = theme('textShadow');
      const utilities = Object.entries(textShadows).map(([key, value]) => ({
        [`.text-shadow-${e(key)}`]: {
          textShadow: value,
        },
      }));
      addUtilities(utilities);
    })
  ],
};
