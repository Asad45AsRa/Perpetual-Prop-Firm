"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Link2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { AFFILIATE_PROFILE, currentUser } from "./data";

const item =
  "flex h-[40px] w-full items-center gap-[8px] border-t-[0.7px] border-white/[0.06] px-[12px] text-left text-[12px] leading-normal sm:h-[44px] sm:px-[14px] sm:text-[13px] text-white/50 outline-none transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:bg-white/[0.06] focus-visible:text-white";

/** Topbar avatar button + account dropdown (header, My Profile, Copy referral link). */
export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close on outside click / Esc.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  // Arrow keys move between menu items.
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.referralLink);
      setCopied(true);
    } catch {
      // Clipboard blocked (e.g. insecure context): leave the menu open so nothing is lost.
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-[41px] items-center gap-[5px] border-[0.57px] border-white/[0.13] pl-[7.4px] pr-[13px] text-[14px] leading-normal text-white transition-colors hover:bg-white/[0.06]",
          open ? "bg-white/[0.06]" : "bg-white/[0.03]",
        )}
      >
        <span className="relative h-[29px] w-[29px] overflow-hidden rounded-full border-[0.57px] border-white/[0.06] bg-white/[0.06]">
          <Image src={currentUser.avatar} alt="" fill sizes="29px" className="object-cover" />
        </span>
        <span className="hidden sm:inline">{currentUser.name}</span>
        <span className="sr-only sm:hidden">Account menu</span>
      </button>

      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label="Account"
        hidden={!open}
        onKeyDown={onMenuKey}
        className="absolute right-0 top-[calc(100%+8px)] z-30 w-[190px] sm:w-[234px] border-[0.7px] border-white/[0.13] bg-[#161616] shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-[8px] bg-white/[0.03] px-[12px] py-[10px] sm:gap-[10px] sm:px-[14px] sm:py-[12px]">
          <span className="relative h-[30px] w-[30px] shrink-0 sm:h-[38px] sm:w-[38px] overflow-hidden rounded-full border-[0.57px] border-white/[0.13]">
            {/* eager: the menu starts hidden, so a lazy image would pop in after opening */}
            <Image src={currentUser.avatar} alt="" fill sizes="38px" loading="eager" className="object-cover" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] leading-[1.2] text-white sm:text-[16px]">{currentUser.name}</p>
            <p className="mt-[2px] text-[10px] leading-normal text-white/50 sm:text-[11px]">{currentUser.levelLabel}</p>
          </div>
        </div>

        <Link href={AFFILIATE_PROFILE} role="menuitem" onClick={() => setOpen(false)} className={item}>
          <User aria-hidden className="h-[15px] w-[15px]" />
          My Profile
        </Link>
        <button type="button" role="menuitem" onClick={copyLink} className={item}>
          {copied ? (
            <Check aria-hidden className="h-[15px] w-[15px] text-[#47a847]" />
          ) : (
            <Link2 aria-hidden className="h-[15px] w-[15px] -rotate-45" />
          )}
          <span className={cn(copied && "text-[#47a847]")}>{copied ? "Copied" : "Copy referral link"}</span>
        </button>
        <span role="status" className="sr-only">
          {copied ? "Referral link copied" : ""}
        </span>
      </div>
    </div>
  );
}
