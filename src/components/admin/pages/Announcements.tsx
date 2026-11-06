"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Messages shown to traders. Write the text, pick who sees it, optionally schedule it, then publish.
// List: GET /admin/announcements   Create: POST /admin/announcements   Actions: POST /admin/announcements/:id/<publish|unpublish>
const config: PageConfig = {
  pageKey: "announcements",
  resource: "announcements",
  columns: [
    { key: "title", label: "Title" },
    { key: "audience", label: "Audience" },
    { key: "type", label: "Type", format: "status" },
    { key: "scheduledAt", label: "Scheduled", format: "date" },
    { key: "expiresAt", label: "Expires", format: "date" },
    { key: "reads", label: "Read by", format: "number" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "New Announcement", kind: "create" },
  fields: [
    { key: "title", label: "Title", required: true },
    { key: "body", label: "Message", type: "textarea", required: true, placeholder: "What should traders know?" },
    { key: "audience", label: "Audience", type: "select", options: ["All Traders", "Challenge Traders", "Funded Traders", "Affiliates"] },
    { key: "type", label: "Type", type: "select", options: ["info", "warning", "banner"], help: "A banner stays pinned at the top of the trader dashboard." },
    { key: "scheduledAt", label: "Publish on (optional)", type: "date" },
    { key: "expiresAt", label: "Hide on (optional)", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["draft", "published"] },
  ],
  filters: [{ key: "status", label: "Status" }, { key: "audience", label: "Audience" }, { key: "type", label: "Type" }],
  actions: [
    { label: "Publish", action: "publish", tone: "success", success: "Announcement published.", show: (r) => r.status === "draft" },
    { label: "Unpublish", action: "unpublish", success: "Announcement unpublished.", show: (r) => r.status === "published" },
  ],
  bulkActions: [{ label: "Publish selected", action: "publish", success: "Announcements published." }],
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  detailTitle: (r) => String(r.title),
  exportName: "announcements",
  emptyText: "No announcements yet.",
};

function Announcements() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "announcements", label: "Announcements", group: "Communication", component: Announcements };
