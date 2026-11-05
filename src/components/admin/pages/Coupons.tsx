"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/coupons. It refreshes on the "coupons" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "code", label: "Code", format: "text" },
  { key: "discount", label: "Discount %", format: "number" },
  { key: "uses", label: "Uses", format: "number" },
  { key: "status", label: "Status", format: "status" },
  { key: "expiresAt", label: "Expires", format: "date" },
];

function Coupons() {
  return <ResourceList resource="coupons" columns={columns} />;
}

export const page: AdminPage = { label: "Coupons", group: "Finance & sales", roles: ADMIN, component: Coupons };
