"use client";

import { useEffect, useState } from "react";
import { useAdminMutation, useAdminQuery } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { ActionDialog, REASON_FIELD } from "../ActionDialog";
import { DiffView } from "../DiffView";
import { can, canManage } from "../permissions";
import { Btn, Card, describeError, formatDate, FormField, Pill, SelectInput, StateMessage, Tabs, TextInput, useToast } from "../ui";
import type { AdminPage, SettingsData, SettingValue } from "../types";

// Every business rule lives here as a setting, never hard-coded, as the project brief requires.
// Read: GET /admin/settings   Save one section: PUT /admin/settings/:section { values, reason, ifVersion }
// Kill switch: POST /admin/settings/kill-switch { key, on, reason }
// Every save needs a reason, is versioned, and appears in the history below with a before / after view.
type Field = { key: string; label: string; options?: string[]; help?: string };

const SECTIONS: Record<string, { title: string; fields: Field[] }> = {
  risk: {
    title: "Risk rules",
    fields: [
      { key: "dailyLossMethod", label: "Daily loss is measured on", options: ["balance-based", "equity-based"], help: "Equity-based also counts open profit and loss." },
      { key: "dailyResetTime", label: "Daily reset time" },
      { key: "timezone", label: "Reset timezone", options: ["UTC"] },
      { key: "drawdownType", label: "Maximum drawdown type", options: ["static", "trailing"] },
      { key: "highWaterMark", label: "High-water mark follows", options: ["equity", "balance"] },
      { key: "maxExposurePct", label: "Maximum exposure (% of balance)" },
      { key: "maxOpenPositions", label: "Maximum open positions" },
      { key: "lockOnBreach", label: "Lock account on breach", options: ["yes", "no"] },
    ],
  },
  trading: {
    title: "Trading",
    fields: [
      { key: "takerFeePct", label: "Taker fee (%)" },
      { key: "makerFeePct", label: "Maker fee (%)" },
      { key: "fundingMode", label: "Funding treatment", options: ["mirror Hyperliquid", "fixed"] },
      { key: "spreadBps", label: "Simulated spread (bps)" },
      { key: "slippageBps", label: "Simulated slippage (bps)" },
      { key: "fillModel", label: "Fill price model", options: ["bid/ask plus slippage", "mark price plus slippage"] },
      { key: "staleSeconds", label: "Treat price as stale after (seconds)" },
    ],
  },
  payouts: {
    title: "Payouts",
    fields: [
      { key: "minPayout", label: "Minimum payout ($)" },
      { key: "schedule", label: "Payout schedule", options: ["on demand", "weekly", "monthly"] },
      { key: "profitSplit", label: "Default profit split (%)" },
      { key: "networks", label: "Supported networks" },
      { key: "walletWhitelist", label: "Wallet whitelist", options: ["required", "optional"] },
      { key: "dualApprovalAbove", label: "Second approver needed above ($)", help: "Payouts above this amount wait on the Approvals page." },
      { key: "holdHours", label: "Hold after request (hours)" },
    ],
  },
  compliance: {
    title: "Compliance",
    fields: [
      { key: "kycRequired", label: "KYC required before payout", options: ["yes", "no"] },
      { key: "restrictedCountries", label: "Restricted countries (codes)" },
      { key: "refundDays", label: "Refund window (days)" },
      { key: "refundPolicy", label: "Refund policy (short text)" },
    ],
  },
  plisio: {
    title: "Crypto checkout",
    fields: [
      { key: "coins", label: "Accepted coins" },
      { key: "networks", label: "Accepted networks" },
      { key: "invoiceExpiryMin", label: "Invoice expires after (minutes)" },
    ],
  },
  flags: {
    title: "Feature switches",
    fields: [
      { key: "publicPayoutFeed", label: "Public payout feed", options: ["on", "off"] },
      { key: "affiliateProgram", label: "Affiliate program", options: ["on", "off"] },
      { key: "competitions", label: "Competitions", options: ["on", "off"] },
      { key: "newSignups", label: "New signups", options: ["on", "off"] },
    ],
  },
};

const KILL_SWITCHES: { key: string; label: string; hint: string }[] = [
  { key: "pauseTrading", label: "Pause all trading", hint: "No orders can be placed on any account." },
  { key: "pausePurchases", label: "Pause new purchases", hint: "Checkout is closed. Existing accounts are untouched." },
  { key: "pausePayouts", label: "Pause payouts", hint: "No payout can be approved or marked paid." },
  { key: "maintenanceMode", label: "Maintenance mode", hint: "Traders see a maintenance page." },
];

