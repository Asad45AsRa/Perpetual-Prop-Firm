/* eslint-disable @next/next/no-img-element -- decorative glow SVGs, no optimization needed */
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ASSET_DIR, COIN_SRC, PROMO_STEPS } from "./constants";

/**
 * Promo card (Figma "Step 3", 457×425 on desktop).
 *
 * Responsive behaviour:
 *  - mobile / tablet (< lg): full-width card, height follows content, shown ABOVE the form
 *  - desktop (lg+): fixed 457×425, flush against the form card on the right
 *
 * Content is laid out in normal flow (not absolute) so it can wrap on narrow screens;
 * the desktop numbers reproduce the original Figma positions.
 */
export function PromoPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "relative w-full shrink-0 overflow-hidden border border-white/15 bg-ink pb-[26px] lg:h-[425px] lg:w-[457px] lg:pb-0",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 45% at 50% 20%, rgba(150,120,60,0.30), transparent 70%), radial-gradient(ellipse 90% 40% at 50% 100%, rgba(150,120,60,0.22), transparent 70%)",
      }}
    >
      {/* Gold glows (top + bottom) */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[98px] h-[655px] w-[373px] -translate-x-1/2">
        <div className="absolute inset-[-30.53%_-53.62%]">
          <img src={`${ASSET_DIR}/glow-promo-bottom.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-327px] h-[655px] w-[373px] -translate-x-1/2">
        <div className="absolute inset-[-30.53%_-53.62%]">
          <img src={`${ASSET_DIR}/glow-promo-top.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Coin: 238px image rotated 15° inside a 292px box (smaller on phones) */}
        <div className="pointer-events-none relative -mt-[8px] h-[212px] w-full sm:-mt-[15px] sm:h-[260px]">
          <div className="absolute left-[calc(50%+0.78px)] top-0 flex h-[232px] w-[232px] -translate-x-1/2 items-center justify-center sm:h-[291.78px] sm:w-[291.78px]">
            <Image
              src={COIN_SRC}
              alt=""
              width={476}
              height={476}
              sizes="(min-width: 640px) 238px, 190px"
              priority
              className="h-[190px] w-[190px] rotate-[14.99deg] object-cover sm:h-[238.275px] sm:w-[238.275px] lg:scale-[1.3]"
            />
          </div>
        </div>

        <p className="px-4 text-center text-[21px] leading-[1.3] text-white sm:text-[25px]">
          Trade our capital. Keep up to
          <br />
          80% of the profit.
        </p>

        <ul className="mt-[16px] flex flex-wrap justify-center gap-[8px] px-[16px] sm:mt-[18px] sm:gap-[10px] sm:px-[23px] lg:px-[16px]">
          {PROMO_STEPS.map((step) => (
            <li
              key={step}
              className="flex h-[32px] items-center gap-[6px] whitespace-nowrap border-b-2 border-gold-accent/50 bg-white/[0.06] pl-[12px] pr-[13px] text-[12.5px] leading-none text-white/60 sm:h-[34px] sm:gap-[7px] sm:pl-[15px] sm:pr-[16px] sm:text-[14px]"
            >
              <Image src={`${ASSET_DIR}/check-gold.svg`} alt="" width={18} height={18} unoptimized className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
              {step}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}