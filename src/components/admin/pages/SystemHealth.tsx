"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/health. It refreshes on the "health" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "service", label: "Service", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "latencyMs", label: "Latency (ms)", format: "number" },
  { key: "checkedAt", label: "Checked", format: "date" },
];

function SystemHealth() {
  return <ResourceList resource="health" columns={columns} />;
}

export const page: AdminPage = { label: "System Health", group: "Platform control", roles: ADMIN, component: SystemHealth };
