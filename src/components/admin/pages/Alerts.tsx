"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Card } from "../ui";
import type { AdminPage } from "../types";

// Alert rules tell the platform when to warn staff. History shows what fired and who acknowledged it.
// Rules: GET /admin/alerts   History: GET /admin/alert-history   Acknowledge: POST /admin/alert-history/:id/acknowledge
const rules: PageConfig = {
  pageKey: "alerts",
  resource: "alerts",
  columns: [
    { key: "name", label: "Rule" },
    { key: "metric", label: "Watches" },
    { key: "condition", label: "When" },
    { key: "threshold", label: "Limit", format: "number" },
    { key: "channel", label: "Tell staff by" },
    { key: "notify", label: "Notify" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "Add Rule", kind: "create" },
  fields: [
    { key: "name", label: "Rule name", required: true },
    { key: "metric", label: "Watches", type: "select", options: ["dailyLossUsed", "drawdownUsed", "feedStaleSeconds", "payoutAgeHours", "failedWebhooks"] },
    { key: "condition", label: "Fires when the value is", type: "select", options: ["above", "below"] },
    { key: "threshold", label: "Limit", type: "number", required: true },
    { key: "channel", label: "Tell staff by", type: "select", options: ["in-app", "email", "both"] },
    { key: "notify", label: "Who to notify (email)", type: "email", required: true },
    { key: "status", label: "Status", type: "select", options: ["enabled", "disabled"] },
  ],
  exportName: "alert-rules",
  emptyText: "No alert rules yet.",
};

const history: PageConfig = {
  pageKey: "alerts",
  resource: "alert-history",
  readOnly: true,
  columns: [
    { key: "ruleName", label: "Rule" },
    { key: "message", label: "What happened" },
    { key: "firedAt", label: "Fired", format: "ago" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "Export history", kind: "export" },
  filters: [{ key: "status", label: "Status" }],
  actions: [{ label: "Acknowledge", action: "acknowledge", success: "Alert acknowledged.", show: (r) => r.status === "new" }],
  exportName: "alert-history",
  emptyText: "No alerts have fired.",
};

function Alerts() {
  return (
    <>
      <ResourcePage config={rules} />
      <Card title="What fired">
        <ResourcePage config={history} />
      </Card>
    </>
  );
}

export const page: AdminPage = { key: "alerts", label: "Alerts", group: "Platform control", component: Alerts };
