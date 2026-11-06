"use client";

import { Card, formatDate, formatMoney, formatPnl, Pill, pnlClass, ProgressBar, StateMessage, statusTone, Table, timeAgo } from "./ui";
import { useAdminQuery } from "./adminData";
import type { ListResponse } from "./types";

export type ColumnSpec = {
  key: string; // field name in the JSON row
  label: string;
  format?: "text" | "number" | "money" | "date" | "ago" | "status" | "pnl" | "percent" | "multiplier" | "hash" | "progress" | "bool";
  sortable?: boolean; // default true for list pages; set false for computed columns the server cannot sort
  hidden?: boolean; // hidden until the user turns the column on
};

type Row = Record<string, unknown>;

export function renderCell(value: unknown, format: ColumnSpec["format"] = "text", row?: Row) {
  if (value === null || value === undefined || value === "") return <span className="text-white/25">-</span>;
  switch (format) {
    case "money":
      return formatMoney(Number(value));
    case "pnl":
      return <span className={pnlClass(Number(value))}>{formatPnl(Number(value))}</span>;
    case "percent":
      return `${Number(value)}%`;
    case "multiplier":
      return `${Number(value)}x`;
    case "number":
      return Number(value).toLocaleString("en-US");
    case "date":
      return formatDate(String(value));
    case "ago":
      return <span title={formatDate(String(value))}>{timeAgo(String(value))}</span>;
    case "status":
      return <Pill tone={statusTone(String(value))}>{String(value)}</Pill>;
    case "progress":
      return <ProgressBar value={Number(value)} />;
    case "bool":
      return <Pill tone={value ? "green" : "gray"}>{value ? "Yes" : "No"}</Pill>;
    case "hash": {
      // A long id or transaction hash: shortened, with the full value on hover and a link when the row has one
      const text = String(value);
      const short = text.length > 16 ? `${text.slice(0, 8)}…${text.slice(-6)}` : text;
      const url = row && typeof row.explorerUrl === "string" ? row.explorerUrl : "";
      return url ? (
        <a href={url} target="_blank" rel="noreferrer" title={text} className="font-mono text-[13px] text-gold-light underline">{short}</a>
      ) : (
        <span title={text} className="font-mono text-[13px]">{short}</span>
      );
    }
    default:
      return String(value);
  }
}

// A complete live list page: GET /admin/<resource> -> { items: [...] }.
// It refreshes itself when the server pushes a "<resource>" realtime event.
export function ResourceList({ resource, columns, emptyText = "Nothing here yet.", query = "" }: { resource: string; columns: ColumnSpec[]; emptyText?: string; query?: string }) {
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Row>>(resource, `/admin/${resource}${query}`);

  return (
    <Card>
      {isPending ? (
        <StateMessage>Loading…</StateMessage>
      ) : error ? (
        <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>
      ) : data.items.length === 0 ? (
        <StateMessage>{emptyText}</StateMessage>
      ) : (
        <Table
          heads={columns.map((c) => c.label)}
          rows={data.items.map((row) => columns.map((c) => renderCell(row[c.key], c.format, row)))}
        />
      )}
    </Card>
  );
}
