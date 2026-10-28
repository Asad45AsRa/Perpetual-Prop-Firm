import { Hero } from "@/components/sections/hero";
import { ExplorePage } from "../../components/sections/ExplorePage"
import { CheckoutPage } from "@/components/sections/Checkoutpage";
import { ThreeSteps } from "@/components/sections/Threesteps";
import { RulesPage } from "@/components/sections/RulesPage";
import { HeroSection2 } from "@/components/sections/Herosection2";

export default function HomePage() {
  return (
    <><Hero />
    <ExplorePage />
    <CheckoutPage />
    <ThreeSteps />
    <RulesPage />
    <HeroSection2 />
    </>
  );
}
