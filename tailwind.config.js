/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15243A",
        "ink-soft": "#3C4A5E",
        paper: "#F6F5EF",
        card: "#FFFFFF",
        line: "#E5E2D7",
        green: {
          DEFAULT: "#1B7A4B",
          deep: "#124F32",
          tint: "#E7F1EB",
        },
        sun: {
          DEFAULT: "#F2B33D",
          deep: "#B97E12",
          tint: "#FBEFD2",
        },
        sky: {
          DEFAULT: "#4F86B5",
          deep: "#2F5C82",
          tint: "#E4EEF6",
        },
        plum: {
          DEFAULT: "#5E5A8C",
          tint: "#ECEAF4",
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        body: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,36,58,0.04), 0 8px 24px -12px rgba(21,36,58,0.18)",
        lift: "0 2px 4px rgba(21,36,58,0.06), 0 18px 40px -16px rgba(21,36,58,0.28)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        rain: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        drift: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(40px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
