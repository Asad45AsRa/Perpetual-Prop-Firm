"use client";

import { useState } from "react";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Tabs } from "../ui";
import type { AdminPage } from "../types";

// Everything the trading engine did, in three read-only views.
// Orders: GET /admin/activity   Fills: GET /admin/fills   Fees and funding: GET /admin/fees
const orders: PageConfig = {
  pageKey: "activity",
  resource: "activity",
  readOnly: true,
  columns: [
    { key: "id", label: "Order" },
    { key: "accountId", label: "Account" },
    { key: "traderName", label: "Trader" },
    { key: "market", label: "Market" },
    { key: "side", label: "Side", format: "status" },
    { key: "size", label: "Size" },
    { key: "entry", label: "Entry", format: "number" },
    { key: "pnl", label: "P&L", format: "pnl" },
    { key: "slippage", label: "Slippage", format: "percent" },
    { key: "flag", label: "Flag", format: "status" },
    { key: "status", label: "Status", format: "status" },
    { key: "openedAt", label: "Opened", format: "ago" },
  ],
  primary: { label: "Export orders", kind: "export" },
  filters: [{ key: "market", label: "Market" }, { key: "side", label: "Side" }, { key: "status", label: "Status" }, { key: "flag", label: "Flag" }],
  views: [{ label: "Flagged orders", filters: { flag: "burst-orders" } }],
  dateKey: "openedAt",
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  exportName: "orders",
  emptyText: "No trades yet.",
};

const fills: PageConfig = {
  pageKey: "activity",
  resource: "fills",
  readOnly: true,
  columns: [
    { key: "id", label: "Fill" },
    { key: "orderId", label: "Order" },
    { key: "accountId", label: "Account" },
    { key: "market", label: "Market" },
    { key: "side", label: "Side", format: "status" },
    { key: "price", label: "Price", format: "number" },
    { key: "size", label: "Size", format: "number" },
    { key: "fee", label: "Fee", format: "money" },
    { key: "slippage", label: "Slippage", format: "percent" },
    { key: "filledAt", label: "Filled", format: "ago" },
  ],
  primary: { label: "Export fills", kind: "export" },
  filters: [{ key: "market", label: "Market" }, { key: "side", label: "Side" }],
  dateKey: "filledAt",
  // The price snapshot is the proof used when a trader disputes a fill
  detail: [
    { label: "Price snapshot", kind: "fields", fields: [
      { key: "price", label: "Fill price", format: "number" }, { key: "bid", label: "Best bid", format: "number" },
      { key: "ask", label: "Best ask", format: "number" }, { key: "mark", label: "Mark price", format: "number" },
      { key: "slippage", label: "Slippage applied", format: "percent" }, { key: "fee", label: "Fee", format: "money" },
    ] },
  ],
  exportName: "fills",
  emptyText: "No fills yet.",
};

const fees: PageConfig = {
  pageKey: "activity",
  resource: "fees",
  readOnly: true,
  columns: [
    { key: "id", label: "Entry" },
    { key: "accountId", label: "Account" },
    { key: "kind", label: "Type", format: "status" },
    { key: "market", label: "Market" },
    { key: "amount", label: "Amount", format: "pnl" },
    { key: "at", label: "When", format: "ago" },
  ],
  primary: { label: "Export fees", kind: "export" },
  filters: [{ key: "kind", label: "Type" }, { key: "market", label: "Market" }],
  dateKey: "at",
  exportName: "fees-and-funding",
  emptyText: "No fees or funding yet.",
};

const VIEWS = { Orders: orders, Fills: fills, "Fees & funding": fees } as const;

function TradingActivity() {
  const [tab, setTab] = useState<keyof typeof VIEWS>("Orders");
  return (
    <>
      <Tabs tabs={Object.keys(VIEWS)} active={tab} onChange={(t) => setTab(t as keyof typeof VIEWS)} />
      <ResourcePage key={tab} config={VIEWS[tab]} />
    </>
  );
}

export const page: AdminPage = { key: "activity", label: "Trading Activity", group: "Traders & trading", component: TradingActivity };
