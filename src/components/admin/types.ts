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
  liveTrader: { name: string; accountId: string; equity: number; pnl: number } | null;
  recentPayouts: Payout[];
  recentActivity: TradeActivity[];
  recentTickets: SupportTicket[];
};

export type StaffMember = { id: string; name: string; email: string; role: AdminRole };

// Every list endpoint answers with { items: [...] }
export type ListResponse<T> = { items: T[] };
