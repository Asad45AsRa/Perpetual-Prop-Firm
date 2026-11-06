"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Every webhook Plisio and Resend sent us, whether it was accepted, rejected or ignored as a duplicate.
// A failed one can be replayed; the server guarantees a payment can never activate an account twice.
// List: GET /admin/webhooks   Replay: POST /admin/webhooks/:id/replay
const config: PageConfig = {
  pageKey: "webhooks",
  resource: "webhooks",
  readOnly: true,
  columns: [
    { key: "id", label: "Event" },
    { key: "provider", label: "Provider" },
    { key: "event", label: "Type" },
    { key: "reference", label: "Reference", format: "hash" },
    { key: "signature", label: "Signature", format: "status" },
    { key: "status", label: "Result", format: "status" },
    { key: "attempts", label: "Tries", format: "number" },
    { key: "error", label: "Problem" },
    { key: "receivedAt", label: "Received", format: "ago" },
  ],
  primary: { label: "Export events", kind: "export" },
  filters: [{ key: "provider", label: "Provider" }, { key: "status", label: "Result" }, { key: "signature", label: "Signature" }],
  views: [{ label: "Failed", filters: { status: "failed" } }, { label: "Bad signature", filters: { signature: "invalid" } }],
  dateKey: "receivedAt",
  actions: [{ label: "Replay", action: "replay", tone: "gold", success: "Webhook replayed.", show: (r) => r.status === "failed" }],
  bulkActions: [{ label: "Replay selected", action: "replay", success: "Webhooks replayed." }],
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  exportName: "webhooks",
  emptyText: "No webhooks received yet.",
};

function WebhookLogs() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "webhooks", label: "Webhook Logs", group: "Platform control", component: WebhookLogs };
