"use client";

import { Card, formatMoney, StateMessage } from "../ui";
import { useAdminQuery } from "../adminData";
import type { AdminPage, ReservesData } from "../types";

// Money owed to traders: GET /admin/reserves -> { pending, approvedUnpaid, paid, rejected }
function PayoutReserves() {
  const { data, isPending, error, refetch } = useAdminQuery<ReservesData>("reserves", "/admin/reserves");

  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const cards = [
    { label: "Waiting for review", value: data.pending, note: "Pending requests" },
    { label: "Approved, unpaid", value: data.approvedUnpaid, note: "Ready to send" },
    { label: "Paid so far", value: data.paid, note: "All time" },
    { label: "Rejected", value: data.rejected, note: "Not owed" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <p className="text-[14px] text-white/40">{c.label}</p>
          <p className="my-2 text-[34px] leading-none text-white">{formatMoney(c.value)}</p>
          <p className="text-[14px] text-white/40">{c.note}</p>
        </Card>
      ))}
    </div>
  );
}

export const page: AdminPage = { key: "reserves", label: "Payout Reserves", group: "Finance & sales", component: PayoutReserves };
