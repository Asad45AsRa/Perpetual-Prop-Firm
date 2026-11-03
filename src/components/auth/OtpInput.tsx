"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length: number;
  invalid?: boolean;
  describedBy?: string;
  labelledBy?: string;
};

export function OtpInput({ value, onChange, length, invalid, describedBy, labelledBy }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const write = (next: string[]) => onChange(next.join(""));

  const fill = (start: number, text: string) => {
    const next = [...digits];
    text.split("").forEach((d, k) => {
      if (start + k < length) next[start + k] = d;
    });
    write(next);
    focus(start + text.length);
  };

  const handleChange = (i: number, raw: string) => {
    const only = raw.replace(/\D/g, "");
    if (!only) return;
    if (only.length > 1) {
      // Autofill, or typing into a box that already holds a digit.
      const typed = digits[i] && only.startsWith(digits[i]) ? only.slice(1) : only;
      fill(i, typed);
      return;
    }
    const next = [...digits];
    next[i] = only;
    write(next);
    focus(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (digits[i]) {
        next[i] = "";
      } else if (i > 0) {
        next[i - 1] = "";
        focus(i - 1);
      }
      write(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focus(i + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (text) fill(0, text);
  };

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex justify-between gap-[8px]">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "aspect-square w-full min-w-0 max-w-[57.86px] border-[0.7px] bg-white/[0.06] text-center text-[22px] text-white outline-none transition-colors focus:border-gold-accent",
            invalid ? "border-red-500/60" : "border-white/[0.13]",
          )}
        />
      ))}
    </div>
  );
}
