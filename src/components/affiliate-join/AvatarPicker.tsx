"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { AVATARS } from "./constants";

type AvatarPickerProps = {
  value: string;
  onChange: (src: string) => void;
  /** Grid columns/width, e.g. "max-w-[376px] grid-cols-7". */
  className?: string;
  /** Rendered avatar size, for next/image `sizes`. */
  size?: number;
  describedBy?: string;
};

/** Radio-group grid of the 21 avatars. Shared by onboarding and the affiliate profile page. */
export function AvatarPicker({ value, onChange, className, size = 46, describedBy }: AvatarPickerProps) {
  return (
    <div role="radiogroup" aria-label="Avatar" aria-describedby={describedBy} className={cn("grid", className)}>
      {AVATARS.map((src, i) => {
        const selected = value === src;
        // Once a pick exists, every other avatar is faded (no blur, so faces stay sharp) so the
        // pick stands out; hover/keyboard focus restores full opacity.
        const dimmed = !!value && !selected;
        return (
          <button
            key={src}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Avatar ${i + 1}`}
            onClick={() => onChange(src)}
            className={cn(
              "group relative aspect-square w-full overflow-hidden rounded-full outline-none",
              "focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              // ~3× the slot so avatars stay sharp when the page is zoomed.
              sizes={`${size * 3}px`}
              className={cn(
                "rounded-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none",
                dimmed && "opacity-40 group-hover:opacity-100 group-focus-visible:opacity-100",
              )}
            />
            {/* Figma: 1.5px white border on the selected avatar */}
            <span
              className={cn(
                "absolute inset-0 rounded-full border-[1.5px] transition-colors",
                selected ? "border-white" : "border-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
