"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Dual control: large payouts, refunds and breach overrides are decided by a SECOND person.
// The person who asked can never decide their own request (the server refuses it).
// List: GET /admin/approvals   Actions: POST /admin/approvals/:id/<approve|reject>
const config: PageConfig = {
  pageKey: "approvals",
  resource: "approvals",
  readOnly: true,
  columns: [
    { key: "id", label: "Request" },
    { key: "kind", label: "Type", format: "status" },
    { key: "summary", label: "What" },
    { key: "amount", label: "Amount", format: "money" },
    { key: "requestedBy", label: "Asked by" },
    { key: "status", label: "Status", format: "status" },
    { key: "decidedBy", label: "Decided by" },
    { key: "createdAt", label: "Asked", format: "ago" },
  ],
  primary: { label: "Export approvals", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "kind", label: "Type" }],
  views: [{ label: "Waiting for a decision", filters: { status: "pending" } }],
  actions: [
    { label: "Approve", action: "approve", tone: "success", permission: "approvals.decide", confirm: "Approve this request?", success: "Request approved.", show: (r) => r.status === "pending" },
    { label: "Reject", action: "reject", reason: true, tone: "danger", permission: "approvals.decide", success: "Request rejected.", show: (r) => r.status === "pending" },
  ],
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  exportName: "approvals",
  emptyText: "Nothing is waiting for a second approval.",
};

function Approvals() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "approvals", label: "Approvals", group: "Finance & sales", component: Approvals };
