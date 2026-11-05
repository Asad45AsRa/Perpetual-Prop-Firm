"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/traders. It refreshes on the "traders" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "name", label: "Name", format: "text" },
  { key: "email", label: "Email", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "accounts", label: "Accounts", format: "number" },
  { key: "joinedAt", label: "Joined", format: "date" },
];

function TraderManagement() {
  return <ResourceList resource="traders" columns={columns} />;
}

export const page: AdminPage = { label: "Trader Management", group: "Traders & trading", roles: ALL, component: TraderManagement };
