"use client";

import { useEffect, useState } from "react";

/* ───────────────────────── Content shapes (shared by the public site and the admin editor) ───────────────────────── */

export type RulesNode =
  | { t: "h3"; x: string }
  | { t: "p"; x: string }
  | { t: "f"; x: string } // formula or highlighted line
  | { t: "ul"; x: string[] }
  | { t: "ol"; x: string[] }
  | { t: "new"; x: string };

export type RulesSection = { n: string; title: string; nodes: RulesNode[] };
export type RulesItem = { id: string; label: string; sections: RulesSection[] };
export type RulesGroup = { label: string; items: RulesItem[] };

export type RulesContent = { overviewHead: string[]; overviewRows: string[][]; groups: RulesGroup[] };
export type FaqItem = { q: string; a: string };
export type FaqContent = { items: FaqItem[] };

export type ContentKey = "faq" | "rules";

// One stored record per key. The public site only ever reads `published`.
export type ContentRecord<T = unknown> = {
  key: ContentKey;
  published: T | null;
  draft: T | null;
  version: number;
  publishedAt: string | null;
  history: { version: number; savedAt: string; savedBy: string; note: string; data: T }[];
};

/* ───────────────────────── Demo storage (used only while the admin runs in mock mode) ───────────────────────── */

const MOCK = process.env.NEXT_PUBLIC_ADMIN_MOCK !== "false";
export const MOCK_CONTENT_STORAGE_KEY = "perpeye-site-content";
export const MOCK_CONTENT_EVENT = "perpeye-site-content-changed";

export function readMockContent(): Partial<Record<ContentKey, ContentRecord>> {
  try {
    return JSON.parse(localStorage.getItem(MOCK_CONTENT_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function writeMockContent(all: Partial<Record<ContentKey, ContentRecord>>) {
  localStorage.setItem(MOCK_CONTENT_STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(MOCK_CONTENT_EVENT));
}

/* ───────────────────────── Public hook ───────────────────────── */

// Returns the published content for `key`, or `fallback` while loading / when nothing is published yet.
// Mock mode reads the browser storage that the admin editor writes to.
// Real mode calls GET /public/content/:key -> { data: T | null }.
export function useSiteContent<T>(key: ContentKey, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (MOCK) {
          const record = readMockContent()[key];
          if (!cancelled) setValue((record?.published as T | null) ?? fallback);
          return;
        }
        const { api } = await import("@/lib/api");
        const res = await api<{ data: T | null }>(`/public/content/${key}`);
        if (!cancelled) setValue(res.data ?? fallback);
      } catch {
        if (!cancelled) setValue(fallback);
      }
    };

    load();
    if (!MOCK) return () => { cancelled = true; };

    // Refresh when the admin publishes from another tab or from this one
    window.addEventListener("storage", load);
    window.addEventListener(MOCK_CONTENT_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", load);
      window.removeEventListener(MOCK_CONTENT_EVENT, load);
    };
    // `fallback` is a module-level constant on every call site, so it is intentionally not a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return value;
}
