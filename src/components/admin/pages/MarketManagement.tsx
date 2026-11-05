"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/markets with create / edit / delete.
const config: PageConfig = {
  resource: "markets",
  columns: [
    { key: "id", label: "ID" },
    { key: "symbol", label: "Symbol" },
    { key: "category", label: "Category" },
    { key: "maxLeverage", label: "Leverage", format: "multiplier" },
    { key: "fee", label: "Fee", format: "percent" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "Add Market" },
  fields: [
    { key: "symbol", label: "Symbol", required: true, placeholder: "BTC-PERP" },
    { key: "category", label: "Category", type: "select", options: ["Crypto", "Commodities", "Forex", "Stocks"] },
    { key: "maxLeverage", label: "Max leverage (x)", type: "number", default: 10 },
    { key: "fee", label: "Simulated fee (%)", type: "number", default: 0.05 },
    { key: "status", label: "Status", type: "select", options: ["enabled", "disabled"] },
  ],
};

function MarketManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Market Management", group: "Traders & trading", roles: ADMIN, component: MarketManagement };
