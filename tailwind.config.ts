import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coral: {
          50: "#fef2f1",
          100: "#fde6e4",
          200: "#fbc9c5",
          300: "#f7a29c",
          400: "#f0746c",
          500: "#e8837c",
          600: "#d4635c",
          700: "#b84d47",
          800: "#98413c",
          900: "#7e3a36",
          950: "#451b18",
        },
      },
    },
  },
  plugins: [],
};
export default config;
