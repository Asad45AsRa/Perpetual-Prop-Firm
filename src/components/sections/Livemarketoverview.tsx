"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { cn } from "@/lib/utils";

/* ----------------------------- config ----------------------------- */

const HL_INFO = "https://api.hyperliquid.xyz/info";
const REFRESH_MS = 5000;
const PAGE_SIZE = 10;

// "" = main Hyperliquid dex (crypto), baqi HIP-3 dexes (stocks/commodities/fx/indices).
// Agar koi dex fail ho jaye to baqi chalte rahenge.
const DEXES = ["", "xyz"];

const TABS = ["All", "Crypto", "Commodities", "FX", "Stocks", "Indices"] as const;
type Tab = (typeof TABS)[number];

const STOCKS = new Set([
  "TSLA", "NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "META", "COIN", "HOOD",
  "MSTR", "PLTR", "AMD", "INTC", "NFLX", "ORCL", "CRCL", "BABA", "MU", "TSM",
]);
const COMMODITIES = new Set([
  "GOLD", "SILVER", "COPPER", "PLATINUM", "PALLADIUM", "CL", "WTI", "OIL",
  "BRENTOIL", "NATGAS", "URANIUM",
]);
const FX = new Set(["EUR", "JPY", "GBP", "CHF", "AUD", "CAD", "DXY", "USDJPY", "EURUSD"]);
const INDICES = new Set(["XYZ100", "SP500", "US500", "NDX", "US100", "DJI", "JP225", "KR200"]);

function categoryOf(base: string): Exclude<Tab, "All"> {
  const b = base.toUpperCase();
  if (STOCKS.has(b)) return "Stocks";
  if (COMMODITIES.has(b)) return "Commodities";
  if (FX.has(b)) return "FX";
  if (INDICES.has(b)) return "Indices";
  return "Crypto";
}

/* ------------------------------ types ----------------------------- */

type Market = {
  key: string; // unique (dex:name)
  symbol: string; // display, e.g. BTC
  iconName: string; // hyperliquid icon name
  leverage: number;
  price: number;
  change24h: number; // percent
  volume24h: number; // USD
  openInterest: number; // USD
  category: Exclude<Tab, "All">;
};

export type LongShortMap = Record<string, { long: number; short: number }>;

type Props = {
  /**
   * Platform long/short (apni book ka data). Key = symbol (e.g. "BTC").
   * Jab data nahi hota to "—" show hota hai (design ke footnote ke mutabiq).
   */
  longShort?: LongShortMap;
};

/* ----------------------------- helpers ---------------------------- */

function formatPrice(n: number) {
  if (!isFinite(n)) return "—";
  if (n >= 1) {
    return `$${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumSignificantDigits: 4,
    maximumFractionDigits: 8,
  })}`;
}

function formatCompact(n: number) {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatChange(n: number) {
  if (!isFinite(n)) return "—";
  const v = n.toFixed(1);
  return `${n > 0 ? "+" : ""}${v === "-0.0" ? "0.0" : v}%`;
}

async function fetchDex(dex: string, signal: AbortSignal): Promise<Market[]> {
  const res = await fetch(HL_INFO, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      dex ? { type: "metaAndAssetCtxs", dex } : { type: "metaAndAssetCtxs" }
    ),
    signal,
  });
  if (!res.ok) throw new Error(`Hyperliquid ${res.status}`);
  const [meta, ctxs] = (await res.json()) as [
    { universe: { name: string; maxLeverage: number; isDelisted?: boolean }[] },
    {
      markPx: string;
      prevDayPx: string;
      dayNtlVlm: string;
      openInterest: string;
    }[],
  ];

  const out: Market[] = [];
  meta.universe.forEach((u, i) => {
    const c = ctxs[i];
    if (!c || u.isDelisted) return;
    const mark = parseFloat(c.markPx);
    const prev = parseFloat(c.prevDayPx);
    const base = u.name.includes(":") ? u.name.split(":")[1] : u.name;
    out.push({
      key: u.name,
      symbol: base,
      iconName: u.name,
      leverage: u.maxLeverage,
      price: mark,
      change24h: prev > 0 ? ((mark - prev) / prev) * 100 : 0,
      volume24h: parseFloat(c.dayNtlVlm),
      openInterest: parseFloat(c.openInterest) * mark,
      category: dex ? categoryOf(base) : "Crypto",
    });
  });
  return out;
}

