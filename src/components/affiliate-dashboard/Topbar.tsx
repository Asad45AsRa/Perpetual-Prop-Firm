import Image from "next/image";
import { Menu } from "lucide-react";
import { currentUser, DASH_ASSETS } from "./data";

export function Topbar({ onMenu }: { onMenu: () => void }) {
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
            Welcome back, {currentUser.name}
          </h1>
          <p className="mt-[8px] text-[14px] leading-[1.3] text-white/50">
            Track referrals, commissions and perks in one place.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[9px]">
        <button type="button" aria-label={`Notifications (${currentUser.unreadNotifications} unread)`} className="relative h-[41px] w-[41px]">
          <Image src={`${DASH_ASSETS}/icons/bell.svg`} alt="" width={41} height={41} unoptimized className="h-[41px] w-[41px]" />
          {currentUser.unreadNotifications > 0 && (
            <span className="absolute -top-[7px] right-[-5px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#C71919] px-1 text-[12.5px] leading-none text-white">
              {currentUser.unreadNotifications}
            </span>
          )}
        </button>
        <button
          type="button"
          className="flex h-[41px] items-center gap-[5px] border-[0.57px] border-white/[0.13] bg-white/[0.03] pl-[7.4px] pr-[13px] text-[14px] leading-normal text-white"
        >
          <span className="relative h-[29px] w-[29px] overflow-hidden rounded-full border-[0.57px] border-white/[0.06] bg-white/[0.06]">
            <Image src={currentUser.avatar} alt="" fill sizes="29px" className="object-cover" />
          </span>
          <span className="hidden sm:inline">{currentUser.name}</span>
        </button>
      </div>
    </header>
  );
}
