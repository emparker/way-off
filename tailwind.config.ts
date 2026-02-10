import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0F172A",
          secondary: "#1E293B",
        },
        border: {
          DEFAULT: "#334155",
        },
        cold: "#3B82F6",
        warm: "#F59E0B",
        hot: "#EF4444",
        exact: "#10B981",
        accent: {
          DEFAULT: "#6366F1",
          hover: "#8B5CF6",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          muted: "#64748B",
          dim: "#475569",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        game: "480px",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeSlideIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "70%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-8px)" },
          "75%": { transform: "translateX(8px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease",
        fadeSlideIn: "fadeSlideIn 0.3s ease",
        popIn: "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        shake: "shake 0.4s ease",
      },
    },
  },
  plugins: [],
};

export default config;
