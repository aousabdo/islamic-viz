// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:        'var(--bg)',
        surface:   'var(--surface)',
        ink:       'var(--ink)',
        'ink-dim': 'var(--ink-dim)',
        accent:    'var(--accent)',
        'accent-d':'var(--accent-d)',
        gold:      'var(--gold)',
        'gold-d':  'var(--gold-d)',
        rule:      'var(--rule)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
      },
      fontFamily: {
        'en-body':    ['Inter', 'system-ui', 'sans-serif'],
        'en-display': ['"Instrument Serif"', 'Georgia', 'serif'],
        'ar-body':    ['Amiri', 'serif'],
        'ar-display': ['"Scheherazade New"', 'Amiri', 'serif'],
      },
      borderRadius: { lg: '8px', '2xl': '14px' },
      transitionTimingFunction: {
        'ease-out-soft': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
