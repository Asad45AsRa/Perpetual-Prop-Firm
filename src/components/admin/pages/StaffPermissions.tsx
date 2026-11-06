"use client";

import { useState } from "react";
import { useAdminMutation, useAdminQuery } from "../adminData";
import { useAdminSession } from "../Adminauth";
import { ActionDialog, REASON_FIELD } from "../ActionDialog";
import { LEVELS, RIGHTS, RIGHT_KEYS, type AccessLevel } from "../permissions";
import { Btn, Card, describeError, FormField, Modal, Pill, SelectInput, StateMessage, statusTone, Table, TextInput, timeAgo, useToast } from "../ui";
import type { AdminPage, ListResponse } from "../types";
import { GROUPS, PAGES } from "./index";

// Who can sign in and exactly what each person may open or do.
// Only the super admin sees this page. The super admin is created automatically on first start,
// can never be edited, suspended or deleted, and decides every other person's access here.
//   List: GET /admin/staff   Create: POST /admin/staff   Change access: PATCH /admin/staff/:id
//   Delete: DELETE /admin/staff/:id   Actions: POST /admin/staff/:id/<suspend|restore|force-logout|reset-2fa|reset-password>
// A deleted or suspended person is refused on their very next request, so they are signed out at once.
type Staff = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "moderator";
  status: string;
  grants: Record<string, AccessLevel>;
  rights: string[];
  protected?: boolean;
  twoFactor: string;
  lastLoginAt: string;
  createdBy: string;
  version: number;
};

// Read lazily: pages/index.ts imports this file, so PAGES is only safe to read at render time
const openable = () => PAGES.filter((p) => !p.superOnly);

// Starting points for a new person. The super admin can change every box afterwards.
function template(role: "admin" | "moderator"): { grants: Record<string, AccessLevel>; rights: string[] } {
  if (role === "admin") {
    return { grants: Object.fromEntries(openable().map((p) => [p.key, "manage" as AccessLevel])), rights: RIGHT_KEYS.filter((r) => r !== "settings.kill_switch") };
  }
  return {
    grants: { overview: "view", traders: "view", accounts: "view", activity: "view", risk: "manage", kyc: "manage", tickets: "manage", announcements: "view" },
    rights: ["risk.review", "tickets.reply", "kyc.review", "traders.suspend"],
  };
}

const generatePassword = () => `Pe-${Math.random().toString(36).slice(2, 8)}${Math.floor(10 + Math.random() * 90)}!`;

/* ───────────────────────── Access editor (sections and special rights) ───────────────────────── */

