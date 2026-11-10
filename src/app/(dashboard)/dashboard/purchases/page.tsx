import type { Metadata } from "next";
import { PurchasesView } from "@/components/trader-dashboard/purchases/PurchasesView";

export const metadata: Metadata = { title: "My Purchases" };

export default function TraderPurchasesPage() {
  return <PurchasesView />;
}
