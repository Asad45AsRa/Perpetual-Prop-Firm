"use client";

import { useAdminNavigate, useAdminQuery } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { canView } from "../permissions";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Btn, Card } from "../ui";
import type { AdminPage, SettingsData } from "../types";

// Controls the trader leaderboard and the "Rank" and "Top %" shown on every trader's Home page.
// Rank is calculated by the server from the rules in Platform Settings > Leaderboard, so staff never type a rank.
// Staff can hide a trader, bring them back, and reset a username that breaks the rules.
// List: GET /admin/leaderboard   Actions: POST /admin/leaderboard/:id/<hide|show|reset-username>
const config: PageConfig = {
  pageKey: "leaderboard",
  resource: "leaderboard",
  readOnly: true,
  columns: [
    { key: "rank", label: "Rank", format: "number" },
    { key: "username", label: "Username" },
    { key: "traderName", label: "Trader" },
    { key: "pnl", label: "PnL", format: "pnl" },
    { key: "winRate", label: "Win rate", format: "percent" },
    { key: "volume", label: "Volume", format: "money" },
    { key: "trades", label: "Trades", format: "number" },
    { key: "eligible", label: "Ranked", format: "bool" },
    { key: "why", label: "Why not ranked" },
    { key: "status", label: "On leaderboard", format: "status" },
  ],
  primary: { label: "Export leaderboard", kind: "export" },
  filters: [{ key: "status", label: "On leaderboard" }],
  views: [{ label: "Not ranked", filters: { eligible: "false" } }, { label: "Hidden by staff", filters: { status: "hidden" } }],
  actions: [
    { label: "Hide", action: "hide", reason: true, tone: "danger", permission: "traders.suspend", success: "Trader hidden from the leaderboard.", show: (r) => r.status === "visible" },
    { label: "Show", action: "show", tone: "success", permission: "traders.suspend", success: "Trader is on the leaderboard again.", show: (r) => r.status === "hidden" },
    { label: "Reset username", action: "reset-username", reason: true, permission: "traders.suspend", success: "Username reset. The trader will pick a new one." },
  ],
  detailTitle: (r) => `${r.username} · ${r.traderName}`,
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  exportName: "leaderboard",
  emptyText: "Nobody is on the leaderboard yet.",
};

// The rules the ranking follows, in plain words
function RankingRules() {
  const go = useAdminNavigate();
  const user = useAdminSession((s) => s.user);
  const allowed = canView(user, "settings");
  const { data } = useAdminQuery<SettingsData>("settings", "/admin/settings", { enabled: allowed });
  const l = data?.sections.leaderboard;

  return (
    <Card title="How ranking works" action={allowed ? <Btn onClick={() => go("settings")}>Edit in Platform Settings</Btn> : undefined}>
      {!allowed ? (
        <p className="text-[14px] text-white/50">The ranking rules are edited in Platform Settings. Ask someone with access to change them.</p>
      ) : !l ? (
        <p className="text-[14px] text-white/40">Loading…</p>
      ) : (
        <ul className="grid gap-1.5 text-[14px] text-white/60">
          <li>
            Period: <b className="font-normal text-white">{String(l.periodMode)}</b>
            {l.periodMode === "custom" && <> ({String(l.periodStart)} to {String(l.periodEnd)})</>}
          </li>
          <li>Traders are sorted from high to low by <b className="font-normal text-white">{String(l.rankBy)}</b>.</li>
          <li>A trader needs at least <b className="font-normal text-white">{Number(l.minTrades)}</b> closed trades to be ranked.</li>
          <li>Flagged traders are {l.excludeFlagged === "yes" ? "left out" : "included"}. Hidden traders and demo accounts are never ranked.</li>
          <li>Top % = rank divided by the number of ranked traders, rounded up.</li>
        </ul>
      )}
    </Card>
  );
}

function Leaderboard() {
  return (
    <>
      <RankingRules />
      <ResourcePage config={config} />
    </>
  );
}

export const page: AdminPage = { key: "leaderboard", label: "Leaderboard", group: "Traders & trading", component: Leaderboard };
