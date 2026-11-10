"use client";

import { useState } from "react";
import { useAdminMutation, useAdminNavigate, useAdminQuery } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { ActionDialog, REASON_FIELD } from "../ActionDialog";
import { can, canManage, canView } from "../permissions";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import { Btn, Card, describeError, Pill, useToast } from "../ui";
import type { AdminPage, SettingsData } from "../types";

// Trading competitions. Not part of the first launch scope, so the super admin only grants it when needed.
// List: GET /admin/competitions   Create: POST /admin/competitions
const config: PageConfig = {
  pageKey: "competitions",
  resource: "competitions",
  columns: [
    { key: "name", label: "Competition" },
    { key: "participants", label: "Participants", format: "number" },
    { key: "prize", label: "Prize" },
    { key: "scoring", label: "Scoring" },
    { key: "endsAt", label: "Ends", format: "date" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { label: "New Competition", kind: "create" },
  fields: [
    { key: "name", label: "Name", required: true },
    { key: "prize", label: "Prize", required: true },
    { key: "scoring", label: "Scoring rule", type: "select", options: ["Highest return %", "Highest profit $", "Best risk-adjusted return"] },
    { key: "endsAt", label: "Ends on", type: "date", required: true },
    { key: "status", label: "Status", type: "select", options: ["draft", "live", "closed"] },
  ],
  filters: [{ key: "status", label: "Status" }],
  detail: [{ label: "Overview", kind: "fields" }, { label: "History", kind: "timeline" }],
  exportName: "competitions",
  emptyText: "No competitions yet.",
};

// Shows whether "Competitions" is locked or open in the trader sidebar, and lets a person with the
// settings right flip it. It reads and writes the same "Competitions" feature switch as Platform Settings
// (section "flags"), so there is only one source of truth.
// Read: GET /admin/settings   Change: PUT /admin/settings/flags { values: { competitions }, reason, ifVersion }
function SidebarLock() {
  const toast = useToast();
  const go = useAdminNavigate();
  const user = useAdminSession((s) => s.user);
  const save = useAdminMutation();
  const [asking, setAsking] = useState(false);

  // Someone without access to Platform Settings cannot read the switch, so the card tells them where it lives
  const allowed = canView(user, "settings");
  const { data } = useAdminQuery<SettingsData>("settings", "/admin/settings", { enabled: allowed });
  const open = data?.sections.flags?.competitions === "on";
  const mayChange = canManage(user, "settings") && can(user, "settings.edit");

  return (
    <Card title="Trader sidebar">
      {!allowed ? (
        <p className="text-[14px] text-white/50">Whether Competitions is locked for traders is controlled in Platform Settings. Ask someone with access to change it.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[15px] text-white">
              Competitions is <Pill tone={open ? "green" : "red"}>{data ? (open ? "open" : "locked") : "loading"}</Pill> for traders
            </p>
            <p className="mt-1 text-[13px] text-white/40">
              {open ? "Traders can open the Competitions page from their sidebar." : "Traders see a lock icon next to Competitions and cannot open it."}
            </p>
          </div>
          <div className="flex gap-2">
            {mayChange && data && <Btn tone={open ? "danger" : "success"} onClick={() => setAsking(true)}>{open ? "Lock for traders" : "Open for traders"}</Btn>}
            <Btn onClick={() => go("settings")}>Platform Settings</Btn>
          </div>
        </div>
      )}

      {asking && data && (
        <ActionDialog
          title={open ? "Lock Competitions" : "Open Competitions"}
          subtitle="Takes effect for every trader straight away."
          fields={[REASON_FIELD]}
          submitLabel={open ? "Lock" : "Open"}
          busy={save.isPending}
          onClose={() => setAsking(false)}
          onSubmit={(v) =>
            save.mutate(
              { path: "/admin/settings/flags", method: "PUT", body: { values: { competitions: open ? "off" : "on" }, reason: v.reason, ifVersion: data.version } },
              { onSuccess: () => { toast(open ? "Competitions locked." : "Competitions opened."); setAsking(false); }, onError: (e) => toast(describeError(e), true) },
            )
          }
        />
      )}
    </Card>
  );
}

function Competitions() {
  return (
    <>
      <SidebarLock />
      <ResourcePage config={config} />
    </>
  );
}

export const page: AdminPage = { key: "competitions", label: "Competitions", group: "Communication", component: Competitions };
