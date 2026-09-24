/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Money Heist Dark Theme
        obsidian: '#0B0B0D',
        charcoal: '#151518',
        burgundy: '#3A0D13',
        crimson: '#B3132B',
        'blood-red': '#8E1021',
        'warm-ivory': '#F2E9DC',
        'muted-gold': '#B89B5E',
        steel: '#85858B',

        // Extended palette
        'obsidian-light': '#1A1A1E',
        'charcoal-light': '#2A2A30',
        'burgundy-light': '#4D1620',
        'crimson-light': '#D4364F',
        'warm-ivory-light': '#F5EFE8',
        'steel-light': '#A0A0A8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Oswald', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      animation: {
        'scan-line': 'scanLine 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'glow-crimson': '0 0 20px rgba(179, 19, 43, 0.3)',
        'glow-crimson-lg': '0 0 40px rgba(179, 19, 43, 0.4)',
      },
      backgroundImage: {
        'gradient-obsidian': 'linear-gradient(135deg, #0B0B0D 0%, #151518 100%)',
        'gradient-crimson': 'linear-gradient(135deg, #B3132B 0%, #8E1021 100%)',
      },
    },
  },
  plugins: [],
}
