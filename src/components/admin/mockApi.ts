// Demo backend for the admin console. It mimics the real API contract exactly
// (same paths, same JSON shapes, same permission checks), so pages cannot tell the difference.
// Staff accounts and website content are kept in the browser storage so they survive a reload;
// everything else lives in memory and resets when the page reloads.
// Remove this file (and mockData.ts) once the real backend is connected and set NEXT_PUBLIC_ADMIN_MOCK=false.

import { explorerUrl, SLA_MINUTES, STAGE } from "./constants";
import { can, levelOf, RIGHT_KEYS, type AccessLevel } from "./permissions";
import { readMockContent, writeMockContent, type ContentKey, type ContentRecord } from "@/lib/siteContent";
import { ago, seedDb, seedSettings, seedStaff, type Row } from "./mockData";
import type { AdminUser } from "./Adminauth";
import type { CheckItem } from "./types";

type Options = { method?: string; body?: unknown };

export const MOCK_CODE = "123456";

/* ───────────────────────── Helpers ───────────────────────── */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rid = () => `req_${Math.random().toString(16).slice(2, 8)}`;
const round2 = (n: number) => Math.round(n * 100) / 100;

// Errors carry an HTTP status and a request id, like the real `api` helper expects
const fail = (message: string, status: number, code?: string) => Object.assign(new Error(message), { status, code, requestId: rid() });

// Small non-cryptographic hash, only to demonstrate a tamper-evident audit chain.
// The real backend must use SHA-256 (or better) for the same job.
function hashString(str: string) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
}

/* ───────────────────────── Realtime simulation ───────────────────────── */

// Pages subscribe here; it plays the role of the server WebSocket in demo mode
const listeners = new Set<(topic?: string) => void>();
const emit = (topic?: string) => listeners.forEach((fn) => fn(topic));

export function subscribeMock(fn: (topic?: string) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const MARKETS = ["BTC-PERP", "ETH-PERP", "SOL-PERP"];
let tradeCounter = 1004;

// Every few seconds a trade changes or appears, so the console visibly updates by itself
export function startMockSimulation() {
  const timer = setInterval(() => {
    const trades = db.activity;
    if (Math.random() < 0.3) {
      const account = db.accounts[Math.floor(Math.random() * db.accounts.length)];
      trades.unshift({
        id: `ORD-${++tradeCounter}`,
        accountId: account.id,
        traderName: account.traderName,
        market: MARKETS[Math.floor(Math.random() * MARKETS.length)],
        side: Math.random() < 0.5 ? "long" : "short",
        size: `${(Math.random() * 2 + 0.1).toFixed(2)} units`,
        entry: Math.round(100 + Math.random() * 900),
        status: "open",
        pnl: Math.round((Math.random() - 0.4) * 120),
        slippage: round2(Math.random() * 0.05),
        flag: "",
        openedAt: new Date().toISOString(),
        version: 1,
      });
      if (trades.length > 40) trades.pop();
    } else {
      const t = trades[Math.floor(Math.random() * trades.length)];
      t.pnl = Number(t.pnl) + Math.round((Math.random() - 0.5) * 30);
    }
    emit("activity");
  }, 6000);
  return () => clearInterval(timer);
}

/* ───────────────────────── State ───────────────────────── */

const STAFF_KEY = "mock-admin-staff";
const SESSION_KEY = "mock-admin-session";

function loadStaff(): Row[] {
  let list: Row[] = [];
  try {
    list = JSON.parse(localStorage.getItem(STAFF_KEY) ?? "[]");
  } catch {
    list = [];
  }
  // The super admin is created automatically and recreated if it is ever missing
  if (!list.some((s) => s.protected)) list = [...seedStaff().filter((s) => s.protected), ...list];
  if (list.length === 1) list = seedStaff();
  return list;
}

let staff: Row[] = loadStaff();
const saveStaff = () => localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
saveStaff();

const db = seedDb();
// Each ticket must get a first reply before its response target (by priority)
db.tickets.forEach((t) => { t.slaDueAt = new Date(new Date(String(t.createdAt)).getTime() + (SLA_MINUTES[String(t.priority)] ?? 1440) * 60_000).toISOString(); });
const settings = seedSettings();
const failedLogins: Record<string, number> = {};
let currentActor = "system";
const counters = { log: 1000, apr: 10, note: 10, tm: 10, el: 10, run: 3, st: 10 };

const toUser = (s: Row): AdminUser => ({
  id: String(s.id),
  name: String(s.name),
  email: String(s.email),
  role: s.role as AdminUser["role"],
  grants: (s.grants ?? {}) as Record<string, AccessLevel>,
  rights: (s.rights ?? []) as string[],
  protected: !!s.protected,
});

const publicStaff = (s: Row) => {
  const { password: _password, forcedOutAt: _forced, ...rest } = s; // eslint-disable-line @typescript-eslint/no-unused-vars
  return rest;
};

/* ───────────────────────── Audit trail (hash chained) ───────────────────────── */

function appendAudit(action: string, target: string, o: { before?: Row | null; after?: Row | null; result?: string; actor?: string; reason?: string; at?: string } = {}) {
  const list = db["audit-logs"];
  const prev = list[0];
  const entry: Row = {
    id: `LOG-${++counters.log}`,
    actor: o.actor ?? currentActor,
    action,
    target,
    result: o.result ?? "success",
    reason: o.reason ?? "",
    ip: "203.0.113.10",
    requestId: rid(),
    before: o.before ?? null,
    after: o.after ?? null,
    createdAt: o.at ?? new Date().toISOString(),
    prevHash: prev ? prev.hash : "GENESIS",
  };
  entry.hash = hashString(`${entry.prevHash}|${entry.id}|${entry.actor}|${entry.action}|${entry.target}|${entry.createdAt}`);
  list.unshift(entry);
  if (list.length > 400) list.length = 400;
  emit("audit-logs");
}

// Seed history, oldest first, so the chain is valid from the start
[
  ["system", "Super admin created", "SA-1", 60 * 24 * 90],
  ["admin@perpeye.com", "Updated challenge plan", "PL-2", 60 * 24 * 12],
  ["Risk engine", "Account failed: max drawdown", "ACC-2003", 60 * 5],
  ["finance@perpeye.com", "payouts approve", "PO-502", 60 * 4],
  ["admin@perpeye.com", "Changed setting payouts", "settings", 60 * 3],
].forEach(([actor, action, target, minutes]) =>
  appendAudit(String(action), String(target), { actor: String(actor), at: ago(Number(minutes)), before: action === "Changed setting payouts" ? { dualApprovalAbove: 300 } : null, after: action === "Changed setting payouts" ? { dualApprovalAbove: 500 } : null }),
);

/* ───────────────────────── Sessions and permissions ───────────────────────── */

const readSession = (): { id: string; startedAt: number } | null => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null");
  } catch {
    return null;
  }
};

// Runs on EVERY request after sign-in. A deleted, disabled or force-signed-out person gets a 401 at once.
function requireStaff(): Row {
  const session = readSession();
  if (!session) throw fail("Please sign in.", 401, "no_session");
  const me = staff.find((s) => s.id === session.id);
  if (!me) throw fail("Your access was removed. Please contact the super admin.", 401, "staff_deleted");
  if (me.status !== "active") throw fail("Your account is disabled. Please contact the super admin.", 401, "staff_disabled");
  if (Number(me.forcedOutAt ?? 0) > session.startedAt) throw fail("You were signed out by the super admin.", 401, "forced_out");
  currentActor = String(me.email);
  return me;
}

