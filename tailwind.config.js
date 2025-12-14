/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark Luxury Theme
        dark: {
          primary: '#000000',
          secondary: '#111111',
          surface: '#1a1a1a',
          'surface-light': '#2a2a2a',
          text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
            muted: '#666666'
          }
        },
        // Accent Colors
        accent: {
          orange: '#ff6a00',
          pink: '#ff2f92',
          purple: '#7f5cff',
          cyan: '#00ffd5',
          yellow: '#ffd84d'
        },
        // Instagram Colors
        ig: {
          blue: '#0095f6',
          border: '#dbdbdb',
          background: '#ffffff',
          surface: '#fafafa'
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'pulse': 'pulse 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      }
    },
  },
  plugins: [],
};
