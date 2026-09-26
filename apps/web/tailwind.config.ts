import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        muted: '#6B6B6B',
        paper: '#FAFAF8',
        line: '#E7E7E2',
        verified: '#4F7D5C',
        pending: '#B58B2A',
        suspicious: '#B86832',
        rejected: '#A84A4A'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular']
      }
    }
  },
  plugins: []
};

export default config;
