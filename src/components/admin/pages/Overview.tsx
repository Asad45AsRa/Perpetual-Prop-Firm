"use client";

import { Btn, Card, formatMoney, formatPnl, Pill, pnlClass, StateMessage, statusTone, Table } from "../ui";
import { useAdminNavigate, useAdminQuery, usePayoutAction } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { ALL, can } from "../permissions";
import type { AdminPage, OverviewData } from "../types";

// Live dashboard. Every number comes from GET /admin/overview and refreshes on realtime events.
function Overview() {
  const role = useAdminSession((s) => s.user?.role);
  const go = useAdminNavigate();
  const payoutAction = usePayoutAction();
  const { data, isPending, error, refetch } = useAdminQuery<OverviewData>("overview", "/admin/overview");

  if (isPending) return <StateMessage>Loading overview…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const finance = can(role, "finance.view");
  const { stats } = data;

  // Admins see money cards, moderators see support and risk cards instead
  const cards = [
    { label: "Traders", value: stats.traders.toLocaleString("en-US"), note: "Registered traders" },
    { label: "Active accounts", value: stats.activeAccounts.toLocaleString("en-US"), note: "Challenge and funded" },
    ...(finance
      ? [{ label: "Pending payouts", value: String(stats.pendingPayouts), note: "Need review" }]
      : [{ label: "Open tickets", value: String(stats.openTickets), note: "Waiting for reply" }]),
    ...(finance
      ? [{ label: "Challenge revenue", value: formatMoney(stats.challengeRevenue), note: "From paid checkouts" }]
      : [{ label: "Risk breaches", value: String(stats.riskBreaches), note: "Need review" }]),
  ];

  // [label, count, visible for this role]
  const attention: [string, number, boolean][] = [
    ["Payouts to review", stats.pendingPayouts, can(role, "payout.approve")],
    ["Open tickets", stats.openTickets, can(role, "tickets.reply")],
    ["Risk breaches", stats.riskBreaches, can(role, "risk.review")],
    ["Pending affiliate payouts", stats.pendingAffiliatePayouts, finance],
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((s) => (
          <Card key={s.label}>
            <p className="text-[14px] text-white/40">{s.label}</p>
            <p className="my-2 text-[38px] leading-none text-white">{s.value}</p>
            <p className="text-[14px] text-white/40">{s.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card
          title="Live trader"
          action={
            <div className="flex gap-2">
              <Btn onClick={() => go("Trading Accounts")}>Accounts</Btn>
              {finance && <Btn onClick={() => go("Trader Payouts")}>Payouts</Btn>}
            </div>
          }
        >
          {data.liveTrader ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[14px] text-white/40">Trader</p>
                <p className="mt-1 text-[18px]">{data.liveTrader.name}</p>
                <p className="text-[14px] text-white/40">{data.liveTrader.accountId}</p>
              </div>
              <div>
                <p className="text-[14px] text-white/40">Equity</p>
                <p className="mt-1 text-[18px]">{formatMoney(data.liveTrader.equity)}</p>
              </div>
              <div>
                <p className="text-[14px] text-white/40">Open P&amp;L</p>
                <p className={`mt-1 text-[18px] ${pnlClass(data.liveTrader.pnl)}`}>{formatPnl(data.liveTrader.pnl)}</p>
              </div>
            </div>
          ) : (
            <StateMessage>No live trader right now. This card updates the moment a trader starts trading.</StateMessage>
          )}
        </Card>

        <Card title="Needs attention">
          <ul>
            {attention.filter(([, , show]) => show).map(([label, n]) => (
              <li key={label} className="flex justify-between border-b border-white/[0.06] py-3.5 text-[15px] text-white/50 last:border-0">
                {label}<b className="font-normal text-white">{n}</b>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {finance ? (
          <Card title="Recent payout requests" action={<Btn onClick={() => go("Trader Payouts")}>View all</Btn>}>
            {data.recentPayouts.length === 0 ? (
              <StateMessage>No payout requests yet.</StateMessage>
            ) : (
              <Table
                heads={["ID", "Trader", "Amount", "Status", ""]}
                rows={data.recentPayouts.map((p) => [
                  p.id,
                  p.traderName,
                  formatMoney(p.amount),
                  <Pill key="s" tone={statusTone(p.status)}>{p.status}</Pill>,
                  p.status === "pending" && can(role, "payout.approve") ? (
                    <Btn key="b" disabled={payoutAction.isPending} onClick={() => payoutAction.run(p.id, "approve")}>Approve</Btn>
                  ) : null,
                ])}
              />
            )}
          </Card>
        ) : (
          <Card title="Recent support tickets" action={<Btn onClick={() => go("Support Tickets")}>View all</Btn>}>
            {data.recentTickets.length === 0 ? (
              <StateMessage>No tickets yet.</StateMessage>
            ) : (
              <Table
                heads={["ID", "Trader", "Subject", "Status"]}
                rows={data.recentTickets.map((t) => [t.id, t.traderName, t.subject, <Pill key="s" tone={statusTone(t.status)}>{t.status}</Pill>])}
              />
            )}
          </Card>
        )}

        <Card title="Recent trading activity" action={<Btn onClick={() => go("Trading Activity")}>View all</Btn>}>
          {data.recentActivity.length === 0 ? (
            <StateMessage>No trades yet.</StateMessage>
          ) : (
            <Table
              heads={["Trader", "Market", "Side", "P&L"]}
              rows={data.recentActivity.map((t) => [
                t.traderName,
                t.market,
                <Pill key="s" tone={statusTone(t.side)}>{t.side === "long" ? "Long" : "Short"}</Pill>,
                <span key="p" className={pnlClass(t.pnl)}>{formatPnl(t.pnl)}</span>,
              ])}
            />
          )}
        </Card>
      </div>
    </>
  );
}

export const page: AdminPage = { label: "Overview", group: "Workspace", roles: ALL, component: Overview };
