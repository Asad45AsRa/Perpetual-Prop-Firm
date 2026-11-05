// Demo backend for the admin console. It mimics the real API contract exactly
// (same paths, same JSON shapes), so pages cannot tell the difference.
// Data lives in memory and resets when the page reloads.
// Remove this file once the real backend is connected (and set NEXT_PUBLIC_ADMIN_MOCK=false).

type Row = Record<string, unknown>;
type Options = { method?: string; body?: unknown };

/* ───────────────────────── Demo accounts ───────────────────────── */

export const MOCK_CODE = "123456";

const USERS = [
  { id: "u1", name: "Hafiz", email: "admin@perpeye.com", password: "Admin@123", role: "admin" },
  { id: "u2", name: "Sara (Moderator)", email: "mod@perpeye.com", password: "Mod@123", role: "moderator" },
];

/* ───────────────────────── Helpers ───────────────────────── */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const ahead = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

// Errors carry an HTTP status, like the real `api` helper does
const fail = (message: string, status: number) => Object.assign(new Error(message), { status });

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
let tradeCounter = 1003;

// Every few seconds a trade changes or appears, so the console visibly updates by itself
export function startMockSimulation() {
  const timer = setInterval(() => {
    const trades = db.activity;
    if (Math.random() < 0.3) {
      const trader = db.traders[Math.floor(Math.random() * db.traders.length)];
      trades.unshift({
        id: `ORD-${++tradeCounter}`,
        traderName: trader.name,
        market: MARKETS[Math.floor(Math.random() * MARKETS.length)],
        side: Math.random() < 0.5 ? "long" : "short",
        size: `${(Math.random() * 2 + 0.1).toFixed(2)} units`,
        entry: Math.round(100 + Math.random() * 900),
        status: "open",
        pnl: Math.round((Math.random() - 0.4) * 120),
        openedAt: new Date().toISOString(),
      });
      if (trades.length > 12) trades.pop();
    } else {
      const t = trades[Math.floor(Math.random() * trades.length)];
      t.pnl = Number(t.pnl) + Math.round((Math.random() - 0.5) * 30);
    }
    emit("activity");
  }, 6000);
  return () => clearInterval(timer);
}

/* ───────────────────────── In-memory database ───────────────────────── */

