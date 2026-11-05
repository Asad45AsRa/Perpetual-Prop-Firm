"use client";

import { Btn, Card, formatDate, Pill, StateMessage, statusTone, Table, useToast } from "../ui";
import { useAdminMutation, useAdminQuery } from "../adminData";
import { ADMIN } from "../permissions";
import type { AdminPage, HealthItem, ListResponse } from "../types";

// Service status from GET /admin/health. "Run check" is POST /admin/health/check.
function SystemHealth() {
  const toast = useToast();
  const check = useAdminMutation();
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<HealthItem>>("health", "/admin/health");

  const runCheck = () =>
    check.mutate(
      { path: "/admin/health/check" },
      { onSuccess: () => toast("Health check finished."), onError: (e) => toast(e.message, true) },
    );

  return (
    <Card title="Services" action={<Btn tone="gold" disabled={check.isPending} onClick={runCheck}>{check.isPending ? "Checking…" : "Run check"}</Btn>}>
      {isPending ? (
        <StateMessage>Loading…</StateMessage>
      ) : error ? (
        <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>
      ) : (
        <Table
          heads={["Service", "Status", "Latency", "Checked"]}
          rows={data.items.map((h) => [
            h.service,
            <Pill key="s" tone={statusTone(h.status)}>{h.status}</Pill>,
            `${h.latencyMs} ms`,
            formatDate(h.checkedAt),
          ])}
        />
      )}
    </Card>
  );
}

export const page: AdminPage = { label: "System Health", group: "Platform control", roles: ADMIN, component: SystemHealth };
