"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Banknote, CalendarClock, Layers, Plus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, PanelTitle, tabChip } from "@/components/affiliate-dashboard/Panel";
import { accountTotals, subAccounts, TRADER_BASE, type AccountStage, type Gauge, type SubAccount } from "./data";

const TOTAL_ICONS = { allocation: Layers, funded: Wallet, daily: CalendarClock, max: Banknote } as const;

const STAGE_CHIP: Record<AccountStage, string> = {
  "Challenge Phase": "bg-[#3B6BE8]/[0.14] text-[#7EA2FF]",
  "Funded Stage": "bg-[#47a847]/[0.12] text-[#47a847]",
  Breached: "bg-[#E5484D]/[0.12] text-[#E5484D]",
};

/** Small progress ring with the % inside; red once a drawdown limit is fully used. */
function Ring({ gauge }: { gauge: Gauge }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const isTarget = gauge.label === "Profit Target";
  const color = isTarget ? "#47a847" : gauge.value >= 100 ? "#E5484D" : gauge.value >= 60 ? "#E8A23B" : "#99804A";
  return (
    <div className="flex items-center gap-[6px]" role="img" aria-label={`${gauge.label} ${gauge.value}%`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="shrink-0 -rotate-90">
        <circle cx="17" cy="17" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="17"
          cy="17"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(Math.min(gauge.value, 100) / 100) * c} ${c}`}
        />
        <text x="17" y="17" transform="rotate(90 17 17)" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="8">
          {gauge.value}%
        </text>
      </svg>
      <span className="whitespace-nowrap text-[10px] leading-[1.2] text-white/50">{gauge.label}</span>
    </div>
  );
}

function AccountRow({ a }: { a: SubAccount }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-[0.7px] border-white/[0.06] bg-white/[0.03] px-[12px] py-[12px]">
      <div className="min-w-0">
        <p className="text-[14px] leading-[1.3] text-white">{a.name}</p>
        <p className="mt-[2px] text-[11px] leading-[1.3] text-white/40">{a.details}</p>
        <span className={cn("mt-[6px] inline-flex h-[20px] items-center px-[8px] text-[10px] leading-none", STAGE_CHIP[a.stage])}>{a.stage}</span>
      </div>
      <div className="flex items-center gap-[12px]">
        <div className="flex flex-wrap items-center gap-[12px]">
          {a.gauges.map((g) => (
            <Ring key={g.label} gauge={g} />
          ))}
        </div>
        <Link
          href="/terminal"
          aria-label={`Open ${a.name} in the terminal`}
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowUpRight aria-hidden className="h-[15px] w-[15px]" />
        </Link>
      </div>
    </li>
  );
}

/** Figma "Sub Accounts": Active/Inactive tabs, 4 totals, account rows with drawdown/target rings, Start New Challenge. */
export function SubAccounts() {
  const [tab, setTab] = useState<"Active" | "Inactive">("Active");
  const active = subAccounts.filter((a) => a.active);
  const funded = active.filter((a) => a.stage === "Funded Stage").length;
  const shown = subAccounts.filter((a) => a.active === (tab === "Active"));

  return (
    <Panel className="px-[16px] pb-[16px] pt-[16.7px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <PanelTitle>Sub Accounts</PanelTitle>
          <p className="mt-[2px] text-[12px] leading-[1.3] text-white/50">
            {active.length} Active · {funded} Funded · {active.length - funded} Evaluation
          </p>
        </div>
        <div role="tablist" aria-label="Account status" className="flex gap-[9px]">
          {(["Active", "Inactive"] as const).map((t) => (
            <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className={tabChip(tab === t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <dl className="mt-[16px] grid grid-cols-2 gap-[8px] sm:grid-cols-4">
        {accountTotals.map(({ label, value, icon }) => {
          const Icon = TOTAL_ICONS[icon];
          return (
            <div key={label} className="flex items-center gap-[8px] border-[0.7px] border-white/[0.06] bg-white/[0.03] px-[10px] py-[10px]">
              <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center bg-white/[0.06]">
                <Icon aria-hidden className="h-[14px] w-[14px] text-gold-accent" />
              </span>
              <div className="min-w-0">
                <dt className="truncate text-[9px] uppercase leading-[1.2] tracking-[0.05em] text-white/40">{label}</dt>
                <dd className="mt-[2px] text-[14px] leading-[1.2] text-white">{value}</dd>
              </div>
            </div>
          );
        })}
      </dl>

      <ul className="mt-[12px] flex flex-col gap-[8px]">
        {shown.map((a) => (
          <AccountRow key={a.id} a={a} />
        ))}
        {shown.length === 0 && <li className="py-6 text-center text-[12px] text-white/50">No {tab.toLowerCase()} accounts.</li>}
      </ul>

      <Link
        href={`${TRADER_BASE}/challenges`}
        className="mt-[14px] inline-flex h-[41px] w-full items-center justify-center gap-[7.5px] bg-[linear-gradient(90deg,#FFFFFF_6.863%,#99804A_88.235%)] text-[14px] text-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        <Plus aria-hidden className="h-[16px] w-[16px]" />
        Start New Challenge
      </Link>
    </Panel>
  );
}
