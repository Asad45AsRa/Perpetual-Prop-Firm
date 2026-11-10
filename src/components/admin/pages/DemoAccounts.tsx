"use client";

import { useAdminNavigate, useAdminQuery } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { canView } from "../permissions";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Btn, Card, formatMoney, Pill } from "../ui";
import type { AdminPage, SettingsData } from "../types";

// Free demo accounts. They are kept in their own list and are NEVER counted in revenue, payouts,
// the leaderboard or reports. The rules (on / off, balance, target, restart limit) are edited on
// Platform Settings > Demo account; this page shows them and lets staff manage the accounts themselves.
// List: GET /admin/demo-accounts   Actions: POST /admin/demo-accounts/:id/<restart|close>
const config: PageConfig = {
  pageKey: "demo",
  resource: "demo-accounts",
  readOnly: true,
  columns: [
    { key: "id", label: "Demo account" },
    { key: "traderName", label: "Trader" },
    { key: "balance", label: "Balance", format: "money" },
    { key: "equity", label: "Equity", format: "money" },
    { key: "pnl", label: "P&L", format: "pnl" },
    { key: "targetProgress", label: "Target", format: "progress" },
    { key: "restarts", label: "Restarts", format: "number" },
    { key: "status", label: "Status", format: "status" },
    { key: "createdAt", label: "Created", format: "ago" },
    { key: "lastRestartAt", label: "Last restart", format: "ago", hidden: true },
  ],
  primary: { label: "Export demo accounts", kind: "export" },
  filters: [{ key: "status", label: "Status" }],
  dateKey: "createdAt",
  actions: [
    { label: "Restart", action: "restart", confirm: "Reset this demo account to its starting balance?", success: "Demo account restarted.", show: (r) => r.status === "active" },
    { label: "Close", action: "close", reason: true, tone: "danger", success: "Demo account closed.", show: (r) => r.status === "active" },
  ],
  detailTitle: (r) => `${r.id} · ${r.traderName}`,
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  exportName: "demo-accounts",
  emptyText: "No demo accounts yet.",
};

// The current demo rules, read from Platform Settings
function DemoRules() {
  const go = useAdminNavigate();
  const user = useAdminSession((s) => s.user);
  const allowed = canView(user, "settings");
  const { data } = useAdminQuery<SettingsData>("settings", "/admin/settings", { enabled: allowed });
  const d = data?.sections.demo;

  return (
    <Card title="Demo rules" action={allowed ? <Btn onClick={() => go("settings")}>Edit in Platform Settings</Btn> : undefined}>
      {!allowed ? (
        <p className="text-[14px] text-white/50">The demo rules are edited in Platform Settings. Ask someone with access to change them.</p>
      ) : !d ? (
        <p className="text-[14px] text-white/40">Loading…</p>
      ) : (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[14px] text-white/60">
          <span>Free demo: <Pill tone={d.enabled === "on" ? "green" : "red"}>{String(d.enabled)}</Pill></span>
          <span>Balance: <b className="font-normal text-white">{formatMoney(Number(d.balance))}</b></span>
          <span>Profit target: <b className="font-normal text-white">{Number(d.profitTarget)}%</b></span>
          <span>Restarts per month: <b className="font-normal text-white">{Number(d.restartLimit) === 0 ? "unlimited" : Number(d.restartLimit)}</b></span>
          <span>Active demos per trader: <b className="font-normal text-white">{Number(d.maxActiveDemos)}</b></span>
        </div>
      )}
      <p className="mt-3 text-[13px] text-white/40">Demo profits are not payable, and demo accounts never appear in revenue figures, reports or the leaderboard.</p>
    </Card>
  );
}

function DemoAccounts() {
  return (
    <>
      <DemoRules />
      <ResourcePage config={config} />
    </>
  );
}

export const page: AdminPage = { key: "demo", label: "Demo Accounts", group: "Traders & trading", component: DemoAccounts };
