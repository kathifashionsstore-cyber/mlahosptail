/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #1E7FC2)",
          light: "var(--color-primary-light, #E7F3FA)",
          dark: "var(--color-primary-dark, #061F33)",
        },
        accent: {
          DEFAULT: "var(--color-accent, #2FA84F)",
          light: "var(--color-accent-light, #DFF8EA)",
          dark: "var(--color-accent-dark, #19743A)",
        },
        bg: "var(--color-bg, #FFFFFF)",
        text: "var(--color-text, #152431)",
        navBg: "var(--color-nav-bg, #07365A)",
        cardBg: "var(--color-card-bg, #FFFFFF)",
        buttonColor: {
          DEFAULT: "var(--color-button, #D81F26)",
          hover: "var(--color-button-hover, #b3151b)",
        },
        heading: "var(--color-heading, #07365A)",
        borderCustom: "var(--color-border, #E2E8F0)",
        brand: {
          red: { DEFAULT: 'var(--care-red, #D81F26)', dark: 'var(--care-red, #D81F26)' },
          blue: { DEFAULT: 'var(--active-blue, #1E7FC2)', dark: 'var(--deep-trust-blue, #061F33)', deep: 'var(--deep-trust-blue, #061F33)' },
          green: { DEFAULT: 'var(--healing-green, #2FA84F)', dark: 'var(--healing-green, #2FA84F)' },
        },
        surface: {
          light: 'var(--warm-paper, #FBF9F5)',
          dark: '#0F1B24',
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Poppins", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
