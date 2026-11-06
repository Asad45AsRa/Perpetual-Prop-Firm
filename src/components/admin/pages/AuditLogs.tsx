"use client";

import { useState } from "react";
import { adminApi } from "../adminApi";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Btn, describeError, useToast } from "../ui";
import type { AdminPage } from "../types";

// The permanent record of who did what. Read-only for everyone, including the super admin.
// Every entry is chained to the one before it, so any edit or deletion in the database is detectable:
// "Verify integrity" re-checks the whole chain.
// List: GET /admin/audit-logs   Verify: POST /admin/audit-logs/verify -> { ok, checked, brokenAt? }
function VerifyIntegrity() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    setBusy(true);
    try {
      const res = await adminApi<{ ok: boolean; checked: number; brokenAt?: string }>("/admin/audit-logs/verify", { method: "POST" });
      toast(res.ok ? `Audit trail is intact (${res.checked} entries checked).` : `Audit trail was changed. Chain breaks at ${res.brokenAt}.`, !res.ok);
    } catch (err) {
      toast(describeError(err), true);
    } finally {
      setBusy(false);
    }
  };
  return <Btn disabled={busy} onClick={verify}>{busy ? "Checking…" : "Verify integrity"}</Btn>;
}

const config: PageConfig = {
  pageKey: "audit-logs",
  resource: "audit-logs",
  readOnly: true,
  columns: [
    { key: "action", label: "Action" },
    { key: "actor", label: "Who" },
    { key: "target", label: "On" },
    { key: "result", label: "Result", format: "status" },
    { key: "reason", label: "Reason" },
    { key: "ip", label: "IP address" },
    { key: "createdAt", label: "When", format: "ago" },
    { key: "requestId", label: "Request id", format: "hash", hidden: true },
    { key: "hash", label: "Entry hash", format: "hash", hidden: true },
  ],
  primary: { label: "Export audit log", kind: "export" },
  exportPermission: "audit.export",
  toolbar: <VerifyIntegrity />,
  filters: [{ key: "actor", label: "Who" }, { key: "result", label: "Result" }],
  views: [{ label: "Denied or failed", filters: { result: "denied" } }],
  dateKey: "createdAt",
  defaultSort: { key: "createdAt", order: "desc" },
  detailTitle: (r) => String(r.action),
  detail: [
    { label: "What changed", kind: "diff" },
    { label: "Details", kind: "fields", fields: [
      { key: "actor", label: "Who" }, { key: "action", label: "Action" }, { key: "target", label: "On" }, { key: "result", label: "Result", format: "status" },
      { key: "reason", label: "Reason" }, { key: "ip", label: "IP address" }, { key: "requestId", label: "Request id" },
      { key: "createdAt", label: "When", format: "date" }, { key: "prevHash", label: "Previous hash" }, { key: "hash", label: "Entry hash" },
    ] },
  ],
  exportName: "audit-log",
  emptyText: "Nothing has been logged yet.",
};

function AuditLogs() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "audit-logs", label: "Audit Logs", group: "Platform control", component: AuditLogs };