// Which sidebar page owns each resource (the page key decides view / manage access)
const RESOURCE_PAGE: Record<string, string> = {
  traders: "traders", accounts: "accounts", activity: "activity", fills: "activity", fees: "activity", risk: "risk",
  markets: "markets", issuance: "issuance", kyc: "kyc", ledger: "ledger", "ledger-runs": "ledger", plans: "plans",
  payments: "payments", payouts: "payouts", approvals: "approvals", affiliates: "affiliates", referrals: "affiliates",
  "affiliate-payouts": "affiliate-payouts", coupons: "coupons", reserves: "reserves", "public-payouts": "public-payouts",
  reports: "reports", tickets: "tickets", "ticket-messages": "tickets", announcements: "announcements", emails: "emails",
  "email-log": "emails", content: "cms", competitions: "competitions", health: "health", incidents: "health", feed: "health",
  backups: "health", errors: "errors", webhooks: "webhooks", jobs: "jobs", alerts: "alerts", "alert-history": "alerts",
  "audit-logs": "audit-logs", settings: "settings", operations: "operations", staff: "staff", "staff-sessions": "staff",
};

// Rights needed for sensitive row actions: "<resource>.<action>" -> right
const ACTION_RIGHT: Record<string, string> = {
  "payouts.approve": "payout.approve", "payouts.reject": "payout.approve", "payouts.paid": "payout.approve",
  "affiliate-payouts.approve": "payout.approve", "affiliate-payouts.reject": "payout.approve", "affiliate-payouts.paid": "payout.approve",
  "accounts.pass": "account.override", "accounts.fail": "account.override", "accounts.lock": "account.override",
  "accounts.unlock": "account.override", "accounts.force-close": "account.override", "accounts.reset": "account.override",
  "traders.suspend": "traders.suspend", "traders.unsuspend": "traders.suspend", "traders.archive": "traders.suspend",
  "traders.force-logout": "traders.suspend", "traders.reset-2fa": "traders.suspend",
  "risk.resolve": "risk.review", "risk.escalate": "risk.review", "risk.override": "account.override",
  "tickets.start": "tickets.reply", "tickets.resolve": "tickets.reply", "tickets.reply": "tickets.reply",
  "kyc.approve": "kyc.review", "kyc.reject": "kyc.review", "kyc.resubmit": "kyc.review",
  "approvals.approve": "approvals.decide", "approvals.reject": "approvals.decide",
  "payments.refund": "refund.issue", "markets.sync": "market.sync",
};

// Throws unless the signed-in person may open the resource (view) or change it (manage)
function authorize(me: Row, resource: string, write: boolean, action?: string) {
  const user = toUser(me);
  const page = RESOURCE_PAGE[resource];
  if (page === "staff" && user.role !== "super_admin") throw fail("Only the super admin can manage staff.", 403, "super_admin_only");
  if (page) {
    const level = levelOf(user, page);
    if (level === "none") throw fail("You do not have access to this section.", 403, "no_access");
    if (write && level !== "manage") throw fail("You can view this section but not change it.", 403, "view_only");
  }
  const right = action ? ACTION_RIGHT[`${resource}.${action}`] : undefined;
  if (right && !can(user, right)) {
    appendAudit(`${resource} ${action}`, "-", { result: "denied" });
    throw fail("You do not have the right to do this.", 403, "missing_right");
  }
}

const viewable = (me: Row, pageKey: string) => levelOf(toUser(me), pageKey) !== "none";

/* ───────────────────────── Approvals (dual control) ───────────────────────── */

function requestApproval(kind: string, target: string, summary: string, amount = 0) {
  db.approvals.unshift({ id: `APR-${++counters.apr}`, kind, target, summary, amount, requestedBy: currentActor, decidedBy: "", status: "pending", createdAt: new Date().toISOString(), version: 1 });
  emit("approvals");
}

/* ───────────────────────── Payout eligibility ───────────────────────── */

function payoutChecks(p: Row): CheckItem[] {
  const min = Number(settings.sections.payouts.minPayout);
  const split = Math.abs((Number(p.profit) * Number(p.split)) / 100 - Number(p.amount)) < 0.01;
  const account = db.accounts.find((a) => a.id === p.accountId);
  const breach = db.risk.some((r) => r.accountId === p.accountId && ["breached", "review", "escalated"].includes(String(r.status)));
  return [
    { label: "No open positions on the account", ok: Number(p.openPositions ?? 0) === 0, detail: `${p.openPositions ?? 0} open` },
    { label: "No unresolved risk breach", ok: !breach, detail: breach ? "A risk event is still open" : "Clean" },
    { label: "Profit split maths is correct", ok: split, detail: `${p.profit} × ${p.split}% = ${p.amount}` },
    { label: "KYC verified", ok: p.kyc === "verified", detail: String(p.kyc) },
    { label: "Wallet is on the trader's whitelist", ok: !!String(p.wallet), detail: String(p.wallet || "No wallet") },
    { label: "Wallet is not used by another trader", ok: !p.duplicateWallet, detail: p.duplicateWallet ? "Same wallet found on another trader" : "Unique" },
    { label: "Minimum payout reached", ok: Number(p.amount) >= min, detail: `${p.amount} of ${min} minimum` },
    { label: "Account is not locked", ok: account?.status !== "locked" && account?.status !== "failed", detail: String(account?.status ?? "unknown") },
  ];
}

/* ───────────────────────── Computed endpoints ───────────────────────── */

const sumBy = (rows: Row[], status: string, field = "amount") => rows.filter((r) => r.status === status).reduce((t, r) => t + Number(r[field]), 0);
const countBy = (rows: Row[], status: string) => rows.filter((r) => r.status === status).length;
const oldest = (rows: Row[], field: string) => rows.map((r) => String(r[field])).sort()[0];
const ageMin = (iso?: string) => (iso ? (Date.now() - new Date(iso).getTime()) / 60_000 : 0);

