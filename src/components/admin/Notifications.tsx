"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useAdminNavigate, useAdminQuery } from "./adminData";
import { timeAgo } from "./ui";
import type { ListResponse, NotificationItem } from "./types";

const DOT: Record<NotificationItem["level"], string> = { critical: "bg-red-400", warning: "bg-gold", info: "bg-white/40" };

// Bell in the header. The list is built by the server from live state (pending payouts, breaches,
// failed webhooks...), so an item disappears by itself once someone has dealt with it.
export function NotificationBell() {
  const go = useAdminNavigate();
  const [open, setOpen] = useState(false);
  const { data } = useAdminQuery<ListResponse<NotificationItem>>("notifications", "/admin/notifications");
  const items = data?.items ?? [];
  const critical = items.some((i) => i.level === "critical");

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications (${items.length})`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative border-[0.7px] border-white/[0.13] p-2.5 text-white/80 hover:border-gold-accent"
      >
        <Bell size={18} />
        {items.length > 0 && (
          <span className={`absolute -right-1.5 -top-1.5 min-w-[18px] px-1 text-center text-[11px] text-ink ${critical ? "bg-red-400" : "bg-gold-accent"}`}>
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[360px] max-w-[calc(100vw-32px)] border-[0.7px] border-white/[0.13] bg-surface">
          <p className="border-b border-white/[0.08] px-4 py-3 text-[14px] text-white/60">Needs attention</p>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-[14px] text-white/40">All clear. Nothing is waiting.</p>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => { go(n.page); setOpen(false); }}
                    className="flex w-full gap-3 border-b border-white/[0.06] px-4 py-3 text-left hover:bg-white/[0.04]"
                  >
                    <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${DOT[n.level]}`} />
                    <span>
                      <span className="block text-[14px] text-white">{n.title}</span>
                      <span className="block text-[13px] text-white/40">{n.detail} · {timeAgo(n.at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
