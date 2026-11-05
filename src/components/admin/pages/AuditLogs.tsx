"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/audit-logs. It refreshes on the "audit-logs" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "actor", label: "Actor", format: "text" },
  { key: "action", label: "Action", format: "text" },
  { key: "target", label: "Target", format: "text" },
  { key: "createdAt", label: "Time", format: "date" },
];

function AuditLogs() {
  return <ResourceList resource="audit-logs" columns={columns} />;
}

export const page: AdminPage = { label: "Audit Logs", group: "Platform control", roles: ADMIN, component: AuditLogs };
