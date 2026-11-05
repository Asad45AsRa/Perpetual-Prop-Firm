"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { ADMIN } from "../permissions";
import type { AdminPage } from "../types";

// Live list for GET /admin/emails with create / edit / delete.
const config: PageConfig = {
  resource: "emails",
  columns: [
    { key: "id", label: "ID" },
    { key: "template", label: "Template" },
    { key: "trigger", label: "Trigger" },
    { key: "channel", label: "Channel" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "New Template" },
  fields: [
    { key: "template", label: "Template name", required: true },
    { key: "trigger", label: "Trigger", required: true, placeholder: "Signup" },
    { key: "channel", label: "Channel", type: "select", options: ["Resend"] },
    { key: "status", label: "Status", type: "select", options: ["enabled", "disabled"] },
  ],
};

function EmailManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { label: "Email Management", group: "Communication", roles: ADMIN, component: EmailManagement };
