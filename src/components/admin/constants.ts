// Single source of truth for names that several admin files compare against.
// Never type "Phase 1" or "Funded" by hand in a page; import these instead.

export const STAGE = { challenge: "Phase 1", funded: "Funded" } as const;
export const STAGES: string[] = [STAGE.challenge, STAGE.funded];

export const NETWORKS = ["USDT • TRC20", "USDT • ERC20", "BTC"];

// Allowed payout status moves. The backend enforces the same map.
export const PAYOUT_FLOW: Record<string, string[]> = {
  pending: ["awaiting approval", "approved", "rejected"],
  "awaiting approval": ["approved", "rejected"],
  approved: ["paid"],
  paid: [],
  rejected: [],
};

// Support ticket response targets in minutes, by priority
export const SLA_MINUTES: Record<string, number> = { high: 60, medium: 240, normal: 1440 };

export const CANNED_REPLIES = [
  "Thanks for contacting us. We are looking into this now.",
  "Your payout is being reviewed. Reviews usually finish within 24 hours.",
  "Please send us the transaction hash so we can check the payment.",
  "Your account rules are shown on the Rules page. Let us know if anything is unclear.",
];

// Block explorer links for payout proofs
export function explorerUrl(network: string, hash: string): string {
  if (!hash) return "";
  if (network.includes("TRC20")) return `https://tronscan.org/#/transaction/${hash}`;
  if (network.includes("ERC20")) return `https://etherscan.io/tx/${hash}`;
  return `https://mempool.space/tx/${hash}`;
}

// Number of verified perpetual markets planned for launch (project brief)
export const LAUNCH_MARKET_TARGET = 106;
