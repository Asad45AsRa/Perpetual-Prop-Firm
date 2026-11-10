"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatUsd, PAYOUT_FILTERS, type Payout, type PayoutFilter } from "../data";
import { pad2, pageItems, PagerButton, Panel, StatusChip, tabChip } from "../Panel";

const PAGE_SIZE = 7;
const COLS = "grid grid-cols-[1fr_1.3fr_1fr_auto] items-center px-[16px]";
/** Payout history (Figma "Payouts" left card): status filter chips, 7 rows per page, numbered pager.
 *  Table on tablet+, stacked cards on mobile. */
export function PayoutHistory({ payouts }: { payouts: Payout[] }) {
  const [filter, setFilter] = useState<PayoutFilter>("All");
  const [page, setPage] = useState(0);

  const filtered = filter === "All" ? payouts : payouts.filter((p) => p.status === filter);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1); // clamp if a filter/withdrawal shrank the list
  const rows = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const select = (f: PayoutFilter) => {
    setFilter(f);
    setPage(0);
  };

  return (
    <Panel className="self-start">
      <div role="tablist" aria-label="Payout status" className="flex justify-end gap-[9px] px-[16px] pb-[14px] pt-[16px]">
        {PAYOUT_FILTERS.map((f) => (
          <button key={f} role="tab" type="button" aria-selected={filter === f} onClick={() => select(f)} className={tabChip(filter === f)}>
            {f}
          </button>
        ))}
      </div>

      <table className="hidden w-full border-separate border-spacing-0 text-left sm:table">
        <caption className="sr-only">Payout history</caption>
        <thead>
          <tr className={cn(COLS, "h-[50px] bg-white/[0.03] text-[12px] leading-[1.3] text-white/30")}>
            <th className="font-normal">Date</th>
            <th className="font-normal">Method</th>
            <th className="font-normal">Amount</th>
            <th className="text-right font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className={cn(COLS, "h-[52px] border-t-[0.7px] border-white/[0.06] text-[13px] leading-normal text-white")}>
              <td>{p.date}</td>
              <td className="text-white/70">{p.method}</td>
              <td>{formatUsd(p.amount)}</td>
              <td className="text-right">
                <PayoutStatusChip status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col sm:hidden">
        {rows.map((p) => (
          <li key={p.id} className="border-t-[0.7px] border-white/[0.06] px-[16px] py-[12px] text-[13px] leading-normal text-white">
            <div className="flex items-center justify-between">
              <span>{p.date}</span>
              <span>{formatUsd(p.amount)}</span>
            </div>
            <div className="mt-[6px] flex items-center justify-between">
              <span className="text-[12px] text-white/50">{p.method}</span>
              <PayoutStatusChip status={p.status} />
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="border-t-[0.7px] border-white/[0.06] py-10 text-center text-[13px] text-white/50">
          {filter === "All" ? "No payouts yet." : `No ${filter.toLowerCase()} payouts.`}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t-[0.7px] border-white/[0.06] px-[16px] py-[16px]">
        <p className="text-[12px] leading-[1.3] text-white/30">
          Showing {pad2(rows.length)} of {filtered.length} payouts
        </p>
        <nav aria-label="Payout pages" className="flex items-center gap-[9px]">
          <PagerButton label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)} flip />
          {pageItems(pages, current + 1).map((item, i) =>
            item === "…" ? (
              <span key={`gap-${i}`} aria-hidden className="w-[14px] text-center text-[12px] text-white/30">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === current + 1 ? "page" : undefined}
                onClick={() => setPage(item - 1)}
                className={cn(
                  "flex h-[34.1px] w-[34.1px] items-center justify-center text-[12px] leading-none transition-colors",
                  item === current + 1
                    ? "border-[0.7px] border-gold-accent bg-gold-accent/15 text-white"
                    : "border-[0.57px] border-white/[0.06] bg-white/[0.06] text-white/50 hover:text-white/80",
                )}
              >
                {pad2(item)}
              </button>
            ),
          )}
          <PagerButton label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} />
        </nav>
      </div>
    </Panel>
  );
}

function PayoutStatusChip({ status }: { status: Payout["status"] }) {
  return (
    <StatusChip tone={status === "Pending" ? "amber" : "green"} className="h-[22px] text-[12px] leading-normal">
      {status}
    </StatusChip>
  );
}
