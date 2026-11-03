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
        // Once a pick exists, every other avatar is blurred + faded so the pick stands out;
        // hover/keyboard focus partly clears it so faces stay identifiable.
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
              sizes={`${size}px`}
              className={cn(
                "rounded-full object-cover transition-[filter,opacity] duration-300 ease-out motion-reduce:transition-none",
                dimmed &&
                  "opacity-60 blur-[2px] group-hover:opacity-90 group-hover:blur-[0.5px] group-focus-visible:opacity-90 group-focus-visible:blur-[0.5px]",
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
