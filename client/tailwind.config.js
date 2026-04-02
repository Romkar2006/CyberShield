/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: {
            primary: '#0A0F1E',
            surface: '#0D1526',
            elevated: '#1E293B',
            overlay: '#0F172A',
          },
          text: {
            primary: '#E2E8F0',
            secondary: '#94A3B8',
            muted: '#64748B',
            inverse: '#0A0F1E',
          },
          border: {
            default: 'rgba(255, 255, 255, 0.08)',
            active: '#00D4FF',
            danger: 'rgba(239, 68, 68, 0.40)',
            success: 'rgba(34, 197, 94, 0.40)',
            warning: 'rgba(245, 158, 11, 0.40)'
          }
        },
        light: {
          bg: {
            primary: '#F8FAFC',
            surface: '#FFFFFF',
            elevated: '#F1F5F9',
            overlay: '#FFFFFF',
            sidebar: '#0F172A',
          },
          text: {
            primary: '#0F172A',
            secondary: '#475569',
            muted: '#94A3B8',
            inverse: '#FFFFFF',
          },
          border: {
            default: 'rgba(0, 0, 0, 0.08)',
            active: '#0099BB',
            danger: 'rgba(239, 68, 68, 0.40)',
            success: 'rgba(34, 197, 94, 0.40)',
            warning: 'rgba(245, 158, 11, 0.40)'
          }
        },
        cyan: {
          DEFAULT: '#00D4FF',
          dark: '#00D4FF',
          light: '#0099BB',
          glow: 'rgba(0, 212, 255, 0.15)',
          'glow-strong': 'rgba(0, 212, 255, 0.30)'
        },
        violet: {
          DEFAULT: '#7C3AED',
          dark: '#7C3AED',
          light: '#6D28D9',
          glow: 'rgba(124, 58, 237, 0.40)'
        },
        critical: '#EF4444',
        high: '#F59E0B',
        medium: '#EAB308',
        low: '#22C55E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        blink: 'blink 1.2s ease-in-out infinite',
        float: 'float 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
