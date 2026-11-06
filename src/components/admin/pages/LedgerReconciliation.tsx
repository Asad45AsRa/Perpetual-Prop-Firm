"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Card } from "../ui";
import type { AdminPage } from "../types";

// Proves that the ledger, the account balances and the open positions agree.
// A mismatch means money or an entry is missing somewhere, so each one must be investigated and resolved with a note.
// Mismatches: GET /admin/ledger   Runs: GET /admin/ledger-runs   Run now: POST /admin/ledger-runs/run
const mismatches: PageConfig = {
  pageKey: "ledger",
  resource: "ledger",
  readOnly: true,
  columns: [
    { key: "id", label: "Mismatch" },
    { key: "runId", label: "Run" },
    { key: "accountId", label: "Account" },
    { key: "ledgerBalance", label: "Ledger says", format: "money" },
    { key: "accountBalance", label: "Account says", format: "money" },
    { key: "diff", label: "Difference", format: "pnl" },
    { key: "note", label: "What was found" },
    { key: "detectedAt", label: "Found", format: "ago" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "Run reconciliation now", kind: "action", path: "/admin/ledger-runs/run", success: "Reconciliation finished." },
  filters: [{ key: "status", label: "Status" }],
  views: [{ label: "Open mismatches", filters: { status: "mismatch" } }],
  actions: [{ label: "Resolve", action: "resolve", reason: true, tone: "success", success: "Mismatch resolved.", show: (r) => r.status === "mismatch" }],
  detail: [{ label: "Overview", kind: "fields" }, { label: "Notes", kind: "notes" }, { label: "History", kind: "timeline" }],
  exportName: "ledger-mismatches",
  emptyText: "No mismatches. The ledger balances.",
};

const runs: PageConfig = {
  pageKey: "ledger",
  resource: "ledger-runs",
  readOnly: true,
  columns: [
    { key: "id", label: "Run" },
    { key: "ranAt", label: "Ran", format: "ago" },
    { key: "accountsChecked", label: "Accounts checked", format: "number" },
    { key: "mismatches", label: "Mismatches", format: "number" },
    { key: "durationMs", label: "Took (ms)", format: "number" },
    { key: "status", label: "Result", format: "status" },
  ],
  primary: { label: "Export runs", kind: "export" },
  exportName: "reconciliation-runs",
  emptyText: "No runs yet.",
};

function LedgerReconciliation() {
  return (
    <>
      <ResourcePage config={mismatches} />
      <Card title="Past runs">
        <ResourcePage config={runs} />
      </Card>
    </>
  );
}

export const page: AdminPage = { key: "ledger", label: "Ledger & Reconciliation", group: "Traders & trading", component: LedgerReconciliation };
