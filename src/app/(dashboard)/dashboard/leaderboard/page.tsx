import type { Metadata } from "next";
import { TraderLeaderboard } from "@/components/trader-dashboard/TraderLeaderboard";

export const metadata: Metadata = { title: "Leaderboard" };

export default function TraderLeaderboardPage() {
  return (
    <div className="mt-[37px]">
      <TraderLeaderboard page />
    </div>
  );
}
