"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Affiliates, their commission rules and fraud signals.
// List: GET /admin/affiliates   Referrals tab: GET /admin/referrals?affiliateId=...
const config: PageConfig = {
  pageKey: "affiliates",
  resource: "affiliates",
  allowDelete: false, // an affiliate with earnings is suspended, never deleted
  columns: [
    { key: "name", label: "Affiliate" },
    { key: "email", label: "Email" },
    { key: "code", label: "Code" },
    { key: "referrals", label: "Referrals", format: "number" },
    { key: "conversionRate", label: "Conversion", format: "percent" },
    { key: "commission", label: "Commission", format: "percent" },
    { key: "earnings", label: "Earnings", format: "money" },
    { key: "fraudFlags", label: "Fraud flags", format: "status" },
    { key: "status", label: "Status", format: "status" },
    { key: "holdDays", label: "Hold (days)", format: "number", hidden: true },
  ],
  primary: { label: "Add Affiliate", kind: "create" },
  fields: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "code", label: "Referral code", required: true, placeholder: "PARTNER10", lockedOnEdit: true },
    { key: "commission", label: "Commission (%)", type: "number", required: true, default: 15 },
    { key: "holdDays", label: "Hold period (days)", type: "number", default: 14, help: "Commission is paid only after this many days, so refunds can be clawed back." },
    { key: "status", label: "Status", type: "select", options: ["active", "suspended"] },
  ],
  filters: [{ key: "status", label: "Status" }, { key: "fraudFlags", label: "Fraud flag" }],
  actions: [
    { label: "Suspend", action: "suspend", reason: true, tone: "danger", success: "Affiliate suspended.", show: (r) => r.status === "active" },
    { label: "Restore", action: "restore", tone: "success", success: "Affiliate restored.", show: (r) => r.status === "suspended" },
  ],
  detail: [
    { label: "Overview", kind: "fields" },
    {
      label: "Referrals", kind: "list", resource: "referrals",
      path: (r) => `/admin/referrals?affiliateId=${encodeURIComponent(String(r.id))}&pageSize=50`,
      columns: [{ key: "trader", label: "Trader" }, { key: "status", label: "Status", format: "status" }, { key: "amount", label: "Sale", format: "money" }, { key: "commission", label: "Commission", format: "money" }, { key: "flag", label: "Flag", format: "status" }, { key: "at", label: "When", format: "ago" }],
    },
    { label: "Notes", kind: "notes" },
    { label: "History", kind: "timeline" },
  ],
  detailTitle: (r) => String(r.name),
  exportName: "affiliates",
  emptyText: "No affiliates yet.",
};

function AffiliateManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "affiliates", label: "Affiliate Management", group: "Finance & sales", component: AffiliateManagement };
