import { cn } from "@/lib/utils";

type StepperProps = { total: number; current: number; className?: string };

/**
 * Figma "Loading" bar: 5px track (white/13) with a gold fill running to the
 * current dot; 22px dots — reached ones gold with an inner shadow, the rest #2E2E2E.
 */
export function Stepper({ total, current, className }: StepperProps) {
  const progress = total > 1 ? current / (total - 1) : 0;

  return (
    <div
      role="progressbar"
      aria-label="Onboarding progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-valuetext={`Step ${current + 1} of ${total}`}
      className={cn("relative h-[22px] w-full", className)}
    >
      <span className="absolute inset-x-0 top-[10px] h-[5px] rounded-full bg-white/[0.13]" />
      <span
        className="absolute left-0 top-[10px] h-[5px] rounded-full bg-gold-accent transition-[width] duration-500 ease-out"
        style={{ width: `calc((100% - 22px) * ${progress} + 11px)` }}
      />
      <div className="relative flex h-full items-center justify-between">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-[22px] w-[22px] rounded-full border border-gold-accent transition-colors duration-300",
              i <= current
                ? "bg-gold-accent shadow-[inset_0_4px_4px_#0f0f0f]"
                : "bg-[#2E2E2E]",
            )}
          />
        ))}
      </div>
    </div>
  );
}
