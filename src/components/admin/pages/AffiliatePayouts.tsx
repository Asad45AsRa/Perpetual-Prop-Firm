"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Commission payouts. A payout stays locked until its hold period ends, so refunded sales can be clawed back.
// List: GET /admin/affiliate-payouts   Actions: POST /admin/affiliate-payouts/:id/<approve|reject|paid>
const config: PageConfig = {
  pageKey: "affiliate-payouts",
  resource: "affiliate-payouts",
  readOnly: true,
  columns: [
    { key: "id", label: "Payout" },
    { key: "affiliateName", label: "Affiliate" },
    { key: "amount", label: "Amount", format: "money" },
    { key: "network", label: "Network" },
    { key: "wallet", label: "Wallet", format: "hash" },
    { key: "txHash", label: "Transaction", format: "hash" },
    { key: "holdUntil", label: "Hold ends", format: "date" },
    { key: "status", label: "Status", format: "status" },
    { key: "requestedAt", label: "Requested", format: "ago" },
  ],
  primary: { label: "Export payouts", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "network", label: "Network" }],
  views: [{ label: "Waiting for review", filters: { status: "pending" } }],
  dateKey: "requestedAt",
  actions: [
    { label: "Approve", action: "approve", tone: "success", permission: "payout.approve", confirm: "Approve this commission payout?", success: "Payout approved.", show: (r) => r.status === "pending" },
    { label: "Reject", action: "reject", reason: true, tone: "danger", permission: "payout.approve", success: "Payout rejected.", show: (r) => r.status === "pending" || r.status === "approved" },
    {
      label: "Mark paid", action: "paid", tone: "gold", permission: "payout.approve", success: "Payout marked as paid.",
      inputs: [{ key: "txHash", label: "Transaction hash", required: true, placeholder: "Paste the full hash from the block explorer" }],
      show: (r) => r.status === "approved",
    },
  ],
  detail: [{ label: "Overview", kind: "fields" }, { label: "Notes", kind: "notes" }, { label: "History", kind: "timeline" }],
  exportName: "affiliate-payouts",
  emptyText: "No affiliate payout requests yet.",
};

function AffiliatePayouts() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "affiliate-payouts", label: "Affiliate Payouts", group: "Finance & sales", component: AffiliatePayouts };
