"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { tabChip } from "@/components/affiliate-dashboard/Panel";
import {
  BALANCE_RANGES,
  CALENDAR_START,
  CALENDAR_TODAY,
  calendarPnl,
  equityStats,
  livePositions,
  marketMix,
  realizedBalance,
  riskRules,
  unrealized,
  type BalanceRange,
  type Position,
} from "./data";
import { BLUE, BigRing, Card, GREEN, GoldChip, MarketIcon, RED, SideChip, usd } from "./ui";

/** Four Figma stat tiles (label caps, value, muted note, bottom rule). */
export function StatTiles({ items }: { items: { label: string; value: string; sub?: string; tone?: "green" | "red" }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-[16px] lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="border-b-[1.5px] border-white/30 bg-white/[0.06] px-[15px] pb-[13px] pt-[15px]">
          <dt className="text-[13px] uppercase leading-[1.3] text-white/60 sm:text-[14px]">{s.label}</dt>
          <dd className={cn("mt-[3px] text-[18px] leading-[1.3] sm:text-[20px]", s.tone === "green" ? "text-[#47a847]" : s.tone === "red" ? "text-[#E5484D]" : "text-white")}>{s.value}</dd>
          {s.sub && <dd className="mt-[3px] text-[12px] leading-[1.3] text-white/50 sm:text-[13px]">{s.sub}</dd>}
        </div>
      ))}
    </dl>
  );
}

const RANGE_DAYS: Record<BalanceRange, number> = { All: Infinity, "1d": 2, "7d": 6, "30d": 30 };

function BalanceChart() {
  const [range, setRange] = useState<BalanceRange>("7d");
  const gradId = useId();
  const pts = realizedBalance.slice(0, Math.min(realizedBalance.length, RANGE_DAYS[range]));
  // Figma axis: 95k–110k in 5k steps; widen only if the data leaves it.
  const lo = Math.min(95_000, Math.floor(Math.min(...pts.map((p) => p.balance)) / 5000) * 5000);
  const hi = Math.max(110_000, Math.ceil(Math.max(...pts.map((p) => p.balance)) / 5000) * 5000);
  const ticks = Array.from({ length: (hi - lo) / 5000 + 1 }, (_, i) => hi - i * 5000);
  const n = pts.length;
  const x = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => ((hi - v) / (hi - lo)) * 100;
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.balance)}`).join(" ");
  const area = `${line} L${x(n - 1)},${y(lo)} L${x(0)},${y(lo)} Z`;
  const every = Math.max(1, Math.ceil(n / 6));

  return (
    <Card
      title="Realized balance"
      className="min-w-0"
      action={
        <div role="tablist" aria-label="Range" className="flex gap-[9px]">
          {BALANCE_RANGES.map((r) => (
            <button key={r} role="tab" type="button" aria-selected={range === r} onClick={() => setRange(r)} className={tabChip(range === r)}>
              {r}
            </button>
          ))}
        </div>
      }
      bodyClassName="px-[16px] pb-[16px]"
    >
      <figure aria-label={`Realized balance ${usd(pts[0].balance)} to ${usd(pts[n - 1].balance)} over ${n} days`} className="grid grid-cols-[56px_1fr]">
        <div aria-hidden className="relative h-[208px]">
          {ticks.map((t) => (
            <span key={t} className="absolute left-0 -translate-y-1/2 text-[12px] leading-none text-white/30" style={{ top: `${y(t)}%` }}>
              {t.toLocaleString("en-US")}
            </span>
          ))}
        </div>
        <div>
          <div aria-hidden className="relative h-[208px]">
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 border-t border-white/[0.1]" style={{ top: `${y(t)}%` }} />
            ))}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#99804A" stopOpacity="0.35" />
                  <stop offset="45%" stopColor="#99804A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={area} fill={`url(#${gradId})`} />
              <path d={line} fill="none" stroke="#C9B27A" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>
          </div>
          <div aria-hidden className="relative mt-[10px] h-[14px]">
            {pts.map((p, i) =>
              (i % every === 0 && n - 1 - i >= every / 2) || i === n - 1 ? (
                <span
                  key={p.date}
                  className={cn("absolute whitespace-nowrap text-[12px] leading-none text-white/30", i === 0 ? "" : i === n - 1 ? "-translate-x-full" : "-translate-x-1/2")}
                  style={{ left: `${x(i)}%` }}
                >
                  {p.date}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </figure>
      <p className="mt-[26px] text-[12px] leading-[1.4] text-white/50">
        Settled P&amp;L, fees, funding and disclosed adjustments. Open-position P&amp;L is included in current equity.
      </p>
    </Card>
  );
}

/** Time until the next 00:00 UTC daily reset, refreshed every minute. Empty on the server to avoid a hydration mismatch. */
function useDailyReset() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
      const mins = Math.max(0, Math.floor((next - now.getTime()) / 60_000));
      setLabel(`${Math.floor(mins / 60)}h ${mins % 60}m`);
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);
  return label;
}

