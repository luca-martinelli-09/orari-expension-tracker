/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        md: {
          background: 'var(--md-sys-color-background)',
          onBackground: 'var(--md-sys-color-on-background)',
          surface: 'var(--md-sys-color-surface)',
          surfaceContainer: 'var(--md-sys-color-surface-container)',
          surfaceVariant: 'var(--md-sys-color-surface-variant)',
          onSurface: 'var(--md-sys-color-on-surface)',
          onSurfaceVariant: 'var(--md-sys-color-on-surface-variant)',
          primary: 'var(--md-sys-color-primary)',
          onPrimary: 'var(--md-sys-color-on-primary)',
          primaryContainer: 'var(--md-sys-color-primary-container)',
          onPrimaryContainer: 'var(--md-sys-color-on-primary-container)',
          secondary: 'var(--md-sys-color-secondary)',
          onSecondary: 'var(--md-sys-color-on-secondary)',
          secondaryContainer: 'var(--md-sys-color-secondary-container)',
          onSecondaryContainer: 'var(--md-sys-color-on-secondary-container)',
          error: 'var(--md-sys-color-error)',
          outline: 'var(--md-sys-color-outline)',
        }
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}