/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#14284b', dark: '#0a1a33' },
        gold: '#c9a227',
        teal: { DEFAULT: '#74bac5', dark: '#4f9fae' },
        menu: '#1b1d21',
        footer: '#333333',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'wave-drift': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%': { transform: 'translateY(-5px) rotate(3deg)' },
        },
        sail: {
          '0%': { transform: 'translateX(-15vw)' },
          '100%': { transform: 'translateX(115vw)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.12)' },
        },
        'cloud-drift': {
          '0%': { transform: 'translateX(-35vw)' },
          '100%': { transform: 'translateX(120vw)' },
        },
        'rain-fall': {
          '0%': { top: '-8%', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { top: '108%', opacity: '1' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        flash: {
          '0%, 90%, 100%': { opacity: '0' },
          '92%': { opacity: '0.85' },
          '94%': { opacity: '0.1' },
          '96%': { opacity: '0.7' },
          '98%': { opacity: '0' },
        },
        'fog-drift': {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(10%)' },
        },
        'sun-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'wave-bars': {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'wave-drift': 'wave-drift 14s linear infinite',
        'wave-drift-slow': 'wave-drift 24s linear infinite',
        bob: 'bob 3.5s ease-in-out infinite',
        sail: 'sail 50s linear infinite',
        'ken-burns': 'ken-burns 26s ease-in-out infinite alternate',
        'cloud-drift': 'cloud-drift 60s linear infinite',
        'rain-fall': 'rain-fall 1s linear infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        flash: 'flash 7s linear infinite',
        'fog-drift': 'fog-drift 18s ease-in-out infinite alternate',
        'sun-pulse': 'sun-pulse 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
        'wave-bars': 'wave-bars 1.8s ease-in-out infinite',
        'spin-slow': 'spin 60s linear infinite',
      },
    },
  },
  plugins: [],
}
