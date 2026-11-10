"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent, type FaqContent } from "@/lib/siteContent";
import { CheckoutPage } from "@/components/sections/Checkoutpage";
import { DEFAULT_FAQS } from "@/components/sections/Faq";
import { Panel, PanelTitle } from "@/components/affiliate-dashboard/Panel";
import { TRADER_BASE, trader } from "../data";

const STEPS = [
  { title: "Start Your Challenge", body: "Compare the live account options, see every rule before paying and complete one secure checkout." },
  { title: "Trade and Prove Yourself", body: "Use live Hyperliquid reference data, precise order controls and continuous account-risk tracking." },
  { title: "Get Rewarded. Get Funded", body: "Pass within the published limits to progress to a funded account and become eligible for rewards." },
];

export function StepCards() {
  return (
    <ol className="grid gap-[16px] md:grid-cols-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative min-h-[97px] border-[0.7px] border-white/[0.13] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(153,128,74,0.08))] px-[15px] pb-[14px] pt-[13px]">
          <span className="absolute right-[17px] top-[19px] flex h-[34px] w-[34px] items-center justify-center bg-[linear-gradient(135deg,#FFFFFF,#99804A)] text-[12px] text-ink">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h2 className="pr-[48px] text-[16px] font-normal leading-[1.3] text-white">{s.title}</h2>
          <p className="mt-[8px] pr-[48px] text-[12px] leading-[1.4] text-white/50">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

function DemoBanner() {
  return (
    // Figma: gold glow from the left fading to the card colour by mid-width, no outline.
    <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden border-[0.7px] border-white/[0.06] bg-[#171717] bg-[linear-gradient(90deg,rgba(153,128,74,0.78)_0%,rgba(153,128,74,0.38)_20%,rgba(153,128,74,0.12)_40%,rgba(153,128,74,0)_58%)] px-[14px] py-[13px]">
      <div className="flex items-center gap-[10px]">
        {/* Figma tile (33px, own frame + gold bolt) */}
        <Image src="/images/trader-dashboard/demo-bolt.svg" alt="" width={33} height={33} unoptimized className="h-[33px] w-[33px] shrink-0" />
        <div>
          <p className="text-[13px] leading-[1.3] text-white/80">New to prop trading?</p>
          <p className="text-[11px] leading-[1.4] text-white/50">Practice with a virtual $100,000. No card, no wallet.</p>
        </div>
      </div>
      {/* TODO(routes): demo account page (Figma "Demo Account") isn't built yet. */}
      <Link
        href={`${TRADER_BASE}/demo`}
        className="inline-flex h-[36px] items-center gap-[8px] bg-[linear-gradient(90deg,#FFFFFF_35%,#D6C79F_100%)] px-[18px] text-[13px] text-ink transition-opacity hover:opacity-90"
      >
        Try a free demo account
        <ArrowRight aria-hidden className="h-[15px] w-[15px]" />
      </Link>
    </div>
  );
}

function Faqs() {
  // Same admin-editable FAQ content as the marketing site (Admin > Website CMS); Figma shows six.
  const { items } = useSiteContent<FaqContent>("faq", { items: DEFAULT_FAQS });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Panel>
      <div className="border-b-[0.7px] border-white/[0.06] bg-white/[0.05] px-[16px] pb-[14px] pt-[17px]">
        <PanelTitle>FAQs</PanelTitle>
        <p className="mt-[3px] text-[12px] leading-[1.3] text-white/50">Get quick answers to common questions.</p>
      </div>
      <ul className="grid items-start gap-[10px] p-[18px] md:grid-cols-2">
        {items.slice(0, 6).map((f, i) => {
          const isOpen = open === i;
          return (
            <li key={f.q} className="border-[0.7px] border-white/[0.06] bg-white/[0.04]">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-[66px] w-full items-center justify-between gap-4 px-[16px] text-left text-[14px] text-white"
                >
                  {f.q}
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center bg-white/[0.06] text-white/70">
                    {/* Figma gold "+"; turns into "×" when open */}
                    <Image
                      src="/images/trader-dashboard/faq-plus.svg"
                      alt=""
                      width={13}
                      height={14}
                      unoptimized
                      className={cn("h-[14px] w-[13px] transition-transform duration-200", isOpen && "rotate-45")}
                    />
                  </span>
                </button>
              </h3>
              <p id={`faq-${i}`} hidden={!isOpen} className={cn("px-[16px] pb-[16px] text-[13px] leading-[1.5] text-white/60")}>
                {f.a}
              </p>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/** Trader dashboard "Challenges" (Figma 1603:914): step cards, the shared challenge configurator/checkout, demo banner, FAQs. */
export function ChallengesView() {
  return (
    <div className="mt-[37px] flex flex-col gap-[16px]">
      <StepCards />
      <CheckoutPage embedded accountEmail={trader.email} />
      <DemoBanner />
      <Faqs />
    </div>
  );
}
