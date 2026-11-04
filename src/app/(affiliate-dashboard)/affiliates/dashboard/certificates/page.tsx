import type { Metadata } from "next";
import { CertificateCard } from "@/components/affiliate-dashboard/certificates/CertificateCard";
import { certificateLevels, levelProgress } from "@/components/affiliate-dashboard/data";

export const metadata: Metadata = { title: "Certificates" };

export default function AffiliateCertificatesPage() {
  // TODO(backend): referral count comes from the affiliate's real stats.
  const referrals = levelProgress.referrals;

  return (
    <div className="mt-[37px] grid gap-[16px] md:grid-cols-2 xl:grid-cols-3">
      {certificateLevels.map((cert) => (
        <CertificateCard key={cert.tier} cert={cert} referrals={referrals} />
      ))}
    </div>
  );
}
