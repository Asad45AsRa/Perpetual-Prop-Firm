"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Discount codes. "Uses" and "Revenue" are counted by the server, never typed by hand.
// List: GET /admin/coupons   Create: POST /admin/coupons   Edit: PATCH /admin/coupons/:id
const config: PageConfig = {
  pageKey: "coupons",
  resource: "coupons",
  columns: [
    { key: "code", label: "Code" },
    { key: "discount", label: "Discount", format: "percent" },
    { key: "uses", label: "Uses", format: "number" },
    { key: "maxUses", label: "Max uses", format: "number" },
    { key: "perUserLimit", label: "Per trader", format: "number" },
    { key: "plan", label: "Plan" },
    { key: "affiliateCode", label: "Affiliate" },
    { key: "revenue", label: "Revenue from code", format: "money" },
    { key: "expiresAt", label: "Expires", format: "date" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "Create Coupon", kind: "create" },
  fields: [
    { key: "code", label: "Code", required: true, placeholder: "SAVE20", lockedOnEdit: true },
    { key: "discount", label: "Discount (%)", type: "number", required: true },
    { key: "maxUses", label: "Maximum uses", type: "number", required: true },
    { key: "perUserLimit", label: "Uses per trader", type: "number", default: 1 },
    { key: "plan", label: "Valid for plan", type: "select", options: ["All", "Starter", "Growth", "Pro"] },
    { key: "affiliateCode", label: "Linked affiliate code (optional)" },
    { key: "expiresAt", label: "Expires on", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["active", "disabled", "expired"] },
  ],
  filters: [{ key: "status", label: "Status" }, { key: "plan", label: "Plan" }],
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  detailTitle: (r) => String(r.code),
  exportName: "coupons",
  emptyText: "No coupons yet.",
};

function Coupons() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "coupons", label: "Coupons", group: "Finance & sales", component: Coupons };
