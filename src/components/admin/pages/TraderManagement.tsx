"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/traders with create / edit / delete and suspend actions.
// Adjust the field names to match your API response.
const config: PageConfig = {
  resource: "traders",
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "country", label: "Country" },
    { key: "accounts", label: "Accounts", format: "number" },
    { key: "status", label: "Status", format: "status" },
    { key: "joinedAt", label: "Joined", format: "date" },
  ],
  primary: { kind: "create", label: "Add Trader" },
  fields: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "country", label: "Country" },
    { key: "status", label: "Status", type: "select", options: ["active", "suspended"] },
  ],
  actions: [
    { label: "Suspend", action: "suspend", permission: "traders.suspend", show: (r) => r.status !== "suspended", success: "Trader suspended.", confirm: "Suspend this trader? Trading stops immediately." },
    { label: "Unsuspend", action: "unsuspend", permission: "traders.suspend", tone: "success", show: (r) => r.status === "suspended", success: "Trader restored." },
  ],
};

function TraderManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Trader Management", group: "Traders & trading", roles: ALL, component: TraderManagement };