function overview(me: Row) {
  const user = toUser(me);
  const money = can(user, "finance.view");
  const live = db.activity[0];
  const account = db.accounts.find((a) => a.id === live?.accountId);
  const trader = db.traders.find((t) => t.id === account?.traderId);
  const open = db.activity.filter((a) => a.status === "open");
  const pendingPay = db.payouts.filter((p) => p.status === "pending");
  const openTickets = db.tickets.filter((t) => t.status !== "closed");
  const breaches = db.risk.filter((r) => r.status === "breached");
  const pendingKyc = db.kyc.filter((k) => k.status === "pending");
  const failedHooks = db.webhooks.filter((w) => w.status === "failed");
  const pendingApr = db.approvals.filter((a) => a.status === "pending");

  // [page key, label, rows, date field, target minutes]
  const queues: [string, string, Row[], string, number][] = [
    ["payouts", "Payouts to review", pendingPay, "requestedAt", 24 * 60],
    ["approvals", "Approvals waiting", pendingApr, "createdAt", 4 * 60],
    ["risk", "Risk breaches", breaches, "detectedAt", 30],
    ["kyc", "KYC cases", pendingKyc, "submittedAt", 24 * 60],
    ["webhooks", "Failed webhooks", failedHooks, "receivedAt", 15],
    ["tickets", "Open tickets", openTickets, "createdAt", 4 * 60],
  ];
  const attention = queues
    .filter(([key]) => viewable(me, key))
    .map(([key, label, rows, field, sla]) => {
      const first = rows.length ? oldest(rows, field) : undefined;
      return { key, label, count: rows.length, page: key, oldestAt: first, slaMinutes: sla, breached: !!first && ageMin(first) > sla };
    });

  const paid = db.payments.filter((p) => p.status === "paid");
  return {
    stats: {
      traders: db.traders.length,
      activeAccounts: countBy(db.accounts, "active"),
      pendingPayouts: pendingPay.length,
      challengeRevenue: money ? sumBy(db.payments, "paid") : 0,
      openTickets: openTickets.length,
      riskBreaches: breaches.length,
      pendingAffiliatePayouts: countBy(db["affiliate-payouts"], "pending"),
      pendingKyc: pendingKyc.length,
      failedWebhooks: failedHooks.length,
    },
    live: {
      onlineTraders: db.traders.filter((t) => ageMin(String(t.lastLoginAt)) < 60 * 3).length,
      openPositions: open.length,
      exposure: money ? open.reduce((t, a) => t + Math.abs(Number(a.entry)) * 0.1, 0) : 0,
      payoutLiability: money ? sumBy(db.payouts, "pending") + sumBy(db.payouts, "approved") + sumBy(db.payouts, "awaiting approval") : 0,
    },
    today: { revenue: money ? paid.filter((p) => ageMin(String(p.createdAt)) < 60 * 24).reduce((t, p) => t + Number(p.amount), 0) : 0, refunds: money ? sumBy(db.payments, "refunded") : 0 },
    funnel: [
      { label: "Signed up", value: db.traders.length },
      { label: "Paid checkout", value: paid.length },
      { label: "Passed challenge", value: db.accounts.filter((a) => a.stage === STAGE.funded).length },
      { label: "Requested payout", value: db.payouts.length },
      { label: "Paid out", value: countBy(db.payouts, "paid") },
    ],
    attention,
    liveTrader: live
      ? {
          name: String(live.traderName),
          accountId: String(account?.id ?? "-"),
          equity: Number(account?.equity ?? 0),
          pnl: Number(live.pnl),
          email: String(trader?.email ?? ""),
          plan: String(account?.plan ?? "-"),
          stage: String(account?.stage ?? "-"),
          openPositions: open.filter((a) => a.accountId === live.accountId).length,
          payoutEligible: money ? db.payouts.filter((p) => p.traderName === live.traderName && !["paid", "rejected"].includes(String(p.status))).reduce((t, p) => t + Number(p.amount), 0) : undefined,
          lifetimePaid: money ? db.payouts.filter((p) => p.traderName === live.traderName && p.status === "paid").reduce((t, p) => t + Number(p.amount), 0) : undefined,
          trading: trader?.status === "suspended" ? "Suspended" : "Allowed",
        }
      : null,
    recentPayouts: db.payouts.slice(0, 3),
    recentActivity: db.activity.slice(0, 3),
    recentTickets: db.tickets.slice(0, 3),
  };
}

const operations = () => ({
  kpis: {
    challengeAccounts: db.accounts.filter((a) => a.stage === STAGE.challenge).length,
    fundedAccounts: db.accounts.filter((a) => a.stage === STAGE.funded).length,
    openRiskEvents: db.risk.filter((r) => ["breached", "review", "escalated"].includes(String(r.status))).length,
    openTickets: db.tickets.filter((t) => t.status !== "closed").length,
  },
  plans: db.plans,
});

const reserves = () => ({
  pending: sumBy(db.payouts, "pending") + sumBy(db.payouts, "awaiting approval"),
  approvedUnpaid: sumBy(db.payouts, "approved"),
  paid: sumBy(db.payouts, "paid"),
  rejected: sumBy(db.payouts, "rejected"),
});

function reports(from: string | null, to: string | null) {
  const days = 14;
  const rows = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
    const day = d.toISOString().slice(0, 10);
    const base = ((i * 37) % 9) + 2;
    return { day, revenue: base * 59, refunds: i % 5 === 0 ? 59 : 0 };
  }).filter((r) => (!from || r.day >= from) && (!to || r.day <= to));
  const funded = db.accounts.filter((a) => a.stage === STAGE.funded).length;
  const failed = countBy(db.accounts, "failed");
  const reasons = new Map<string, number>();
  db.risk.filter((r) => r.status !== "healthy").forEach((r) => reasons.set(String(r.rule), (reasons.get(String(r.rule)) ?? 0) + 1));
  return {
    revenueByDay: rows,
    totals: {
      revenue: rows.reduce((t, r) => t + r.revenue, 0),
      refunds: rows.reduce((t, r) => t + r.refunds, 0),
      payouts: sumBy(db.payouts, "paid"),
      affiliateCost: db.affiliates.reduce((t, a) => t + Number(a.earnings), 0),
      passRate: funded + failed ? Math.round((funded / (funded + failed)) * 100) : 0,
    },
    breachReasons: [...reasons].map(([reason, count]) => ({ reason, count })),
    funnel: overview(staff[0]).funnel,
  };
}

function notifications(me: Row) {
  const items: { id: string; level: string; title: string; detail: string; page: string; at: string; key: string }[] = [];
  // `field` is the date column used for the item age; without one the item is dated "now"
  const add = (key: string, level: string, title: string, detail: string, rows: Row[], field?: string) => {
    if (rows.length && viewable(me, key)) items.push({ id: `${key}-${level}-${rows.length}`, level, title, detail, page: key, at: field ? oldest(rows, field) : new Date().toISOString(), key });
  };
  add("risk", "critical", `${db.risk.filter((r) => r.status === "breached").length} risk breaches need review`, "Account rules were broken", db.risk.filter((r) => r.status === "breached"), "detectedAt");
  add("webhooks", "critical", `${db.webhooks.filter((w) => w.status === "failed").length} failed webhooks`, "A payment may not have activated an account", db.webhooks.filter((w) => w.status === "failed"), "receivedAt");
  add("health", "critical", `${db.feed.filter((f) => f.status === "stale").length} stale price feeds`, "Trading on these markets is unsafe", db.feed.filter((f) => f.status === "stale"));
  add("payouts", "warning", `${db.payouts.filter((p) => p.status === "pending").length} payouts waiting`, "Review within 24 hours", db.payouts.filter((p) => p.status === "pending"), "requestedAt");
  add("approvals", "warning", `${db.approvals.filter((a) => a.status === "pending").length} approvals waiting`, "A second person must decide", db.approvals.filter((a) => a.status === "pending"), "createdAt");
  add("kyc", "warning", `${db.kyc.filter((k) => k.status === "pending").length} KYC cases waiting`, "Identity checks to review", db.kyc.filter((k) => k.status === "pending"), "submittedAt");
  add("jobs", "warning", `${db.jobs.filter((j) => j.status === "failed").length} scheduled jobs failed`, "Check the Jobs page", db.jobs.filter((j) => j.status === "failed"), "lastRunAt");
  add("errors", "warning", `${db.errors.filter((e) => e.status === "new").length} new server errors`, "Not yet acknowledged", db.errors.filter((e) => e.status === "new"), "lastSeen");
  if (Object.values(settings.killSwitches).some(Boolean) && viewable(me, "settings")) {
    items.unshift({ id: "kill", level: "critical", title: "A kill switch is ON", detail: "Part of the platform is paused", page: "settings", at: new Date().toISOString(), key: "settings" });
  }
  return items;
}

