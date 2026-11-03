import type { Metadata } from "next";
import { PayoutsView } from "@/components/affiliate-dashboard/payouts/PayoutsView";

export const metadata: Metadata = { title: "Payouts" };

export default function AffiliatePayoutsPage() {
  return <PayoutsView />;
}
