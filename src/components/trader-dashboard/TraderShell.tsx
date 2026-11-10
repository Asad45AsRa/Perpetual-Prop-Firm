"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { DASH_ASSETS, formatUsd } from "@/components/affiliate-dashboard/data";
import { Notifications } from "@/components/affiliate-dashboard/Notifications";
import { UserMenu } from "@/components/affiliate-dashboard/UserMenu";
import { TRADER_BASE, TRADER_PAGE_HEADERS, trader } from "./data";
import { TraderSidebar } from "./TraderSidebar";

function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const header = TRADER_PAGE_HEADERS[pathname] ?? TRADER_PAGE_HEADERS[TRADER_BASE];

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="mt-[6px] flex h-[34px] w-[34px] shrink-0 items-center justify-center border-[0.57px] border-white/[0.13] bg-white/[0.03] text-white/70 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[28px] font-normal leading-[35px] tracking-[-0.7px] text-white sm:text-[35px]">{header.title}</h1>
          <p className="mt-[8px] text-[14px] leading-[1.3] text-white/50">{header.subtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[9px]">
        {/* Figma: lifetime payouts pill left of the bell (hidden on phones to keep the header on one line). */}
        <div className="hidden h-[41px] items-center gap-[9px] border-[0.57px] border-white/[0.13] bg-white/[0.03] pl-[5px] pr-[10px] md:flex">
          {/* Figma tile: gold-tinted 32px box with a gold-gradient wallet */}
          <Image src="/images/trader-dashboard/lifetime-payouts.svg" alt="" width={32} height={32} unoptimized className="h-[32px] w-[32px]" />
          <span className="whitespace-nowrap text-[15px] leading-none text-white">{formatUsd(trader.lifetimePayouts)}</span>
          <span className="whitespace-nowrap pt-[2px] text-[12px] leading-none text-white/60">Lifetime Payouts</span>
        </div>
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}

/** Sidebar (256px, drawer below lg) + content column; same frame and fixed background glow as the affiliate dashboard. */
export function TraderShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-ink">
      <TraderSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="relative min-w-0 flex-1 px-4 pb-[46px] pt-6 sm:px-6 lg:pl-[36px] lg:pr-[38px] lg:pt-[37px]">
        <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 right-0 overflow-hidden lg:left-[256px]">
          <Image
            src={`${DASH_ASSETS}/bg-glow.png`}
            alt=""
            width={2880}
            height={1566}
            priority
            sizes="(min-width: 1024px) calc(100vw - 256px), 100vw"
            className="h-auto w-full select-none"
          />
        </div>
        <div className="relative mx-auto max-w-[1110px]">
          <Topbar onMenu={() => setMenuOpen(true)} />
          {children}
        </div>
      </div>
    </div>
  );
}
