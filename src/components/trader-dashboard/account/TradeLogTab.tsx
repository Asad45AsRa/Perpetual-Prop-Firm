"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { tabChip } from "@/components/affiliate-dashboard/Panel";
import { TRADE_FILTERS, tradeLog, type ClosedTrade, type TradeFilter } from "./data";
import { useShare } from "./EquityTab";
import { Card, MarketIcon, usd } from "./ui";

const COLS = "grid grid-cols-[minmax(96px,1fr)_130px_130px_70px_90px_70px_70px_90px_44px] items-center gap-x-[12px]";
const signed = (n: number) => (n < 0 ? "text-[#E5484D]" : n > 0 ? "text-[#47a847]" : "text-white");

/** Figma "Trade Log" tab (frame 1669:3245): closed trades with UTC open/close, duration, gross, fees, funding, net and share. */
export function TradeLogTab() {
  const [filter, setFilter] = useState<TradeFilter>("All");
  const { share, notice } = useShare();
  const rows = filter === "All" ? tradeLog : tradeLog.filter((t) => t.side === filter);
  const summary = (t: ClosedTrade) => `${t.side} ${t.market} · ${t.opened} → ${t.closed} UTC (${t.duration}) · net ${usd(t.net, true)}`;

  return (
    <Card
      title="Trade log"
      subtitle={`${tradeLog.length} closed`}
      action={
        <div role="tablist" aria-label="Direction" className="flex gap-[9px]">
          {TRADE_FILTERS.map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={tabChip(filter === f)}>
              {f}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">Closed trades</caption>
          <thead>
            <tr className={cn(COLS, "h-[47px] bg-white/[0.04] px-[16px] text-[12px] text-white/50")}>
              <th className="font-normal">Market</th>
              <th className="font-normal">Opened (UTC)</th>
              <th className="font-normal">Closed (UTC)</th>
              <th className="font-normal">Duration</th>
              <th className="font-normal">Gross P&amp;L</th>
              <th className="font-normal">Fees</th>
              <th className="font-normal">Funding</th>
              <th className="font-normal">Net P&amp;L</th>
              <th className="text-right font-normal">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className={cn(COLS, "h-[61px] border-t-[0.7px] border-white/[0.06] px-[16px] text-[13px] text-white/80")}>
                <td className="flex items-center gap-[7px]">
                  <MarketIcon market={t.market} />
                  <span>
                    <span className="block text-[13px] leading-[1.2] text-white">{t.market}</span>
                    <span className={cn("block text-[11px] leading-[1.3]", t.side === "Long" ? "text-[#47a847]" : "text-[#E5484D]")}>{t.side}</span>
                  </span>
                </td>
                <td>{t.opened}</td>
                <td>{t.closed}</td>
                <td>{t.duration}</td>
                <td className={signed(t.gross)}>{usd(t.gross, true)}</td>
                <td>{usd(t.fees)}</td>
                <td className={signed(t.funding)}>{usd(t.funding, true)}</td>
                <td className={signed(t.net)}>{usd(t.net, true)}</td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => share(summary(t))}
                    aria-label={`Share ${t.side} ${t.market} trade closed ${t.closed}`}
                    className="inline-flex h-[30px] w-[30px] items-center justify-center text-white/70 transition-colors hover:text-white"
                  >
                    <Download aria-hidden className="h-[18px] w-[18px]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="border-t-[0.7px] border-white/[0.06] py-10 text-center text-[13px] text-white/50">No {filter.toLowerCase()} trades.</p>}
      </div>
      <p role="status" className="px-[16px] pb-[10px] text-[11px] text-[#47a847] empty:hidden">
        {notice}
      </p>
    </Card>
  );
}
