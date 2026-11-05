"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/cms. It refreshes on the "cms" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "page", label: "Page", format: "text" },
  { key: "status", label: "Status", format: "status" },
  { key: "updatedBy", label: "Updated by", format: "text" },
  { key: "updatedAt", label: "Updated", format: "date" },
];

function WebsiteCms() {
  return <ResourceList resource="cms" columns={columns} />;
}

export const page: AdminPage = { label: "Website CMS", group: "Communication", roles: ADMIN, component: WebsiteCms };
