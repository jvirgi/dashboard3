import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9dbff',
          300: '#8ac3ff',
          400: '#5aa9ff',
          500: '#2a8cff',
          600: '#1672e6',
          700: '#0e59b4',
          800: '#0b478f',
          900: '#093a74'
        },
        accentPink: '#ed64a6',
        accentPurple: '#7c3aed',
        accentTeal: '#14b8a6',
        accentAmber: '#f59e0b',
        accentLime: '#84cc16'
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(2, 6, 23, 0.25)'
      },
      backgroundImage: {
        'radial': 'radial-gradient(ellipse at top left, rgba(45, 212, 191, 0.25), rgba(99, 102, 241, 0.25))',
        'linear-hero': 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(236,72,153,0.15))'
      }
    }
  },
  plugins: []
}
export default config