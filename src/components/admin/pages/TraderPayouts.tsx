"use client";

import { ResourcePage, type PageConfig, type Row } from "../ResourcePage";
import type { AdminPage } from "../types";

// Money leaves the company here, so this page is the strictest one:
//   - the Checks tab shows every rule that must pass before an approval (the server re-checks them)
//   - a payout above the dual-approval limit waits for a SECOND person on the Approvals page
//   - "Mark paid" needs the real transaction hash; the explorer link is built from it
//   - every rejection needs a reason, which the trader receives by email
// List: GET /admin/payouts   Actions: POST /admin/payouts/:id/<approve|reject|paid>
const config: PageConfig = {
  pageKey: "payouts",
  resource: "payouts",
  readOnly: true,
  columns: [
    { key: "id", label: "Payout" },
    { key: "traderName", label: "Trader" },
    { key: "accountId", label: "Account" },
    { key: "profit", label: "Profit", format: "money" },
    { key: "split", label: "Split", format: "percent" },
    { key: "amount", label: "Amount", format: "money" },
    { key: "network", label: "Network" },
    { key: "wallet", label: "Wallet", format: "hash" },
    { key: "kyc", label: "KYC", format: "status" },
    { key: "txHash", label: "Transaction", format: "hash" },
    { key: "status", label: "Status", format: "status" },
    { key: "requestedAt", label: "Requested", format: "ago" },
    { key: "firstApprover", label: "First approver", hidden: true },
    { key: "secondApprover", label: "Second approver", hidden: true },
    { key: "confirmations", label: "Confirmations", format: "number", hidden: true },
    { key: "public", label: "On public feed", format: "bool", hidden: true },
  ],
  primary: { label: "Export payouts", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "network", label: "Network" }, { key: "kyc", label: "KYC" }],
  views: [
    { label: "Waiting for review", filters: { status: "pending" } },
    { label: "Awaiting second approval", filters: { status: "awaiting approval" } },
    { label: "Approved, not sent", filters: { status: "approved" } },
  ],
  dateKey: "requestedAt",
  actions: [
    { label: "Approve", action: "approve", tone: "success", permission: "payout.approve", confirm: "Approve this payout? All checks must pass.", success: "Payout approved.", show: (r: Row) => r.status === "pending" },
    { label: "Reject", action: "reject", reason: true, tone: "danger", permission: "payout.approve", success: "Payout rejected. The trader will be emailed the reason.", show: (r) => ["pending", "awaiting approval", "approved"].includes(String(r.status)) },
    {
      label: "Mark paid", action: "paid", tone: "gold", permission: "payout.approve", success: "Payout marked as paid.",
      inputs: [{ key: "txHash", label: "Transaction hash", required: true, placeholder: "Paste the full hash from the block explorer", help: "The explorer link and the public payout entry are built from this." }],
      show: (r) => r.status === "approved",
    },
  ],
  detailTitle: (r) => `${r.id} · ${r.traderName}`,
  detail: [
    { label: "Checks", kind: "checks", path: (r) => `/admin/payouts/${encodeURIComponent(String(r.id))}/checks` },
    { label: "Overview", kind: "fields" },
    { label: "Notes", kind: "notes" },
    { label: "History", kind: "timeline" },
  ],
  exportName: "payouts",
  emptyText: "No payout requests yet.",
};

function TraderPayouts() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "payouts", label: "Trader Payouts", group: "Finance & sales", component: TraderPayouts };
