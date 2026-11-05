import type { ComponentType } from "react";
import type { AdminRole } from "./Adminauth";

// A sidebar page. Every file in ./pages exports one of these as `page`.
export type AdminPage = {
  label: string; // text shown in the sidebar and as the page title
  group: string; // sidebar section (must exist in GROUPS in pages/index.ts)
  roles: AdminRole[]; // which roles can see and open the page
  component: ComponentType;
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
  };
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

export type StaffMember = { id: string; name: string; email: string; role: AdminRole; status?: string };

// Every list endpoint answers with { items: [...] }
export type ListResponse<T> = { items: T[] };

// GET /admin/operations
export type OperationsData = {
  kpis: { challengeAccounts: number; fundedAccounts: number; openRiskEvents: number; openTickets: number };
  plans: { id: string; name: string; capital: number; profitTarget: number; dailyLoss: number; maxLoss: number }[];
};

// GET /admin/reserves
export type ReservesData = { pending: number; approvedUnpaid: number; paid: number; rejected: number };

// GET /admin/settings
export type SettingsData = {
  riskRules: { dailyLoss: number; maxLoss: number; profitTarget: number; profitSplit: number };
  platform: { name: string; markets: string; payoutNetwork: string; mode: string };
};

// GET /admin/health  (items) and POST /admin/health/check
export type HealthItem = { id: string; service: string; status: string; latencyMs: number; checkedAt: string };
