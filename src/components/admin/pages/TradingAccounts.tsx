"use client";

import { AccountAnalytics } from "../AccountAnalytics";
import { BreachExplainer } from "../BreachExplainer";
import { STAGE } from "../constants";
import { ResourcePage, type PageConfig, type Row } from "../ResourcePage";
import type { AdminPage } from "../types";

// Accounts are opened and evaluated by the trading engine. A person can only override the engine
// with a written reason, and every override is shown in the audit log as "Manual override".
// List: GET /admin/accounts   Actions: POST /admin/accounts/:id/<pass|fail|lock|unlock|force-close|reset>
// Detail tabs: GET /admin/accounts/:id/analytics (trader figures), /breach (why it failed), /equity
const active = (r: Row) => r.status === "active";

const config: PageConfig = {
  pageKey: "accounts",
  resource: "accounts",
  readOnly: true,
  columns: [
    { key: "id", label: "Account" },
    { key: "traderName", label: "Trader" },
    { key: "plan", label: "Plan" },
    { key: "stage", label: "Stage" },
    { key: "balance", label: "Balance", format: "money" },
    { key: "equity", label: "Equity", format: "money" },
    { key: "pnl", label: "P&L", format: "pnl" },
    { key: "dailyLossUsed", label: "Daily loss used", format: "progress" },
    { key: "drawdownUsed", label: "Drawdown used", format: "progress" },
    { key: "targetProgress", label: "Target", format: "progress" },
    { key: "tradingDays", label: "Days", format: "number" },
    { key: "status", label: "Status", format: "status" },
    { key: "highWater", label: "High-water mark", format: "money", hidden: true },
    { key: "rulesSnapshot", label: "Rules snapshot", hidden: true },
  ],
  primary: { label: "Export accounts", kind: "export" },
  filters: [{ key: "stage", label: "Stage" }, { key: "status", label: "Status" }, { key: "plan", label: "Plan" }],
  views: [
    { label: "Locked or failed", filters: { status: "locked" } },
    { label: "Funded", filters: { stage: STAGE.funded } },
  ],
  actions: [
    { label: "Pass", action: "pass", reason: true, tone: "success", permission: "account.override", success: "Account moved to the funded stage.", show: (r) => r.stage === STAGE.challenge && active(r) },
    { label: "Fail", action: "fail", reason: true, tone: "danger", permission: "account.override", success: "Account failed.", show: active },
    { label: "Lock", action: "lock", reason: true, permission: "account.override", success: "Account locked.", show: active },
    { label: "Unlock", action: "unlock", reason: true, tone: "success", permission: "account.override", success: "Account unlocked.", show: (r) => r.status === "locked" },
    { label: "Close positions", action: "force-close", reason: true, permission: "account.override", success: "Open positions closed.", show: active },
    { label: "Reset", action: "reset", reason: true, tone: "danger", permission: "account.override", success: "Account reset.", show: (r) => r.status !== "passed" },
  ],
  // Bulk actions skip any account that cannot take the action (for example "Unlock" on an active account)
  // and report how many were done and how many failed. Pass, fail and reset stay single-account only on purpose.
  // Run: POST /admin/accounts/bulk/<lock|unlock|force-close> { ids, reason }
  bulkActions: [
    { label: "Lock selected", action: "lock", reason: true, permission: "account.override", success: "Accounts locked." },
    { label: "Unlock selected", action: "unlock", reason: true, permission: "account.override", success: "Accounts unlocked." },
    { label: "Close positions on selected", action: "force-close", reason: true, permission: "account.override", success: "Open positions closed." },
  ],
  detailTitle: (r) => `${r.id} · ${r.traderName}`,
  detail: [
    { label: "Overview", kind: "fields" },
    { label: "Trader analytics", kind: "custom", render: (r) => <AccountAnalytics key={String(r.id)} row={r} /> },
    { label: "Why failed or locked", kind: "custom", render: (r) => <BreachExplainer key={String(r.id)} row={r} /> },
    { label: "Equity", kind: "equity" },
    {
      label: "Risk events", kind: "list", resource: "risk",
      path: (r) => `/admin/risk?accountId=${encodeURIComponent(String(r.id))}&pageSize=50`,
      columns: [{ key: "rule", label: "Rule" }, { key: "valueAtBreach", label: "Value" }, { key: "action", label: "Action taken" }, { key: "status", label: "Status", format: "status" }, { key: "detectedAt", label: "Detected", format: "ago" }],
    },
    {
      label: "Orders", kind: "list", resource: "activity",
      path: (r) => `/admin/activity?accountId=${encodeURIComponent(String(r.id))}&pageSize=50`,
      columns: [{ key: "id", label: "Order" }, { key: "market", label: "Market" }, { key: "side", label: "Side", format: "status" }, { key: "size", label: "Size" }, { key: "pnl", label: "P&L", format: "pnl" }, { key: "status", label: "Status", format: "status" }],
    },
    {
      label: "Fills", kind: "list", resource: "fills",
      path: (r) => `/admin/fills?accountId=${encodeURIComponent(String(r.id))}&pageSize=50`,
      columns: [{ key: "id", label: "Fill" }, { key: "market", label: "Market" }, { key: "price", label: "Price", format: "number" }, { key: "fee", label: "Fee", format: "money" }, { key: "filledAt", label: "Filled", format: "ago" }],
    },
    {
      label: "Fees & funding", kind: "list", resource: "fees",
      path: (r) => `/admin/fees?accountId=${encodeURIComponent(String(r.id))}&pageSize=50`,
      columns: [{ key: "kind", label: "Type" }, { key: "market", label: "Market" }, { key: "amount", label: "Amount", format: "pnl" }, { key: "at", label: "When", format: "ago" }],
    },
    { label: "Rules snapshot", kind: "custom", render: (r) => <p className="text-[15px] leading-relaxed text-white/70">{String(r.rulesSnapshot)}. The rules this account was bought under. Later plan edits never change them.</p> },
    { label: "Notes", kind: "notes" },
    { label: "History", kind: "timeline" },
  ],
  exportName: "accounts",
  emptyText: "No accounts yet.",
};

function TradingAccounts() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "accounts", label: "Trading Accounts", group: "Traders & trading", component: TradingAccounts };
