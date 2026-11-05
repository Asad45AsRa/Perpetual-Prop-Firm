"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/activity. It refreshes on the "activity" realtime topic.
const config: PageConfig = {
  resource: "activity",
  exportName: "activity",
  columns: [
    { key: "id", label: "Order" },
    { key: "traderName", label: "Trader" },
    { key: "market", label: "Market" },
    { key: "side", label: "Side", format: "status" },
    { key: "size", label: "Size" },
    { key: "entry", label: "Entry", format: "money" },
    { key: "pnl", label: "P&L", format: "pnl" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "export", label: "Export Activity" },
};

function TradingActivity() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Trading Activity", group: "Traders & trading", roles: ALL, component: TradingActivity };
