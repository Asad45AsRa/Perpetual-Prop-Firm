"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------- config ----------------------------- */

const HL_INFO = "https://api.hyperliquid.xyz/info";
const REFRESH_MS = 10000;
const MAX_TILES = 220;

// "" = main Hyperliquid dex (crypto), baqi HIP-3 dexes (stocks/commodities/fx/indices).
// Koi dex fail ho jaye to baqi chalte rahenge.
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
  key: string;
  symbol: string;
  leverage: number;
  price: number;
  change24h: number;
  volume24h: number;
  openInterest: number;
  category: Exclude<Tab, "All">;
};

type Rect = { x: number; y: number; w: number; h: number };
type Tile = Market & Rect;

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
  const v = n.toFixed(2);
  return `${n > 0 ? "+" : ""}${v === "-0.00" ? "0.00" : v}%`;
}

// change% -> tile color (red: -, green: +). ~6% par full saturation.
function tileColor(change: number) {
  const t = Math.min(Math.abs(change) / 6, 1);
  const e = Math.pow(t, 0.9);
  const [from, to] =
    change < 0
      ? [
        [74, 21, 25],
        [179, 36, 47],
      ]
      : [
        [23, 56, 30],
        [67, 176, 92],
      ];
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * e));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
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

/* ------------------------ squarified treemap ---------------------- */

function worst(areas: number[], side: number) {
  const s = areas.reduce((a, b) => a + b, 0);
  const max = Math.max(...areas);
  const min = Math.min(...areas);
  return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min));
}

