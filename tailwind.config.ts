import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#101010",
        surface: "#141414",
        border: "#262626",
        foreground: "#ffffff",
        muted: "#8a8a8a",
        nav: "#111111",
        ink: "#0F0F0F",
        gold: {
          DEFAULT: "#b8975a",
          light: "#d4b678",
          accent: "#99804A",
        },
        // NEW: check icons ("No KYC required", "105× trading capital")
        success: "#22c55e",
        // NEW: dropdown / input ka darker fill
        field: "#0d0d0d",
        // NEW: subtle border
        line: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["Neue Montreal", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        label: ["12px", { lineHeight: "86%", letterSpacing: "0" }],
        // NEW: plan card sub-labels (uppercase class ke saath)
        eyebrow: ["10px", { lineHeight: "1", letterSpacing: "0.06em" }],
        // NEW: checkout page heading
        display: ["64px", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },
      maxWidth: {
        site: "1200px",
      },
      spacing: {
        nav: "77.22px",
      },
      backdropBlur: {
        nav: "37.49px",
      },
      backgroundImage: {
        "gold-line": "linear-gradient(90deg, #FFFFFF 0%, #99804A 100%)",
        // NEW: selected plan card glow
        "gold-card":
          "linear-gradient(135deg, rgba(153,128,74,0.05) 0%, rgba(153,128,74,0.45) 100%)",
      },
      // NEW
      boxShadow: {
        "gold-glow": "0 0 40px rgba(153,128,74,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;