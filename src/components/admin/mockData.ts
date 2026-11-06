// Demo data for the admin console (used only while NEXT_PUBLIC_ADMIN_MOCK is not "false").
// Remove this file together with mockApi.ts once the real backend is connected.

import { STAGE, explorerUrl } from "./constants";
import { RIGHT_KEYS, type AccessLevel } from "./permissions";

export type Row = Record<string, unknown>;

export const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
export const ahead = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

/* ───────────────────────── Staff ───────────────────────── */

// Every sidebar page key. Used to build the default access of a seeded staff member.
export const ALL_PAGE_KEYS = [
  "overview", "operations", "traders", "accounts", "activity", "risk", "markets", "issuance", "kyc", "ledger",
  "plans", "payments", "payouts", "approvals", "affiliates", "affiliate-payouts", "coupons", "reserves", "public-payouts", "reports",
  "tickets", "announcements", "emails", "cms", "competitions",
  "health", "errors", "webhooks", "jobs", "alerts", "audit-logs", "settings", "staff",
];

const grantAll = (level: AccessLevel, except: string[] = []) =>
  Object.fromEntries(ALL_PAGE_KEYS.filter((k) => !except.includes(k)).map((k) => [k, level])) as Record<string, AccessLevel>;

// The super admin is created automatically on first start. Nobody can edit or delete it.
// In the real backend the credentials come from SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD.
export const seedStaff = (): Row[] => [
  {
    id: "SA-1", name: "Hafiz Hassan", email: "admin@perpeye.com", password: "Admin@123", role: "super_admin", status: "active",
    grants: grantAll("manage"), rights: [...RIGHT_KEYS], protected: true, createdBy: "system", createdAt: ago(60 * 24 * 90),
    lastLoginAt: ago(30), version: 1, twoFactor: "enrolled",
  },
  {
    id: "ST-2", name: "Sara (Moderator)", email: "mod@perpeye.com", password: "Mod@123", role: "moderator", status: "active",
    grants: { overview: "view", traders: "view", accounts: "view", activity: "view", risk: "manage", kyc: "manage", tickets: "manage", announcements: "view" },
    rights: ["risk.review", "tickets.reply", "kyc.review", "traders.suspend"], protected: false, createdBy: "admin@perpeye.com",
    createdAt: ago(60 * 24 * 30), lastLoginAt: ago(60 * 5), version: 1, twoFactor: "enrolled",
  },
  {
    id: "ST-3", name: "Omar (Finance)", email: "finance@perpeye.com", password: "Fin@123", role: "admin", status: "active",
    grants: { ...grantAll("view"), payments: "manage", payouts: "manage", approvals: "manage", "affiliate-payouts": "manage", reserves: "view", staff: "none", settings: "none" },
    rights: ["finance.view", "payout.approve", "approvals.decide", "refund.issue"], protected: false, createdBy: "admin@perpeye.com",
    createdAt: ago(60 * 24 * 20), lastLoginAt: ago(60 * 26), version: 1, twoFactor: "enrolled",
  },
];

/* ───────────────────────── Everything else ───────────────────────── */

