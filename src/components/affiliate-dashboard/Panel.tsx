import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
