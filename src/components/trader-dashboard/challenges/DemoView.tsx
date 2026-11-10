"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DASH_ASSETS } from "@/components/affiliate-dashboard/data";
import { Panel } from "@/components/affiliate-dashboard/Panel";
import { TRADER_BASE } from "../data";
import { StepCards } from "./ChallengesView";

const PERKS = ["Virtual $100,000 balance", "Same rules as the real assessment", "Restart any time, for free"];

const HOW_IT_WORKS = [
  { title: "Start the demo", body: "One tap, no payment needed." },
  { title: "Trade freely", body: "All markets, full terminal." },
  { title: "Go funded", body: "Ready? Pick a funded plan." },
];

const FACTS = [
  { label: "Balance", value: "$100,000" },
  { label: "Profit Target", value: "10%" },
  { label: "Cost", value: "$0" },
];

/** Figma "Demo Account" (frame 1630:1388): step cards, free-demo offer card, how-it-works steps and fact tiles. */
export function DemoView() {
  const [started, setStarted] = useState(false);

  return (
    <div className="mt-[37px] flex flex-col gap-[16px]">
      <StepCards />

      <div className="grid gap-[16px] xl:grid-cols-[minmax(0,547fr)_minmax(0,547fr)]">
        <Panel className="px-[16px] pb-[16px] pt-[16px]">
          <span className="inline-flex h-[26px] items-center border-[0.7px] border-gold-accent bg-gold-accent/15 px-[10px] text-[11px] uppercase text-[#C9B27A]">
            Free Demo
          </span>
          <h2 className="mt-[14px] text-[22px] font-normal leading-[1.25] tracking-[-0.4px] text-white">Practice with $100,000 virtual money</h2>
          <p className="mt-[6px] text-[12px] text-white/50">No payment, no card. Start in one tap.</p>

          <ul className="mt-[16px] flex flex-col gap-[8px]">
            {PERKS.map((p) => (
              <li key={p} className="flex h-[38px] items-center gap-[10px] border-[0.7px] border-white/[0.06] bg-white/[0.04] px-[12px] text-[13px] text-white/80">
                <Image src={`${DASH_ASSETS}/icons/check-gold.svg`} alt="" width={16} height={16} unoptimized className="h-[16px] w-[16px]" />
                {p}
              </li>
            ))}
          </ul>

          {/* TODO(backend): create the demo account, then send the trader to the terminal. */}
          <button
            type="button"
            onClick={() => setStarted(true)}
            disabled={started}
            className="mt-[16px] flex h-[41px] w-full items-center justify-center gap-[8px] bg-[linear-gradient(90deg,#FFFFFF_6.863%,#99804A_88.235%)] text-[14px] text-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent disabled:cursor-default disabled:opacity-60"
          >
            {started ? "Demo account ready" : "Try a free demo account"}
            {!started && <ArrowRight aria-hidden className="h-[15px] w-[15px]" />}
          </button>
          <p role="status" className="mt-[10px] text-[12px] text-white/40">
            {started ? (
              <>
                Your $100,000 demo account is ready.{" "}
                <Link href="/terminal" className="text-[#C9B27A] underline underline-offset-2 hover:text-white">
                  Open the terminal
                </Link>
              </>
            ) : (
              <>
                Demo profits aren&apos;t payable.{" "}
                <Link href={`${TRADER_BASE}/challenges`} className="text-[#C9B27A] underline-offset-2 hover:underline">
                  See funded plans.
                </Link>
              </>
            )}
          </p>
        </Panel>

        <div className="flex flex-col gap-[16px]">
          <Panel className="px-[16px] pb-[16px] pt-[16px]">
            <h2 className="text-[11px] font-normal uppercase tracking-[0.04em] text-white/50">How it works</h2>
            <ol className="mt-[12px] flex flex-col gap-[8px]">
              {HOW_IT_WORKS.map((s, i) => (
                <li key={s.title} className="flex items-center gap-[12px] border-[0.7px] border-white/[0.06] bg-white/[0.04] px-[12px] py-[10px]">
                  <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center bg-white/[0.06] text-[11px] text-white/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-[13px] leading-[1.3] text-white">{s.title}</span>
                    <span className="block text-[11px] leading-[1.4] text-white/50">{s.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>

          <dl className="grid grid-cols-3 gap-[16px]">
            {FACTS.map((f) => (
              <div key={f.label} className="border-b-[1.5px] border-white/30 bg-white/[0.06] px-[12px] pb-[10px] pt-[10px]">
                <dt className="text-[10px] uppercase text-white/50">{f.label}</dt>
                <dd className="mt-[3px] text-[16px] text-[#C9B27A]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