// One array per resource. The key is the endpoint segment: GET /admin/<key>.
const db: Record<string, Row[]> = {
  traders: [
    { id: "TR-1001", name: "Ahmed Raza", email: "ahmed@example.com", country: "Pakistan", accounts: 2, status: "active", joinedAt: ago(60 * 24 * 40) },
    { id: "TR-1002", name: "Sarah Miller", email: "sarah@example.com", country: "United Kingdom", accounts: 1, status: "active", joinedAt: ago(60 * 24 * 25) },
    { id: "TR-1003", name: "Ali Hassan", email: "ali@example.com", country: "UAE", accounts: 3, status: "suspended", joinedAt: ago(60 * 24 * 12) },
    { id: "TR-1004", name: "Daniel Lee", email: "daniel@example.com", country: "Canada", accounts: 1, status: "active", joinedAt: ago(60 * 24 * 3) },
  ],
  accounts: [
    { id: "ACC-2001", traderName: "Ahmed Raza", plan: "$10K", stage: "Phase 1", balance: 10240, equity: 10268, pnl: 268, status: "active" },
    { id: "ACC-2002", traderName: "Sarah Miller", plan: "$25K", stage: "Funded", balance: 26350, equity: 26380, pnl: 1380, status: "active" },
    { id: "ACC-2003", traderName: "Ali Hassan", plan: "$5K", stage: "Phase 1", balance: 4670, equity: 4670, pnl: -330, status: "failed" },
    { id: "ACC-2004", traderName: "Daniel Lee", plan: "$10K", stage: "Funded", balance: 10690, equity: 10710, pnl: 710, status: "active" },
  ],
  activity: [
    { id: "ORD-1001", traderName: "Ahmed Raza", market: "BTC-PERP", side: "long", size: "0.10 BTC", entry: 99240, pnl: 84, status: "open", openedAt: ago(12) },
    { id: "ORD-1002", traderName: "Sarah Miller", market: "ETH-PERP", side: "short", size: "1.50 ETH", entry: 3820, pnl: 135, status: "open", openedAt: ago(35) },
    { id: "ORD-1003", traderName: "Daniel Lee", market: "SOL-PERP", side: "long", size: "20 SOL", entry: 189, pnl: -38, status: "closed", openedAt: ago(90) },
  ],
  payouts: [
    { id: "PO-501", traderName: "Sarah Miller", accountId: "ACC-2002", profit: 1350, split: 80, amount: 1080, network: "USDT • TRC20", status: "pending", requestedAt: ago(60 * 5) },
    { id: "PO-502", traderName: "Daniel Lee", accountId: "ACC-2004", profit: 690, split: 80, amount: 552, network: "USDT • ERC20", status: "approved", requestedAt: ago(60 * 30) },
    { id: "PO-503", traderName: "Ahmed Raza", accountId: "ACC-1999", profit: 540, split: 80, amount: 432, network: "USDT • TRC20", status: "paid", requestedAt: ago(60 * 80) },
  ],
  tickets: [
    { id: "TIC-01", traderName: "Ahmed Raza", subject: "Account activation", priority: "high", assigned: "Support Team", status: "open", createdAt: ago(45) },
    { id: "TIC-02", traderName: "Sarah Miller", subject: "Payout question", priority: "medium", assigned: "Finance Team", status: "in progress", createdAt: ago(200) },
    { id: "TIC-03", traderName: "Daniel Lee", subject: "Login issue", priority: "normal", assigned: "Support Team", status: "closed", createdAt: ago(60 * 30) },
  ],
  risk: [
    { id: "RISK-01", traderName: "Ali Hassan", accountId: "ACC-2003", rule: "Max drawdown", level: "high", status: "breached", detectedAt: ago(70) },
    { id: "RISK-02", traderName: "Ahmed Raza", accountId: "ACC-2001", rule: "Exposure warning", level: "medium", status: "review", detectedAt: ago(300) },
    { id: "RISK-03", traderName: "Sarah Miller", accountId: "ACC-2002", rule: "Daily loss headroom", level: "low", status: "healthy", detectedAt: ago(60 * 26) },
  ],
  payments: [
    { id: "PAY-4001", traderName: "Ahmed Raza", plan: "$10K", amount: 59, method: "USDT • TRC20", status: "paid", account: "ACC-2001", createdAt: ago(60 * 24 * 40) },
    { id: "PAY-4002", traderName: "Sarah Miller", plan: "$25K", amount: 99, method: "USDT • ERC20", status: "paid", account: "ACC-2002", createdAt: ago(60 * 24 * 25) },
    { id: "PAY-4003", traderName: "Daniel Lee", plan: "$10K", amount: 59, method: "BTC", status: "pending", account: "", createdAt: ago(60 * 24 * 3) },
  ],
  "affiliate-payouts": [
    { id: "AP-01", affiliateName: "CryptoPartner", amount: 180, network: "USDT • TRC20", status: "pending", requestedAt: ago(60 * 9) },
    { id: "AP-02", affiliateName: "TradeZone", amount: 90, network: "USDT • ERC20", status: "paid", requestedAt: ago(60 * 60) },
  ],
  staff: [
    { id: "ST-01", name: "Hafiz Hassan", email: "admin@perpeye.com", role: "admin", status: "active" },
    { id: "ST-02", name: "Sara", email: "mod@perpeye.com", role: "moderator", status: "active" },
  ],
  markets: [
    { id: "MKT-01", symbol: "BTC-PERP", category: "Crypto", maxLeverage: 20, fee: 0.05, status: "enabled" },
    { id: "MKT-02", symbol: "ETH-PERP", category: "Crypto", maxLeverage: 15, fee: 0.05, status: "enabled" },
    { id: "MKT-03", symbol: "SOL-PERP", category: "Crypto", maxLeverage: 10, fee: 0.05, status: "enabled" },
    { id: "MKT-04", symbol: "GOLD-PERP", category: "Commodities", maxLeverage: 5, fee: 0.05, status: "disabled" },
  ],
  plans: [
    { id: "PL-1", name: "Starter", capital: 5000, price: 39, profitTarget: 8, dailyLoss: 4, maxLoss: 7, status: "active" },
    { id: "PL-2", name: "Growth", capital: 10000, price: 59, profitTarget: 8, dailyLoss: 4, maxLoss: 7, status: "active" },
    { id: "PL-3", name: "Pro", capital: 25000, price: 99, profitTarget: 8, dailyLoss: 4, maxLoss: 7, status: "active" },
  ],
  affiliates: [
    { id: "AFF-01", name: "CryptoPartner", email: "crypto@example.com", code: "CRYPTOP", referrals: 41, commission: 15, earnings: 365, status: "active" },
    { id: "AFF-02", name: "TradeZone", email: "zone@example.com", code: "ZONE15", referrals: 24, commission: 15, earnings: 218, status: "active" },
  ],
  coupons: [
    { id: "CP-01", code: "WELCOME15", discount: 15, uses: 27, maxUses: 100, expiresAt: ahead(60), status: "active" },
    { id: "CP-02", code: "LAUNCH10", discount: 10, uses: 50, maxUses: 50, expiresAt: ago(60 * 24 * 10), status: "expired" },
  ],
  announcements: [
    { id: "ANN-01", title: "Trading platform maintenance", audience: "All Traders", publishedAt: ago(60 * 24 * 2), status: "published" },
    { id: "ANN-02", title: "New market instruments", audience: "Funded Traders", publishedAt: "", status: "draft" },
  ],
  emails: [
    { id: "EM-01", template: "Welcome / Verify Email", trigger: "Signup", channel: "Resend", status: "enabled" },
    { id: "EM-02", template: "Challenge Passed", trigger: "Phase completion", channel: "Resend", status: "enabled" },
    { id: "EM-03", template: "Payout Paid", trigger: "Payout confirmed", channel: "Resend", status: "enabled" },
  ],
  cms: [
    { id: "CMS-01", page: "Homepage FAQ", type: "FAQ", updatedBy: "Hafiz", updatedAt: ago(60 * 24 * 3), status: "published" },
    { id: "CMS-02", page: "Trading Rules", type: "Policy", updatedBy: "Sara", updatedAt: ago(60 * 24 * 5), status: "published" },
  ],
  competitions: [
    { id: "CMP-01", name: "November Trading Sprint", participants: 0, prize: "Demo reward", endsAt: ahead(14), status: "draft" },
  ],
  health: [
    { id: "h1", service: "Trading API", status: "healthy", latencyMs: 42, checkedAt: ago(1) },
    { id: "h2", service: "Price feed", status: "healthy", latencyMs: 55, checkedAt: ago(1) },
    { id: "h3", service: "Risk engine", status: "healthy", latencyMs: 38, checkedAt: ago(1) },
    { id: "h4", service: "Email delivery", status: "warning", latencyMs: 640, checkedAt: ago(1) },
    { id: "h5", service: "Payment provider", status: "healthy", latencyMs: 120, checkedAt: ago(1) },
  ],
  issuance: [
    { id: "IS-31", traderName: "Ahmed Raza", plan: "Growth", stage: "Phase 1", reason: "Challenge purchase", status: "active", issuedAt: ago(60 * 24 * 40) },
  ],
  "audit-logs": [
    { id: "LOG-01", actor: "admin@perpeye.com", action: "Updated challenge plan", target: "PL-2", createdAt: ago(60 * 3) },
    { id: "LOG-02", actor: "Risk engine", action: "Account failed: max drawdown", target: "ACC-2003", createdAt: ago(60 * 5) },
  ],
};

