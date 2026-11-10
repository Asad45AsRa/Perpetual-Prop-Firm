"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { tabChip } from "@/components/affiliate-dashboard/Panel";
import { subAccounts, type SubAccount } from "../data";
import { PHASES } from "./data";

const STAGE_CHIP: Record<SubAccount["stage"], string> = {
  "Challenge Phase": "bg-[#3B6BE8]/[0.18] text-white",
  "Funded Stage": "bg-[#47a847]/[0.15] text-[#47a847]",
  Breached: "bg-[#E5484D]/[0.15] text-[#E5484D]",
};
const STATUS_CHIP: Record<SubAccount["status"], string> = {
  Active: "border-white/30 bg-white/[0.06] text-white/70",
  Passed: "border-[#47a847] bg-[#47a847]/[0.12] text-[#47a847]",
  Breached: "border-[#E5484D] bg-[#E5484D]/[0.12] text-[#E5484D]",
};

/** Account switcher: "Account #PE-1 ▾" button with an Active/Inactive tabbed list (Figma frame 2131332266). */
function AccountSwitcher({ account, onChange }: { account: SubAccount; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"Active" | "Inactive">(account.active ? "Active" : "Inactive");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const active = subAccounts.filter((a) => a.active);
  const inactive = subAccounts.filter((a) => !a.active);
  const shown = tab === "Active" ? active : inactive;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-[34px] items-center gap-[10px] border-[0.57px] border-white/[0.13] bg-white/[0.06] pl-[11px] pr-[9px] text-[14px] text-white transition-colors hover:bg-white/10"
      >
        {account.name}
        <ChevronDown aria-hidden className={cn("h-[16px] w-[16px] text-white/70 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[182px] border-[0.7px] border-white/[0.13] bg-[rgba(22,22,24,0.95)] shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-[16px] max-sm:left-0 max-sm:right-auto">
          <div role="tablist" aria-label="Account status" className="flex gap-[6px] p-[8px]">
            {(["Active", "Inactive"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(tabChip(tab === t), "h-[30px] flex-1")}
              >
                {t} {t === "Active" ? active.length : inactive.length}
              </button>
            ))}
          </div>
          <ul id={listId} role="listbox" aria-label="Accounts">
            {shown.map((a) => (
              <li key={a.id} role="option" aria-selected={a.id === account.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(a.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "block w-full border-t-[0.7px] border-white/[0.06] px-[10px] py-[8px] text-left transition-colors hover:bg-white/[0.05]",
                    a.id === account.id && "bg-white/[0.04]",
                  )}
                >
                  <span className="block text-[13px] leading-[1.35] text-white">{a.name}</span>
                  <span className="block text-[11px] leading-[1.4] text-white/50">{a.details}</span>
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className="border-t-[0.7px] border-white/[0.06] px-[10px] py-[12px] text-[11px] text-white/50">No {tab.toLowerCase()} accounts.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Figma "Account #PE-1" card: name, plan, stage chip, status + switcher + Trade, 3-step phase track. */
export function AccountHeader({ account, onChange }: { account: SubAccount; onChange: (id: string) => void }) {
  // Phase reached: challenge → funded → payout request.
  const reached = account.stage === "Funded Stage" ? 1 : 0;

  return (
    <section
      aria-label={`${account.name} overview`}
      className="relative border-[0.7px] border-white/[0.13] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(153,128,74,0.08))] px-[16px] pb-[22px] pt-[14px] sm:px-[19px]"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div>
          <h2 className="text-[28px] font-normal leading-[1.4] tracking-[-0.6px] text-white sm:text-[30px]">{account.name}</h2>
          <p className="text-[13px] leading-[1.3] text-white/50">{account.details}</p>
          <span className={cn("mt-[11px] inline-flex h-[34px] items-center px-[11px] text-[12px] leading-none", STAGE_CHIP[account.stage])}>{account.stage}</span>
        </div>
        <div className="flex flex-wrap items-center gap-[10px] sm:pt-[9px]">
          <span className={cn("inline-flex h-[34px] items-center border-l-[1.5px] px-[11px] text-[12px] leading-none", STATUS_CHIP[account.status])}>{account.status}</span>
          <AccountSwitcher account={account} onChange={onChange} />
          <Link
            href="/terminal"
            className="inline-flex h-[34px] items-center gap-[8px] bg-[linear-gradient(90deg,#FFFFFF_6.863%,#99804A_88.235%)] px-[12px] text-[14px] text-ink transition-opacity hover:opacity-90"
          >
            <TrendingUp aria-hidden className="h-[16px] w-[16px]" />
            Trade
          </Link>
        </div>
      </div>

      {/* Phase track: 3 nodes on a line, gold up to the reached node. */}
      <ol aria-label="Account phases" className="relative mt-[26px] flex justify-between">
        <span aria-hidden className="absolute left-[18px] right-[18px] top-[17px] h-[4px] bg-white/[0.08]" />
        <span
          aria-hidden
          className="absolute left-[18px] top-[17px] h-[4px] bg-[linear-gradient(90deg,#99804A,rgba(255,255,255,0.25))]"
          // Challenge: halfway to Funded (Figma); later phases: up to the reached node.
          style={{ width: `calc(${reached === 0 ? 25 : reached * 50}% - 18px)` }}
        />
        {PHASES.map((phase, i) => {
          const done = i <= reached;
          return (
            <li
              key={phase}
              aria-current={i === reached ? "step" : undefined}
              className={cn("relative flex flex-col", i === 0 ? "items-start" : i === PHASES.length - 1 ? "items-end" : "items-center")}
            >
              <span
                className={cn(
                  "flex h-[36px] w-[36px] items-center justify-center rounded-full",
                  done ? "bg-[#3A3221] text-[#C9B27A]" : "bg-[#2A2A2A] text-white/50",
                )}
              >
                {/* Figma icons: gold shield-check (reached), lock (not yet) */}
                {done ? (
                  <Image src="/images/trader-dashboard/phase-done.svg" alt="" width={24} height={24} unoptimized className="h-[24px] w-[24px]" />
                ) : (
                  <Image src="/images/trader-dashboard/phase-locked.svg" alt="" width={16} height={16} unoptimized className="h-[16px] w-[16px]" />
                )}
              </span>
              <span className={cn("mt-[10px] whitespace-nowrap text-[11px] leading-none sm:text-[12px]", done ? "text-white/60" : "text-white/50")}>{phase}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
