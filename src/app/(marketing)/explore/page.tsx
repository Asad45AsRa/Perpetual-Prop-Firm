import { ExploreHero } from "@/components/sections/Explorehero";
import { LiveMarketOverview } from "@/components/sections/Livemarketoverview";
import { MarketHeatmap } from "@/components/sections/Marketheatmap";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function ExplorePage() {
  return <>
  <ExploreHero />
  <LiveMarketOverview />
  <MarketHeatmap />
  </>;
}
