"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Plans are versioned by the server: editing the rules raises "Rules version" and affects NEW purchases only.
// Every account keeps the rules snapshot it was bought under.
// List: GET /admin/plans   Create: POST /admin/plans   Edit: PATCH /admin/plans/:id
const config: PageConfig = {
  pageKey: "plans",
  resource: "plans",
  allowDelete: false, // a plan with history is switched off, never deleted
  columns: [
    { key: "name", label: "Plan" },
    { key: "capital", label: "Account size", format: "money" },
    { key: "price", label: "Price", format: "money" },
    { key: "profitTarget", label: "Profit target", format: "percent" },
    { key: "dailyLoss", label: "Daily loss", format: "percent" },
    { key: "maxLoss", label: "Max drawdown", format: "percent" },
    { key: "profitSplit", label: "Profit split", format: "percent" },
    { key: "planVersion", label: "Rules version", format: "number" },
    { key: "status", label: "Status", format: "status" },
    { key: "minDays", label: "Min days", format: "number", hidden: true },
    { key: "maxLeverage", label: "Max leverage", format: "multiplier", hidden: true },
    { key: "payoutMin", label: "Min payout", format: "money", hidden: true },
    { key: "payoutCycle", label: "Payout cycle", hidden: true },
    { key: "refundDays", label: "Refund window (days)", format: "number", hidden: true },
  ],
  primary: { label: "Add Plan", kind: "create" },
  fields: [
    { key: "name", label: "Plan name", required: true, placeholder: "Pro" },
    { key: "capital", label: "Account size ($)", type: "number", required: true },
    { key: "price", label: "Price ($)", type: "number", required: true },
    { key: "profitTarget", label: "Profit target (%)", type: "number", required: true, default: 8 },
    { key: "dailyLoss", label: "Daily loss limit (%)", type: "number", required: true, default: 4 },
    { key: "maxLoss", label: "Maximum drawdown (%)", type: "number", required: true, default: 7 },
    { key: "profitSplit", label: "Profit split (%)", type: "number", required: true, default: 80 },
    { key: "minDays", label: "Minimum trading days", type: "number", default: 0 },
    { key: "maxLeverage", label: "Maximum leverage", type: "number", default: 10 },
    { key: "payoutMin", label: "Minimum payout ($)", type: "number", default: 100 },
    { key: "payoutCycle", label: "Payout cycle", type: "select", options: ["On demand", "Weekly", "Bi-weekly", "Monthly"] },
    { key: "refundDays", label: "Refund window (days)", type: "number", default: 7 },
    { key: "status", label: "Status", type: "select", options: ["active", "disabled"], help: "Changes apply to new purchases only. Existing accounts keep their rules." },
  ],
  filters: [{ key: "status", label: "Status" }],
  detail: [
    { label: "Overview", kind: "fields" },
    { label: "Impact of changes", kind: "checks", path: (r) => `/admin/plans/${encodeURIComponent(String(r.id))}/impact` },
    {
      label: "Change history", kind: "list", resource: "audit-logs",
      path: (r) => `/admin/audit-logs?target=${encodeURIComponent(String(r.id))}&pageSize=30`,
      columns: [{ key: "action", label: "Change" }, { key: "actor", label: "By" }, { key: "createdAt", label: "When", format: "ago" }],
    },
  ],
  detailTitle: (r) => `${r.name} plan`,
  exportName: "plans",
  emptyText: "No plans yet. Add the first one.",
};

function ChallengePlans() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "plans", label: "Challenge Plans", group: "Finance & sales", component: ChallengePlans };
