const tokenTheme = require("@ark-56/tokens/tailwind-theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      ...tokenTheme,
      borderRadius: {
        ...tokenTheme.borderRadius,
        DEFAULT: tokenTheme.borderRadius.md
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
