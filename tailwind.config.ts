import type { Config } from 'tailwindcss';

/**
 * Cinematic dark. Deliberately achromatic — the only colour on the site comes
 * from product photography and the single signal red, which is reserved for
 * drop status and stock urgency. Nothing is rounded; every corner is square.
 */
const config: Config = {
  // lib/ was missing, so every class in the PROSE constant in lib/utils.ts was
  // purged — merchant page bodies rendered with no heading or list styling at
  // all. Any file that composes class strings has to be scanned.
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        ink: '#08080A',
        carbon: '#101014',
        ash: '#17171C',
        steel: '#2A2A32',
        smoke: '#6E6E78',
        mist: '#A8A8B2',
        bone: '#EDEAE3',
        signal: '#E8481F',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.04em',
        brand: '0.18em',
        wide: '0.32em',
      },
      maxWidth: {
        site: '1680px',
      },
      transitionTimingFunction: {
        // Slow out, hard settle. Everything on the site uses one of these two.
        cine: 'cubic-bezier(0.16, 1, 0.3, 1)',
        snap: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
