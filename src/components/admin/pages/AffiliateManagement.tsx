"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/affiliates. It refreshes on the "affiliates" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "name", label: "Name", format: "text" },
  { key: "email", label: "Email", format: "text" },
  { key: "referrals", label: "Referrals", format: "number" },
  { key: "earnings", label: "Earnings", format: "money" },
  { key: "status", label: "Status", format: "status" },
];

function AffiliateManagement() {
  return <ResourceList resource="affiliates" columns={columns} />;
}

export const page: AdminPage = { label: "Affiliate Management", group: "Finance & sales", roles: ADMIN, component: AffiliateManagement };
