"use client";

import { useState } from "react";
import { useAdminQuery } from "../adminData";
import { Btn, Card, downloadCsv, formatMoney, StateMessage, Table, TextInput, useToast } from "../ui";
import type { AdminPage, ReportsData } from "../types";

// Business reports for a date range. GET /admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD
// Every table can be downloaded as CSV.
function Bars({ rows, color }: { rows: { label: string; value: number }[]; color: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="grid gap-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between text-[13px] text-white/60"><span>{r.label}</span><span className="text-white">{r.value}</span></div>
          <div className="h-2 bg-white/10"><div className={`h-full ${color}`} style={{ width: `${(r.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

function Reports() {
  const toast = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const qs = `?${from ? `from=${from}&` : ""}${to ? `to=${to}` : ""}`;
  const { data, isPending, error, refetch } = useAdminQuery<ReportsData>("reports", `/admin/reports${qs}`, { keepPrevious: true });

  if (isPending) return <StateMessage>Loading reports…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const t = data.totals;
  const cards = [
    { label: "Revenue", value: formatMoney(t.revenue) },
    { label: "Refunds", value: formatMoney(t.refunds) },
    { label: "Paid to traders", value: formatMoney(t.payouts) },
    { label: "Affiliate cost", value: formatMoney(t.affiliateCost) },
    { label: "Challenge pass rate", value: `${t.passRate}%` },
  ];

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <TextInput type="date" aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} className="!w-[160px]" />
          <TextInput type="date" aria-label="To date" value={to} onChange={(e) => setTo(e.target.value)} className="!w-[160px]" />
          <Btn onClick={() => { setFrom(""); setTo(""); }}>Last 14 days</Btn>
          <Btn onClick={() => toast(downloadCsv("revenue-by-day.csv", data.revenueByDay) ? "CSV downloaded." : "Nothing to export.")}>Export revenue CSV</Btn>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-[14px] text-white/40">{c.label}</p>
            <p className="mt-2 text-[30px] leading-none text-white">{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Revenue by day">
          <Bars rows={data.revenueByDay.map((r) => ({ label: r.day, value: r.revenue }))} color="bg-gold-accent" />
        </Card>
        <Card title="Why accounts hit a rule" action={<Btn onClick={() => toast(downloadCsv("breach-reasons.csv", data.breachReasons) ? "CSV downloaded." : "Nothing to export.")}>CSV</Btn>}>
          {data.breachReasons.length === 0 ? <StateMessage>No breaches in this period.</StateMessage> : <Bars rows={data.breachReasons.map((r) => ({ label: r.reason, value: r.count }))} color="bg-red-400" />}
        </Card>
      </div>

      <Card title="Trader journey" action={<Btn onClick={() => toast(downloadCsv("funnel.csv", data.funnel) ? "CSV downloaded." : "Nothing to export.")}>CSV</Btn>}>
        <Table heads={["Step", "Traders"]} rows={data.funnel.map((f) => [f.label, f.value])} />
      </Card>
    </>
  );
}

export const page: AdminPage = { key: "reports", label: "Reports", group: "Workspace", component: Reports };
