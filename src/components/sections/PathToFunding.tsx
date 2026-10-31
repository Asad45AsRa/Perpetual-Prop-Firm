"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------- config ----------------------------- */

const STEP_MS = 10 * 60 * 1000; // har 10 minute
const DAY_MS = 24 * 60 * 60 * 1000;

// Fixed anchor: step count isi se nikalta hai, is liye reload par bhi same value rehti hai
const EPOCH = Date.UTC(2026, 9, 31);

// 3 up, 2 down, 4 up, 1 down -> phir loop
const PATTERN = [1, 1, 1, -1, -1, 1, 1, 1, 1, -1];

const BASE = { signups: 10000, demo: 2700, paid: 1500 };

// har step par move ka size [min, max]
const STEP_SIZE = {
  signups: [2, 4],
  demo: [1, 2],
  paid: [1, 1],
} as const;

const RANGES = {
  30: { days: 30, scale: 1 },
  90: { days: 90, scale: 2.4 },
} as const;
type RangeKey = keyof typeof RANGES;

// signups right axis (0-10K) par plot hota hai, baqi left axis (0-4K) par
const RIGHT_AXIS_RATIO = 2.5;

const COLORS = {
  green: "#45A84A",
  blue: "#1A35E0",
  gold: "#9C8250",
  orange: "#DB571C",
  white: "#FFFFFF",
};

// Figma curve ka shape: [t (0..1 time), fraction of final value]
type Profile = [number, number][];
const P_SIGNUPS: Profile = [
  [0, 0], [0.202, 0.375], [0.326, 0.455], [0.442, 0.39], [0.527, 0.54],
  [0.651, 0.55], [0.729, 0.75], [0.881, 0.75], [1, 1],
];
const P_DEMO: Profile = [
  [0, 0], [0.248, 0.466], [0.341, 0.44], [0.462, 0.407], [0.574, 0.44],
  [0.659, 0.655], [0.729, 0.75], [0.938, 0.75], [1, 1],
];
const P_PAID: Profile = [
  [0, 0], [0.229, 0.16], [0.333, 0.38], [0.465, 0.33], [0.589, 0.48],
  [0.679, 0.44], [0.752, 0.73], [0.899, 0.85], [1, 1],
];

const SERIES = [
  { key: "signups", name: "Signups", color: COLORS.green, profile: P_SIGNUPS, axis: 1 / RIGHT_AXIS_RATIO },
  { key: "demo", name: "Demo", color: COLORS.blue, profile: P_DEMO, axis: 1 },
  { key: "paid", name: "Paid", color: COLORS.gold, profile: P_PAID, axis: 1 },
] as const;

// Donut (all-time)
const DONUT = [
  { key: "signed", pct: 48, color: COLORS.white, text: "#1c1c1c" },
  { key: "funded", pct: 14, color: COLORS.green, text: "#fff" },
  { key: "eval", pct: 18, color: COLORS.blue, text: "#fff" },
  { key: "failed", pct: 10, color: COLORS.gold, text: "#fff" },
  { key: "payout", pct: 10, color: COLORS.orange, text: "#fff" },
];

const CHART_H = 396;
const PAD = { l: 38, r: 44, t: 15, b: 40 };

/* ----------------------------- helpers ---------------------------- */

function mag(j: number, [lo, hi]: readonly [number, number] | readonly number[], seed: number) {
  return lo + ((j * 7 + seed) % (hi - lo + 1));
}

// Step n tak ki total values (pattern loop ke saath)
function liveTotals(step: number) {
  let signups = BASE.signups;
  let demo = BASE.demo;
  let paid = BASE.paid;
  for (let j = 1; j <= step; j++) {
    const dir = PATTERN[(j - 1) % PATTERN.length];
    signups += dir * mag(j, STEP_SIZE.signups, 0);
    demo += dir * mag(j, STEP_SIZE.demo, 3);
    paid += dir * mag(j, STEP_SIZE.paid, 5);
  }
  return { signups, demo, paid };
}

function pickStep(maxVal: number) {
  for (let p = 0; p < 9; p++) {
    for (const m of [1, 2, 2.5, 5]) {
      const step = m * Math.pow(10, p);
      if (step * 4 * 1.02 >= maxVal) return step;
    }
  }
  return maxVal / 4;
}

