"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { adminApi } from "./adminApi";
import { useAdminMutation, useAdminNavigate, useAdminNavParams, useAdminQuery } from "./adminData";
import { useAdminSession } from "./Adminauth";
import { can, canManage } from "./permissions";
import { renderCell, type ColumnSpec } from "./ResourceList";
import { ActionDialog, REASON_FIELD, type FieldSpec } from "./ActionDialog";
import { DetailDrawer, statusPill, type DetailTab } from "./DetailDrawer";
import { Btn, Card, describeError, downloadCsv, Modal, SelectInput, StateMessage, Table, TextInput, useToast } from "./ui";
import type { ListResponse } from "./types";

export type Row = Record<string, unknown>;
export type { FieldSpec };

/* ───────────────────────── Config types ───────────────────────── */

// A button shown on every row: POST /admin/<resource>/:id/<action>
export type RowAction = {
  label: string;
  action: string;
  show?: (row: Row) => boolean;
  permission?: string; // special right from permissions.ts, hidden when the person does not have it
  tone?: "default" | "gold" | "success" | "danger";
  success: string; // toast text
  confirm?: string; // optional confirmation question (for actions without a dialog)
  reason?: boolean; // ask for a reason; it is sent in the body and written to the audit log
  inputs?: FieldSpec[]; // extra inputs, e.g. a transaction hash
};

// A button shown when rows are ticked: POST /admin/<resource>/bulk/<action> { ids, ...inputs }
export type BulkAction = {
  label: string;
  action: string;
  permission?: string;
  success: string;
  reason?: boolean;
  inputs?: FieldSpec[];
};

// What the main button in the toolbar does
export type PrimarySpec = { label: string; permission?: string } & (
  | { kind: "create" }
  | { kind: "export" }
  | { kind: "navigate"; to: string } // sidebar page label
  | { kind: "info"; text: string } // opens a small notice dialog
  | { kind: "action"; path: string; success: string; confirm?: string; reason?: boolean; inputs?: FieldSpec[] } // POST to any admin path
);

export type PageConfig = {
  pageKey: string; // the sidebar page this list belongs to (decides view / manage access)
  resource: string; // GET /admin/<resource> -> { items: [...], total }
  columns: ColumnSpec[];
  primary: PrimarySpec;
  fields?: FieldSpec[]; // enables the create / edit form
  readOnly?: boolean; // no create, edit or delete at all (money records, audit trail)
  allowCreate?: boolean; // default true when `fields` is set
  allowEdit?: boolean; // default true when `fields` is set
  allowDelete?: boolean; // default true when `fields` is set
  canEditRow?: (row: Row) => boolean; // per-row switch for edit and delete
  actions?: RowAction[];
  bulkActions?: BulkAction[];
  filters?: { key: string; label: string }[]; // dropdown filters; their values come from the server
  dateKey?: string; // column used by the date range filter
  views?: { label: string; filters: Record<string, string> }[]; // ready-made quick views
  defaultSort?: { key: string; order: "asc" | "desc" };
  extraQuery?: Record<string, string>; // fixed query values sent with every request
  detail?: DetailTab[]; // side panel tabs; clicking the first column opens it
  detailTitle?: (row: Row) => string;
  toolbar?: ReactNode; // extra buttons next to the main button
  exportPermission?: string; // right needed to download the list
  exportName?: string;
  emptyText?: string;
};

type Sort = { key: string; order: "asc" | "desc" };
type SavedView = { name: string; q: string; filters: Record<string, string>; sort: Sort | null };

type Dialog =
  | { kind: "create" }
  | { kind: "edit"; row: Row }
  | { kind: "info"; title: string; text: string }
  | { kind: "action"; action: RowAction; row: Row }
  | { kind: "bulk"; action: BulkAction }
  | { kind: "primary"; spec: Extract<PrimarySpec, { kind: "action" }> }
  | null;

const PAGE_SIZES = ["10", "25", "50", "100"];
const ANY = "Any"; // the "no filter" choice of a dropdown, so a real filter value such as a plan called All stays selectable

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
};

/* ───────────────────────── Component ───────────────────────── */

