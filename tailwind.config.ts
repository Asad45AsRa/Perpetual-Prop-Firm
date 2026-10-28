import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

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
        success: "#22c55e",
        field: "#0d0d0d",
        line: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        //sans: ["var(--font-montreal)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-montreal)", '"Neue Montreal"', "ui-sans-serif", "system-ui", "sans-serif"],

      },
      fontSize: {
        label: ["12px", { lineHeight: "86%", letterSpacing: "0" }],
        eyebrow: ["10px", { lineHeight: "1", letterSpacing: "0.06em" }],
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
        "gold-card":
          "linear-gradient(135deg, rgba(153,128,74,0.05) 0%, rgba(153,128,74,0.45) 100%)",
      },
      boxShadow: {
        "gold-glow": "0 0 40px rgba(153,128,74,0.25)",
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      const faces: [string, number, "normal" | "italic"][] = [
        ["NeueMontreal-Light.otf", 300, "normal"],
        ["NeueMontreal-LightItalic.otf", 300, "italic"],
        ["NeueMontreal-Regular.otf", 400, "normal"],
        ["NeueMontreal-Italic.otf", 400, "italic"],
        ["NeueMontreal-Medium.otf", 500, "normal"],
        ["NeueMontreal-MediumItalic.otf", 500, "italic"],
        ["NeueMontreal-Bold.otf", 700, "normal"],
        ["NeueMontreal-BoldItalic.otf", 700, "italic"],
      ];
      faces.forEach(([file, weight, style]) =>
        addBase({
          "@font-face": {
            fontFamily: '"Neue Montreal"',
            src: `url("/fonts/NeueMontreal/${file}") format("opentype")`,
            fontWeight: String(weight),
            fontStyle: style,
            fontDisplay: "swap",
          },
        })
      );
    }),
  ],
};

export default config;