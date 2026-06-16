import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
        card: "var(--card)",
        card2: "var(--card2)",
        teal: {
          DEFAULT: "var(--teal)",
          dim: "var(--teal-dim)",
          glow: "var(--teal-glow)",
        },
        purple: {
          DEFAULT: "var(--purple)",
          dim: "var(--purple-dim)",
        },
        amber: "var(--amber)",
        red: "var(--red)",
        text: {
          DEFAULT: "var(--text)",
          secondary: "var(--text2)",
          muted: "var(--text3)",
        },
        border: "var(--border)",
        border2: "var(--border2)",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-space-grotesk)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
