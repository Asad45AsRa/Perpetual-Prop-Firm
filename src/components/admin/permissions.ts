import type { AdminUser } from "./Adminauth";

// ─────────────────────────────────────────────────────────────────────────────
// Access model
//   1. Section access: every sidebar page has a level per staff member: none / view / manage.
//      view   = can open the page and read it
//      manage = can also create, edit, delete and run the page's normal actions
//   2. Special rights: sensitive actions (approve a payout, flip a kill switch...) are separate
//      checkboxes, so "manage" on a page never silently allows moving money.
//   3. The super admin always has everything and cannot be changed or deleted.
// The UI only hides things; the backend must enforce the same rules on every endpoint.
// ─────────────────────────────────────────────────────────────────────────────

export type AccessLevel = "none" | "view" | "manage";
export const LEVELS: AccessLevel[] = ["none", "view", "manage"];

// Special rights the super admin can tick for a staff member. To add a right, add one line here.
export const RIGHTS: Record<string, { label: string; hint: string }> = {
  "finance.view": { label: "See revenue figures", hint: "Revenue cards on the overview and reports" },
  "traders.suspend": { label: "Suspend traders", hint: "Suspend, restore, archive and force sign-out" },
  "risk.review": { label: "Review risk events", hint: "Resolve and escalate risk events" },
  "tickets.reply": { label: "Reply to tickets", hint: "Answer and close support tickets" },
  "kyc.review": { label: "Review KYC cases", hint: "Approve or reject identity checks" },
  "payout.approve": { label: "Approve payouts", hint: "First approval, reject and mark paid" },
  "approvals.decide": { label: "Decide approvals", hint: "Second approver for large payouts, refunds and overrides" },
  "account.override": { label: "Override accounts", hint: "Pass, fail, lock or reset an account by hand" },
  "refund.issue": { label: "Request refunds", hint: "Start a refund (a second person must approve)" },
  "market.sync": { label: "Sync markets", hint: "Import market changes from Hyperliquid" },
  "settings.edit": { label: "Edit settings", hint: "Change risk, trading, payout and compliance rules" },
  "settings.kill_switch": { label: "Use kill switches", hint: "Pause trading, purchases or payouts" },
  "audit.export": { label: "Export audit logs", hint: "Download the full audit trail" },
};

export const RIGHT_KEYS = Object.keys(RIGHTS);

export const isSuperAdmin = (user?: AdminUser | null) => user?.role === "super_admin";

export function levelOf(user: AdminUser | null | undefined, pageKey: string): AccessLevel {
  if (!user) return "none";
  if (isSuperAdmin(user)) return "manage";
  return user.grants[pageKey] ?? "none";
}

export const canView = (user: AdminUser | null | undefined, pageKey: string) => levelOf(user, pageKey) !== "none";
export const canManage = (user: AdminUser | null | undefined, pageKey: string) => levelOf(user, pageKey) === "manage";

export function can(user: AdminUser | null | undefined, right: string): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || user.rights.includes(right);
}
