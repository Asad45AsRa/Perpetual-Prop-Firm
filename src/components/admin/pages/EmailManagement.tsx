"use client";

import { useState } from "react";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Tabs } from "../ui";
import type { AdminPage } from "../types";

// Emails the platform sends through Resend. Templates are edited here; every email that was sent
// (or failed, or bounced) appears in the delivery log, where a failed one can be retried.
// Templates: GET /admin/emails   Test send: POST /admin/emails/:id/test-send {to}
// Log: GET /admin/email-log   Retry: POST /admin/email-log/:id/retry
const templates: PageConfig = {
  pageKey: "emails",
  resource: "emails",
  allowDelete: false,
  columns: [
    { key: "template", label: "Template" },
    { key: "trigger", label: "Sent when" },
    { key: "subject", label: "Subject" },
    { key: "channel", label: "Channel" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "Add Template", kind: "create" },
  fields: [
    { key: "template", label: "Template name", required: true },
    { key: "trigger", label: "Sent when", required: true, placeholder: "Signup" },
    { key: "channel", label: "Channel", type: "select", options: ["Resend"] },
    { key: "subject", label: "Subject", required: true },
    { key: "body", label: "Body", type: "textarea", required: true, help: "Use {{name}}, {{amount}}, {{hash}} and similar placeholders." },
    { key: "status", label: "Status", type: "select", options: ["enabled", "disabled"] },
  ],
  actions: [
    {
      label: "Send test", action: "test-send", success: "Test email sent.",
      inputs: [{ key: "to", label: "Send the test to", type: "email", required: true }],
    },
  ],
  detail: [
    { label: "Preview", kind: "custom", render: (r) => (
      <div className="border border-white/[0.08] bg-white/[0.02] p-5">
        <p className="text-[12px] text-white/40">Subject</p>
        <p className="mb-4 text-[17px] text-white">{String(r.subject)}</p>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/70">{String(r.body)}</p>
      </div>
    ) },
    { label: "History", kind: "timeline" },
  ],
  detailTitle: (r) => String(r.template),
  exportName: "email-templates",
  emptyText: "No templates yet.",
};

const log: PageConfig = {
  pageKey: "emails",
  resource: "email-log",
  readOnly: true,
  columns: [
    { key: "template", label: "Template" },
    { key: "to", label: "Sent to" },
    { key: "status", label: "Result", format: "status" },
    { key: "error", label: "Problem" },
    { key: "providerId", label: "Resend id", format: "hash" },
    { key: "sentAt", label: "Sent", format: "ago" },
  ],
  primary: { label: "Export log", kind: "export" },
  filters: [{ key: "status", label: "Result" }, { key: "template", label: "Template" }],
  views: [{ label: "Failed", filters: { status: "failed" } }, { label: "Bounced", filters: { status: "bounced" } }],
  dateKey: "sentAt",
  actions: [{ label: "Retry", action: "retry", success: "Email queued again.", show: (r) => r.status === "failed" || r.status === "bounced" }],
  bulkActions: [{ label: "Retry selected", action: "retry", success: "Emails queued again." }],
  exportName: "email-log",
  emptyText: "No emails sent yet.",
};

const VIEWS = { Templates: templates, "Delivery log": log } as const;

function EmailManagement() {
  const [tab, setTab] = useState<keyof typeof VIEWS>("Templates");
  return (
    <>
      <Tabs tabs={Object.keys(VIEWS)} active={tab} onChange={(t) => setTab(t as keyof typeof VIEWS)} />
      <ResourcePage key={tab} config={VIEWS[tab]} />
    </>
  );
}

export const page: AdminPage = { key: "emails", label: "Email Management", group: "Communication", component: EmailManagement };
