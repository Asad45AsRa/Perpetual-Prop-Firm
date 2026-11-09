/**
 * Mock data for the single-account "Account Dashboard" (Figma "Accounts" frames 1603:1348 / 1669:2356 / 1669:3245).
 * TODO(backend): load per account from the trading API; every account currently shows these numbers.
 */

export const ACCOUNT_TABS = ["Equity & Live Positions", "Stats & Discipline", "Trade Log"] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

export const PHASES = ["Challenge Phase", "Funded Stage", "Payout Request"] as const;

/* ---------- Equity & Live Positions ---------- */

export const equityStats = [
  { label: "Equity", value: "$103,049.35", sub: "Includes realized PnL" },
  { label: "Realized Result", value: "+$1,178.55", sub: "5 closed trades" },
  { label: "Hit Rate", value: "60.0%", sub: "3 won · 2 lost" },
  { label: "Profit Factor", value: "5.00", sub: "After fees & funding" },
];

export const BALANCE_RANGES = ["All", "1d", "7d", "30d"] as const;
export type BalanceRange = (typeof BALANCE_RANGES)[number];

/** Daily realized balance (USD), Oct 1 → Oct 30. */
export const realizedBalance = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9, 1 + i));
  const drift = [0, 0, 0, 0, 210.5, -160, 0, 330, 412.8, 0, 0, 0, -210, 0, 320, 0, 0, 0, 280, 0, -150, 0, 0, 0, 0, 0, 190, 0, 0, 120][i];
  return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), drift };
}).reduce<{ date: string; balance: number }[]>((acc, d) => {
  const prev = acc.length ? acc[acc.length - 1].balance : 100_000;
  acc.push({ date: d.date, balance: Math.round((prev + d.drift) * 100) / 100 });
  return acc;
}, []);

export const riskRules = {
  startOfDayBalance: 102_316,
  daily: { pct: 0, today: "+$462.72 today", left: "$3,069 left" },
  max: { pct: 0, total: "$0.00 total", left: "$6,000 left" },
  target: { pct: 28, reached: "+$2,779 reached", toGo: "$7,221 to go" },
};

export type Market = "BTC" | "ETH" | "SOL" | "BNB";

export type Position = {
  id: string;
  market: Market;
  leverage: number;
  side: "Long" | "Short";
  size: number;
  entry: number;
  mark: number;
  pnl: number;
  roe: number;
  opened: string;
};

export const livePositions: Position[] = [
  { id: "pos-1", market: "BTC", leverage: 10, side: "Long", size: 0.35, entry: 66_980, mark: 67_832.14, pnl: 273.97, roe: 12.21, opened: "2h 26m" },
  { id: "pos-2", market: "BTC", leverage: 10, side: "Short", size: 0.35, entry: 66_980, mark: 67_832.14, pnl: 273.97, roe: 12.21, opened: "2h 26m" },
];
export const unrealized = 560.54;

/** Day PnL for the calendar, keyed by ISO date (October 2026). Days without trades are absent. */
export const calendarPnl: Record<string, number> = {
  "2026-10-05": 210.5,
  "2026-10-06": -160,
  "2026-10-08": 330,
  "2026-10-09": 412.8,
  "2026-10-13": -210,
  "2026-10-15": 320,
  "2026-10-19": 280,
  "2026-10-21": -150,
  "2026-10-27": 190,
  "2026-10-30": 120,
};
/** Month the calendar opens on, and "today" (gold outline in Figma). */
export const CALENDAR_START = { year: 2026, month: 9 };
export const CALENDAR_TODAY = "2026-10-10";

export const marketMix: { market: Market; trades: number; pnl: number }[] = [
  { market: "BTC", trades: 2, pnl: 210.5 },
  { market: "ETH", trades: 1, pnl: 412.8 },
  { market: "SOL", trades: 1, pnl: 330 },
  { market: "BNB", trades: 1, pnl: 225.25 },
];

/* ---------- Stats & Discipline ---------- */

export const resultBreakdown = [
  { label: "Gross result", value: "+$1,422.46", tone: "green" },
  { label: "Trading fees", value: "$205.01" },
  { label: "Funding paid", value: "-$38.90", tone: "red" },
  { label: "Net result", value: "+$1,178.55", tone: "green" },
] as const;

