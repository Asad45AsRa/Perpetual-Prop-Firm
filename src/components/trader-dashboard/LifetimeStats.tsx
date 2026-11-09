"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Panel, PanelTitle, tabChip } from "@/components/affiliate-dashboard/Panel";
import { AccountSelect } from "./AccountSelect";
import { lifetimeStats, PNL_RANGES, subAccounts, type PnlRange } from "./data";

// Lifetime stats cover funded accounts only (Figma subtitle "All funded accounts").
const FUNDED_OPTIONS = [
  { value: "all", label: "All" },
  ...subAccounts.filter((a) => a.stage === "Funded Stage").map((a) => ({ value: a.id, label: a.name.replace("Account ", "") })),
];

/** Figma "Lifetime stats": funded-account select, range chips, 8 stat tiles (Win rate gets the gold underline). */
export function LifetimeStats() {
  const [account, setAccount] = useState("all");
  const [range, setRange] = useState<PnlRange>("All");
  // TODO(backend): per-account stats; with one funded account "All" and "#PE-1" are the same numbers.
  const stats = lifetimeStats[range];

  return (
    <Panel className="px-[16px] pb-[16px] pt-[16.7px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <PanelTitle>Lifetime stats</PanelTitle>
          <p className="mt-[2px] text-[12px] leading-[1.3] text-white/50">All funded accounts</p>
          <AccountSelect id="lifetime-account" value={account} onChange={setAccount} options={FUNDED_OPTIONS} className="mt-[8px]" />
        </div>
        <div role="tablist" aria-label="Range" className="flex gap-[9px]">
          {PNL_RANGES.map((r) => (
            <button key={r} role="tab" type="button" aria-selected={range === r} onClick={() => setRange(r)} className={tabChip(range === r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-[18px] grid grid-cols-2 gap-[8px] sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "border-[0.7px] border-white/[0.06] bg-white/[0.03] px-[12px] py-[12px]",
              s.highlight && "border-b-2 border-b-gold-accent",
            )}
          >
            <dt className="text-[9px] uppercase leading-[1.2] tracking-[0.05em] text-white/40">{s.label}</dt>
            <dd
              className={cn(
                "mt-[6px] text-[16px] leading-[1.2]",
                s.tone === "green" ? "text-[#47a847]" : s.tone === "red" ? "text-[#E5484D]" : "text-white",
              )}
            >
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
