"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------- config ----------------------------- */

const REFRESH_MS = 5000;

const PERIODS = ["30d", "90d"] as const;
type Period = (typeof PERIODS)[number];

const PLANS = ["Elite", "Breeze", "Instant", "Capital Your Way"] as const;
type Plan = (typeof PLANS)[number];

const ACCOUNT_TYPES = ["Paid", "Demo"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

const GREEN = "#4CAF50";

/* ------------------------------ types ----------------------------- */

export type PassRateData = {
  rate: number; // percent e.g. 21.5
  successful: number;
  unsuccessful: number;
  series: number[]; // chart values (left axis scale 0..4000)
  labels: string[]; // x-axis labels (evenly spaced)
};

export type PopularMarket = {
  symbol: string;
  volume: number; // USD
  share: number; // percent
  trades: number;
  color: string;
};

type Props = {
  /**
   * Live data endpoint (optional). GET ?period=30d&plan=Elite&type=Paid
   * Expected response:
   * { passRate: PassRateData, markets: PopularMarket[] }
   * Har 5s par refresh hota hai. Na ho to neeche wala default data show hota hai.
   */
  apiUrl?: string;
  passRate?: PassRateData;
  markets?: PopularMarket[];
};

/* --------------------------- default data ------------------------- */

const DEFAULT_PASS_RATE: PassRateData = {
  rate: 21.5,
  successful: 68,
  unsuccessful: 249,
  series: [
    2100, 3950, 2250, 3700, 3300, 3450, 3600, 3500, 3050, 3000, 3250, 3500,
    3750, 3750, 3550, 3150, 3200, 3450, 3300, 3100, 2850, 2800, 3050, 3600,
    3950, 3800, 3400, 3100,
  ],
  labels: [
    "Aug 16", "Aug 25", "Sep 4", "Sep 17", "Sep 28", "Oct 5", "Oct 18", "Oct 26",
  ],
};

const DEFAULT_MARKETS: PopularMarket[] = [
  { symbol: "BTC", volume: 2.56e9, share: 32.0, trades: 42580, color: "#FFFFFF" },
  { symbol: "ETH", volume: 1.52e9, share: 19.0, trades: 21345, color: "#1D3BE0" },
  { symbol: "CL", volume: 1.28e9, share: 16.0, trades: 17892, color: GREEN },
  { symbol: "GOLD", volume: 0.92e9, share: 11.5, trades: 15630, color: "#A68A50" },
  { symbol: "XYZ100", volume: 0.64e9, share: 8.0, trades: 7418, color: "#E0561F" },
];

/* ----------------------------- helpers ---------------------------- */

function formatCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2).replace(/\.?0+$/, (m) => (m === ".00" ? "" : m))}B`;
  if (abs >= 1e6) return `$${Math.round(n / 1e6)}M`;
  if (abs >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n.toFixed(0)}`;
}

/** smooth (catmull-rom -> bezier) path through points */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ---------------------------- sub-components ---------------------- */

