/**
 * Mock data for the affiliate Overview screen — values copied from Figma.
 * TODO(backend): replace with API responses (TanStack Query) once the affiliate API exists.
 */

export const DASH_ASSETS = "/images/affiliate-dashboard";
export const AFFILIATE_BASE = "/affiliates/dashboard";

export const currentUser = {
  name: "Hafiz",
  avatar: `${DASH_ASSETS}/avatars/hafiz.png`,
  unreadNotifications: 4,
};

export type StatCardData = {
  label: string;
  value: string;
  icon: string;
  iconSize: number;
  /** Green pill under the value (e.g. "+14 this month"). */
  delta?: string;
  /** Plain caption under the value when there is no pill. */
  caption?: string;
  sparkline?: string;
  /** Gold gradient "highlight" card (Pending Payout). */
  highlight?: boolean;
};

export const stats: StatCardData[] = [
  {
    label: "Total Referrals",
    value: "128",
    icon: `${DASH_ASSETS}/icons/stat-referrals.svg`,
    iconSize: 22,
    delta: "+14 this month",
    sparkline: `${DASH_ASSETS}/sparkline-referrals.svg`,
  },
  {
    label: "Total Commissions",
    value: "$4,820",
    icon: `${DASH_ASSETS}/icons/stat-commissions.svg`,
    iconSize: 21,
    delta: "+$612 this month",
    sparkline: `${DASH_ASSETS}/sparkline-commissions.svg`,
  },
  {
    label: "Pending Payout",
    value: "$930",
    icon: `${DASH_ASSETS}/icons/stat-payout.svg`,
    iconSize: 21,
    caption: "Paid everyday",
    highlight: true,
  },
  {
    label: "Conversion Rate",
    value: "7.4%",
    icon: `${DASH_ASSETS}/icons/stat-conversion.svg`,
    iconSize: 21,
    caption: "Clicks to signups",
  },
];

export const levelProgress = {
  referrals: 128,
  target: 250,
  /** Fill of the whole track (0–1). Figma: 350px of a 1032px track. */
  progress: 350 / 1032,
  milestones: [
    { label: "50", image: `${DASH_ASSETS}/level-axis.png`, w: 27, h: 25 },
    { label: "250", image: `${DASH_ASSETS}/level-onyx.png`, w: 17, h: 30 },
    { label: "251+", image: `${DASH_ASSETS}/level-apex.png`, w: 22, h: 30 },
  ],
};

export const currentLevel = {
  name: "Level 1",
  range: "0–50 Referrals",
  tier: "AXIS",
  /** Figma: 138px of a 188px track. */
  progress: 138 / 188,
  terms: "Commission 15% · Recurring 10%",
};

export const earningsSummary = [
  { label: "Total Referrals", value: "128" },
  { label: "Daily average", value: "$20.37" },
  { label: "Best day", value: "$27", sub: "Oct 28" },
  { label: "vs previous", value: "+14.6%", sub: "same length period", positive: true },
];

export const EARNING_RANGES = ["All", "7d", "30d", "90d"] as const;
export type EarningRange = (typeof EARNING_RANGES)[number];

/** Daily series for Sep 30 – Oct 28, sampled from the Figma chart lines. */
const earnings = [19.3, 20.7, 22.4, 18.5, 19.7, 21.2, 18.2, 21.0, 29.7, 30.1, 31.8, 32.5, 35.8, 33.1, 30.6, 27.1, 25.1, 31.1, 29.7, 30.4, 27.9, 22.5, 26.5, 27.4, 29.7, 30.4, 29.5, 24.5, 30.2];
const recurring = [11.0, 11.5, 12.2, 10.7, 11.1, 11.7, 10.5, 11.7, 15.1, 15.2, 15.9, 16.2, 17.4, 16.4, 15.4, 14.1, 13.4, 15.4, 15.1, 15.4, 14.4, 12.4, 13.8, 14.2, 15.1, 15.3, 15.0, 13.3, 15.3];
const signups = [11, 8, 7, 8, 11, 8, 8, 11, 8, 6, 11, 11, 8, 11, 4, 11, 4, 8, 5, 8, 5, 8, 8, 8, 8, 5, 8, 11, 11];

export type EarningsPoint = { date: string; earnings: number; recurring: number; signups: number };

export const earningsSeries: EarningsPoint[] = earnings.map((e, i) => ({
  date: i === 0 ? "Sep 30" : `Oct ${i}`,
  earnings: e,
  recurring: recurring[i],
  signups: signups[i],
}));

export type Trader = { rank: number; name: string; avatar: string; earning: string };

const av = (n: string) => `${DASH_ASSETS}/avatars/${n}.png`;

export const leaderboard = {
  period: "Oct 25 – Nov 9, 2026",
  podium: [
    { place: 2, name: "sigma_", avatar: av("sigma"), earning: "$48,210" },
    { place: 1, name: "kairo88", avatar: av("kairo"), earning: "$51,930" },
    { place: 3, name: "delta_t", avatar: av("delta"), earning: "$44,075" },
  ],
  rows: [
    { rank: 4, name: "kairo88", avatar: av("kairo"), earning: "$10,737" },
    { rank: 5, name: "zen21", avatar: av("zen"), earning: "$8,989" },
    { rank: 6, name: "orbithq", avatar: av("orbit"), earning: "$7,345" },
    { rank: 7, name: "delta_t", avatar: av("delta"), earning: "$7,112" },
    { rank: 8, name: "sigma_pro", avatar: av("sigma"), earning: "$6,888" },
    { rank: 9, name: "sigma_pro", avatar: av("sigma"), earning: "$6,888" },
  ] satisfies Trader[],
  you: { rank: 151, name: "sigma_pro", avatar: av("sigma"), earning: "$2200" } satisfies Trader,
};

export type Referral = { user: string; date: string; status: "Active" | "Pending"; commission: string };

export const recentReferrals: Referral[] = Array.from({ length: 4 }, () => ({
  user: "trader_0142",
  date: "Oct 28",
  status: "Active",
  commission: "$48",
}));
