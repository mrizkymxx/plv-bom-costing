import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0c0c0e",
        "surface-card": "#141417",
        "surface-elevated": "#1a1a1f",
        "surface-subtle": "#222228",
        "border-subtle": "#27272a",
        "border-strong": "#3f3f46",
        primary: "#ffffff",
        "text-subtle": "#a1a1aa",
        "text-muted": "#71717a",
        "accent-green": "#10b981",
        "accent-green-bg": "rgba(16, 185, 129, 0.12)",
        "accent-amber": "#f59e0b",
        "accent-amber-bg": "rgba(245, 158, 11, 0.12)",
        "accent-blue": "#38bdf8",
        "accent-blue-bg": "rgba(56, 189, 248, 0.12)",
        "accent-rose": "#f43f5e",
        "accent-rose-bg": "rgba(244, 63, 94, 0.12)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Geist", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
