import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold:       'var(--gold)',       // #b8860b
        'gold-2':   'var(--gold2)',      // #d4a017
        'gold-lt':  'var(--gold-lt)',    // #f5e6c0
        'gold-dark':'var(--gold-dark)',  // #8a6508
        bg:         'var(--bg)',
        'bg-2':     'var(--bg2)',
        surface:    'var(--surface)',
        'surface-2':'var(--surface2)',
        cream:      'var(--cream)',
        slate:      'var(--slate)',      // #1a1f2e
        'slate-2':  'var(--slate2)',     // #2d3348
        muted:      'var(--muted)',      // #6b7280
        border:     'var(--border)',
        'border-2': 'var(--border2)',
        text:       'var(--text)',
        'text-2':   'var(--text2)',
        ev: {
          green: 'var(--green)',  // #059669
          red:   'var(--red)',    // #dc2626
          blue:  'var(--blue)',   // #2563eb
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',   // 6px
        md: 'var(--radius-md)',   // 12px
        lg: 'var(--radius-lg)',   // 20px
        xl: 'var(--radius-xl)',   // 28px
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      transitionTimingFunction: {
        ev: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
