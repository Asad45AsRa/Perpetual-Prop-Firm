"use client";

import { CustomPlanPreview } from "../CustomPlanPreview";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Plans are versioned by the server: editing the rules raises "Rules version" and affects NEW purchases only.
// Every account keeps the rules snapshot it was bought under.
//
// Plan types:
//   fixed  = one set of rules and one price (Elite, Breeze, Instant ...)
//   custom = "Capital Your Way": the trader picks profit target, daily loss, max drawdown, profit split and the
//            payment amount, but only inside the ranges set on this plan.
// Multiplier = account size / price paid (the 120x / 80x / 40x the trader sees). 0 means "calculate it for me".
// Rule overrides are text on purpose: an empty box means "use the global value from Platform Settings".
//
// List: GET /admin/plans   Create: POST /admin/plans   Edit: PATCH /admin/plans/:id
const config: PageConfig = {
  pageKey: "plans",
  resource: "plans",
  allowDelete: false, // a plan with history is switched off, never deleted
  columns: [
    { key: "name", label: "Plan" },
    { key: "planType", label: "Type", format: "status" },
    { key: "capital", label: "Account size", format: "money" },
    { key: "price", label: "Price", format: "money" },
    { key: "multiplier", label: "Multiplier", format: "multiplier" },
    { key: "challengeRequired", label: "Challenge phase", format: "status" },
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
    { key: "drawdownType", label: "Drawdown type", hidden: true },
    { key: "dailyLossMethod", label: "Daily loss measured on", hidden: true },
    { key: "takerFeePct", label: "Taker fee override", format: "percent", hidden: true },
    { key: "makerFeePct", label: "Maker fee override", format: "percent", hidden: true },
    { key: "maxExposurePct", label: "Max exposure override", format: "percent", hidden: true },
    { key: "holdHours", label: "Payout hold override (h)", format: "number", hidden: true },
  ],
  primary: { label: "Add Plan", kind: "create" },
  fields: [
    { key: "name", label: "Plan name", required: true, placeholder: "Pro" },
    { key: "planType", label: "Plan type", type: "select", options: ["fixed", "custom"], default: "fixed", help: "Custom = Capital Your Way. The trader chooses the rules inside the ranges at the bottom of this form." },
    { key: "capital", label: "Account size ($)", type: "number", required: true },
    { key: "price", label: "Price ($)", type: "number", required: true },
    { key: "multiplier", label: "Multiplier (x)", type: "number", default: 0, help: "Account size divided by price paid. Leave 0 to calculate it automatically." },
    { key: "challengeRequired", label: "Challenge phase required", type: "select", options: ["yes", "no"], default: "yes", help: "Choose no for an instant-funded plan: the account starts at the Funded Stage." },
    { key: "profitTarget", label: "Profit target (%)", type: "number", required: true, default: 8 },
    { key: "dailyLoss", label: "Daily loss limit (%)", type: "number", required: true, default: 4 },
    { key: "maxLoss", label: "Maximum drawdown (%)", type: "number", required: true, default: 7 },
    { key: "profitSplit", label: "Profit split (%)", type: "number", required: true, default: 80 },
    { key: "minDays", label: "Minimum trading days", type: "number", default: 0 },
    { key: "maxLeverage", label: "Maximum leverage", type: "number", default: 10 },
    { key: "payoutMin", label: "Minimum payout ($)", type: "number", default: 100 },
    { key: "payoutCycle", label: "Payout cycle", type: "select", options: ["On demand", "Weekly", "Bi-weekly", "Monthly"] },
    { key: "refundDays", label: "Refund window (days)", type: "number", default: 7 },
    // ----- rules that override the global settings for this plan only -----
    { key: "drawdownType", label: "Drawdown type", type: "select", options: ["global default", "static", "trailing"], default: "global default", help: "Overrides Platform Settings > Risk rules for this plan." },
    { key: "dailyLossMethod", label: "Daily loss is measured on", type: "select", options: ["global default", "balance-based", "equity-based"], default: "global default", help: "Overrides Platform Settings > Risk rules for this plan." },
    { key: "takerFeePct", label: "Taker fee override (%)", placeholder: "Empty = global", help: "Leave empty to use the global value." },
    { key: "makerFeePct", label: "Maker fee override (%)", placeholder: "Empty = global", help: "Leave empty to use the global value." },
    { key: "maxExposurePct", label: "Max exposure override (% of balance)", placeholder: "Empty = global", help: "Leave empty to use the global value." },
    { key: "holdHours", label: "Payout hold override (hours)", placeholder: "Empty = global", help: "Leave empty to use the global value." },
    // ----- ranges used only by custom plans (Capital Your Way) -----
    { key: "multiplierMin", label: "Custom: lowest multiplier (x)", type: "number", default: 0, help: "Only used when the plan type is custom." },
    { key: "multiplierMax", label: "Custom: highest multiplier (x)", type: "number", default: 0, help: "Only used when the plan type is custom." },
    { key: "paymentMin", label: "Custom: minimum payment ($)", type: "number", default: 0, help: "Only used when the plan type is custom." },
    { key: "paymentMax", label: "Custom: maximum payment ($)", type: "number", default: 0, help: "Only used when the plan type is custom." },
    { key: "profitTargetOptions", label: "Custom: profit target choices (%)", placeholder: "8, 10, 12", help: "Comma separated. Only used when the plan type is custom." },
    { key: "dailyLossOptions", label: "Custom: daily loss choices (%)", placeholder: "3, 4, 5", help: "Comma separated. Only used when the plan type is custom." },
    { key: "maxLossOptions", label: "Custom: max drawdown choices (%)", placeholder: "4, 5, 6", help: "Comma separated. Only used when the plan type is custom." },
    { key: "profitSplitOptions", label: "Custom: profit split choices (%)", placeholder: "80, 90", help: "Comma separated. Only used when the plan type is custom." },
    { key: "status", label: "Status", type: "select", options: ["active", "disabled"], help: "Changes apply to new purchases only. Existing accounts keep their rules." },
  ],
  filters: [{ key: "status", label: "Status" }, { key: "planType", label: "Type" }],
  detail: [
    { label: "Overview", kind: "fields" },
    { label: "Floors & calculator", kind: "custom", render: (r) => <CustomPlanPreview key={String(r.id)} plan={r} /> },
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
