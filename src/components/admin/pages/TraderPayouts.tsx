"use client";

import { Btn, Card, formatDate, formatMoney, Pill, StateMessage, statusTone, Table } from "../ui";
import { useAdminQuery, usePayoutAction } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { ADMIN, can } from "../permissions";
import type { AdminPage, ListResponse, Payout } from "../types";

// Full payout queue with approve / reject. Decisions made by another admin appear live.
function TraderPayouts() {
  const role = useAdminSession((s) => s.user?.role);
  const action = usePayoutAction();
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Payout>>("payouts", "/admin/payouts");
  const canDecide = can(role, "payout.approve");

  return (
    <Card>
      {action.error && <p role="alert" className="mb-4 text-[14px] text-red-400">{action.error.message}</p>}
      {isPending ? (
        <StateMessage>Loading…</StateMessage>
      ) : error ? (
        <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>
      ) : data.items.length === 0 ? (
        <StateMessage>No payout requests yet.</StateMessage>
      ) : (
        <Table
          heads={["ID", "Trader", "Amount", "Requested", "Status", ""]}
          rows={data.items.map((p) => [
            p.id,
            p.traderName,
            formatMoney(p.amount),
            formatDate(p.requestedAt),
            <Pill key="s" tone={statusTone(p.status)}>{p.status}</Pill>,
            canDecide && p.status === "pending" ? (
              <div key="a" className="flex gap-2">
                <Btn disabled={action.isPending} onClick={() => action.run(p.id, "approve")}>Approve</Btn>
                <Btn disabled={action.isPending} onClick={() => action.run(p.id, "reject")}>Reject</Btn>
              </div>
            ) : null,
          ])}
        />
      )}
    </Card>
  );
}

export const page: AdminPage = { label: "Trader Payouts", group: "Finance & sales", roles: ADMIN, component: TraderPayouts };
