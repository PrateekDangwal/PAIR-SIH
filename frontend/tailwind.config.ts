import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './hooks/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        chassis: '#e0e5ec',
        panel: '#f0f2f5',
        recessed: '#d1d9e6',
        ink: '#2d3436',
        slate: '#4a5568',
        accent: '#ff4757',
        'accent-dark': '#e63b4b',
        'shadow-dark': '#babecc',
        'shadow-deep': '#a3b1c6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        industrial: '8px 8px 16px #babecc, -8px -8px 16px #ffffff',
        floating: '12px 12px 24px #babecc, -12px -12px 24px #ffffff, inset 1px 1px 0 rgba(255,255,255,.55)',
        pressed: 'inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff',
        recessed: 'inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff',
        sharp: '4px 4px 8px rgba(0,0,0,.15), -1px -1px 1px rgba(255,255,255,.8)',
      },
      keyframes: {
        'mechanical-in': { '0%': { opacity: '0', transform: 'translateY(16px) scale(.98)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        'soft-pulse': { '0%,100%': { opacity: '.55' }, '50%': { opacity: '1' } },
        'scan': { '0%': { transform: 'translateY(-120%)' }, '100%': { transform: 'translateY(120%)' } },
        'spin-slow': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'mechanical-in': 'mechanical-in .55s cubic-bezier(.175,.885,.32,1.275) both',
        'soft-pulse': 'soft-pulse 2s ease-in-out infinite',
        scan: 'scan 4s linear infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
