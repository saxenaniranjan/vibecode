import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        typewriter: ["Courier New", "Courier", "monospace"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      colors: {
        desk: {
          dark: "#7d6248",
          mid: "#a98a69",
          light: "#ccb08c",
        },
      },
      boxShadow: {
        paper: "0 30px 60px rgba(31, 21, 12, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