function axisLabel(v: number) {
  if (v >= 1000) return `${Math.round(v / 1000)}K`;
  return `${Math.round(v)}`;
}

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function valueAt(profile: Profile, t: number) {
  for (let i = 1; i < profile.length; i++) {
    if (t <= profile[i][0]) {
      const [t0, v0] = profile[i - 1];
      const [t1, v1] = profile[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
    }
  }
  return profile[profile.length - 1][1];
}

// monotone cubic smooth path (plateaus bina overshoot ke)
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

export function PathToFunding() {
  const [range, setRange] = useState<RangeKey>(30);
  const [now, setNow] = useState(EPOCH);
  const [w, setW] = useState(0);
  const [hoverT, setHoverT] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Har 10 minute par naya step
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const tick = () => {
      const n = Date.now();
      setNow(n);
      const s = Math.max(0, Math.floor((n - EPOCH) / STEP_MS));
      const next = EPOCH + (s + 1) * STEP_MS;
      id = setTimeout(tick, Math.max(next - n, 1000));
    };
    tick();
    return () => clearTimeout(id);
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
  const live = useMemo(() => liveTotals(step), [step]);

  const { days, scale } = RANGES[range];
  const totals = {
    signups: live.signups * scale,
    demo: live.demo * scale,
    paid: live.paid * scale,
  };
  const convPct = totals.signups > 0 ? (totals.paid / totals.signups) * 100 : 0;

  // axes
  const leftMax4 = Math.max(totals.signups / RIGHT_AXIS_RATIO, totals.demo, totals.paid);
  const axisStep = pickStep(leftMax4);
  const axisMax = axisStep * 4;

  const plotL = PAD.l;
  const plotW = Math.max(w - PAD.l - PAD.r, 0);
  const plotH = CHART_H - PAD.t - PAD.b;
  const plotR = plotL + plotW;
  const yOf = (leftVal: number) => PAD.t + plotH * (1 - leftVal / axisMax);

  const paths = SERIES.map((s) => {
    const total = totals[s.key];
    const pts: [number, number][] = s.profile.map(([t, f]) => [
      plotL + t * plotW,
      yOf(f * total * s.axis),
    ]);
    return { ...s, d: monotonePath(pts), end: pts[pts.length - 1] };
  });

  const xLabels = Array.from({ length: 8 }, (_, i) => {
    const x = plotL + 20 + (i / 7) * Math.max(plotW - 35, 0);
    const ms = now - (days - days * (i / 7)) * DAY_MS;
    return { x, label: fmtDate(ms) };
  });

  const hoverX = hoverT === null ? 0 : plotL + hoverT * plotW;
  const hoverVals =
    hoverT === null
      ? null
      : SERIES.map((s) => ({
          ...s,
          v: valueAt(s.profile, hoverT) * totals[s.key],
        }));

  return (
    <section
      data-affiliate-page
      className="relative w-full px-6 pb-[120px] pt-[80px] md:px-20"
    >
      <div className="relative z-10">
        {/* header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-[40px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[48px]">
            The Path To Funding
          </h2>
          <p className="mt-6 max-w-[490px] text-[16px] leading-[21px] text-muted/90">
            See how traders move from signup to funded status. Track their
            progress over time and view conversion rates across every stage of
            the journey.
          </p>
        </div>

        <div className="mt-[56px] grid grid-cols-1 gap-6 md:grid-cols-[1.55fr_1fr]">
          {/* ------------------------- left card ------------------------- */}
          <div className="border border-white/10 bg-[#141414] p-5">
            <div className="flex items-start justify-between">
              <span className="pt-[5px] text-[10px] uppercase leading-none tracking-[0.02em] text-[#6f6b63]">
                Signup to paid conversion
              </span>
              <div className="flex gap-[9px]">
                {([30, 90] as RangeKey[]).map((r) => {
                  const active = r === range;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRange(r)}
                      className={cn(
                        "h-[38px] w-[81px] text-[11px] leading-none transition-colors",
                        active
                          ? "border border-white/30 bg-white/[0.12] text-white"
                          : "border border-transparent bg-white/[0.05] text-[#A8A39A] hover:text-white"
                      )}
                    >
                      {r}d
                    </button>
                  );
                })}
              </div>
            </div>

            {/* stats */}
            <div className="mt-[18px] grid grid-cols-2 gap-[18px] md:grid-cols-4">
              <Stat
                value={Math.round(totals.signups).toLocaleString("en-US")}
                label="Total Signups"
                color={COLORS.green}
              />
              <Stat
                value={Math.round(totals.demo).toLocaleString("en-US")}
                label="Demo Accounts"
                color={COLORS.blue}
              />
              <Stat
                value={Math.round(totals.paid).toLocaleString("en-US")}
                label="Paid Accounts"
                color={COLORS.gold}
              />
              <Stat
                value={`${Math.round(convPct)}%`}
                label="Signup to Paid"
                color={COLORS.white}
                valueColor="#fff"
              />
            </div>

            {/* chart */}
            <div
              ref={boxRef}
              className="relative mt-[29px] w-full"
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
                    setHoverT((px - plotL) / plotW);
                  }}
                  onMouseLeave={() => setHoverT(null)}
                >
                  {/* grid + axis labels */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const y = PAD.t + plotH * (1 - i / 4);
                    return (
                      <g key={i}>
                        <line
                          x1={plotL - 5}
                          x2={plotR + 10}
                          y1={y}
                          y2={y}
                          stroke="rgba(255,255,255,0.14)"
                          strokeDasharray="5 4"
                        />
                        <text x={0} y={y + 4} fontSize={11} fill="#4b4b4b">
                          {axisLabel(i * axisStep)}
                        </text>
                        <text x={plotR + 22} y={y + 4} fontSize={11} fill="#4b4b4b">
                          {axisLabel(i * axisStep * RIGHT_AXIS_RATIO)}
                        </text>
                      </g>
                    );
                  })}

                  {/* x labels */}
                  {xLabels.map((l, i) => (
                    <text
                      key={i}
                      x={l.x}
                      y={PAD.t + plotH + 27}
                      fontSize={11}
                      fill="#6f6b63"
                      textAnchor="middle"
                    >
                      {l.label}
                    </text>
                  ))}

                  {/* hover guide */}
                  {hoverVals && (
                    <line
                      x1={hoverX}
                      x2={hoverX}
                      y1={PAD.t}
                      y2={PAD.t + plotH}
                      stroke="rgba(255,255,255,0.25)"
                    />
                  )}

                  {/* lines */}
                  {paths.map((p) => (
                    <path
                      key={p.key}
                      d={p.d}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}

                  {/* end dots */}
                  {paths.map((p) => (
                    <circle
                      key={p.key}
                      cx={p.end[0]}
                      cy={p.end[1]}
                      r={6}
                      fill={p.color}
                      stroke="#fff"
                      strokeWidth={3}
                    />
                  ))}

                  {/* hover dots */}
                  {hoverVals &&
                    hoverVals.map((s) => (
                      <circle
                        key={s.key}
                        cx={hoverX}
                        cy={yOf(s.v * s.axis)}
                        r={5}
                        fill={s.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                </svg>
              )}

              {/* tooltip */}
              {hoverVals && hoverT !== null && (
                <div
                  className="pointer-events-none absolute z-20 w-[190px] border border-white/10 bg-[#161616]/95 p-3 text-[11px] leading-none text-[#A8A39A] shadow-xl backdrop-blur-[10px]"
                  style={{
                    left: Math.min(hoverX + 14, Math.max(w - 200, 0)),
                    top: PAD.t + 10,
                  }}
                >
                  <div className="text-[13px] text-white">
                    {fmtDate(now - days * (1 - hoverT) * DAY_MS)}
                  </div>
                  <dl className="mt-3 flex flex-col gap-[9px]">
                    {hoverVals.map((s) => (
                      <div key={s.key} className="flex items-center justify-between">
                        <dt className="flex items-center gap-[6px] text-[#6f6b63]">
                          <span
                            className="inline-block h-[6px] w-[6px]"
                            style={{ background: s.color }}
                          />
                          {s.name}
                        </dt>
                        <dd className="text-white">
                          {Math.round(s.v).toLocaleString("en-US")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* ------------------------ right card ------------------------- */}
          <div className="border border-white/10 bg-[#141414] p-5">
            <span className="block pt-[5px] text-[10px] uppercase leading-none tracking-[0.02em] text-[#6f6b63]">
              All-time · From paid evaluation to payout
            </span>

            <div className="mt-[30px] flex justify-center">
              <Donut />
            </div>

            <div className="mt-[30px] flex flex-col gap-[26px]">
              <LegendItem
                color={COLORS.white}
                title="Signed Up Only"
                sub="Registered without a paid evaluation"
              />
              <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-y-[26px]">
                <LegendItem
                  color={COLORS.blue}
                  title="In Evaluation"
                  sub="Currently completing an evaluation"
                />
                <LegendItem
                  color={COLORS.orange}
                  title="Payout Received"
                  sub="Traders who received a payout"
                />
                <LegendItem
                  color={COLORS.green}
                  title="Funded, Awaiting Payout"
                  sub="Funded traders yet to receive a payout"
                />
                <LegendItem
                  color={COLORS.gold}
                  title="Evaluation Unsuccessful"
                  sub="Did not qualify for funding"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- sub components ----------------------- */

function Stat({
  value,
  label,
  color,
  valueColor,
}: {
  value: string;
  label: string;
  color: string;
  valueColor?: string;
}) {
  return (
    <div
      className="flex h-[72px] flex-col items-center justify-center border-b-2 bg-white/[0.06]"
      style={{ borderBottomColor: color }}
    >
      <span
        className="text-[18px] leading-none"
        style={{ color: valueColor ?? color }}
      >
        {value}
      </span>
      <span className="mt-[8px] text-[11px] leading-none text-[#A8A39A]">
        {label}
      </span>
    </div>
  );
}

function LegendItem({
  color,
  title,
  sub,
}: {
  color: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-[10px]">
      <span className="h-[44px] w-[4px] shrink-0" style={{ background: color }} />
      <div className="flex flex-col gap-[8px]">
        <span className="text-[13px] leading-none text-white">{title}</span>
        <span className="text-[11px] leading-none text-[#6f6b63]">{sub}</span>
      </div>
    </div>
  );
}

function Donut() {
  const C = 150;
  const R = 142;
  const r = 88;
  const corner = 9; // rounded corners
  const gap = 6;
  const h = gap / 2 + corner;
  const Ro = R - corner;
  const Ri = r + corner;
  const pt = (a: number, rad: number): [number, number] => [
    C + rad * Math.sin(a),
    C - rad * Math.cos(a),
  ];

  let acc = 0;
  const segs = DONUT.map((s) => {
    const a0 = (acc / 100) * Math.PI * 2;
    acc += s.pct;
    const a1 = (acc / 100) * Math.PI * 2;
    const dO = h / Ro;
    const dI = h / Ri;
    const A = pt(a0 + dO, Ro);
    const B = pt(a1 - dO, Ro);
    const Cc = pt(a1 - dI, Ri);
    const D = pt(a0 + dI, Ri);
    const large = a1 - dO - (a0 + dO) > Math.PI ? 1 : 0;
    const d = `M${A[0]},${A[1]} A${Ro},${Ro} 0 ${large} 1 ${B[0]},${B[1]} L${Cc[0]},${Cc[1]} A${Ri},${Ri} 0 ${large} 0 ${D[0]},${D[1]} Z`;
    const mid = (a0 + a1) / 2;
    const [tx, ty] = pt(mid, (R + r) / 2);
    return { ...s, d, tx, ty };
  });

  return (
    <svg viewBox="0 0 300 300" width={300} height={300} className="block max-w-full">
      {segs.map((s) => (
        <path
          key={s.key}
          d={s.d}
          fill={s.color}
          stroke={s.color}
          strokeWidth={corner * 2}
          strokeLinejoin="round"
        />
      ))}
      {segs.map((s) => (
        <text
          key={`t-${s.key}`}
          x={s.tx}
          y={s.ty}
          fontSize={13}
          fill={s.text}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {s.pct}%
        </text>
      ))}
    </svg>
  );
}