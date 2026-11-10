"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { adminApi } from "../adminApi";
import { useAdminNavigate, useAdminNavParams, useAdminQuery } from "../adminData";
import { formatMinutes } from "../AccountAnalytics";
import { Card, formatDate, formatMoney, Pill, ProgressBar, SelectInput, StateMessage, statusTone, Table, Tabs, formatPnl, pnlClass, Btn } from "../ui";
import type { AdminPage, ListResponse, TraderViewData } from "../types";

type Row = Record<string, unknown>;
const TABS = ["Home", "Accounts", "Payouts", "Purchases"];

const pnl = (n: number) => <span className={pnlClass(n)}>{formatPnl(n)}</span>;

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-[0.7px] border-white/[0.08] bg-white/[0.03] p-3">
      <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 text-[18px] text-white">{value}</p>
    </div>
  );
}

// Read-only copy of what one trader sees on their own dashboard (Home, Accounts, Payouts, Purchase History).
// Nothing here can be changed. Opening a trader is written to the audit log so access stays accountable.
// Data: GET /admin/trader-view/:traderId   Audit entry: POST /admin/trader-view/:traderId/open
function TraderView() {
  const go = useAdminNavigate();
  const params = useAdminNavParams();
  const traders = useAdminQuery<ListResponse<Row>>("traders", "/admin/traders?pageSize=100");
  const [pickedName, setPickedName] = useState("");
  const [tab, setTab] = useState(TABS[0]);
  const logged = useRef("");

  const items = traders.data?.items ?? [];
  const wanted = pickedName || params?.q || "";
  const trader = items.find((t) => t.name === wanted) ?? items.find((t) => String(t.name).toLowerCase().includes(wanted.toLowerCase()) && wanted) ?? items[0];
  const id = trader ? String(trader.id) : "";

  const view = useAdminQuery<TraderViewData>("trader-view", `/admin/trader-view/${encodeURIComponent(id)}`, { enabled: !!id });

  // One audit entry per trader opened. A plain call (not a mutation) so it does not refresh every list.
  useEffect(() => {
    if (!id || logged.current === id) return;
    logged.current = id;
    adminApi(`/admin/trader-view/${encodeURIComponent(id)}/open`, { method: "POST" }).catch(() => {});
  }, [id]);

  if (traders.isPending) return <StateMessage>Loading traders…</StateMessage>;
  if (traders.error) return <StateMessage error onRetry={() => traders.refetch()}>{traders.error.message}</StateMessage>;
  if (items.length === 0) return <StateMessage>There are no traders yet.</StateMessage>;

  const d = view.data;

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-[260px]">
            <label htmlFor="tv-trader" className="mb-1.5 block text-[13px] text-white/50">Trader</label>
            <SelectInput id="tv-trader" options={items.map((t) => String(t.name))} value={String(trader?.name ?? "")} onChange={(e) => setPickedName(e.target.value)} />
          </div>
          <p className="max-w-[460px] text-[13px] text-white/40">Read-only. This is the dashboard exactly as the trader sees it. Opening it is recorded in the audit log.</p>
        </div>
      </Card>

      {view.isPending ? (
        <StateMessage>Loading…</StateMessage>
      ) : view.error || !d ? (
        <StateMessage error onRetry={() => view.refetch()}>{view.error?.message ?? "Could not load this trader."}</StateMessage>
      ) : (
        <div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />

          {tab === "Home" && (
            <div className="grid gap-4">
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[24px] text-white">{d.profile.username}</p>
                    <p className="text-[14px] text-white/50">{d.profile.name} · joined {formatDate(d.profile.joinedAt)} · avatar {d.profile.avatar}</p>
                    <p className="mt-2 flex gap-2"><Pill tone={statusTone(d.profile.status)}>{d.profile.status}</Pill><Pill tone={statusTone(d.profile.kyc)}>KYC {d.profile.kyc}</Pill></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] uppercase tracking-wide text-white/40">Rank</p>
                    <p className="text-[28px] text-gold-light">{d.profile.rank ? `#${d.profile.rank}` : "Not ranked"}</p>
                    {d.profile.topPercent !== null && <p className="text-[13px] text-white/50">Top {d.profile.topPercent}%</p>}
                    <p className="mt-1 text-[13px] text-white/50">Lifetime payouts {formatMoney(d.profile.lifetimePayouts)}</p>
                  </div>
                </div>
              </Card>
              <Card title="Lifetime stats">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat label="Realized PnL" value={pnl(d.lifetime.realizedPnl)} />
                  <Stat label="Total ROI" value={`${d.lifetime.totalRoiPct.toFixed(2)}%`} />
                  <Stat label="Total payouts" value={formatMoney(d.lifetime.totalPayouts)} />
                  <Stat label="Volume" value={formatMoney(d.lifetime.volume)} />
                  <Stat label="Trading days" value={d.lifetime.tradingDays} />
                  <Stat label="Win rate" value={`${d.lifetime.winRatePct.toFixed(0)}%`} />
                  <Stat label="Avg profit / day" value={pnl(d.lifetime.avgProfitPerDay)} />
                  <Stat label="Avg hold time" value={formatMinutes(d.lifetime.avgHoldMinutes)} />
                </div>
              </Card>
            </div>
          )}

          {(tab === "Home" || tab === "Accounts") && (
            <Card title="Sub accounts" className={tab === "Home" ? "mt-4" : ""}>
              {d.subAccounts.length === 0 ? (
                <StateMessage>This trader has no accounts.</StateMessage>
              ) : (
                <Table
                  heads={["Account", "Plan", "Stage", "Status", "Allocation", "Equity", "Daily DD", "Max DD", "Profit target", ""]}
                  rows={d.subAccounts.map((a) => [
                    a.id,
                    a.plan,
                    a.stage,
                    <Pill key="s" tone={statusTone(a.status)}>{a.status}</Pill>,
                    formatMoney(a.allocation),
                    formatMoney(a.equity),
                    <ProgressBar key="d" value={a.dailyDrawdownPct} />,
                    <ProgressBar key="m" value={a.maxDrawdownPct} />,
                    <ProgressBar key="p" value={a.profitTargetPct} warnAt={101} />,
                    <Btn key="o" onClick={() => go("accounts", { q: a.id })}>Open</Btn>,
                  ])}
                />
              )}
            </Card>
          )}

          {tab === "Payouts" && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card><p className="text-[14px] text-white/40">Withdrawable profits</p><p className="mt-2 text-[30px] text-white">{formatMoney(d.payouts.withdrawable)}</p></Card>
                <Card><p className="text-[14px] text-white/40">Sub-account profit</p><p className="mt-2 text-[30px] text-white">{formatMoney(d.payouts.subAccountProfit)}</p></Card>
              </div>
              <Card title="Payout history">
                {d.payouts.history.length === 0 ? (
                  <StateMessage>No payouts yet.</StateMessage>
                ) : (
                  <Table
                    heads={["Date", "Account", "Amount", "Split", "After split", "Method", "Status"]}
                    rows={d.payouts.history.map((p) => [formatDate(p.date), p.account, formatMoney(p.amount), `${p.split}%`, formatMoney(p.afterSplit), p.network, <Pill key="s" tone={statusTone(p.status)}>{p.status}</Pill>])}
                  />
                )}
              </Card>
            </div>
          )}

          {tab === "Purchases" && (
            <Card title="Purchase history">
              {d.purchases.length === 0 ? (
                <StateMessage>No purchases yet.</StateMessage>
              ) : (
                <Table
                  heads={["Date", "Plan", "Price paid", "Method", "Status"]}
                  rows={d.purchases.map((p) => [formatDate(p.date), p.plan, formatMoney(p.amount), p.method, <Pill key="s" tone={statusTone(p.status)}>{p.status}</Pill>])}
                />
              )}
            </Card>
          )}
        </div>
      )}
    </>
  );
}

export const page: AdminPage = { key: "trader-view", label: "View as Trader", group: "Traders & trading", component: TraderView };