/* ---------------------------- sub-components ---------------------- */

function CoinIcon({ name, symbol }: { name: string; symbol: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-[11px] text-white">
        {symbol.slice(0, 1)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://app.hyperliquid.xyz/coins/${name.replace(":", "_")}.svg`}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-[28px] w-[28px] shrink-0 rounded-full"
    />
  );
}

// Figma column positions: Market | Price | 24H | 24H Volume | Market OI | Platform Long / Short
const GRID =
  "grid grid-cols-[minmax(150px,341fr)_minmax(90px,133fr)_minmax(70px,103fr)_minmax(80px,136fr)_minmax(100px,193fr)_minmax(121px,100fr)] items-center";

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ------------------------------ main ------------------------------ */

export function LiveMarketOverview({ longShort }: Props) {
  const [markets, setMarkets] = useState<Market[] | null>(null);
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Real-time: har 5s par Hyperliquid se refresh
  useEffect(() => {
    let alive = true;
    let ctrl = new AbortController();

    async function load() {
      ctrl.abort();
      ctrl = new AbortController();
      const results = await Promise.allSettled(
        DEXES.map((d) => fetchDex(d, ctrl.signal))
      );
      if (!alive) return;
      const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      if (all.length) {
        all.sort((a, b) => b.openInterest - a.openInterest);
        setMarkets(all);
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      ctrl.abort();
      clearInterval(id);
    };
  }, []);

  const filtered = useMemo(() => {
    if (!markets) return [];
    const q = query.trim().toLowerCase();
    return markets.filter(
      (m) =>
        (tab === "All" || m.category === tab) &&
        (!q || m.symbol.toLowerCase().includes(q) || m.key.toLowerCase().includes(q))
    );
  }, [markets, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // pagination window (max 9 buttons)
  const pages = useMemo(() => {
    const max = 9;
    let start = Math.max(1, current - Math.floor(max / 2));
    const end = Math.min(totalPages, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [current, totalPages]);

  return (
    <section
      data-affiliate-page
      className="relative w-full overflow-hidden bg-[#111111] px-6 pb-[120px] pt-[80px] md:px-20"
    >
      {/* Left / right side glows (Figma jaisa) — data-affiliate-page body glows band karta hai,
          isliye yahan section ke andar apne glows hain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            // left glow, section ke neeche tak jaye (boundary par continue)
            "radial-gradient(ellipse 30% 45% at 0% 100%, rgba(176,171,161,0.20) 0%, rgba(120,112,98,0.08) 50%, transparent 100%)",
            // right glow, upar
            "radial-gradient(ellipse 30% 40% at 100% 22%, rgba(176,171,161,0.18) 0%, rgba(120,112,98,0.07) 50%, transparent 100%)",
          ].join(", "),
          // sirf TOP par fade, bottom par koi mask nahi
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 90px)",
          maskImage: "linear-gradient(to bottom, transparent 0, #000 90px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-[40px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[48px]">
          Live Market Overview
        </h2>
        <p className="mt-6 max-w-[390px] text-[16px] leading-[21px] text-muted/80">
          Track real-time prices, market movements, and trading activity—all in
          one place.
        </p>
      </div>

      <div className="relative z-10 mt-[40px] w-full border border-white/10 bg-white/[0.04] backdrop-blur-[20px]">
        {/* toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] bg-white/[0.03] px-[17px] py-[16px] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-[15px]">
            {TABS.map((t) => {
              const active = t === tab;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setPage(1);
                  }}
                  className={cn(
                    "h-[40px] min-w-[68px] px-7 text-[12px] leading-none transition-colors",
                    active
                      ? "text-[#1c1c1c]"
                      : "border border-white/10 bg-white/[0.02] text-[#A8A39A] hover:text-white"
                  )}
                  style={
                    active
                      ? { background: "linear-gradient(90deg, #FFFFFF 0%, #99804A 100%)" }
                      : undefined
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>

          <label className="flex h-[40px] w-full items-center gap-2 border border-white/10 bg-white/[0.02] px-[14px] md:w-[256px]">
            <FiSearch className="h-[14px] w-[14px] shrink-0 text-[#8C887F]" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search symbol or name"
              className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-[#6f6b63]"
            />
          </label>
        </div>

        {/* table (mobile par horizontal scroll) */}
        <div className="overflow-x-auto">
          <div className="min-w-[860px] px-[17px]">
            {/* head */}
            <div
              className={cn(
                GRID,
                "h-[57px] whitespace-nowrap border-b border-white/[0.06] text-[9px] uppercase leading-none text-[#6f6b63]"
              )}
            >
              <span>Market</span>
              <span>Price</span>
              <span>24H</span>
              <span>24H Volume</span>
              <span>Market Open Interest</span>
              <span>Platform Long / Short</span>
            </div>

            {/* rows */}
            {markets === null
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div
                  key={i}
                  className={cn(GRID, "h-[55px] border-b border-white/[0.06]")}
                >
                  <span className="h-[28px] w-[120px] animate-pulse bg-white/[0.05]" />
                  <span className="h-[10px] w-[70px] animate-pulse bg-white/[0.05]" />
                  <span className="h-[10px] w-[40px] animate-pulse bg-white/[0.05]" />
                  <span className="h-[10px] w-[40px] animate-pulse bg-white/[0.05]" />
                  <span className="h-[10px] w-[40px] animate-pulse bg-white/[0.05]" />
                  <span className="h-[10px] w-[60px] animate-pulse bg-white/[0.05]" />
                </div>
              ))
              : rows.map((m) => {
                const ls = longShort?.[m.symbol];
                return (
                  <div
                    key={m.key}
                    className={cn(
                      GRID,
                      "h-[55px] border-b border-white/[0.06] text-[14px] leading-none text-muted/80"
                    )}
                  >
                    <div className="flex items-center gap-[7px]">
                      <CoinIcon name={m.iconName} symbol={m.symbol} />
                      <div className="flex flex-col gap-[4px]">
                        <span className="flex items-center gap-[7px] text-[13px] text-white">
                          {m.symbol}
                          <span className="bg-white/10 px-[4px] py-[2px] text-[8px] leading-none text-white/80">
                            {m.leverage}×
                          </span>
                        </span>
                        <span className="text-[12px] text-[#6f6b63]">
                          Perpetual USD
                        </span>
                      </div>
                    </div>

                    <span>{formatPrice(m.price)}</span>

                    <span
                      className={
                        m.change24h < 0 ? "text-[#ef4444]" : "text-[#22c55e]"
                      }
                    >
                      {formatChange(m.change24h)}
                    </span>

                    <span>{formatCompact(m.volume24h)}</span>
                    <span>{formatCompact(m.openInterest)}</span>

                    <span>
                      {ls ? (
                        <>
                          <span className="text-[#22c55e]">{Math.round(ls.long)}%</span>{" "}
                          <span className="text-[#ef4444]">{Math.round(ls.short)}%</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                );
              })}

            {markets !== null && rows.length === 0 && (
              <div className="py-10 text-center text-[12px] text-[#6f6b63]">
                No markets found.
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-col gap-4 px-[17px] py-[20px] md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] leading-none text-[#A8A39A]">
              Showing {rows.length} of {filtered.length} markets
            </p>
            <p className="mt-[10px] max-w-[400px] text-[11px] leading-[16px] text-muted/80">
              Open interest reflects the underlying market · Prices use
              Hyperliquid market data · Long/short reflects our book, with “—”
              shown when we have no position.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-[7px]">
            {/* prev */}
            <button
              type="button"
              aria-label="Previous page"
              disabled={current === 1}
              onClick={() => setPage(Math.max(1, current - 1))}
              className="flex h-[34px] w-[34px] items-center justify-center border border-white/10 bg-white/[0.04] text-[#A8A39A] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#A8A39A]"
            >
              <FiChevronLeft className="h-[14px] w-[14px]" />
            </button>

            {pages.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  "h-[34px] w-[34px] text-[10px] leading-none",
                  p === current
                    ? "bg-[#99804A] text-[#1c1c1c]"
                    : "border border-white/10 bg-white/[0.04] text-[#A8A39A] hover:text-white"
                )}
              >
                {pad2(p)}
              </button>
            ))}

            {/* next */}
            <button
              type="button"
              aria-label="Next page"
              disabled={current === totalPages}
              onClick={() => setPage(Math.min(totalPages, current + 1))}
              className="flex h-[34px] w-[34px] items-center justify-center border border-white/10 bg-white/[0.04] text-[#A8A39A] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#A8A39A]"
            >
              <FiChevronRight className="h-[14px] w-[14px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}