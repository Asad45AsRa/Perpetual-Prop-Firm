import type { Metadata } from "next";
import { ChallengesView } from "@/components/trader-dashboard/challenges/ChallengesView";

export const metadata: Metadata = { title: "Challenges" };

export default function TraderChallengesPage() {
  return <ChallengesView />;
}
