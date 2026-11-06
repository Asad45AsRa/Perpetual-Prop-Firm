import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DASH_ASSETS } from "./data";

/** Dashboard card shell: white/3 fill, 0.7px white/13 border (Figma). */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-[0.7px] border-white/[0.13] bg-white/[0.03]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-[14px] font-normal leading-normal text-white", className)}>{children}</h2>;
}

/** Figma 63×30 filter chip (Earnings range, Payouts status): gold outline when active. */
export const tabChip = (active: boolean) =>
  cn(
    "flex h-[30.27px] w-[63.18px] items-center justify-center text-[10px] leading-normal text-white/50 transition-colors",
    active ? "border-[0.7px] border-gold-accent bg-gold-accent/15" : "border-[0.57px] border-white/[0.06] bg-white/[0.06] hover:text-white/80",
  );

/** Figma 34×34 square pager button; `flip` points the chevron left. */
export function PagerButton({ label, disabled, onClick, flip }: { label: string; disabled: boolean; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-[34.1px] w-[34.1px] items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06] transition-opacity hover:bg-white/10 disabled:opacity-60"
    >
      <Image src={`${DASH_ASSETS}/icons/chevron-right.svg`} alt="" width={18} height={18} unoptimized className={cn("h-[18px] w-[18px]", flip && "rotate-180")} />
    </button>
  );
}

const CHIP_TONES = {
  green: { chip: "bg-[#47a847]/[0.12] text-[#47a847]", border: "border-[#47a847]", dot: "bg-[#47a847]" },
  amber: { chip: "bg-[#E8A23B]/[0.12] text-[#E8A23B]", border: "border-[#E8A23B]", dot: "bg-[#E8A23B]" },
  muted: { chip: "bg-white/[0.06] text-white/50", border: "border-white/30", dot: "bg-white/50" },
} as const;

/** "● Active" / "● Live" (green), "● Pending" (amber) or "● Locked" (muted) chip. */
export function StatusChip({
  children,
  bordered,
  tone = "green",
  className,
}: {
  children: ReactNode;
  bordered?: boolean;
  tone?: keyof typeof CHIP_TONES;
  className?: string;
}) {
  const t = CHIP_TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] px-[10px]",
        t.chip,
        bordered && cn("border-l", t.border),
        className,
      )}
    >
      <span aria-hidden className={cn("h-[5px] w-[5px] rounded-full", t.dot)} />
      {children}
    </span>
  );
}
