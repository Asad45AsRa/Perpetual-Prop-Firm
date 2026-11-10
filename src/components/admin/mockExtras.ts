// Demo backend for the NEW admin features (kept apart from mockApi.ts so the older code stays untouched).
// Like mockApi.ts it mimics the real API contract: same paths, same JSON shapes, same permission checks.
// The numbers in the analytics and trader-view responses are generated for the demo.
// A real backend must calculate them from fills, fees and ledger entries (see metricDefinitions.ts).
// Remove this file together with mockApi.ts and mockData.ts once the real backend is connected.

import { STAGE } from "./constants";
import { round2, validatePlanRow } from "./planMath";
import type { Row } from "./mockData";
import type { AccountAnalyticsData, BreachData, CheckItem, ReservesData, SettingsImpactData, TraderViewData } from "./types";

type Handler = (row: Row, body: Row) => void;

// What this file needs from mockApi.ts. Passed in (instead of imported) so the two files never import each other.
export type ExtrasContext = {
  db: Record<string, Row[]>;
  settings: { sections: Record<string, Record<string, string | number>> };
  fail: (message: string, status: number, code?: string) => Error;
  must: (condition: boolean, message: string, status?: number) => void;
  needReason: (body: Row) => string;
  appendAudit: (action: string, target: string, o?: { reason?: string }) => void;
  authorize: (me: Row, resource: string, write: boolean, action?: string) => void;
};

// Which sidebar page owns each new resource (the page key decides view / manage access)
export const EXTRA_RESOURCE_PAGE: Record<string, string> = {
  "demo-accounts": "demo",
  leaderboard: "leaderboard",
  "trader-sessions": "traders",
  "trader-view": "trader-view",
};

// Special rights needed for the new row actions: "<resource>.<action>" -> right
export const EXTRA_ACTION_RIGHT: Record<string, string> = {
  "leaderboard.hide": "traders.suspend",
  "leaderboard.show": "traders.suspend",
  "leaderboard.reset-username": "traders.suspend",
  "traders.reset-username": "traders.suspend",
  "traders.reset-avatar": "traders.suspend",
  "trader-sessions.revoke": "traders.suspend",
  "tickets.assign": "tickets.reply",
};

// Created only by the system or by row actions
export const EXTRA_READ_ONLY = ["demo-accounts", "leaderboard", "trader-sessions"];

// Fields that change a plan's rules. Editing any of them raises the plan's rules version.
export const EXTRA_PLAN_RULE_FIELDS = [
  "planType", "multiplier", "challengeRequired", "drawdownType", "dailyLossMethod", "takerFeePct", "makerFeePct", "maxExposurePct",
  "holdHours", "multiplierMin", "multiplierMax", "paymentMin", "paymentMax", "profitTargetOptions", "dailyLossOptions", "maxLossOptions", "profitSplitOptions",
];

// Balance of the reserve wallet in demo mode. The real backend reads this from the chain.
const CHAIN_BALANCE = 462855;
// Payouts made before this console existed. Added to the paid total shown to traders.
const IMPORTED_PAYOUT_HISTORY = 2523146;

