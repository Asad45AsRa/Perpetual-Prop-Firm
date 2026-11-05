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
let tradeCounter = 4;

// Every few seconds a trade changes or appears, so the console visibly updates by itself
export function startMockSimulation() {
  const timer = setInterval(() => {
    const trades = db.activity;
    if (Math.random() < 0.3) {
      const trader = db.traders[Math.floor(Math.random() * db.traders.length)];
      trades.unshift({
        id: `TR-${++tradeCounter}`,
        traderName: trader.name,
        market: MARKETS[Math.floor(Math.random() * MARKETS.length)],
        side: Math.random() < 0.5 ? "long" : "short",
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

const db = {
  traders: [
    { id: "T-1", name: "Ahmed Raza", email: "ahmed@example.com", status: "active", accounts: 1, joinedAt: ago(60 * 24 * 40) },
    { id: "T-2", name: "Sarah Miller", email: "sarah@example.com", status: "active", accounts: 2, joinedAt: ago(60 * 24 * 25) },
    { id: "T-3", name: "Daniel Lee", email: "daniel@example.com", status: "active", accounts: 1, joinedAt: ago(60 * 24 * 12) },
    { id: "T-4", name: "Ayesha Khan", email: "ayesha@example.com", status: "suspended", accounts: 0, joinedAt: ago(60 * 24 * 3) },
  ] as Row[],
  accounts: [
    { id: "ACC-1001", traderName: "Ahmed Raza", plan: "Challenge 10K", balance: 10084, status: "active" },
    { id: "ACC-1002", traderName: "Sarah Miller", plan: "Funded 50K", balance: 51350, status: "active" },
    { id: "ACC-1003", traderName: "Sarah Miller", plan: "Challenge 25K", balance: 24800, status: "active" },
    { id: "ACC-1004", traderName: "Daniel Lee", plan: "Challenge 10K", balance: 9962, status: "breached" },
  ] as Row[],
  activity: [
    { id: "TR-1", traderName: "Ahmed Raza", market: "BTC-PERP", side: "long", pnl: 84, openedAt: ago(12) },
    { id: "TR-2", traderName: "Sarah Miller", market: "ETH-PERP", side: "short", pnl: 135, openedAt: ago(35) },
    { id: "TR-3", traderName: "Daniel Lee", market: "SOL-PERP", side: "long", pnl: -38, openedAt: ago(90) },
  ] as Row[],
  payouts: [
    { id: "PO-501", traderName: "Sarah Miller", amount: 1080, status: "pending", requestedAt: ago(60 * 5) },
    { id: "PO-502", traderName: "Daniel Lee", amount: 552, status: "approved", requestedAt: ago(60 * 30) },
    { id: "PO-503", traderName: "Ahmed Raza", amount: 432, status: "paid", requestedAt: ago(60 * 80) },
  ] as Row[],
  tickets: [
    { id: "TK-210", traderName: "Sarah Miller", subject: "Cannot see account", status: "open", createdAt: ago(45) },
    { id: "TK-211", traderName: "Ahmed Raza", subject: "Rule question", status: "open", createdAt: ago(200) },
    { id: "TK-207", traderName: "Daniel Lee", subject: "Login issue", status: "solved", createdAt: ago(60 * 30) },
  ] as Row[],
  risk: [
    { id: "RK-1", accountId: "ACC-1004", traderName: "Daniel Lee", rule: "Max daily loss", status: "open", detectedAt: ago(70) },
    { id: "RK-2", accountId: "ACC-1002", traderName: "Sarah Miller", rule: "Consistency rule", status: "resolved", detectedAt: ago(60 * 26) },
  ] as Row[],
  payments: [
    { id: "PAY-901", traderName: "Ahmed Raza", amount: 55, method: "Card", status: "paid", createdAt: ago(60 * 24 * 40) },
    { id: "PAY-902", traderName: "Sarah Miller", amount: 99, method: "Crypto", status: "paid", createdAt: ago(60 * 24 * 25) },
    { id: "PAY-903", traderName: "Daniel Lee", amount: 4, method: "Card", status: "paid", createdAt: ago(60 * 24 * 12) },
    { id: "PAY-904", traderName: "Ayesha Khan", amount: 55, method: "Card", status: "failed", createdAt: ago(60 * 24 * 3) },
  ] as Row[],
  affiliatePayouts: [
    { id: "AP-11", affiliateName: "Bilal Ahmed", amount: 240, status: "pending", requestedAt: ago(60 * 9) },
    { id: "AP-10", affiliateName: "Zara Ali", amount: 120, status: "paid", requestedAt: ago(60 * 60) },
  ] as Row[],
  staff: [
    { id: "u1", name: "Hafiz Hassan", email: "admin@perpeye.com", role: "admin" },
    { id: "u2", name: "Sara", email: "mod@perpeye.com", role: "moderator" },
  ] as Row[],
};

// Static demo lists (read-only pages)
const lists: Record<string, Row[]> = {
  operations: [
    { id: "o1", metric: "Average payout review time", value: "3.2 hours", period: "Last 7 days" },
    { id: "o2", metric: "Ticket first response", value: "18 minutes", period: "Last 7 days" },
    { id: "o3", metric: "Challenge pass rate", value: "11%", period: "Last 30 days" },
  ],
  markets: [
    { id: "m1", symbol: "BTC-PERP", status: "active", maxLeverage: 20, spread: 0.5 },
    { id: "m2", symbol: "ETH-PERP", status: "active", maxLeverage: 20, spread: 0.4 },
    { id: "m3", symbol: "SOL-PERP", status: "active", maxLeverage: 10, spread: 0.6 },
  ],
  issuance: [
    { id: "IS-31", traderName: "Ahmed Raza", plan: "Challenge 10K", status: "active", issuedAt: ago(60 * 24 * 40) },
    { id: "IS-32", traderName: "Sarah Miller", plan: "Funded 50K", status: "active", issuedAt: ago(60 * 24 * 8) },
  ],
  plans: [
    { id: "p1", name: "Challenge 10K", price: 55, profitTarget: 8, status: "active" },
    { id: "p2", name: "Challenge 25K", price: 99, profitTarget: 8, status: "active" },
    { id: "p3", name: "Challenge 100K", price: 399, profitTarget: 10, status: "draft" },
  ],
  affiliates: [
    { id: "af1", name: "Bilal Ahmed", email: "bilal@example.com", referrals: 14, earnings: 840, status: "active" },
    { id: "af2", name: "Zara Ali", email: "zara@example.com", referrals: 6, earnings: 360, status: "active" },
  ],
  coupons: [
    { id: "c1", code: "WELCOME10", discount: 10, uses: 42, status: "active", expiresAt: ahead(30) },
    { id: "c2", code: "EID25", discount: 25, uses: 120, status: "expired", expiresAt: ago(60 * 24 * 10) },
  ],
  reserves: [
    { id: "r1", label: "Payout reserve", amount: 25000, status: "healthy", updatedAt: ago(30) },
    { id: "r2", label: "Operating reserve", amount: 8000, status: "warning", updatedAt: ago(30) },
  ],
  announcements: [
    { id: "an1", title: "New markets added", audience: "All traders", status: "published", publishedAt: ago(60 * 24 * 2) },
    { id: "an2", title: "Scheduled maintenance", audience: "All traders", status: "draft", publishedAt: "" },
  ],
  emails: [
    { id: "e1", subject: "Welcome to Perpeye", audience: "New traders", status: "sent", sentAt: ago(60 * 24) },
    { id: "e2", subject: "Payout approved", audience: "Trader", status: "sent", sentAt: ago(60 * 3) },
  ],
  cms: [
    { id: "cm1", page: "Home", status: "published", updatedBy: "Hafiz", updatedAt: ago(60 * 24 * 3) },
    { id: "cm2", page: "FAQ", status: "draft", updatedBy: "Sara", updatedAt: ago(60 * 5) },
  ],
  competitions: [
    { id: "cp1", name: "November Trading Cup", prizePool: 5000, status: "live", endsAt: ahead(14) },
    { id: "cp2", name: "October Sprint", prizePool: 2000, status: "closed", endsAt: ago(60 * 24 * 6) },
  ],
  health: [
    { id: "h1", service: "Trading engine", status: "healthy", latencyMs: 42, checkedAt: ago(1) },
    { id: "h2", service: "Payments", status: "healthy", latencyMs: 120, checkedAt: ago(1) },
    { id: "h3", service: "Email provider", status: "warning", latencyMs: 640, checkedAt: ago(1) },
  ],
  "audit-logs": [
    { id: "a1", actor: "admin@perpeye.com", action: "Approved payout", target: "PO-502", createdAt: ago(60 * 3) },
    { id: "a2", actor: "mod@perpeye.com", action: "Resolved ticket", target: "TK-207", createdAt: ago(60 * 20) },
  ],
  settings: [
    { id: "s1", key: "Max daily loss %", value: "5", updatedAt: ago(60 * 24 * 9) },
    { id: "s2", key: "Profit split %", value: "80", updatedAt: ago(60 * 24 * 9) },
  ],
};

/* ───────────────────────── Overview (computed from the data above) ───────────────────────── */

function overview() {
  const count = (rows: Row[], status: string) => rows.filter((r) => r.status === status).length;
  const live = db.activity[0];
  const account = db.accounts.find((a) => a.traderName === live?.traderName);
  return {
    stats: {
      traders: db.traders.length,
      activeAccounts: count(db.accounts, "active"),
      pendingPayouts: count(db.payouts, "pending"),
      challengeRevenue: db.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0),
      openTickets: count(db.tickets, "open"),
      riskBreaches: count(db.risk, "open"),
      pendingAffiliatePayouts: count(db.affiliatePayouts, "pending"),
    },
    liveTrader: live
      ? {
          name: String(live.traderName),
          accountId: String(account?.id ?? "-"),
          equity: Number(account?.balance ?? 0),
          pnl: Number(live.pnl),
        }
      : null,
    recentPayouts: db.payouts.slice(0, 3),
    recentActivity: db.activity.slice(0, 3),
    recentTickets: db.tickets.slice(0, 3),
  };
}

/* ───────────────────────── Request router ───────────────────────── */

export async function mockRequest<T>(path: string, options: Options = {}): Promise<T> {
  await wait(250); // small delay so loading states are visible
  const method = (options.method ?? "GET").toUpperCase();
  const route = path.replace(/^\/admin\//, "");
  const body = (options.body ?? {}) as Record<string, string>;

  if (method === "POST") {
    if (route === "auth/login") {
      const user = USERS.find((u) => u.email === String(body.email).toLowerCase() && u.password === body.password);
      if (!user) throw fail("Incorrect email or password.", 401);
      return { challengeId: user.id } as T;
    }
    if (route === "auth/verify-2fa") {
      const user = USERS.find((u) => u.id === body.challengeId);
      if (!user || body.code !== MOCK_CODE) throw fail("Wrong code. Check your authenticator app and try again.", 401);
      const { password: _password, ...safeUser } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
      return { user: safeUser } as T;
    }
    if (route === "auth/logout") return undefined as T;

    // POST payouts/:id/approve | reject
    const payoutMatch = route.match(/^payouts\/([^/]+)\/(approve|reject)$/);
    if (payoutMatch) {
      const payout = db.payouts.find((p) => p.id === decodeURIComponent(payoutMatch[1]));
      if (!payout) throw fail("Payout not found.", 404);
      payout.status = payoutMatch[2] === "approve" ? "approved" : "rejected";
      emit("payouts");
      return { ok: true } as T;
    }
  }

  if (method === "GET") {
    if (route === "overview") return overview() as T;
    if (route === "payouts") return { items: db.payouts } as T;
    if (route === "staff") return { items: db.staff } as T;
    if (route === "traders") return { items: db.traders } as T;
    if (route === "accounts") return { items: db.accounts } as T;
    if (route === "activity") return { items: db.activity } as T;
    if (route === "tickets") return { items: db.tickets } as T;
    if (route === "risk") return { items: db.risk } as T;
    if (route === "payments") return { items: db.payments } as T;
    if (route === "affiliate-payouts") return { items: db.affiliatePayouts } as T;
    if (lists[route]) return { items: lists[route] } as T;
  }

  throw fail(`Not found: ${method} ${path}`, 404);
}
