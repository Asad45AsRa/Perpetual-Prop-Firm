import { Hero } from "@/components/sections/hero";
import { ExplorePage } from "../../components/sections/ExplorePage";
import { CheckoutPage } from "@/components/sections/Checkoutpage";
import { ThreeSteps } from "@/components/sections/Threesteps";
import { Faq } from "@/components/sections/Faq";
import { HeroSection2 } from "@/components/sections/Herosection2";
import { LeftGlow } from "../../components/sections/LeftGlow"; // jo path Hero mein chal raha hai wahi rakhen

export default function HomePage() {
  return (
    <div className="relative isolate overflow-x-clip">
      <Hero />

      {/* seam anchor: height 0, Hero aur Explore ke beech */}
      <div aria-hidden className="relative h-0">
        <LeftGlow
          trim={60}
          height={380}
          className="-z-10 left-[-320px] top-[-85px]"
          opacity={0.16}
        />
      </div>

      <ExplorePage />
      <CheckoutPage />
      <ThreeSteps />
      <Faq />
      <HeroSection2 />
    </div>
  );
}