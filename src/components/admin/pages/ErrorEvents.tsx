"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Server errors grouped by cause. The request id matches the line in the backend log,
// so a developer can find the exact failure. Staff acknowledge an error to say "someone is on it".
// List: GET /admin/errors   Actions: POST /admin/errors/:id/<acknowledge|fix>
const config: PageConfig = {
  pageKey: "errors",
  resource: "errors",
  readOnly: true,
  columns: [
    { key: "severity", label: "Severity", format: "status" },
    { key: "service", label: "Service" },
    { key: "message", label: "What went wrong" },
    { key: "count", label: "Times", format: "number" },
    { key: "firstSeen", label: "First seen", format: "ago" },
    { key: "lastSeen", label: "Last seen", format: "ago" },
    { key: "requestId", label: "Request id", format: "hash" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "Export errors", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "service", label: "Service" }, { key: "severity", label: "Severity" }],
  views: [{ label: "New", filters: { status: "new" } }, { label: "Critical", filters: { severity: "critical" } }],
  actions: [
    { label: "Acknowledge", action: "acknowledge", success: "Error acknowledged.", show: (r) => r.status === "new" },
    { label: "Mark fixed", action: "fix", tone: "success", success: "Error marked as fixed.", show: (r) => r.status !== "fixed" },
  ],
  bulkActions: [{ label: "Acknowledge selected", action: "acknowledge", success: "Errors acknowledged." }],
  detail: [{ label: "Overview", kind: "fields" }, { label: "Notes", kind: "notes" }, { label: "History", kind: "timeline" }],
  detailTitle: (r) => `${r.service}: ${r.message}`,
  exportName: "errors",
  emptyText: "No server errors recorded.",
};

function ErrorEvents() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "errors", label: "Error Events", group: "Platform control", component: ErrorEvents };
