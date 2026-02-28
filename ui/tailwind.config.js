/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        'container': '1440px',
      },
      colors: {
        // Professional cool blue palette
        primary: {
          50: '#eff6ff',   // Very light blue
          100: '#dbeafe',  // Light blue
          200: '#bfdbfe',  // Lighter blue
          300: '#93c5fd',  // Light-medium blue
          400: '#60a5fa',  // Medium blue
          500: '#3b82f6',  // Base blue (main brand color)
          600: '#2563eb',  // Darker blue (primary buttons)
          700: '#1d4ed8',  // Dark blue (hover states)
          800: '#1e40af',  // Very dark blue
          900: '#1e3a8a',  // Deepest blue (text)
        },
        // Accent colors
        accent: {
          light: '#f0f9ff',  // Very light blue background
          DEFAULT: '#0ea5e9', // Sky blue accent
          dark: '#0284c7',   // Darker sky blue
        }
      },
    },
  },
  plugins: [],
}