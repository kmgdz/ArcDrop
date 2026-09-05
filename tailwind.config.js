/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        d: {
          void:    '#03050B',
          bg:      '#060A12',
          surface: '#0A1020',
          card:    '#0E1628',
          raised:  '#131E32',
          border:  '#1A2C44',
          line:    '#223550',
          gold:    '#F5A623',
          'gold-2':'#E09010',
          gdim:    '#F5A62318',
          blue:    '#2775CA',
          bdim:    '#2775CA18',
          green:   '#10B981',
          grdim:   '#10B98118',
          red:     '#EF4444',
          rdim:    '#EF444418',
          text:    '#E8F2FF',
          dim:     '#5A7898',
          muted:   '#1A2C44',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease-out both',
        'scale-in':   'scaleIn 0.25s ease-out both',
        'float':      'float 5s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s linear infinite',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity:'0', transform:'translateY(20px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        scaleIn:   { '0%': { opacity:'0', transform:'scale(0.9)' }, '100%': { opacity:'1', transform:'scale(1)' } },
        float:     { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-12px)' } },
        pulseGold: { '0%,100%': { boxShadow:'0 0 16px #F5A62330' }, '50%': { boxShadow:'0 0 40px #F5A62366' } },
        shimmer:   { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
        bounceIn:  { '0%': { opacity:'0', transform:'scale(0.6)' }, '70%': { transform:'scale(1.05)' }, '100%': { opacity:'1', transform:'scale(1)' } },
      },
    },
  },
  plugins: [],
}
