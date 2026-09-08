import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // GDC palette (pulled from the live Fabric theme) + high-contrast base
        ink: '#050505',
        paper: '#ffffff',
        cream: '#EDEBE7',
        mauve: '#713F50',
        powder: '#CBDEE8',
        smoke: '#8A8A8A',
      },
      fontFamily: {
        // Condensed, bold display type (Gymking-style); body stays clean
        display: ['var(--font-display)', 'Arial Narrow', 'sans-serif'],
        sans: ['var(--font-body)', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        brand: '0.08em',
      },
      maxWidth: {
        site: '1600px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