function RuleRow({ label, pct, color, lines }: { label: string; pct: number; color: string; lines: { text: string; className?: string }[] }) {
  return (
    <div className="flex items-center gap-[16px] px-[16px] py-[14px]">
      <BigRing pct={pct} color={color} label={label} />
      <div>
        <p className="text-[14px] leading-[1.3] text-white">{label}</p>
        {lines.map((l) => (
          <p key={l.text} className={cn("mt-[3px] text-[12px] leading-[1.3]", l.className ?? "text-white/50")}>
            {l.text}
          </p>
        ))}
      </div>
    </div>
  );
}

function RiskRules({ accountName }: { accountName: string }) {
  const reset = useDailyReset();
  const r = riskRules;
  return (
    <Card
      title="Risk & Rules"
      subtitle={accountName}
      action={
        <GoldChip>
          <RotateCcw aria-hidden className="h-[14px] w-[14px]" />
          Daily reset {reset || "—"}
        </GoldChip>
      }
      bodyClassName="border-t-[0.7px] border-white/[0.06]"
    >
      <RuleRow
        label="Daily Drawdown"
        pct={r.daily.pct}
        color={BLUE}
        lines={[{ text: r.daily.today }, { text: r.daily.left, className: "text-[#5B86F5]" }]}
      />
      <div className="flex items-center justify-between bg-ink/60 px-[16px] py-[10px] text-[12px]">
        <span className="text-white/40">Start of the day balance</span>
        <span className="text-[14px] text-white">{usd(r.startOfDayBalance).replace(".00", "")}</span>
      </div>
      <RuleRow label="Max Drawdown" pct={r.max.pct} color={RED} lines={[{ text: r.max.total }, { text: r.max.left, className: "text-[#E5484D]" }]} />
      <div className="mx-[16px] border-t-[0.7px] border-white/[0.06]" />
      <RuleRow
        label="Profit Target"
        pct={r.target.pct}
        color={GREEN}
        lines={[{ text: r.target.reached, className: "text-[#47a847]" }, { text: r.target.toGo, className: "text-white" }]}
      />
    </Card>
  );
}

/** Share a position/trade: native share sheet where available, otherwise copy a one-line summary. */
export function useShare() {
  const [notice, setNotice] = useState("");
  const share = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Perpeye trade", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setNotice("Trade summary copied to clipboard.");
    } catch {
      // user dismissed the share sheet, or clipboard blocked
      setNotice("");
    }
    setTimeout(() => setNotice(""), 2500);
  };
  return { share, notice };
}

const POS_COLS = "grid grid-cols-[minmax(150px,1.5fr)_92px_60px_1fr_1fr_1.3fr_80px_48px] items-center gap-x-[12px]";

