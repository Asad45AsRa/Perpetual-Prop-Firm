/* eslint-disable @next/next/no-img-element -- decorative glow SVG */
import Image from "next/image";
import { DASH_ASSETS, levelProgress } from "./data";
import { Panel, PanelTitle } from "./Panel";

/**
 * Figma: 1110×176 panel. Track runs between the first and last milestone centres
 * (12px, white/6, round caps); the fill is a #99804A → white gradient.
 */
export function LevelProgress() {
  const { referrals, target, progress, milestones } = levelProgress;

  return (
    <Panel className="h-[176px] px-[16px] pt-[16.7px]">
      <div aria-hidden className="pointer-events-none absolute left-[calc(50%+0.5px)] top-[131px] h-[137px] w-[603px] -translate-x-1/2">
        <div className="absolute inset-[-126.77%_-28.8%]">
          <img src={`${DASH_ASSETS}/glow-level-progress.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>

      <PanelTitle>Level progress</PanelTitle>
      <p className="mt-[9px] text-[12px] leading-normal text-white/50">
        {referrals} of {target} referrals to reach 51–250 level
      </p>

      <div
        role="progressbar"
        aria-label="Level progress"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={referrals}
        className="relative mt-[30px] h-[44px]"
      >
        {/* Track + fill, inset to the milestone centres */}
        <div className="absolute inset-x-[22px] top-[23px] h-[12px] -translate-y-1/2 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#99804A,#FFFFFF)]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <ol className="relative flex h-full justify-between">
          {milestones.map((m) => (
            <li key={m.label} className="relative flex w-[44px] flex-col items-center">
              <span className="relative flex h-[44px] w-[44px] items-center justify-center rounded-full">
                <Image src={`${DASH_ASSETS}/level-node.svg`} alt="" fill unoptimized />
                <Image src={m.image} alt="" width={m.w} height={m.h} sizes="30px" className="relative object-cover" style={{ width: m.w, height: m.h }} />
              </span>
              <span className="absolute top-[55px] whitespace-nowrap text-[14px] leading-normal text-white/50">
                {m.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}
