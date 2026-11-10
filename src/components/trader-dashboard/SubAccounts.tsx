"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, PanelTitle, tabChip } from "@/components/affiliate-dashboard/Panel";
import { accountTotals, subAccounts, TRADER_BASE, type AccountStage, type Gauge, type SubAccount } from "./data";

const TOTAL_ICONS = {
  allocation: "/images/trader-dashboard/total-allocation.svg",
  funded: "/images/trader-dashboard/total-funded.svg",
  daily: "/images/trader-dashboard/total-daily-pnl.svg",
  max: "/images/trader-dashboard/total-max-funding.svg",
} as const;

const STAGE_CHIP: Record<AccountStage, string> = {
  "Challenge Phase": "border-l-[1.5px] border-[#3B6BE8] bg-[#3B6BE8]/[0.14] text-[#7EA2FF]",
  "Funded Stage": "border-l-[1.5px] border-[#47a847] bg-[#47a847]/[0.12] text-[#47a847]",
  Breached: "border-l-[1.5px] border-[#E5484D] bg-[#E5484D]/[0.12] text-[#E5484D]",
};

/** Small progress ring with the % inside; red once a drawdown limit is fully used. */
// Figma rule colours: daily = blue, max = red, target = green.
const RING_COLOR: Record<string, string> = { "Daily DD": "#3B6BE8", "Max DD": "#E5484D", "Profit Target": "#47a847" };

function Ring({ gauge }: { gauge: Gauge }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const color = RING_COLOR[gauge.label] ?? "#99804A";
  // A 0% ring still shows a short tick in the rule colour (Figma).
  const dash = Math.max((Math.min(gauge.value, 100) / 100) * c, 3);
  return (
    <div className="flex items-center gap-[8px]" role="img" aria-label={`${gauge.label} ${gauge.value}%`}>
      <span className="relative h-[46px] w-[46px] shrink-0">
        <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden className="-rotate-90">
          <circle cx="23" cy="23" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle cx="23" cy="23" r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${dash} ${c}`} />
        </svg>
        <span aria-hidden className="absolute inset-0 flex items-center justify-center text-[11px] text-white">
          {gauge.value}%
        </span>
      </span>
      <span className="whitespace-nowrap text-[11px] leading-[1.2] text-white/50">{gauge.label}</span>
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
          return (
            <div key={label} className="flex items-center gap-[8px] border-[0.7px] border-white/[0.06] bg-white/[0.03] px-[10px] py-[10px]">
              {/* Figma tile: gold-tinted 32px box with a gold-gradient glyph */}
              <Image src={TOTAL_ICONS[icon]} alt="" width={32} height={32} unoptimized className="h-[32px] w-[32px] shrink-0" />
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
