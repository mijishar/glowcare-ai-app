/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal:   { 50:'#f0fdfa',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a' },
        cyan:   { 50:'#ecfeff',100:'#cffafe',200:'#a5f3fc',300:'#67e8f9',400:'#22d3ee',500:'#06b6d4' },
        violet: { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed' },
        fuchsia:{ 50:'#fdf4ff',100:'#fae8ff',200:'#f5d0fe',300:'#f0abfc',400:'#e879f9',500:'#d946ef' },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      backgroundImage: {
        'premium': 'linear-gradient(135deg, #0f766e 0%, #0d9488 30%, #06b6d4 60%, #7c3aed 100%)',
        'premium-soft': 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 40%, #f5f3ff 100%)',
        'card-glow': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,250,0.8) 100%)',
      },
      boxShadow: {
        'glow-teal': '0 0 30px rgba(20,184,166,0.25), 0 4px 16px rgba(20,184,166,0.15)',
        'glow-violet': '0 0 30px rgba(124,58,237,0.2), 0 4px 16px rgba(124,58,237,0.1)',
        'premium': '0 8px 40px rgba(15,118,110,0.2), 0 2px 8px rgba(0,0,0,0.08)',
        'card': '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