function search(me: Row, q: string) {
  const s = q.toLowerCase();
  const hits: { type: string; id: string; label: string; page: string }[] = [];
  const scan = (type: string, page: string, rows: Row[], fields: string[], label: (r: Row) => string) => {
    if (!viewable(me, page)) return;
    rows.filter((r) => fields.some((f) => String(r[f] ?? "").toLowerCase().includes(s))).slice(0, 4).forEach((r) => hits.push({ type, id: String(r.id), label: label(r), page }));
  };
  scan("Trader", "traders", db.traders, ["id", "name", "email"], (r) => `${r.name} · ${r.email}`);
  scan("Account", "accounts", db.accounts, ["id", "traderName"], (r) => `${r.id} · ${r.traderName}`);
  scan("Payout", "payouts", db.payouts, ["id", "txHash", "wallet", "traderName"], (r) => `${r.id} · ${r.traderName}`);
  scan("Payment", "payments", db.payments, ["id", "invoiceId", "txnId", "traderName"], (r) => `${r.id} · ${r.invoiceId}`);
  scan("Ticket", "tickets", db.tickets, ["id", "subject"], (r) => `${r.id} · ${r.subject}`);
  return hits;
}

function equityCurve(acc: Row) {
  const start = Number(acc.startBalance);
  const end = Number(acc.equity);
  let seed = [...String(acc.id)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const n = 60;
  const now = Math.floor(Date.now() / 1000);
  const points = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const equity = i === n - 1 ? end : start + (end - start) * t + (rand() - 0.5) * start * 0.012;
    return { time: now - (n - i) * 3600, equity: round2(equity), balance: round2(start + (Number(acc.balance) - start) * t) };
  });
  return { points, start, dailyLossFloor: round2(start * 0.96), maxLossFloor: round2(start * 0.93), highWater: Number(acc.highWater) };
}

/* ───────────────────────── Generic list (paging, search, sort, filters, facets) ───────────────────────── */

const RESERVED = new Set(["page", "pageSize", "q", "sort", "order", "from", "to", "dateKey", "facet"]);

function sourceRows(resource: string): Row[] {
  if (resource === "staff") return staff.map(publicStaff);
  const rows = db[resource];
  if (!rows) throw fail("Unknown resource.", 404, "not_found");
  return rows;
}

// Applies search, equality filters, date range and sort. Used by the list and by the CSV export.
function filtered(resource: string, q: URLSearchParams): Row[] {
  let rows = [...sourceRows(resource)];
  for (const [key, value] of q) if (!RESERVED.has(key) && value) rows = rows.filter((r) => String(r[key]) === value);
  const term = q.get("q")?.trim().toLowerCase();
  if (term) rows = rows.filter((r) => Object.values(r).some((v) => typeof v !== "object" && String(v).toLowerCase().includes(term)));
  const dateKey = q.get("dateKey");
  if (dateKey) {
    const from = q.get("from");
    const to = q.get("to");
    rows = rows.filter((r) => {
      const day = String(r[dateKey] ?? "").slice(0, 10);
      return (!from || day >= from) && (!to || day <= to);
    });
  }
  const sort = q.get("sort");
  if (sort) {
    const dir = q.get("order") === "desc" ? -1 : 1;
    rows.sort((a, b) => {
      const x = a[sort];
      const y = b[sort];
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""))) * dir;
    });
  }
  return rows;
}

function listRows(resource: string, q: URLSearchParams) {
  const rows = filtered(resource, q);
  const pageSize = Math.min(100, Math.max(1, Number(q.get("pageSize") ?? 25)));
  const page = Math.max(1, Number(q.get("page") ?? 1));
  const facets: Record<string, string[]> = {};
  (q.get("facet") ?? "").split(",").filter(Boolean).forEach((key) => {
    facets[key] = [...new Set(sourceRows(resource).map((r) => String(r[key] ?? "")).filter(Boolean))].sort();
  });
  return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize, facets };
}

/* ───────────────────────── Row actions ───────────────────────── */

const needReason = (b: Row) => {
  const reason = String(b.reason ?? "").trim();
  if (!reason) throw fail("A reason is required.", 400, "reason_required");
  return reason;
};
const bump = (row: Row) => {
  row.version = Number(row.version ?? 1) + 1;
};
const find = (resource: string, id: string) => {
  const row = db[resource]?.find((r) => r.id === id);
  if (!row) throw fail("Record not found.", 404, "not_found");
  return row;
};
const must = (cond: boolean, message: string, status = 409) => {
  if (!cond) throw fail(message, status, "conflict");
};

type Handler = (row: Row, body: Row) => void;

