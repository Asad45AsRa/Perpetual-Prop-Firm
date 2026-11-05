"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/payments. It refreshes on the "payments" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "id", label: "ID", format: "text" },
  { key: "traderName", label: "Trader", format: "text" },
  { key: "amount", label: "Amount", format: "money" },
  { key: "method", label: "Method", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "createdAt", label: "Date", format: "date" },
];

function PaymentManagement() {
  return <ResourceList resource="payments" columns={columns} />;
}

export const page: AdminPage = { label: "Payment Management", group: "Finance & sales", roles: ADMIN, component: PaymentManagement };
