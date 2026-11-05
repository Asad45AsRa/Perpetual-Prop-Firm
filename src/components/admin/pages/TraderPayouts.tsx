"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Full payout queue from GET /admin/payouts. Decisions made by another admin appear live.
// Approve / Reject / Mark paid are POST /admin/payouts/:id/approve | reject | paid.
const config: PageConfig = {
  resource: "payouts",
  columns: [
    { key: "id", label: "ID" },
    { key: "traderName", label: "Trader" },
    { key: "accountId", label: "Account" },
    { key: "profit", label: "Profit", format: "money" },
    { key: "split", label: "Split", format: "percent" },
    { key: "amount", label: "Amount", format: "money" },
    { key: "network", label: "Network" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "info", label: "Payout Policy", text: "In a real setup, large payouts would need a second approver. This demo applies no limit." },
  actions: [
    { label: "Approve", action: "approve", tone: "gold", permission: "payout.approve", show: (r) => r.status === "pending", success: "Payout approved." },
    { label: "Reject", action: "reject", tone: "danger", permission: "payout.approve", show: (r) => r.status === "pending", success: "Payout rejected.", confirm: "Reject this payout?" },
    { label: "Mark paid", action: "paid", tone: "success", permission: "payout.approve", show: (r) => r.status === "approved", success: "Payout marked paid." },
  ],
};

function TraderPayouts() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Trader Payouts", group: "Finance & sales", roles: ADMIN, component: TraderPayouts };
