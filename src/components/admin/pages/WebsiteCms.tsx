"use client";

import { useState } from "react";
import { DEFAULT_PRIVACY, DEFAULT_TERMS } from "../../../components/sections/Legalcontent";
import { FaqEditor } from "../FaqEditor";
import { LegalEditor } from "../LegalEditor";
import { RulesEditor } from "../RulesEditor";
import { Tabs } from "../ui";
import type { AdminPage } from "../types";

// Public website text that staff can change without a developer: the FAQ, the Rulebook,
// the Terms of Use and the Privacy Policy.
// Nothing goes live until "Publish" is pressed, and every published version can be loaded back as a draft.
function WebsiteCms() {
  const [tab, setTab] = useState("FAQ");
  return (
    <>
      <Tabs tabs={["FAQ", "Rules", "Terms", "Privacy"]} active={tab} onChange={setTab} />
      {tab === "FAQ" && <FaqEditor />}
      {tab === "Rules" && <RulesEditor />}
      {tab === "Terms" && (
        <LegalEditor contentKey="terms" defaults={DEFAULT_TERMS} title="Terms of Use" previewHref="/terms" />
      )}
      {tab === "Privacy" && (
        <LegalEditor contentKey="privacy" defaults={DEFAULT_PRIVACY} title="Privacy Policy" previewHref="/privacy-policy" />
      )}
    </>
  );
}

export const page: AdminPage = { key: "cms", label: "Website CMS", group: "Communication", component: WebsiteCms };