// Same input always gives the same sequence, so a demo account shows stable numbers between reloads
function seeded(key: string) {
  let seed = [...key].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

const newUsername = () => `trader_${Math.floor(1000 + Math.random() * 9000)}`;
const monthName = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export function createExtras(ctx: ExtrasContext) {
  const { db, settings, fail, must, needReason } = ctx;

  /* ───────────────────────── Leaderboard (rank is always calculated, never stored) ───────────────────────── */

  function leaderboardRows(): Row[] {
    const l = settings.sections.leaderboard;
    const min = Number(l.minTrades);
    const rows: Row[] = db.leaderboard.map((r) => {
      const trader = db.traders.find((t) => t.name === r.traderName);
      let why = "";
      if (r.status === "hidden") why = "Hidden by staff";
      else if (Number(r.trades) < min) why = `Fewer than ${min} closed trades`;
      else if (l.excludeFlagged === "yes" && trader?.flags) why = `Flagged: ${String(trader.flags)}`;
      // The username lives on the trader record, so a reset there shows up here at once
      return { ...r, username: trader?.username ?? r.username, eligible: why === "", why, rank: "" as number | "" };
    });
    const score = (r: Row) => (l.rankBy === "Win rate" ? Number(r.winRate) : Number(r.pnl));
    rows
      .filter((r) => r.eligible)
      .sort((a, b) => score(b) - score(a) || Number(b.winRate) - Number(a.winRate) || Number(a.trades) - Number(b.trades))
      .forEach((r, i) => { r.rank = i + 1; });
    return rows.sort((a, b) => (a.rank === "" ? 1 : 0) - (b.rank === "" ? 1 : 0) || Number(a.rank || 0) - Number(b.rank || 0));
  }

  /* ───────────────────────── Row actions added by the new features ───────────────────────── */

  const resetUsername = (traderName: string) => {
    const name = newUsername();
    const trader = db.traders.find((t) => t.name === traderName);
    if (trader) trader.username = name;
    db.leaderboard.filter((r) => r.traderName === traderName).forEach((r) => { r.username = name; });
  };

  const actions: Record<string, Record<string, Handler>> = {
    leaderboard: {
      hide: (r, b) => { needReason(b); must(r.status === "visible", "This trader is already hidden."); r.status = "hidden"; },
      show: (r) => { must(r.status === "hidden", "This trader is already visible."); r.status = "visible"; },
      "reset-username": (r, b) => { needReason(b); resetUsername(String(r.traderName)); },
    },
    traders: {
      "reset-username": (t, b) => { needReason(b); resetUsername(String(t.name)); },
      "reset-avatar": (t, b) => { needReason(b); t.avatar = "avatar-01"; },
    },
    "trader-sessions": {
      revoke: (s) => { must(s.status === "active", "This device is already signed out."); s.status = "signed out"; },
    },
    "demo-accounts": {
      restart: (d) => {
        must(d.status === "active", "Only an active demo account can be restarted.");
        const limit = Number(settings.sections.demo.restartLimit);
        must(limit === 0 || Number(d.restarts) < limit, `The restart limit of ${limit} has been reached.`);
        Object.assign(d, { balance: d.startBalance, equity: d.startBalance, pnl: 0, targetProgress: 0, restarts: Number(d.restarts) + 1, lastRestartAt: new Date().toISOString() });
      },
      close: (d, b) => { needReason(b); must(d.status === "active", "This demo account is already closed."); d.status = "closed"; },
    },
    tickets: {
      assign: (t, b) => {
        const who = String(b.assigned ?? "").trim();
        must(who.length > 0, "Choose who to assign the ticket to.", 400);
        t.assigned = who;
      },
    },
  };

  /* ───────────────────────── Validation ───────────────────────── */

  // Called before a plan is created or edited. Fills in the multiplier when it was left at 0.
  function checkPlan(row: Row) {
    if (!(Number(row.multiplier) > 0) && Number(row.price) > 0) row.multiplier = round2(Number(row.capital) / Number(row.price));
    const problem = validatePlanRow(row);
    if (problem) throw fail(problem, 400, "invalid_plan");
  }

  // Called before a settings section is saved (the values already include the unchanged fields)
  function checkSettings(section: string, v: Record<string, string | number>) {
    if (section === "demo") {
      must(Number(v.balance) > 0, "The demo balance must be above zero.", 400);
      must(Number(v.profitTarget) > 0 && Number(v.profitTarget) <= 100, "The demo profit target must be between 1 and 100%.", 400);
      must(Number(v.maxActiveDemos) >= 1, "Allow at least one active demo account per trader.", 400);
    }
    if (section === "leaderboard" && v.periodMode === "custom") {
      const ok = /^\d{4}-\d{2}-\d{2}$/;
      must(ok.test(String(v.periodStart)) && ok.test(String(v.periodEnd)), "Enter the period dates as yyyy-mm-dd.", 400);
      must(String(v.periodStart) <= String(v.periodEnd), "The period cannot end before it starts.", 400);
    }
    if (section === "reserve") {
      must(String(v.walletAddress).trim().length >= 10, "Enter the reserve wallet address.", 400);
      must(String(v.proofUrl) === "" || /^https:\/\//.test(String(v.proofUrl)), "The proof link must start with https://", 400);
      must(v.publicStatsSource !== "manual" || Number(v.manualReserveAmount) > 0, "Enter the manual reserve amount.", 400);
    }
  }

  /* ───────────────────────── What a settings change touches ───────────────────────── */

  function settingsImpact(section: string): SettingsImpactData {
    const count = (rows: Row[], test: (r: Row) => boolean) => rows.filter(test).length;
    const liveAccounts = count(db.accounts, (a) => a.status === "active");
    const items: CheckItem[] = [];
    const add = (label: string, detail: string, ok = true) => items.push({ label, ok, detail });

    if (section === "risk") {
      add("Live accounts checked with the new rules", String(liveAccounts));
      const overrides = count(db.plans, (p) => p.drawdownType !== "global default" || p.dailyLossMethod !== "global default");
      add("Plans that keep their own drawdown or daily-loss rule", String(overrides));
      add("Accounts already breached", String(count(db.accounts, (a) => a.status === "failed" || a.status === "locked")), true);
    } else if (section === "trading") {
      add("Open positions", String(count(db.activity, (o) => o.status === "open")));
      add("Plans with their own fee or exposure value", String(count(db.plans, (p) => String(p.takerFeePct) !== "" || String(p.makerFeePct) !== "" || String(p.maxExposurePct) !== "")));
      add("When it applies", "New fills only. Past fills keep their fee.");
    } else if (section === "payouts") {
      const waiting = count(db.payouts, (p) => ["pending", "awaiting approval", "approved"].includes(String(p.status)));
      add("Payouts waiting right now", String(waiting), waiting === 0);
      add("Plans with their own payout hold", String(count(db.plans, (p) => String(p.holdHours) !== "")));
    } else if (section === "compliance") {
      const pending = count(db.kyc, (k) => k.status === "pending");
      add("Identity checks waiting", String(pending), pending === 0);
      add("Traders who joined from a restricted country", String(count(db.traders, (t) => t.flags === "restricted-country")));
    } else if (section === "plisio") {
      const open = count(db.payments, (p) => p.status === "pending");
      add("Invoices waiting for payment", String(open), open === 0);
    } else if (section === "flags") {
      add("Applies to", "Every trader, straight away");
      add("Competitions in the trader sidebar", settings.sections.flags.competitions === "on" ? "open" : "locked");
    } else if (section === "demo") {
      add("Active demo accounts", String(count(db["demo-accounts"], (d) => d.status === "active")));
      add("When it applies", "New and restarted demo accounts. Running ones keep their balance.");
    } else if (section === "leaderboard") {
      const rows = leaderboardRows();
      add("Traders on the leaderboard", String(rows.length));
      add("Traders currently ranked", String(rows.filter((r) => r.eligible).length));
      add("When it applies", "Ranks and Top % change for every trader straight away.", false);
    } else if (section === "reserve") {
      add("Shown to every trader on the Payouts page", "Immediately", false);
    } else {
      add("Applies to", "The whole platform");
    }
    return { items };
  }

  /* ───────────────────────── Reserve proof and public numbers ───────────────────────── */

  function reservesExtra(base: { pending: number; approvedUnpaid: number; paid: number }): Pick<ReservesData, "onChain" | "publicStats"> {
    const s = settings.sections.reserve;
    const owed = base.pending + base.approvedUnpaid;
    const manual = s.publicStatsSource === "manual";
    const shown = manual ? Number(s.manualReserveAmount) : CHAIN_BALANCE;
    return {
      onChain: {
        walletAddress: String(s.walletAddress),
        network: String(s.network),
        balance: CHAIN_BALANCE,
        proofUrl: String(s.proofUrl),
        lastCheckedAt: new Date(Date.now() - 2 * 60_000).toISOString(),
        coverage: owed > 0 ? round2(CHAIN_BALANCE / owed) : 99,
      },
      publicStats: {
        payoutReserve: shown,
        totalPayoutsIssued: IMPORTED_PAYOUT_HISTORY + base.paid,
        avgPayoutSeconds: 8.3,
        reserveSource: manual ? "manual" : "live on-chain",
        sources: [
          { label: "Payout Reserve", value: manual ? "manual amount" : "live on-chain balance", formula: "Balance of the reserve wallet, or the manual amount set in Platform Settings > Reserve & public stats." },
          { label: "Total Payouts Issued", value: "paid payouts + imported history", formula: `Sum of every payout marked paid in this console, plus ${IMPORTED_PAYOUT_HISTORY.toLocaleString("en-US")} imported from before it existed.` },
          { label: "Avg. Payout Time", value: "median, last 30 days", formula: "Median seconds between approval and on-chain confirmation." },
        ],
      },
    };
  }

  /* ───────────────────────── Account analytics and breach explanation ───────────────────────── */

  const planOf = (acc: Row) => db.plans.find((p) => String(acc.rulesSnapshot).startsWith(String(p.name)));

  function analytics(acc: Row): AccountAnalyticsData {
    const rand = seeded(String(acc.id));
    const now = new Date();
    const markets = ["BTC-PERP", "ETH-PERP", "SOL-PERP"];
    const holds = [0.5, 3, 12, 40, 150, 600, 1500];
    const n = Math.max(3, Math.min(12, Number(acc.tradingDays) + 2));

    const trades = Array.from({ length: n }, () => {
      const win = rand() < 0.55;
      const size = 50 + rand() * 400;
      return {
        gross: round2((win ? 1 : -1) * size * (win ? 1 : 0.7)),
        fee: round2(2 + rand() * 8),
        funding: round2((rand() - 0.5) * 2),
        holdMin: holds[Math.floor(rand() * holds.length)],
        market: markets[Math.floor(rand() * markets.length)],
        side: rand() < 0.5 ? "long" : "short",
        day: 1 + Math.floor(rand() * now.getDate()),
        volume: round2(20000 + rand() * 80000),
        net: 0,
      };
    });
    // Make the demo trades add up to the account's real result
    trades.forEach((t) => { t.net = round2(t.gross - t.fee - t.funding); });
    const gap = Number(acc.pnl) - trades.reduce((a, t) => a + t.net, 0);
    trades[n - 1].gross = round2(trades[n - 1].gross + gap);
    trades[n - 1].net = round2(trades[n - 1].net + gap);

    const sum = (list: number[]) => round2(list.reduce((a, x) => a + x, 0));
    const winners = trades.filter((t) => t.net > 0);
    const losers = trades.filter((t) => t.net < 0);
    const net = sum(trades.map((t) => t.net));
    const lossTotal = Math.abs(sum(losers.map((t) => t.net)));

    const edges: [string, number, number][] = [["Under 1m", 0, 1], ["1-5m", 1, 5], ["5-15m", 5, 15], ["15m-1h", 15, 60], ["1-4h", 60, 240], ["4-24h", 240, 1440], ["Over 24h", 1440, Infinity]];
    const buckets = edges.map(([label, lo, hi]) => {
      const count = trades.filter((t) => t.holdMin >= lo && t.holdMin < hi).length;
      return { label, count, pct: Math.round((count / n) * 100) };
    });

    const side = (name: string) => {
      const list = trades.filter((t) => t.side === name);
      const pnl = sum(list.map((t) => t.net));
      return { closed: list.length, pnl, hitRate: list.length ? round2((list.filter((t) => t.net > 0).length / list.length) * 100) : 0, avgPerTrade: list.length ? round2(pnl / list.length) : 0 };
    };

    const plan = planOf(acc);
    const challengeRequired = plan?.challengeRequired !== "no";
    const funded = acc.stage === STAGE.funded;
    const payoutReady = funded && Number(acc.pnl) > 0;
    const steps: AccountAnalyticsData["stagePath"]["steps"] = [
      { label: STAGE.challenge, state: !challengeRequired ? "skipped" : funded ? "done" : "current" },
      { label: STAGE.funded, state: funded ? (payoutReady ? "done" : "current") : "locked" },
      { label: "Payout Request", state: payoutReady ? "current" : "locked" },
    ];

    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const calendar = Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const list = trades.filter((t) => t.day === day);
      return { date: `${monthName(now)}-${String(day).padStart(2, "0")}`, pnl: list.length ? sum(list.map((t) => t.net)) : null };
    });

    const marketMix = markets
      .map((market) => {
        const list = trades.filter((t) => t.market === market);
        return { market, closedTrades: list.length, volume: sum(list.map((t) => t.volume)), winRate: list.length ? (list.filter((t) => t.net > 0).length / list.length) * 100 : 0, costs: sum(list.map((t) => t.fee + t.funding)), netPnl: sum(list.map((t) => t.net)) };
      })
      .filter((m) => m.closedTrades > 0);

    return {
      stagePath: { challengeRequired, steps },
      summary: { equity: Number(acc.equity), realized: net, hitRate: round2((winners.length / n) * 100), profitFactor: lossTotal > 0 ? round2(sum(winners.map((t) => t.net)) / lossTotal) : 0, grossResult: sum(trades.map((t) => t.gross)), fees: sum(trades.map((t) => t.fee)), funding: sum(trades.map((t) => t.funding)), netResult: net },
      winLoss: { winners: winners.length, losers: losers.length, breakEven: n - winners.length - losers.length, avgWinner: winners.length ? round2(sum(winners.map((t) => t.net)) / winners.length) : 0, avgLoser: losers.length ? round2(sum(losers.map((t) => t.net)) / losers.length) : 0, bestTrade: Math.max(...trades.map((t) => t.net)), worstTrade: Math.min(...trades.map((t) => t.net)), expectancy: round2(net / n) },
      pace: { volume: sum(trades.map((t) => t.volume)), closedTrades: n, openNow: db.activity.filter((o) => o.accountId === acc.id && o.status === "open").length, activeDays: new Set(trades.map((t) => t.day)).size, avgHoldMinutes: round2(trades.reduce((a, t) => a + t.holdMin, 0) / n), deepestPullbackPct: round2(Math.max(0, ((Number(acc.highWater) - Number(acc.equity)) / Number(acc.highWater)) * 100)) },
      holding: { averageMinutes: round2(trades.reduce((a, t) => a + t.holdMin, 0) / n), measured: n, buckets },
      sides: { long: side("long"), short: side("short") },
      calendar: { month: monthName(now), days: calendar },
      marketMix,
    };
  }

  function breach(acc: Row): BreachData {
    const fill = db.fills.find((f) => f.accountId === acc.id);
    const events = db.risk
      .filter((r) => r.accountId === acc.id)
      .sort((a, b) => String(b.detectedAt).localeCompare(String(a.detectedAt)))
      .map((r) => ({
        id: String(r.id), rule: String(r.rule), threshold: String(r.threshold), valueAtBreach: String(r.valueAtBreach), equitySnapshot: Number(r.equitySnapshot),
        action: String(r.action), status: String(r.status), source: String(r.source), detectedAt: String(r.detectedAt),
        price: fill ? { market: String(fill.market), fill: Number(fill.price), bid: Number(fill.bid), ask: Number(fill.ask), mark: Number(fill.mark), at: String(fill.filledAt) } : null,
      }));
    return { accountStatus: String(acc.status), rulesSnapshot: String(acc.rulesSnapshot), events };
  }

  /* ───────────────────────── Read-only copy of a trader's dashboard ───────────────────────── */

  function traderView(id: string): TraderViewData {
    const t = db.traders.find((x) => x.id === id);
    if (!t) throw fail("Record not found.", 404, "not_found");
    const accounts = db.accounts.filter((a) => a.traderId === id);
    const funded = accounts.filter((a) => a.stage === STAGE.funded);
    const payouts = db.payouts.filter((p) => p.traderName === t.name);
    const paid = round2(payouts.filter((p) => p.status === "paid").reduce((a, p) => a + Number(p.amount), 0));
    const realized = round2(funded.reduce((a, x) => a + Number(x.pnl), 0));
    const allocation = funded.reduce((a, x) => a + Number(x.startBalance), 0);
    const days = accounts.reduce((a, x) => a + Number(x.tradingDays), 0);
    const board = leaderboardRows();
    const mine = board.find((r) => r.traderName === t.name);
    const ranked = board.filter((r) => r.eligible).length;
    const rank = mine && mine.eligible ? Number(mine.rank) : null;

    return {
      profile: { id, name: String(t.name), username: String(t.username), avatar: String(t.avatar), joinedAt: String(t.joinedAt), status: String(t.status), kyc: String(t.kyc), rank, topPercent: rank && ranked ? Math.ceil((rank / ranked) * 100) : null, lifetimePayouts: paid },
      subAccounts: accounts.map((a) => ({ id: String(a.id), plan: String(a.plan), stage: String(a.stage), status: String(a.status), allocation: Number(a.startBalance), equity: Number(a.equity), dailyDrawdownPct: Number(a.dailyLossUsed), maxDrawdownPct: Number(a.drawdownUsed), profitTargetPct: Number(a.targetProgress) })),
      lifetime: { realizedPnl: realized, totalRoiPct: allocation ? round2((realized / allocation) * 100) : 0, totalPayouts: paid, volume: round2(accounts.reduce((a, x) => a + Number(x.tradingDays) * Number(x.startBalance) * 0.5, 0)), tradingDays: days, winRatePct: Number(mine?.winRate ?? 0), avgProfitPerDay: days ? round2(realized / days) : 0, avgHoldMinutes: 83 },
      payouts: {
        withdrawable: Math.max(0, round2(funded.reduce((a, x) => a + Math.max(0, Number(x.pnl)) * 0.8, 0) - paid)),
        subAccountProfit: realized,
        history: payouts.map((p) => ({ id: String(p.id), date: String(p.requestedAt), account: String(p.accountId), amount: Number(p.profit), split: Number(p.split), afterSplit: Number(p.amount), network: String(p.network), status: String(p.status) })),
      },
      purchases: db.payments.filter((p) => p.traderName === t.name).map((p) => ({ id: String(p.id), date: String(p.createdAt), plan: String(p.plan), amount: Number(p.amount), method: String(p.method), status: String(p.status) })),
    };
  }

  /* ───────────────────────── Routes ───────────────────────── */

  // Returns { handled: false } for paths that belong to the older code in mockApi.ts
  function route(a: { me: Row; method: string; resource: string; a?: string; b?: string; q: URLSearchParams }): { handled: boolean; value?: unknown } {
    const { me, method, resource } = a;
    if (resource === "settings-impact" && method === "GET") {
      ctx.authorize(me, "settings", false);
      return { handled: true, value: settingsImpact(a.q.get("section") ?? "") };
    }
    if (resource === "accounts" && a.a && (a.b === "analytics" || a.b === "breach") && method === "GET") {
      ctx.authorize(me, "accounts", false);
      const acc = db.accounts.find((x) => x.id === a.a);
      if (!acc) throw fail("Record not found.", 404, "not_found");
      return { handled: true, value: a.b === "analytics" ? analytics(acc) : breach(acc) };
    }
    if (resource === "trader-view" && a.a) {
      // Viewing is allowed with "view" access. It is read-only, so even "open" only writes an audit entry.
      ctx.authorize(me, "trader-view", false);
      if (a.b === "open" && method === "POST") {
        ctx.appendAudit("Opened trader view", a.a);
        return { handled: true, value: {} };
      }
      return { handled: true, value: traderView(a.a) };
    }
    return { handled: false };
  }

  return { actions, checkPlan, checkSettings, reservesExtra, leaderboardRows, route };
}
