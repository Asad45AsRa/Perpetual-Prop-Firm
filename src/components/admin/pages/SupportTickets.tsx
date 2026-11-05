"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/tickets. It refreshes on the "tickets" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "id", label: "ID", format: "text" },
  { key: "traderName", label: "Trader", format: "text" },
  { key: "subject", label: "Subject", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "createdAt", label: "Created", format: "date" },
];

function SupportTickets() {
  return <ResourceList resource="tickets" columns={columns} />;
}

export const page: AdminPage = { label: "Support Tickets", group: "Communication", roles: ALL, component: SupportTickets };
