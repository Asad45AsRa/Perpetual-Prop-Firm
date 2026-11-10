import type { Metadata } from "next";
import { PayoutsView } from "@/components/trader-dashboard/payouts/PayoutsView";

export const metadata: Metadata = { title: "Payouts" };

export default function TraderPayoutsPage() {
  return <PayoutsView />;
}
