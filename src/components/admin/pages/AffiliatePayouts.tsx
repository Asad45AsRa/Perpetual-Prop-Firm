"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/affiliate-payouts. Decisions are POST /admin/affiliate-payouts/:id/approve | reject | paid.
const config: PageConfig = {
  resource: "affiliate-payouts",
  columns: [
    { key: "id", label: "ID" },
    { key: "affiliateName", label: "Affiliate" },
    { key: "amount", label: "Amount", format: "money" },
    { key: "network", label: "Network" },
    { key: "status", label: "Status", format: "status" },
    { key: "requestedAt", label: "Requested", format: "date" },
  ],
  primary: { kind: "info", label: "Review Policy", text: "In a real setup, commission payouts follow your own hold period and approval rules." },
  actions: [
    { label: "Approve", action: "approve", tone: "gold", permission: "payout.approve", show: (r) => r.status === "pending", success: "Payout approved." },
    { label: "Reject", action: "reject", tone: "danger", permission: "payout.approve", show: (r) => r.status === "pending", success: "Payout rejected.", confirm: "Reject this payout?" },
    { label: "Mark paid", action: "paid", tone: "success", permission: "payout.approve", show: (r) => r.status === "approved", success: "Payout marked paid." },
  ],
};

function AffiliatePayouts() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Affiliate Payouts", group: "Finance & sales", roles: ADMIN, component: AffiliatePayouts };
