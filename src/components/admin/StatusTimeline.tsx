"use client";

import type { ReactNode } from "react";
import { formatDate } from "./ui";

export type TimelineEntry = { id: string; title: string; meta?: string; at: string; tone?: "ok" | "bad" | "neutral"; extra?: ReactNode };

// Vertical history of one record: who did what, and when
export function StatusTimeline({ entries, empty = "No history yet." }: { entries: TimelineEntry[]; empty?: string }) {
  if (entries.length === 0) return <p className="text-[14px] text-white/40">{empty}</p>;
  return (
    <ol className="relative ml-2 border-l border-white/[0.1]">
      {entries.map((e) => (
        <li key={e.id} className="mb-5 ml-5 last:mb-0">
          <span
            className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${e.tone === "bad" ? "bg-red-400" : e.tone === "ok" ? "bg-success" : "bg-gold-accent"}`}
          />
          <p className="text-[15px] text-white">{e.title}</p>
          <p className="text-[13px] text-white/40">{[e.meta, formatDate(e.at)].filter(Boolean).join(" · ")}</p>
          {e.extra}
        </li>
      ))}
    </ol>
  );
}
