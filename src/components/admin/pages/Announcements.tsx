"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ALL } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/announcements. Published announcements show up in the trader app.
const config: PageConfig = {
  resource: "announcements",
  columns: [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "audience", label: "Audience" },
    { key: "publishedAt", label: "Published", format: "date" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "New Announcement" },
  fields: [
    { key: "title", label: "Title", required: true },
    { key: "audience", label: "Audience", type: "select", options: ["All Traders", "Funded Traders", "Challenge Traders"] },
    { key: "status", label: "Status", type: "select", options: ["published", "draft"] },
  ],
};

function Announcements() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Announcements", group: "Communication", roles: ALL, component: Announcements };
