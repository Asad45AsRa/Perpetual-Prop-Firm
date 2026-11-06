"use client";

import { useAdminMutation, useAdminQuery } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { canManage } from "../permissions";
import { Btn, Card, describeError, formatDate, Pill, StateMessage, statusTone, Table, timeAgo, useToast } from "../ui";
import type { AdminPage, HealthItem, ListResponse } from "../types";

type Row = Record<string, unknown>;

// One screen for "is the server healthy right now?". Every number comes from a real check on the backend.
// Services: GET /admin/health   Feed: GET /admin/feed   Incidents: GET /admin/incidents   Backups: GET /admin/backups
// Run all checks now: POST /admin/health/check
const MAX_BAR_MS = 1000;

function Section<T extends Row>({ title, resource, heads, row, empty }: { title: string; resource: string; heads: string[]; row: (r: T) => React.ReactNode[]; empty: string }) {
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<T>>(resource, `/admin/${resource}`);
  return (
    <Card title={title}>
      {isPending ? <StateMessage>Loading…</StateMessage> : error ? <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage> : data.items.length === 0 ? <StateMessage>{empty}</StateMessage> : <Table heads={heads} rows={data.items.map(row)} />}
    </Card>
  );
}

function SystemHealth() {
  const toast = useToast();
  const user = useAdminSession((s) => s.user);
  const run = useAdminMutation();
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<HealthItem>>("health", "/admin/health");

  const check = () =>
    run.mutate({ path: "/admin/health/check" }, { onSuccess: () => toast("All checks ran again."), onError: (e) => toast(describeError(e), true) });

  const items = data?.items ?? [];
  const bad = items.filter((i) => i.status !== "healthy");

  return (
    <>
      <Card
        title="Services"
        action={canManage(user, "health") ? <Btn disabled={run.isPending} onClick={check}>{run.isPending ? "Checking…" : "Run checks now"}</Btn> : undefined}
      >
        {isPending ? (
          <StateMessage>Loading…</StateMessage>
        ) : error ? (
          <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>
        ) : (
          <>
            <p className="mb-4 text-[15px] text-white/60">
              {bad.length === 0 ? "Everything is working." : `${bad.length} of ${items.length} services need a look.`}
            </p>
            <Table
              heads={["Service", "Status", "Response time", "Detail", "Checked"]}
              rows={items.map((i) => [
                i.service,
                <Pill key="s" tone={statusTone(i.status)}>{i.status}</Pill>,
                <div key="l" className="flex items-center gap-2">
                  <div className="h-1.5 w-[80px] bg-white/10"><div className={i.latencyMs > 500 ? "h-full bg-red-400" : "h-full bg-success"} style={{ width: `${Math.min(100, (i.latencyMs / MAX_BAR_MS) * 100)}%` }} /></div>
                  <span className="text-[13px] text-white/60">{i.latencyMs} ms</span>
                </div>,
                i.detail ?? "-",
                timeAgo(i.checkedAt),
              ])}
            />
          </>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section<Row>
          title="Price feed by market"
          resource="feed"
          heads={["Market", "Last price", "Source", "Status"]}
          empty="No markets are being watched."
          row={(r) => [String(r.symbol), `${r.lastTickSec} s ago`, String(r.source), <Pill key="s" tone={r.status === "ok" ? "green" : "red"}>{String(r.status)}</Pill>]}
        />
        <Section<Row>
          title="Backups"
          resource="backups"
          heads={["Backup", "Taken", "Size", "Restore tested"]}
          empty="No backups yet."
          row={(r) => [String(r.kind), formatDate(String(r.at)), `${r.sizeMb} MB`, <Pill key="s" tone={r.restoreTested ? "green" : "gold"}>{r.restoreTested ? "Yes" : "Not yet"}</Pill>]}
        />
      </div>

      <Section<Row>
        title="Incidents"
        resource="incidents"
        heads={["Service", "What happened", "Started", "Ended", "Status"]}
        empty="No incidents recorded."
        row={(r) => [String(r.service), String(r.title), formatDate(String(r.startedAt)), r.resolvedAt ? formatDate(String(r.resolvedAt)) : "-", <Pill key="s" tone={statusTone(String(r.status))}>{String(r.status)}</Pill>]}
      />
    </>
  );
}

export const page: AdminPage = { key: "health", label: "System Health", group: "Platform control", component: SystemHealth };
