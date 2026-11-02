"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { EARNING_RANGES, earningsSeries, earningsSummary, type EarningRange } from "./data";
import { Panel, PanelTitle } from "./Panel";

// Plot geometry from Figma: 542×184 plot, $0–$40 at 4.6px per dollar, bars up to 32px.
const W = 542;
const H = 184;
const Y_MAX = 40;
const BAR_W = 10.7;
const BAR_MAX_H = 32;
const Y_TICKS = [40, 30, 20, 10, 0];
const X_LABEL_EVERY = 5;

const SERIES = {
  earnings: { label: "Earnings", color: "#99804A", chip: "border-gold-accent bg-gold-accent/[0.12]" },
  recurring: { label: "Recurring", color: "#1839DC", chip: "border-[#1839dc] bg-[#1839dc]/[0.12]" },
  signups: { label: "Signups", color: "#47A847", chip: "border-[#47a847] bg-[#47a847]/[0.12]" },
} as const;
type SeriesKey = keyof typeof SERIES;

const y = (v: number) => H - (v / Y_MAX) * H;

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
function smoothPath(pts: [number, number][]) {
  return pts.reduce((d, p, i, a) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const p0 = a[i - 2] ?? a[i - 1];
    const p1 = a[i - 1];
    const p2 = p;
    const p3 = a[i + 1] ?? p;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }, "");
}

