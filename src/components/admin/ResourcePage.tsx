"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useAdminMutation, useAdminNavigate, useAdminQuery } from "./adminData";
import { useAdminSession } from "./Adminauth";
import { can } from "./permissions";
import { renderCell, type ColumnSpec } from "./ResourceList";
import {
  Btn,
  Card,
  downloadCsv,
  FormField,
  Modal,
  SelectInput,
  StateMessage,
  Table,
  TextInput,
  useToast,
} from "./ui";
import type { ListResponse } from "./types";

type Row = Record<string, unknown>;

/* ───────────────────────── Config types ───────────────────────── */

// One input in the create / edit form
export type FieldSpec = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "select";
  options?: string[]; // required for type "select"
  required?: boolean;
  placeholder?: string;
  default?: string | number;
};

// A button shown on every row: POST /admin/<resource>/:id/<action>
export type RowAction = {
  label: string;
  action: string;
  show?: (row: Row) => boolean;
  permission?: string; // key from permissions.ts, hidden when the role does not have it
  tone?: "default" | "gold" | "success" | "danger";
  success: string; // toast text
  confirm?: string; // optional confirmation question
};

// What the main button in the toolbar does
export type PrimarySpec = { label: string; permission?: string } & (
  | { kind: "create" }
  | { kind: "export" }
  | { kind: "navigate"; to: string } // sidebar page label
  | { kind: "info"; text: string } // opens a small notice dialog
);

export type PageConfig = {
  resource: string; // GET /admin/<resource> -> { items: [...] }
  columns: ColumnSpec[];
  primary: PrimarySpec;
  fields?: FieldSpec[]; // enables the create / edit form
  allowCreate?: boolean; // default true when `fields` is set
  createPermission?: string; // default "records.manage"
  allowDelete?: boolean; // default true when `fields` is set
  actions?: RowAction[];
  filterKey?: string; // column used by the filter dropdown, default "status"
  exportName?: string;
  emptyText?: string;
};

/* ───────────────────────── Component ───────────────────────── */

type Dialog =
  | { kind: "create" }
  | { kind: "edit"; row: Row }
  | { kind: "info"; title: string; text: string }
  | null;

