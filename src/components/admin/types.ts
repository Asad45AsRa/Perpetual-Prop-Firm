import type { ComponentType } from "react";

// A sidebar page. Every file in ./pages exports one of these as `page`.
export type AdminPage = {
  key: string; // stable id used by access grants (never change it once staff have rights on it)
  label: string; // text shown in the sidebar and as the page title
  group: string; // sidebar section (must exist in GROUPS in pages/index.ts)
  component: ComponentType;
  superOnly?: boolean; // only the super admin can open it (cannot be granted)
};

export type Payout = {
  id: string;
  traderName: string;
  amount: number;
  status: string;
  requestedAt: string;
};

export type TradeActivity = {
  id: string;
  traderName: string;
  market: string;
  side: "long" | "short";
  pnl: number;
};

export type SupportTicket = { id: string; traderName: string; subject: string; status: string };

// GET /admin/overview
export type OverviewData = {
  stats: {
    traders: number;
    activeAccounts: number;
    pendingPayouts: number;
    challengeRevenue: number;
    openTickets: number;
    riskBreaches: number;
    pendingAffiliatePayouts: number;
    pendingKyc: number;
    failedWebhooks: number;
  };
  live: { onlineTraders: number; openPositions: number; exposure: number; payoutLiability: number };
  today: { revenue: number; refunds: number };
  funnel: { label: string; value: number }[];
  // Work that is waiting for a person. `breached` means it has waited longer than its target time.
  attention: { key: string; label: string; count: number; page: string; oldestAt?: string; slaMinutes?: number; breached: boolean }[];
  liveTrader: {
    name: string;
    accountId: string;
    equity: number;
    pnl: number;
    email?: string;
    plan?: string;
    stage?: string;
    openPositions?: number;
    payoutEligible?: number;
    lifetimePaid?: number;
    trading?: string;
  } | null;
  recentPayouts: Payout[];
  recentActivity: TradeActivity[];
  recentTickets: SupportTicket[];
};

// Every list endpoint answers with { items: [...] }. Large lists also send paging and filter values.
export type ListResponse<T> = {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  facets?: Record<string, string[]>; // distinct values per requested filter key
};

// GET /admin/operations
export type OperationsData = {
  kpis: { challengeAccounts: number; fundedAccounts: number; openRiskEvents: number; openTickets: number };
  plans: { id: string; name: string; capital: number; profitTarget: number; dailyLoss: number; maxLoss: number }[];
};

// GET /admin/reserves
export type ReservesData = { pending: number; approvedUnpaid: number; paid: number; rejected: number };

// GET /admin/settings
export type SettingValue = string | number;
export type SettingsChange = {
  id: string;
  version: number;
  section: string;
  changedBy: string;
  at: string;
  reason: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
};
export type SettingsData = {
  version: number; // bumps on every save; sent back as ifVersion to stop two admins overwriting each other
  sections: Record<string, Record<string, SettingValue>>;
  killSwitches: Record<string, boolean>;
  history: SettingsChange[];
};

// GET /admin/health  (items) and POST /admin/health/check
export type HealthItem = { id: string; service: string; status: string; latencyMs: number; checkedAt: string; detail?: string };

// GET /admin/notifications
export type NotificationItem = {
  id: string;
  level: "critical" | "warning" | "info";
  title: string;
  detail: string;
  page: string; // sidebar label to open
  at: string;
};

// GET /admin/accounts/:id/equity
export type EquityData = {
  points: { time: number; equity: number; balance: number }[];
  start: number;
  dailyLossFloor: number;
  maxLossFloor: number;
  highWater: number;
};

// GET /admin/payouts/:id/checks
export type CheckItem = { label: string; ok: boolean; detail: string };

// GET /admin/reports
export type ReportsData = {
  revenueByDay: { day: string; revenue: number; refunds: number }[];
  totals: { revenue: number; refunds: number; payouts: number; affiliateCost: number; passRate: number };
  breachReasons: { reason: string; count: number }[];
  funnel: { label: string; value: number }[];
};
