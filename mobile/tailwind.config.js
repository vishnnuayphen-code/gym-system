/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f59e0b", // Amber Gold
          dark: "#d97706",
          light: "#fbbf24",
        },
        obsidian: {
          DEFAULT: "#0f1115", // Deepest Nebula
          soft: "#1a1d24",    // Nebula 900
          muted: "#272a33",   // Nebula 800
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.04)",
          glass: "rgba(255, 255, 255, 0.08)",
          border: "rgba(255, 255, 255, 0.12)",
        },
        accent: {
          cyan: "#22d3ee",
          indigo: "#6366f1",
          violet: "#8b5cf6",
          rose: "#f43f5e",
          amber: "#f59e0b",
          emerald: "#10b981",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a1a1aa", // Zinc 400
          muted: "#71717a",     // Zinc 500
        },
        destructive: "#ef4444",
      }
    },
  },
  plugins: [],
}
