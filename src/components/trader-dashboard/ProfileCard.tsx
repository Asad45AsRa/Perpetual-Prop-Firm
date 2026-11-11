import Image from "next/image";
import { StatusChip } from "@/components/affiliate-dashboard/Panel";
import { trader } from "./data";

/** Figma "Home" profile banner: gold-lit card with avatar, name, join line, status chips and rank tile. */
export function ProfileCard() {
  return (
    <section
      aria-label="Trader profile"
      className="relative overflow-hidden border-[0.7px] border-white/[0.13] bg-ink"
    >
      {/* Figma banner: dark textured stone with gold light in both bottom corners */}
      {/* Figma exports: wide banner on sm+, square-ish crop on phones (tall card). */}
      <Image
        src="/images/trader-dashboard/profile-banner.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="(min-width: 1280px) 608px, 100vw"
        className="pointer-events-none select-none object-cover object-bottom max-sm:hidden"
      />
      <Image
        src="/images/trader-dashboard/profile-banner-mobile-v2.webp"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="pointer-events-none select-none object-cover object-bottom sm:hidden"
      />

      <div className="relative flex flex-wrap items-center gap-x-[18px] gap-y-[14px] px-[16px] py-[18px] sm:px-[20px]">
        <span className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-full border-2 border-[#E9D9AE] shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:h-[96px] sm:w-[96px]">
          <Image src={trader.avatar} alt="" fill sizes="96px" className="object-cover" priority />
        </span>

        <div className="min-w-0 flex-1 max-sm:order-3 max-sm:basis-full">
          <h2 className="text-[26px] font-normal leading-[1.15] tracking-[-0.5px] text-white sm:text-[30px]">{trader.name}</h2>
          <p className="mt-[4px] flex items-start gap-[6px] text-[12px] leading-[1.3] text-white/60">
            {/* Figma: 13px calendar icon before the join line */}
            <Image src="/images/trader-dashboard/calendar.svg" alt="" width={13} height={13} unoptimized className="mt-[1px] h-[13px] w-[13px] shrink-0" />
            <span>
              {trader.joined} · {trader.tagline}
            </span>
          </p>
          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            <StatusChip className="h-[22px] whitespace-nowrap text-[11px] leading-normal">Funded Trader</StatusChip>
            {/* Figma: blue verified badge + plain grey label, no chip background */}
            <span className="inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap text-[12px] leading-normal text-white/70">
              <Image src="/images/trader-dashboard/verified.svg" alt="" width={11} height={11} unoptimized className="h-[11px] w-[11px]" />
              Verified
            </span>
          </div>
        </div>

        <div className="flex h-[58px] min-w-[84px] flex-col justify-center border-l-[1.5px] border-gold-accent bg-white/[0.06] px-[14px] backdrop-blur-[6px] max-sm:order-2 max-sm:ml-auto">
          <span className="text-[10px] uppercase leading-none tracking-[0.06em] text-white/50">Rank</span>
          <span className="mt-[6px] text-[22px] leading-none tracking-[-0.4px] text-white">#{trader.rank}</span>
        </div>
      </div>
    </section>
  );
}
