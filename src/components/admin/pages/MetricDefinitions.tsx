"use client";

import { useState } from "react";
import { METRICS } from "../metricDefinitions";
import { Card, Table, TextInput } from "../ui";
import type { AdminPage } from "../types";

// Read-only reference: how every number on the trader dashboard is calculated.
// The text lives in ../metricDefinitions.ts, so changing a definition is a one-line edit.
function MetricDefinitions() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const rows = METRICS.filter((m) => !term || [m.name, m.area, m.seenOn, m.formula, m.note ?? ""].some((x) => x.toLowerCase().includes(term)));

  return (
    <Card title="How every number is calculated">
      <p className="mb-4 max-w-[760px] text-[14px] leading-relaxed text-white/50">
        These are the reference definitions for the figures traders see. The backend must use exactly these formulas, so the admin
        console, the trader dashboard and every support answer show the same number.
      </p>
      <div className="mb-4 max-w-[360px]">
        <TextInput aria-label="Search metrics" placeholder="Search a metric, for example hit rate" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Table
        heads={["Metric", "Area", "Trader sees it on", "How it is calculated"]}
        rows={rows.map((m) => [
          <span key="n" className="text-white">{m.name}</span>,
          m.area,
          m.seenOn,
          <div key="f">
            <p>{m.formula}</p>
            {m.note && <p className="mt-1 text-[13px] text-white/40">{m.note}</p>}
          </div>,
        ])}
      />
      {rows.length === 0 && <p className="mt-4 text-[14px] text-white/40">No metric matches that search.</p>}
    </Card>
  );
}

export const page: AdminPage = { key: "metrics", label: "Metric Definitions", group: "Workspace", component: MetricDefinitions };
