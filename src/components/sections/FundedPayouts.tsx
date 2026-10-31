"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------- config ----------------------------- */

const STEP_MS = 10 * 60 * 1000; // har 10 minute par naya payout
const DAY_MS = 24 * 60 * 60 * 1000;

// Fixed anchor: step count isi se nikalta hai, reload par values reset nahi hotin
const EPOCH = Date.UTC(2026, 9, 31);

const BASE_TOTAL = 15_000_000; // EPOCH par all-time total payouts
const HISTORY_DAYS = 120; // "All" kitne din ka hai
const GROWTH_K = 3; // curve ki steepness (Figma jaisi convex curve)
const ROWS = 10;

// Figma ke y-axis labels: $0, $2.5M, $5M, $10M, $15M (equal spacing).
// Proper linear chahiye to [0, 0.25, 0.5, 0.75, 1] kar do.
const TICK_FRACS = [0, 1 / 6, 1 / 3, 2 / 3, 1];

const COLORS = { green: "#45A84A" };

type ModeKey = "Daily" | "30d" | "90d" | "All";
const MODE_KEYS: ModeKey[] = ["Daily", "30d", "90d", "All"];
const MODES: Record<ModeKey, { days: number; daily: boolean }> = {
  Daily: { days: 30, daily: true },
  "30d": { days: 30, daily: false },
  "90d": { days: 90, daily: false },
  All: { days: HISTORY_DAYS, daily: false },
};

// 30 BTC addresses, table mein bar bar isi order mein circulate hoti hain
const BTC_ADDRESSES = [
  "bc1q27zcvlq3580hw9s6thya72gglvdey6tjlkluuc",
  "bc1qjzx5v7aa8zrm324mr3l7yunrl9a3tc4n7f2mdr",
  "bc1q4kut9f2aww6ujgla0hhu7r6hnwmr5ufsf2hs68",
  "bc1q3y94xyt0zdvgt4hauaxgk8ltwv49apc44g4m3t",
  "bc1qykg45x3llnuu4pxvtn904qjareaxavs3pmvt0s",
  "bc1q8xz27c70r2ezlayr7ayzqqt43c05uv0yc47dt5",
  "bc1qaffvf4g3csdef97xsn9sjp79uhksznsy7nq9fd",
  "bc1q8c8704ztj5am80vn826q200dr8k5wf3rknjl09",
  "bc1qxw2rqesv0wcguun6xpfdshq42d6lkcvmru89zu",
  "bc1qejx2nrt6xrqcm2qeywuu4ymxcfch4n8dueuadl",
  "bc1qyerd74js042rhlup9qkl5eqf39395lhv7pz63n",
  "bc1qveu3c7u2mwrwf9p9avfuy3axhl96jfptqj2y92",
  "bc1qpnjsq63z2ryn7hy9agguxtgrhsqd2hc83fdz8n",
  "bc1qap7kcpx2yrqdsyzv2ps5d853x3836cny56375k",
  "bc1qd8sdrkva49j4tkvrn9d29zs6va6q5xg40he4w4",
  "bc1qe6mhu0dqxtry9ejqtf97ztnj4l23t45uq5hr4p",
  "bc1qmk00fl06j27tm9j344wyxawuje0ryfgr7gv7j5",
  "bc1q76097djmwpadk5073m7nd2xdtynjzz0yet6qns",
  "bc1q8yvm020zfwxcqyvyme2ghmc90l6c3q3z6k3zad",
  "bc1q09cg0n09el852ulxsuplduk7mqfu5a4pmnkaa2",
  "bc1q77md2t3s6enuqkcpc8edlmpegupl0qh5p8vy0d",
  "bc1qtp2auv3d2tld40j804nazwv08mt3uerxuk3f40",
  "bc1q26lrsqm9gufmeyk4zwzn5mlp420gflg3wued2z",
  "bc1qg4fzzywrqgvadrvnsyxrrzvdh00g0l3t0g0k68",
  "bc1qch03ll96r03scrmd9q9t2w2mkh7radqxtns8py",
  "bc1qcg9cka0zj39gpxd8z2qa30mv50wdsevxv4980f",
  "bc1qcxwrhtzdqdvndlmarxfy6kqjklj32ejvfslp5y",
  "bc1qt9xa6ufw0d6kheke9rqjq9sa9nu6ld384sz4xd",
  "bc1qn04dzaek7ynsjupkqhq2pvn7hq592pn9h0mueq",
  "bc1qxj9xer5umtx7hdjctz86uzfql7l8x39l2aghks",
];

