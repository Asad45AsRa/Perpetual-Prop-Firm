"use client";

import { useState } from "react";
import { payoutHistory, payoutSummary, type Payout } from "../data";
import { PayoutHistory } from "./PayoutHistory";
import { WithdrawCard } from "./WithdrawCard";

/** Payouts page body. Holds the mock balance/history/wallet state shared by both cards. */
export function PayoutsView() {
  // TODO(backend): replace with API data + mutations.
  const [summary, setSummary] = useState(payoutSummary);
  const [history, setHistory] = useState<Payout[]>(payoutHistory);
  const [wallet, setWallet] = useState<string | null>(null);

  const requestWithdrawal = () => {
    const amount = summary.available;
    setSummary((s) => ({ ...s, available: 0, pendingApproval: s.pendingApproval + amount }));
    setHistory((h) => [
      {
        id: `p-${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        method: "USDC · BSC",
        status: "Pending",
        amount,
      },
      ...h,
    ]);
  };

  return (
    // Laptop: history left, withdraw card right (Figma). Smaller screens: card first (main action).
    <div className="mt-[37px] grid gap-[16px] xl:grid-cols-[minmax(0,1fr)_470px]">
      <div className="xl:order-2">
        <WithdrawCard {...summary} wallet={wallet} onSaveWallet={setWallet} onRequestWithdrawal={requestWithdrawal} />
      </div>
      <div className="min-w-0 xl:order-1">
        <PayoutHistory payouts={history} />
      </div>
    </div>
  );
}