const ACTIONS: Record<string, Record<string, Handler>> = {
  payouts: {
    approve: (p) => {
      must(p.status === "pending", "Only pending payouts can be approved.");
      must(!settings.killSwitches.pausePayouts, "Payouts are paused by a kill switch.");
      const bad = payoutChecks(p).filter((c) => !c.ok);
      must(bad.length === 0, `Checks failed: ${bad.map((c) => c.label).join("; ")}`);
      p.firstApprover = currentActor;
      // Large payouts need a second, different person (dual control)
      if (Number(p.amount) > Number(settings.sections.payouts.dualApprovalAbove)) {
        p.status = "awaiting approval";
        requestApproval("payout", String(p.id), `Payout ${p.id} for ${p.traderName}`, Number(p.amount));
      } else p.status = "approved";
    },
    reject: (p, b) => {
      must(["pending", "awaiting approval", "approved"].includes(String(p.status)), "This payout can no longer be rejected.");
      p.reason = needReason(b);
      p.status = "rejected";
    },
    paid: (p, b) => {
      must(p.status === "approved", "Only approved payouts can be marked paid.");
      must(!settings.killSwitches.pausePayouts, "Payouts are paused by a kill switch.");
      const hash = String(b.txHash ?? "").trim();
      must(hash.length >= 16, "Enter the full transaction hash.", 400);
      p.txHash = hash;
      p.explorerUrl = explorerUrl(String(p.network), hash);
      p.confirmations = 1;
      p.status = "paid";
      if (settings.sections.flags.publicPayoutFeed === "on") {
        p.public = true;
        db["public-payouts"].unshift({ id: `PP-${Date.now() % 100000}`, payoutId: p.id, trader: `Trader #${Math.floor(1000 + Math.random() * 9000)}`, asset: "USDT", amount: p.amount, network: p.network, explorerUrl: p.explorerUrl, confirmedAt: new Date().toISOString(), status: "visible" });
      }
    },
  },
  "affiliate-payouts": {
    approve: (p) => {
      must(p.status === "pending", "Only pending payouts can be approved.");
      must(new Date(String(p.holdUntil)).getTime() <= Date.now(), "This payout is still inside its hold period.");
      p.status = "approved";
    },
    reject: (p, b) => {
      p.reason = needReason(b);
      p.status = "rejected";
    },
    paid: (p, b) => {
      must(p.status === "approved", "Only approved payouts can be marked paid.");
      const hash = String(b.txHash ?? "").trim();
      must(hash.length >= 16, "Enter the full transaction hash.", 400);
      p.txHash = hash;
      p.explorerUrl = explorerUrl(String(p.network), hash);
      p.status = "paid";
    },
  },
  accounts: {
    pass: (a, b) => { needReason(b); a.stage = STAGE.funded; a.status = "active"; },
    fail: (a, b) => { needReason(b); a.status = "failed"; },
    lock: (a, b) => { needReason(b); a.status = "locked"; },
    unlock: (a, b) => { needReason(b); must(a.status === "locked", "Only locked accounts can be unlocked."); a.status = "active"; },
    "force-close": (a, b) => {
      needReason(b);
      db.activity.filter((o) => o.accountId === a.id && o.status === "open").forEach((o) => { o.status = "closed"; });
    },
    reset: (a, b) => {
      needReason(b);
      Object.assign(a, { balance: a.startBalance, equity: a.startBalance, pnl: 0, dailyLossUsed: 0, drawdownUsed: 0, highWater: a.startBalance, status: "active" });
    },
  },
  traders: {
    suspend: (t, b) => { needReason(b); t.status = "suspended"; },
    unsuspend: (t) => { t.status = "active"; },
    archive: (t, b) => {
      needReason(b);
      must(!db.accounts.some((a) => a.traderId === t.id && a.status === "active"), "This trader still has active accounts.");
      t.status = "archived";
    },
    "force-logout": () => {},
    "reset-2fa": () => {},
    flag: (t, b) => { t.flags = needReason(b); },
    unflag: (t) => { t.flags = ""; },
  },
  risk: {
    resolve: (r, b) => { needReason(b); r.status = "resolved"; },
    escalate: (r) => { r.status = "escalated"; },
    override: (r, b) => {
      const reason = needReason(b);
      must(r.status === "breached", "Only a breach can be overridden.");
      requestApproval("override", String(r.id), `Unlock ${r.accountId} after breach: ${reason}`);
      r.status = "escalated";
    },
  },
  tickets: {
    start: (t) => { t.status = "in progress"; },
    resolve: (t) => { t.status = "closed"; },
  },
  kyc: {
    approve: (k) => {
      must(!k.restricted, "This country is on the restricted list. Reject the case instead.");
      k.status = "approved"; k.reviewer = currentActor;
      const t = db.traders.find((x) => x.name === k.traderName);
      if (t) t.kyc = "verified";
    },
    reject: (k, b) => {
      k.reason = needReason(b); k.status = "rejected"; k.reviewer = currentActor;
      const t = db.traders.find((x) => x.name === k.traderName);
      if (t) t.kyc = "rejected";
    },
    resubmit: (k, b) => { k.reason = needReason(b); k.status = "resubmit"; k.reviewer = currentActor; },
  },
  payments: {
    recheck: (p) => { if (Number(p.received) > 0) p.webhook = "processed"; },
    "resend-activation": (p) => {
      must(p.status === "paid", "Only paid invoices can activate an account.");
      must(!p.account, "This payment already activated an account. Nothing was changed.");
      const id = `ACC-${2100 + db.accounts.length}`;
      const plan = db.plans.find((x) => x.name === String(p.plan).replace(/^\$/, "")) ?? db.plans[1];
      db.accounts.unshift({ id, traderId: "", traderName: p.traderName, plan: p.plan, stage: STAGE.challenge, startBalance: plan.capital, balance: plan.capital, equity: plan.capital, pnl: 0, dailyLossUsed: 0, drawdownUsed: 0, highWater: plan.capital, targetProgress: 0, tradingDays: 0, rulesSnapshot: `${plan.name} v${plan.planVersion}`, status: "active", version: 1 });
      p.account = id; p.webhook = "processed";
      db.webhooks.filter((w) => w.reference === p.invoiceId && w.status === "failed").forEach((w) => { w.status = "processed"; w.error = ""; });
    },
    refund: (p, b) => {
      const reason = needReason(b);
      must(p.status === "paid", "Only paid invoices can be refunded.");
      requestApproval("refund", String(p.id), `Refund ${p.id} (${p.traderName}): ${reason}`, Number(p.amount));
    },
    dispute: (p, b) => { needReason(b); p.status = "disputed"; },
  },
  webhooks: {
    replay: (w) => {
      must(w.signature === "valid", "A webhook with an invalid signature cannot be replayed.");
      w.status = "processed"; w.error = ""; w.attempts = Number(w.attempts) + 1;
    },
  },
  errors: {
    acknowledge: (e) => { e.status = "acknowledged"; },
    fix: (e) => { e.status = "fixed"; },
  },
  jobs: {
    run: (j) => { j.status = "ok"; j.lastRunAt = new Date().toISOString(); j.durationMs = Math.round(200 + Math.random() * 900); j.lastError = ""; },
  },
  "public-payouts": {
    hide: (p) => { p.status = "hidden"; },
    show: (p) => { p.status = "visible"; },
  },
  ledger: {
    resolve: (m, b) => { needReason(b); m.status = "resolved"; },
  },
  approvals: {
    approve: (a) => {
      must(a.status === "pending", "This request was already decided.");
      must(a.requestedBy !== currentActor, "A different admin must decide this request.", 403);
      a.status = "approved"; a.decidedBy = currentActor;
      if (a.kind === "payout") { const p = find("payouts", String(a.target)); p.status = "approved"; p.secondApprover = currentActor; }
      if (a.kind === "refund") find("payments", String(a.target)).status = "refunded";
      if (a.kind === "override") {
        const r = find("risk", String(a.target)); r.status = "overridden";
        const acc = db.accounts.find((x) => x.id === r.accountId); if (acc) acc.status = "active";
      }
    },
    reject: (a, b) => {
      must(a.status === "pending", "This request was already decided.");
      must(a.requestedBy !== currentActor, "A different admin must decide this request.", 403);
      needReason(b);
      a.status = "rejected"; a.decidedBy = currentActor;
      if (a.kind === "payout") { const p = find("payouts", String(a.target)); p.status = "rejected"; p.reason = String(b.reason); }
    },
  },
  emails: {
    "test-send": (t, b) => {
      const to = String(b.to ?? "").trim();
      must(/^\S+@\S+\.\S+$/.test(to), "Enter a valid email address.", 400);
      db["email-log"].unshift({ id: `EL-${++counters.el}`, template: t.template, to, status: "delivered", providerId: `re_${rid().slice(4)}`, error: "", sentAt: new Date().toISOString() });
    },
  },
  "email-log": {
    retry: (e) => { must(["failed", "bounced"].includes(String(e.status)), "Only failed emails can be retried."); e.status = "sent"; e.error = ""; },
  },
  announcements: {
    publish: (a) => { a.status = "published"; a.publishedAt = new Date().toISOString(); },
    unpublish: (a) => { a.status = "draft"; },
  },
  markets: {
    halt: (m, b) => { needReason(b); m.status = "halted"; },
    resume: (m) => { must(m.verified === true, "Verify the market before enabling it."); m.status = "enabled"; },
    verify: (m) => { m.verified = true; },
  },
  affiliates: {
    suspend: (a, b) => { needReason(b); a.status = "suspended"; },
    restore: (a) => { a.status = "active"; },
  },
  "alert-history": {
    acknowledge: (a) => { a.status = "acknowledged"; },
  },
};

// Read-only resources: created and changed only by the system or by row actions
const READ_ONLY = new Set([
  "traders", "accounts", "activity", "fills", "fees", "risk", "payments", "payouts", "affiliate-payouts", "audit-logs", "kyc",
  "ledger", "ledger-runs", "webhooks", "errors", "jobs", "public-payouts", "approvals", "email-log", "health", "incidents",
  "feed", "backups", "alert-history", "staff-sessions", "referrals", "ticket-messages", "issuance",
]);
const NO_DELETE = new Set(["markets", "plans", "notes"]);
const PREFIX: Record<string, string> = { coupons: "CP", announcements: "ANN", emails: "EM", competitions: "CMP", plans: "PL", alerts: "AL", affiliates: "AFF", markets: "MKT", notes: "NT" };
const PLAN_RULE_FIELDS = ["profitTarget", "dailyLoss", "maxLoss", "profitSplit", "minDays", "maxLeverage"];

