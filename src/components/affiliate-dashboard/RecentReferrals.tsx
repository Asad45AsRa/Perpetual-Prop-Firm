import Link from "next/link";
import { cn } from "@/lib/utils";
import { AFFILIATE_BASE, recentReferrals } from "./data";
import { Panel, PanelTitle, StatusChip } from "./Panel";

// Figma columns inside the 575px row: user @15, date @212, status @348, commission @488.
const COLS = "grid grid-cols-[197fr_136fr_140fr_87fr] items-center pl-[15px] min-w-[520px]";

export function RecentReferrals() {
  return (
    <Panel className="px-[16px] pb-[15px] pt-[16.7px] xl:min-h-[307px]">
      <div className="flex items-start justify-between">
        <PanelTitle>Recent referrals</PanelTitle>
        <Link
          href={`${AFFILIATE_BASE}/referrals`}
          className="mr-[9px] mt-[7.4px] text-[12px] leading-normal text-white/50 underline hover:text-white"
        >
          View All
        </Link>
      </div>

      <div className="mt-[14px] overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className={cn(COLS, "h-[37px] items-start pt-[7.3px] text-[12px] leading-[1.3] text-white/30")}>
              <th className="font-normal">User</th>
              <th className="font-normal">Date</th>
              <th className="font-normal">Status</th>
              <th className="font-normal">Commission</th>
            </tr>
          </thead>
          <tbody className="flex flex-col gap-[9px]">
            {recentReferrals.map((r, i) => (
              <tr key={i} className={cn(COLS, "h-[45px] bg-white/[0.03] text-[14px] leading-normal text-white backdrop-blur-[5px]")}>
                <td className="flex items-center gap-[7px]">
                  <span aria-hidden className="h-[25px] w-[25px] shrink-0 rounded-full bg-white/30" />
                  {r.user}
                </td>
                <td>{r.date}</td>
                <td>
                  <StatusChip className="h-[22px] text-[14px] leading-normal">{r.status}</StatusChip>
                </td>
                <td>{r.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
