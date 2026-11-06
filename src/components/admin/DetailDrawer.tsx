"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAdminMutation, useAdminQuery } from "./adminData";
import { renderCell, type ColumnSpec } from "./ResourceList";
import { DiffView } from "./DiffView";
import { EquityChart } from "./EquityChart";
import { StatusTimeline } from "./StatusTimeline";
import { Btn, describeError, formatDate, Pill, StateMessage, statusTone, Table, Tabs, Textarea, useToast } from "./ui";
import { CANNED_REPLIES } from "./constants";
import type { CheckItem, EquityData, ListResponse } from "./types";

type Row = Record<string, unknown>;

// One tab inside the side panel that opens when a row is clicked
export type DetailTab =
  | { label: string; kind: "fields"; fields?: ColumnSpec[] } // the row's own values
  | { label: string; kind: "list"; resource: string; path: (row: Row) => string; columns: ColumnSpec[] } // a related list
  | { label: string; kind: "equity" } // equity curve with the loss limits (accounts)
  | { label: string; kind: "timeline" } // audit entries about this record
  | { label: string; kind: "notes" } // internal notes
  | { label: string; kind: "checks"; path: (row: Row) => string } // pass / fail checklist
  | { label: string; kind: "diff" } // before / after of an audit entry
  | { label: string; kind: "thread" } // support conversation
  | { label: string; kind: "custom"; render: (row: Row) => ReactNode };

const humanize = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

/* ───────────────────────── Tab bodies ───────────────────────── */

function FieldsTab({ row, fields }: { row: Row; fields?: ColumnSpec[] }) {
  const specs: ColumnSpec[] =
    fields ??
    Object.keys(row)
      .filter((k) => typeof row[k] !== "object" || row[k] === null)
      .map((k) => ({ key: k, label: humanize(k), format: /At$/.test(k) ? ("date" as const) : undefined }));
  return (
    <ul>
      {specs.map((f) => (
        <li key={f.key} className="flex justify-between gap-4 border-b border-white/[0.06] py-3 text-[15px] text-white/50 last:border-0">
          <span>{f.label}</span>
          <b className="text-right font-normal text-white">{renderCell(row[f.key], f.format, row)}</b>
        </li>
      ))}
    </ul>
  );
}

function ListTab({ row, tab }: { row: Row; tab: Extract<DetailTab, { kind: "list" }> }) {
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Row>>(tab.resource, tab.path(row));
  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;
  if (data.items.length === 0) return <StateMessage>Nothing here yet.</StateMessage>;
  return (
    <Table
      heads={tab.columns.map((c) => c.label)}
      rows={data.items.map((r) => tab.columns.map((c) => renderCell(r[c.key], c.format, r)))}
    />
  );
}

function EquityTab({ row }: { row: Row }) {
  const { data, isPending, error, refetch } = useAdminQuery<EquityData>("accounts", `/admin/accounts/${encodeURIComponent(String(row.id))}/equity`);
  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;
  return <EquityChart data={data} />;
}

function TimelineTab({ row }: { row: Row }) {
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Row>>("audit-logs", `/admin/audit-logs?target=${encodeURIComponent(String(row.id))}&pageSize=50`);
  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;
  return (
    <StatusTimeline
      empty="No admin actions on this record yet."
      entries={data.items.map((l) => ({
        id: String(l.id),
        title: String(l.action),
        meta: String(l.actor),
        at: String(l.createdAt),
        tone: l.result === "denied" || l.result === "failed" ? "bad" : "neutral",
      }))}
    />
  );
}

