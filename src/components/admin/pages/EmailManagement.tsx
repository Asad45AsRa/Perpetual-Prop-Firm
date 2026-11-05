"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/emails. It refreshes on the "emails" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "subject", label: "Subject", format: "text" },
  { key: "audience", label: "Audience", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "sentAt", label: "Sent", format: "date" },
];

function EmailManagement() {
  return <ResourceList resource="emails" columns={columns} />;
}

export const page: AdminPage = { label: "Email Management", group: "Communication", roles: ADMIN, component: EmailManagement };
