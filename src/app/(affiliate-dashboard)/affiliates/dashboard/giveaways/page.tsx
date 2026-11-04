import type { Metadata } from "next";
import { GiveawayCard } from "@/components/affiliate-dashboard/giveaways/GiveawayCard";
import { currentLevel, giveawayTiers } from "@/components/affiliate-dashboard/data";

export const metadata: Metadata = { title: "Giveaways" };

export default function AffiliateGiveawaysPage() {
  // TODO(backend): unlocked tiers come from the affiliate's real level.
  const currentIndex = giveawayTiers.findIndex((t) => t.tier === currentLevel.tier);

  return (
    <div className="mt-[37px] grid gap-[16px] xl:grid-cols-2">
      {giveawayTiers.map((tier, i) => (
        <GiveawayCard key={tier.tier} tier={tier} unlocked={i <= currentIndex} />
      ))}
    </div>
  );
}