const changedOnly = (before: Row, after: Row) => {
  const b: Row = {};
  const a: Row = {};
  Object.keys(after).forEach((k) => {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
      b[k] = before[k];
      a[k] = after[k];
    }
  });
  return [b, a] as const;
};

function runAction(resource: string, row: Row, action: string, body: Row) {
  const handler = ACTIONS[resource]?.[action];
  if (!handler) throw fail("Unknown action.", 404, "not_found");
  const before = { ...row };
  handler(row, body);
  bump(row);
  const [b, a] = changedOnly(before, row);
  const manual = resource === "accounts" ? "Manual override: " : "";
  appendAudit(`${manual}${resource} ${action}`, String(row.id), { before: b, after: a, reason: String(body.reason ?? "") });
  emit(resource);
}

/* ───────────────────────── Auth ───────────────────────── */

function handleAuth(action: string, body: Row, method: string) {
  if (action === "login") {
    const email = String(body.email ?? "").toLowerCase();
    if ((failedLogins[email] ?? 0) >= 5) throw fail("Too many attempts. Try again in 15 minutes.", 429, "rate_limited");
    const user = staff.find((s) => String(s.email).toLowerCase() === email && s.password === body.password && s.status === "active");
    if (!user) {
      failedLogins[email] = (failedLogins[email] ?? 0) + 1;
      appendAudit("Failed sign-in", email, { actor: email || "unknown", result: "denied" });
      // One message for every failure, so nobody can learn which emails exist
      throw fail("Sign-in failed. Check your details or contact the super admin.", 401, "bad_credentials");
    }
    failedLogins[email] = 0;
    return { challengeId: String(user.id) };
  }
  if (action === "verify-2fa") {
    const user = staff.find((s) => s.id === body.challengeId && s.status === "active");
    if (!user || body.code !== MOCK_CODE) throw fail("That code is not correct.", 401, "bad_code");
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, startedAt: Date.now() }));
    user.lastLoginAt = new Date().toISOString();
    saveStaff();
    appendAudit("Signed in", String(user.id), { actor: String(user.email) });
    return { user: toUser(user) };
  }
  if (action === "logout" && method === "POST") {
    const session = readSession();
    const user = staff.find((s) => s.id === session?.id);
    if (user) appendAudit("Signed out", String(user.id), { actor: String(user.email) });
    sessionStorage.removeItem(SESSION_KEY);
    return {};
  }
  // `me` is polled by the console: it refreshes the person's access and tells everyone about active kill switches
  if (action === "me") return { user: toUser(requireStaff()), killSwitches: settings.killSwitches };
  throw fail("Unknown endpoint.", 404, "not_found");
}

/* ───────────────────────── Staff (super admin only) ───────────────────────── */

const cleanGrants = (raw: unknown): Record<string, AccessLevel> => {
  const out: Record<string, AccessLevel> = {};
  Object.entries((raw ?? {}) as Record<string, string>).forEach(([k, v]) => {
    if ((v === "view" || v === "manage") && k !== "staff") out[k] = v; // the staff section can never be granted
  });
  return out;
};
const cleanRights = (raw: unknown) => ((raw ?? []) as string[]).filter((r) => RIGHT_KEYS.includes(r));

function handleStaff(me: Row, method: string, id: string | undefined, action: string | undefined, body: Row, q: URLSearchParams) {
  authorize(me, "staff", method !== "GET");
  if (!id) {
    if (method === "GET") return listRows("staff", q);
    const email = String(body.email ?? "").trim().toLowerCase();
    must(String(body.name ?? "").trim().length > 1, "Enter the person's name.", 400);
    must(/^\S+@\S+\.\S+$/.test(email), "Enter a valid email address.", 400);
    must(String(body.password ?? "").length >= 8, "The temporary password needs at least 8 characters.", 400);
    must(!staff.some((s) => String(s.email).toLowerCase() === email), "A staff member with this email already exists.");
    must(body.role === "admin" || body.role === "moderator", "There can only be one super admin.", 403);
    const row: Row = {
      id: `ST-${++counters.st}`, name: String(body.name).trim(), email, password: String(body.password), role: body.role, status: "active",
      grants: cleanGrants(body.grants), rights: cleanRights(body.rights), protected: false, createdBy: me.email, createdAt: new Date().toISOString(),
      lastLoginAt: "", version: 1, twoFactor: "setup required",
    };
    staff.push(row);
    saveStaff();
    appendAudit("Created staff member", String(row.id), { after: { email, role: row.role, grants: row.grants, rights: row.rights } });
    emit("staff");
    return publicStaff(row);
  }

  const target = staff.find((s) => s.id === id);
  if (!target) throw fail("Staff member not found.", 404, "not_found");
  const guard = (message: string) => {
    appendAudit(`Blocked change to ${target.email}`, id, { result: "denied", reason: message });
    throw fail(message, 403, "protected");
  };

  if (method === "DELETE") {
    if (target.protected) guard("The super admin cannot be deleted.");
    if (target.id === me.id) throw fail("You cannot delete your own account.", 409, "self_delete");
    staff = staff.filter((s) => s.id !== id);
    saveStaff();
    appendAudit("Deleted staff member", id, { before: { email: target.email, role: target.role } });
    emit("staff");
    return {};
  }

  if (method === "PATCH") {
    if (target.protected) guard("The super admin cannot be changed.");
    if (body.ifVersion !== undefined && Number(body.ifVersion) !== Number(target.version)) throw fail("This record was changed by someone else. Reload and try again.", 409, "version_conflict");
    must(body.role === undefined || body.role === "admin" || body.role === "moderator", "There can only be one super admin.", 403);
    const before = { role: target.role, status: target.status, grants: target.grants, rights: target.rights };
    if (body.name !== undefined) target.name = String(body.name).trim();
    if (body.role !== undefined) target.role = body.role;
    if (body.grants !== undefined) target.grants = cleanGrants(body.grants);
    if (body.rights !== undefined) target.rights = cleanRights(body.rights);
    bump(target);
    saveStaff();
    const [b, a] = changedOnly(before, { role: target.role, status: target.status, grants: target.grants, rights: target.rights });
    appendAudit("Changed staff access", id, { before: b, after: a });
    emit("staff");
    emit("me");
    return publicStaff(target);
  }

  if (method === "POST" && action) {
    if (target.protected) guard("The super admin cannot be changed.");
    if (action === "suspend") target.status = "suspended";
    else if (action === "restore") target.status = "active";
    else if (action === "force-logout") { target.forcedOutAt = Date.now(); db["staff-sessions"] = db["staff-sessions"].filter((s) => s.staffId !== id); }
    else if (action === "reset-2fa") target.twoFactor = "setup required";
    else if (action === "reset-password") {
      must(String(body.password ?? "").length >= 8, "The password needs at least 8 characters.", 400);
      target.password = String(body.password);
      target.forcedOutAt = Date.now();
    } else throw fail("Unknown action.", 404, "not_found");
    if (action === "suspend") target.forcedOutAt = Date.now();
    bump(target);
    saveStaff();
    appendAudit(`Staff ${action}`, id, { reason: String(body.reason ?? "") });
    emit("staff");
    return publicStaff(target);
  }
  throw fail("Unknown endpoint.", 404, "not_found");
}

