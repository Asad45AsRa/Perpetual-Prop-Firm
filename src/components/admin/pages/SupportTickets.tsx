"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/tickets. Start / Resolve are POST /admin/tickets/:id/start | resolve.
const config: PageConfig = {
  resource: "tickets",
  columns: [
    { key: "id", label: "ID" },
    { key: "traderName", label: "Trader" },
    { key: "subject", label: "Subject" },
    { key: "priority", label: "Priority", format: "status" },
    { key: "assigned", label: "Assigned" },
    { key: "status", label: "Status", format: "status" },
    { key: "createdAt", label: "Created", format: "date" },
  ],
  primary: { kind: "create", label: "Create Ticket" },
  createPermission: "tickets.reply",
  fields: [
    { key: "traderName", label: "Trader", required: true },
    { key: "subject", label: "Subject", required: true },
    { key: "priority", label: "Priority", type: "select", options: ["normal", "medium", "high"] },
    { key: "assigned", label: "Assigned to", type: "select", options: ["Support Team", "Finance Team", "Risk Team"] },
    { key: "status", label: "Status", type: "select", options: ["open", "in progress", "closed"] },
  ],
  actions: [
    { label: "Start", action: "start", permission: "tickets.reply", show: (r) => r.status === "open", success: "Ticket is now in progress." },
    { label: "Resolve", action: "resolve", tone: "gold", permission: "tickets.reply", show: (r) => r.status !== "closed", success: "Ticket closed." },
  ],
};

function SupportTickets() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Support Tickets", group: "Communication", roles: ALL, component: SupportTickets };
