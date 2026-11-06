"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
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

const btnTones = {
  default: "border-white/[0.13] text-white/80 hover:border-gold-accent hover:text-white",
  gold: "border-gold-accent bg-gold/15 text-gold-light hover:text-white",
  success: "border-success/40 bg-success/15 text-success hover:border-success",
  danger: "border-red-500/40 text-red-400 hover:border-red-400",
} as const;

export function Btn({
  children,
  onClick,
  disabled,
  tone = "default",
  type = "button",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: keyof typeof btnTones;
  type?: "button" | "submit";
  title?: string;
}) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "border-[0.7px] px-4 py-2 text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        btnTones[tone],
      )}
    >
      {children}
    </button>
  );
}

export function Table({ heads, rows }: { heads: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] text-left text-[15px]">
        <thead>
          <tr className="border-b border-white/[0.08] text-white/40">
            {heads.map((h, i) => <th key={i} className="px-2 py-3 font-normal">{h}</th>)}
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
  const gold = ["pending", "open", "warning", "draft", "scheduled", "reviewing", "review", "medium", "in progress", "normal", "awaiting approval", "new", "acknowledged", "resubmit", "degraded", "running", "escalated", "underpaid", "overpaid", "disputed", "reduce-only"];
  const green = ["approved", "paid", "active", "solved", "resolved", "live", "healthy", "ok", "long", "published", "sent", "enabled", "closed", "passed", "verified", "delivered", "processed", "valid", "balanced", "visible", "success", "fixed", "clear", "low", "overridden"];
  const red = ["rejected", "failed", "suspended", "breached", "down", "short", "expired", "disabled", "high", "locked", "mismatch", "bounced", "invalid", "denied", "critical", "blocked", "halted", "flagged"];
  if (gold.includes(s)) return "gold";
  if (green.includes(s)) return "green";
  if (red.includes(s)) return "red";
  return "gray";
}

/* ───────────────────────── Form controls ───────────────────────── */

const control =
  "h-[40px] w-full border-[0.7px] border-white/[0.13] bg-white/[0.06] px-[14px] text-[14px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-gold-accent";

export function FormField({ label, htmlFor, error, children }: { label: string; htmlFor?: string; error?: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-2 block text-[12px] text-white/40">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1.5 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function SelectInput({ options, className, ...props }: { options: readonly string[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, className)} {...props}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "h-auto min-h-[88px] resize-y py-2.5 leading-relaxed", className)} {...props} />;
}

// Horizontal tab strip used by drawers and multi-section pages
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) {
  return (
    <div role="tablist" className="mb-5 flex flex-wrap gap-1 border-b border-white/[0.08]">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={active === t}
          onClick={() => onChange(t)}
          className={cn(
            "px-4 py-2.5 text-[14px] transition-colors",
            active === t ? "border-b-2 border-gold-accent text-gold-light" : "text-white/50 hover:text-white",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// Value is a percentage from 0 to 100. The bar turns red close to a limit.
export function ProgressBar({ value, warnAt = 80 }: { value: number; warnAt?: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-[90px] bg-white/10">
        <div className={cn("h-full", v >= warnAt ? "bg-red-400" : "bg-success")} style={{ width: `${v}%` }} />
      </div>
      <span className="text-[13px] text-white/60">{v.toFixed(0)}%</span>
    </div>
  );
}

// "5 min ago", "3 h ago"... for feeds where the exact clock time matters less than the age
export function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "-";
  const min = Math.max(0, Math.round(ms / 60_000));
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  if (min < 60 * 24) return `${Math.round(min / 60)} h ago`;
  return `${Math.round(min / 60 / 24)} d ago`;
}

// Error text for toasts. The request id lets a developer find the exact server log line.
export function describeError(err: unknown) {
  const e = err as { message?: string; requestId?: string };
  const text = e?.message || "Something went wrong.";
  return e?.requestId ? `${text} (ref ${e.requestId})` : text;
}

/* ───────────────────────── Modal ───────────────────────── */

// Simple accessible dialog: closes on Escape and on a click outside the panel
export function Modal({ title, subtitle, onClose, children, wide }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cn("max-h-[90vh] w-full overflow-y-auto border-[0.7px] border-white/[0.13] bg-surface p-6", wide ? "max-w-[860px]" : "max-w-[520px]")}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-[14px] text-white/40">{subtitle}</p>}
          </div>
          <Btn onClick={onClose}>Close</Btn>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────── Toast ───────────────────────── */

type ToastFn = (message: string, isError?: boolean) => void;
const ToastContext = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback<ToastFn>((message, isError = false) => {
    setToast({ message, isError });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed bottom-6 left-1/2 z-[60] max-w-[calc(100vw-32px)] -translate-x-1/2 border-[0.7px] bg-surface px-5 py-3 text-[14px]",
            toast.isError ? "border-red-500/50 text-red-400" : "border-gold-accent text-white",
          )}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/* ───────────────────────── CSV export ───────────────────────── */

// Downloads rows as a CSV file (client-side, no backend call needed)
export function downloadCsv(fileName: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return false;
  const keys = Object.keys(rows[0]);
  const cell = (v: unknown) => `"${(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "")).replace(/"/g, '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => cell(r[k])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
