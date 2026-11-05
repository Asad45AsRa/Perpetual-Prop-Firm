"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/announcements. It refreshes on the "announcements" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "title", label: "Title", format: "text" },
  { key: "audience", label: "Audience", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "publishedAt", label: "Published", format: "date" },
];

function Announcements() {
  return <ResourceList resource="announcements" columns={columns} />;
}

export const page: AdminPage = { label: "Announcements", group: "Communication", roles: ALL, component: Announcements };