function SettingsForm({ data, section, editable }: { data: SettingsData; section: string; editable: boolean }) {
  const toast = useToast();
  const save = useAdminMutation();
  const def = SECTIONS[section];
  const current = data.sections[section];
  const [values, setValues] = useState<Record<string, SettingValue>>(current);
  const [asking, setAsking] = useState(false);

  // Start again from the server values when the section or the saved version changes
  useEffect(() => setValues(current), [current, data.version]);

  const changed = Object.fromEntries(Object.entries(values).filter(([k, v]) => String(v) !== String(current[k])));
  const count = Object.keys(changed).length;

  return (
    <Card title={def.title}>
      <div className="grid gap-4 md:grid-cols-2">
        {def.fields.map((f) => {
          const numeric = typeof current[f.key] === "number";
          return (
            <FormField key={f.key} label={f.label} htmlFor={`set-${f.key}`}>
              {f.options ? (
                <SelectInput id={`set-${f.key}`} disabled={!editable} options={f.options} value={String(values[f.key])} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))} />
              ) : (
                <TextInput id={`set-${f.key}`} disabled={!editable} type={numeric ? "number" : "text"} step="any" value={String(values[f.key])} onChange={(e) => setValues((s) => ({ ...s, [f.key]: numeric ? Number(e.target.value) : e.target.value }))} />
              )}
              {f.help && <p className="mt-1.5 text-[12px] text-white/30">{f.help}</p>}
            </FormField>
          );
        })}
      </div>
      {editable ? (
        <div className="mt-5 flex items-center gap-3">
          <Btn tone="gold" disabled={count === 0 || save.isPending} onClick={() => setAsking(true)}>Save changes</Btn>
          <Btn disabled={count === 0} onClick={() => setValues(current)}>Undo</Btn>
          <span className="text-[14px] text-white/40">{count === 0 ? "No changes." : `${count} field${count > 1 ? "s" : ""} changed.`}</span>
        </div>
      ) : (
        <p className="mt-5 text-[14px] text-white/40">You can view these settings but not change them.</p>
      )}

      {asking && (
        <ActionDialog
          title={`Save ${def.title.toLowerCase()}`}
          subtitle="This changes how the platform behaves for everyone."
          fields={[REASON_FIELD]}
          submitLabel="Save settings"
          busy={save.isPending}
          onClose={() => setAsking(false)}
          intro={<DiffView before={Object.fromEntries(Object.keys(changed).map((k) => [k, current[k]]))} after={changed} />}
          onSubmit={(v) =>
            save.mutate(
              { path: `/admin/settings/${section}`, method: "PUT", body: { values: changed, reason: v.reason, ifVersion: data.version } },
              { onSuccess: () => { toast("Settings saved."); setAsking(false); }, onError: (e) => toast(describeError(e), true) },
            )
          }
        />
      )}
    </Card>
  );
}

function PlatformSettings() {
  const toast = useToast();
  const user = useAdminSession((s) => s.user);
  const toggle = useAdminMutation();
  const { data, isPending, error, refetch } = useAdminQuery<SettingsData>("settings", "/admin/settings");
  const [section, setSection] = useState("risk");
  const [switching, setSwitching] = useState<{ key: string; label: string; on: boolean } | null>(null);

  if (isPending) return <StateMessage>Loading settings…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const editable = canManage(user, "settings") && can(user, "settings.edit");
  const mayKill = canManage(user, "settings") && can(user, "settings.kill_switch");

  return (
    <>
      <Card title="Emergency switches">
        <ul>
          {KILL_SWITCHES.map((k) => {
            const on = !!data.killSwitches[k.key];
            return (
              <li key={k.key} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] py-3.5 last:border-0">
                <div>
                  <p className="text-[15px] text-white">{k.label}</p>
                  <p className="text-[13px] text-white/40">{k.hint}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Pill tone={on ? "red" : "green"}>{on ? "ON" : "Off"}</Pill>
                  {mayKill && <Btn tone={on ? "success" : "danger"} onClick={() => setSwitching({ key: k.key, label: k.label, on: !on })}>{on ? "Turn off" : "Turn on"}</Btn>}
                </div>
              </li>
            );
          })}
        </ul>
        {!mayKill && <p className="mt-3 text-[13px] text-white/40">Only people with the kill-switch right can change these.</p>}
      </Card>

      <div>
        <Tabs tabs={Object.values(SECTIONS).map((s) => s.title)} active={SECTIONS[section].title} onChange={(t) => setSection(Object.keys(SECTIONS).find((k) => SECTIONS[k].title === t) ?? "risk")} />
        <SettingsForm key={section} data={data} section={section} editable={editable} />
      </div>

      <Card title="Settings history">
        {data.history.length === 0 ? (
          <StateMessage>No settings were changed yet.</StateMessage>
        ) : (
          <ul className="grid gap-3">
            {data.history.map((h) => (
              <li key={h.id}>
                <details className="border border-white/[0.06] bg-white/[0.02] p-3">
                  <summary className="cursor-pointer text-[15px] text-white">
                    {SECTIONS[h.section]?.title ?? h.section} · version {h.version} · {h.changedBy}
                    <span className="ml-2 text-[13px] text-white/40">{formatDate(h.at)}</span>
                  </summary>
                  <p className="my-3 text-[14px] text-white/60">Reason: {h.reason}</p>
                  <DiffView before={h.before} after={h.after} />
                </details>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {switching && (
        <ActionDialog
          title={`${switching.on ? "Turn on" : "Turn off"}: ${switching.label}`}
          subtitle="Takes effect immediately for every trader."
          fields={[REASON_FIELD]}
          confirmWord="CONFIRM"
          submitLabel={switching.on ? "Turn on" : "Turn off"}
          busy={toggle.isPending}
          onClose={() => setSwitching(null)}
          onSubmit={(v) =>
            toggle.mutate(
              { path: "/admin/settings/kill-switch", body: { key: switching.key, on: switching.on, reason: v.reason } },
              { onSuccess: () => { toast(`${switching.label}: ${switching.on ? "ON" : "off"}.`); setSwitching(null); }, onError: (e) => toast(describeError(e), true) },
            )
          }
        />
      )}
    </>
  );
}

export const page: AdminPage = { key: "settings", label: "Platform Settings", group: "Platform control", component: PlatformSettings };