const CHART_H = 400;
const PAD = { l: 58, t: 14, b: 40 };

/* ----------------------------- helpers ---------------------------- */

// deterministic hash: same index -> same amount/time, reload par bhi
function hash(n: number) {
  let h = Math.imul((n | 0) ^ 0x9e3779b9, 2654435761);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  return h >>> 0;
}

function amountOf(i: number) {
  const h = hash(i);
  return 900 + (h % 2000) + ((h >>> 12) % 100) / 100;
}

function avgTimeOf(i: number) {
  return 6 + (hash(i + 777) % 70) / 10;
}

function addrOf(i: number) {
  const n = BTC_ADDRESSES.length;
  return BTC_ADDRESSES[((i % n) + n) % n];
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}...${a.slice(-6)}`;
}

// Step n tak total payouts (har step par ek naya payout add hota hai)
function totalAt(step: number) {
  let t = BASE_TOTAL;
  for (let j = 1; j <= step; j++) t += amountOf(j);
  return t;
}

// normalized growth curve, G(0)=0, G(1)=1
function G(u: number) {
  return (Math.exp(GROWTH_K * u) - 1) / (Math.exp(GROWTH_K) - 1);
}

function trim(n: number) {
  return n.toFixed(1).replace(/\.0$/, "");
}

function formatMoney(v: number) {
  if (!isFinite(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1e9) return `$${trim(v / 1e9)}B`;
  if (a >= 1e6) return `$${trim(v / 1e6)}M`;
  if (a >= 1e3) return `$${trim(v / 1e3)}K`;
  return `$${Math.round(v)}`;
}

function formatFull(v: number) {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function niceCeil(v: number) {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (m * p >= v) return m * p;
  }
  return 10 * p;
}

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function timeAgo(ms: number) {
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  const d = Math.floor(h / 24);
  return `${d} ${d === 1 ? "day" : "days"} ago`;
}

// monotone cubic smooth path (overshoot nahi hota)
function monotonePath(p: [number, number][]) {
  const n = p.length;
  if (n < 2) return "";
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = p[i + 1][0] - p[i][0];
    m[i] = (p[i + 1][1] - p[i][1]) / (dx[i] || 1);
  }
  const t: number[] = new Array(n);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    t[i] = m[i - 1] * m[i] <= 0 ? 0 : (2 * m[i - 1] * m[i]) / (m[i - 1] + m[i]);
  }
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${p[i][0] + h},${p[i][1] + t[i] * h} ${p[i + 1][0] - h},${p[i + 1][1] - t[i + 1] * h} ${p[i + 1][0]},${p[i + 1][1]}`;
  }
  return d;
}

/* ------------------------------ main ------------------------------ */

