"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ───────────────────────── Small UI helpers (shared by all pages) ───────────────────────── */

const box = "border-[0.7px] border-white/[0.08] bg-surface";

export function Card({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn(box, "p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[18px] text-white">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const tones = {
  gold: "bg-gold/15 text-gold-light",
  green: "bg-success/15 text-success",
  red: "bg-red-500/15 text-red-400",
  gray: "bg-white/10 text-white/60",
} as const;

export function Pill({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return <span className={cn("inline-block px-3 py-1 text-[13px]", tones[tone])}>{children}</span>;
}

export function Btn({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border-[0.7px] border-white/[0.13] px-4 py-2 text-[14px] text-white/80 transition-colors hover:border-gold-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function Table({ heads, rows }: { heads: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] text-left text-[15px]">
        <thead>
          <tr className="border-b border-white/[0.08] text-white/40">
            {heads.map((h, i) => <th key={`${h}-${i}`} className="px-2 py-3 font-normal">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/[0.06] last:border-0 text-white/80">
              {r.map((c, j) => <td key={j} className="px-2 py-3.5">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Shown while data loads, when a request fails, or when a list is empty
export function StateMessage({ children, error, onRetry }: { children: ReactNode; error?: boolean; onRetry?: () => void }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 border border-dashed border-white/[0.1] px-6 py-10 text-center text-[15px]",
        error ? "text-red-400" : "text-white/40",
      )}
    >
      {children}
      {onRetry && <Btn onClick={onRetry}>Try again</Btn>}
    </div>
  );
}

/* ───────────────────────── Formatting ───────────────────────── */

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
};

export const formatPnl = (n: number) => `${n < 0 ? "-" : "+"}${formatMoney(Math.abs(n))}`;

export const pnlClass = (n: number) => (n < 0 ? "text-red-400" : "text-success");

// Maps a status word from the backend to a pill color
export function statusTone(status: string): keyof typeof tones {
  const s = status.toLowerCase();
  if (["pending", "open", "warning", "draft", "scheduled", "reviewing"].includes(s)) return "gold";
  if (["approved", "paid", "active", "solved", "resolved", "live", "healthy", "ok", "long", "published", "sent"].includes(s)) return "green";
  if (["rejected", "failed", "suspended", "breached", "down", "closed", "short", "expired"].includes(s)) return "red";
  return "gray";
}