export function seedDb(): Record<string, Row[]> {
  const v = { version: 1 };
  return {
    traders: [
      { id: "TR-1001", name: "Ahmed Raza", email: "ahmed@example.com", country: "Pakistan", accounts: 2, status: "active", kyc: "verified", emailVerified: true, riskScore: 22, flags: "", lastLoginAt: ago(40), lastIp: "39.40.12.8", referralSource: "CRYPTOP", joinedAt: ago(60 * 24 * 40), ...v },
      { id: "TR-1002", name: "Sarah Miller", email: "sarah@example.com", country: "United Kingdom", accounts: 1, status: "active", kyc: "verified", emailVerified: true, riskScore: 12, flags: "", lastLoginAt: ago(15), lastIp: "81.2.69.160", referralSource: "direct", joinedAt: ago(60 * 24 * 25), ...v },
      { id: "TR-1003", name: "Ali Hassan", email: "ali@example.com", country: "UAE", accounts: 3, status: "suspended", kyc: "pending", emailVerified: true, riskScore: 81, flags: "multi-account", lastLoginAt: ago(60 * 20), lastIp: "94.200.1.7", referralSource: "ZONE15", joinedAt: ago(60 * 24 * 12), ...v },
      { id: "TR-1004", name: "Daniel Lee", email: "daniel@example.com", country: "Canada", accounts: 1, status: "active", kyc: "verified", emailVerified: true, riskScore: 30, flags: "", lastLoginAt: ago(120), lastIp: "24.114.3.9", referralSource: "direct", joinedAt: ago(60 * 24 * 3), ...v },
      { id: "TR-1005", name: "Mina Park", email: "mina@example.com", country: "South Korea", accounts: 0, status: "active", kyc: "none", emailVerified: false, riskScore: 5, flags: "", lastLoginAt: ago(60 * 48), lastIp: "1.234.5.6", referralSource: "direct", joinedAt: ago(60 * 24), ...v },
      { id: "TR-1006", name: "Omid Rahimi", email: "omid@example.com", country: "Iran", accounts: 0, status: "active", kyc: "pending", emailVerified: true, riskScore: 64, flags: "restricted-country", lastLoginAt: ago(60 * 6), lastIp: "5.200.1.1", referralSource: "direct", joinedAt: ago(60 * 10), ...v },
    ],
    accounts: [
      { id: "ACC-2001", traderId: "TR-1001", traderName: "Ahmed Raza", plan: "$10K", stage: STAGE.challenge, startBalance: 10000, balance: 10240, equity: 10268, pnl: 268, dailyLossUsed: 12, drawdownUsed: 8, highWater: 10268, targetProgress: 33, tradingDays: 6, rulesSnapshot: "Growth v2: target 8%, daily 4%, max 7%", status: "active", ...v },
      { id: "ACC-2002", traderId: "TR-1002", traderName: "Sarah Miller", plan: "$25K", stage: STAGE.funded, startBalance: 25000, balance: 26350, equity: 26380, pnl: 1380, dailyLossUsed: 4, drawdownUsed: 3, highWater: 26380, targetProgress: 100, tradingDays: 21, rulesSnapshot: "Pro v1: daily 4%, max 7%", status: "active", ...v },
      { id: "ACC-2003", traderId: "TR-1003", traderName: "Ali Hassan", plan: "$5K", stage: STAGE.challenge, startBalance: 5000, balance: 4670, equity: 4670, pnl: -330, dailyLossUsed: 55, drawdownUsed: 100, highWater: 5020, targetProgress: 0, tradingDays: 4, rulesSnapshot: "Starter v1: target 8%, daily 4%, max 7%", status: "failed", ...v },
      { id: "ACC-2004", traderId: "TR-1004", traderName: "Daniel Lee", plan: "$10K", stage: STAGE.funded, startBalance: 10000, balance: 10690, equity: 10710, pnl: 710, dailyLossUsed: 9, drawdownUsed: 6, highWater: 10710, targetProgress: 100, tradingDays: 12, rulesSnapshot: "Growth v2: daily 4%, max 7%", status: "active", ...v },
      { id: "ACC-2005", traderId: "TR-1001", traderName: "Ahmed Raza", plan: "$5K", stage: STAGE.challenge, startBalance: 5000, balance: 4890, equity: 4850, pnl: -150, dailyLossUsed: 78, drawdownUsed: 52, highWater: 5030, targetProgress: 0, tradingDays: 2, rulesSnapshot: "Starter v1: target 8%, daily 4%, max 7%", status: "active", ...v },
      { id: "ACC-1999", traderId: "TR-1001", traderName: "Ahmed Raza", plan: "$10K", stage: STAGE.funded, startBalance: 10000, balance: 10540, equity: 10540, pnl: 540, dailyLossUsed: 0, drawdownUsed: 0, highWater: 10540, targetProgress: 100, tradingDays: 30, rulesSnapshot: "Growth v1: daily 4%, max 7%", status: "locked", ...v },
    ],
    activity: [
      { id: "ORD-1001", accountId: "ACC-2001", traderName: "Ahmed Raza", market: "BTC-PERP", side: "long", size: "0.10 BTC", entry: 99240, pnl: 84, status: "open", slippage: 0.02, flag: "", openedAt: ago(12), ...v },
      { id: "ORD-1002", accountId: "ACC-2002", traderName: "Sarah Miller", market: "ETH-PERP", side: "short", size: "1.50 ETH", entry: 3820, pnl: 135, status: "open", slippage: 0.01, flag: "", openedAt: ago(35), ...v },
      { id: "ORD-1003", accountId: "ACC-2004", traderName: "Daniel Lee", market: "SOL-PERP", side: "long", size: "20 SOL", entry: 189, pnl: -38, status: "closed", slippage: 0.03, flag: "", openedAt: ago(90), ...v },
      { id: "ORD-1004", accountId: "ACC-2005", traderName: "Ahmed Raza", market: "BTC-PERP", side: "short", size: "0.30 BTC", entry: 99100, pnl: -72, status: "open", slippage: 0.09, flag: "burst-orders", openedAt: ago(8), ...v },
    ],
    fills: [
      { id: "FIL-1", orderId: "ORD-1001", accountId: "ACC-2001", market: "BTC-PERP", side: "long", price: 99240, size: 0.1, fee: 4.96, slippage: 0.02, bid: 99238, ask: 99242, mark: 99240, filledAt: ago(12) },
      { id: "FIL-2", orderId: "ORD-1002", accountId: "ACC-2002", market: "ETH-PERP", side: "short", price: 3820, size: 1.5, fee: 2.87, slippage: 0.01, bid: 3819.8, ask: 3820.2, mark: 3820, filledAt: ago(35) },
      { id: "FIL-3", orderId: "ORD-1004", accountId: "ACC-2005", market: "BTC-PERP", side: "short", price: 99100, size: 0.3, fee: 14.87, slippage: 0.09, bid: 99098, ask: 99102, mark: 99100, filledAt: ago(8) },
    ],
    fees: [
      { id: "FEE-1", accountId: "ACC-2001", kind: "fee", market: "BTC-PERP", amount: -4.96, at: ago(12) },
      { id: "FEE-2", accountId: "ACC-2002", kind: "fee", market: "ETH-PERP", amount: -2.87, at: ago(35) },
      { id: "FEE-3", accountId: "ACC-2002", kind: "funding", market: "ETH-PERP", amount: 1.12, at: ago(60 * 8) },
      { id: "FEE-4", accountId: "ACC-2001", kind: "funding", market: "BTC-PERP", amount: -0.84, at: ago(60 * 8) },
    ],
    payouts: [
      { id: "PO-501", traderName: "Sarah Miller", accountId: "ACC-2002", profit: 1350, split: 80, amount: 1080, network: "USDT • TRC20", wallet: "TQn9Y2khDGZ…c71", kyc: "verified", txHash: "", explorerUrl: "", confirmations: 0, firstApprover: "", secondApprover: "", reason: "", public: false, openPositions: 0, status: "pending", requestedAt: ago(60 * 5), ...v },
      { id: "PO-502", traderName: "Daniel Lee", accountId: "ACC-2004", profit: 690, split: 80, amount: 552, network: "USDT • ERC20", wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", kyc: "verified", txHash: "", explorerUrl: "", confirmations: 0, firstApprover: "finance@perpeye.com", secondApprover: "", reason: "", public: false, openPositions: 0, status: "approved", requestedAt: ago(60 * 30), ...v },
      { id: "PO-503", traderName: "Ahmed Raza", accountId: "ACC-1999", profit: 540, split: 80, amount: 432, network: "USDT • TRC20", wallet: "TLa2f6VPqDgRE67v1736s7bJ8Cana8LRcu", kyc: "verified", txHash: "9c1f3b0a7d2e4f58a1b6c3d4e5f60718293a4b5c6d7e8f9012a3b4c5d6e7f801", explorerUrl: explorerUrl("USDT • TRC20", "9c1f3b0a7d2e4f58a1b6c3d4e5f60718293a4b5c6d7e8f9012a3b4c5d6e7f801"), confirmations: 21, firstApprover: "admin@perpeye.com", secondApprover: "", reason: "", public: true, openPositions: 0, status: "paid", requestedAt: ago(60 * 80), ...v },
      { id: "PO-504", traderName: "Ali Hassan", accountId: "ACC-2003", profit: 220, split: 80, amount: 176, network: "USDT • TRC20", wallet: "TJ4x…9aa", kyc: "pending", txHash: "", explorerUrl: "", confirmations: 0, firstApprover: "", secondApprover: "", reason: "", public: false, openPositions: 1, duplicateWallet: true, status: "pending", requestedAt: ago(60 * 30), ...v },
    ],
    tickets: [
      { id: "TIC-01", traderName: "Ahmed Raza", subject: "Account activation", priority: "high", assigned: "Support Team", status: "open", createdAt: ago(45), ...v },
      { id: "TIC-02", traderName: "Sarah Miller", subject: "Payout question", priority: "medium", assigned: "Finance Team", status: "in progress", createdAt: ago(200), ...v },
      { id: "TIC-03", traderName: "Daniel Lee", subject: "Login issue", priority: "normal", assigned: "Support Team", status: "closed", createdAt: ago(60 * 30), ...v },
      { id: "TIC-04", traderName: "Mina Park", subject: "Email not verified", priority: "normal", assigned: "Support Team", status: "open", createdAt: ago(60 * 27), ...v },
    ],
    "ticket-messages": [
      { id: "TM-1", ticketId: "TIC-01", author: "Ahmed Raza", role: "trader", body: "I paid for the $10K plan but my account is not active yet.", internal: false, createdAt: ago(45) },
      { id: "TM-2", ticketId: "TIC-02", author: "Sarah Miller", role: "trader", body: "When will my payout be reviewed?", internal: false, createdAt: ago(200) },
      { id: "TM-3", ticketId: "TIC-02", author: "finance@perpeye.com", role: "staff", body: "Reviews usually finish within 24 hours.", internal: false, createdAt: ago(150) },
      { id: "TM-4", ticketId: "TIC-04", author: "Mina Park", role: "trader", body: "The verification email never arrived.", internal: false, createdAt: ago(60 * 27) },
    ],
    risk: [
      { id: "RISK-01", traderName: "Ali Hassan", accountId: "ACC-2003", rule: "Max drawdown", level: "high", threshold: "7%", valueAtBreach: "7.4%", equitySnapshot: 4670, action: "Account failed and locked", source: "engine", status: "breached", detectedAt: ago(70), ...v },
      { id: "RISK-02", traderName: "Ahmed Raza", accountId: "ACC-2005", rule: "Daily loss headroom", level: "medium", threshold: "4%", valueAtBreach: "3.1%", equitySnapshot: 4850, action: "Warning sent", source: "engine", status: "review", detectedAt: ago(300), ...v },
      { id: "RISK-03", traderName: "Sarah Miller", accountId: "ACC-2002", rule: "Exposure", level: "low", threshold: "300%", valueAtBreach: "120%", equitySnapshot: 26380, action: "None", source: "engine", status: "healthy", detectedAt: ago(60 * 26), ...v },
      { id: "RISK-04", traderName: "Ahmed Raza", accountId: "ACC-1999", rule: "Position limit", level: "high", threshold: "20", valueAtBreach: "24", equitySnapshot: 10540, action: "Account locked", source: "engine", status: "breached", detectedAt: ago(60 * 3), ...v },
    ],
    payments: [
      { id: "PAY-4001", traderName: "Ahmed Raza", plan: "$10K", amount: 59, method: "USDT • TRC20", invoiceId: "pl_8f21a", txnId: "7ab1…c3d", coin: "USDT", expected: 59, received: 59, confirmations: 20, webhook: "processed", coupon: "", affiliate: "CRYPTOP", account: "ACC-2001", status: "paid", createdAt: ago(60 * 24 * 40), ...v },
      { id: "PAY-4002", traderName: "Sarah Miller", plan: "$25K", amount: 99, method: "USDT • ERC20", invoiceId: "pl_1c9de", txnId: "0x9e2…b7a", coin: "USDT", expected: 99, received: 99, confirmations: 14, webhook: "processed", coupon: "WELCOME15", affiliate: "", account: "ACC-2002", status: "paid", createdAt: ago(60 * 24 * 25), ...v },
      { id: "PAY-4003", traderName: "Daniel Lee", plan: "$10K", amount: 59, method: "BTC", invoiceId: "pl_44a0b", txnId: "", coin: "BTC", expected: 59, received: 0, confirmations: 0, webhook: "none", coupon: "", affiliate: "", account: "", status: "pending", createdAt: ago(60 * 24 * 3), ...v },
      { id: "PAY-4004", traderName: "Mina Park", plan: "$5K", amount: 39, method: "USDT • TRC20", invoiceId: "pl_77d12", txnId: "5be…19f", coin: "USDT", expected: 39, received: 31, confirmations: 6, webhook: "processed", coupon: "", affiliate: "", account: "", status: "underpaid", createdAt: ago(60 * 5), ...v },
      { id: "PAY-4005", traderName: "Omid Rahimi", plan: "$10K", amount: 59, method: "USDT • TRC20", invoiceId: "pl_90e3c", txnId: "a41…77e", coin: "USDT", expected: 59, received: 59, confirmations: 22, webhook: "failed", coupon: "", affiliate: "", account: "", status: "paid", createdAt: ago(60 * 2), ...v },
    ],
    "affiliate-payouts": [
      { id: "AP-01", affiliateName: "CryptoPartner", amount: 180, network: "USDT • TRC20", wallet: "TXe5…b21", txHash: "", explorerUrl: "", holdUntil: ago(-60 * 24), reason: "", status: "pending", requestedAt: ago(60 * 9), ...v },
      { id: "AP-02", affiliateName: "TradeZone", amount: 90, network: "USDT • ERC20", wallet: "0x8a3…d90", txHash: "0x5d1c8e47b2a9f0361d5c7e8a9b0c1d2e3f405162738495a6b7c8d9e0f1a2b3c4", explorerUrl: explorerUrl("USDT • ERC20", "0x5d1c8e47b2a9f0361d5c7e8a9b0c1d2e3f405162738495a6b7c8d9e0f1a2b3c4"), holdUntil: ago(60 * 24 * 30), reason: "", status: "paid", requestedAt: ago(60 * 60), ...v },
    ],
    markets: [
      { id: "MKT-01", symbol: "BTC-PERP", category: "Crypto", maxLeverage: 20, fee: 0.05, tickSize: 0.5, minSize: 0.001, sizeDecimals: 3, priceSource: "Hyperliquid", hours: "24/7", spreadBps: 2, slippageBps: 1, fundingMode: "mirror", staleSeconds: 5, breakerPct: 8, verified: true, status: "enabled", ...v },
      { id: "MKT-02", symbol: "ETH-PERP", category: "Crypto", maxLeverage: 15, fee: 0.05, tickSize: 0.05, minSize: 0.01, sizeDecimals: 2, priceSource: "Hyperliquid", hours: "24/7", spreadBps: 2, slippageBps: 1, fundingMode: "mirror", staleSeconds: 5, breakerPct: 8, verified: true, status: "enabled", ...v },
      { id: "MKT-03", symbol: "SOL-PERP", category: "Crypto", maxLeverage: 10, fee: 0.05, tickSize: 0.01, minSize: 0.1, sizeDecimals: 1, priceSource: "Hyperliquid", hours: "24/7", spreadBps: 3, slippageBps: 2, fundingMode: "mirror", staleSeconds: 5, breakerPct: 10, verified: true, status: "enabled", ...v },
      { id: "MKT-04", symbol: "GOLD-PERP", category: "Commodities", maxLeverage: 5, fee: 0.05, tickSize: 0.1, minSize: 0.01, sizeDecimals: 2, priceSource: "Hyperliquid", hours: "Mon-Fri", spreadBps: 4, slippageBps: 2, fundingMode: "fixed", staleSeconds: 10, breakerPct: 5, verified: false, status: "disabled", ...v },
      { id: "MKT-05", symbol: "DOGE-PERP", category: "Crypto", maxLeverage: 8, fee: 0.05, tickSize: 0.00001, minSize: 10, sizeDecimals: 0, priceSource: "Hyperliquid", hours: "24/7", spreadBps: 4, slippageBps: 3, fundingMode: "mirror", staleSeconds: 5, breakerPct: 12, verified: true, status: "halted", ...v },
    ],
    plans: [
      { id: "PL-1", name: "Starter", capital: 5000, price: 39, profitTarget: 8, dailyLoss: 4, maxLoss: 7, profitSplit: 80, minDays: 0, maxLeverage: 10, payoutMin: 100, payoutCycle: "On demand", refundDays: 7, planVersion: 1, status: "active", ...v },
      { id: "PL-2", name: "Growth", capital: 10000, price: 59, profitTarget: 8, dailyLoss: 4, maxLoss: 7, profitSplit: 80, minDays: 0, maxLeverage: 15, payoutMin: 100, payoutCycle: "On demand", refundDays: 7, planVersion: 2, status: "active", ...v },
      { id: "PL-3", name: "Pro", capital: 25000, price: 99, profitTarget: 8, dailyLoss: 4, maxLoss: 7, profitSplit: 85, minDays: 3, maxLeverage: 20, payoutMin: 200, payoutCycle: "Weekly", refundDays: 7, planVersion: 1, status: "active", ...v },
    ],
    affiliates: [
      { id: "AFF-01", name: "CryptoPartner", email: "crypto@example.com", code: "CRYPTOP", referrals: 41, conversionRate: 18, commission: 15, holdDays: 14, earnings: 365, fraudFlags: "", status: "active", ...v },
      { id: "AFF-02", name: "TradeZone", email: "zone@example.com", code: "ZONE15", referrals: 24, conversionRate: 11, commission: 15, holdDays: 14, earnings: 218, fraudFlags: "same-ip-signups", status: "active", ...v },
      { id: "AFF-03", name: "QuickRef", email: "quick@example.com", code: "QUICK", referrals: 9, conversionRate: 3, commission: 10, holdDays: 30, earnings: 12, fraudFlags: "self-referral", status: "suspended", ...v },
    ],
    referrals: [
      { id: "REF-1", affiliateId: "AFF-01", trader: "Ahmed Raza", status: "purchased", amount: 59, commission: 8.85, flag: "", at: ago(60 * 24 * 40) },
      { id: "REF-2", affiliateId: "AFF-01", trader: "Mina Park", status: "signed up", amount: 0, commission: 0, flag: "", at: ago(60 * 24) },
      { id: "REF-3", affiliateId: "AFF-02", trader: "Ali Hassan", status: "refunded", amount: 39, commission: 0, flag: "same-ip-signups", at: ago(60 * 24 * 12) },
      { id: "REF-4", affiliateId: "AFF-03", trader: "QuickRef (owner)", status: "purchased", amount: 39, commission: 3.9, flag: "self-referral", at: ago(60 * 24 * 6) },
    ],
    coupons: [
      { id: "CP-01", code: "WELCOME15", discount: 15, uses: 27, maxUses: 100, perUserLimit: 1, plan: "All", affiliateCode: "", revenue: 1485, expiresAt: ahead(60), status: "active", ...v },
      { id: "CP-02", code: "LAUNCH10", discount: 10, uses: 50, maxUses: 50, perUserLimit: 1, plan: "Growth", affiliateCode: "", revenue: 2950, expiresAt: ago(60 * 24 * 10), status: "expired", ...v },
    ],
    announcements: [
      { id: "ANN-01", title: "Trading platform maintenance", body: "The platform will be unavailable for 15 minutes on Sunday at 02:00 UTC.", audience: "All Traders", type: "warning", scheduledAt: "", expiresAt: ahead(7), publishedAt: ago(60 * 24 * 2), reads: 312, status: "published", ...v },
      { id: "ANN-02", title: "New market instruments", body: "More perpetual markets are coming soon.", audience: "Funded Traders", type: "info", scheduledAt: ahead(3), expiresAt: "", publishedAt: "", reads: 0, status: "draft", ...v },
    ],
    emails: [
      { id: "EM-01", template: "Welcome / Verify Email", trigger: "Signup", channel: "Resend", subject: "Verify your email", body: "Hi {{name}}, confirm your email: {{link}}", status: "enabled", ...v },
      { id: "EM-02", template: "Challenge Passed", trigger: "Phase completion", channel: "Resend", subject: "You passed the challenge", body: "Congratulations {{name}}, your funded account {{account}} is ready.", status: "enabled", ...v },
      { id: "EM-03", template: "Payout Paid", trigger: "Payout confirmed", channel: "Resend", subject: "Your payout was sent", body: "Hi {{name}}, {{amount}} was sent. Transaction: {{hash}}", status: "enabled", ...v },
      { id: "EM-04", template: "Payout Rejected", trigger: "Payout rejected", channel: "Resend", subject: "About your payout request", body: "Hi {{name}}, your payout was not approved. Reason: {{reason}}", status: "enabled", ...v },
    ],
    "email-log": [
      { id: "EL-1", template: "Welcome / Verify Email", to: "mina@example.com", status: "bounced", providerId: "re_a1b2", error: "Mailbox does not exist", sentAt: ago(60 * 27) },
      { id: "EL-2", template: "Payout Paid", to: "ahmed@example.com", status: "delivered", providerId: "re_c3d4", error: "", sentAt: ago(60 * 70) },
      { id: "EL-3", template: "Challenge Passed", to: "daniel@example.com", status: "delivered", providerId: "re_e5f6", error: "", sentAt: ago(60 * 24 * 6) },
      { id: "EL-4", template: "Welcome / Verify Email", to: "omid@example.com", status: "failed", providerId: "", error: "Resend API timeout", sentAt: ago(60 * 10) },
    ],
    competitions: [
      { id: "CMP-01", name: "November Trading Sprint", participants: 0, prize: "Demo reward", scoring: "Highest return %", endsAt: ahead(14), status: "draft", ...v },
    ],
    health: [
      { id: "h1", service: "Trading API", status: "healthy", latencyMs: 42, checkedAt: ago(1), detail: "All endpoints answering" },
      { id: "h2", service: "Neon database", status: "healthy", latencyMs: 12, checkedAt: ago(1), detail: "Pool 8 of 40 connections" },
      { id: "h3", service: "Redis queue", status: "healthy", latencyMs: 4, checkedAt: ago(1), detail: "0 jobs waiting" },
      { id: "h4", service: "Hyperliquid REST", status: "healthy", latencyMs: 88, checkedAt: ago(1), detail: "Metadata fresh" },
      { id: "h5", service: "Hyperliquid WebSocket", status: "warning", latencyMs: 640, checkedAt: ago(1), detail: "Last message 4 s ago, 2 reconnects today" },
      { id: "h6", service: "Trading / risk engine", status: "healthy", latencyMs: 38, checkedAt: ago(1), detail: "Worker alive" },
      { id: "h7", service: "Scheduler", status: "healthy", latencyMs: 9, checkedAt: ago(1), detail: "Daily reset ran 00:00 UTC" },
      { id: "h8", service: "Resend email", status: "warning", latencyMs: 910, checkedAt: ago(1), detail: "1 failed email in the last hour" },
      { id: "h9", service: "Plisio webhook", status: "healthy", latencyMs: 120, checkedAt: ago(1), detail: "Last event 3 min ago" },
    ],
    incidents: [
      { id: "INC-1", service: "Hyperliquid WebSocket", title: "Feed reconnected twice", startedAt: ago(60 * 5), resolvedAt: ago(60 * 5 - 4), status: "resolved" },
      { id: "INC-2", service: "Resend email", title: "Slow delivery", startedAt: ago(60 * 2), resolvedAt: "", status: "open" },
    ],
    feed: [
      { id: "BTC-PERP", symbol: "BTC-PERP", lastTickSec: 1, source: "Hyperliquid WS", status: "ok" },
      { id: "ETH-PERP", symbol: "ETH-PERP", lastTickSec: 1, source: "Hyperliquid WS", status: "ok" },
      { id: "SOL-PERP", symbol: "SOL-PERP", lastTickSec: 2, source: "Hyperliquid WS", status: "ok" },
      { id: "DOGE-PERP", symbol: "DOGE-PERP", lastTickSec: 41, source: "Hyperliquid WS", status: "stale" },
      { id: "GOLD-PERP", symbol: "GOLD-PERP", lastTickSec: 3, source: "Hyperliquid WS", status: "ok" },
    ],
    backups: [
      { id: "BK-1", kind: "Database snapshot", at: ago(60 * 6), sizeMb: 412, status: "ok", restoreTested: true },
      { id: "BK-2", kind: "Database snapshot", at: ago(60 * 30), sizeMb: 409, status: "ok", restoreTested: false },
      { id: "BK-3", kind: "Audit log archive", at: ago(60 * 24 * 7), sizeMb: 38, status: "ok", restoreTested: true },
    ],
    issuance: [
      { id: "IS-31", traderName: "Ahmed Raza", plan: "Growth", stage: STAGE.challenge, reason: "Challenge purchase", status: "active", issuedAt: ago(60 * 24 * 40) },
    ],
    kyc: [
      { id: "KYC-1", traderName: "Ali Hassan", country: "UAE", docType: "Passport", restricted: false, reviewer: "", reason: "", submittedAt: ago(60 * 12), status: "pending", ...v },
      { id: "KYC-2", traderName: "Omid Rahimi", country: "Iran", docType: "National ID", restricted: true, reviewer: "", reason: "", submittedAt: ago(60 * 6), status: "pending", ...v },
      { id: "KYC-3", traderName: "Ahmed Raza", country: "Pakistan", docType: "Passport", restricted: false, reviewer: "mod@perpeye.com", reason: "", submittedAt: ago(60 * 24 * 38), status: "approved", ...v },
      { id: "KYC-4", traderName: "Daniel Lee", country: "Canada", docType: "Driver licence", restricted: false, reviewer: "mod@perpeye.com", reason: "", submittedAt: ago(60 * 24 * 2), status: "approved", ...v },
    ],
    ledger: [
      { id: "LM-1", runId: "RUN-3", accountId: "ACC-2005", ledgerBalance: 4890, accountBalance: 4880.5, diff: -9.5, note: "Funding entry missing from the account", detectedAt: ago(60 * 3), status: "mismatch", ...v },
    ],
    "ledger-runs": [
      { id: "RUN-3", ranAt: ago(60 * 3), accountsChecked: 6, mismatches: 1, durationMs: 840, status: "mismatch" },
      { id: "RUN-2", ranAt: ago(60 * 27), accountsChecked: 6, mismatches: 0, durationMs: 790, status: "balanced" },
      { id: "RUN-1", ranAt: ago(60 * 51), accountsChecked: 5, mismatches: 0, durationMs: 702, status: "balanced" },
    ],
    webhooks: [
      { id: "WH-1", provider: "plisio", event: "invoice.paid", reference: "pl_8f21a", signature: "valid", status: "processed", error: "", attempts: 1, receivedAt: ago(60 * 24 * 40) },
      { id: "WH-2", provider: "plisio", event: "invoice.paid", reference: "pl_90e3c", signature: "valid", status: "failed", error: "Account activation failed: plan not found", attempts: 3, receivedAt: ago(60 * 2) },
      { id: "WH-3", provider: "plisio", event: "invoice.paid", reference: "pl_90e3c", signature: "valid", status: "ignored-duplicate", error: "Already handled", attempts: 1, receivedAt: ago(60 * 2 - 1) },
      { id: "WH-4", provider: "plisio", event: "invoice.paid", reference: "pl_unknown", signature: "invalid", status: "denied", error: "Signature check failed", attempts: 1, receivedAt: ago(60 * 9) },
      { id: "WH-5", provider: "resend", event: "email.bounced", reference: "re_a1b2", signature: "valid", status: "processed", error: "", attempts: 1, receivedAt: ago(60 * 27) },
    ],
    errors: [
      { id: "ERR-1", service: "Plisio webhook", severity: "critical", message: "Account activation failed: plan not found", count: 3, firstSeen: ago(60 * 2), lastSeen: ago(60 * 2 - 3), requestId: "req_9f31ac", status: "new", ...v },
      { id: "ERR-2", service: "Hyperliquid WebSocket", severity: "warning", message: "Socket closed unexpectedly (code 1006)", count: 2, firstSeen: ago(60 * 5), lastSeen: ago(60 * 5 - 2), requestId: "req_71be0d", status: "acknowledged", ...v },
      { id: "ERR-3", service: "Resend email", severity: "warning", message: "Request timed out after 10 s", count: 1, firstSeen: ago(60 * 10), lastSeen: ago(60 * 10), requestId: "req_c2d8e4", status: "new", ...v },
      { id: "ERR-4", service: "Scheduler", severity: "info", message: "Job overran its time window by 4 s", count: 5, firstSeen: ago(60 * 48), lastSeen: ago(60 * 20), requestId: "req_0aa1b3", status: "fixed", ...v },
    ],
    jobs: [
      { id: "JOB-1", name: "Daily loss reset", schedule: "Every day 00:00 UTC", lastRunAt: ago(60 * 9), durationMs: 1210, status: "ok", nextRunAt: ahead(0.6), lastError: "" },
      { id: "JOB-2", name: "Ledger reconciliation", schedule: "Every day 01:00 UTC", lastRunAt: ago(60 * 3), durationMs: 840, status: "ok", nextRunAt: ahead(0.9), lastError: "" },
      { id: "JOB-3", name: "Stale payment check", schedule: "Every 15 minutes", lastRunAt: ago(9), durationMs: 120, status: "ok", nextRunAt: ahead(0.01), lastError: "" },
      { id: "JOB-4", name: "Email retry queue", schedule: "Every 5 minutes", lastRunAt: ago(4), durationMs: 90, status: "failed", nextRunAt: ahead(0.003), lastError: "Resend API timeout" },
      { id: "JOB-5", name: "Weekly report", schedule: "Mondays 06:00 UTC", lastRunAt: ago(60 * 24 * 4), durationMs: 5300, status: "ok", nextRunAt: ahead(3), lastError: "" },
    ],
    "public-payouts": [
      { id: "PP-1", payoutId: "PO-503", trader: "Trader #4821", asset: "USDT", amount: 432, network: "USDT • TRC20", explorerUrl: explorerUrl("USDT • TRC20", "9c1f3b0a7d2e4f58a1b6c3d4e5f60718293a4b5c6d7e8f9012a3b4c5d6e7f801"), confirmedAt: ago(60 * 70), status: "visible" },
    ],
    approvals: [],
    alerts: [
      { id: "AL-1", name: "Daily loss at 80%", metric: "dailyLossUsed", condition: "above", threshold: 80, channel: "both", notify: "risk@perpeye.com", status: "enabled", ...v },
      { id: "AL-2", name: "Price feed stale", metric: "feedStaleSeconds", condition: "above", threshold: 15, channel: "both", notify: "ops@perpeye.com", status: "enabled", ...v },
      { id: "AL-3", name: "Payout waiting too long", metric: "payoutAgeHours", condition: "above", threshold: 24, channel: "in-app", notify: "finance@perpeye.com", status: "enabled", ...v },
      { id: "AL-4", name: "Webhook failures", metric: "failedWebhooks", condition: "above", threshold: 0, channel: "email", notify: "ops@perpeye.com", status: "enabled", ...v },
    ],
    "alert-history": [
      { id: "AH-1", ruleName: "Daily loss at 80%", message: "ACC-2005 reached 78% of the daily loss limit", firedAt: ago(300), status: "acknowledged" },
      { id: "AH-2", ruleName: "Webhook failures", message: "1 Plisio webhook failed", firedAt: ago(60 * 2), status: "new" },
    ],
    notes: [
      { id: "NT-1", target: "TR-1003", body: "Same device fingerprint as TR-0988. Waiting for KYC before any payout.", author: "mod@perpeye.com", createdAt: ago(60 * 20) },
    ],
    "staff-sessions": [
      { id: "SS-1", staffId: "SA-1", device: "Chrome on Windows", ip: "203.0.113.10", startedAt: ago(30), lastSeenAt: ago(1) },
      { id: "SS-2", staffId: "ST-2", device: "Safari on iPhone", ip: "198.51.100.23", startedAt: ago(60 * 5), lastSeenAt: ago(60 * 4) },
      { id: "SS-3", staffId: "ST-3", device: "Firefox on macOS", ip: "192.0.2.77", startedAt: ago(60 * 26), lastSeenAt: ago(60 * 25) },
    ],
    "audit-logs": [], // filled by appendAudit
  };
}

// Settings seed. Section field definitions live in pages/PlatformSettings.tsx.
export const seedSettings = () => ({
  version: 7,
  sections: {
    risk: { dailyLossMethod: "equity-based", dailyResetTime: "00:00", timezone: "UTC", drawdownType: "static", highWaterMark: "equity", maxExposurePct: 300, maxOpenPositions: 20, lockOnBreach: "yes" },
    trading: { takerFeePct: 0.05, makerFeePct: 0.02, fundingMode: "mirror Hyperliquid", spreadBps: 2, slippageBps: 1, fillModel: "bid/ask plus slippage", staleSeconds: 5 },
    payouts: { minPayout: 100, schedule: "on demand", profitSplit: 80, networks: "USDT (TRC20), USDT (ERC20)", walletWhitelist: "required", dualApprovalAbove: 500, holdHours: 24 },
    compliance: { kycRequired: "yes", restrictedCountries: "KP, IR, SY, CU", refundDays: 7, refundPolicy: "Refund if no trade was placed" },
    plisio: { coins: "USDT, BTC, ETH", networks: "TRC20, ERC20, BTC", invoiceExpiryMin: 60 },
    flags: { publicPayoutFeed: "on", affiliateProgram: "on", competitions: "off", newSignups: "on" },
  } as Record<string, Record<string, string | number>>,
  killSwitches: { pauseTrading: false, pausePurchases: false, pausePayouts: false, maintenanceMode: false } as Record<string, boolean>,
  history: [] as Row[],
});
