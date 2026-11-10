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
// The first four numbers are money owed to traders. `onChain` and `publicStats` prove the reserve and
// explain the figures the trader sees on the Payouts page. Both are optional so an older backend still works.
export type ReservesData = {
  pending: number;
  approvedUnpaid: number;
  paid: number;
  rejected: number;
  onChain?: {
    walletAddress: string;
    network: string;
    balance: number; // live balance read from the chain
    proofUrl: string; // block explorer page traders can open to verify the reserve
    lastCheckedAt: string;
    coverage: number; // balance divided by (pending + approved-unpaid); 1 or more means fully covered
  };
  publicStats?: {
    payoutReserve: number; // the number traders see as "Payout Reserve"
    totalPayoutsIssued: number; // the number traders see as "Total Payouts Issued"
    avgPayoutSeconds: number; // the number traders see as "Avg. Payout Time"
    reserveSource: "live on-chain" | "manual"; // where payoutReserve comes from
    sources: { label: string; value: string; formula: string }[]; // how each public number is calculated
  };
};

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

// GET /admin/accounts/:id/analytics
// The same numbers the trader sees on the Accounts page, so support and the trader always read the same figures.
export type AccountAnalyticsData = {
  stagePath: { challengeRequired: boolean; steps: { label: string; state: "done" | "current" | "locked" | "skipped" }[] };
  summary: { equity: number; realized: number; hitRate: number; profitFactor: number; grossResult: number; fees: number; funding: number; netResult: number };
  winLoss: { winners: number; losers: number; breakEven: number; avgWinner: number; avgLoser: number; bestTrade: number; worstTrade: number; expectancy: number };
  pace: { volume: number; closedTrades: number; openNow: number; activeDays: number; avgHoldMinutes: number; deepestPullbackPct: number };
  holding: { averageMinutes: number; measured: number; buckets: { label: string; count: number; pct: number }[] };
  sides: { long: SideStats; short: SideStats };
  calendar: { month: string; days: { date: string; pnl: number | null }[] }; // pnl is null on days without a closed trade
  marketMix: { market: string; closedTrades: number; volume: number; winRate: number; costs: number; netPnl: number }[];
};
export type SideStats = { closed: number; pnl: number; hitRate: number; avgPerTrade: number };

// GET /admin/accounts/:id/breach
// Everything needed to explain why the engine failed or locked an account.
export type BreachData = {
  accountStatus: string;
  rulesSnapshot: string;
  events: {
    id: string;
    rule: string;
    threshold: string;
    valueAtBreach: string;
    equitySnapshot: number;
    action: string;
    status: string;
    source: string;
    detectedAt: string;
    price: { market: string; fill: number; bid: number; ask: number; mark: number; at: string } | null; // price proof at the moment of the breach
  }[];
};

// GET /admin/trader-view/:traderId (read-only copy of what the trader's own dashboard shows)
export type TraderViewData = {
  profile: { id: string; name: string; username: string; avatar: string; joinedAt: string; status: string; kyc: string; rank: number | null; topPercent: number | null; lifetimePayouts: number };
  subAccounts: { id: string; plan: string; stage: string; status: string; allocation: number; equity: number; dailyDrawdownPct: number; maxDrawdownPct: number; profitTargetPct: number }[];
  lifetime: { realizedPnl: number; totalRoiPct: number; totalPayouts: number; volume: number; tradingDays: number; winRatePct: number; avgProfitPerDay: number; avgHoldMinutes: number };
  payouts: { withdrawable: number; subAccountProfit: number; history: { id: string; date: string; account: string; amount: number; split: number; afterSplit: number; network: string; status: string }[] };
  purchases: { id: string; date: string; plan: string; amount: number; method: string; status: string }[];
};

// GET /admin/settings-impact?section=<name>  (what a settings change touches, shown before saving)
export type SettingsImpactData = { items: CheckItem[] };