function LivePositions() {
  const { share, notice } = useShare();
  const summary = (p: Position) =>
    `${p.side} ${p.market} ${p.leverage}× · size ${p.size} · entry ${usd(p.entry)} · mark ${usd(p.mark)} · PnL ${usd(p.pnl, true)} (${p.roe >= 0 ? "+" : ""}${p.roe}%)`;

  return (
    <Card
      title="Live positions"
      subtitle={`${livePositions.length} open now`}
      action={<GoldChip>Unrealized {usd(unrealized, true)}</GoldChip>}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div className={cn(POS_COLS, "h-[48px] bg-white/[0.04] px-[16px] text-[12px] text-white/50")}>
            <span>Market</span>
            <span>Direction</span>
            <span>Size</span>
            <span>Entry</span>
            <span>Mark</span>
            <span>PnL (RoE%)</span>
            <span>Opened</span>
            <span className="text-right">Share</span>
          </div>
          <ul>
            {livePositions.map((p) => (
              <li key={p.id} className={cn(POS_COLS, "h-[63px] border-t-[0.7px] border-white/[0.06] px-[16px] text-[14px] text-white/80")}>
                <span className="flex items-center gap-[7px]">
                  <MarketIcon market={p.market} />
                  <span>
                    <span className="flex items-center gap-[6px] text-white">
                      {p.market}
                      <span className="bg-white/[0.1] px-[3px] text-[9px] leading-[12px] text-white/80">{p.leverage}×</span>
                    </span>
                    <span className="block text-[11px] leading-[1.3] text-white/50">Perpetual USD</span>
                  </span>
                </span>
                <span>
                  <SideChip side={p.side} />
                </span>
                <span>{p.size}</span>
                <span>{usd(p.entry)}</span>
                <span>{usd(p.mark)}</span>
                <span className={p.pnl >= 0 ? "text-[#47a847]" : "text-[#E5484D]"}>
                  {usd(p.pnl, true).replace("+", "")} ({p.roe >= 0 ? "+" : ""}
                  {p.roe}%)
                </span>
                <span>{p.opened}</span>
                <span className="text-right">
                  <button
                    type="button"
                    onClick={() => share(summary(p))}
                    aria-label={`Share ${p.side} ${p.market} position`}
                    className="inline-flex h-[30px] w-[30px] items-center justify-center text-white/70 transition-colors hover:text-white"
                  >
                    <Download aria-hidden className="h-[18px] w-[18px]" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p role="status" className="min-h-0 px-[16px] text-[11px] text-[#47a847] empty:hidden">
        {notice}
      </p>
    </Card>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function Calendar() {
  const [{ year, month }, setYm] = useState(CALENDAR_START);
  const shift = (delta: number) => setYm(({ year: y, month: m }) => ({ year: y + Math.floor((m + delta) / 12), month: (m + delta + 12) % 12 }));

  // Monday-first weeks: leading blanks, then the month's days, padded to whole weeks.
  const weeks = useMemo(() => {
    const first = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [year, month]);

  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const fmt = (n: number) => `${n < 0 ? "-" : "+"}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <Card
      title="Calendar"
      action={
        <div className="flex items-center gap-[12px]">
          <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="flex h-[34px] w-[34px] items-center justify-center bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white">
            <ChevronLeft aria-hidden className="h-[16px] w-[16px]" />
          </button>
          <span aria-live="polite" className="min-w-[110px] text-center text-[14px] text-white/70">
            {monthLabel}
          </span>
          <button type="button" aria-label="Next month" onClick={() => shift(1)} className="flex h-[34px] w-[34px] items-center justify-center bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white">
            <ChevronRight aria-hidden className="h-[16px] w-[16px]" />
          </button>
        </div>
      }
      bodyClassName="px-[16px] pb-[20px] pt-[24px]"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-[12px_10px] text-left">
          <caption className="sr-only">Daily PnL for {monthLabel}</caption>
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th key={d} className="pb-[4px] text-center text-[11px] font-normal uppercase text-white/40">
                  {d}
                </th>
              ))}
              <th className="w-[26%] pb-[4px] text-center text-[11px] font-normal uppercase text-white/40">Week</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, w) => {
              const total = week.reduce<number>((s, d) => s + (d ? calendarPnl[iso(year, month, d)] ?? 0 : 0), 0);
              const traded = week.some((d) => d && calendarPnl[iso(year, month, d)] !== undefined);
              return (
                <tr key={w}>
                  {week.map((d, i) => {
                    if (!d) return <td key={i} />;
                    const key = iso(year, month, d);
                    const pnl = calendarPnl[key];
                    return (
                      <td
                        key={i}
                        className={cn(
                          "h-[64px] border-[0.7px] p-[6px] align-top",
                          pnl === undefined ? "border-white/[0.06] bg-ink" : pnl >= 0 ? "border-transparent bg-[#2C4F2C]" : "border-transparent bg-[#4A1A1A]",
                          key === CALENDAR_TODAY && "border-gold-accent/60",
                        )}
                      >
                        <span className="block text-[10px] leading-none text-white/60">{String(d).padStart(2, "0")}</span>
                        {pnl !== undefined && <span className={cn("mt-[16px] block text-[11px] leading-none", pnl >= 0 ? "text-[#7BD77B]" : "text-[#FF8A8A]")}>{fmt(pnl)}</span>}
                      </td>
                    );
                  })}
                  <td className="h-[64px] border-[0.7px] border-gold-accent/25 bg-gold-accent/[0.12] p-[6px] align-top">
                    <span className="block text-[10px] leading-none text-[#C9B27A]">Week {w + 1}</span>
                    {traded && <span className={cn("mt-[16px] block text-[11px] leading-none", total >= 0 ? "text-[#7BD77B]" : "text-[#FF8A8A]")}>{fmt(total)}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MarketMix() {
  return (
    <Card title="Market mix" subtitle={`${marketMix.length} markets traded`} bodyClassName="border-t-[0.7px] border-white/[0.06]">
      <ul>
        {marketMix.map((m) => (
          <li key={m.market} className="flex h-[61px] items-center justify-between border-b-[0.7px] border-white/[0.06] px-[16px] last:border-b-0">
            <span className="flex items-center gap-[7px]">
              <MarketIcon market={m.market} />
              <span>
                <span className="block text-[14px] leading-[1.3] text-white">{m.market}</span>
                <span className="block text-[11px] leading-[1.3] text-white/50">
                  {m.trades} closed trade{m.trades === 1 ? "" : "s"}
                </span>
              </span>
            </span>
            <span className={cn("text-[14px]", m.pnl >= 0 ? "text-[#47a847]" : "text-[#E5484D]")}>{usd(m.pnl, true)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function EquityTab({ accountName }: { accountName: string }) {
  return (
    <div className="flex flex-col gap-[16px]">
      <StatTiles items={equityStats} />
      <div className="grid gap-[16px] xl:grid-cols-[minmax(0,607fr)_minmax(0,487fr)]">
        <BalanceChart />
        <RiskRules accountName={accountName} />
      </div>
      <LivePositions />
      <Calendar />
      <MarketMix />
    </div>
  );
}
