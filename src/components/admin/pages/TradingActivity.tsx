"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/activity. It refreshes on the "activity" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "traderName", label: "Trader", format: "text" },
  { key: "market", label: "Market", format: "text" },
  { key: "side", label: "Side", format: "status" },
  { key: "pnl", label: "P&L", format: "money" },
  { key: "openedAt", label: "Opened", format: "date" },
];

function TradingActivity() {
  return <ResourceList resource="activity" columns={columns} />;
}

export const page: AdminPage = { label: "Trading Activity", group: "Traders & trading", roles: ALL, component: TradingActivity };
