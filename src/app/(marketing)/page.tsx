import { Hero } from "@/components/sections/hero";
import { ExplorePage } from "../../components/sections/ExplorePage";
import { CheckoutPage } from "@/components/sections/Checkoutpage";
import { ThreeSteps } from "@/components/sections/Threesteps";
import { Faq } from "@/components/sections/Faq";
import { HeroSection2 } from "@/components/sections/Herosection2";

/* Figma se match: edge-anchored soft glows (page px, 1440 width ke hisaab se) */
const GLOWS = [
  // HERO: top-right (warm beige, Figma jaisa)
  { side: "right", cx: 150, cy: 180, w: 1000, h: 700, rgb: "190,182,160", a: 0.5, rot: -15 },

  // LEFT: ek hi glow, Hero stats ke neeche / "Built For" heading ke level par (WHITE)
  { side: "left", cx: 0, cy: 830, w: 900, h: 900, rgb: "255,255,255", a: 0.16, rot: 0 },

  // EXPLORE: right edge, diagram ke neeche (WHITE)
  { side: "right", cx: 0, cy: 1350, w: 800, h: 800, rgb: "255,255,255", a: 0.1, rot: 0 },
];

export default function HomePage() {
  return (
    <>
      <div className="relative overflow-x-clip">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          {GLOWS.map((g, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                [g.side]: -(g.w / 2) + g.cx,
                top: g.cy - g.h / 2,
                width: g.w,
                height: g.h,
                transform: `rotate(${g.rot}deg)`,
                background: `radial-gradient(closest-side, rgba(${g.rgb},${g.a}) 0%, rgba(${g.rgb},${g.a * 0.45}) 50%, rgba(${g.rgb},0) 100%)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <Hero />
          <ExplorePage />
        </div>
      </div>

      <CheckoutPage />
      <ThreeSteps />
      <Faq />
      <HeroSection2 />
    </>
  );
}