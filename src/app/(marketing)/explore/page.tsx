import { ExploreHero } from "@/components/sections/Explorehero";
import { LiveMarketOverview } from "@/components/sections/Livemarketoverview";
import { MarketHeatmap } from "@/components/sections/Marketheatmap";
import { LeftGlow } from "../../../components/sections/LeftGlow";
import { PathToFunding } from "@/components/sections/PathToFunding";
import { FundedPayouts } from "@/components/sections/FundedPayouts";
import { TraderPerformance } from "@/components/sections/Traderperformance";

export default function ExplorePage() {
  return (
    <>
      <ExploreHero />

      <div className="relative isolate overflow-x-clip bg-[#111111]">
        <LiveMarketOverview />

        {/* seam anchor: height 0,  */}
        <div aria-hidden className="relative h-0">
          <LeftGlow
            trim={60}
            height={520}
            opacity={0.17}
            className="-z-10 left-[-320px] top-[-330px]"
          />
        </div>

        <MarketHeatmap />
        <PathToFunding />

        {/* seam anchor: PathToFunding aur FundedPayouts ke beech */}
        <div aria-hidden className="relative h-0">
          <LeftGlow
            trim={60}
            height={520}
            opacity={0.17}
            className="-z-10 left-[-320px] top-[-260px]"
          />
        </div>

        <FundedPayouts />
        <TraderPerformance />
      </div>
    </>
  );
}