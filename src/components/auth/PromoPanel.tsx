/* eslint-disable @next/next/no-img-element -- decorative glow SVGs, no optimization needed */
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ASSET_DIR, COIN_SRC, PROMO_STEPS } from "./constants";

/** Right-hand 457×425 promo card (Figma "Step 3" at x=720). */
export function PromoPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "relative h-[425px] w-[457px] shrink-0 overflow-hidden border border-white/15 bg-ink",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 45% at 50% 20%, rgba(150,120,60,0.30), transparent 70%), radial-gradient(ellipse 90% 40% at 50% 100%, rgba(150,120,60,0.22), transparent 70%)",
      }}
    >
      {/* Gold glows (top + bottom) */}
      <div aria-hidden className="absolute left-1/2 top-[98px] h-[655px] w-[373px] -translate-x-1/2">
        <div className="absolute inset-[-30.53%_-53.62%]">
          <img src={`${ASSET_DIR}/glow-promo-bottom.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>
      <div aria-hidden className="absolute left-1/2 top-[-327px] h-[655px] w-[373px] -translate-x-1/2">
        <div className="absolute inset-[-30.53%_-53.62%]">
          <img src={`${ASSET_DIR}/glow-promo-top.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>

      {/* Coin: 238px image rotated 15° inside a 292px box */}
      <div className="absolute left-[calc(50%+0.78px)] top-[-15px] flex h-[291.78px] w-[291.78px] -translate-x-1/2 items-center justify-center">
        <Image
          src={COIN_SRC}
          alt=""
          width={476}
          height={476}
          sizes="238px"
          priority
          className="h-[238.275px] w-[238.275px] rotate-[14.99deg] object-cover"
        />
      </div>

      <p className="absolute left-[calc(50%+4.5px)] top-[245px] w-max -translate-x-1/2 text-center text-[25px] leading-[1.3] text-white">
        Trade our capital. Keep up to
        <br />
        80% of the profit.
      </p>

      <ul className="absolute inset-x-[23px] top-[328px] flex flex-wrap justify-center gap-[10px]">
        {PROMO_STEPS.map((step) => (
          <li
            key={step}
            className="flex h-[34px] items-center gap-[7px] border-b-2 border-gold-accent/50 bg-white/[0.06] pl-[15px] pr-[16px] text-[14px] leading-none text-white/60"
          >
            <Image src={`${ASSET_DIR}/check-gold.svg`} alt="" width={18} height={18} unoptimized className="h-[18px] w-[18px]" />
            {step}
          </li>
        ))}
      </ul>
    </aside>
  );
}