import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        github: {
          50: '#f6f8fa',
          500: '#24292e',
          600: '#1b1f23',
        }
      }
    },
  },
  plugins: [],
} satisfies Config;