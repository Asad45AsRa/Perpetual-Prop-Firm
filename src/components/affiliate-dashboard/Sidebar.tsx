"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AFFILIATE_BASE, currentLevel, DASH_ASSETS } from "./data";
import { SidebarIcon } from "./SidebarIcon";

const NAV = [
  { label: "Overview", href: AFFILIATE_BASE, icon: "overview" },
  { label: "Referrals", href: `${AFFILIATE_BASE}/referrals`, icon: "referrals" },
  { label: "Commissions", href: `${AFFILIATE_BASE}/commissions`, icon: "commissions" },
  { label: "Payouts", href: `${AFFILIATE_BASE}/payouts`, icon: "payouts" },
  { label: "Giveaways", href: `${AFFILIATE_BASE}/giveaways`, icon: "giveaways" },
  { label: "Certificates", href: `${AFFILIATE_BASE}/certificates`, icon: "certificates" },
] as const;


function LevelCard() {
  return (
    <div className="relative h-[139px] w-[213px] overflow-hidden border-[0.563px] border-white/[0.13] bg-gold-accent/10 backdrop-blur-[8px]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-38.56px] h-[91px] w-[213px] -translate-x-1/2">
        <div className="absolute inset-[-76.92%_-32.86%]">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative glow */}
          <img src={`${DASH_ASSETS}/glow-level-card.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>
      <p className="absolute left-[12px] top-[10.7px] text-[12px] leading-[1.3] text-white">
        Current: {currentLevel.name}
      </p>
      <p className="absolute left-[12px] top-[30.7px] text-[17px] leading-[1.3] tracking-[-0.34px] text-white">
        {currentLevel.range}
      </p>
      <Image
        src={`${DASH_ASSETS}/level-${currentLevel.tier.toLowerCase()}.png`}
        alt=""
        width={68}
        height={62}
        sizes="68px"
        className="absolute left-[132px] top-[14.4px] h-[62px] w-[68px] object-cover drop-shadow-[0_15px_17.7px_rgba(0,0,0,0.3)]"
      />
      <span className="absolute left-[12px] top-[59.7px] bg-[linear-gradient(110.48deg,#FFFFFF_5.83%,#99804A_99.75%)] px-[8.25px] py-[3.14px] text-[10px] uppercase leading-normal text-ink">
        {currentLevel.tier}
      </span>
      <div className="absolute left-[11.44px] top-[97px] h-[8px] w-[188px] rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#99804A,#FFFFFF)]"
          style={{ width: `${currentLevel.progress * 100}%` }}
        />
      </div>
      <p className="absolute left-[12px] top-[110.4px] text-[12px] leading-[1.3] text-white/50">
        {currentLevel.terms}
      </p>
    </div>
  );
}

type SidebarProps = { open: boolean; onClose: () => void };

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col overflow-y-auto border-r-[0.7px] border-white/[0.13] bg-ink transition-transform duration-300",
          "lg:sticky lg:top-0 lg:h-screen lg:max-h-[730px] lg:translate-x-0 lg:self-start",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[25.25px] items-center justify-between pl-[23px] pr-[16px] pt-[36.6px] box-content">
          <Link href={AFFILIATE_BASE} aria-label="Perpeye affiliate overview">
            <Image src={`${DASH_ASSETS}/logo.svg`} alt="Perpeye" width={101} height={25} priority unoptimized className="h-[25.25px] w-[101px]" />
          </Link>
          <button type="button" onClick={onClose} aria-label="Close menu" className="text-white/60 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Affiliate" className="mt-[42px] flex flex-col gap-[6px] pl-[23px] pr-[20px]">
          {NAV.map(({ label, href, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-[44px] w-[213px] items-center gap-[8px] border-l-2 pl-[8px] text-[14px] capitalize leading-[0.865] transition-colors",
                  active
                    ? "border-gold-accent bg-[linear-gradient(90deg,rgba(153,128,74,0.3),rgba(153,128,74,0))] text-white"
                    : "border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white/80",
                )}
              >
                <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
                  <SidebarIcon name={icon} active={active} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Pinned to the sidebar bottom: at the Figma height (730px) this lands at y=564;
            on short screens it moves up, and the sidebar scrolls if there's still no room. */}
        <div className="mt-auto shrink-0 pb-[27px] pl-[23px] pt-[40px]">
          <LevelCard />
        </div>
      </aside>
    </>
  );
}
