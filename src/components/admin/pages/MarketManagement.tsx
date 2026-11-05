"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/markets. It refreshes on the "markets" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "symbol", label: "Symbol", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "maxLeverage", label: "Max leverage", format: "number" },
  { key: "spread", label: "Spread", format: "number" },
];

function MarketManagement() {
  return <ResourceList resource="markets" columns={columns} />;
}

export const page: AdminPage = { label: "Market Management", group: "Traders & trading", roles: ADMIN, component: MarketManagement };
