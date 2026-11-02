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

/** Green "● Active" / "● Live" chip. */
export function StatusChip({
  children,
  bordered,
  className,
}: {
  children: ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] bg-[#47a847]/[0.12] px-[10px] text-[#47a847]",
        bordered && "border-l border-[#47a847]",
        className,
      )}
    >
      <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-[#47a847]" />
      {children}
    </span>
  );
}
