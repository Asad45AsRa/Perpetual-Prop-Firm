"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/competitions with create / edit / delete (admin only).
const config: PageConfig = {
  resource: "competitions",
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "participants", label: "Participants", format: "number" },
    { key: "prize", label: "Prize" },
    { key: "endsAt", label: "Ends", format: "date" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "Create Competition" },
  fields: [
    { key: "name", label: "Name", required: true },
    { key: "prize", label: "Prize" },
    { key: "endsAt", label: "Ends on", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["draft", "live", "closed"] },
  ],
};

function Competitions() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Competitions", group: "Communication", roles: ALL, component: Competitions };
