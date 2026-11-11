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

/** 1-based page numbers to show: first, last and current ±2, with "…" for the gaps. */
export function pageItems(pages: number, current: number): (number | "…")[] {
  const nums = new Set<number>([1, pages]);
  for (let n = current - 2; n <= current + 2; n++) if (n >= 1 && n <= pages) nums.add(n);
  const sorted = [...nums].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Figma footer: "Showing NN of M" + prev / 01 02 … / next (0-based `page`). */
export function NumberedPager({
  page,
  pages,
  shown,
  total,
  onPage,
  label,
}: {
  page: number;
  pages: number;
  shown: number;
  total: number;
  onPage: (page: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t-[0.7px] border-white/[0.06] px-[16px] py-[16px]">
      <p className="text-[12px] text-white/30">
        Showing {pad2(shown)} of {total}
      </p>
      <nav aria-label={label} className="flex flex-wrap items-center gap-[9px]">
        <PagerButton label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)} flip />
        {pageItems(pages, page + 1).map((item, i) =>
          item === "…" ? (
            <span key={`gap-${i}`} aria-hidden className="w-[14px] text-center text-[12px] text-white/30">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page + 1 ? "page" : undefined}
              onClick={() => onPage(item - 1)}
              className={cn(
                "flex h-[34.1px] w-[34.1px] items-center justify-center text-[12px] leading-none transition-colors",
                item === page + 1
                  ? "border-[0.57px] border-gold-accent bg-gold-accent text-white"
                  : "border-[0.57px] border-white/[0.06] bg-white/[0.06] text-white/50 hover:text-white/80",
              )}
            >
              {pad2(item)}
            </button>
          ),
        )}
        <PagerButton label="Next page" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} />
      </nav>
    </div>
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
