import { cn } from "@/lib/utils";
import { averageHold, holdBuckets, marketBreakdown, paceDiscipline, resultBreakdown, sides, winLossSplit, type StatLine } from "./data";
import { StatTiles } from "./EquityTab";
import { Card, GoldChip, MarketIcon, toneText, usd } from "./ui";

function StatList({ rows }: { rows: StatLine[] }) {
  return (
    <dl className="px-[13px] pb-[6px]">
      {rows.map((r) => (
        <div key={r.label} className="flex h-[40px] items-center justify-between border-b-[0.7px] border-white/[0.06] px-[9px] text-[12px] last:border-b-0">
          <dt className="text-white/50">{r.label}</dt>
          <dd className={toneText(r.tone)}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** One colour per holding-time bucket; the summary bar and the row dots use the same colours. */
const BUCKET_COLORS = ["#5B86F5", "#47A847", "#2BB3A3", "#9B7BF5", "#E8C547", "#F5A623", "#C71919"];

function HoldingTime() {
  const total = holdBuckets.reduce((s, b) => s + b.count, 0);
  const common = holdBuckets.reduce((a, b) => (b.count > a.count ? b : a));
  return (
    <Card
      strip
      title="Holding time"
      subtitle="How long positions stay open"
      action={<GoldChip>Most common: {common.label}</GoldChip>}
      bodyClassName="px-[16px] pb-[20px]"
    >
      <div className="flex gap-[40px] pt-[18px]">
        <div>
          <p className="text-[12px] uppercase text-white/50">Average hold</p>
          <p className="mt-[2px] text-[30px] leading-[1.2] tracking-[-0.6px] text-[#C9B27A] sm:text-[36px]">{averageHold}</p>
        </div>
        <div>
          <p className="text-[12px] uppercase text-white/50">Trades measured</p>
          <p className="mt-[2px] text-[30px] leading-[1.2] tracking-[-0.6px] text-white sm:text-[36px]">{total}</p>
        </div>
      </div>

      {/* Distribution bar: each bucket's share, in its colour (Figma: orange 4–24h, red over 24h). */}
      <div role="img" aria-label={holdBuckets.filter((b) => b.count).map((b) => `${b.label} ${Math.round((b.count / total) * 100)}%`).join(", ")} className="mt-[18px] flex h-[6px] gap-[3px]">
        {holdBuckets.map((b, i) =>
          b.count ? <span key={b.label} className="h-full" style={{ flexGrow: b.count, background: BUCKET_COLORS[i] }} /> : null,
        )}
      </div>

      <ul className="mt-[14px] border-t-[0.7px] border-white/[0.13]">
        {holdBuckets.map((b, i) => {
          const pct = total ? Math.round((b.count / total) * 100) : 0;
          return (
            <li key={b.label} className="grid h-[46px] grid-cols-[92px_1fr_28px_40px] items-center gap-x-[12px] border-b-[0.7px] border-white/[0.06] text-[12px] last:border-b-0 sm:grid-cols-[108px_1fr_28px_40px]">
              {/* Figma: square colour key; buckets with no trades are dimmed */}
              <span className={cn("flex items-center gap-[8px]", b.count ? "text-white" : "text-white/30")}>
                <span aria-hidden className={cn("h-[6px] w-[6px] shrink-0", !b.count && "opacity-40")} style={{ background: BUCKET_COLORS[i] }} />
                {b.label}
              </span>
              <span aria-hidden className="h-[4px] rounded-full bg-white/[0.06]">
                <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: BUCKET_COLORS[i] }} />
              </span>
              <span className={cn("text-right", b.count ? "text-white" : "text-white/30")}>{b.count}</span>
              <span className={cn("text-right", b.count ? "text-white" : "text-white/30")}>{pct}%</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function SideCard({ s }: { s: (typeof sides)[number] }) {
  return (
    <Card title={s.side} action={<span className="pt-[2px] text-[12px] text-white/50">{s.closed} closed</span>} bodyClassName="px-[16px] pb-[16px]">
      <p className={cn("text-[34px] leading-[1.2] tracking-[-0.7px] sm:text-[40px]", toneText(s.tone))}>{s.result}</p>
      <dl className="mt-[12px] text-[12px]">
        <div className="flex justify-between border-b-[0.7px] border-white/[0.13] pb-[9px]">
          <dt className="text-white/50">Hit rate</dt>
          <dd className="text-white">{s.hitRate}</dd>
        </div>
        <div className="flex justify-between pt-[9px]">
          <dt className="text-white/50">Avg per trade</dt>
          <dd className={toneText(s.tone)}>{s.avg}</dd>
        </div>
      </dl>
    </Card>
  );
}

const MB_COLS = "grid grid-cols-[minmax(110px,1.4fr)_minmax(110px,1.2fr)_0.7fr_0.8fr_0.8fr_0.9fr] items-center gap-x-[12px]";

function MarketBreakdown() {
  return (
    <Card title="Market breakdown" subtitle="Volume, costs and result per market">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className={cn(MB_COLS, "h-[47px] bg-white/[0.04] px-[16px] text-[12px] text-white/50")}>
            <span>Market</span>
            <span>Volume</span>
            <span>Trades</span>
            <span>Win rate</span>
            <span>Costs</span>
            <span className="text-right">Net PnL</span>
          </div>
          <ul>
            {marketBreakdown.map((m) => (
              <li key={m.market} className={cn(MB_COLS, "h-[68px] border-t-[0.7px] border-white/[0.06] px-[16px] text-[13px] text-white")}>
                <span className="flex items-center gap-[7px]">
                  <MarketIcon market={m.market} />
                  {m.market}
                </span>
                <span>
                  <span className="block">{m.volume}</span>
                  <span className="block text-[11px] text-white/50">{m.share}</span>
                </span>
                <span>{m.trades}</span>
                <span>{m.winRate}</span>
                <span>{m.costs}</span>
                <span className={cn("text-right", m.net >= 0 ? "text-[#47a847]" : "text-[#C71919]")}>{usd(m.net, true)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

/** Figma "Stats & Discipline" tab (frame 1669:2356). */
export function StatsTab() {
  return (
    <div className="flex flex-col gap-[16px]">
      <StatTiles items={resultBreakdown.map((r) => ({ label: r.label, value: r.value, tone: "tone" in r ? r.tone : undefined }))} />
      <div className="grid gap-[16px] lg:grid-cols-2">
        <Card strip title="Win / loss split" subtitle="How your trades resolve" bodyClassName="pt-[6px]">
          <StatList rows={winLossSplit} />
        </Card>
        <Card strip title="Pace & discipline" subtitle="Activity across the account" bodyClassName="pt-[6px]">
          <StatList rows={paceDiscipline} />
        </Card>
      </div>
      <HoldingTime />
      <div className="grid gap-[16px] lg:grid-cols-2">
        {sides.map((s) => (
          <SideCard key={s.side} s={s} />
        ))}
      </div>
      <MarketBreakdown />
    </div>
  );
}
