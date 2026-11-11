"use client";

import { LegalDocument } from "@/components/sections/Legaldocument";
import { DEFAULT_PRIVACY, type LegalContent } from "@/components/sections/Legalcontent";
import { useSiteContent } from "@/lib/siteContent";

export default function PrivacyPolicyPage() {
  const content = useSiteContent<LegalContent>("privacy", DEFAULT_PRIVACY);
  return <LegalDocument title="Privacy Policy" content={content} />;
}