/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#17365D',        // Primary Deep Navy Blue
          'navy-dark': '#0F243E', // Hover & active deep navy
          'navy-light': '#234C7E',
          teal: '#167D8D',        // Secondary Muted Teal
          'teal-light': '#1E9EB3',
          'teal-subtle': '#E8F5F7',
          charcoal: '#202B38',    // Primary Text Dark Charcoal
          'charcoal-light': '#4A5568',
          page: '#F5F7FA',        // Page background soft grey
          border: '#E1E6ED',      // Light grey border
          surface: '#FFFFFF',     // Pure White surface
          muted: '#6B7A90',
          success: '#0F766E',     // Subtle Green
          'success-bg': '#EDFAF8',
          warning: '#D97706',     // Muted Amber
          'warning-bg': '#FFFBEB',
          error: '#DC2626',       // Restrained Red
          'error-bg': '#FEF2F2',
          saffron: '#EA580C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        'panel': '0 1px 3px 0 rgba(16, 24, 40, 0.08), 0 1px 2px -1px rgba(16, 24, 40, 0.08)',
        'elevated': '0 4px 6px -1px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
      },
      borderRadius: {
        'gov': '6px',
        'gov-lg': '8px',
      },
    },
  },
  plugins: [],
}
