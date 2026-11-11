// terms/page.tsx
"use client";

import { LegalDocument } from "@/components/sections/Legaldocument";
import { DEFAULT_TERMS, type LegalContent } from "@/components/sections/Legalcontent";
import { useSiteContent } from "@/lib/siteContent";

export default function TermsOfUsePage() {
  const content = useSiteContent<LegalContent>("terms", DEFAULT_TERMS);
  return <LegalDocument title="Terms of Use" content={content} />;
}