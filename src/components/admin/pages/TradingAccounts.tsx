"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/accounts. Pass / Fail are POST /admin/accounts/:id/pass | fail.
const config: PageConfig = {
  resource: "accounts",
  columns: [
    { key: "id", label: "Account" },
    { key: "traderName", label: "Trader" },
    { key: "plan", label: "Plan" },
    { key: "stage", label: "Stage" },
    { key: "balance", label: "Balance", format: "money" },
    { key: "equity", label: "Equity", format: "money" },
    { key: "pnl", label: "P&L", format: "pnl" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "navigate", label: "Issue Account", to: "Account Issuance", permission: "records.manage" },
  actions: [
    { label: "Pass", action: "pass", tone: "success", permission: "records.manage", show: (r) => r.stage === "Phase 1" && r.status === "active", success: "Account passed. The trader sees this now." },
    { label: "Fail", action: "fail", tone: "danger", permission: "records.manage", show: (r) => r.stage === "Phase 1" && r.status === "active", success: "Account failed. The trader sees this now.", confirm: "Fail this account?" },
  ],
};

function TradingAccounts() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Trading Accounts", group: "Traders & trading", roles: ALL, component: TradingAccounts };
