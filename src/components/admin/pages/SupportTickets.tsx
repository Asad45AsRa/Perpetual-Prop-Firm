"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Support inbox. Click a ticket to read the whole conversation, reply, add an internal note
// (traders never see notes) or insert a canned reply.
// List: GET /admin/tickets   Thread: GET /admin/ticket-messages?ticketId=...   Reply: POST /admin/tickets/:id/reply
const config: PageConfig = {
  pageKey: "tickets",
  resource: "tickets",
  readOnly: true,
  columns: [
    { key: "id", label: "Ticket" },
    { key: "traderName", label: "Trader" },
    { key: "subject", label: "Subject" },
    { key: "priority", label: "Priority", format: "status" },
    { key: "assigned", label: "Assigned to" },
    { key: "slaDueAt", label: "Reply due", format: "date" },
    { key: "status", label: "Status", format: "status" },
    { key: "createdAt", label: "Opened", format: "ago" },
  ],
  primary: { label: "Export tickets", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "priority", label: "Priority" }, { key: "assigned", label: "Assigned to" }],
  views: [{ label: "Open", filters: { status: "open" } }, { label: "High priority", filters: { priority: "high" } }],
  dateKey: "createdAt",
  actions: [
    { label: "Start", action: "start", permission: "tickets.reply", success: "Ticket started.", show: (r) => r.status === "open" },
    { label: "Close", action: "resolve", tone: "success", permission: "tickets.reply", success: "Ticket closed.", show: (r) => r.status !== "closed" },
  ],
  bulkActions: [
    { label: "Close selected", action: "resolve", permission: "tickets.reply", success: "Tickets closed." },
    { label: "Start selected", action: "start", permission: "tickets.reply", success: "Tickets started." },
  ],
  detailTitle: (r) => `${r.id} · ${r.subject}`,
  detail: [
    { label: "Conversation", kind: "thread" },
    { label: "Overview", kind: "fields" },
    { label: "Notes", kind: "notes" },
    { label: "History", kind: "timeline" },
  ],
  exportName: "tickets",
  emptyText: "No tickets yet.",
};

function SupportTickets() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "tickets", label: "Support Tickets", group: "Communication", component: SupportTickets };
