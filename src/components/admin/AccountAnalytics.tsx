"use client";

import type { ReactNode } from "react";
import { useAdminNavigate, useAdminQuery } from "./adminData";
import { Btn, formatMoney, formatPnl, Pill, pnlClass, StateMessage } from "./ui";
import type { AccountAnalyticsData, SideStats } from "./types";

type Row = Record<string, unknown>;

// "1495" -> "24h 55m". Same style the trader sees on the Accounts page.
export function formatMinutes(total: number) {
  const m = Math.max(0, Math.round(total));
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

const box = "border-[0.7px] border-white/[0.08] bg-white/[0.02] p-4";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className={box}>
      <h3 className="text-[15px] text-white">{title}</h3>
      {hint && <p className="mb-3 text-[12px] text-white/40">{hint}</p>}
      <div className={hint ? "" : "mt-3"}>{children}</div>
    </section>
  );
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <li className="flex justify-between gap-4 border-b border-white/[0.06] py-2 text-[14px] text-white/50 last:border-0">
      <span>{label}</span>
      <b className="text-right font-normal text-white">{value}</b>
    </li>
  );
}

const pnl = (n: number) => <span className={pnlClass(n)}>{formatPnl(n)}</span>;

function Kpi({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="border-[0.7px] border-white/[0.08] bg-white/[0.03] p-3">
      <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 text-[20px] text-white">{value}</p>
      {note && <p className="text-[12px] text-white/40">{note}</p>}
    </div>
  );
}

function Side({ title, s }: { title: string; s: SideStats }) {
  return (
    <div className="border-[0.7px] border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex justify-between text-[13px] text-white/50"><span>{title}</span><span>{s.closed} closed</span></div>
      <p className="my-1 text-[22px]">{pnl(s.pnl)}</p>
      <ul>
        <Line label="Hit rate" value={`${s.hitRate.toFixed(1)}%`} />
        <Line label="Avg per trade" value={pnl(s.avgPerTrade)} />
      </ul>
    </div>
  );
}