export type StatLine = { label: string; value: string; tone?: "green" | "red" };

export const winLossSplit: StatLine[] = [
  { label: "Winners", value: "3" },
  { label: "Losers", value: "2" },
  { label: "Break-even", value: "0" },
  { label: "Average winner", value: "+$491.18", tone: "green" },
  { label: "Average loser", value: "-$147.50", tone: "red" },
  { label: "Best trade", value: "+$912.80", tone: "green" },
  { label: "Worst trade", value: "-$210.00", tone: "red" },
  { label: "Expectancy", value: "+$235.71", tone: "green" },
];

export const paceDiscipline: StatLine[] = [
  { label: "Volume traded", value: "$288,742.15" },
  { label: "Closed trades", value: "5" },
  { label: "Open right now", value: "2" },
  { label: "Active days", value: "4" },
  { label: "Avg hold", value: "24h 55m" },
  { label: "Return on size", value: "+1.18%", tone: "green" },
  { label: "Deepest pullback", value: "-$210.00", tone: "red" },
  { label: "Avg per trade", value: "+$235.71", tone: "green" },
];

export const holdBuckets = [
  { label: "Under 1m", count: 0 },
  { label: "1–5m", count: 0 },
  { label: "5–15m", count: 0 },
  { label: "15m–1h", count: 0 },
  { label: "1–4h", count: 0 },
  { label: "4–24h", count: 3 },
  { label: "Over 24h", count: 2 },
];
export const averageHold = "24h 55m";

export const sides = [
  { side: "Long side", closed: 3, result: "+$1,473.55", hitRate: "100.0%", avg: "+$491.18", tone: "green" },
  { side: "Short side", closed: 2, result: "-$295.00", hitRate: "0.0%", avg: "-$147.50", tone: "red" },
] as const;

export const marketBreakdown: { market: Market; volume: string; share: string; trades: number; winRate: string; costs: string; net: number }[] = [
  { market: "BTC", volume: "$133,213.61", share: "46.1% of total", trades: 2, winRate: "50.0%", costs: "$103.84", net: 210.5 },
  { market: "ETH", volume: "$72,180.40", share: "25.0% of total", trades: 1, winRate: "100.0%", costs: "$48.12", net: 412.8 },
  { market: "SOL", volume: "$48,920.14", share: "16.9% of total", trades: 1, winRate: "100.0%", costs: "$31.66", net: 330 },
  { market: "BNB", volume: "$34,428.00", share: "11.9% of total", trades: 1, winRate: "0.0%", costs: "$21.39", net: 225.25 },
];

/* ---------- Trade Log ---------- */

export type ClosedTrade = {
  id: string;
  market: Market;
  side: "Long" | "Short";
  opened: string;
  closed: string;
  duration: string;
  gross: number;
  fees: number;
  funding: number;
  net: number;
};

export const tradeLog: ClosedTrade[] = [
  { id: "t5", market: "BTC", side: "Long", opened: "2026-11-06 14:02", closed: "2026-11-06 15:05", duration: "1.1h", gross: -160.01, fees: 9.17, funding: -0.19, net: -169.37 },
  { id: "t4", market: "ETH", side: "Long", opened: "2026-11-05 09:40", closed: "2026-11-06 11:12", duration: "25.5h", gross: 451.2, fees: 21.4, funding: -4.1, net: 425.7 },
  { id: "t3", market: "SOL", side: "Long", opened: "2026-11-03 16:20", closed: "2026-11-04 08:05", duration: "15.8h", gross: 352.9, fees: 15.6, funding: -2.3, net: 335 },
  { id: "t2", market: "BTC", side: "Short", opened: "2026-11-02 10:15", closed: "2026-11-03 13:45", duration: "27.5h", gross: -101.5, fees: 12.8, funding: -1.2, net: -115.5 },
  { id: "t1", market: "BNB", side: "Long", opened: "2026-11-01 08:30", closed: "2026-11-01 22:10", duration: "13.7h", gross: 940.1, fees: 26.4, funding: -0.9, net: 912.8 },
];

export const TRADE_FILTERS = ["All", "Long", "Short"] as const;
export type TradeFilter = (typeof TRADE_FILTERS)[number];
