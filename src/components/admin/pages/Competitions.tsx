"use client";

import { ResourceList, type ColumnSpec } from "../ResourceList";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/competitions. It refreshes on the "competitions" realtime topic.
// Adjust the field names below to match your API response.
const columns: ColumnSpec[] = [
  { key: "name", label: "Name", format: "text" },
  { key: "prizePool", label: "Prize pool", format: "money" },
  { key: "status", label: "Status", format: "status" },
  { key: "endsAt", label: "Ends", format: "date" },
];

function Competitions() {
  return <ResourceList resource="competitions" columns={columns} />;
}

export const page: AdminPage = { label: "Competitions", group: "Communication", roles: ALL, component: Competitions };
