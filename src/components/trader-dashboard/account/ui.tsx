import type { ReactNode } from "react";
import Image from "next/image";
import type { IconType } from "react-icons";
import { SiBinance, SiBitcoin, SiEthereum, SiSolana } from "react-icons/si";
import { cn } from "@/lib/utils";
import { Panel, PanelTitle } from "@/components/affiliate-dashboard/Panel";
import type { Market } from "./data";

export const GREEN = "#47a847";
export const RED = "#E5484D";
export const BLUE = "#3B6BE8";

export const toneText = (tone?: "green" | "red") => (tone === "green" ? "text-[#47a847]" : tone === "red" ? "text-[#E5484D]" : "text-white");

/** "$1,234.56" / "+$1,234.56" / "-$1,234.56" (Figma uses a true minus in the trade log, kept as ASCII here for copy/paste). */
export const usd = (n: number, signed = false) =>
  `${n < 0 ? "-" : signed && n > 0 ? "+" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COINS: Record<Market, { icon: IconType; bg: string }> = {
  BTC: { icon: SiBitcoin, bg: "#F7931A" },
  ETH: { icon: SiEthereum, bg: "#627EEA" },
  SOL: { icon: SiSolana, bg: "#9945FF" },
  BNB: { icon: SiBinance, bg: "#F3BA2F" },
};

/** Figma coin exports (29px); markets without one fall back to the brand glyph on its colour. */
const COIN_SVGS: Partial<Record<Market, string>> = {
  BTC: "/images/trader-dashboard/btc.svg",
};

export function MarketIcon({ market, size = 29 }: { market: Market; size?: number }) {
  const svg = COIN_SVGS[market];
  if (svg) {
    return <Image src={svg} alt="" aria-hidden width={size} height={size} unoptimized className="shrink-0" style={{ width: size, height: size }} />;
  }
  const { icon: Icon, bg } = COINS[market];
  return (
    <span aria-hidden className="flex shrink-0 items-center justify-center rounded-full text-white" style={{ width: size, height: size, background: bg }}>
      <Icon style={{ width: size * 0.55, height: size * 0.55 }} />
    </span>
  );
}

/** Dashboard card with the Figma 67px header row (title, muted subtitle, optional right-side slot). */
export function Card({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  strip,
}: {
  /** Figma "Stats & Discipline": header sits on a lighter strip with a divider below. */
  strip?: boolean;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Panel className={cn("flex flex-col", className)}>
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 px-[16px] pb-[14px] pt-[17px]",
          strip && "border-b-[0.7px] border-white/[0.06] bg-white/[0.05]",
        )}
      >
        <div>
          <PanelTitle>{title}</PanelTitle>
          {subtitle && <p className="mt-[3px] text-[12px] leading-[1.3] text-white/50">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </Panel>
  );
}

/** Gold-outlined info chip used in card headers ("Unrealized +$560.54", "Daily reset …", "Most common: …"). */
export function GoldChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[30px] items-center gap-[6px] border-l-[1.5px] border-gold-accent bg-gold-accent/15 px-[11px] text-[12px] leading-none text-[#C9B27A]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Large progress ring with the % in the middle (Risk & Rules). */
export function BigRing({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 31;
  const c = 2 * Math.PI * r;
  // A 0% ring still shows a short tick in the rule colour, like the Figma.
  const dash = Math.max((Math.min(pct, 100) / 100) * c, 4);
  return (
    <div role="img" aria-label={`${label} ${pct}%`} className="relative h-[72px] w-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <span aria-hidden className="absolute inset-0 flex items-center justify-center text-[14px] text-white">
        {pct}%
      </span>
    </div>
  );
}

/** Long / Short chip (green / red). */
export function SideChip({ side }: { side: "Long" | "Short" }) {
  return (
    <span
      className={cn(
        "inline-flex h-[30px] items-center px-[11px] text-[12px] leading-none",
        side === "Long" ? "bg-[#47a847]/[0.15] text-[#47a847]" : "bg-[#E5484D]/[0.15] text-[#E5484D]",
      )}
    >
      {side}
    </span>
  );
}