/* ───────────────────────── Settings ───────────────────────── */

function saveSettingsSection(me: Row, section: string, body: Row) {
  authorize(me, "settings", true);
  if (!can(toUser(me), "settings.edit")) throw fail("You do not have the right to edit settings.", 403, "missing_right");
  const current = settings.sections[section];
  if (!current) throw fail("Unknown settings section.", 404, "not_found");
  const reason = needReason(body);
  if (Number(body.ifVersion) !== settings.version) throw fail("Settings were changed by someone else. Reload and try again.", 409, "version_conflict");
  const values = (body.values ?? {}) as Record<string, string | number>;
  Object.entries(values).forEach(([k, v]) => {
    must(k in current, `Unknown setting: ${k}.`, 400);
    if (typeof current[k] === "number") must(Number.isFinite(Number(v)) && Number(v) >= 0, `${k} must be a number of zero or more.`, 400);
  });
  if (section === "payouts") must(Number(values.profitSplit ?? current.profitSplit) <= 100, "Profit split cannot be above 100%.", 400);
  const before = { ...current };
  Object.entries(values).forEach(([k, v]) => { current[k] = typeof current[k] === "number" ? Number(v) : String(v); });
  settings.version += 1;
  const [b, a] = changedOnly(before, current);
  settings.history.unshift({ id: `SC-${settings.version}`, version: settings.version, section, changedBy: me.email, at: new Date().toISOString(), reason, before: b, after: a });
  appendAudit(`Changed setting ${section}`, "settings", { before: b, after: a, reason });
  emit("settings");
  return {};
}

/* ───────────────────────── Website content (FAQ and Rules) ───────────────────────── */

function handleContent(me: Row, method: string, key: ContentKey, action: string | undefined, body: Row) {
  authorize(me, "content", method !== "GET");
  if (key !== "faq" && key !== "rules") throw fail("Unknown content key.", 404, "not_found");
  const all = readMockContent();
  const rec: ContentRecord = all[key] ?? { key, published: null, draft: null, version: 0, publishedAt: null, history: [] };
  if (method === "GET") return rec;

  const save = (message: string) => {
    all[key] = rec;
    writeMockContent(all);
    appendAudit(message, `content:${key}`, { reason: String(body.note ?? "") });
    emit("content");
  };
  if (method === "PUT") {
    must(!!body.data && typeof body.data === "object", "Nothing to save.", 400);
    rec.draft = body.data;
    save(`Saved ${key} draft`);
  } else if (action === "publish") {
    must(!!rec.draft, "There is no draft to publish.");
    rec.version += 1;
    rec.published = rec.draft;
    rec.publishedAt = new Date().toISOString();
    rec.history.unshift({ version: rec.version, savedAt: rec.publishedAt, savedBy: String(me.email), note: String(body.note ?? ""), data: rec.draft });
    rec.history = rec.history.slice(0, 10);
    rec.draft = null;
    save(`Published ${key}`);
  } else if (action === "discard") {
    rec.draft = null;
    save(`Discarded ${key} draft`);
  } else if (action === "restore") {
    const old = rec.history.find((h) => h.version === Number(body.version));
    must(!!old, "That version was not found.", 404);
    rec.draft = old!.data;
    save(`Restored ${key} version ${body.version} as a draft`);
  } else throw fail("Unknown action.", 404, "not_found");
  return rec;
}

/* ───────────────────────── Router ───────────────────────── */