// Detail tab of the Trading Accounts page.
// Shows the same figures as the trader's own Accounts page, so a support agent and a trader who talk about
// "my profit factor" or "my hit rate" are looking at identical numbers. How each number is calculated is
// written on the Metric Definitions page.
// Data: GET /admin/accounts/:id/analytics
export function AccountAnalytics({ row }: { row: Row }) {
  const go = useAdminNavigate();
  const { data, isPending, error, refetch } = useAdminQuery<AccountAnalyticsData>("accounts", `/admin/accounts/${encodeURIComponent(String(row.id))}/analytics`);

  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const { summary: s, winLoss: w, pace: p, holding: h, sides, calendar, marketMix, stagePath } = data;
  const [year, month] = calendar.month.split("-").map(Number);
  const blanks = (new Date(year, month - 1, 1).getDay() + 6) % 7; // weeks start on Monday, like the trader calendar

  return (
    <div className="grid gap-4">
      <Section title="Stage path" hint={stagePath.challengeRequired ? "Challenge Phase, then Funded Stage, then a payout request." : "This plan has no challenge phase. The account started at the Funded Stage."}>
        <ol className="flex flex-wrap gap-2">
          {stagePath.steps.map((step) => (
            <li key={step.label}>
              <Pill tone={step.state === "done" ? "green" : step.state === "current" ? "gold" : "gray"}>
                {step.label}{step.state === "skipped" ? " (skipped)" : step.state === "locked" ? " (locked)" : step.state === "current" ? " (now)" : ""}
              </Pill>
            </li>
          ))}
        </ol>
      </Section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Equity" value={formatMoney(s.equity)} note="Includes realized PnL" />
        <Kpi label="Realized result" value={pnl(s.realized)} note={`${p.closedTrades} closed trades`} />
        <Kpi label="Hit rate" value={`${s.hitRate.toFixed(1)}%`} note={`${w.winners} won · ${w.losers} lost`} />
        <Kpi label="Profit factor" value={s.profitFactor > 0 ? s.profitFactor.toFixed(2) : "-"} note="After fees & funding" />
        <Kpi label="Gross result" value={pnl(s.grossResult)} />
        <Kpi label="Trading fees" value={formatMoney(s.fees)} />
        <Kpi label="Funding paid" value={pnl(s.funding)} />
        <Kpi label="Net result" value={pnl(s.netResult)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Win / loss split" hint="How the trades resolve">
          <ul>
            <Line label="Winners" value={w.winners} />
            <Line label="Losers" value={w.losers} />
            <Line label="Break-even" value={w.breakEven} />
            <Line label="Average winner" value={pnl(w.avgWinner)} />
            <Line label="Average loser" value={pnl(w.avgLoser)} />
            <Line label="Best trade" value={pnl(w.bestTrade)} />
            <Line label="Worst trade" value={pnl(w.worstTrade)} />
            <Line label="Expectancy" value={pnl(w.expectancy)} />
          </ul>
        </Section>
        <Section title="Pace & discipline" hint="Activity across the account">
          <ul>
            <Line label="Volume traded" value={formatMoney(p.volume)} />
            <Line label="Closed trades" value={p.closedTrades} />
            <Line label="Open right now" value={p.openNow} />
            <Line label="Active days" value={p.activeDays} />
            <Line label="Average hold" value={formatMinutes(p.avgHoldMinutes)} />
            <Line label="Deepest pullback" value={`${p.deepestPullbackPct.toFixed(2)}%`} />
          </ul>
        </Section>
      </div>

      <Section title="Holding time" hint="How long positions stay open">
        <p className="mb-3 text-[13px] text-white/50">Average hold <b className="font-normal text-gold-light">{formatMinutes(h.averageMinutes)}</b> · {h.measured} trades measured</p>
        <ul className="grid gap-2">
          {h.buckets.map((b) => (
            <li key={b.label} className="grid grid-cols-[90px_1fr_40px_50px] items-center gap-3 text-[13px] text-white/60">
              <span>{b.label}</span>
              <span className="h-1.5 bg-white/10"><span className="block h-full bg-gold-accent" style={{ width: `${Math.min(100, b.pct)}%` }} /></span>
              <span className="text-right">{b.count}</span>
              <span className="text-right">{b.pct}%</span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Side title="Long side" s={sides.long} />
        <Side title="Short side" s={sides.short} />
      </div>

      <Section title="Calendar" hint={`Daily result for ${calendar.month}. Green is a profit day, red is a loss day.`}>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-white/40">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d}>{d}</span>)}
          {Array.from({ length: blanks }, (_, i) => <span key={`b${i}`} />)}
          {calendar.days.map((d) => (
            <div
              key={d.date}
              title={d.pnl === null ? "No closed trades" : formatPnl(d.pnl)}
              className={`min-h-[44px] border-[0.7px] border-white/[0.06] p-1 text-left ${d.pnl === null ? "bg-black/20" : d.pnl >= 0 ? "bg-success/20" : "bg-red-500/20"}`}
            >
              <span className="block text-[10px] text-white/50">{d.date.slice(8)}</span>
              {d.pnl !== null && <span className={`block text-[11px] ${pnlClass(d.pnl)}`}>{Math.round(d.pnl)}</span>}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Market mix" hint={`${marketMix.length} markets traded`}>
        {marketMix.length === 0 ? (
          <p className="text-[14px] text-white/40">No closed trades yet.</p>
        ) : (
          <ul>
            {marketMix.map((m) => (
              <Line key={m.market} label={`${m.market} · ${m.closedTrades} closed · ${m.winRate.toFixed(0)}% wins · ${formatMoney(m.volume)} volume`} value={pnl(m.netPnl)} />
            ))}
          </ul>
        )}
      </Section>

      <div><Btn onClick={() => go("metrics")}>How are these numbers calculated?</Btn></div>
    </div>
  );
}
