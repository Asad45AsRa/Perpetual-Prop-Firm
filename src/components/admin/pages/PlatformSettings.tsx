"use client";

import type { ReactNode } from "react";
import { Card, StateMessage } from "../ui";
import { useAdminQuery } from "../adminData";
import { ADMIN } from "../permissions";
import type { AdminPage, SettingsData } from "../types";

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <ul>
      {rows.map(([label, value]) => (
        <li key={label} className="flex justify-between border-b border-white/[0.06] py-3.5 text-[15px] text-white/50 last:border-0">
          {label}<b className="font-normal text-white">{value}</b>
        </li>
      ))}
    </ul>
  );
}

// Read-only rules: GET /admin/settings -> { riskRules, platform }
function PlatformSettings() {
  const { data, isPending, error, refetch } = useAdminQuery<SettingsData>("settings", "/admin/settings");

  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const { riskRules: r, platform: p } = data;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Risk rules">
        <Rows rows={[["Daily loss limit", `${r.dailyLoss}%`], ["Max loss limit", `${r.maxLoss}%`], ["Profit target", `${r.profitTarget}%`], ["Profit split", `${r.profitSplit}%`]]} />
      </Card>
      <Card title="Platform">
        <Rows rows={[["Name", p.name], ["Markets", p.markets], ["Payout network", p.payoutNetwork], ["Mode", p.mode]]} />
      </Card>
    </div>
  );
}

export const page: AdminPage = { label: "Platform Settings", group: "Platform control", roles: ADMIN, component: PlatformSettings };
