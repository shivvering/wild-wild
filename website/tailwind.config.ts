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
        wild: {
          black: "#0c0a0a",
          panel: "#0a0909",
          cream: "#E6DFD3",
          creamMuted: "#E6DFD3",
          white: "#E6DFD3",
          muted: "#E6DFD3",
          accent: "#A58B6F",
          line: "rgba(165, 139, 111, 0.25)",
          tag: "#3d1218",
          tagBorder: "#5a1a22",
          redGlow: "rgba(127, 29, 39, 0.55)",
        },
      },
      maxWidth: {
        content: "1280px",
      },
      spacing: {
        section: "clamp(4rem, 10vw, 6rem)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wild: "0.02em",
        tag: "0.14em",
        cta: "0.22em",
      },
    },
  },
  plugins: [],
};

export default config;
