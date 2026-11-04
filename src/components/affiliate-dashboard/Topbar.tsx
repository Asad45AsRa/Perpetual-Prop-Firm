"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AFFILIATE_BASE, PAGE_HEADERS } from "./data";
import { Notifications } from "./Notifications";
import { UserMenu } from "./UserMenu";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const header = PAGE_HEADERS[pathname] ?? PAGE_HEADERS[AFFILIATE_BASE];

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
          <h1 className="text-[28px] font-normal leading-[35px] tracking-[-0.7px] text-white sm:text-[35px]">
            {header.title}
          </h1>
          <p className="mt-[8px] text-[14px] leading-[1.3] text-white/50">{header.subtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[9px]">
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}
