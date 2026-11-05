"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/settings. It refreshes on the "settings" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "key", label: "Setting", format: "text" },
  { key: "value", label: "Value", format: "text" },
  { key: "updatedAt", label: "Updated", format: "date" },
];

function PlatformSettings() {
  return <ResourceList resource="settings" columns={columns} />;
}

export const page: AdminPage = { label: "Platform Settings", group: "Platform control", roles: ADMIN, component: PlatformSettings };
