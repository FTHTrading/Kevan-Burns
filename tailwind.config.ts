import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark protocol palette (vault dashboard)
        navy: {
          950: "#03060f",
          900: "#060d1f",
          800: "#0b1733",
          700: "#122048",
          600: "#1a2d5e",
        },
        gold: {
          300: "#f5d88a",
          400: "#f0c84a",
          500: "#d4a017",
          600: "#b88a0f",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        vault: {
          active:   "#22d3ee",
          pending:  "#f0c84a",
          disputed: "#ef4444",
          released: "#22c55e",
          locked:   "#6b7280",
        },
        // Warm estate palette (marketing / family pages)
        warm: {
          50:  "#FDFAF6",
          100: "#F7F0E6",
          200: "#EDE3D1",
          300: "#DED0B8",
          400: "#8C7D63", // Darkened for readability
          500: "#6B5F49", // Darkened for readability
          600: "#4A4234", // Darkened for readability
          700: "#2D2820", // Darkened for readability
          800: "#1E1912", // Darkened for readability
          900: "#0E0C09", // Darkened for readability
        },
        estate: {
          50:  "#FBF8F4",
          100: "#F3EDE3",
          200: "#E4D9C6",
          300: "#CDBFA0",
          400: "#70614C", // Darkened for readability
          500: "#54493A", // Darkened for readability
          600: "#3D342A", // Darkened for readability
          700: "#2B241D", // Darkened for readability
          800: "#1A1612", // Darkened for readability
          900: "#0F0D0A", // Darkened for readability
        },
        legacy: {
          gold:   "#C8900A",
          amber:  "#D4A819",
          brown:  "#5C3D1E",
          cream:  "#FDFAF6",
          sage:   "#6B8F71",
          slate:  "#4A5568",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "vault-gradient":
          "linear-gradient(135deg, #03060f 0%, #0b1733 50%, #060d1f 100%)",
      },
    },
  },
  plugins: [forms],
};

export default config;
