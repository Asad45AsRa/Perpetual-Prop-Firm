"use client";

import { useState } from "react";
import { adminApi } from "../adminApi";
import { useAdminMutation, useAdminQuery } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { LAUNCH_MARKET_TARGET } from "../constants";
import { can, canManage } from "../permissions";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Btn, Card, describeError, Modal, ProgressBar, useToast } from "../ui";
import type { AdminPage, ListResponse } from "../types";

// Markets come from Hyperliquid, never from typing. "Sync" fetches the venue's list and shows what
// would change. Nothing goes live until a person verifies the market and enables it.
// List: GET /admin/markets   Sync preview: POST /admin/markets/sync   Apply: POST /admin/markets/sync/apply
type Preview = { added: { symbol: string; category: string; maxLeverage: number }[]; changed: { symbol: string; field: string; from: unknown; to: unknown }[]; unchanged: number };

function SyncMarkets() {
  const toast = useToast();
  const user = useAdminSession((s) => s.user);
  const apply = useAdminMutation();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  if (!canManage(user, "markets") || !can(user, "market.sync")) return null;

  const load = async () => {
    setBusy(true);
    try {
      setPreview(await adminApi<Preview>("/admin/markets/sync", { method: "POST" }));
    } catch (err) {
      toast(describeError(err), true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Btn disabled={busy} onClick={load}>{busy ? "Checking…" : "Sync from Hyperliquid"}</Btn>
      {preview && (
        <Modal title="Market changes found" subtitle="New markets start disabled and unverified." onClose={() => setPreview(null)}>
          {preview.added.length + preview.changed.length === 0 ? (
            <p className="text-[15px] text-white/60">Everything is already up to date ({preview.unchanged} markets).</p>
          ) : (
            <div className="grid gap-4 text-[15px]">
              {preview.added.map((m) => <p key={m.symbol} className="text-success">+ New: {m.symbol} ({m.category}, up to {m.maxLeverage}x)</p>)}
              {preview.changed.map((c) => <p key={c.symbol + c.field} className="text-gold-light">~ {c.symbol}: {c.field} {String(c.from)} → {String(c.to)}</p>)}
              <Btn
                tone="gold"
                disabled={apply.isPending}
                onClick={() => apply.mutate({ path: "/admin/markets/sync/apply" }, { onSuccess: () => { toast("Markets synced."); setPreview(null); }, onError: (e) => toast(describeError(e), true) })}
              >
                Apply changes
              </Btn>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

const config: PageConfig = {
  pageKey: "markets",
  resource: "markets",
  allowCreate: false,
  allowDelete: false,
  columns: [
    { key: "symbol", label: "Market" },
    { key: "category", label: "Category" },
    { key: "maxLeverage", label: "Max leverage", format: "multiplier" },
    { key: "fee", label: "Fee", format: "percent" },
    { key: "verified", label: "Verified", format: "bool" },
    { key: "status", label: "Status", format: "status" },
    { key: "hours", label: "Hours" },
    { key: "priceSource", label: "Price source", hidden: true },
    { key: "tickSize", label: "Tick size", format: "number", hidden: true },
    { key: "minSize", label: "Min size", format: "number", hidden: true },
    { key: "sizeDecimals", label: "Size decimals", hidden: true },
    { key: "spreadBps", label: "Spread (bps)", hidden: true },
    { key: "slippageBps", label: "Slippage (bps)", hidden: true },
    { key: "fundingMode", label: "Funding", hidden: true },
    { key: "staleSeconds", label: "Stale after (s)", hidden: true },
    { key: "breakerPct", label: "Circuit breaker %", hidden: true },
  ],
  primary: { label: "Export markets", kind: "export" },
  toolbar: <SyncMarkets />,
  fields: [
    { key: "symbol", label: "Market", lockedOnEdit: true },
    { key: "maxLeverage", label: "Max leverage", type: "number", required: true },
    { key: "fee", label: "Fee (%)", type: "number", required: true },
    { key: "tickSize", label: "Tick size", type: "number", required: true },
    { key: "minSize", label: "Minimum size", type: "number", required: true },
    { key: "sizeDecimals", label: "Size decimals", type: "number" },
    { key: "hours", label: "Trading hours", required: true },
    { key: "spreadBps", label: "Spread (bps)", type: "number" },
    { key: "slippageBps", label: "Slippage (bps)", type: "number" },
    { key: "fundingMode", label: "Funding treatment", type: "select", options: ["mirror", "fixed"] },
    { key: "staleSeconds", label: "Treat price as stale after (seconds)", type: "number", required: true },
    { key: "breakerPct", label: "Circuit breaker move (%)", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["enabled", "disabled", "halted", "reduce-only"], help: "An unverified market cannot be enabled." },
  ],
  filters: [{ key: "status", label: "Status" }, { key: "category", label: "Category" }, { key: "verified", label: "Verified" }],
  views: [{ label: "Not verified yet", filters: { verified: "false" } }, { label: "Halted", filters: { status: "halted" } }],
  actions: [
    { label: "Verify", action: "verify", tone: "success", success: "Market verified.", show: (r) => r.verified !== true },
    { label: "Enable", action: "resume", tone: "success", success: "Market enabled.", show: (r) => r.verified === true && (r.status === "halted" || r.status === "disabled") },
    { label: "Halt", action: "halt", reason: true, tone: "danger", success: "Market halted.", show: (r) => r.status === "enabled" || r.status === "reduce-only" },
  ],
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  detailTitle: (r) => String(r.symbol),
  exportName: "markets",
  emptyText: "No markets yet. Use Sync from Hyperliquid.",
};

// Progress toward the verified launch list required by the project brief
function LaunchProgress() {
  const { data } = useAdminQuery<ListResponse<Record<string, unknown>>>("markets", "/admin/markets?pageSize=100&view=progress");
  const verified = (data?.items ?? []).filter((m) => m.verified === true).length;
  return (
    <Card title="Launch list">
      <p className="mb-3 text-[15px] text-white/60">{verified} of {LAUNCH_MARKET_TARGET} planned markets are verified. Unverified markets are never offered to traders.</p>
      <ProgressBar value={(verified / LAUNCH_MARKET_TARGET) * 100} warnAt={101} />
    </Card>
  );
}

function MarketManagement() {
  return (
    <>
      <LaunchProgress />
      <ResourcePage config={config} />
    </>
  );
}

export const page: AdminPage = { key: "markets", label: "Market Management", group: "Traders & trading", component: MarketManagement };
