"use client";

import { useAdminNavigate, useAdminQuery } from "./adminData";
import { Btn, formatDate, formatMoney, Pill, StateMessage, statusTone } from "./ui";
import type { BreachData } from "./types";

type Row = Record<string, unknown>;

// Detail tab of the Trading Accounts page: "Why did this account fail or lock?"
// It puts the answer in one place: which rule was broken, the limit, the value at the moment of the breach,
// what the engine did, and the price proof (bid, ask, mark) from the fill that caused it.
// Data: GET /admin/accounts/:id/breach
export function BreachExplainer({ row }: { row: Row }) {
  const go = useAdminNavigate();
  const { data, isPending, error, refetch } = useAdminQuery<BreachData>("accounts", `/admin/accounts/${encodeURIComponent(String(row.id))}/breach`);

  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  // Events that actually broke a rule. A "healthy" event is just a check that passed.
  const broken = data.events.filter((e) => e.status !== "healthy");
  const stopped = ["failed", "locked"].includes(data.accountStatus);

  if (broken.length === 0) {
    return (
      <StateMessage>
        {stopped
          ? "This account is stopped, but no rule breach is recorded. It was probably failed or locked by hand. Check the History tab for the reason."
          : "No rule has been broken on this account."}
      </StateMessage>
    );
  }

  const latest = broken[0];

  return (
    <div className="grid gap-4">
      <div className="border-[0.7px] border-white/[0.08] bg-white/[0.02] p-4">
        <p className="mb-2 flex flex-wrap items-center gap-2 text-[13px] text-white/40">
          Account is <Pill tone={statusTone(data.accountStatus)}>{data.accountStatus}</Pill>
        </p>
        <p className="text-[16px] leading-relaxed text-white">
          The rule <b className="font-normal text-gold-light">{latest.rule}</b> was broken: the limit is {latest.threshold} and the value reached {latest.valueAtBreach} on {formatDate(latest.detectedAt)}.
        </p>
        <p className="mt-2 text-[14px] text-white/60">Engine action: {latest.action || "None"}. Equity at that moment: {formatMoney(latest.equitySnapshot)}.</p>
        <p className="mt-2 text-[13px] text-white/40">Rules in force: {data.rulesSnapshot}</p>
      </div>

      {latest.price ? (
        <div className="border-[0.7px] border-white/[0.08] bg-white/[0.02] p-4">
          <h3 className="mb-2 text-[15px] text-white">Price proof</h3>
          <ul>
            {([
              ["Market", latest.price.market],
              ["Fill price", String(latest.price.fill)],
              ["Best bid", String(latest.price.bid)],
              ["Best ask", String(latest.price.ask)],
              ["Mark price", String(latest.price.mark)],
              ["Filled", formatDate(latest.price.at)],
            ] as [string, string][]).map(([label, value]) => (
              <li key={label} className="flex justify-between gap-4 border-b border-white/[0.06] py-2 text-[14px] text-white/50 last:border-0">
                <span>{label}</span><b className="font-normal text-white">{value}</b>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-[13px] text-white/40">No fill is linked to this breach, so there is no price proof to show.</p>
      )}

      {broken.length > 1 && (
        <div className="border-[0.7px] border-white/[0.08] bg-white/[0.02] p-4">
          <h3 className="mb-2 text-[15px] text-white">Earlier events</h3>
          <ul>
            {broken.slice(1).map((e) => (
              <li key={e.id} className="flex justify-between gap-4 border-b border-white/[0.06] py-2 text-[14px] text-white/60 last:border-0">
                <span>{e.rule}: {e.valueAtBreach} against {e.threshold}</span>
                <span>{formatDate(e.detectedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div><Btn onClick={() => go("risk", { q: String(row.id) })}>Open in Risk Management</Btn></div>
    </div>
  );
}
