"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DASH_ASSETS, type GiveawayTier } from "../data";
import { GiveawayArt } from "./GiveawayArt";

type Props = {
  tier: GiveawayTier;
  unlocked: boolean;
};

/** Figma "Giveaways" card: tier chip, level + range, perk pills, 3D render; locked tiers get a padlock. */
export function GiveawayCard({ tier, unlocked }: Props) {
  const [requested, setRequested] = useState(false);
  const headingId = `giveaway-${tier.tier.toLowerCase()}`;

  const submitRequest = () => {
    // TODO(backend): create the giveaway claim request.
    setRequested(true);
  };

  return (
    <section
      aria-labelledby={headingId}
      className="relative isolate flex min-h-[230px] overflow-hidden sm:min-h-[274px] border-[0.7px] border-white/[0.13] bg-[#0F0F0F]"
    >
      <GiveawayArt tier={tier.tier} />

      {!unlocked && (
        <Image
          src={`${DASH_ASSETS}/icons/lock.svg`}
          alt={`Locked: unlocks at ${tier.tier}`}
          width={28}
          height={28}
          unoptimized
          className="absolute right-[16px] top-[16px] h-[22px] w-[22px] sm:h-[28px] sm:w-[28px]"
        />
      )}

      <div className="flex w-full flex-col p-[16px] sm:p-[18px]">
        <span className="w-fit bg-[linear-gradient(110.48deg,#FFFFFF_5.83%,#99804A_99.75%)] px-[8.25px] py-[3.14px] text-[10px] uppercase leading-normal text-ink">
          {tier.tier}
        </span>
        <p className="mt-[14px] text-[12px] leading-[1.3] text-white/50">Level {tier.level}</p>
        <h2 id={headingId} className="mt-[4px] text-[24px] font-normal leading-[1.2] tracking-[-0.5px] text-white sm:text-[28px]">
          {tier.range}
        </h2>

        <ul className="mt-[14px] flex flex-col items-start gap-[8px]" aria-label={`${tier.tier} perks`}>
          {tier.perks.map((perk) => (
            <li
              key={perk}
              className="flex h-[34px] items-center gap-[8px] border-[0.7px] border-white/[0.03] bg-white/[0.03] px-[14px] text-[13px] leading-none text-white/50 backdrop-blur-[6px]"
            >
              <Image src={`${DASH_ASSETS}/icons/check-gold.svg`} alt="" width={13} height={13} unoptimized className="h-[13px] w-[13px]" />
              {perk}
            </li>
          ))}
        </ul>

        {unlocked ? (
          <div className="mt-auto pt-[16px]">
            <button
              type="button"
              onClick={submitRequest}
              disabled={requested}
              className="inline-flex items-center gap-[6px] text-[13px] leading-normal text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-accent disabled:cursor-default disabled:opacity-60"
            >
              {requested ? "Request submitted" : "Submit Request"}
              {!requested && (
                <Image src={`${DASH_ASSETS}/icons/arrow-up-right.svg`} alt="" width={14} height={14} unoptimized className="h-[14px] w-[14px]" />
              )}
            </button>
            <p role="status" className={cn("text-[11px] leading-[1.4] text-[#47a847]", requested ? "mt-[4px]" : "sr-only")}>
              {requested ? "We’ll review your request and get back to you." : ""}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
