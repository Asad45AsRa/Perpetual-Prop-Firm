"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/plans with create / edit / delete.
const config: PageConfig = {
  resource: "plans",
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "capital", label: "Capital", format: "money" },
    { key: "price", label: "Fee", format: "money" },
    { key: "profitTarget", label: "Target", format: "percent" },
    { key: "dailyLoss", label: "Daily loss", format: "percent" },
    { key: "maxLoss", label: "Max loss", format: "percent" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "Create Plan" },
  fields: [
    { key: "name", label: "Name", required: true },
    { key: "capital", label: "Capital ($)", type: "number", required: true },
    { key: "price", label: "Activation fee ($)", type: "number", required: true },
    { key: "profitTarget", label: "Profit target (%)", type: "number", default: 8 },
    { key: "dailyLoss", label: "Daily loss limit (%)", type: "number", default: 4 },
    { key: "maxLoss", label: "Max loss limit (%)", type: "number", default: 7 },
    { key: "status", label: "Status", type: "select", options: ["active", "draft", "disabled"] },
  ],
};

function ChallengePlans() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Challenge Plans", group: "Finance & sales", roles: ADMIN, component: ChallengePlans };
