/**
 * Mock data for the trader dashboard ("Home") — values copied from Figma.
 * TODO(backend): replace with the trader accounts / stats API.
 */
import { DASH_ASSETS } from "@/components/affiliate-dashboard/data";

export const TRADER_BASE = "/dashboard";

export const TRADER_PAGE_HEADERS: Record<string, { title: string; subtitle: string }> = {
  [TRADER_BASE]: { title: "Home", subtitle: "Your Perpeye performance, accounts and stats at a glance." },
  [`${TRADER_BASE}/leaderboard`]: { title: "Top Performers", subtitle: "See top traders and track your ranking." },
  [`${TRADER_BASE}/challenges`]: { title: "Challenges", subtitle: "Choose your preferred Perpeye challenge and start trading." },
  [`${TRADER_BASE}/accounts`]: { title: "Account Dashboard", subtitle: "Track and analyse your trading performance on a single account." },
};

const av = (n: string) => `${DASH_ASSETS}/avatars/${n}.png`;

export const trader = {
  name: "Hafiz",
  avatar: av("hafiz"),
  joined: "Joined Oct 2026",
  tagline: "Perpeye Trader · Top 12%",
  rank: 179,
  lifetimePayouts: 149,
};

/* ---------- Sub accounts ---------- */

export type AccountStage = "Challenge Phase" | "Funded Stage" | "Breached";
export type Gauge = { label: string; value: number };
export type SubAccount = {
  id: string;
  name: string;
  size: string;
  details: string;
  /** Small status chip next to the account switcher (Figma "Passed"). */
  status: "Active" | "Passed" | "Breached";
  stage: AccountStage;
  active: boolean;
  gauges: Gauge[];
};

export const accountTotals = [
  { label: "Allocation", value: "$102,318", icon: "allocation" },
  { label: "Funded", value: "$132,618", icon: "funded" },
  { label: "Daily PnL", value: "$302.22", icon: "daily" },
  { label: "Max Funding", value: "$1,500", icon: "max" },
] as const;

export const subAccounts: SubAccount[] = [
  {
    id: "PE-2",
    name: "Account #PE-2",
    size: "$50K",
    details: "$50K · Breeze · 80/20",
    status: "Active",
    stage: "Challenge Phase",
    active: true,
    gauges: [
      { label: "Daily DD", value: 0 },
      { label: "Max DD", value: 0 },
      { label: "Profit Target", value: 28 },
    ],
  },
  {
    id: "PE-1",
    name: "Account #PE-1",
    size: "$100K",
    details: "$100K · Elite · 80/20",
    status: "Passed",
    stage: "Funded Stage",
    active: true,
    gauges: [
      { label: "Daily DD", value: 0 },
      { label: "Max DD", value: 0 },
    ],
  },
  {
    id: "PE-0",
    name: "Account #PE-0",
    size: "$25K",
    details: "$25K · Breeze · 80/20",
    status: "Breached",
    stage: "Breached",
    active: false,
    gauges: [
      { label: "Daily DD", value: 100 },
      { label: "Max DD", value: 64 },
    ],
  },
];

export const ACCOUNT_OPTIONS = [
  { value: "all", label: "All" },
  ...subAccounts.filter((a) => a.active).map((a) => ({ value: a.id, label: a.name.replace("Account ", "") })),
];

/* ---------- Cumulative PnL ---------- */

export type PnlDay = { date: string; label: string; pnl: number; trades: number };

/** Deterministic pseudo-random daily PnL, Oct 1 → Nov 4 (35 days), so SSR and client match. */
function series(seed: number, scale: number): PnlDay[] {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 9, 1 + i));
    const flat = d.getUTCDay() === 0 || d.getUTCDay() === 6; // weekends: no trading
    const pnl = flat ? 0 : Math.round((rnd() * 520 - 150) * scale * 100) / 100;
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }),
      pnl,
      trades: flat ? 0 : 1 + Math.floor(rnd() * 5),
    };
  });
}

const pe2 = series(7, 0.45);
const pe1 = series(19, 0.85);

