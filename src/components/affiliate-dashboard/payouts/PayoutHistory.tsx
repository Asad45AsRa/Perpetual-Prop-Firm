import { cn } from "@/lib/utils";
import { formatUsd, type Payout } from "../data";
import { Panel, StatusChip } from "../Panel";

const COLS = "grid grid-cols-[1fr_1.3fr_1fr_1fr] items-center px-[16px]";

/** Payout history (Figma "Payouts" left card): table on tablet+, cards on mobile. */
export function PayoutHistory({ payouts }: { payouts: Payout[] }) {
  return (
    <Panel className="self-start">
      <table className="hidden w-full border-separate border-spacing-0 text-left sm:table">
        <caption className="sr-only">Payout history</caption>
        <thead>
          <tr className={cn(COLS, "h-[50px] bg-white/[0.03] text-[12px] leading-[1.3] text-white/30")}>
            <th className="font-normal">Date</th>
            <th className="font-normal">Method</th>
            <th className="font-normal">Status</th>
            <th className="text-right font-normal">Amount</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p) => (
            <tr key={p.id} className={cn(COLS, "h-[52px] border-t-[0.7px] border-white/[0.06] text-[13px] leading-normal text-white")}>
              <td>{p.date}</td>
              <td className="text-white/70">{p.method}</td>
              <td>
                <PayoutStatusChip status={p.status} />
              </td>
              <td className="text-right">{formatUsd(p.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col sm:hidden">
        <li className="px-[16px] pb-[6px] pt-[14px] text-[14px] text-white">Payout history</li>
        {payouts.map((p) => (
          <li key={p.id} className="border-t-[0.7px] border-white/[0.06] px-[16px] py-[12px] text-[13px] leading-normal text-white">
            <div className="flex items-center justify-between">
              <span>{p.date}</span>
              <span>{formatUsd(p.amount)}</span>
            </div>
            <div className="mt-[6px] flex items-center justify-between">
              <span className="text-[12px] text-white/50">{p.method}</span>
              <PayoutStatusChip status={p.status} />
            </div>
          </li>
        ))}
      </ul>

      {payouts.length === 0 && <p className="py-10 text-center text-[13px] text-white/50">No payouts yet.</p>}
    </Panel>
  );
}

function PayoutStatusChip({ status }: { status: Payout["status"] }) {
  return (
    <StatusChip tone={status === "Pending" ? "amber" : "green"} className="h-[22px] text-[12px] leading-normal">
      {status}
    </StatusChip>
  );
}
