/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    screens: {
      xs:  '320px',
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
    },
    extend: {
      // ── Premium Brand Colours ──────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        accent: {
          DEFAULT: '#16A34A',
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        success: {
          DEFAULT: '#16A34A',
          50:  '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        danger: {
          DEFAULT: '#DC2626',
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          950: '#450A0A',
        },
        warning: {
          DEFAULT: '#D97706',
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          950: '#451A03',
        },
        info: {
          DEFAULT: '#2563EB',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
      },

      // ── Premium Typography ────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter',  'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora',   'Inter', 'ui-sans-serif', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1.1rem',  letterSpacing: '0.01em'  }],
        sm:   ['0.875rem', { lineHeight: '1.3rem',  letterSpacing: '0.005em' }],
        base: ['1rem',     { lineHeight: '1.6rem',  letterSpacing: '0'       }],
        lg:   ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl':['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.02em' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em'}],
        '4xl':['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.03em' }],
        '5xl':['3rem',     { lineHeight: '1',        letterSpacing: '-0.04em' }],
        '6xl':['3.75rem',  { lineHeight: '1',        letterSpacing: '-0.04em' }],
      },
      fontWeight: {
        thin:       '100',
        light:      '300',
        normal:     '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
        black:      '900',
      },

      // ── Premium Border Radius ─────────────────────────────────────
      borderRadius: {
        none:  '0',
        sm:    '0.25rem',    // 4px
        DEFAULT:'0.5rem',   // 8px
        md:    '0.625rem',   // 10px
        lg:    '0.875rem',   // 14px
        xl:    '1.25rem',    // 20px
        '2xl': '1.75rem',    // 28px
        '3xl': '2.25rem',    // 36px
        full:  '9999px',
      },

      // ── Premium Shadow System ─────────────────────────────────────
      boxShadow: {
        'xs':          '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'sm':          '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        DEFAULT:       '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'md':          '0 6px 12px -2px rgb(0 0 0 / 0.08), 0 3px 6px -3px rgb(0 0 0 / 0.05)',
        'lg':          '0 12px 24px -4px rgb(0 0 0 / 0.1), 0 6px 12px -6px rgb(0 0 0 / 0.06)',
        'xl':          '0 20px 40px -8px rgb(0 0 0 / 0.12), 0 8px 16px -8px rgb(0 0 0 / 0.06)',
        '2xl':         '0 32px 64px -12px rgb(0 0 0 / 0.18)',
        'inner':       'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)',
        'none':        'none',
        // Cards — primary depth system
        'card':        '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md':     '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.05)',
        'card-hover':  '0 12px 32px -4px rgb(0 0 0 / 0.12), 0 4px 12px -4px rgb(0 0 0 / 0.07)',
        'card-active': '0 2px 8px -2px rgb(0 0 0 / 0.1), 0 1px 4px -2px rgb(0 0 0 / 0.06)',
        // Glow effects
        'glow-primary':'0 0 0 3px rgb(37 99 235 / 0.15), 0 4px 12px rgb(37 99 235 / 0.2)',
        'glow-accent': '0 0 0 3px rgb(22 163 74 / 0.15), 0 4px 12px rgb(22 163 74 / 0.2)',
        'glow-danger': '0 0 0 3px rgb(220 38 38 / 0.15), 0 4px 12px rgb(220 38 38 / 0.2)',
        // Navbar / Sidebar
        'nav':         '0 1px 0 0 rgb(0 0 0 / 0.06)',
        'floating':    '0 8px 32px -4px rgb(0 0 0 / 0.14), 0 2px 8px -2px rgb(0 0 0 / 0.06)',
        // Modals
        'modal':       '0 24px 64px -12px rgb(0 0 0 / 0.28), 0 8px 24px -8px rgb(0 0 0 / 0.1)',
        // Input focus
        'input-focus': '0 0 0 3px rgb(37 99 235 / 0.12)',
        'input-error': '0 0 0 3px rgb(220 38 38 / 0.12)',
      },

      // ── Premium Gradients ─────────────────────────────────────────
      backgroundImage: {
        // Brand gradients
        'gradient-primary':  'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
        'gradient-accent':   'linear-gradient(135deg, #14532D 0%, #16A34A 50%, #22C55E 100%)',
        'gradient-hero':     'linear-gradient(135deg, #0f1f5c 0%, #1E3A8A 45%, #1a5c3a 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
        'gradient-glass':    'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
        // Dark mode gradients
        'gradient-dark-card':'linear-gradient(145deg, rgba(31,41,55,0.9), rgba(17,24,39,0.8))',
        // Subtle surface gradients
        'gradient-surface':  'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)',
        'gradient-surface-dark': 'linear-gradient(180deg, #111827 0%, #0D1117 100%)',
        // Mesh-style for hero
        'mesh-primary':      'radial-gradient(at 40% 20%, hsla(228,100%,74%,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.05) 0px, transparent 50%)',
      },

      // ── Animations ─────────────────────────────────────────────────
      animation: {
        // Entrances
        'fade-in':          'fadeIn 0.2s ease-out',
        'fade-in-slow':     'fadeIn 0.4s ease-out',
        'fade-out':         'fadeOut 0.15s ease-in',
        'slide-in-right':   'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-left':    'slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-up':      'slideInUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-down':    'slideInDown 0.25s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':         'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
        // Skeleton
        'pulse-skeleton':   'pulse 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':          'shimmer 1.8s ease-in-out infinite',
        // Loaders
        'spin-slow':        'spin 2s linear infinite',
        'progress-bar':     'progressBar 1.5s ease-in-out infinite',
        'bounce-dot':       'bounceDot 0.6s ease-in-out infinite alternate',
        // Floating
        'float':            'float 3s ease-in-out infinite',
        'float-slow':       'float 5s ease-in-out infinite',
        // Pulse glow for notifications
        'pulse-glow':       'pulseGlow 2s ease-in-out infinite',
        // Count up
        'count-up':         'countUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%':   { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-6px)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        progressBar: {
          '0%':   { transform: 'translateX(-100%)' },
          '50%':  { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bounceDot: {
          '0%':   { transform: 'translateY(0)', opacity: '0.5' },
          '100%': { transform: 'translateY(-8px)', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.4)' },
          '50%':     { boxShadow: '0 0 0 6px rgba(220, 38, 38, 0)' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // ── Backdrop Blur ─────────────────────────────────────────────
      backdropBlur: {
        xs:  '2px',
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl':'24px',
        '3xl':'40px',
      },

      // ── Z-Index Scale ─────────────────────────────────────────────
      zIndex: {
        0:   '0',
        10:  '10',
        20:  '20',
        30:  '30',
        40:  '40',
        50:  '50',
        100: '100',
        200: '200',
        999: '999',
        9999:'9999',
      },

      transitionDuration: {
        0:    '0ms',
        75:   '75ms',
        100:  '100ms',
        150:  '150ms',
        200:  '200ms',
        300:  '300ms',
        500:  '500ms',
        700:  '700ms',
        1000: '1000ms',
      },

      transitionTimingFunction: {
        'spring':        'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-soft':   'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-in-expo':  'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
      },

      // ── Spacing extras ────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },
    },
  },
  plugins: [],
}
