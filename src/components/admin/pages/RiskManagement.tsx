"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/risk. It refreshes on the "risk" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "accountId", label: "Account", format: "text" },
  { key: "traderName", label: "Trader", format: "text" },
  { key: "rule", label: "Rule", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "detectedAt", label: "Detected", format: "date" },
];

function RiskManagement() {
  return <ResourceList resource="risk" columns={columns} />;
}

export const page: AdminPage = { label: "Risk Management", group: "Traders & trading", roles: ALL, component: RiskManagement };