export function ResourcePage({ config }: { config: PageConfig }) {
  const { resource, columns, fields, actions = [], primary } = config;
  const role = useAdminSession((s) => s.user?.role);
  const go = useAdminNavigate();
  const toast = useToast();
  const mutation = useAdminMutation();
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Row>>(resource, `/admin/${resource}`);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [dialog, setDialog] = useState<Dialog>(null);

  const filterKey = config.filterKey ?? "status";
  const canManage = can(role, "records.manage");
  const canCreate = !!fields && config.allowCreate !== false && can(role, config.createPermission ?? "records.manage");
  const canEditDelete = !!fields && canManage;
  const canDelete = canEditDelete && config.allowDelete !== false;

  const rows = useMemo(() => data?.items ?? [], [data]);
  const filterOptions = useMemo(
    () => [...new Set(rows.map((r) => r[filterKey]).filter((v): v is string => typeof v === "string" && v !== ""))],
    [rows, filterKey],
  );
  const visible = rows.filter(
    (r) =>
      (filter === "All" || r[filterKey] === filter) &&
      (!q || Object.values(r).some((v) => String(v).toLowerCase().includes(q.toLowerCase()))),
  );

  const run = (path: string, method: "POST" | "PATCH" | "DELETE", success: string, body?: unknown, onDone?: () => void) =>
    mutation.mutate(
      { path, method, body },
      {
        onSuccess: () => {
          toast(success);
          onDone?.();
        },
        onError: (err) => toast(err.message, true),
      },
    );

  const exportCsv = () =>
    downloadCsv(`${config.exportName ?? resource}.csv`, rows)
      ? toast("CSV downloaded.")
      : toast("No records to export.", true);

  const onPrimary = () => {
    if (primary.kind === "create") setDialog({ kind: "create" });
    else if (primary.kind === "export") exportCsv();
    else if (primary.kind === "navigate") go(primary.to);
    else setDialog({ kind: "info", title: primary.label, text: primary.text });
  };

  const showPrimary =
    (primary.kind !== "create" || canCreate) && (!primary.permission || can(role, primary.permission));

  const actionCell = (row: Row) => {
    const id = encodeURIComponent(String(row.id));
    const buttons = actions
      .filter((a) => (!a.show || a.show(row)) && (!a.permission || can(role, a.permission)))
      .map((a) => (
        <Btn
          key={a.action}
          tone={a.tone}
          disabled={mutation.isPending}
          onClick={() => {
            if (a.confirm && !window.confirm(a.confirm)) return;
            run(`/admin/${resource}/${id}/${a.action}`, "POST", a.success);
          }}
        >
          {a.label}
        </Btn>
      ));
    if (canEditDelete) buttons.push(<Btn key="edit" onClick={() => setDialog({ kind: "edit", row })}>Edit</Btn>);
    if (canDelete) {
      buttons.push(
        <Btn
          key="delete"
          tone="danger"
          disabled={mutation.isPending}
          onClick={() => {
            if (window.confirm(`Delete ${String(row.id)}?`)) run(`/admin/${resource}/${id}`, "DELETE", "Deleted.");
          }}
        >
          Delete
        </Btn>,
      );
    }
    return buttons.length ? <div className="flex flex-wrap gap-2">{buttons}</div> : <span className="text-white/25">-</span>;
  };

  const hasRowButtons = actions.length > 0 || canEditDelete;

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TextInput
            aria-label="Search records"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="!w-[240px]"
          />
          {filterOptions.length > 0 && (
            <SelectInput
              aria-label="Filter by status"
              options={["All", ...filterOptions]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="!w-[170px]"
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={exportCsv}>Export CSV</Btn>
          {showPrimary && <Btn tone="gold" onClick={onPrimary}>{primary.label}</Btn>}
        </div>
      </div>

      {isPending ? (
        <StateMessage>Loading…</StateMessage>
      ) : error ? (
        <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>
      ) : rows.length === 0 ? (
        <StateMessage>{config.emptyText ?? "Nothing here yet."}</StateMessage>
      ) : visible.length === 0 ? (
        <StateMessage>No records match.</StateMessage>
      ) : (
        <Table
          heads={[...columns.map((c) => c.label), ...(hasRowButtons ? ["Actions"] : [])]}
          rows={visible.map((row) => [
            ...columns.map((c) => renderCell(row[c.key], c.format)),
            ...(hasRowButtons ? [actionCell(row)] : []),
          ])}
        />
      )}

      {dialog?.kind === "info" && (
        <Modal title={dialog.title} onClose={() => setDialog(null)}>
          <p className="text-[15px] leading-relaxed text-white/60">{dialog.text}</p>
        </Modal>
      )}

      {fields && (dialog?.kind === "create" || dialog?.kind === "edit") && (
        <RecordForm
          title={dialog.kind === "create" ? primary.label : `Edit ${String(dialog.row.id)}`}
          fields={fields}
          initial={dialog.kind === "edit" ? dialog.row : undefined}
          busy={mutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(values) =>
            dialog.kind === "create"
              ? run(`/admin/${resource}`, "POST", "Created.", values, () => setDialog(null))
              : run(`/admin/${resource}/${encodeURIComponent(String(dialog.row.id))}`, "PATCH", "Saved.", values, () => setDialog(null))
          }
        />
      )}
    </Card>
  );
}

/* ───────────────────────── Create / edit form ───────────────────────── */

function initialValue(f: FieldSpec, row?: Row): string {
  const raw = row ? row[f.key] : f.default;
  if (raw === undefined || raw === null) return f.type === "select" ? (f.options?.[0] ?? "") : "";
  // A date field shows only the yyyy-mm-dd part of the ISO string
  return f.type === "date" ? String(raw).slice(0, 10) : String(raw);
}

function RecordForm({
  title,
  fields,
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: FieldSpec[];
  initial?: Row;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: Row) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, initialValue(f, initial)])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.key].trim()) found[f.key] = `${f.label} is required.`;
      else if (f.type === "number" && values[f.key] !== "" && Number.isNaN(Number(values[f.key]))) found[f.key] = "Enter a number.";
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Convert the form strings back into the types the API expects
    const body: Row = {};
    fields.forEach((f) => {
      const v = values[f.key];
      if (f.type === "number") body[f.key] = v === "" ? 0 : Number(v);
      else if (f.type === "date") body[f.key] = v ? new Date(v).toISOString() : "";
      else body[f.key] = v.trim();
    });
    onSubmit(body);
  };

  return (
    <Modal title={title} subtitle={initial ? undefined : "Fill in the details below."} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        {fields.map((f) => {
          const id = `field-${f.key}`;
          const set = (v: string) => setValues((s) => ({ ...s, [f.key]: v }));
          return (
            <FormField key={f.key} label={f.label} htmlFor={id} error={errors[f.key]}>
              {f.type === "select" ? (
                <SelectInput id={id} options={f.options ?? []} value={values[f.key]} onChange={(e) => set(e.target.value)} />
              ) : (
                <TextInput
                  id={id}
                  type={f.type === "number" ? "number" : f.type ?? "text"}
                  step={f.type === "number" ? "any" : undefined}
                  placeholder={f.placeholder}
                  value={values[f.key]}
                  onChange={(e) => set(e.target.value)}
                />
              )}
            </FormField>
          );
        })}
        <Btn type="submit" tone="gold" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Create"}</Btn>
      </form>
    </Modal>
  );
}
