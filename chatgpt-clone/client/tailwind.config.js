/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Custom alias tokens
        surface:   '#0f172a', // slate-900
        panel:     '#1e293b', // slate-800
        elevated:  '#334155', // slate-700
        border:    '#475569', // slate-600
        muted:     '#94a3b8', // slate-400
        subtle:    '#64748b', // slate-500
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body':         theme('colors.slate.300'),
            '--tw-prose-headings':     theme('colors.white'),
            '--tw-prose-lead':         theme('colors.slate.300'),
            '--tw-prose-links':        theme('colors.blue.400'),
            '--tw-prose-bold':         theme('colors.white'),
            '--tw-prose-counters':     theme('colors.slate.400'),
            '--tw-prose-bullets':      theme('colors.slate.400'),
            '--tw-prose-hr':           theme('colors.slate.700'),
            '--tw-prose-quotes':       theme('colors.slate.300'),
            '--tw-prose-quote-borders':theme('colors.slate.700'),
            '--tw-prose-captions':     theme('colors.slate.400'),
            '--tw-prose-code':         theme('colors.slate.200'),
            '--tw-prose-pre-code':     theme('colors.slate.200'),
            '--tw-prose-pre-bg':       theme('colors.slate.900'),
            '--tw-prose-th-borders':   theme('colors.slate.700'),
            '--tw-prose-td-borders':   theme('colors.slate.800'),
          },
        },
      }),
      animation: {
        'blink':    'blink 1s step-end infinite',
        'fade-in':  'fadeIn 0.25s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