export function ResourcePage({ config }: { config: PageConfig }) {
  const { resource, pageKey, columns, fields, actions = [], bulkActions = [], filters = [], primary } = config;
  const user = useAdminSession((s) => s.user);
  const go = useAdminNavigate();
  const navParams = useAdminNavParams();
  const toast = useToast();
  const mutation = useAdminMutation();

  const [q, setQ] = useState(navParams?.q ?? "");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState<Sort | null>(config.defaultSort ?? null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<Dialog>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerSnapshot, setDrawerSnapshot] = useState<Row | null>(null);

  // Column choices and saved views live in the browser, per list
  const colsKey = `admin-cols:${resource}`;
  const viewsKey = `admin-views:${resource}`;
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(
    () => new Set(readJson<string[] | null>(colsKey, null) ?? columns.filter((c) => c.hidden).map((c) => c.key)),
  );
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => readJson<SavedView[]>(viewsKey, []));
  const [activeView, setActiveView] = useState("");

  // Wait for a short pause in typing before asking the server
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  /* ───── permissions ───── */
  const manage = canManage(user, pageKey);
  const canCreate = !!fields && !config.readOnly && config.allowCreate !== false && manage;
  const canEdit = !!fields && !config.readOnly && config.allowEdit !== false && manage;
  const canDelete = canEdit && config.allowDelete !== false;
  const canExport = !config.exportPermission || can(user, config.exportPermission);

  /* ───── request ───── */
  const filterQs = useMemo(() => {
    const p = new URLSearchParams();
    if (debouncedQ) p.set("q", debouncedQ);
    if (sort) {
      p.set("sort", sort.key);
      p.set("order", sort.order);
    }
    Object.entries(filterValues).forEach(([k, v]) => v && v !== ANY && p.set(k, v));
    Object.entries(config.extraQuery ?? {}).forEach(([k, v]) => p.set(k, v));
    if (config.dateKey) {
      p.set("dateKey", config.dateKey);
      if (from) p.set("from", from);
      if (to) p.set("to", to);
    }
    return p.toString();
  }, [debouncedQ, sort, filterValues, config.extraQuery, config.dateKey, from, to]);

  const pagingQs = `page=${page}&pageSize=${pageSize}${filters.length ? `&facet=${filters.map((f) => f.key).join(",")}` : ""}`;
  const { data, isPending, isFetching, error, refetch } = useAdminQuery<ListResponse<Row>>(
    resource,
    `/admin/${resource}?${pagingQs}&${filterQs}`,
    { keepPrevious: true },
  );

  const rows = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const shownColumns = columns.filter((c) => !hiddenCols.has(c.key));
  const hasFilters = !!debouncedQ || Object.values(filterValues).some((v) => v && v !== ANY) || !!from || !!to;

  /* ───── actions ───── */
  const run = (path: string, method: "POST" | "PATCH" | "DELETE", success: string, body?: unknown, onDone?: () => void) =>
    mutation.mutate(
      { path, method, body },
      {
        onSuccess: () => {
          toast(success);
          onDone?.();
        },
        onError: (err) => toast(describeError(err), true),
      },
    );

  const exportCsv = async () => {
    try {
      const res = await adminApi<ListResponse<Row>>(`/admin/${resource}/export?${filterQs}`);
      toast(downloadCsv(`${config.exportName ?? resource}.csv`, res.items) ? "CSV downloaded." : "No records to export.", !res.items.length);
    } catch (err) {
      toast(describeError(err), true);
    }
  };

  const withReason = (a: { reason?: boolean; inputs?: FieldSpec[] }) => [...(a.inputs ?? []), ...(a.reason ? [REASON_FIELD] : [])];
  const rowPath = (row: Row, action?: string) => `/admin/${resource}/${encodeURIComponent(String(row.id))}${action ? `/${action}` : ""}`;

  const startRowAction = (a: RowAction, row: Row) => {
    if (withReason(a).length > 0) return setDialog({ kind: "action", action: a, row });
    if (a.confirm && !window.confirm(a.confirm)) return;
    run(rowPath(row, a.action), "POST", a.success);
  };

  const onPrimary = () => {
    if (primary.kind === "create") setDialog({ kind: "create" });
    else if (primary.kind === "export") exportCsv();
    else if (primary.kind === "navigate") go(primary.to);
    else if (primary.kind === "action") {
      if (withReason(primary).length > 0) setDialog({ kind: "primary", spec: primary });
      else if (!primary.confirm || window.confirm(primary.confirm)) run(primary.path, "POST", primary.success);
    } else setDialog({ kind: "info", title: primary.label, text: primary.text });
  };

  const showPrimary =
    (primary.kind !== "create" || canCreate) &&
    (primary.kind !== "action" || manage) &&
    (primary.kind !== "export" || canExport) &&
    (!primary.permission || can(user, primary.permission));

  /* ───── saved views and columns ───── */
  const presetViews: SavedView[] = (config.views ?? []).map((v) => ({ name: v.label, q: "", filters: v.filters, sort: null }));
  const allViews = [...presetViews, ...savedViews];

  const applyView = (name: string) => {
    setActiveView(name);
    const v = allViews.find((x) => x.name === name);
    if (!v) return;
    setQ(v.q);
    setFilterValues(v.filters);
    setSort(v.sort ?? config.defaultSort ?? null);
    setPage(1);
  };

  const saveView = () => {
    const name = window.prompt("Name this view");
    if (!name?.trim()) return;
    const next = [...savedViews.filter((v) => v.name !== name.trim()), { name: name.trim(), q, filters: filterValues, sort }];
    setSavedViews(next);
    localStorage.setItem(viewsKey, JSON.stringify(next));
    setActiveView(name.trim());
  };

  const deleteView = () => {
    const next = savedViews.filter((v) => v.name !== activeView);
    setSavedViews(next);
    localStorage.setItem(viewsKey, JSON.stringify(next));
    setActiveView("");
  };

  const toggleColumn = (key: string) => {
    const next = new Set(hiddenCols);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHiddenCols(next);
    localStorage.setItem(colsKey, JSON.stringify([...next]));
  };

  const setFilter = (key: string, value: string) => {
    setFilterValues((s) => ({ ...s, [key]: value }));
    setPage(1);
    setActiveView("");
  };

  const clickSort = (key: string) => {
    setSort((s) => (s?.key === key ? { key, order: s.order === "asc" ? "desc" : "asc" } : { key, order: "asc" }));
    setPage(1);
  };

  /* ───── table cells ───── */
  const idOf = (row: Row) => String(row.id);
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(idOf(r)));

  const heads: ReactNode[] = [
    ...(bulkActions.length > 0 && manage
      ? [
          <input
            key="all"
            type="checkbox"
            aria-label="Select all rows on this page"
            checked={allOnPage}
            onChange={() => setSelected(allOnPage ? new Set() : new Set(rows.map(idOf)))}
          />,
        ]
      : []),
    ...shownColumns.map((c) =>
      c.sortable === false ? (
        c.label
      ) : (
        <button key={c.key} type="button" onClick={() => clickSort(c.key)} className="hover:text-white">
          {c.label}
          {sort?.key === c.key ? (sort.order === "asc" ? " ▲" : " ▼") : ""}
        </button>
      ),
    ),
  ];

  const rowButtons = (row: Row) => {
    const editable = !config.canEditRow || config.canEditRow(row);
    const buttons: ReactNode[] = actions
      .filter((a) => manage && (!a.show || a.show(row)) && (!a.permission || can(user, a.permission)))
      .map((a) => (
        <Btn key={a.action} tone={a.tone} disabled={mutation.isPending} onClick={() => startRowAction(a, row)}>
          {a.label}
        </Btn>
      ));
    if (canEdit && editable) buttons.push(<Btn key="edit" onClick={() => setDialog({ kind: "edit", row })}>Edit</Btn>);
    if (canDelete && editable) {
      buttons.push(
        <Btn
          key="delete"
          tone="danger"
          disabled={mutation.isPending}
          onClick={() => window.confirm(`Delete ${idOf(row)}? This cannot be undone.`) && run(rowPath(row), "DELETE", "Deleted.")}
        >
          Delete
        </Btn>,
      );
    }
    return buttons.length ? <div className="flex flex-wrap gap-2">{buttons}</div> : <span className="text-white/25">-</span>;
  };

  const hasRowButtons = actions.length > 0 || canEdit;

  const tableRows = rows.map((row) => [
    ...(bulkActions.length > 0 && manage
      ? [
          <input
            key="sel"
            type="checkbox"
            aria-label={`Select ${idOf(row)}`}
            checked={selected.has(idOf(row))}
            onChange={() =>
              setSelected((s) => {
                const next = new Set(s);
                if (next.has(idOf(row))) next.delete(idOf(row));
                else next.add(idOf(row));
                return next;
              })
            }
          />,
        ]
      : []),
    ...shownColumns.map((c, i) => {
      const cell = renderCell(row[c.key], c.format, row);
      // The first visible column opens the detail panel
      return i === 0 && config.detail ? (
        <button
          key={c.key}
          type="button"
          className="text-left text-gold-light underline-offset-2 hover:underline"
          onClick={() => {
            setDrawerId(idOf(row));
            setDrawerSnapshot(row);
          }}
        >
          {cell}
        </button>
      ) : (
        cell
      );
    }),
    ...(hasRowButtons ? [rowButtons(row)] : []),
  ]);

  const drawerRow = drawerId ? (rows.find((r) => idOf(r) === drawerId) ?? drawerSnapshot) : null;
  const filterOptions = (key: string) => [ANY, ...(data?.facets?.[key] ?? [])];

  return (
    <Card>
      {/* ───── toolbar ───── */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <TextInput aria-label="Search records" placeholder="Search" value={q} onChange={(e) => { setQ(e.target.value); setActiveView(""); }} className="!w-[220px]" />
          {filters.map((f) => (
            <SelectInput
              key={f.key}
              aria-label={`Filter by ${f.label}`}
              options={filterOptions(f.key)}
              value={filterValues[f.key] ?? ANY}
              onChange={(e) => setFilter(f.key, e.target.value)}
              className="!w-[150px]"
            />
          ))}
          {config.dateKey && (
            <>
              <TextInput type="date" aria-label="From date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="!w-[150px]" />
              <TextInput type="date" aria-label="To date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="!w-[150px]" />
            </>
          )}
          {allViews.length > 0 && (
            <SelectInput aria-label="Saved views" options={["Views…", ...allViews.map((v) => v.name)]} value={activeView || "Views…"} onChange={(e) => applyView(e.target.value)} className="!w-[160px]" />
          )}
          {activeView && savedViews.some((v) => v.name === activeView) && <Btn tone="danger" onClick={deleteView}>Delete view</Btn>}
          {hasFilters && <Btn onClick={saveView}>Save view</Btn>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <details className="relative">
            <summary className="cursor-pointer list-none border-[0.7px] border-white/[0.13] px-4 py-2 text-[14px] text-white/80 hover:border-gold-accent">Columns</summary>
            <div className="absolute right-0 z-30 mt-1 min-w-[180px] border-[0.7px] border-white/[0.13] bg-surface p-3">
              {columns.map((c) => (
                <label key={c.key} className="flex items-center gap-2 py-1 text-[14px] text-white/70">
                  <input type="checkbox" checked={!hiddenCols.has(c.key)} onChange={() => toggleColumn(c.key)} /> {c.label}
                </label>
              ))}
            </div>
          </details>
          {canExport && <Btn onClick={exportCsv}>Export CSV</Btn>}
          {config.toolbar}
          {showPrimary && <Btn tone="gold" onClick={onPrimary}>{primary.label}</Btn>}
        </div>
      </div>

      {/* ───── bulk bar ───── */}
      {selected.size > 0 && manage && (
        <div className="mb-4 flex flex-wrap items-center gap-3 border-[0.7px] border-gold-accent/40 bg-gold/10 px-4 py-3 text-[14px]">
          <span className="text-white">{selected.size} selected</span>
          {bulkActions
            .filter((a) => !a.permission || can(user, a.permission))
            .map((a) => (
              <Btn
                key={a.action}
                disabled={mutation.isPending}
                onClick={() =>
                  withReason(a).length > 0
                    ? setDialog({ kind: "bulk", action: a })
                    : run(`/admin/${resource}/bulk/${a.action}`, "POST", a.success, { ids: [...selected] }, () => setSelected(new Set()))
                }
              >
                {a.label}
              </Btn>
            ))}
          <Btn onClick={() => setSelected(new Set())}>Clear</Btn>
        </div>
      )}

      {/* ───── list ───── */}
      {isPending ? (
        <StateMessage>Loading…</StateMessage>
      ) : error ? (
        <StateMessage error onRetry={() => refetch()}>{describeError(error)}</StateMessage>
      ) : rows.length === 0 ? (
        <StateMessage>{hasFilters ? "No records match." : (config.emptyText ?? "Nothing here yet.")}</StateMessage>
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : ""}>
          <Table heads={[...heads, ...(hasRowButtons ? ["Actions"] : [])]} rows={tableRows} />
        </div>
      )}

      {/* ───── paging ───── */}
      {rows.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[14px] text-white/50">
          <span>{total.toLocaleString("en-US")} records · page {page} of {pageCount}</span>
          <div className="flex items-center gap-2">
            <SelectInput aria-label="Rows per page" options={PAGE_SIZES} value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="!w-[80px]" />
            <Btn disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Btn>
            <Btn disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Btn>
          </div>
        </div>
      )}

      {/* ───── dialogs ───── */}
      {dialog?.kind === "info" && (
        <Modal title={dialog.title} onClose={() => setDialog(null)}>
          <p className="text-[15px] leading-relaxed text-white/60">{dialog.text}</p>
        </Modal>
      )}

      {fields && dialog?.kind === "create" && (
        <ActionDialog
          title={primary.label}
          subtitle="Fill in the details below."
          fields={fields}
          submitLabel="Create"
          busy={mutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(values) => run(`/admin/${resource}`, "POST", "Created.", values, () => setDialog(null))}
        />
      )}

      {fields && dialog?.kind === "edit" && (
        <ActionDialog
          title={`Edit ${idOf(dialog.row)}`}
          fields={fields}
          initial={dialog.row}
          submitLabel="Save changes"
          busy={mutation.isPending}
          onClose={() => setDialog(null)}
          // ifVersion stops two admins from silently overwriting each other's edit
          onSubmit={(values) => run(rowPath(dialog.row), "PATCH", "Saved.", { ...values, ifVersion: dialog.row.version }, () => setDialog(null))}
        />
      )}

      {dialog?.kind === "action" && (
        <ActionDialog
          title={dialog.action.label}
          subtitle={`${resource} ${idOf(dialog.row)}`}
          fields={withReason(dialog.action)}
          submitLabel={dialog.action.label}
          busy={mutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(values) => run(rowPath(dialog.row, dialog.action.action), "POST", dialog.action.success, values, () => setDialog(null))}
        />
      )}

      {dialog?.kind === "bulk" && (
        <ActionDialog
          title={dialog.action.label}
          subtitle={`${selected.size} records selected`}
          fields={withReason(dialog.action)}
          submitLabel={dialog.action.label}
          busy={mutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(values) =>
            run(`/admin/${resource}/bulk/${dialog.action.action}`, "POST", dialog.action.success, { ids: [...selected], ...values }, () => {
              setDialog(null);
              setSelected(new Set());
            })
          }
        />
      )}

      {dialog?.kind === "primary" && (
        <ActionDialog
          title={primary.label}
          fields={withReason(dialog.spec)}
          submitLabel={primary.label}
          busy={mutation.isPending}
          onClose={() => setDialog(null)}
          onSubmit={(values) => run(dialog.spec.path, "POST", dialog.spec.success, values, () => setDialog(null))}
        />
      )}

      {/* ───── detail panel ───── */}
      {config.detail && drawerRow && (
        <DetailDrawer
          title={config.detailTitle?.(drawerRow) ?? idOf(drawerRow)}
          subtitle={typeof drawerRow.status === "string" ? statusPill(drawerRow.status) : undefined}
          row={drawerRow}
          tabs={config.detail}
          canWrite={manage}
          onClose={() => setDrawerId(null)}
        />
      )}
    </Card>
  );
}
