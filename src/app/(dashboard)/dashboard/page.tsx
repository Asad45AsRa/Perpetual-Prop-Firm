import type { Metadata } from "next";
import { ProfileCard } from "@/components/trader-dashboard/ProfileCard";
import { SubAccounts } from "@/components/trader-dashboard/SubAccounts";
import { PnlChart } from "@/components/trader-dashboard/PnlChart";
import { TraderLeaderboard } from "@/components/trader-dashboard/TraderLeaderboard";
import { LifetimeStats } from "@/components/trader-dashboard/LifetimeStats";

export const metadata: Metadata = { title: "Home" };

export default function DashboardPage() {
  return (
    // Figma: profile, sub accounts and PnL on the left; leaderboard and lifetime stats on the right (stacked below xl).
    <div className="mt-[37px] grid gap-[16px] xl:grid-cols-[minmax(0,1fr)_470px]">
      <div className="flex min-w-0 flex-col gap-[16px]">
        <ProfileCard />
        <SubAccounts />
        <PnlChart />
      </div>
      <div className="flex min-w-0 flex-col gap-[16px]">
        <TraderLeaderboard />
        <LifetimeStats />
      </div>
    </div>
  );
}
