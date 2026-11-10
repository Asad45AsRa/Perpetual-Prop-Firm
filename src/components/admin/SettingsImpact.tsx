"use client";

import { useAdminQuery } from "./adminData";
import { Pill, StateMessage } from "./ui";
import type { SettingsImpactData } from "./types";

// Shown inside the "Save settings" dialog, above the before / after view.
// It tells the person what the change will touch (live accounts, open payouts, traders...) so nobody
// saves a rule change blind. A highlighted line means "look at this before you confirm".
// Data: GET /admin/settings-impact?section=<risk|trading|payouts|compliance|plisio|flags|demo|leaderboard|reserve>
export function SettingsImpact({ section }: { section: string }) {
  const { data, isPending, error } = useAdminQuery<SettingsImpactData>("settings-impact", `/admin/settings-impact?section=${encodeURIComponent(section)}`);

  if (isPending) return <StateMessage>Checking what this touches…</StateMessage>;
  // The impact preview is a safety aid. If it cannot load, saving must still be possible.
  if (error) return <p className="text-[13px] text-white/40">The impact preview could not be loaded. You can still save.</p>;

  return (
    <div className="border-[0.7px] border-white/[0.08] bg-white/[0.02] p-4">
      <p className="mb-2 text-[14px] text-white">What this change touches</p>
      <ul>
        {data.items.map((i) => (
          <li key={i.label} className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-2 text-[13px] last:border-0">
            <span className="text-white/60">{i.label}</span>
            <span className="text-right">{i.ok ? <b className="font-normal text-white">{i.detail}</b> : <Pill tone="gold">{i.detail}</Pill>}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
