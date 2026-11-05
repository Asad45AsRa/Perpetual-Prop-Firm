"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/accounts. It refreshes on the "accounts" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "id", label: "Account", format: "text" },
  { key: "traderName", label: "Trader", format: "text" },
  { key: "plan", label: "Plan", format: "text" },
  { key: "balance", label: "Balance", format: "money" },
  { key: "status", label: "Status", format: "status" },
];

function TradingAccounts() {
  return <ResourceList resource="accounts" columns={columns} />;
}

export const page: AdminPage = { label: "Trading Accounts", group: "Traders & trading", roles: ALL, component: TradingAccounts };
