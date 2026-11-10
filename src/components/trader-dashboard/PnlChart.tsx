"use client";

import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { Panel, PanelTitle, tabChip } from "@/components/affiliate-dashboard/Panel";
import { AccountSelect } from "./AccountSelect";
import { PNL_RANGES, pnlByAccount, type PnlDay, type PnlRange } from "./data";

/** Starting balance per selection, for the Net PnL return %. */
const ACCOUNT_SIZE: Record<string, number> = { all: 150_000, "PE-2": 50_000, "PE-1": 100_000 };
const RANGE_DAYS: Record<PnlRange, number> = { All: Infinity, "30d": 30, "7d": 7 };

const GREEN = "#47a847";
const RED = "#E5484D";

export const money = (n: number, signed = false) =>
  `${n < 0 ? "-" : signed && n > 0 ? "+" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Round step for ~4 grid intervals (1, 2, 2.5, 5 × 10^n). */
function niceStep(span: number) {
  const raw = span / 4 || 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 2.5, 5, 10].find((m) => m * pow >= raw) ?? 10) * pow;
}

function summarize(days: PnlDay[], size: number) {
  const traded = days.filter((d) => d.pnl !== 0);
  const wins = traded.filter((d) => d.pnl > 0);
  const gross = wins.reduce((s, d) => s + d.pnl, 0);
  const loss = Math.abs(traded.filter((d) => d.pnl < 0).reduce((s, d) => s + d.pnl, 0));
  const net = days.reduce((s, d) => s + d.pnl, 0);
  let peak = 0;
  let cum = 0;
  let maxDd = 0;
  for (const d of days) {
    cum += d.pnl;
    peak = Math.max(peak, cum);
    maxDd = Math.min(maxDd, cum - peak);
  }
  const best = traded.reduce<PnlDay | null>((b, d) => (!b || d.pnl > b.pnl ? d : b), null);
  const worst = traded.reduce<PnlDay | null>((w, d) => (!w || d.pnl < w.pnl ? d : w), null);
  return {
    net,
    netPct: (net / size) * 100,
    best,
    worst,
    winDays: wins.length,
    tradingDays: traded.length,
    profitFactor: loss === 0 ? null : gross / loss,
    maxDd,
  };
}

/** Figma "Cumulative PnL": account select, range chips, line+area chart with daily profit/loss bars and a hover/drag inspector, 6 stat tiles. */
export function PnlChart() {
  const [account, setAccount] = useState("all");
  const [range, setRange] = useState<PnlRange>("All");
  const [active, setActive] = useState<number | null>(null);
  const gradId = useId();

  const days = useMemo(() => {
    const all = pnlByAccount[account] ?? [];
    return all.slice(Math.max(0, all.length - RANGE_DAYS[range]));
  }, [account, range]);

  const cumulative = useMemo(() => {
    let s = 0;
    return days.map((d) => (s += d.pnl));
  }, [days]);

  const lo = Math.min(0, ...cumulative);
  const hi = Math.max(0, ...cumulative);
  const step = niceStep(hi - lo);
  const yMin = Math.floor(lo / step) * step;
  const yMax = Math.max(Math.ceil(hi / step) * step, yMin + step);
  const ticks = Array.from({ length: Math.round((yMax - yMin) / step) + 1 }, (_, i) => yMax - i * step);

  const n = days.length;
  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => ((yMax - v) / (yMax - yMin)) * 100;
  const line = cumulative.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const area = `${line} L${x(n - 1)},${y(yMin)} L${x(0)},${y(yMin)} Z`;
  const maxAbs = Math.max(1, ...days.map((d) => Math.abs(d.pnl)));
  const labelEvery = Math.max(1, Math.ceil(n / 6));

  const s = summarize(days, ACCOUNT_SIZE[account] ?? ACCOUNT_SIZE.all);
  const sel = active === null ? null : { i: active, day: days[active], cum: cumulative[active] };

  const inspect = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setActive(Math.round(t * (n - 1)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setActive((a) => Math.min(n - 1, Math.max(0, (a ?? n - 1) + (e.key === "ArrowRight" ? 1 : -1))));
  };

  const tiles = [
    { label: "Net PnL", value: money(s.net, true), sub: `${s.netPct >= 0 ? "+" : ""}${s.netPct.toFixed(2)}%`, tone: s.net >= 0 ? "green" : "red" },
    { label: "Best Day", value: s.best ? money(s.best.pnl, true) : "—", sub: s.best?.date ?? "", tone: "green" },
    { label: "Worst Day", value: s.worst ? money(s.worst.pnl, true) : "—", sub: s.worst?.date ?? "", tone: s.worst && s.worst.pnl < 0 ? "red" : undefined },
    {
      label: "Win Days",
      value: `${s.winDays} / ${s.tradingDays}`,
      sub: `${s.tradingDays ? Math.round((s.winDays / s.tradingDays) * 100) : 0}% of trading days`,
    },
    { label: "Profit Factor", value: s.profitFactor === null ? "∞" : s.profitFactor.toFixed(2), sub: "Wins ÷ losses" },
    { label: "Max Drawdown", value: money(s.maxDd), sub: "Peak to trough", tone: s.maxDd < 0 ? "red" : undefined },
  ] as const;

  return (
    <Panel className="px-[16px] pb-[16px] pt-[16.7px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <PanelTitle>Cumulative PnL</PanelTitle>
          <AccountSelect id="pnl-account" value={account} onChange={(v) => { setAccount(v); setActive(null); }} className="mt-[8px]" />
        </div>
        <div role="tablist" aria-label="Range" className="flex gap-[9px]">
          {PNL_RANGES.map((r) => (
            <button key={r} role="tab" type="button" aria-selected={range === r} onClick={() => { setRange(r); setActive(null); }} className={tabChip(range === r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Plot: y labels column + chart area */}
      <div className="mt-[18px] grid grid-cols-[44px_1fr]">
        <div className="relative h-[220px]">
          {ticks.map((t) => (
            <span key={t} className="absolute right-[8px] -translate-y-1/2 text-[10px] leading-none text-white/30" style={{ top: `${y(t)}%` }}>
              {t < 0 ? "-" : ""}${Math.abs(t) >= 1000 ? `${(Math.abs(t) / 1000).toFixed(Math.abs(t) % 1000 ? 1 : 0)}k` : Math.abs(t)}
            </span>
          ))}
        </div>

        <div>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Inspect day"
            aria-valuemin={1}
            aria-valuemax={n}
            aria-valuenow={(active ?? n - 1) + 1}
            aria-valuetext={sel ? `${sel.day.label}: cumulative ${money(sel.cum)}, day ${money(sel.day.pnl, true)}` : undefined}
            onPointerMove={inspect}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              inspect(e);
            }}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            onKeyDown={onKey}
            onBlur={() => setActive(null)}
            className="relative h-[220px] cursor-crosshair touch-none outline-none focus-visible:ring-1 focus-visible:ring-gold-accent/60"
          >
            {ticks.map((t) => (
              <div key={t} aria-hidden className="absolute inset-x-0 border-t border-dashed border-white/[0.08]" style={{ top: `${y(t)}%` }} />
            ))}

            {/* Daily profit/loss bars along the bottom */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[28px]">
              {days.map((d, i) =>
                d.pnl === 0 ? null : (
                  <span
                    key={i}
                    className="absolute bottom-0 w-[4px] -translate-x-1/2 rounded-t-[1px] opacity-60"
                    style={{ left: `${x(i)}%`, height: `${Math.max(3, (Math.abs(d.pnl) / maxAbs) * 28)}px`, background: d.pnl > 0 ? GREEN : RED }}
                  />
                ),
              )}
            </div>

            <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill={`url(#${gradId})`} />
              <path d={line} fill="none" stroke={GREEN} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>

            {sel && (
              <>
                <div aria-hidden className="pointer-events-none absolute inset-y-0 border-l border-dashed border-white/30" style={{ left: `${x(sel.i)}%` }} />
                <span
                  aria-hidden
                  className="pointer-events-none absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-white"
                  style={{ left: `${x(sel.i)}%`, top: `${y(sel.cum)}%` }}
                />
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute top-[6px] z-10 w-[150px] border-[0.7px] border-white/[0.13] bg-[rgba(22,22,24,0.92)] px-[10px] py-[8px] text-[11px] leading-[1.5] shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-[8px]",
                    x(sel.i) > 60 ? "-translate-x-[calc(100%+10px)]" : "translate-x-[10px]",
                  )}
                  style={{ left: `${x(sel.i)}%` }}
                >
                  <p className="text-white">{sel.day.label}</p>
                  <p className="flex justify-between text-white/50">
                    Cumulative <span className="text-white">{money(sel.cum)}</span>
                  </p>
                  <p className="flex justify-between text-white/50">
                    Day PnL <span style={{ color: sel.day.pnl < 0 ? RED : GREEN }}>{money(sel.day.pnl, true)}</span>
                  </p>
                  <p className="flex justify-between text-white/50">
                    Trades <span className="text-white">{sel.day.trades}</span>
                  </p>
                </div>
              </>
            )}
          </div>

          <div aria-hidden className="relative mt-[8px] h-[14px]">
            {days.map((d, i) =>
              (i % labelEvery === 0 && n - 1 - i >= labelEvery / 2) || i === n - 1 ? (
                <span
                  key={i}
                  className={cn(
                    "absolute whitespace-nowrap text-[10px] leading-none text-white/30",
                    i === 0 ? "" : i === n - 1 ? "-translate-x-full" : "-translate-x-1/2",
                  )}
                  style={{ left: `${x(i)}%` }}
                >
                  {d.date}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>

      <ul className="mt-[16px] flex flex-wrap items-center gap-x-[18px] gap-y-[8px] text-[13px] leading-none text-white/80">
        <li className="flex items-center gap-[6px]">
          <span aria-hidden className="h-[2px] w-[16px] shrink-0 rounded-full" style={{ background: GREEN }} /> Cumulative PnL
        </li>
        <li className="flex items-center gap-[6px]">
          <span aria-hidden className="h-[2px] w-[16px] shrink-0 rounded-full" style={{ background: GREEN }} /> Profit day
        </li>
        <li className="flex items-center gap-[6px]">
          <span aria-hidden className="h-[2px] w-[16px] shrink-0 rounded-full" style={{ background: RED }} /> Loss day
        </li>
        <li className="text-[12px] text-white/30">Hover or drag to inspect any day</li>
      </ul>

      <dl className="mt-[16px] grid grid-cols-2 gap-[8px] sm:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="border-[0.7px] border-white/[0.06] bg-white/[0.03] px-[12px] py-[10px]">
            <dt className="text-[9px] uppercase leading-[1.2] tracking-[0.05em] text-white/40">{t.label}</dt>
            <dd
              className={cn(
                "mt-[4px] text-[15px] leading-[1.2]",
                "tone" in t && t.tone === "green" ? "text-[#47a847]" : "tone" in t && t.tone === "red" ? "text-[#E5484D]" : "text-white",
              )}
            >
              {t.value}
            </dd>
            <dd className="mt-[2px] text-[10px] leading-[1.3] text-white/30">{t.sub}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
