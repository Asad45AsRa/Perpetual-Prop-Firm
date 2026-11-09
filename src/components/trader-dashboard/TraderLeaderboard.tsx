import Link from "next/link";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/affiliate-dashboard/Panel";
import { Avatar, LeaderboardHeader } from "@/components/affiliate-dashboard/Leaderboard";
import { TRADER_BASE, traderLeaderboard, type TraderRow } from "./data";

const COLS = {
  card: "grid grid-cols-[44px_minmax(96px,1fr)_76px_64px_60px_40px] items-center gap-x-[6px]",
  page: "grid grid-cols-[56px_minmax(120px,1.6fr)_1fr_1fr_1fr_88px] items-center gap-x-[10px]",
};

function Row({ t, you, cols }: { t: TraderRow; you?: boolean; cols: string }) {
  return (
    <li
      className={cn(
        cols,
        "h-[48px] text-[13px] leading-normal",
        you ? "border-l-2 border-gold-accent bg-[linear-gradient(90deg,rgba(153,128,74,0.15),rgba(153,128,74,0))] pl-[10px] pr-[12px]" : "border-b-[0.7px] border-white/[0.13] px-[12px]",
      )}
    >
      <span className="text-[12px] text-white/50">{String(t.rank).padStart(2, "0")}</span>
      <span className="flex min-w-0 items-center gap-[7px] text-white">
        <Avatar src={t.avatar} />
        <span className="truncate">{t.name}</span>
      </span>
      <span className="text-[#47a847]">{t.pnl}</span>
      <span className="text-white/70">{t.winRate}</span>
      <span className="text-white/70">{t.volume}</span>
      <span className="text-right text-[#47a847]">{t.trades}</span>
    </li>
  );
}

/**
 * Trader leaderboard: shared podium header, PnL / Win Rate / Volume / Trades table, your position.
 * `page` = full-width "Top Performers" page (bigger podium, all rows); default = Home card (top 3 + View Leaderboard).
 */
export function TraderLeaderboard({ page }: { page?: boolean }) {
  const { period, podium, rows, you } = traderLeaderboard;
  const cols = page ? COLS.page : COLS.card;
  const shown = page ? rows : rows.slice(0, 3);

  return (
    <Panel className="flex flex-col pb-[16px]">
      <LeaderboardHeader period={period} podium={podium} large={page} />

      {/* Six columns don't fit a phone: the table scrolls sideways inside the card. */}
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <div className={page ? "min-w-[560px]" : "min-w-[400px]"}>
          <div className={cn(cols, "h-[42px] bg-ink px-[12px] text-[11px] leading-[1.3] text-white/30")}>
            <span>Rank</span>
            <span>Trader</span>
            <span>PnL</span>
            <span>Win Rate</span>
            <span>Volume</span>
            <span className="text-right">{page ? "Total Trades" : "Trades"}</span>
          </div>
          <ol className="px-[4px]">
            {shown.map((t) => (
              <Row key={t.rank} t={t} cols={cols} />
            ))}
          </ol>

          <p className="mt-[20px] px-[16px] text-[12px] leading-[1.3] text-white/30">Your position</p>
          <ol className="mt-[10px] px-[4px]">
            <Row t={you} you cols={cols} />
          </ol>
        </div>
      </div>

      {!page && (
        <div className="px-[16px] pt-[16px]">
          <Link
            href={`${TRADER_BASE}/leaderboard`}
            className="flex h-[41px] w-full items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06] text-[13px] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-accent"
          >
            View Leaderboard
          </Link>
        </div>
      )}
    </Panel>
  );
}
