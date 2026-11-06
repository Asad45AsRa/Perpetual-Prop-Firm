"use client";

import { useState } from "react";
import { FaqEditor } from "../FaqEditor";
import { RulesEditor } from "../RulesEditor";
import { Tabs } from "../ui";
import type { AdminPage } from "../types";

// Public website text that staff can change without a developer: the FAQ and the Rulebook.
// Nothing goes live until "Publish" is pressed, and every published version can be loaded back as a draft.
function WebsiteCms() {
  const [tab, setTab] = useState("FAQ");
  return (
    <>
      <Tabs tabs={["FAQ", "Rules"]} active={tab} onChange={setTab} />
      {tab === "FAQ" ? <FaqEditor /> : <RulesEditor />}
    </>
  );
}

export const page: AdminPage = { key: "cms", label: "Website CMS", group: "Communication", component: WebsiteCms };