function AccessEditor({ grants, rights, onGrants, onRights }: { grants: Record<string, AccessLevel>; rights: string[]; onGrants: (g: Record<string, AccessLevel>) => void; onRights: (r: string[]) => void }) {
  const set = (key: string, level: AccessLevel) => onGrants({ ...grants, [key]: level });
  const setAll = (level: AccessLevel) => onGrants(Object.fromEntries(openable().map((p) => [p.key, level])));

  return (
    <div className="grid gap-5">
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[14px] text-white">Sections</p>
          <div className="flex gap-2">
            <Btn onClick={() => setAll("none")}>None</Btn>
            <Btn onClick={() => setAll("view")}>View all</Btn>
            <Btn onClick={() => setAll("manage")}>Manage all</Btn>
          </div>
        </div>
        <p className="mb-3 text-[12px] text-white/40">View = can open and read. Manage = can also create, edit and run the normal actions.</p>
        {GROUPS.map((group) => {
          const pages = openable().filter((p) => p.group === group);
          if (pages.length === 0) return null;
          return (
            <div key={group} className="mb-3">
              <p className="mb-1 text-[12px] text-white/30">{group}</p>
              {pages.map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-1.5">
                  <span className="text-[14px] text-white/80">{p.label}</span>
                  <div className="flex">
                    {LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        aria-pressed={(grants[p.key] ?? "none") === level}
                        onClick={() => set(p.key, level)}
                        className={`border-[0.7px] px-3 py-1 text-[13px] capitalize ${(grants[p.key] ?? "none") === level ? "border-gold-accent bg-gold/15 text-gold-light" : "border-white/[0.13] text-white/50"}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-1 text-[14px] text-white">Special rights</p>
        <p className="mb-3 text-[12px] text-white/40">Sensitive actions are separate. Even with Manage on a section, a person cannot do these without the matching right.</p>
        {RIGHT_KEYS.map((key) => (
          <label key={key} className="flex items-start gap-3 border-b border-white/[0.06] py-2">
            <input type="checkbox" className="mt-1" checked={rights.includes(key)} onChange={() => onRights(rights.includes(key) ? rights.filter((r) => r !== key) : [...rights, key])} />
            <span>
              <span className="block text-[14px] text-white/80">{RIGHTS[key].label}</span>
              <span className="block text-[12px] text-white/40">{RIGHTS[key].hint}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Create / edit modal ───────────────────────── */

function StaffForm({ person, onClose }: { person?: Staff; onClose: () => void }) {
  const toast = useToast();
  const write = useAdminMutation();
  const start = person ? { grants: person.grants, rights: person.rights } : template("moderator");
  const [name, setName] = useState(person?.name ?? "");
  const [email, setEmail] = useState(person?.email ?? "");
  const [role, setRole] = useState<"admin" | "moderator">(person && person.role !== "super_admin" ? person.role : "moderator");
  const [password, setPassword] = useState(person ? "" : generatePassword());
  const [grants, setGrants] = useState(start.grants);
  const [rights, setRights] = useState(start.rights);
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a name and a valid email.");
    if (!person && password.length < 8) return setError("The temporary password needs at least 8 characters.");
    setError("");
    const done = { onSuccess: () => { toast(person ? "Access updated." : "Staff member created."); onClose(); }, onError: (e: Error) => setError(describeError(e)) };
    if (person) write.mutate({ path: `/admin/staff/${person.id}`, method: "PATCH", body: { name, role, grants, rights, ifVersion: person.version } }, done);
    else write.mutate({ path: "/admin/staff", body: { name, email, role, password, grants, rights } }, done);
  };

  return (
    <Modal wide title={person ? `Access for ${person.name}` : "Add a staff member"} subtitle="Choose what this person can open and do. You can change it later at any time." onClose={onClose}>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Name" htmlFor="st-name"><TextInput id="st-name" value={name} onChange={(e) => setName(e.target.value)} /></FormField>
          <FormField label="Email (used to sign in)" htmlFor="st-email"><TextInput id="st-email" type="email" disabled={!!person} value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
          <FormField label="Role" htmlFor="st-role">
            <SelectInput
              id="st-role"
              options={["admin", "moderator"]}
              value={role}
              onChange={(e) => {
                const next = e.target.value as "admin" | "moderator";
                setRole(next);
                // A new role starts from that role's template; the boxes can still be changed
                const t = template(next);
                setGrants(t.grants);
                setRights(t.rights);
              }}
            />
          </FormField>
          {!person && (
            <FormField label="Temporary password" htmlFor="st-pass">
              <div className="flex gap-2">
                <TextInput id="st-pass" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Btn onClick={() => setPassword(generatePassword())}>New</Btn>
              </div>
            </FormField>
          )}
        </div>
        <AccessEditor grants={grants} rights={rights} onGrants={setGrants} onRights={setRights} />
        {error && <p role="alert" className="text-[14px] text-red-400">{error}</p>}
        <Btn tone="gold" disabled={write.isPending} onClick={submit}>{write.isPending ? "Saving…" : person ? "Save access" : "Create staff member"}</Btn>
      </div>
    </Modal>
  );
}

/* ───────────────────────── Page ───────────────────────── */

type Dialog = { kind: "form"; person?: Staff } | { kind: "suspend" | "delete" | "password"; person: Staff } | null;

function StaffPermissions() {
  const toast = useToast();
  const me = useAdminSession((s) => s.user);
  const write = useAdminMutation();
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Staff>>("staff", "/admin/staff?pageSize=100");
  const [dialog, setDialog] = useState<Dialog>(null);

  const run = (path: string, success: string, method: "POST" | "DELETE" = "POST", body?: unknown, done?: () => void) =>
    write.mutate({ path, method, body }, { onSuccess: () => { toast(success); done?.(); }, onError: (e) => toast(describeError(e), true) });

  if (isPending) return <StateMessage>Loading staff…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;

  const sections = (p: Staff) => (p.role === "super_admin" ? "Everything" : `${Object.values(p.grants).filter((g) => g !== "none").length} of ${openable().length} sections`);

  return (
    <Card
      title="Staff and access"
      action={<Btn tone="gold" onClick={() => setDialog({ kind: "form" })}>Add staff member</Btn>}
    >
      <p className="mb-4 max-w-[760px] text-[14px] leading-relaxed text-white/50">
        The super admin is created automatically and is protected: nobody can change, suspend or delete it. You decide what every other person can open and do.
        A removed or suspended person is signed out on their next click and cannot sign in again.
      </p>
      <Table
        heads={["Name", "Email", "Role", "Access", "Status", "2FA", "Last sign-in", "Actions"]}
        rows={data.items.map((p) => [
          p.name,
          p.email,
          <Pill key="r" tone={p.role === "moderator" ? "gray" : "gold"}>{p.role === "super_admin" ? "Super admin" : p.role === "admin" ? "Admin" : "Moderator"}</Pill>,
          sections(p),
          <Pill key="s" tone={statusTone(p.status)}>{p.status}</Pill>,
          p.twoFactor,
          p.lastLoginAt ? timeAgo(p.lastLoginAt) : "Never",
          p.protected ? (
            <span key="a" className="text-[13px] text-white/40">Protected. Cannot be changed or deleted.</span>
          ) : (
            <div key="a" className="flex flex-wrap gap-2">
              <Btn onClick={() => setDialog({ kind: "form", person: p })}>Edit access</Btn>
              {p.status === "active" ? <Btn onClick={() => setDialog({ kind: "suspend", person: p })}>Suspend</Btn> : <Btn tone="success" onClick={() => run(`/admin/staff/${p.id}/restore`, "Staff member restored.")}>Restore</Btn>}
              <Btn onClick={() => run(`/admin/staff/${p.id}/force-logout`, "Signed out everywhere.")}>Sign out</Btn>
              <Btn onClick={() => run(`/admin/staff/${p.id}/reset-2fa`, "2FA reset. They must set it up again.")}>Reset 2FA</Btn>
              <Btn onClick={() => setDialog({ kind: "password", person: p })}>New password</Btn>
              {p.id !== me?.id && <Btn tone="danger" onClick={() => setDialog({ kind: "delete", person: p })}>Delete</Btn>}
            </div>
          ),
        ])}
      />

      {dialog?.kind === "form" && <StaffForm person={dialog.person} onClose={() => setDialog(null)} />}

      {dialog?.kind === "suspend" && (
        <ActionDialog
          title={`Suspend ${dialog.person.name}`}
          subtitle="They are signed out now and cannot sign in until you restore them."
          fields={[REASON_FIELD]}
          submitLabel="Suspend"
          busy={write.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(v) => run(`/admin/staff/${dialog.person.id}/suspend`, "Staff member suspended.", "POST", v, () => setDialog(null))}
        />
      )}

      {dialog?.kind === "password" && (
        <ActionDialog
          title={`New password for ${dialog.person.name}`}
          subtitle="All their sessions end. Share the password with them safely."
          fields={[{ key: "password", label: "New temporary password", type: "text", required: true, default: generatePassword() }]}
          submitLabel="Set password"
          busy={write.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(v) => run(`/admin/staff/${dialog.person.id}/reset-password`, "Password changed.", "POST", v, () => setDialog(null))}
        />
      )}

      {dialog?.kind === "delete" && (
        <ActionDialog
          title={`Delete ${dialog.person.name}`}
          subtitle={`${dialog.person.email} will be signed out immediately and can never sign in again. Their past actions stay in the audit log.`}
          fields={[]}
          confirmWord="DELETE"
          submitLabel="Delete permanently"
          busy={write.isPending}
          onClose={() => setDialog(null)}
          onSubmit={() => run(`/admin/staff/${dialog.person.id}`, "Staff member deleted.", "DELETE", undefined, () => setDialog(null))}
        />
      )}
    </Card>
  );
}

export const page: AdminPage = { key: "staff", label: "Staff & Permissions", group: "Platform control", superOnly: true, component: StaffPermissions };
