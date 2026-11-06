"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Trading competitions. Not part of the first launch scope, so the super admin only grants it when needed.
// List: GET /admin/competitions   Create: POST /admin/competitions
const config: PageConfig = {
  pageKey: "competitions",
  resource: "competitions",
  columns: [
    { key: "name", label: "Competition" },
    { key: "participants", label: "Participants", format: "number" },
    { key: "prize", label: "Prize" },
    { key: "scoring", label: "Scoring" },
    { key: "endsAt", label: "Ends", format: "date" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "New Competition", kind: "create" },
  fields: [
    { key: "name", label: "Name", required: true },
    { key: "prize", label: "Prize", required: true },
    { key: "scoring", label: "Scoring rule", type: "select", options: ["Highest return %", "Highest profit $", "Best risk-adjusted return"] },
    { key: "endsAt", label: "Ends on", type: "date", required: true },
    { key: "status", label: "Status", type: "select", options: ["draft", "live", "closed"] },
  ],
  filters: [{ key: "status", label: "Status" }],
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  exportName: "competitions",
  emptyText: "No competitions yet.",
};

function Competitions() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "competitions", label: "Competitions", group: "Communication", component: Competitions };
