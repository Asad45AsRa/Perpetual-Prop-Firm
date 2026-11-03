/* eslint-disable @next/next/no-img-element -- decorative glow SVGs, no optimization needed */
import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ASSET_DIR } from "./constants";

/**
 * Left form card (Figma "Step 3", 457px wide): translucent fill, 0.7px border,
 * two corner glows, flame logo, title + subtitle. Form content sits 25px from each side.
 */
export function OnboardingCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden border-[0.7px] border-white/[0.13] bg-ink/20 px-[16px] pb-[19px] pt-[19px] sm:px-[24.5px]",
        className,
      )}
    >
      {/* Corner glows */}
      <div aria-hidden className="pointer-events-none absolute left-[calc(50%+229px)] top-[366px] h-[118px] w-[195px] -translate-x-1/2">
        <div className="absolute inset-[-169.49%_-102.56%]"><img src={`${ASSET_DIR}/glow-card.svg`} alt="" className="block h-full w-full max-w-none" /></div>
      </div>
      <div aria-hidden className="pointer-events-none absolute left-[calc(50%-228px)] top-[-55px] h-[118px] w-[195px] -translate-x-1/2">
        <div className="absolute inset-[-169.49%_-102.56%]"><img src={`${ASSET_DIR}/glow-card.svg`} alt="" className="block h-full w-full max-w-none" /></div>
      </div>

      <div className="relative">
        <Image
          src={`${ASSET_DIR}/flame-logo.svg`}
          alt="Perpeye"
          width={49}
          height={49}
          priority
          unoptimized
          className="mx-auto h-[49px] w-[49.225px]"
        />
        <header className="mt-[18px] text-center">
          <h1 className="text-[26px] font-normal leading-[1.3] text-white sm:text-[30px]">{title}</h1>
          <p className="mt-[12px] text-[14px] leading-[1.3] text-white/50">{subtitle}</p>
        </header>
        {children}
      </div>
    </section>
  );
}