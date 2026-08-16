export default {
  theme: {
    extend: {
      colors: {
        canvas: '#f4f6f8',
        surface: '#ffffff',
        ink: {
          DEFAULT: '#101418',
          soft: '#5a6673',
          faint: '#8b95a1',
        },
        line: {
          DEFAULT: '#e3e7ec',
          strong: '#cfd6de',
        },
        accent: {
          DEFAULT: '#2251d4',
          ink: '#1a3fa8',
          soft: '#eef2ff',
        },
        flag: {
          DEFAULT: '#9a5300',
          soft: '#fff5e8',
          line: '#f0d5ae',
        },
        good: {
          DEFAULT: '#0f7a52',
          soft: '#e9f6f0',
        },
        stage: '#1b2029',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(16,20,24,0.05), 0 12px 28px -18px rgba(16,20,24,0.35)',
      },
    },
  },
}