function PeriodToggle({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="flex gap-[10px]">
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "h-[40px] w-[81px] text-[12px] leading-none transition-colors",
            p === value
              ? "border border-white/30 bg-white/10 text-[#A8A39A]"
              : "border border-transparent bg-white/[0.04] text-[#A8A39A] hover:text-white"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function PassRateChart({ series, labels }: { series: number[]; labels: string[] }) {
  const W = 1000;
  const H = 1000;
  const MAX = 4000;

  const pts = useMemo(
    () =>
      series.map((v, i) => ({
        x: (i / Math.max(1, series.length - 1)) * W,
        y: H - (Math.min(v, MAX) / MAX) * H,
      })),
    [series]
  );

  const line = useMemo(() => smoothPath(pts), [pts]);
  const area = line ? `${line} L ${W} ${H} L 0 ${H} Z` : "";
  const last = pts[pts.length - 1];

  const leftTicks = ["4K", "3K", "2K", "1K", "0"];
  const rightTicks = ["10K", "8K", "5K", "3K", "0"];

  return (
    <div className="mt-[30px]">
      <div className="flex h-[282px] items-stretch gap-[28px]">
        {/* left axis */}
        <div className="flex w-[22px] flex-col justify-between text-[10px] leading-none text-[#6f6b63]/70">
          {leftTicks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-[-50%] last:translate-y-[-50%]">
              {t}
            </span>
          ))}
        </div>

        {/* plot */}
        <div className="relative flex-1">
          {/* dashed grid */}
          {[0, 25, 50, 75, 100].map((p) => (
            <span
              key={p}
              className="absolute left-[-6px] right-[-6px] border-t border-dashed border-white/[0.08]"
              style={{ top: `${p}%` }}
            />
          ))}

          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="passFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity="0.38" />
                <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#passFill)" />
            <path
              d={line}
              fill="none"
              stroke={GREEN}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {last && (
            <span
              className="absolute h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${(last.x / W) * 100}%`,
                top: `${(last.y / H) * 100}%`,
                background: GREEN,
              }}
            />
          )}
        </div>

        {/* right axis */}
        <div className="flex w-[22px] flex-col justify-between text-[10px] leading-none text-[#6f6b63]/70">
          {rightTicks.map((t, i) => (
            <span key={`${t}-${i}`} className="-translate-y-1/2">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* x labels */}
      <div className="mt-[18px] flex justify-between pl-[50px] pr-[50px] text-[10px] leading-none text-[#6f6b63]/70">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ main ------------------------------ */

export function TraderPerformance({ apiUrl, passRate, markets }: Props) {
  const [period, setPeriod] = useState<Period>("30d");
  const [marketPeriod, setMarketPeriod] = useState<Period>("30d");
  const [plan, setPlan] = useState<Plan>("Elite");
  const [type, setType] = useState<AccountType>("Paid");

  const [pass, setPass] = useState<PassRateData>(passRate ?? DEFAULT_PASS_RATE);
  const [popular, setPopular] = useState<PopularMarket[]>(markets ?? DEFAULT_MARKETS);

  // props update ho to state sync
  useEffect(() => {
    if (passRate) setPass(passRate);
  }, [passRate]);
  useEffect(() => {
    if (markets) setPopular(markets);
  }, [markets]);

  // Real-time: har 5s par refresh (sirf jab apiUrl diya ho)
  useEffect(() => {
    if (!apiUrl) return;
    let alive = true;
    let ctrl = new AbortController();

    async function load() {
      ctrl.abort();
      ctrl = new AbortController();
      try {
        const qs = new URLSearchParams({
          period,
          marketPeriod,
          plan,
          type,
        });
        const res = await fetch(`${apiUrl}?${qs.toString()}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const json = (await res.json()) as {
          passRate?: PassRateData;
          markets?: PopularMarket[];
        };
        if (!alive) return;
        if (json.passRate) setPass(json.passRate);
        if (json.markets) setPopular(json.markets);
      } catch {
        /* abort / network error — purana data rehne do */
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      ctrl.abort();
      clearInterval(id);
    };
  }, [apiUrl, period, marketPeriod, plan, type]);

  const maxVolume = Math.max(1, ...popular.map((m) => m.volume));

  return (
    <section className="relative w-full px-6 pb-[80px] pt-[40px] md:px-20">
      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-[40px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[48px]">
          Trader Performance At A Glance
        </h2>
        <p className="mt-6 max-w-[700px] text-[16px] leading-[21px] text-muted/80">
          Explore trading results, success rates, most popular markets and payout
          trends across the platform.
        </p>
      </div>

      <div className="relative z-10 mt-[40px] grid w-full grid-cols-1 gap-[24px] lg:grid-cols-2">
        {/* ------------------------- Pass rate trends ------------------------- */}
        <div className="border border-white/10 bg-white/[0.04] px-[20px] pb-[28px] pt-[22px] backdrop-blur-[20px]">
          <div className="flex items-start justify-between">
            <span className="pt-[2px] text-[10px] uppercase leading-none text-[#6f6b63]">
              Pass Rate Trends
            </span>
            <PeriodToggle value={period} onChange={setPeriod} />
          </div>

          <div className="mt-[22px] flex items-baseline gap-[10px]">
            <span
              className="text-[40px] font-normal leading-none"
              style={{ color: GREEN }}
            >
              {pass.rate.toFixed(1)}%
            </span>
            <span className="text-[10px] leading-none text-[#6f6b63]">
              {pass.successful} successful · {pass.unsuccessful} unsuccessful
            </span>
          </div>

          <div className="mt-[22px] flex flex-wrap gap-[10px]">
            {PLANS.map((p) => {
              const active = p === plan;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={cn(
                    "h-[38px] px-[27px] text-[11px] leading-none transition-colors",
                    active
                      ? "border-b border-b-[#4CAF50] bg-[#4CAF50]/[0.12] text-[#A8A39A]"
                      : "bg-white/[0.05] text-[#A8A39A] hover:text-white"
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <PassRateChart series={pass.series} labels={pass.labels} />
        </div>

        {/* ----------------------- Most popular markets ----------------------- */}
        <div className="border border-white/10 bg-white/[0.04] px-[20px] pb-[22px] pt-[22px] backdrop-blur-[20px]">
          <div className="flex items-start justify-between">
            <span className="pt-[2px] text-[10px] uppercase leading-none text-[#6f6b63]">
              The most popular markets among traders
            </span>
            <PeriodToggle value={marketPeriod} onChange={setMarketPeriod} />
          </div>

          <div className="-mt-[8px] flex gap-[10px]">
            {ACCOUNT_TYPES.map((t) => {
              const active = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "h-[38px] w-[79px] text-[11px] leading-none transition-colors",
                    active
                      ? "border-b border-b-[#4CAF50] bg-[#4CAF50]/[0.12] text-[#A8A39A]"
                      : "bg-white/[0.05] text-[#A8A39A] hover:text-white"
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="mt-[22px] flex flex-col gap-[18px]">
            {popular.map((m) => (
              <div key={m.symbol}>
                <div className="text-right text-[11px] leading-none text-[#6f6b63]">
                  <span style={{ color: m.color }}>{formatCompact(m.volume)}</span>
                  {" · "}
                  {m.share.toFixed(1)}%
                </div>
                <div className="mt-[8px] h-[16px] w-full bg-white/[0.05]">
                  <div
                    className="h-full transition-[width] duration-500"
                    style={{
                      width: `${(m.volume / maxVolume) * 88}%`,
                      background: m.color,
                    }}
                  />
                </div>
                <div className="mt-[10px] flex items-baseline gap-[6px] leading-none">
                  <span className="text-[13px] text-[#A8A39A]">{m.symbol}</span>
                  <span className="text-[11px] text-[#6f6b63]">
                    {m.trades.toLocaleString("en-US")} trades
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}