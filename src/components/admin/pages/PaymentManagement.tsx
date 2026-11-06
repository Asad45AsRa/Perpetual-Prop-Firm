"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Payments are created only by the Plisio webhook, so nobody can add, edit or delete one by hand.
// Staff can re-check an invoice, re-send an activation (it can never run twice), dispute or request a refund.
// List: GET /admin/payments   Actions: POST /admin/payments/:id/<recheck|resend-activation|refund|dispute>
const config: PageConfig = {
  pageKey: "payments",
  resource: "payments",
  readOnly: true,
  columns: [
    { key: "id", label: "Payment" },
    { key: "traderName", label: "Trader" },
    { key: "plan", label: "Plan" },
    { key: "amount", label: "Price", format: "money" },
    { key: "received", label: "Received", format: "money" },
    { key: "method", label: "Network" },
    { key: "webhook", label: "Webhook", format: "status" },
    { key: "account", label: "Account" },
    { key: "status", label: "Status", format: "status" },
    { key: "createdAt", label: "Created", format: "date" },
    { key: "invoiceId", label: "Invoice", format: "hash", hidden: true },
    { key: "txnId", label: "Transaction", format: "hash", hidden: true },
    { key: "confirmations", label: "Confirmations", format: "number", hidden: true },
    { key: "coupon", label: "Coupon", hidden: true },
    { key: "affiliate", label: "Affiliate", hidden: true },
  ],
  primary: { label: "Export payments", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "webhook", label: "Webhook" }, { key: "method", label: "Network" }],
  views: [
    { label: "Webhook failed", filters: { webhook: "failed" } },
    { label: "Underpaid", filters: { status: "underpaid" } },
    { label: "Waiting for payment", filters: { status: "pending" } },
  ],
  dateKey: "createdAt",
  actions: [
    { label: "Re-check", action: "recheck", success: "Invoice re-checked with Plisio.", show: (r) => r.status !== "refunded" },
    { label: "Activate account", action: "resend-activation", tone: "gold", success: "Account activated.", show: (r) => r.status === "paid" && !r.account },
    { label: "Dispute", action: "dispute", reason: true, success: "Payment marked as disputed.", show: (r) => r.status === "paid" || r.status === "pending" },
    { label: "Request refund", action: "refund", reason: true, tone: "danger", permission: "refund.issue", success: "Refund requested. A second admin must approve it.", show: (r) => r.status === "paid" },
  ],
  detail: [
    { label: "Overview", kind: "fields" },
    {
      label: "Webhook events", kind: "list", resource: "webhooks",
      path: (r) => `/admin/webhooks?reference=${encodeURIComponent(String(r.invoiceId))}&pageSize=30`,
      columns: [{ key: "event", label: "Event" }, { key: "signature", label: "Signature", format: "status" }, { key: "status", label: "Result", format: "status" }, { key: "attempts", label: "Tries", format: "number" }, { key: "receivedAt", label: "Received", format: "ago" }],
    },
    { label: "Notes", kind: "notes" },
    { label: "History", kind: "timeline" },
  ],
  exportName: "payments",
  emptyText: "No payments yet.",
};

function PaymentManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "payments", label: "Payment Management", group: "Finance & sales", component: PaymentManagement };