function NotesTab({ row, canWrite }: { row: Row; canWrite: boolean }) {
  const toast = useToast();
  const write = useAdminMutation();
  const [body, setBody] = useState("");
  const target = String(row.id);
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Row>>("notes", `/admin/notes?target=${encodeURIComponent(target)}&pageSize=50`);

  const add = () => {
    if (!body.trim()) return;
    write.mutate(
      { path: "/admin/notes", body: { target, body: body.trim() } },
      { onSuccess: () => { setBody(""); toast("Note saved."); }, onError: (e) => toast(describeError(e), true) },
    );
  };

  return (
    <div className="grid gap-4">
      {canWrite && (
        <div className="grid gap-2">
          <Textarea aria-label="New internal note" placeholder="Internal note (traders never see this)" value={body} onChange={(e) => setBody(e.target.value)} />
          <div><Btn tone="gold" disabled={write.isPending || !body.trim()} onClick={add}>Add note</Btn></div>
        </div>
      )}
      {isPending ? (
        <StateMessage>Loading…</StateMessage>
      ) : error ? (
        <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>
      ) : data.items.length === 0 ? (
        <StateMessage>No notes yet.</StateMessage>
      ) : (
        <ul className="grid gap-3">
          {data.items.map((n) => (
            <li key={String(n.id)} className="border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="whitespace-pre-wrap text-[15px] text-white/80">{String(n.body)}</p>
              <p className="mt-2 text-[12px] text-white/40">{String(n.author)} · {formatDate(String(n.createdAt))}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChecksTab({ row, tab }: { row: Row; tab: Extract<DetailTab, { kind: "checks" }> }) {
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<CheckItem>>("checks", tab.path(row));
  if (isPending) return <StateMessage>Loading…</StateMessage>;
  if (error) return <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>;
  return (
    <ul>
      {data.items.map((c) => (
        <li key={c.label} className="flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
          <div>
            <p className="text-[15px] text-white">{c.label}</p>
            <p className="text-[13px] text-white/40">{c.detail}</p>
          </div>
          <Pill tone={c.ok ? "green" : "red"}>{c.ok ? "Pass" : "Blocked"}</Pill>
        </li>
      ))}
    </ul>
  );
}

function ThreadTab({ row, canWrite }: { row: Row; canWrite: boolean }) {
  const toast = useToast();
  const write = useAdminMutation();
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const id = String(row.id);
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Row>>("ticket-messages", `/admin/ticket-messages?ticketId=${encodeURIComponent(id)}&pageSize=100`);

  const send = () => {
    if (!body.trim()) return;
    write.mutate(
      { path: `/admin/tickets/${encodeURIComponent(id)}/reply`, body: { body: body.trim(), internal } },
      { onSuccess: () => { setBody(""); toast(internal ? "Internal note added." : "Reply sent."); }, onError: (e) => toast(describeError(e), true) },
    );
  };

  return (
    <div className="grid gap-4">
      {isPending ? (
        <StateMessage>Loading…</StateMessage>
      ) : error ? (
        <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>
      ) : (
        <ul className="grid gap-3">
          {data.items.map((m) => (
            <li
              key={String(m.id)}
              className={`border p-3 ${m.internal ? "border-amber-500/30 bg-amber-500/15" : m.role === "staff" ? "border-gold-accent/40 bg-gold/10" : "border-white/[0.06] bg-white/[0.02]"}`}
            >
              <p className="whitespace-pre-wrap text-[15px] text-white/80">{String(m.body)}</p>
              <p className="mt-2 text-[12px] text-white/40">
                {String(m.author)}{m.internal ? " · internal note" : ""} · {formatDate(String(m.createdAt))}
              </p>
            </li>
          ))}
        </ul>
      )}
      {canWrite && (
        <div className="grid gap-2">
          <select
            aria-label="Canned reply"
            className="h-[40px] w-full border-[0.7px] border-white/[0.13] bg-white/[0.06] px-3 text-[14px] text-white outline-none"
            value=""
            onChange={(e) => e.target.value && setBody(e.target.value)}
          >
            <option value="">Insert a canned reply…</option>
            {CANNED_REPLIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <Textarea aria-label="Reply" placeholder="Write a reply" value={body} onChange={(e) => setBody(e.target.value)} />
          <label className="flex items-center gap-2 text-[14px] text-white/60">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note (the trader will not see it)
          </label>
          <div><Btn tone="gold" disabled={write.isPending || !body.trim()} onClick={send}>{internal ? "Add note" : "Send reply"}</Btn></div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Drawer ───────────────────────── */

// Side panel with the full story of one record. Opens when a row is clicked.
export function DetailDrawer({
  title,
  subtitle,
  row,
  tabs,
  canWrite,
  onClose,
}: {
  title: string;
  subtitle?: ReactNode;
  row: Row;
  tabs: DetailTab[];
  canWrite: boolean;
  onClose: () => void;
}) {
  const [active, setActive] = useState(tabs[0]?.label ?? "");
  const tab = tabs.find((t) => t.label === active) ?? tabs[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const body = (() => {
    if (!tab) return null;
    switch (tab.kind) {
      case "fields": return <FieldsTab row={row} fields={tab.fields} />;
      case "list": return <ListTab row={row} tab={tab} />;
      case "equity": return <EquityTab row={row} />;
      case "timeline": return <TimelineTab row={row} />;
      case "notes": return <NotesTab row={row} canWrite={canWrite} />;
      case "checks": return <ChecksTab row={row} tab={tab} />;
      case "diff": return <DiffView before={row.before as Row | undefined} after={row.after as Row | undefined} />;
      case "thread": return <ThreadTab row={row} canWrite={canWrite} />;
      case "custom": return tab.render(row);
    }
  })();

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-modal="true" aria-label={title} className="h-full w-full max-w-[720px] overflow-y-auto border-l border-white/[0.13] bg-surface p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] text-white">{title}</h2>
            {subtitle && <div className="mt-1 text-[14px] text-white/40">{subtitle}</div>}
          </div>
          <Btn onClick={onClose}>Close</Btn>
        </div>
        {tabs.length > 1 && <Tabs tabs={tabs.map((t) => t.label)} active={tab?.label ?? ""} onChange={setActive} />}
        {body}
      </aside>
    </div>
  );
}

// Small helper so pages can show a status pill inside a drawer subtitle
export const statusPill = (status: string) => <Pill tone={statusTone(status)}>{status}</Pill>;
