import type { AdminUser } from "../Adminauth";
import { canView, isSuperAdmin } from "../permissions";
import type { AdminPage } from "../types";
import { page as Overview } from "./Overview";
import { page as OperationsPerformance } from "./OperationsPerformance";
import { page as Reports } from "./Reports";
import { page as TraderManagement } from "./TraderManagement";
import { page as TradingAccounts } from "./TradingAccounts";
import { page as TradingActivity } from "./TradingActivity";
import { page as RiskManagement } from "./RiskManagement";
import { page as MarketManagement } from "./MarketManagement";
import { page as AccountIssuance } from "./AccountIssuance";
import { page as KycReview } from "./KycReview";
import { page as LedgerReconciliation } from "./LedgerReconciliation";
import { page as ChallengePlans } from "./ChallengePlans";
import { page as PaymentManagement } from "./PaymentManagement";
import { page as TraderPayouts } from "./TraderPayouts";
import { page as Approvals } from "./Approvals";
import { page as AffiliateManagement } from "./AffiliateManagement";
import { page as AffiliatePayouts } from "./AffiliatePayouts";
import { page as Coupons } from "./Coupons";
import { page as PayoutReserves } from "./PayoutReserves";
import { page as PublicPayoutFeed } from "./PublicPayoutFeed";
import { page as SupportTickets } from "./SupportTickets";
import { page as Announcements } from "./Announcements";
import { page as EmailManagement } from "./EmailManagement";
import { page as WebsiteCms } from "./WebsiteCms";
import { page as Competitions } from "./Competitions";
import { page as SystemHealth } from "./SystemHealth";
import { page as ErrorEvents } from "./ErrorEvents";
import { page as WebhookLogs } from "./WebhookLogs";
import { page as Jobs } from "./Jobs";
import { page as Alerts } from "./Alerts";
import { page as AuditLogs } from "./AuditLogs";
import { page as PlatformSettings } from "./PlatformSettings";
import { page as StaffPermissions } from "./StaffPermissions";
import { page as TraderView } from "./TraderView";
import { page as DemoAccounts } from "./DemoAccounts";
import { page as Leaderboard } from "./Leaderboard";
import { page as MetricDefinitions } from "./MetricDefinitions";

// Sidebar sections, in display order
export const GROUPS = ["Workspace", "Traders & trading", "Finance & sales", "Communication", "Platform control"];

// HOW TO ADD A SIDEBAR PAGE:
//   1. Create a file in this folder that exports `page` (copy Coupons.tsx). Give it a unique `key`.
//   2. Import it above and add it to this list.
// The sidebar, access filtering and the page title are all built from this list.
// The super admin then ticks the new page for each staff member on the Staff & Permissions page.
export const PAGES: AdminPage[] = [
  Overview,
  OperationsPerformance,
  Reports,
  TraderManagement,
  TradingAccounts,
  TradingActivity,
  RiskManagement,
  MarketManagement,
  AccountIssuance,
  KycReview,
  LedgerReconciliation,
  ChallengePlans,
  PaymentManagement,
  TraderPayouts,
  Approvals,
  AffiliateManagement,
  AffiliatePayouts,
  Coupons,
  PayoutReserves,
  PublicPayoutFeed,
  SupportTickets,
  Announcements,
  EmailManagement,
  WebsiteCms,
  Competitions,
  SystemHealth,
  ErrorEvents,
  WebhookLogs,
  Jobs,
  Alerts,
  AuditLogs,
  PlatformSettings,
  StaffPermissions,
  TraderView,
  DemoAccounts,
  Leaderboard,
  MetricDefinitions,
];

// Whether this person may open the page at all
export const canOpen = (user: AdminUser | null | undefined, page: AdminPage) =>
  page.superOnly ? isSuperAdmin(user) : canView(user, page.key);

// Sidebar data for one person: hides pages (and empty sections) they were not granted
export function navForUser(user: AdminUser) {
  return GROUPS.map((group) => ({
    group,
    items: PAGES.filter((p) => p.group === group && canOpen(user, p)),
  })).filter((g) => g.items.length > 0);
}
