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
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
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
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px 0 rgba(99, 102, 241, 0.4)" },
          "50%": { boxShadow: "0 0 16px 4px rgba(139, 92, 246, 0.6)" },
        },
        slamIn: {
          "0%": { transform: "scale(2)", opacity: "0" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
          "75%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        clueIn: {
          "0%": { transform: "scale(1.3)", opacity: "0" },
          "60%": { transform: "scale(1.02)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease",
        fadeSlideIn: "fadeSlideIn 0.3s ease",
        popIn: "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        shake: "shake 0.4s ease",
        pulseGlow: "pulseGlow 1.5s ease-in-out infinite",
        slamIn: "slamIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        clueIn: "clueIn 0.28s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