export function FundedPayouts() {
  const [mode, setMode] = useState<ModeKey>("All");
  const [now, setNow] = useState(EPOCH);
  const [w, setW] = useState(0);
  const [hoverT, setHoverT] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // clock: 15s par refresh (payout step har 10 min par badalta hai)
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  // chart width
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const step = Math.max(0, Math.floor((now - EPOCH) / STEP_MS));
  const total = useMemo(() => totalAt(step), [step]);
  const dayIdx = Math.floor(now / DAY_MS);

  const { days, daily } = MODES[mode];

  const series = useMemo(() => {
    const out: number[] = [];
    if (daily) {
      for (let k = 0; k < days; k++) {
        const e = HISTORY_DAYS - days + k;
        const base = total * (G((e + 1) / HISTORY_DAYS) - G(e / HISTORY_DAYS));
        const noise = 0.8 + (0.4 * (hash(dayIdx - (days - 1 - k)) % 1000)) / 1000;
        out.push(base * noise);
      }
      return out;
    }
    const win = Math.min(days, HISTORY_DAYS);
    const u0 = 1 - win / HISTORY_DAYS;
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const u = u0 + ((1 - u0) * i) / N;
      out.push(total * (G(u) - G(u0)));
    }
    return out;
  }, [daily, days, total, dayIdx]);

  const yMax = niceCeil(Math.max(...series) * 0.98);

  const plotL = PAD.l;
  const plotW = Math.max(w - PAD.l, 0);
  const plotH = CHART_H - PAD.t - PAD.b;
  const plotR = plotL + plotW;
  const plotB = PAD.t + plotH;
  const curveW = Math.max(plotW - 7, 0); // end dot ke liye 7px jagah

  const xAt = (t: number) => plotL + t * curveW;
  const yAt = (v: number) => PAD.t + plotH * (1 - Math.min(v / yMax, 1.02));

  const n = series.length;
  const pts: [number, number][] = series.map((v, i) => [xAt(i / (n - 1)), yAt(v)]);
  const line = monotonePath(pts);
  const last = pts[pts.length - 1];
  const area = `${line} L${last[0]},${plotB} L${pts[0][0]},${plotB} Z`;

  const xLabels = Array.from({ length: 8 }, (_, i) => ({
    x: plotL + 19 + (i / 7) * Math.max(plotW - 48, 0),
    label: fmtDate(now - days * (1 - i / 7) * DAY_MS),
  }));

  let hover: { x: number; y: number; v: number } | null = null;
  if (hoverT !== null && n > 1) {
    const pos = hoverT * (n - 1);
    const i = Math.min(Math.floor(pos), n - 2);
    const v = series[i] + (series[i + 1] - series[i]) * (pos - i);
    hover = { x: xAt(hoverT), y: yAt(v), v };
  }

  const rows = Array.from({ length: ROWS }, (_, k) => {
    const i = step - k;
    return {
      i,
      age: now - (EPOCH + i * STEP_MS),
      addr: addrOf(i),
      amount: amountOf(i),
      avg: avgTimeOf(i),
    };
  });

  return (
    <section
      data-affiliate-page
      className="relative w-full px-6 pb-[120px] pt-[80px] md:px-20"
    >
      <div className="relative z-10">
        {/* header */}
        <div>
          <h2 className="text-[40px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[48px]">
            Funded Capital, Verified Payouts
          </h2>
          <p className="mt-6 max-w-[500px] text-[16px] leading-[21px] text-muted/90">
            Track capital allocated to funded accounts and explore verified
            payouts to traders, all in one place.
          </p>
        </div>

        {/* ------------------------ payout overview ------------------------ */}
        <div className="mt-[44px] border border-white/10  p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[12px] uppercase leading-none text-white">
                Payout overview
              </span>
              <span className="mt-[9px] block text-[10px] leading-none text-[#6f6b63]">
                Daily and total payouts recorded on-chain
              </span>
            </div>
            <div className="flex gap-[9px]">
              {MODE_KEYS.map((k) => {
                const active = k === mode;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setMode(k)}
                    className={cn(
                      "h-[40px] w-[79px] text-[11px] leading-none transition-colors",
                      active
                        ? "border border-white/30 bg-white/[0.12] text-white"
                        : "border border-transparent bg-white/[0.05] text-[#A8A39A] hover:text-white"
                    )}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            ref={boxRef}
            className="relative mt-[45px] w-full"
            style={{ height: CHART_H }}
          >
            {w > 0 && (
              <svg
                width={w}
                height={CHART_H}
                className="block overflow-visible font-sans"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const px = e.clientX - r.left;
                  if (px < plotL || px > plotR) return setHoverT(null);
                  setHoverT(Math.min(Math.max((px - plotL) / curveW, 0), 1));
                }}
                onMouseLeave={() => setHoverT(null)}
              >
                <defs>
                  <linearGradient id="payout-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.38} />
                    <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* grid + y labels */}
                {TICK_FRACS.map((f, i) => {
                  const y = PAD.t + plotH * (1 - f);
                  return (
                    <g key={i}>
                      <line
                        x1={plotL}
                        x2={plotR}
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.14)"
                        strokeDasharray="5 4"
                      />
                      <text x={0} y={y + 4} fontSize={11} fill="#4b4b4b">
                        {formatMoney(f * yMax)}
                      </text>
                    </g>
                  );
                })}

                {/* x labels */}
                {xLabels.map((l, i) => (
                  <text
                    key={i}
                    x={l.x}
                    y={plotB + 28}
                    fontSize={11}
                    fill="#6f6b63"
                    textAnchor="middle"
                  >
                    {l.label}
                  </text>
                ))}

                {/* area + line */}
                <path d={area} fill="url(#payout-area)" />
                <path
                  d={line}
                  fill="none"
                  stroke={COLORS.green}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* hover guide */}
                {hover && (
                  <line
                    x1={hover.x}
                    x2={hover.x}
                    y1={PAD.t}
                    y2={plotB}
                    stroke="rgba(255,255,255,0.25)"
                  />
                )}

                {/* end dot */}
                <circle cx={last[0]} cy={last[1]} r={7} fill={COLORS.green} />

                {hover && (
                  <circle
                    cx={hover.x}
                    cy={hover.y}
                    r={5}
                    fill={COLORS.green}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )}
              </svg>
            )}

            {/* tooltip */}
            {hover && hoverT !== null && (
              <div
                className="pointer-events-none absolute z-20 w-[190px] border border-white/10  p-3 text-[11px] leading-none text-[#A8A39A] shadow-xl backdrop-blur-[10px]"
                style={{
                  left: Math.min(hover.x + 14, Math.max(w - 200, 0)),
                  top: PAD.t + 10,
                }}
              >
                <div className="text-[13px] text-white">
                  {fmtDate(now - days * (1 - hoverT) * DAY_MS)}
                </div>
                <dl className="mt-3 flex items-center justify-between">
                  <dt className="text-[#6f6b63]">
                    {daily ? "Daily Payout" : "Total Payout"}
                  </dt>
                  <dd className="text-white">{formatFull(hover.v)}</dd>
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------ recent payouts ------------------------ */}
        <div className="mt-[44px] border border-white/10 ">
          <div className="flex items-start justify-between px-5 pt-5">
            <div>
              <span className="block text-[12px] uppercase leading-none text-white">
                Recent payouts
              </span>
              <span className="mt-[9px] block text-[10px] leading-none text-[#6f6b63]">
                Every payment recorded on-chain
              </span>
            </div>
            <a
              href="#"
              className="pt-[8px] text-[12px] leading-none text-[#A8A39A] underline underline-offset-2 transition-colors hover:text-white"
            >
              Verify every payment record
            </a>
          </div>

          <div className="mt-[24px] overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid h-[50px] grid-cols-[30.5%_33%_1fr_auto] items-center border-b border-white/[0.08] px-[18px] pr-[37px] text-[10px] uppercase leading-none text-[#6f6b63]">
                <span>Time</span>
                <span>TXID</span>
                <span>Avg payout time</span>
                <span>Amount</span>
              </div>

              {rows.map((r) => (
                <div
                  key={r.i}
                  className="grid h-[48px] grid-cols-[30.5%_33%_1fr_auto] items-center border-b border-white/[0.06] px-[18px] pr-[22px] text-[13px] leading-none last:border-b-0"
                >
                  <span className="text-[#A8A39A]">{timeAgo(r.age)}</span>
                  <span className="text-[#A8A39A]">{shortAddr(r.addr)}</span>
                  <span className="text-[#45A84A]">{r.avg.toFixed(1)}s</span>
                  <span className="text-[#45A84A]">
                    $
                    {r.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}