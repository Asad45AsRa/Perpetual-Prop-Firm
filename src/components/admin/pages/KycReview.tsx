"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminPage } from "../types";

// Identity checks. A case from a restricted country can only be rejected, never approved.
// List: GET /admin/kyc   Actions: POST /admin/kyc/:id/<approve|reject|resubmit>
const waiting = (r: Record<string, unknown>) => r.status === "pending" || r.status === "resubmit";

const config: PageConfig = {
  pageKey: "kyc",
  resource: "kyc",
  readOnly: true,
  columns: [
    { key: "id", label: "Case" },
    { key: "traderName", label: "Trader" },
    { key: "country", label: "Country" },
    { key: "docType", label: "Document" },
    { key: "restricted", label: "Restricted country", format: "bool" },
    { key: "reviewer", label: "Reviewed by" },
    { key: "submittedAt", label: "Submitted", format: "ago" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "Export cases", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "country", label: "Country" }, { key: "docType", label: "Document" }],
  views: [{ label: "Waiting for review", filters: { status: "pending" } }, { label: "Restricted country", filters: { restricted: "true" } }],
  dateKey: "submittedAt",
  actions: [
    { label: "Approve", action: "approve", tone: "success", permission: "kyc.review", confirm: "Approve this identity check?", success: "KYC approved.", show: (r) => waiting(r) && !r.restricted },
    { label: "Reject", action: "reject", reason: true, tone: "danger", permission: "kyc.review", success: "KYC rejected.", show: waiting },
    { label: "Ask to resubmit", action: "resubmit", reason: true, permission: "kyc.review", success: "The trader was asked to resubmit.", show: (r) => r.status === "pending" },
  ],
  detail: [{ label: "Overview", kind: "fields" }, { label: "Notes", kind: "notes" }, { label: "History", kind: "timeline" }],
  exportName: "kyc-cases",
  emptyText: "No KYC cases yet.",
};

function KycReview() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "kyc", label: "KYC Review", group: "Traders & trading", component: KycReview };
