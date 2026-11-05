"use client";

import { Card, formatMoney, StateMessage, Table } from "../ui";
import { useAdminQuery } from "../adminData";
import { ADMIN } from "../permissions";
import type { AdminPage, OperationsData } from "../types";

// Load right now: GET /admin/operations -> { kpis, plans }
function OperationsPerformance() {
  const { data, isPending, error, refetch } = useAdminQuery<OperationsData>("operations", "/admin/operations");

  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const cards = [
    { label: "Challenge accounts", value: data.kpis.challengeAccounts },
    { label: "Funded accounts", value: data.kpis.fundedAccounts },
    { label: "Open risk events", value: data.kpis.openRiskEvents },
    { label: "Open tickets", value: data.kpis.openTickets },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-[14px] text-white/40">{c.label}</p>
            <p className="mt-2 text-[38px] leading-none text-white">{c.value}</p>
          </Card>
        ))}
      </div>
      <Card title="Plan rules">
        <Table
          heads={["Plan", "Capital", "Target", "Daily loss", "Max loss"]}
          rows={data.plans.map((p) => [p.name, formatMoney(p.capital), `${p.profitTarget}%`, `${p.dailyLoss}%`, `${p.maxLoss}%`])}
        />
      </Card>
    </>
  );
}

export const page: AdminPage = { label: "Operations Performance", group: "Workspace", roles: ADMIN, component: OperationsPerformance };
