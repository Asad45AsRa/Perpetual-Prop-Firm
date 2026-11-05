"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/affiliates with create / edit / delete.
const config: PageConfig = {
  resource: "affiliates",
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "referrals", label: "Referrals", format: "number" },
    { key: "commission", label: "Commission", format: "percent" },
    { key: "earnings", label: "Earnings", format: "money" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "Add Affiliate" },
  fields: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email" },
    { key: "code", label: "Referral code", required: true },
    { key: "commission", label: "Commission (%)", type: "number", default: 15 },
    { key: "status", label: "Status", type: "select", options: ["active", "suspended"] },
  ],
};

function AffiliateManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Affiliate Management", group: "Finance & sales", roles: ADMIN, component: AffiliateManagement };
