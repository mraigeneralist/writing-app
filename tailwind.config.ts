import type { Config } from 'tailwindcss'

/** Tokens are RGB channels in CSS vars (see src/styles/tokens.css) so opacity
 *  modifiers work, e.g. `ring-accent/40`, `bg-accent-soft`. */
const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('--bg'),
        surface: token('--surface'),
        'surface-2': token('--surface-2'),
        border: token('--border'),
        text: token('--text'),
        'text-2': token('--text-2'),
        'text-3': token('--text-3'),
        accent: token('--accent'),
        'accent-soft': token('--accent-soft'),
        'focus-warn': token('--focus-warn'),
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // role-based sizes from DESIGN.md
        prose: ['18px', { lineHeight: '1.7' }],
        focus: ['19px', { lineHeight: '1.7' }],
        ui: ['15px', { lineHeight: '1.5' }],
        meta: ['13px', { lineHeight: '1.4' }],
        section: ['17px', { lineHeight: '1.3' }],
        screen: ['22px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        pill: '999px',
      },
      spacing: {
        // DESIGN.md scale: 4 8 12 16 24 32 48 (defaults already cover most)
        '18': '4.5rem',
      },
      borderColor: {
        DEFAULT: token('--border'),
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
} satisfies Config
