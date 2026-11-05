"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/cms with create / edit / delete. "Updated by / at" are set by the server.
const config: PageConfig = {
  resource: "cms",
  columns: [
    { key: "id", label: "ID" },
    { key: "page", label: "Page" },
    { key: "type", label: "Type" },
    { key: "updatedBy", label: "Updated by" },
    { key: "updatedAt", label: "Updated", format: "date" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "Add Content" },
  fields: [
    { key: "page", label: "Page", required: true },
    { key: "type", label: "Type", type: "select", options: ["FAQ", "Policy", "Page", "Blog"] },
    { key: "status", label: "Status", type: "select", options: ["published", "draft"] },
  ],
};

function WebsiteCms() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Website CMS", group: "Communication", roles: ADMIN, component: WebsiteCms };
