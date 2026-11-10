import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCOUNT_OPTIONS } from "./data";

/** Small "All ▾" account picker (Figma), a native select so keyboard/screen-reader behaviour comes for free. */
export function AccountSelect({
  id,
  value,
  onChange,
  options = ACCOUNT_OPTIONS,
  label = "Account",
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options?: { value: string; label: string }[];
  /** Screen-reader label (visually hidden). */
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-[110px]", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[28px] w-full appearance-none border-[0.57px] border-white/[0.13] bg-white/[0.06] pl-[10px] pr-[26px] text-[11px] text-white outline-none transition-colors focus:border-gold-accent [&>option]:bg-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-[8px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-white/50" />
    </div>
  );
}