export async function mockRequest<T>(path: string, options: Options = {}): Promise<T> {
  await wait(180);
  const url = new URL(path, "http://mock.local");
  const method = (options.method ?? "GET").toUpperCase();
  const body = (options.body ?? {}) as Row;
  const [resource, a, b, c] = url.pathname.replace(/^\/admin\//, "").split("/").map(decodeURIComponent);
  const q = url.searchParams;

  if (resource === "auth") return handleAuth(a, body, method) as T;

  // Everything below needs a valid, still-allowed session
  const me = requireStaff();
  const user = toUser(me);

  if (resource === "overview") return overview(me) as T;
  if (resource === "notifications") return { items: notifications(me) } as T;
  if (resource === "search") return { items: search(me, q.get("q") ?? "") } as T;
  if (resource === "staff") return handleStaff(me, method, a, b, body, q) as T;
  if (resource === "content") return handleContent(me, method, a as ContentKey, b, body) as T;

  if (resource === "settings") {
    authorize(me, "settings", method !== "GET");
    if (method === "PUT") return saveSettingsSection(me, a, body) as T;
    if (a === "kill-switch" && method === "POST") {
      if (!can(user, "settings.kill_switch")) throw fail("You do not have the right to use kill switches.", 403, "missing_right");
      const reason = needReason(body);
      const key = String(body.key);
      must(key in settings.killSwitches, "Unknown kill switch.", 400);
      settings.killSwitches[key] = !!body.on;
      settings.version += 1;
      appendAudit(`Kill switch ${key} ${body.on ? "ON" : "OFF"}`, "settings", { reason });
      emit("settings");
      return {} as T;
    }
    return { version: settings.version, sections: settings.sections, killSwitches: settings.killSwitches, history: settings.history.slice(0, 30) } as T;
  }

  if (resource === "operations" || resource === "reserves" || resource === "reports") {
    authorize(me, resource, false);
    if (resource === "reports") {
      return reports(q.get("from"), q.get("to")) as T;
    }
    return (resource === "operations" ? operations() : reserves()) as T;
  }

  // ----- special routes -----
  if (resource === "accounts" && b === "equity") { authorize(me, "accounts", false); return equityCurve(find("accounts", a)) as T; }
  if (resource === "payouts" && b === "checks") { authorize(me, "payouts", false); return { items: payoutChecks(find("payouts", a)) } as T; }
  if (resource === "plans" && b === "impact") {
    authorize(me, "plans", false);
    const plan = find("plans", a);
    const active = db.accounts.filter((x) => String(x.plan).includes(String(Number(plan.capital) / 1000)) && x.status === "active").length;
    return { items: [
      { label: "Active accounts on this plan", ok: true, detail: String(active) },
      { label: "Accounts changed by an edit", ok: true, detail: "0. Each account keeps its own rules snapshot, so edits only affect new purchases." },
      { label: "Current rules version", ok: true, detail: `v${plan.planVersion}` },
    ] } as T;
  }
  if (resource === "markets" && a === "sync" && method === "POST") {
    authorize(me, "markets", true, "sync");
    if (b === "apply") {
      ["AVAX-PERP", "LINK-PERP"].forEach((symbol, i) => {
        if (!db.markets.some((m) => m.symbol === symbol)) db.markets.push({ id: `MKT-${10 + i}`, symbol, category: "Crypto", maxLeverage: 10, fee: 0.05, tickSize: 0.01, minSize: 0.1, sizeDecimals: 1, priceSource: "Hyperliquid", hours: "24/7", spreadBps: 3, slippageBps: 2, fundingMode: "mirror", staleSeconds: 5, breakerPct: 10, verified: false, status: "disabled", version: 1 });
      });
      const btc = db.markets.find((m) => m.symbol === "BTC-PERP"); if (btc) btc.tickSize = 1;
      appendAudit("Synced markets from Hyperliquid", "markets");
      emit("markets");
      return {} as T;
    }
    const known = db.markets.map((m) => m.symbol);
    return {
      added: ["AVAX-PERP", "LINK-PERP"].filter((s) => !known.includes(s)).map((symbol) => ({ symbol, category: "Crypto", maxLeverage: 10 })),
      changed: known.includes("BTC-PERP") && Number(db.markets[0].tickSize) !== 1 ? [{ symbol: "BTC-PERP", field: "tickSize", from: db.markets[0].tickSize, to: 1 }] : [],
      unchanged: db.markets.length,
    } as T;
  }
  if (resource === "ledger-runs" && a === "run" && method === "POST") {
    authorize(me, "ledger-runs", true);
    const mismatch = Math.random() < 0.4;
    const runId = `RUN-${++counters.run}`;
    db["ledger-runs"].unshift({ id: runId, ranAt: new Date().toISOString(), accountsChecked: db.accounts.length, mismatches: mismatch ? 1 : 0, durationMs: Math.round(600 + Math.random() * 500), status: mismatch ? "mismatch" : "balanced" });
    if (mismatch) db.ledger.unshift({ id: `LM-${Date.now() % 10000}`, runId, accountId: db.accounts[0].id, ledgerBalance: 1000, accountBalance: 998.75, diff: -1.25, note: "Fee entry missing from the account", detectedAt: new Date().toISOString(), status: "mismatch", version: 1 });
    appendAudit("Ran ledger reconciliation", runId);
    emit("ledger");
    emit("ledger-runs");
    return {} as T;
  }
  if (resource === "audit-logs" && a === "verify" && method === "POST") {
    authorize(me, "audit-logs", false);
    const list = [...db["audit-logs"]].reverse(); // oldest first
    let previous = "";
    for (const [i, e] of list.entries()) {
      const expected = hashString(`${e.prevHash}|${e.id}|${e.actor}|${e.action}|${e.target}|${e.createdAt}`);
      if (e.hash !== expected || (i > 0 && e.prevHash !== previous)) return { ok: false, checked: i, brokenAt: e.id } as T;
      previous = String(e.hash);
    }
    return { ok: true, checked: list.length } as T;
  }
  if (resource === "health" && a === "check" && method === "POST") {
    authorize(me, "health", true);
    db.health.forEach((h) => { h.checkedAt = new Date().toISOString(); h.latencyMs = Math.max(2, Number(h.latencyMs) + Math.round((Math.random() - 0.5) * 20)); });
    emit("health");
    return {} as T;
  }
  if (resource === "tickets" && b === "reply" && method === "POST") {
    authorize(me, "tickets", true, "reply");
    const ticket = find("tickets", a);
    must(String(body.body ?? "").trim().length > 0, "Write a reply first.", 400);
    db["ticket-messages"].push({ id: `TM-${++counters.tm}`, ticketId: a, author: me.email, role: "staff", body: String(body.body).trim(), internal: !!body.internal, createdAt: new Date().toISOString() });
    if (!body.internal && ticket.status === "open") ticket.status = "in progress";
    appendAudit(body.internal ? "Added internal ticket note" : "Replied to ticket", a);
    emit("tickets");
    emit("ticket-messages");
    return {} as T;
  }
  if (resource === "issuance" && method === "POST") {
    authorize(me, "issuance", true);
    const reason = needReason(body);
    const plan = db.plans.find((p) => p.id === body.planId) ?? db.plans[0];
    const accountId = `ACC-${2100 + db.accounts.length}`;
    db.accounts.unshift({ id: accountId, traderId: "", traderName: body.traderName, plan: `$${Number(plan.capital) / 1000}K`, stage: body.stage, startBalance: plan.capital, balance: plan.capital, equity: plan.capital, pnl: 0, dailyLossUsed: 0, drawdownUsed: 0, highWater: plan.capital, targetProgress: 0, tradingDays: 0, rulesSnapshot: `${plan.name} v${plan.planVersion}`, status: "active", version: 1 });
    db.issuance.unshift({ id: `IS-${Date.now() % 10000}`, traderName: body.traderName, plan: plan.name, stage: body.stage, reason, status: "active", issuedAt: new Date().toISOString() });
    appendAudit("Issued account by hand", accountId, { reason });
    emit("accounts");
    emit("issuance");
    return {} as T;
  }

  // ----- bulk and single actions -----
  if (b === "bulk" || a === "bulk") {
    const action = a === "bulk" ? b : c;
    authorize(me, resource, true, action);
    const ids = (body.ids ?? []) as string[];
    let done = 0;
    let firstError: unknown;
    ids.forEach((id) => {
      try { runAction(resource, find(resource, id), action, body); done += 1; } catch (e) { firstError ??= e; }
    });
    if (done === 0 && firstError) throw firstError;
    return { done, failed: ids.length - done } as T;
  }
  if (method === "POST" && a && b) {
    authorize(me, resource, true, b);
    runAction(resource, find(resource, a), b, body);
    return {} as T;
  }

  // ----- plain list, export, create, update, delete -----
  authorize(me, resource, method !== "GET");
  if (method === "GET" && a === "export") {
    if (resource === "audit-logs" && !can(user, "audit.export")) throw fail("You do not have the right to export audit logs.", 403, "missing_right");
    return { items: filtered(resource, q) } as T;
  }
  if (method === "GET") return listRows(resource, q) as T;

  if (READ_ONLY.has(resource) && !(resource === "ticket-messages")) throw fail("This record is created by the system. Use its actions instead.", 405, "read_only");
  const list = db[resource];
  if (!list) throw fail("Unknown resource.", 404, "not_found");

  if (method === "POST") {
    if (resource === "markets") throw fail("Markets are added by syncing from Hyperliquid.", 405, "read_only");
    const row: Row = { ...body, id: `${PREFIX[resource] ?? "ID"}-${Math.floor(100 + Math.random() * 900)}`, version: 1 };
    if (resource === "notes") Object.assign(row, { author: me.email, createdAt: new Date().toISOString() });
    if (resource === "plans") row.planVersion = 1;
    list.unshift(row);
    appendAudit(`Created ${resource}`, String(row.id), { after: row });
    emit(resource);
    return row as T;
  }

  const row = find(resource, a);
  if (method === "PATCH") {
    if (resource === "notes") throw fail("Notes cannot be edited.", 405, "read_only");
    if (body.ifVersion !== undefined && Number(body.ifVersion) !== Number(row.version)) throw fail("This record was changed by someone else. Reload and try again.", 409, "version_conflict");
    const before = { ...row };
    const { ifVersion: _i, id: _id, version: _v, ...changes } = body; // eslint-disable-line @typescript-eslint/no-unused-vars
    // An unverified market can never go live
    if (resource === "markets" && changes.status === "enabled" && row.verified !== true) throw fail("Verify the market before enabling it.", 409, "conflict");
    Object.assign(row, changes);
    if (resource === "plans" && PLAN_RULE_FIELDS.some((f) => JSON.stringify(before[f]) !== JSON.stringify(row[f]))) row.planVersion = Number(row.planVersion) + 1;
    bump(row);
    const [bf, af] = changedOnly(before, row);
    appendAudit(`Updated ${resource}`, a, { before: bf, after: af });
    emit(resource);
    return row as T;
  }
  if (method === "DELETE") {
    if (NO_DELETE.has(resource)) throw fail("This record cannot be deleted. Change its status instead.", 405, "read_only");
    db[resource] = list.filter((r) => r.id !== a);
    appendAudit(`Deleted ${resource}`, a, { before: row });
    emit(resource);
    return {} as T;
  }
  throw fail("Unknown endpoint.", 404, "not_found");
}
