import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#006c49',
        'primary-container': '#00a86b',
        'primary-fixed': '#4ade80',
        'on-primary': '#ffffff',
        'on-primary-container': '#002114',
        'surface-container-low': '#f8faf5',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e8ebe5',
        'surface-container-highest': '#dde0da',
        'on-surface': '#191c19',
        'on-surface-variant': '#414941',
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#410002',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
