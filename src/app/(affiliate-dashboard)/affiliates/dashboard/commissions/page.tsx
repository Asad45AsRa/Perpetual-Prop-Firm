import type { Metadata } from "next";
import { StatCards } from "@/components/affiliate-dashboard/StatCards";
import { CommissionLevels } from "@/components/affiliate-dashboard/commissions/CommissionLevels";
import { commissionStats } from "@/components/affiliate-dashboard/data";

export const metadata: Metadata = { title: "Commissions" };

export default function AffiliateCommissionsPage() {
  return (
    <div className="mt-[37px] flex flex-col gap-[16px]">
      <StatCards items={commissionStats} />
      <CommissionLevels />
    </div>
  );
}
