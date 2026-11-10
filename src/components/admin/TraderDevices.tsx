"use client";

import { useAdminMutation, useAdminNavigate, useAdminQuery } from "./adminData";
import { useAdminSession } from "./Adminauth";
import { can } from "./permissions";
import { Btn, describeError, formatDate, Pill, StateMessage, statusTone, Table, timeAgo, useToast } from "./ui";
import type { ListResponse } from "./types";

type Row = Record<string, unknown>;

// Detail tab of the Trader Management page: every device the trader is signed in on (or was).
// Staff can sign out one device without touching the others. The "Sign out everywhere" action on the
// trader row still ends every session at once.
// List: GET /admin/trader-sessions?traderId=...   Sign out one device: POST /admin/trader-sessions/:id/revoke
export function TraderDevices({ trader }: { trader: Row }) {
  const toast = useToast();
  const go = useAdminNavigate();
  const user = useAdminSession((s) => s.user);
  const revoke = useAdminMutation();
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Row>>("trader-sessions", `/admin/trader-sessions?traderId=${encodeURIComponent(String(trader.id))}&pageSize=50`);
  const mayRevoke = can(user, "traders.suspend");

  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-white/50">What the trader sees on their Settings page under Active Devices.</p>
        <Btn onClick={() => go("trader-view", { q: String(trader.name) })}>View as trader</Btn>
      </div>
      {data.items.length === 0 ? (
        <StateMessage>No devices recorded yet.</StateMessage>
      ) : (
        <Table
          heads={["Device", "IP address", "Signed in", "Last seen", "Status", ""]}
          rows={data.items.map((s) => [
            String(s.device),
            String(s.ip),
            <span key="a" title={formatDate(String(s.startedAt))}>{timeAgo(String(s.startedAt))}</span>,
            <span key="b" title={formatDate(String(s.lastSeenAt))}>{timeAgo(String(s.lastSeenAt))}</span>,
            <Pill key="c" tone={statusTone(String(s.status))}>{String(s.status)}</Pill>,
            mayRevoke && s.status === "active" ? (
              <Btn
                key="d"
                disabled={revoke.isPending}
                onClick={() =>
                  revoke.mutate(
                    { path: `/admin/trader-sessions/${encodeURIComponent(String(s.id))}/revoke` },
                    { onSuccess: () => toast("Device signed out."), onError: (e) => toast(describeError(e), true) },
                  )
                }
              >
                Sign out
              </Btn>
            ) : null,
          ])}
        />
      )}
    </div>
  );
}
