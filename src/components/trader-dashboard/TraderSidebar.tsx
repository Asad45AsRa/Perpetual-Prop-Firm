"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, TrendingUp, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASH_ASSETS } from "@/components/affiliate-dashboard/data";
import { TRADER_BASE } from "./data";
import { TraderNavIcon, type TraderNavIconName } from "./TraderNavIcon";

type NavItem = {
  label: string;
  href: string;
  /** Figma icon (gold gradient when active) or a lucide fallback (Terminal has no export yet). */
  icon: TraderNavIconName | LucideIcon;
  locked?: boolean;
};

// TODO(routes): Payouts, Competitions, Purchase History and Settings pages aren't built yet.
const NAV: NavItem[] = [
  { label: "Home", href: TRADER_BASE, icon: "home" },
  { label: "Challenges", href: `${TRADER_BASE}/challenges`, icon: "challenges" },
  { label: "Terminal", href: "/terminal", icon: TrendingUp },
  { label: "Accounts", href: `${TRADER_BASE}/accounts`, icon: "accounts" },
  { label: "Payouts", href: `${TRADER_BASE}/payouts`, icon: "payouts" },
  { label: "Competitions", href: `${TRADER_BASE}/competitions`, icon: "competitions", locked: true },
];

const FOOTER_NAV: NavItem[] = [
  { label: "Purchase History", href: `${TRADER_BASE}/purchases`, icon: "history" },
  { label: "Settings", href: `${TRADER_BASE}/settings`, icon: "settings" },
];

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  const { label, href, icon: Icon, locked } = item;
  const body = (
    <>
      <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
        {typeof Icon === "string" ? (
          <TraderNavIcon name={Icon} active={active} />
        ) : (
          <Icon aria-hidden className={cn("h-[19px] w-[19px]", active ? "text-gold-accent" : "text-white/50")} strokeWidth={1.8} />
        )}
      </span>
      <span className="flex-1">{label}</span>
      {locked && <Lock aria-hidden className="h-[14px] w-[14px] text-white/40" />}
    </>
  );
  const cls = cn(
    "flex h-[44px] w-[213px] items-center gap-[8px] border-l-2 pl-[8px] pr-[10px] text-[14px] capitalize leading-[0.865] transition-colors",
    active
      ? "border-gold-accent bg-[linear-gradient(90deg,rgba(153,128,74,0.3),rgba(153,128,74,0))] text-white"
      : "border-transparent text-white/50 hover:bg-white/[0.03] hover:text-white/80",
  );

  if (locked) {
    return (
      <span aria-disabled="true" title={`${label} unlocks soon`} className={cn(cls, "cursor-not-allowed hover:bg-transparent hover:text-white/50")}>
        {body}
        <span className="sr-only"> (locked)</span>
      </span>
    );
  }
  return (
    <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cls}>
      {body}
    </Link>
  );
}

/** Trader dashboard sidebar (Figma "Home"): main nav + Purchase History / Settings pinned to the bottom. Drawer below lg. */
export function TraderSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn("fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col overflow-y-auto border-r-[0.7px] border-white/[0.13] bg-ink transition-transform duration-300",
          "lg:sticky lg:top-0 lg:h-screen lg:max-h-[730px] lg:translate-x-0 lg:self-start",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="box-content flex h-[25.25px] items-center justify-between pl-[23px] pr-[16px] pt-[36.6px]">
          <Link href={TRADER_BASE} aria-label="Perpeye home">
            <Image src={`${DASH_ASSETS}/logo.svg`} alt="Perpeye" width={101} height={25} priority unoptimized className="h-[25.25px] w-[101px]" />
          </Link>
          <button type="button" onClick={onClose} aria-label="Close menu" className="text-white/60 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Trader" className="mt-[42px] flex flex-col gap-[6px] pl-[23px] pr-[20px]">
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} active={pathname === item.href} onNavigate={onClose} />
          ))}
        </nav>

        <nav aria-label="Account" className="mt-auto flex flex-col gap-[6px] pb-[27px] pl-[23px] pr-[20px] pt-[40px]">
          {FOOTER_NAV.map((item) => (
            <NavLink key={item.label} item={item} active={pathname === item.href} onNavigate={onClose} />
          ))}
        </nav>
      </aside>
    </>
  );
}
