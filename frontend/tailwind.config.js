/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        neutral: 'var(--color-neutral)',
        'base-100': 'var(--color-base-100)',
        'base-200': 'var(--color-base-200)',
        'base-300': 'var(--color-base-300)',
        'base-content': 'var(--color-base-content)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#3B82F6",
          "secondary": "#8B5CF6",
          "accent": "#F59E0B",
          "neutral": "#374151",
          "base-100": "#FFFFFF",
          "base-200": "#F3F4F6",
          "base-300": "#E5E7EB",
          "base-content": "#1F2937",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
        dark: {
          "primary": "#60A5FA",
          "secondary": "#A78BFA",
          "accent": "#FCD34D",
          "neutral": "#D1D5DB",
          "base-100": "#1F2937",
          "base-200": "#111827",
          "base-300": "#374151",
          "base-content": "#F9FAFB",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
        blue: {
          "primary": "#1E40AF",
          "secondary": "#3730A3",
          "accent": "#0891B2",
          "neutral": "#4B5563",
          "base-100": "#EFF6FF",
          "base-200": "#DBEAFE",
          "base-300": "#BFDBFE",
          "base-content": "#1E3A8A",
        },
        green: {
          "primary": "#059669",
          "secondary": "#047857",
          "accent": "#0D9488",
          "neutral": "#4B5563",
          "base-100": "#ECFDF5",
          "base-200": "#D1FAE5",
          "base-300": "#A7F3D0",
          "base-content": "#064E3B",
        },
        purple: {
          "primary": "#7C3AED",
          "secondary": "#6D28D9",
          "accent": "#EC4899",
          "neutral": "#4B5563",
          "base-100": "#F5F3FF",
          "base-200": "#EDE9FE",
          "base-300": "#DDD6FE",
          "base-content": "#4C1D95",
        },
      },
    ],
  },
}
