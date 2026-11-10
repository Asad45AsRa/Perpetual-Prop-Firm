"use client";

import { ResourcePage, type PageConfig } from "../ResourcePage";
import { TraderDevices } from "../TraderDevices";
import type { AdminPage } from "../types";

// Traders sign themselves up, so nobody is created or deleted here. Staff can suspend, archive,
// flag and sign traders out. Every action asks for a reason and is written to the audit log.
// List: GET /admin/traders   Actions: POST /admin/traders/:id/<suspend|unsuspend|archive|force-logout|reset-2fa|flag|unflag|reset-username|reset-avatar>
// Username and avatar are shown on the leaderboard and in the trader's profile, so staff can reset them when they break the rules.
const config: PageConfig = {
  pageKey: "traders",
  resource: "traders",
  readOnly: true,
  columns: [
    { key: "name", label: "Trader" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "country", label: "Country" },
    { key: "accounts", label: "Accounts", format: "number" },
    { key: "status", label: "Status", format: "status" },
    { key: "kyc", label: "KYC", format: "status" },
    { key: "riskScore", label: "Risk score", format: "number" },
    { key: "flags", label: "Flags" },
    { key: "lastLoginAt", label: "Last login", format: "ago" },
    { key: "avatar", label: "Avatar", hidden: true },
    { key: "emailVerified", label: "Email verified", format: "bool", hidden: true },
    { key: "lastIp", label: "Last IP", hidden: true },
    { key: "referralSource", label: "Referral source", hidden: true },
    { key: "joinedAt", label: "Joined", format: "date", hidden: true },
  ],
  primary: { label: "Export traders", kind: "export" },
  filters: [{ key: "status", label: "Status" }, { key: "kyc", label: "KYC" }, { key: "country", label: "Country" }],
  views: [
    { label: "Needs KYC", filters: { kyc: "pending" } },
    { label: "Suspended", filters: { status: "suspended" } },
  ],
  dateKey: "joinedAt",
  actions: [
    { label: "Suspend", action: "suspend", reason: true, tone: "danger", permission: "traders.suspend", success: "Trader suspended.", show: (r) => r.status === "active" },
    { label: "Restore", action: "unsuspend", tone: "success", permission: "traders.suspend", success: "Trader restored.", show: (r) => r.status === "suspended" },
    { label: "Flag", action: "flag", reason: true, permission: "traders.suspend", success: "Trader flagged.", show: (r) => !r.flags },
    { label: "Clear flag", action: "unflag", permission: "traders.suspend", success: "Flag cleared.", show: (r) => !!r.flags },
    { label: "Sign out everywhere", action: "force-logout", confirm: "Sign this trader out of every device?", permission: "traders.suspend", success: "Trader signed out.", show: (r) => r.status !== "archived" },
    { label: "Reset username", action: "reset-username", reason: true, permission: "traders.suspend", success: "Username reset. The trader will pick a new one.", show: (r) => r.status !== "archived" },
    { label: "Reset avatar", action: "reset-avatar", reason: true, permission: "traders.suspend", success: "Avatar reset to the default.", show: (r) => r.status !== "archived" },
    { label: "Reset 2FA", action: "reset-2fa", confirm: "Reset two-factor authentication for this trader?", permission: "traders.suspend", success: "2FA reset.", show: (r) => r.status !== "archived" },
    { label: "Archive", action: "archive", reason: true, tone: "danger", permission: "traders.suspend", success: "Trader archived.", show: (r) => r.status !== "archived" },
  ],
  bulkActions: [{ label: "Flag selected", action: "flag", reason: true, permission: "traders.suspend", success: "Traders flagged." }],
  detailTitle: (r) => String(r.name),
  detail: [
    { label: "Overview", kind: "fields" },
    {
      label: "Accounts", kind: "list", resource: "accounts",
      path: (r) => `/admin/accounts?traderId=${encodeURIComponent(String(r.id))}&pageSize=50`,
      columns: [{ key: "id", label: "Account" }, { key: "plan", label: "Plan" }, { key: "stage", label: "Stage" }, { key: "equity", label: "Equity", format: "money" }, { key: "status", label: "Status", format: "status" }],
    },
    {
      label: "Payments", kind: "list", resource: "payments",
      path: (r) => `/admin/payments?traderName=${encodeURIComponent(String(r.name))}&pageSize=50`,
      columns: [{ key: "id", label: "Payment" }, { key: "plan", label: "Plan" }, { key: "amount", label: "Amount", format: "money" }, { key: "status", label: "Status", format: "status" }],
    },
    {
      label: "Payouts", kind: "list", resource: "payouts",
      path: (r) => `/admin/payouts?traderName=${encodeURIComponent(String(r.name))}&pageSize=50`,
      columns: [{ key: "id", label: "Payout" }, { key: "amount", label: "Amount", format: "money" }, { key: "status", label: "Status", format: "status" }, { key: "requestedAt", label: "Requested", format: "ago" }],
    },
    { label: "Devices", kind: "custom", render: (r) => <TraderDevices key={String(r.id)} trader={r} /> },
    { label: "Notes", kind: "notes" },
    { label: "History", kind: "timeline" },
  ],
  exportName: "traders",
  emptyText: "No traders yet.",
};

function TraderManagement() {
  return <ResourcePage config={config} />;
}

export const page: AdminPage = { key: "traders", label: "Trader Management", group: "Traders & trading", component: TraderManagement };
