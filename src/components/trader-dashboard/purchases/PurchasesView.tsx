"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { NumberedPager, Panel, StatusChip, tabChip } from "@/components/affiliate-dashboard/Panel";

/** Figma "Purchase History" (frame 1603:191). TODO(backend): load from the orders API. */
type Purchase = {
  id: string;
  date: string;
  plan: string;
  account: string;
  size: number;
  price: number;
  method: string;
  wallet: string;
  status: "Paid" | "Pending";
};

const PURCHASES: Purchase[] = [
  { id: "o-2", date: "Oct 1", plan: "Breeze", account: "PE-2", size: 50_000, price: 300, method: "USDC · BEP20", wallet: "0x71C…8A92", status: "Paid" },
  { id: "o-1", date: "Oct 1", plan: "Elite", account: "PE-1", size: 100_000, price: 200, method: "USDC · BEP20", wallet: "0x71C…8A92", status: "Paid" },
];

const FILTERS = ["All", "Paid", "Pending"] as const;
type Filter = (typeof FILTERS)[number];
const PAGE_SIZE = 10;
const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const COLS = "grid grid-cols-[70px_minmax(120px,1.1fr)_1fr_0.9fr_1.1fr_1fr_80px] items-center gap-x-[12px] px-[16px]";

export function PurchasesView() {
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(0);
  const rows = filter === "All" ? PURCHASES : PURCHASES.filter((p) => p.status === filter);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = rows.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  // Summary tiles come from paid orders, so they always agree with the table.
  const paid = PURCHASES.filter((p) => p.status === "Paid");
  const summary = [
    { label: "Total Paid", value: money(paid.reduce((s, p) => s + p.price, 0)) },
    { label: "Accounts Purchased", value: String(paid.length) },
    { label: "Account Allocation", value: money(paid.reduce((s, p) => s + p.size, 0)) },
  ];

  return (
    <Panel className="mt-[37px]">
      <div className="flex flex-wrap items-start justify-between gap-4 p-[16px]">
        <dl className="flex flex-wrap gap-[8px]">
          {summary.map((s) => (
            <div key={s.label} className="min-w-[140px] border-b-[1.5px] border-white/30 bg-white/[0.06] px-[12px] pb-[8px] pt-[9px]">
              <dt className="text-[10px] uppercase leading-[1.3] text-white/50">{s.label}</dt>
              <dd className="mt-[2px] text-[15px] leading-[1.3] text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div role="tablist" aria-label="Purchase status" className="flex gap-[9px]">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => {
                setFilter(f);
                setPage(0);
              }}
              className={tabChip(filter === f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">Purchase history</caption>
          <thead>
            <tr className={cn(COLS, "h-[47px] bg-white/[0.04] text-[12px] text-white/50")}>
              <th className="font-normal">Date</th>
              <th className="font-normal">Account</th>
              <th className="font-normal">Account size</th>
              <th className="font-normal">Price paid</th>
              <th className="font-normal">Payment method</th>
              <th className="font-normal">From Wallet</th>
              <th className="text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className={cn(COLS, "h-[58px] border-t-[0.7px] border-white/[0.06] text-[13px] text-white")}>
                <td>{p.date}</td>
                <td>
                  <span className="inline-flex h-[28px] items-center border-l-[1.5px] border-gold-accent bg-gold-accent/15 px-[10px] text-[12px] text-[#C9B27A]">
                    {p.plan} · {p.account}
                  </span>
                </td>
                <td>{money(p.size)}</td>
                <td>{money(p.price)}</td>
                <td className="text-white/80">{p.method}</td>
                <td className="text-white/80">{p.wallet}</td>
                <td className="text-right">
                  <StatusChip tone={p.status === "Pending" ? "amber" : "green"} className="h-[22px] text-[12px] leading-normal">
                    {p.status}
                  </StatusChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="border-t-[0.7px] border-white/[0.06] py-10 text-center text-[13px] text-white/50">No {filter.toLowerCase()} purchases.</p>}
      </div>

      <NumberedPager page={current} pages={pages} shown={shown.length} total={rows.length} onPage={setPage} label="Purchase pages" />
    </Panel>
  );
}
