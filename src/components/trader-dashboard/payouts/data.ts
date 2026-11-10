/**
 * Mock data for the trader "Payouts" page (Figma frame 1603:394).
 * TODO(backend): balances, wallet and history from the trader payouts API.
 */

export const payoutOverview = [
  { label: "Payout Reserve", value: "$462,855", note: "On-chain and verifiable payout reserve", icon: "reserve" },
  { label: "Total Payouts Issued", value: "$2,523,578", note: "All time", icon: "issued" },
  { label: "Avg. Payout Time", value: "8.3s", note: "All time", icon: "time" },
] as const;

export const traderBalances = {
  withdrawable: 2180,
  subAccountProfit: 3240,
};

/** Saved payout wallet (USDC on BNB Smart Chain). */
export const savedWallet = "0x1234567890abcdef1234567890abcdef12345678";

export type TraderPayoutStatus = "Paid" | "Pending";
export type TraderPayout = {
  id: string;
  date: string;
  plan: string;
  amount: number;
  split: number;
  method: string;
  status: TraderPayoutStatus;
};

/** 17 rows (Figma "of 17"), newest first. */
export const traderPayoutHistory: TraderPayout[] = Array.from({ length: 17 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9 - Math.floor(i / 2), i % 2 ? 1 : 15));
  const plans = ["Account #PE-2 · $50K · Breeze", "Account #PE-1 · $100K · Elite"];
  return {
    id: `tp-${i}`,
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    plan: plans[i % 2],
    amount: [12_000, 8_400, 5_250, 9_600][i % 4],
    split: 80,
    method: "USDC",
    status: "Paid",
  };
});

export const PAYOUT_FILTERS = ["All", "Paid", "Pending"] as const;
export type TraderPayoutFilter = (typeof PAYOUT_FILTERS)[number];
