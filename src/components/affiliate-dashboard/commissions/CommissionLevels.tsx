import Image from "next/image";
import { cn } from "@/lib/utils";
import { commissionLevels, type CommissionLevel } from "../data";
import { Panel } from "../Panel";

const COLS = "grid grid-cols-[1.6fr_1.6fr_1.6fr_1fr] items-center px-[16px]";

/** Level → referrals → commission → recurring table (Figma "Commissions"); cards on mobile. */
export function CommissionLevels() {
  return (
    <Panel>
      {/* Tablet / laptop: table */}
      <table className="hidden w-full border-separate border-spacing-0 text-left sm:table">
        <caption className="sr-only">Commission rates by level</caption>
        <thead>
          <tr className={cn(COLS, "h-[42px] bg-white/[0.03] text-[12px] leading-[1.3] text-white/30")}>
            <th className="font-normal">Level</th>
            <th className="font-normal">Referrals</th>
            <th className="font-normal">Commission</th>
            <th className="text-right font-normal">Recurring</th>
          </tr>
        </thead>
        <tbody>
          {commissionLevels.map((l) => (
            <tr
              key={l.name}
              className={cn(COLS, "h-[52px] border-t-[0.7px] border-white/[0.06] text-[13px] leading-normal text-white")}
            >
              <th scope="row" className="font-normal">
                <LevelName level={l} />
              </th>
              <td className="text-white/70">{l.referrals}</td>
              <td className="text-white/70">{l.commission}</td>
              <td className="text-right text-white/70">{l.recurring}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: one card per level */}
      <ul className="flex flex-col sm:hidden">
        {commissionLevels.map((l, i) => (
          <li key={l.name} className={cn("px-[16px] py-[14px]", i > 0 && "border-t-[0.7px] border-white/[0.06]")}>
            <LevelName level={l} />
            <dl className="mt-[10px] grid grid-cols-3 gap-2 text-[12px] leading-[1.3]">
              {(
                [
                  ["Referrals", l.referrals],
                  ["Commission", l.commission],
                  ["Recurring", l.recurring],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-white/30">{k}</dt>
                  <dd className="mt-[2px] text-[13px] text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function LevelName({ level }: { level: CommissionLevel }) {
  return (
    <span className="flex items-center gap-[10px] text-[13px] text-white">
      <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
        <Image
          src={level.image}
          alt=""
          width={level.w}
          height={level.h}
          sizes="24px"
          className="object-contain"
          style={{ width: level.w, height: level.h }}
        />
      </span>
      {level.name}
    </span>
  );
}