export const pnlByAccount: Record<string, PnlDay[]> = {
  "PE-2": pe2,
  "PE-1": pe1,
  all: pe2.map((d, i) => ({
    ...d,
    pnl: Math.round((d.pnl + pe1[i].pnl) * 100) / 100,
    trades: d.trades + pe1[i].trades,
  })),
};

export const PNL_RANGES = ["All", "7d", "30d"] as const;
export type PnlRange = (typeof PNL_RANGES)[number];

/* ---------- Lifetime stats ---------- */

export type LifetimeStat = { label: string; value: string; tone?: "green" | "red"; highlight?: boolean };

export const lifetimeStats: Record<PnlRange, LifetimeStat[]> = {
  All: [
    { label: "Realized PnL", value: "+$476", tone: "green" },
    { label: "Total ROI", value: "+4.16%", tone: "green" },
    { label: "Total Payouts", value: "$3,240" },
    { label: "Volume", value: "$2.4M" },
    { label: "Trading Days", value: "14" },
    { label: "Win Rate", value: "58%", highlight: true },
    { label: "Avg Profit / Day", value: "+$298", tone: "green" },
    { label: "Avg Hold Time", value: "1h 21m" },
  ],
  "30d": [
    { label: "Realized PnL", value: "+$412", tone: "green" },
    { label: "Total ROI", value: "+3.61%", tone: "green" },
    { label: "Total Payouts", value: "$1,200" },
    { label: "Volume", value: "$1.9M" },
    { label: "Trading Days", value: "12" },
    { label: "Win Rate", value: "61%", highlight: true },
    { label: "Avg Profit / Day", value: "+$276", tone: "green" },
    { label: "Avg Hold Time", value: "1h 14m" },
  ],
  "7d": [
    { label: "Realized PnL", value: "-$58", tone: "red" },
    { label: "Total ROI", value: "-0.42%", tone: "red" },
    { label: "Total Payouts", value: "$0" },
    { label: "Volume", value: "$310K" },
    { label: "Trading Days", value: "4" },
    { label: "Win Rate", value: "50%", highlight: true },
    { label: "Avg Profit / Day", value: "-$14", tone: "red" },
    { label: "Avg Hold Time", value: "58m" },
  ],
};

/* ---------- Leaderboard ---------- */

export type TraderRow = { rank: number; name: string; avatar: string; pnl: string; winRate: string; volume: string; trades: number };

export const traderLeaderboard = {
  period: "Oct 25 – Nov 9, 2026",
  podium: [
    { place: 2, name: "sigma_", avatar: av("sigma"), earning: "$48,210" },
    { place: 1, name: "kairo88", avatar: av("kairo"), earning: "$51,930" },
    { place: 3, name: "delta_t", avatar: av("delta"), earning: "$44,075" },
  ],
  rows: [
    { rank: 4, name: "kairo88", avatar: av("kairo"), pnl: "$29,930", winRate: "58.33%", volume: "$2.74M", trades: 8 },
    { rank: 5, name: "zen21", avatar: av("zen"), pnl: "$29,930", winRate: "58.33%", volume: "$2.74M", trades: 8 },
    { rank: 6, name: "orbithq", avatar: av("orbit"), pnl: "$29,930", winRate: "58.33%", volume: "$2.74M", trades: 8 },
    { rank: 7, name: "orbithq", avatar: av("orbit"), pnl: "$29,930", winRate: "58.33%", volume: "$2.74M", trades: 5 },
    { rank: 8, name: "orbithq", avatar: av("orbit"), pnl: "$29,930", winRate: "58.33%", volume: "$2.74M", trades: 3 },
    { rank: 9, name: "orbithq", avatar: av("orbit"), pnl: "$29,930", winRate: "58.33%", volume: "$2.74M", trades: 2 },
  ] satisfies TraderRow[],
  you: { rank: 179, name: "sigma_pro", avatar: av("sigma"), pnl: "$29,930", winRate: "58.33%", volume: "$2.74M", trades: 1 } satisfies TraderRow,
};