// ID prefix used when a record is created through POST /admin/<resource>
const ID_PREFIX: Record<string, string> = {
  traders: "TR", accounts: "ACC", payouts: "PO", tickets: "TIC", risk: "RISK", payments: "PAY", "affiliate-payouts": "AP",
  staff: "ST", markets: "MKT", plans: "PL", affiliates: "AFF", coupons: "CP", announcements: "ANN", emails: "EM",
  cms: "CMS", competitions: "CMP", issuance: "IS",
};

let actor = "admin@perpeye.com"; // set at login, stored in every audit entry

// Every admin write adds a line to the audit log (the real backend must do the same, server side)
function audit(action: string, target: string) {
  db["audit-logs"].unshift({ id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`, actor, action, target, createdAt: new Date().toISOString() });
  db["audit-logs"].length = Math.min(db["audit-logs"].length, 80);
  emit("audit-logs");
}

const sumBy = (rows: Row[], status: string, field = "amount") =>
  rows.filter((r) => r.status === status).reduce((t, r) => t + Number(r[field]), 0);

/* ───────────────────────── Computed endpoints ───────────────────────── */

function overview() {
  const count = (rows: Row[], status: string) => rows.filter((r) => r.status === status).length;
  const live = db.activity[0];
  const account = db.accounts.find((a) => a.traderName === live?.traderName);
  const trader = db.traders.find((t) => t.name === live?.traderName);
  return {
    stats: {
      traders: db.traders.length,
      activeAccounts: count(db.accounts, "active"),
      pendingPayouts: count(db.payouts, "pending"),
      challengeRevenue: sumBy(db.payments, "paid"),
      openTickets: db.tickets.filter((t) => t.status !== "closed").length,
      riskBreaches: count(db.risk, "breached"),
      pendingAffiliatePayouts: count(db["affiliate-payouts"], "pending"),
    },
    liveTrader: live
      ? {
          name: String(live.traderName),
          accountId: String(account?.id ?? "-"),
          equity: Number(account?.equity ?? 0),
          pnl: Number(live.pnl),
          email: String(trader?.email ?? ""),
          plan: String(account?.plan ?? "-"),
          stage: String(account?.stage ?? "-"),
          openPositions: db.activity.filter((a) => a.traderName === live.traderName && a.status === "open").length,
          payoutEligible: db.payouts.filter((p) => p.traderName === live.traderName && p.status !== "paid" && p.status !== "rejected").reduce((t, p) => t + Number(p.amount), 0),
          lifetimePaid: db.payouts.filter((p) => p.traderName === live.traderName && p.status === "paid").reduce((t, p) => t + Number(p.amount), 0),
          trading: trader?.status === "suspended" ? "Suspended" : "Allowed",
        }
      : null,
    recentPayouts: db.payouts.slice(0, 3),
    recentActivity: db.activity.slice(0, 3),
    recentTickets: db.tickets.slice(0, 3),
  };
}

function operations() {
  return {
    kpis: {
      challengeAccounts: db.accounts.filter((a) => a.stage === "Phase 1").length,
      fundedAccounts: db.accounts.filter((a) => a.stage === "Funded").length,
      openRiskEvents: db.risk.filter((r) => r.status === "breached" || r.status === "review").length,
      openTickets: db.tickets.filter((t) => t.status !== "closed").length,
    },
    plans: db.plans,
  };
}

const reserves = () => ({
  pending: sumBy(db.payouts, "pending"),
  approvedUnpaid: sumBy(db.payouts, "approved"),
  paid: sumBy(db.payouts, "paid"),
  rejected: sumBy(db.payouts, "rejected"),
});

const settings = () => {
  const plan = db.plans[1] ?? db.plans[0];
  return {
    riskRules: { dailyLoss: Number(plan?.dailyLoss ?? 0), maxLoss: Number(plan?.maxLoss ?? 0), profitTarget: Number(plan?.profitTarget ?? 0), profitSplit: 80 },
    platform: { name: "Perpeye", markets: `${db.markets.length} shown, 106 planned`, payoutNetwork: "USDT (TRC20)", mode: "Simulated" },
  };
};

/* ───────────────────────── Row actions: POST /admin/<resource>/:id/<action> ───────────────────────── */

const ACTIONS: Record<string, Record<string, (row: Row) => void>> = {
  payouts: {
    approve: (r) => (r.status = "approved"),
    reject: (r) => (r.status = "rejected"),
    paid: (r) => (r.status = "paid"),
  },
  "affiliate-payouts": {
    approve: (r) => (r.status = "approved"),
    reject: (r) => (r.status = "rejected"),
    paid: (r) => (r.status = "paid"),
  },
  accounts: {
    pass: (r) => Object.assign(r, { stage: "Funded", status: "active" }),
    fail: (r) => (r.status = "failed"),
  },
  tickets: {
    start: (r) => (r.status = "in progress"),
    resolve: (r) => (r.status = "closed"),
  },
  traders: {
    suspend: (r) => (r.status = "suspended"),
    unsuspend: (r) => (r.status = "active"),
  },
  risk: {
    resolve: (r) => (r.status = "resolved"),
  },
};

/* ───────────────────────── Request router ───────────────────────── */

export async function mockRequest<T>(path: string, options: Options = {}): Promise<T> {
  await wait(250); // small delay so loading states are visible
  const method = (options.method ?? "GET").toUpperCase();
  const route = path.replace(/^\/admin\//, "");
  const body = (options.body ?? {}) as Row;
  const [resource, id, action] = route.split("/");

  /* auth */
  if (method === "POST" && route === "auth/login") {
    const user = USERS.find((u) => u.email === String(body.email).toLowerCase() && u.password === body.password);
    if (!user) throw fail("Incorrect email or password.", 401);
    return { challengeId: user.id } as T;
  }
  if (method === "POST" && route === "auth/verify-2fa") {
    const user = USERS.find((u) => u.id === body.challengeId);
    if (!user || body.code !== MOCK_CODE) throw fail("Wrong code. Check your authenticator app and try again.", 401);
    actor = user.email;
    const { password: _password, ...safeUser } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    return { user: safeUser } as T;
  }
  if (method === "POST" && route === "auth/logout") return undefined as T;

  /* single computed endpoints */
  if (method === "GET") {
    if (route === "overview") return overview() as T;
    if (route === "operations") return operations() as T;
    if (route === "reserves") return reserves() as T;
    if (route === "settings") return settings() as T;
  }
  if (method === "POST" && route === "health/check") {
    db.health.forEach((h) => Object.assign(h, { latencyMs: Math.round(30 + Math.random() * 120), checkedAt: new Date().toISOString() }));
    audit("Ran health check", "System");
    emit("health");
    return { ok: true } as T;
  }
  if (method === "POST" && route === "issuance") {
    const { traderName, planId, stage, reason } = body as Record<string, string>;
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) throw fail("Plan not found.", 404);
    if (!String(reason ?? "").trim()) throw fail("Enter a reason so the action is logged.", 400);
    const accountId = `ACC-${Math.floor(3000 + Math.random() * 6000)}`;
    db.accounts.unshift({
      id: accountId, traderName, plan: `$${Number(plan.capital) / 1000}K`, stage, balance: plan.capital, equity: plan.capital, pnl: 0, status: "active",
    });
    db.issuance.unshift({ id: `IS-${Math.floor(100 + Math.random() * 900)}`, traderName, plan: plan.name, stage, reason, status: "active", issuedAt: new Date().toISOString() });
    const t = db.traders.find((x) => x.name === traderName);
    if (t) t.accounts = Number(t.accounts) + 1;
    audit(`Issued account (${reason})`, accountId);
    emit();
    return { id: accountId } as T;
  }

  /* generic REST: GET list, POST create, PATCH update, DELETE remove, POST row action */
  const rows = db[resource];
  if (rows && resource !== "audit-logs" && resource !== "health") {
    if (method === "GET" && !id) return { items: rows } as T;

    if (method === "POST" && !id) {
      const prefix = ID_PREFIX[resource] ?? "ID";
      const record: Row = { ...body, id: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}` };
      if (resource === "announcements") record.publishedAt = record.status === "published" ? new Date().toISOString() : "";
      if (resource === "cms") Object.assign(record, { updatedBy: actor, updatedAt: new Date().toISOString() });
      if (resource === "traders") Object.assign(record, { accounts: 0, joinedAt: new Date().toISOString() });
      if (resource === "tickets") record.createdAt = new Date().toISOString();
      if (resource === "affiliates") Object.assign(record, { referrals: 0, earnings: 0 });
      if (resource === "coupons") record.uses = 0;
      if (resource === "competitions") record.participants = 0;
      rows.unshift(record);
      audit(`Created ${resource}`, String(record.id));
      emit(resource);
      return record as T;
    }

    const row = rows.find((r) => r.id === decodeURIComponent(id ?? ""));
    if (id && !row) throw fail("Record not found.", 404);

    if (method === "PATCH" && row) {
      const { id: _ignored, ...changes } = body; // eslint-disable-line @typescript-eslint/no-unused-vars
      Object.assign(row, changes);
      if (resource === "cms") Object.assign(row, { updatedBy: actor, updatedAt: new Date().toISOString() });
      audit(`Edited ${resource}`, String(row.id));
      emit(resource);
      return row as T;
    }
    if (method === "DELETE" && row) {
      db[resource] = rows.filter((r) => r !== row);
      audit(`Deleted ${resource}`, String(row.id));
      emit(resource);
      return { ok: true } as T;
    }
    if (method === "POST" && row && action) {
      const run = ACTIONS[resource]?.[action];
      if (!run) throw fail(`Unknown action: ${action}`, 404);
      run(row);
      audit(`${resource} ${action}`, String(row.id));
      emit(resource);
      return { ok: true } as T;
    }
  }

  // Read-only lists (audit log, health)
  if (method === "GET" && db[route]) return { items: db[route] } as T;

  throw fail(`Not found: ${method} ${path}`, 404);
}
