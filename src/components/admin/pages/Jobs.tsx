"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Scheduled background work: daily loss reset, reconciliation, payment checks, reports.
// A failed or overdue job here is often the first sign of a server problem.
// List: GET /admin/jobs   Run now: POST /admin/jobs/:id/run
const config: PageConfig = {
  pageKey: "jobs",
  resource: "jobs",
  readOnly: true,
  columns: [
    { key: "name", label: "Job" },
    { key: "schedule", label: "Schedule" },
    { key: "lastRunAt", label: "Last run", format: "ago" },
    { key: "durationMs", label: "Took (ms)", format: "number" },
    { key: "status", label: "Result", format: "status" },
    { key: "nextRunAt", label: "Next run", format: "date" },
    { key: "lastError", label: "Last error" },
  ],
  primary: { label: "Export jobs", kind: "export" },
  filters: [{ key: "status", label: "Result" }],
  actions: [{ label: "Run now", action: "run", confirm: "Run this job now?", tone: "gold", success: "Job finished.", show: (r) => r.status !== "running" }],
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  detailTitle: (r) => String(r.name),
  exportName: "jobs",
  emptyText: "No scheduled jobs.",
};

function Jobs() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "jobs", label: "Scheduled Jobs", group: "Platform control", component: Jobs };
