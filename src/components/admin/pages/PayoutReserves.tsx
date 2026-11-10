"use client";

import type { ReactNode } from "react";
import { Btn, Card, formatDate, formatMoney, Pill, StateMessage, Table } from "../ui";
import { useAdminNavigate, useAdminQuery } from "../adminData";
import { renderCell } from "../ResourceList";
import type { AdminPage, ReservesData } from "../types";

// Money owed to traders, plus the proof that the reserve can pay it and the exact source of the three
// numbers traders see on their Payouts page.
// GET /admin/reserves -> { pending, approvedUnpaid, paid, rejected, onChain?, publicStats? }
function PayoutReserves() {
  const go = useAdminNavigate();
  const { data, isPending, error, refetch } = useAdminQuery<ReservesData>("reserves", "/admin/reserves");

  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const cards = [
    { label: "Waiting for review", value: data.pending, note: "Pending requests" },
    { label: "Approved, unpaid", value: data.approvedUnpaid, note: "Ready to send" },
    { label: "Paid so far", value: data.paid, note: "All time" },
    { label: "Rejected", value: data.rejected, note: "Not owed" },
  ];

  const chain = data.onChain;
  const stats = data.publicStats;
  const owed = data.pending + data.approvedUnpaid;
  // The number on the trader's page should match the chain. A gap means someone typed a manual value.
  const mismatch = chain && stats ? Math.abs(stats.payoutReserve - chain.balance) > 0.5 : false;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-[14px] text-white/40">{c.label}</p>
            <p className="my-2 text-[34px] leading-none text-white">{formatMoney(c.value)}</p>
            <p className="text-[14px] text-white/40">{c.note}</p>
          </Card>
        ))}
      </div>

      {chain && (
        <Card
          title="Reserve proof"
          action={<Btn onClick={() => go("settings")}>Edit in Platform Settings</Btn>}
        >
          <ul>
            {([
              ["Reserve wallet", renderCell(chain.walletAddress, "hash", { explorerUrl: chain.proofUrl })],
              ["Network", chain.network],
              ["On-chain balance", formatMoney(chain.balance)],
              ["Owed to traders now", formatMoney(owed)],
              ["Coverage", <Pill key="c" tone={chain.coverage >= 1 ? "green" : "red"}>{chain.coverage >= 1 ? `Covered ${chain.coverage.toFixed(1)}x` : `Shortfall (${chain.coverage.toFixed(2)}x)`}</Pill>],
              ["Last checked", formatDate(chain.lastCheckedAt)],
            ] as [string, ReactNode][]).map(([label, value]) => (
              <li key={label} className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 text-[15px] text-white/50 last:border-0">
                <span>{label}</span>
                <b className="text-right font-normal text-white">{value}</b>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-white/40">Traders can open the proof link on their Payouts page to check the reserve themselves.</p>
        </Card>
      )}

      {stats && (
        <Card title="Numbers shown to traders">
          {mismatch && (
            <p role="alert" className="mb-4 border-[0.7px] border-red-500/40 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
              The Payout Reserve traders see ({formatMoney(stats.payoutReserve)}) does not match the on-chain balance ({formatMoney(chain?.balance ?? 0)}). The source is set to {stats.reserveSource}.
            </p>
          )}
          <Table
            heads={["Shown to traders as", "Value", "Where it comes from"]}
            rows={[
              ["Payout Reserve", formatMoney(stats.payoutReserve), `Source: ${stats.reserveSource}`],
              ["Total Payouts Issued", formatMoney(stats.totalPayoutsIssued), "All paid payouts plus the imported history"],
              ["Avg. Payout Time", `${stats.avgPayoutSeconds}s`, "Median time from approval to on-chain confirmation, last 30 days"],
            ]}
          />
          <h3 className="mb-2 mt-5 text-[15px] text-white">How each number is calculated</h3>
          <ul>
            {stats.sources.map((x) => (
              <li key={x.label} className="border-b border-white/[0.06] py-2.5 text-[14px] last:border-0">
                <span className="text-white/80">{x.label}</span>
                <span className="ml-2 text-white/40">{x.value}</span>
                <p className="text-[13px] text-white/50">{x.formula}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

export const page: AdminPage = { key: "reserves", label: "Payout Reserves", group: "Finance & sales", component: PayoutReserves };
