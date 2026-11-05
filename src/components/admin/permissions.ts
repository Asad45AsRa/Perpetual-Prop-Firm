import type { AdminRole } from "./Adminauth";

export const ALL: AdminRole[] = ["admin", "moderator"];
export const ADMIN: AdminRole[] = ["admin"];

// Action-level rights. To add a new right, add one line here.
// The UI only hides things; the backend must enforce the same rules on every endpoint.
export const PERMISSIONS: Record<string, { label: string; roles: AdminRole[] }> = {
  "traders.view":    { label: "View traders & accounts",   roles: ALL },
  "traders.suspend": { label: "Suspend / unsuspend trader", roles: ALL },
  "risk.review":     { label: "Review risk breaches",       roles: ALL },
  "tickets.reply":   { label: "Reply to support tickets",   roles: ALL },
  "finance.view":    { label: "View revenue & payments",    roles: ADMIN },
  "payout.approve":  { label: "Approve / reject payouts",   roles: ADMIN },
  "staff.manage":    { label: "Manage staff & roles",       roles: ADMIN },
  "settings.edit":   { label: "Edit platform settings",     roles: ADMIN },
};

export const can = (role: AdminRole | undefined, perm: string) =>
  !!role && !!PERMISSIONS[perm]?.roles.includes(role);
