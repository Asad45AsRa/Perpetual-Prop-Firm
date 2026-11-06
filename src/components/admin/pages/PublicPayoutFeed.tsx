"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Controls what the public "live payouts" page shows. Entries are added automatically when a payout is
// marked paid, and only trader-safe ids appear there. Staff can hide an entry but never edit it.
// List: GET /admin/public-payouts   Actions: POST /admin/public-payouts/:id/<hide|show>
const config: PageConfig = {
  pageKey: "public-payouts",
  resource: "public-payouts",
  readOnly: true,
  columns: [
    { key: "payoutId", label: "Payout" },
    { key: "trader", label: "Shown as" },
    { key: "asset", label: "Asset" },
    { key: "amount", label: "Amount", format: "money" },
    { key: "network", label: "Network" },
    { key: "explorerUrl", label: "Explorer link", format: "hash" },
    { key: "confirmedAt", label: "Confirmed", format: "ago" },
    { key: "status", label: "Public status", format: "status" },
  ],
  primary: { label: "Export feed", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "network", label: "Network" }],
  actions: [
    { label: "Hide", action: "hide", success: "Entry hidden from the public page.", show: (r) => r.status === "visible" },
    { label: "Show", action: "show", tone: "success", success: "Entry is public again.", show: (r) => r.status === "hidden" },
  ],
  exportName: "public-payouts",
  emptyText: "No confirmed payouts yet.",
};

function PublicPayoutFeed() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "public-payouts", label: "Public Payout Feed", group: "Finance & sales", component: PublicPayoutFeed };