function squarify(items: Market[], width: number, height: number): Tile[] {
  if (!width || !height || !items.length) return [];
  const total = items.reduce((a, m) => a + m.volume24h, 0);
  const scale = (width * height) / total;
  const nodes = items.map((m) => ({ m, area: m.volume24h * scale }));

  const out: Tile[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  let i = 0;

  while (i < nodes.length) {
    const side = Math.min(w, h);
    const row: typeof nodes = [];
    let prev = Infinity;

    while (i < nodes.length) {
      const next = [...row, nodes[i]];
      const r = worst(next.map((n) => n.area), side);
      if (row.length && r > prev) break;
      row.push(nodes[i]);
      prev = r;
      i++;
    }

    const rowArea = row.reduce((a, n) => a + n.area, 0);
    const thickness = rowArea / side;

    if (w >= h) {
      // column left par, items upar se neeche
      let cy = y;
      row.forEach((n) => {
        const ih = n.area / thickness;
        out.push({ ...n.m, x, y: cy, w: thickness, h: ih });
        cy += ih;
      });
      x += thickness;
      w -= thickness;
    } else {
      // strip top par, items left se right
      let cx = x;
      row.forEach((n) => {
        const iw = n.area / thickness;
        out.push({ ...n.m, x: cx, y, w: iw, h: thickness });
        cx += iw;
      });
      y += thickness;
      h -= thickness;
    }
  }
  return out;
}

/* ------------------------------ main ------------------------------ */

export function MarketHeatmap() {
  const [markets, setMarkets] = useState<Market[] | null>(null);
  const [tab, setTab] = useState<Tab>("All");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<{ key: string; x: number; y: number } | null>(
    null
  );
  const boxRef = useRef<HTMLDivElement>(null);

  // Real-time: Hyperliquid se refresh
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
      if (all.length) setMarkets(all);
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      ctrl.abort();
      clearInterval(id);
    };
  }, []);

  // container size
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tiles = useMemo(() => {
    if (!markets) return [];
    const list = markets
      .filter((m) => (tab === "All" || m.category === tab) && m.volume24h > 0)
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, MAX_TILES);
    return squarify(list, size.w, size.h);
  }, [markets, tab, size.w, size.h]);

  const hovered = hover ? tiles.find((t) => t.key === hover.key) : undefined;

  return (
    <section
      data-affiliate-page
      className="relative w-full overflow-hidden bg-[#111111] px-6 pb-[120px] pt-[80px] md:px-20"
    >
      {/* halka glow: closest-side => edges par bilkul transparent, koi hard line nahi */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            // left glow, section ke top se shuru (Live ke left glow ka continuation)
            "radial-gradient(ellipse 30% 45% at 0% 0%, rgba(176,171,161,0.20) 0%, rgba(120,112,98,0.08) 50%, transparent 100%)",
            // right glow, neeche
            "radial-gradient(ellipse 30% 45% at 100% 82%, rgba(176,171,161,0.20) 0%, rgba(120,112,98,0.08) 50%, transparent 100%)",
          ].join(", "),
          // sirf BOTTOM par fade, top par koi mask nahi
          WebkitMaskImage: "linear-gradient(to bottom, #000 calc(100% - 90px), transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 calc(100% - 90px), transparent 100%)",
        }}
      />

      <div className="relative z-10">
        {/* header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[40px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[48px]">
              Market Heatmap
            </h2>
            <p className="mt-6 max-w-[460px] text-[16px] leading-[21px] text-muted/90">
              Each tile is sized by 24-hour trading volume and colored by its
              price change over the same period. Hover over a tile to explore
              the details.
            </p>
          </div>

          <div className="flex flex-wrap gap-[14px]">
            {TABS.map((t) => {
              const active = t === tab;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "h-[38px] min-w-[68px] px-6 text-[11px] leading-none transition-colors",
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
        </div>

        {/* treemap */}
        <div
          ref={boxRef}
          className="relative mt-[40px] h-[420px] w-full overflow-hidden bg-[#0f0f0f] md:h-[585px]"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = e.clientX - r.left;
            const py = e.clientY - r.top;
            const hit = tiles.find(
              (t) => px >= t.x && px < t.x + t.w && py >= t.y && py < t.y + t.h
            );
            setHover(hit ? { key: hit.key, x: px, y: py } : null);
          }}
          onMouseLeave={() => setHover(null)}
        >
          {markets === null && (
            <div className="absolute inset-0 animate-pulse bg-white/[0.04]" />
          )}

          {markets !== null && tiles.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#6f6b63]">
              No markets found.
            </div>
          )}

          {tiles.map((t) => {
            const showSymbol = t.w >= 34 && t.h >= 22;
            const showChange = t.w >= 50 && t.h >= 40;
            const showVolume = t.w >= 90 && t.h >= 70;
            const big = Math.min(t.w, t.h);
            const symbolSize = big >= 140 ? 14 : big >= 70 ? 13 : 11;
            const isHover = hover?.key === t.key;

            return (
              <div
                key={t.key}
                className="absolute box-border flex flex-col items-center justify-center overflow-hidden border border-[#0f0f0f] text-center font-mono text-white transition-[background-color,filter] duration-500"
                style={{
                  left: t.x,
                  top: t.y,
                  width: t.w,
                  height: t.h,
                  backgroundColor: tileColor(t.change24h),
                  backgroundImage:
                    "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 70%)",
                  filter: isHover ? "brightness(1.25)" : undefined,
                }}
              >
                {showSymbol && (
                  <span
                    className="leading-none"
                    style={{ fontSize: symbolSize }}
                  >
                    {t.symbol}
                  </span>
                )}
                {showChange && (
                  <span className="mt-[7px] text-[11px] leading-none">
                    {formatChange(t.change24h)}
                  </span>
                )}
                {showVolume && (
                  <span className="mt-[7px] text-[9px] leading-none text-white/80">
                    {formatCompact(t.volume24h)}
                  </span>
                )}
              </div>
            );
          })}

          {/* tooltip */}
          {hover && hovered && (
            <div
              className="pointer-events-none absolute z-20 w-[190px] border border-white/10 bg-[#161616]/95 p-3 text-[11px] leading-none text-[#A8A39A] shadow-xl backdrop-blur-[10px]"
              style={{
                left: Math.min(hover.x + 14, Math.max(size.w - 200, 0)),
                top: Math.min(hover.y + 14, Math.max(size.h - 150, 0)),
              }}
            >
              <div className="flex items-center justify-between text-white">
                <span className="text-[13px]">
                  {hovered.symbol}
                  <span className="ml-[6px] bg-white/10 px-[4px] py-[2px] text-[8px] text-white/80">
                    {hovered.leverage}×
                  </span>
                </span>
                <span className="text-[9px] uppercase text-[#6f6b63]">
                  {hovered.category}
                </span>
              </div>
              <dl className="mt-3 flex flex-col gap-[9px]">
                <Row label="Price" value={formatPrice(hovered.price)} />
                <Row
                  label="24H"
                  value={formatChange(hovered.change24h)}
                  valueClass={
                    hovered.change24h < 0 ? "text-[#ef4444]" : "text-[#22c55e]"
                  }
                />
                <Row label="24H Volume" value={formatCompact(hovered.volume24h)} />
                <Row label="Open Interest" value={formatCompact(hovered.openInterest)} />
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#6f6b63]">{label}</dt>
      <dd className={cn("text-white", valueClass)}>{value}</dd>
    </div>
  );
}