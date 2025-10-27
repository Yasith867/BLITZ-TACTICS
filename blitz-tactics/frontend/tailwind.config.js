export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'electric-blue': '#0EA5E9',
        'neon-purple': '#A855F7',
        'gold-accent': '#F59E0B',
        'dark-bg': '#0F172A',
        'dark-surface': '#1E293B',
        'dark-hover': '#334155',
      },
      fontFamily: {
        'game': ['"Press Start 2P"', 'cursive'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 5px #0EA5E9, 0 0 10px #0EA5E9' },
          'to': { boxShadow: '0 0 10px #A855F7, 0 0 20px #A855F7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
