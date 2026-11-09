"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { subAccounts } from "../data";
import { AccountHeader } from "./AccountHeader";
import { ACCOUNT_TABS, type AccountTab } from "./data";
import { EquityTab } from "./EquityTab";
import { StatsTab } from "./StatsTab";
import { TradeLogTab } from "./TradeLogTab";

/** Account Dashboard body: account header + switcher, the 3 Figma tabs, and the active tab's content. */
export function AccountView() {
  const [accountId, setAccountId] = useState("PE-1");
  const [tab, setTab] = useState<AccountTab>("Equity & Live Positions");
  const account = subAccounts.find((a) => a.id === accountId) ?? subAccounts[0];

  return (
    <div className="mt-[37px] flex flex-col gap-[16px]">
      <AccountHeader account={account} onChange={setAccountId} />

      <div role="tablist" aria-label="Account views" className="grid gap-[14px] border-[0.7px] border-white/[0.13] bg-white/[0.03] p-[17px] sm:grid-cols-3">
        {ACCOUNT_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`acct-tab-${t}`}
            aria-selected={tab === t}
            aria-controls="acct-panel"
            onClick={() => setTab(t)}
            className={cn(
              "h-[41px] text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent",
              tab === t ? "bg-[linear-gradient(90deg,#FFFFFF_6.863%,#99804A_88.235%)] text-ink" : "bg-white/[0.06] text-white hover:bg-white/10",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div id="acct-panel" role="tabpanel" aria-labelledby={`acct-tab-${tab}`}>
        {tab === "Equity & Live Positions" && <EquityTab accountName={account.name} />}
        {tab === "Stats & Discipline" && <StatsTab />}
        {tab === "Trade Log" && <TradeLogTab />}
      </div>
    </div>
  );
}
