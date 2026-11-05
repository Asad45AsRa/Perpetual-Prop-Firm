"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/plans. It refreshes on the "plans" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "name", label: "Plan", format: "text" },
  { key: "price", label: "Price", format: "money" },
  { key: "profitTarget", label: "Profit target %", format: "number" },
  { key: "status", label: "Status", format: "status" },
];

function ChallengePlans() {
  return <ResourceList resource="plans" columns={columns} />;
}

export const page: AdminPage = { label: "Challenge Plans", group: "Finance & sales", roles: ADMIN, component: ChallengePlans };
