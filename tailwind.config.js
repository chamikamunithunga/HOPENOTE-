/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#0891b2',
          soft: 'rgba(8, 145, 178, 0.08)',
          strong: '#0e7490',
          light: '#22d3ee',
        },
        // Accent/Secondary
        accent: {
          DEFAULT: '#22c55e',
          soft: 'rgba(34, 197, 94, 0.25)',
        },
        // Background colors
        bg: {
          DEFAULT: '#f5fbfb',
          alt: '#eef5f6',
          dark: '#020617',
        },
        // Surface colors
        surface: {
          DEFAULT: '#ffffff',
          dark: '#020617',
        },
        // Text colors
        'text-main': {
          DEFAULT: '#0f172a',
          dark: '#e5e7eb',
        },
        'text-muted': {
          DEFAULT: '#64748b',
          dark: '#9ca3af',
        },
        // Border colors
        'border-subtle': {
          DEFAULT: 'rgba(15, 23, 42, 0.06)',
          dark: 'rgba(15, 23, 42, 0.7)',
        },
        // Teal/cyan shades (for hero label)
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          600: '#0d9488',
          700: '#0f766e',
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Roboto', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '18px',
        'md': '12px',
        'xl': '20px',
        '2xl': '28px',
        'pill': '999px',
      },
      boxShadow: {
        'soft': '0 18px 40px rgba(15, 23, 42, 0.08)',
        'subtle': '0 10px 25px rgba(15, 23, 42, 0.04)',
        'soft-dark': '0 20px 45px rgba(0, 0, 0, 0.7)',
        'subtle-dark': '0 12px 30px rgba(0, 0, 0, 0.6)',
        'primary': '0 14px 30px rgba(8, 145, 178, 0.5)',
        'primary-sm': '0 8px 20px rgba(8, 145, 178, 0.5)',
        'logo': '0 12px 30px rgba(8, 145, 178, 0.5)',
      },
      backgroundImage: {
        'app-gradient': 'radial-gradient(circle at top left, #e0f2fe 0, #f5fbfb 40%, #e5f6f9 100%)',
        'app-gradient-dark': 'radial-gradient(circle at top left, #020617 0, #020617 30%, #020617 100%)',
        'hero-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(240, 253, 250, 0.96))',
        'hero-btn': 'linear-gradient(135deg, #0891b2, #22c55e)',
        'navbar-gradient': 'linear-gradient(to bottom, rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.7), transparent)',
        'section-alt': 'linear-gradient(135deg, var(--color-bg-alt), #f9fafb)',
      },
      maxWidth: {
        'container': '1120px',
        'section-header': '640px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      fontSize: {
        'hero': ['1.9rem', { lineHeight: '1.2' }],
        'section-title': ['1.4rem', { lineHeight: '1.3' }],
      },
      transitionDuration: {
        '160': '160ms',
      },
      backdropBlur: {
        'nav': '16px',
      },
    },
  },
  plugins: [],
}
