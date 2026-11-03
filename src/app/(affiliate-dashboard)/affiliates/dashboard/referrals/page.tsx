import type { Metadata } from "next";
import { ReferralLinkBar } from "@/components/affiliate-dashboard/referrals/ReferralLinkBar";
import { ReferralsTable } from "@/components/affiliate-dashboard/referrals/ReferralsTable";

export const metadata: Metadata = { title: "Referrals" };

export default function AffiliateReferralsPage() {
  return (
    <div className="mt-[37px] flex flex-col gap-[16px]">
      <ReferralLinkBar />
      <ReferralsTable />
    </div>
  );
}
