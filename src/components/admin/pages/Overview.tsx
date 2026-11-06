"use client";

import type { ReactNode } from "react";
import { Btn, Card, formatMoney, formatPnl, Pill, pnlClass, StateMessage, statusTone, Table, timeAgo } from "../ui";
import { useAdminNavigate, useAdminQuery } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { can, canView } from "../permissions";
import type { AdminPage, OverviewData } from "../types";

// The home screen. GET /admin/overview. It refreshes itself on realtime events.
// The server only fills money fields for people who may see them, and the page also hides those cards.
function Overview() {
  const user = useAdminSession((s) => s.user);
  const go = useAdminNavigate();
  const { data, isPending, error, refetch } = useAdminQuery<OverviewData>("overview", "/admin/overview");

  if (isPending) return <StateMessage>Loading overview…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const money = can(user, "finance.view");
  const { stats, live, today } = data;

  const cards = [
    { label: "Traders", value: stats.traders.toLocaleString("en-US"), note: "Registered traders" },
    { label: "Active accounts", value: stats.activeAccounts.toLocaleString("en-US"), note: "Challenge and funded" },
    ...(money
      ? [
        { label: "Challenge revenue", value: formatMoney(stats.challengeRevenue), note: "From paid checkouts" },
        { label: "Payout liability", value: formatMoney(live.payoutLiability), note: "Owed to traders, not yet paid" },
      ]
      : [
        { label: "Online traders", value: String(live.onlineTraders), note: "Active in the last 3 hours" },
        { label: "Open positions", value: String(live.openPositions), note: "Across all accounts" },
      ]),
  ];

  const maxFunnel = Math.max(1, ...data.funnel.map((f) => f.value));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((s) => (
          <Card key={s.label}>
            <p className="text-[14px] text-white/40">{s.label}</p>
            <p className="my-2 text-[38px] leading-none text-white">{s.value}</p>
            <p className="text-[14px] text-white/40">{s.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title="Needs attention">
          {data.attention.length === 0 ? (
            <StateMessage>Nothing is assigned to your sections.</StateMessage>
          ) : (
            <ul>
              {data.attention.map((a) => (
                <li key={a.key} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] py-3.5 last:border-0">
                  <div>
                    <p className="text-[15px] text-white">{a.label}</p>
                    <p className="text-[13px] text-white/40">
                      {a.count === 0 ? "All done" : `Oldest waiting ${a.oldestAt ? timeAgo(a.oldestAt) : ""}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.breached && <Pill tone="red">Overdue</Pill>}
                    <b className="min-w-[28px] text-right text-[20px] font-normal text-white">{a.count}</b>
                    <Btn onClick={() => go(a.page)}>Open</Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Right now">
          <ul>
            {(
              [
                ["Online traders", live.onlineTraders],
                ["Open positions", live.openPositions],
                ...(money ? ([["Exposure", formatMoney(live.exposure)], ["Revenue today", formatMoney(today.revenue)], ["Refunds", formatMoney(today.refunds)]] as [string, ReactNode][]) : []),
                ["Pending KYC cases", stats.pendingKyc],
                ["Failed webhooks", stats.failedWebhooks],
              ] as [string, ReactNode][]
            ).map(([label, value]) => (
              <li key={label} className="flex justify-between border-b border-white/[0.06] py-3 text-[15px] text-white/50 last:border-0">
                {label}<b className="font-normal text-white">{value}</b>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Trader journey">
          <ul className="grid gap-3">
            {data.funnel.map((f) => (
              <li key={f.label}>
                <div className="mb-1 flex justify-between text-[14px] text-white/60"><span>{f.label}</span><span className="text-white">{f.value}</span></div>
                <div className="h-2 bg-white/10"><div className="h-full bg-gold-accent" style={{ width: `${(f.value / maxFunnel) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Live trader" action={canView(user, "accounts") ? <Btn onClick={() => go("accounts")}>Accounts</Btn> : undefined}>
          {data.liveTrader ? (
            <ul>
              {(
                [
                  ["Trader", data.liveTrader.name],
                  ["Account", data.liveTrader.accountId],
                  ["Plan", data.liveTrader.plan],
                  ["Stage", data.liveTrader.stage],
                  ["Equity", formatMoney(data.liveTrader.equity)],
                  ["Open P&L", <span key="pnl" className={pnlClass(data.liveTrader.pnl)}>{formatPnl(data.liveTrader.pnl)}</span>],
                  ["Open positions", data.liveTrader.openPositions],
                  ["Payout eligible", data.liveTrader.payoutEligible === undefined ? undefined : formatMoney(data.liveTrader.payoutEligible)],
                  ["Trading", data.liveTrader.trading],
                ] as [string, ReactNode][]
              )
                .filter(([, v]) => v !== undefined && v !== "")
                .map(([label, value]) => (
                  <li key={label} className="flex justify-between border-b border-white/[0.06] py-3 text-[15px] text-white/50 last:border-0">
                    {label}<b className="font-normal text-white">{value}</b>
                  </li>
                ))}
            </ul>
          ) : (
            <StateMessage>No live trader right now. This card updates the moment a trader starts trading.</StateMessage>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {canView(user, "payouts") ? (
          <Card title="Recent payout requests" action={<Btn onClick={() => go("payouts")}>View all</Btn>}>
            {data.recentPayouts.length === 0 ? (
              <StateMessage>No payout requests yet.</StateMessage>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  heads={["ID", "Trader", "Amount", "Status"]}
                  rows={data.recentPayouts.map((p) => [p.id, p.traderName, formatMoney(p.amount), <Pill key="s" tone={statusTone(p.status)}>{p.status}</Pill>])}
                />
              </div>
            )}
          </Card>
        ) : (
          canView(user, "tickets") && (
            <Card title="Recent support tickets" action={<Btn onClick={() => go("tickets")}>View all</Btn>}>
              {data.recentTickets.length === 0 ? (
                <StateMessage>No tickets yet.</StateMessage>
              ) : (
                <div className="overflow-x-auto">
                  <Table
                    heads={["ID", "Trader", "Subject", "Status"]}
                    rows={data.recentTickets.map((t) => [t.id, t.traderName, t.subject, <Pill key="s" tone={statusTone(t.status)}>{t.status}</Pill>])}
                  />
                </div>
              )}
            </Card>
          )
        )}

        {canView(user, "activity") && (
          <Card title="Recent trading activity" action={<Btn onClick={() => go("activity")}>View all</Btn>}>
            {data.recentActivity.length === 0 ? (
              <StateMessage>No trades yet.</StateMessage>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  heads={["Trader", "Market", "Side", "P&L"]}
                  rows={data.recentActivity.map((t) => [
                    t.traderName,
                    t.market,
                    <Pill key="s" tone={statusTone(t.side)}>{t.side === "long" ? "Long" : "Short"}</Pill>,
                    <span key="p" className={pnlClass(t.pnl)}>{formatPnl(t.pnl)}</span>,
                  ])}
                />
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

export const page: AdminPage = { key: "overview", label: "Overview", group: "Workspace", component: Overview };
