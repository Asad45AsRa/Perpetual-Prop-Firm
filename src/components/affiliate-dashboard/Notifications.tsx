"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASH_ASSETS, notifications as seed, type Notification } from "./data";

function NotificationIcon({ icon }: { icon: Notification["icon"] }) {
  if (icon === "leaderboard") return <BarChart3 aria-hidden className="h-[16px] w-[16px] text-white" strokeWidth={1.6} />;
  const size = icon === "giveaways" ? 15 : icon === "certificates" ? 16 : 17;
  return <Image src={`${DASH_ASSETS}/icons/${icon}.svg`} alt="" width={size} height={size} unoptimized loading="eager" style={{ width: size, height: size }} />;
}

/** Topbar bell + notifications dropdown (Figma "Notifications"): header with Mark all as read, list with unread dots. */
export function Notifications() {
  const [items, setItems] = useState<Notification[]>(seed);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const unread = items.filter((n) => n.unread).length;

  // Close on outside click / Esc.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAllRead = () => {
    // TODO(backend): persist read state.
    setItems((list) => list.map((n) => ({ ...n, unread: false })));
  };
  const markRead = (id: string) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn("relative h-[41px] w-[41px] transition-opacity hover:opacity-90", open && "opacity-90")}
      >
        <Image src={`${DASH_ASSETS}/icons/bell.svg`} alt="" width={41} height={41} unoptimized className="h-[41px] w-[41px]" />
        {unread > 0 && (
          <span className="absolute -top-[7px] right-[-5px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#C71919] px-1 text-[12.5px] leading-none text-white">
            {unread}
          </span>
        )}
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-label="Notifications"
        hidden={!open}
        className="z-30 overflow-hidden border-[0.7px] border-white/[0.14] bg-[rgba(44,44,46,0.78)] shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-[16px] max-sm:fixed max-sm:inset-x-[16px] max-sm:top-[80px] sm:absolute sm:right-0 sm:top-[calc(100%+8px)] sm:w-[340px]"
      >
        <div className="relative flex items-center justify-between border-b-[0.7px] border-white/[0.10] bg-white/[0.04] px-[16px] py-[14px]">
          <h2 className="text-[14px] leading-normal text-white">Notifications</h2>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="text-[12px] leading-normal text-gold-accent transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:underline disabled:opacity-40"
          >
            Mark all as read
          </button>
        </div>

        <ul className="relative max-h-[min(70vh,480px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((n) => (
            <li key={n.id} className="border-t-[0.7px] border-white/[0.08] first:border-t-0">
              <Link
                href={n.href}
                onClick={() => markRead(n.id)}
                className="flex items-start gap-[12px] px-[16px] py-[12px] outline-none transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.07]"
              >
                <span className="mt-[2px] flex h-[34px] w-[34px] shrink-0 items-center justify-center border-[0.7px] border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <NotificationIcon icon={n.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] leading-[1.3] text-white">{n.title}</span>
                  <span className="mt-[3px] block text-[12px] leading-[1.35] text-white/50">{n.body}</span>
                  <span className="mt-[5px] block text-[11px] leading-normal text-white/30">{n.time}</span>
                </span>
                {n.unread && (
                  <span className="mt-[6px] shrink-0">
                    <span aria-hidden className="block h-[6px] w-[6px] rounded-full bg-gold-accent shadow-[0_0_8px_rgba(153,128,74,0.9)]" />
                    <span className="sr-only">Unread</span>
                  </span>
                )}
              </Link>
            </li>
          ))}
          {items.length === 0 && <li className="border-t-[0.7px] border-white/[0.06] px-[16px] py-[24px] text-center text-[12px] text-white/50">You’re all caught up.</li>}
        </ul>
      </div>
    </div>
  );
}
