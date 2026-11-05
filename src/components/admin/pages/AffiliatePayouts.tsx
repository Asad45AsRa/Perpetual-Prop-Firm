"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/affiliate-payouts. It refreshes on the "affiliate-payouts" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "id", label: "ID", format: "text" },
  { key: "affiliateName", label: "Affiliate", format: "text" },
  { key: "amount", label: "Amount", format: "money" },
  { key: "status", label: "Status", format: "status" },
  { key: "requestedAt", label: "Requested", format: "date" },
];

function AffiliatePayouts() {
  return <ResourceList resource="affiliate-payouts" columns={columns} />;
}

export const page: AdminPage = { label: "Affiliate Payouts", group: "Finance & sales", roles: ADMIN, component: AffiliatePayouts };
