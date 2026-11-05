"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/risk. Resolve is POST /admin/risk/:id/resolve.
const config: PageConfig = {
  resource: "risk",
  columns: [
    { key: "id", label: "ID" },
    { key: "traderName", label: "Trader" },
    { key: "accountId", label: "Account" },
    { key: "rule", label: "Type" },
    { key: "level", label: "Level", format: "status" },
    { key: "status", label: "Status", format: "status" },
    { key: "detectedAt", label: "Detected", format: "date" },
  ],
  primary: { kind: "info", label: "Risk Rules", text: "Daily loss and max loss limits come from the challenge plans. Change them on the Challenge Plans page." },
  allowCreate: false,
  fields: [
    { key: "rule", label: "Type", required: true },
    { key: "level", label: "Level", type: "select", options: ["low", "medium", "high"] },
    { key: "status", label: "Status", type: "select", options: ["breached", "review", "healthy", "resolved"] },
  ],
  actions: [
    { label: "Resolve", action: "resolve", tone: "success", permission: "risk.review", show: (r) => r.status === "breached" || r.status === "review", success: "Risk event resolved." },
  ],
};

function RiskManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Risk Management", group: "Traders & trading", roles: ALL, component: RiskManagement };
