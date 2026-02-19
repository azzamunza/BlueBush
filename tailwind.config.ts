import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // BlueBush Brand Colours - Australian English spelling
        'deep-forest': '#1B3022',
        'vibrant-aqua': '#00FFFF',
        'soft-sandstone': '#D7C4BB',
        'outback-ochre': '#AE653F',
        'paperbark': '#E5E1D8',
        // Additional teal shades for gradients
        'deep-teal': '#006B6B',
        'emerald': '#50C878',
      },
      fontFamily: {
        'sofia': ['"Sofia Pro"', 'sans-serif'],
        'lora': ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