export function EarningsCard() {
  const [range, setRange] = useState<EarningRange>("30d");
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({ earnings: true, recurring: true, signups: true });
  const [active, setActive] = useState(11); // Figma shows the Oct 11 tooltip
  const plotRef = useRef<HTMLDivElement>(null);

  // TODO(backend): fetch the series for `range`; mock data is the same for every range.
  const data = earningsSeries;
  const step = W / (data.length - 1);
  const maxSignups = Math.max(...data.map((d) => d.signups));

  const { earningsLine, earningsArea, recurringLine } = useMemo(() => {
    const e = data.map((d, i) => [i * step, y(d.earnings)] as [number, number]);
    const r = data.map((d, i) => [i * step, y(d.recurring)] as [number, number]);
    const line = e.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join(" ");
    return {
      earningsLine: line,
      earningsArea: `${line} L${W},${H} L0,${H} Z`,
      recurringLine: smoothPath(r),
    };
  }, [data, step]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const box = plotRef.current?.getBoundingClientRect();
    if (!box) return;
    const ratio = Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1);
    setActive(Math.round(ratio * (data.length - 1)));
  };

  const point = data[active];
  const pct = (active / (data.length - 1)) * 100;

  return (
    <Panel className="px-[16px] pb-[16px] pt-[16.7px] xl:min-h-[510px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PanelTitle>Earnings</PanelTitle>
        <div role="tablist" aria-label="Range" className="mt-[1.3px] flex gap-[9px]">
          {EARNING_RANGES.map((r) => (
            <button
              key={r}
              role="tab"
              type="button"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={cn(
                "flex h-[30.27px] w-[63.18px] items-center justify-center text-[10px] leading-normal text-white/50 transition-colors",
                range === r
                  ? "border-[0.7px] border-gold-accent bg-gold-accent/15"
                  : "border-[0.57px] border-white/[0.06] bg-white/[0.06] hover:text-white/80",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <dl className="mt-[18px] grid grid-cols-2 gap-y-4 border-b-2 border-white/[0.06] bg-white/[0.03] px-[17px] py-[15px] backdrop-blur-[5px] sm:min-h-[96px] sm:grid-cols-[158fr_155fr_130fr_115fr] sm:gap-y-0">
        {earningsSummary.map((s) => (
          <div key={s.label} className="leading-[1.3]">
            <dt className="text-[12px] text-white/50">{s.label}</dt>
            <dd className={cn("mt-[2px] text-[24px] tracking-[-0.48px]", s.positive ? "text-[#47a847]" : "text-white")}>{s.value}</dd>
            {s.sub && <dd className="mt-[2px] text-[12px] text-white/50">{s.sub}</dd>}
          </div>
        ))}
      </dl>

      {/* Series toggles */}
      <div className="mt-[18px] flex flex-wrap gap-[12px]">
        {(Object.keys(SERIES) as SeriesKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={visible[k]}
            onClick={() => setVisible((v) => ({ ...v, [k]: !v[k] }))}
            className={cn(
              "flex h-[28px] items-center gap-[5px] border-l px-[10px] text-[12px] leading-normal text-white/50 transition-opacity",
              SERIES[k].chip,
              !visible[k] && "opacity-40",
            )}
          >
            <span aria-hidden className="h-[5px] w-[5px] rounded-full" style={{ background: SERIES[k].color }} />
            {SERIES[k].label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative mt-[58px] h-[227px]">
        {Y_TICKS.map((t, i) => (
          <span key={t} className="absolute left-0 text-[12px] leading-[1.3] text-white/30" style={{ top: i * 46 }}>
            ${t}
          </span>
        ))}

        <div
          ref={plotRef}
          onPointerMove={onMove}
          className="absolute left-[33px] right-0 top-[9px] h-[184px] touch-none"
          aria-label="Earnings chart"
          role="img"
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="earn-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#99804A" stopOpacity="0.5" />
                <stop offset="0.5" stopColor="#99804A" stopOpacity="0" />
              </linearGradient>
            </defs>
            {Y_TICKS.map((t) => (
              <line key={t} x1="0" x2={W} y1={y(t)} y2={y(t)} stroke="white" strokeOpacity="0.1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            ))}
            {visible.earnings && (
              <>
                <path d={earningsArea} fill="url(#earn-fill)" />
                <path d={earningsLine} fill="none" stroke={SERIES.earnings.color} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </>
            )}
            {visible.recurring && (
              <path d={recurringLine} fill="none" stroke={SERIES.recurring.color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            )}
            {visible.signups &&
              data.map((d, i) => {
                const h = (d.signups / maxSignups) * BAR_MAX_H;
                const x = Math.min(Math.max(i * step - BAR_W / 2, 0), W - BAR_W);
                return <rect key={d.date} x={x} y={H - 1 - h} width={BAR_W} height={h} fill={SERIES.signups.color} />;
              })}
          </svg>

          {/* Crosshair + markers */}
          <div className="pointer-events-none absolute bottom-[1px] top-[-35px] w-px -translate-x-1/2 bg-white/30" style={{ left: `${pct}%` }} />
          {visible.earnings && <Marker color={SERIES.earnings.color} left={pct} top={y(point.earnings)} />}
          {visible.recurring && <Marker color={SERIES.recurring.color} left={pct} top={y(point.recurring)} />}

          {/* Tooltip */}
          <div
            className="pointer-events-none absolute top-[-49px] w-[141px] -translate-x-1/2 border-[0.7px] border-white/[0.13] bg-ink px-[12.3px] pb-[8px] pt-[8.3px] backdrop-blur-[5px]"
            style={{ left: `clamp(70px, ${pct}%, calc(100% - 70px))` }}
          >
            <p className="text-[10px] leading-normal text-white">{point.date}</p>
            <ul className="mt-[3px] space-y-[3px] text-[12px] leading-normal">
              {(Object.keys(SERIES) as SeriesKey[]).map((k) => (
                <li key={k} className="flex items-center gap-[5px]">
                  <span aria-hidden className="h-[8px] w-[8px] rounded-full" style={{ background: SERIES[k].color }} />
                  <span className="text-white/50">{SERIES[k].label}</span>
                  <span className="ml-auto text-white">{k === "signups" ? point[k] : `$${Math.round(point[k])}`}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {data.map((d, i) =>
          i % X_LABEL_EVERY === 1 ? (
            <span
              key={d.date}
              className="absolute top-[211px] -translate-x-1/2 whitespace-nowrap text-[12px] leading-[1.3] text-white/30"
              style={{ left: `calc(33px + (100% - 33px) * ${i / (data.length - 1)})` }}
            >
              {d.date}
            </span>
          ) : null,
        )}
      </div>
    </Panel>
  );
}

function Marker({ color, left, top }: { color: string; left: number; top: number }) {
  return (
    <span
      className="pointer-events-none absolute flex h-[10.9px] w-[10.9px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white"
      style={{ left: `${left}%`, top: `${(top / H) * 100}%` }}
    >
      <span className="h-[7.1px] w-[7.1px] rounded-full" style={{ background: color }} />
    </span>
  );
}
