/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gacha-gold': '#FFD700',
        'gacha-pink': '#FF69B4',
        'gacha-purple': '#9B59B6',
      },
      animation: {
        'shake': 'shake 0.6s ease-in-out',
        'bounce-in': 'bounceIn 0.8s ease-out',
        'pop': 'pop 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px) rotate(-3deg)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px) rotate(3deg)' },
        },
        bounceIn: {
          '0%': { transform: 'translateY(-200px) scale(0.5)', opacity: '0' },
          '50%': { transform: 'translateY(30px) scale(1.1)' },
          '70%': { transform: 'translateY(-15px) scale(0.95)' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
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
