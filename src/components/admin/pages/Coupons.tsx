"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/coupons with create / edit / delete.
const config: PageConfig = {
  resource: "coupons",
  columns: [
    { key: "id", label: "ID" },
    { key: "code", label: "Code" },
    { key: "discount", label: "Discount", format: "percent" },
    { key: "uses", label: "Uses", format: "number" },
    { key: "maxUses", label: "Max uses", format: "number" },
    { key: "expiresAt", label: "Expires", format: "date" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "Create Coupon" },
  fields: [
    { key: "code", label: "Code", required: true, placeholder: "WELCOME15" },
    { key: "discount", label: "Discount (%)", type: "number", required: true },
    { key: "maxUses", label: "Max uses", type: "number", default: 100 },
    { key: "expiresAt", label: "Expires on", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["active", "expired", "disabled"] },
  ],
};

function Coupons() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Coupons", group: "Finance & sales", roles: ADMIN, component: Coupons };
