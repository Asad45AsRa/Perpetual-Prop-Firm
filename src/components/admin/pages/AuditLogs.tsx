"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/audit-logs. The backend writes one entry for every admin action.
const config: PageConfig = {
  resource: "audit-logs",
  exportName: "audit-logs",
  columns: [
    { key: "id", label: "ID" },
    { key: "actor", label: "Actor" },
    { key: "action", label: "Action" },
    { key: "target", label: "Target" },
    { key: "createdAt", label: "Time", format: "date" },
  ],
  primary: { kind: "export", label: "Export Logs" },
};

function AuditLogs() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Audit Logs", group: "Platform control", roles: ADMIN, component: AuditLogs };
