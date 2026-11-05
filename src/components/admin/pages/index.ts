import type { AdminRole } from "../Adminauth";
import type { AdminPage } from "../types";
import { page as Overview } from "./Overview";
import { page as OperationsPerformance } from "./OperationsPerformance";
import { page as TraderManagement } from "./TraderManagement";
import { page as TradingAccounts } from "./TradingAccounts";
import { page as TradingActivity } from "./TradingActivity";
import { page as RiskManagement } from "./RiskManagement";
import { page as MarketManagement } from "./MarketManagement";
import { page as AccountIssuance } from "./AccountIssuance";
import { page as ChallengePlans } from "./ChallengePlans";
import { page as PaymentManagement } from "./PaymentManagement";
import { page as TraderPayouts } from "./TraderPayouts";
import { page as AffiliateManagement } from "./AffiliateManagement";
import { page as AffiliatePayouts } from "./AffiliatePayouts";
import { page as Coupons } from "./Coupons";
import { page as PayoutReserves } from "./PayoutReserves";
import { page as SupportTickets } from "./SupportTickets";
import { page as Announcements } from "./Announcements";
import { page as EmailManagement } from "./EmailManagement";
import { page as WebsiteCms } from "./WebsiteCms";
import { page as Competitions } from "./Competitions";
import { page as SystemHealth } from "./SystemHealth";
import { page as AuditLogs } from "./AuditLogs";
import { page as StaffPermissions } from "./StaffPermissions";
import { page as PlatformSettings } from "./PlatformSettings";

// Sidebar sections, in display order
export const GROUPS = ["Workspace", "Traders & trading", "Finance & sales", "Communication", "Platform control"];

// HOW TO ADD A SIDEBAR PAGE:
//   1. Create a file in this folder that exports `page` (copy Coupons.tsx).
//   2. Import it above and add it to this list.
// The sidebar, role filtering and the page title are all built from this list.
export const PAGES: AdminPage[] = [
  Overview,
  OperationsPerformance,
  TraderManagement,
  TradingAccounts,
  TradingActivity,
  RiskManagement,
  MarketManagement,
  AccountIssuance,
  ChallengePlans,
  PaymentManagement,
  TraderPayouts,
  AffiliateManagement,
  AffiliatePayouts,
  Coupons,
  PayoutReserves,
  SupportTickets,
  Announcements,
  EmailManagement,
  WebsiteCms,
  Competitions,
  SystemHealth,
  AuditLogs,
  StaffPermissions,
  PlatformSettings,
];

// Sidebar data for one role: hides pages (and empty sections) the role cannot open
export function navForRole(role: AdminRole) {
  return GROUPS.map((group) => ({
    group,
    items: PAGES.filter((p) => p.group === group && p.roles.includes(role)),
  })).filter((g) => g.items.length > 0);
}
