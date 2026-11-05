"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/reserves. It refreshes on the "reserves" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "label", label: "Reserve", format: "text" },
  { key: "amount", label: "Amount", format: "money" },
  { key: "status", label: "Status", format: "status" },
  { key: "updatedAt", label: "Updated", format: "date" },
];

function PayoutReserves() {
  return <ResourceList resource="reserves" columns={columns} />;
}

export const page: AdminPage = { label: "Payout Reserves", group: "Finance & sales", roles: ADMIN, component: PayoutReserves };
