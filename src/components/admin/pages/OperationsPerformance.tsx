"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/operations. It refreshes on the "operations" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "metric", label: "Metric", format: "text" },
  { key: "value", label: "Value", format: "text" },
  { key: "period", label: "Period", format: "text" },
];

function OperationsPerformance() {
  return <ResourceList resource="operations" columns={columns} />;
}

export const page: AdminPage = { label: "Operations Performance", group: "Workspace", roles: ADMIN, component: OperationsPerformance };
