"use client";

import { Card, formatDate, formatMoney, formatPnl, Pill, pnlClass, StateMessage, statusTone, Table } from "./ui";
import { useAdminQuery } from "./adminData";
import type { ListResponse } from "./types";

export type ColumnSpec = {
  key: string; // field name in the JSON row
  label: string;
  format?: "text" | "number" | "money" | "date" | "status" | "pnl" | "percent" | "multiplier";
};

type Row = Record<string, unknown>;

export function renderCell(value: unknown, format: ColumnSpec["format"] = "text") {
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
    case "status":
      return <Pill tone={statusTone(String(value))}>{String(value)}</Pill>;
    default:
      return String(value);
  }
}

// A complete live list page: GET /admin/<resource> -> { items: [...] }.
// It refreshes itself when the server pushes a "<resource>" realtime event.
export function ResourceList({ resource, columns, emptyText = "Nothing here yet." }: { resource: string; columns: ColumnSpec[]; emptyText?: string }) {
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<Row>>(resource, `/admin/${resource}`);

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
          rows={data.items.map((row) => columns.map((c) => renderCell(row[c.key], c.format)))}
        />
      )}
    </Card>
  );
}
