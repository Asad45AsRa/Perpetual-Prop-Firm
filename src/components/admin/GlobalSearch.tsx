"use client";

import { useEffect, useState } from "react";
import { adminApi } from "./adminApi";
import { useAdminNavigate } from "./adminData";
import { TextInput } from "./ui";
import type { ListResponse } from "./types";

type Hit = { type: string; id: string; label: string; page: string };

// Searches traders, accounts, payouts, payments and transaction hashes in one box.
// GET /admin/search?q=...  The server only returns records from sections the person may open.
export function GlobalSearch() {
  const go = useAdminNavigate();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    // Wait for a short pause in typing so the server is not called on every key
    const timer = setTimeout(async () => {
      try {
        const res = await adminApi<ListResponse<Hit>>(`/admin/search?q=${encodeURIComponent(q.trim())}`);
        setHits(res.items);
      } catch {
        setHits([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="relative w-[260px] max-w-full">
      <TextInput
        aria-label="Search everything"
        placeholder="Search trader, account, payout, hash"
        value={q}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => setQ(e.target.value)}
      />
      {open && q.trim().length >= 2 && (
        <ul className="absolute left-0 top-full z-40 mt-1 max-h-[320px] w-[360px] max-w-[calc(100vw-32px)] overflow-y-auto border-[0.7px] border-white/[0.13] bg-surface">
          {hits.length === 0 ? (
            <li className="px-4 py-3 text-[14px] text-white/40">No match.</li>
          ) : (
            hits.map((h) => (
              <li key={`${h.type}-${h.id}`}>
                <button
                  type="button"
                  onMouseDown={() => { go(h.page, { q: h.id }); setQ(""); }}
                  className="flex w-full items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5 text-left text-[14px] hover:bg-white/[0.04]"
                >
                  <span className="text-white">{h.label}</span>
                  <span className="shrink-0 text-[12px] text-white/40">{h.type}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
