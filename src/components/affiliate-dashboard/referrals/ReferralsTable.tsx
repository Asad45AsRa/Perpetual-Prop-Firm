"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  allReferrals,
  DASH_ASSETS,
  REFERRAL_FILTERS,
  REFERRALS_PAGE_SIZE,
  type Referral,
  type ReferralFilter,
} from "../data";
import { Panel, StatusChip } from "../Panel";

// Same column split as the Overview "Recent referrals" table, stretched to the full width.
const COLS = "grid grid-cols-[2fr_1.4fr_1.4fr_1fr] items-center pl-[15px] pr-[16px]";

export function ReferralsTable() {
  const [filter, setFilter] = useState<ReferralFilter>("All");
  const [page, setPage] = useState(0);

  // TODO(backend): filter + paginate server-side.
  const rows = useMemo(
    () => (filter === "All" ? allReferrals : allReferrals.filter((r) => r.status === filter)),
    [filter],
  );
  const pages = Math.max(1, Math.ceil(rows.length / REFERRALS_PAGE_SIZE));
  const visible = rows.slice(page * REFERRALS_PAGE_SIZE, (page + 1) * REFERRALS_PAGE_SIZE);
  const shown = page * REFERRALS_PAGE_SIZE + visible.length;

  return (
    <Panel className="px-[16px] pb-[16px] pt-[16px]">
      <div role="tablist" aria-label="Filter referrals" className="flex gap-[9px]">
        {REFERRAL_FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={filter === f}
            onClick={() => {
              setFilter(f);
              setPage(0);
            }}
            className={cn(
              "flex h-[30.27px] w-[63.18px] items-center justify-center text-[10px] leading-normal text-white/50 transition-colors",
              filter === f
                ? "border-[0.7px] border-gold-accent bg-gold-accent/15"
                : "border-[0.57px] border-white/[0.06] bg-white/[0.06] hover:text-white/80",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tablet / laptop: table */}
      <table className="mt-[22px] hidden w-full border-separate border-spacing-0 text-left sm:table">
        <thead>
          <tr className={cn(COLS, "h-[37px] text-[12px] leading-[1.3] text-white/30")}>
            <th className="font-normal">User</th>
            <th className="font-normal">Date</th>
            <th className="font-normal">Status</th>
            <th className="text-right font-normal">Commission</th>
          </tr>
        </thead>
        <tbody className="flex flex-col gap-[9px]">
          {visible.map((r) => (
            <tr key={r.user} className={cn(COLS, "h-[45px] bg-white/[0.03] text-[14px] leading-normal text-white")}>
              <td className="flex min-w-0 items-center gap-[7px]">
                <span aria-hidden className="h-[25px] w-[25px] shrink-0 rounded-full bg-white/30" />
                <span className="truncate">{r.user}</span>
              </td>
              <td>{r.date}</td>
              <td>
                <Status r={r} />
              </td>
              <td className="text-right">{r.commission}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: one card per referral */}
      <ul className="mt-[16px] flex flex-col gap-[9px] sm:hidden">
        {visible.map((r) => (
          <li key={r.user} className="bg-white/[0.03] px-[14px] py-[12px] text-[14px] leading-normal text-white">
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-[7px]">
                <span aria-hidden className="h-[25px] w-[25px] shrink-0 rounded-full bg-white/30" />
                <span className="truncate">{r.user}</span>
              </span>
              <Status r={r} />
            </div>
            <div className="mt-[8px] flex justify-between text-[12px] text-white/50">
              <span>{r.date}</span>
              <span className="text-[14px] text-white">{r.commission}</span>
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 && <p className="py-10 text-center text-[13px] text-white/50">No referrals yet.</p>}

      <div className="mt-[20px] flex flex-col gap-[12px] md:flex-row md:items-center md:justify-between">
        <p className="text-[12px] leading-[1.3] text-white/30" aria-live="polite">
          Showing {String(shown).padStart(2, "0")} of {rows.length} referrals
        </p>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </div>
    </Panel>
  );
}

function Status({ r }: { r: Referral }) {
  return (
    <StatusChip tone={r.status === "Pending" ? "amber" : "green"} className="h-[22px] text-[12px] leading-normal sm:text-[14px]">
      {r.status}
    </StatusChip>
  );
}

/** ‹ 01 02 … 09 › — a sliding window of page numbers (9 on desktop, 3 on mobile). */
function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  const windowOf = (size: number) => {
    const start = Math.min(Math.max(page - Math.floor(size / 2), 0), Math.max(pages - size, 0));
    return Array.from({ length: Math.min(size, pages) }, (_, i) => start + i);
  };
  const wide = windowOf(9);
  const narrow = new Set(windowOf(3));

  return (
    <nav aria-label="Referrals pages" className="flex flex-wrap items-center gap-[6px]">
      <PageArrow label="Previous page" disabled={page === 0} onClick={() => onChange(page - 1)} flip />
      {wide.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-label={`Page ${p + 1}`}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "h-[34px] w-[34px] items-center justify-center text-[11px] leading-none transition-colors",
            narrow.has(p) ? "flex" : "hidden md:flex",
            p === page
              ? "bg-[linear-gradient(110deg,#FFFFFF_0%,#99804A_100%)] text-ink"
              : "border-[0.57px] border-white/[0.06] bg-white/[0.06] text-white/50 hover:text-white",
          )}
        >
          {String(p + 1).padStart(2, "0")}
        </button>
      ))}
      <PageArrow label="Next page" disabled={page >= pages - 1} onClick={() => onChange(page + 1)} />
    </nav>
  );
}

function PageArrow({ label, disabled, onClick, flip }: { label: string; disabled: boolean; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-[34px] w-[34px] items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06] transition-colors hover:bg-white/10 disabled:opacity-40"
    >
      <Image src={`${DASH_ASSETS}/icons/chevron-right.svg`} alt="" width={18} height={18} unoptimized className={cn("h-[18px] w-[18px]", flip && "rotate-180")} />
    </button>
  );
}
