import type { Metadata } from "next";
import { AffiliateJoinFlow } from "@/components/affiliate-join/AffiliateJoinFlow";

export const metadata: Metadata = {
  title: "Join Affiliate",
};

// Lives outside the (marketing) group so it renders without the navbar/footer.
export default function AffiliateJoinPage() {
  return <AffiliateJoinFlow />;
}
