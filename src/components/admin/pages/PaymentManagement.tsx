"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/payments. Payments are created by the checkout provider, not by hand.
const config: PageConfig = {
  resource: "payments",
  columns: [
    { key: "id", label: "ID" },
    { key: "traderName", label: "Trader" },
    { key: "plan", label: "Plan" },
    { key: "amount", label: "Amount", format: "money" },
    { key: "method", label: "Method" },
    { key: "status", label: "Status", format: "status" },
    { key: "account", label: "Account" },
  ],
  primary: { kind: "info", label: "View Integration", text: "In a real setup, a payment counts only after the provider confirms it to your server. Connect your Plisio webhook here when the backend is ready." },
  allowCreate: false,
  fields: [
    { key: "amount", label: "Amount ($)", type: "number", required: true },
    { key: "method", label: "Method", required: true },
    { key: "status", label: "Status", type: "select", options: ["paid", "pending", "failed"] },
  ],
};

function PaymentManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Payment Management", group: "Finance & sales", roles: ADMIN, component: PaymentManagement };
