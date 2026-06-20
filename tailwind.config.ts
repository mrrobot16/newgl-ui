import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: "var(--color-container-background-primary)",
          secondary: "var(--color-container-background-secondary)",
          accent: "var(--color-container-background-accent)"
        },
        text: {
          global: "var(--color-text-global)",
          primary: "var(--color-text-primary)",
          disabled: "var(--color-text-disabled)"
        }
      }
    }
  },
  plugins: []
};

export default config;