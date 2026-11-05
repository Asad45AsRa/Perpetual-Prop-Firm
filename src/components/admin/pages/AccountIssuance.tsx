"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/issuance. It refreshes on the "issuance" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "id", label: "ID", format: "text" },
  { key: "traderName", label: "Trader", format: "text" },
  { key: "plan", label: "Plan", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "issuedAt", label: "Issued", format: "date" },
];

function AccountIssuance() {
  return <ResourceList resource="issuance" columns={columns} />;
}

export const page: AdminPage = { label: "Account Issuance", group: "Traders & trading", roles: ADMIN, component: AccountIssuance };
