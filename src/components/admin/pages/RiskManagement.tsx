"use client";

import { ResourcePage, type PageConfig, type Row } from "../ResourcePage";
import type { AdminPage } from "../types";

// Risk events are written by the engine only. Nobody can create, edit or delete one here,
// so a breach can never be hidden. Staff can only resolve, escalate or request an override.
// List: GET /admin/risk   Actions: POST /admin/risk/:id/<resolve|escalate|override>
const open = (r: Row) => ["breached", "review", "escalated"].includes(String(r.status));

const config: PageConfig = {
  pageKey: "risk",
  resource: "risk",
  readOnly: true,
  columns: [
    { key: "id", label: "Event" },
    { key: "traderName", label: "Trader" },
    { key: "accountId", label: "Account" },
    { key: "rule", label: "Rule" },
    { key: "level", label: "Level", format: "status" },
    { key: "threshold", label: "Limit" },
    { key: "valueAtBreach", label: "Value at breach" },
    { key: "equitySnapshot", label: "Equity then", format: "money" },
    { key: "action", label: "Action taken" },
    { key: "status", label: "Status", format: "status" },
    { key: "detectedAt", label: "Detected", format: "ago" },
  ],
  primary: { label: "Export events", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "rule", label: "Rule" }, { key: "level", label: "Level" }],
  views: [{ label: "Breaches", filters: { status: "breached" } }, { label: "Escalated", filters: { status: "escalated" } }],
  dateKey: "detectedAt",
  actions: [
    { label: "Resolve", action: "resolve", reason: true, tone: "success", permission: "risk.review", success: "Risk event resolved.", show: open },
    { label: "Escalate", action: "escalate", permission: "risk.review", success: "Risk event escalated.", show: (r) => r.status === "breached" || r.status === "review" },
    { label: "Request override", action: "override", reason: true, tone: "danger", permission: "account.override", success: "Override requested. A second admin must approve it.", show: (r) => r.status === "breached" },
  ],
  detail: [{ label: "Overview", kind: "fields" }, { label: "Notes", kind: "notes" }, { label: "History", kind: "timeline" }],
  exportName: "risk-events",
  emptyText: "No risk events. Everything is within the rules.",
};

function RiskManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "risk", label: "Risk Management", group: "Traders & trading", component: RiskManagement };
