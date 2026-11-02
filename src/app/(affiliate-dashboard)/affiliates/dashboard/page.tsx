import type { Metadata } from "next";
import { StatCards } from "@/components/affiliate-dashboard/StatCards";
import { LevelProgress } from "@/components/affiliate-dashboard/LevelProgress";
import { EarningsCard } from "@/components/affiliate-dashboard/EarningsCard";
import { Leaderboard } from "@/components/affiliate-dashboard/Leaderboard";
import { RecentReferrals } from "@/components/affiliate-dashboard/RecentReferrals";

export const metadata: Metadata = { title: "Affiliate Overview" };

export default function AffiliateOverviewPage() {
  return (
    <div className="mt-[37px] flex flex-col gap-[16px]">
      <StatCards />
      <LevelProgress />
      {/* 608 / 486 split at 1110px; stacks below xl */}
      <div className="grid gap-[16px] xl:grid-cols-[608fr_486fr]">
        <div className="flex min-w-0 flex-col gap-[16px]">
          <EarningsCard />
          <RecentReferrals />
        </div>
        <Leaderboard />
      </div>
    </div>
  );
}
