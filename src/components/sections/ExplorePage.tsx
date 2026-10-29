"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ---------- Funding diagram data ---------- */
// Diagram canvas: 1060 x 360 (sab positions isi ke hisaab se hain)
const CARDS = [
  { icon: "Exp1", value: "$500,000", label: "Max total funding", left: 0, top: 241 },
  { icon: "Exp2", value: "80%", label: "Profit split", left: 243, top: 280 },
  { icon: "Exp3", value: "5,233", label: "Active traders", left: 623, top: 280 },
  { icon: "Exp4", value: "24 Hours", label: "Payout settle", left: 867, top: 241 },
];

// Ring center (530, 78), radius 78
const LINES = [
  {
    d: "M 501.8 146.3 C 488.6 199 403.9 188.2 372.9 191 C 355 190.9 244 190.9 226.1 191.8 C 196.7 193.1 108.3 191 97.5 241",
    g: { x1: 500, y1: 0, x2: 97.5, y2: 0 },
    pulse: "#E8D39A",
  },
  {
    d: "M 525.6 151.9 C 513.3 198.6 475.3 214.6 430.9 217.9 C 393.7 219.3 337.2 227.3 340.5 280",
    g: { x1: 0, y1: 152, x2: 0, y2: 280 },
    pulse: "#FFFFFF",
  },
  {
    d: "M 533.3 151.9 C 545.5 198.7 583.5 214.6 627.9 217.9 C 669.1 220.6 715.5 224.6 720.5 280",
    g: { x1: 0, y1: 152, x2: 0, y2: 280 },
    pulse: "#FFFFFF",
  },
  {
    d: "M 556.9 146.3 C 570 199 654.8 188.2 685.8 191 C 703.7 190.9 814.7 190.9 832.6 191.8 C 863.8 193.2 949.3 191 961.5 241",
    g: { x1: 559, y1: 0, x2: 961.5, y2: 0 },
    pulse: "#E8D39A",
  },
];

const u = (n: number) => `calc(${n} * var(--u))`;

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

function StatCard({ icon, value, label }: (typeof CARDS)[number]) {
  return (
    <div
      className="flex h-full w-full items-center border-b border-[#99804A] bg-white/[0.05] text-left"
      style={{ gap: u(10), paddingLeft: u(18), paddingRight: u(18) }}
    >
      {/* PNG mein box + coin dono hain, isliye koi extra wrapper nahi */}
      <Image
        src={`/images/explore/box/${icon}.png`}
        alt=""
        width={84}
        height={84}
        unoptimized
        className="shrink-0 select-none"
        style={{ width: u(42), height: u(42) }}
      />
      <div className="whitespace-nowrap" style={{ paddingBottom: u(3) }}>
        <div className="font-normal text-white" style={{ fontSize: u(24), lineHeight: 0.86 }}>
          {value}
        </div>
        <div className="text-muted" style={{ marginTop: u(12), fontSize: u(14), lineHeight: 0.86 }}>
          {label}
        </div>
      </div>
    </div>
  );
}
/* ---------- Markets carousel data ---------- */
const SLIDES = [
  { src: "/images/explore/box2/box1.png", alt: "Gold Commodities" },
  { src: "/images/explore/box2/box2.png", alt: "BTC Crypto" },
  { src: "/images/explore/box2/box3.png", alt: "NVDA Stocks" },
];

const TAGS = ["Crypto", "Commodities", "Indices", "FX", "Stocks"];

// Figma canvas: 680 x 300 (bara = 305, chhota = 158)
const CW = 680;
const CH = 300;

function slideStyle(offset: number, n: number): React.CSSProperties {
  const isCenter = offset === 0;
  const isRight = offset === 1;
  const isLeft = offset === n - 1;
  const visible = isCenter || isRight || isLeft;

  const size = isCenter ? 285 : 148;
  const left = isCenter ? 197.5 : isLeft ? 19.5 : 512.5;
  const top = isCenter ? 7.5 : 76;

  return {
    left: `${(left / CW) * 100}%`,
    top: `${(top / CH) * 100}%`,
    width: `${(size / CW) * 100}%`,
    opacity: visible ? (isCenter ? 1 : 0.9) : 0,
    zIndex: isCenter ? 10 : 1,
    pointerEvents: "none",
  };
}

/* ---------- Payouts table data ---------- */
// 6 addresses, 5 rows dikhti hain (beech wali active). Har PAYOUT_INTERVAL ms baad rotate.
const PAYOUTS = [
  { address: "0x0b6a..861f", amount: "+$1,789" },
  { address: "0x7c3e..a2d4", amount: "+$2,450" },
  { address: "0x91fd..3b07", amount: "+$980" },
  { address: "0x4a28..c9e1", amount: "+$3,120" },
  { address: "0xd5b0..6f72", amount: "+$1,265" },
  { address: "0x2e8c..14ab", amount: "+$4,075" },
];
const PAYOUT_INTERVAL = 10000; // 10 seconds
const ROW_H = 41;
const VISIBLE_ROWS = 5;
const ACTIVE_SLOT = 2;
// slot 0..4 ke liye: bahar ki rows narrow, beech wali sabse wide
const SLOT_INSET = [34, 17, 0, 17, 34];
const SLOT_OPACITY = [0.18, 1, 1, 1, 0.18];
const SLOT_H = [35, 36, 41, 36, 35];
const SLOT_TOP = [0, 35, 71, 112, 148];
const TABLE_H = 183;

const PILLS = ["24/7 withdrawals", "Instant payouts Avg time 8.3s"];

export function ExplorePage() {
  // BTC beech mein se start hota hai
  const [active, setActive] = useState(1);
  const n = SLIDES.length;

  const [diagramRef, seen] = useInView<HTMLDivElement>();

  // Payouts rotation: tick badhta hai, settled = exit animation poora hone ka flag
  const [tick, setTick] = useState(0);
  const [settled, setSettled] = useState(true);
  const pn = PAYOUTS.length;

  useEffect(() => {
    return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 3000);
    return () => clearInterval(id);
  }, [n]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      setTick((k) => k + 1);
      setSettled(false);
      if (t) clearTimeout(t);
      t = setTimeout(() => setSettled(true), 900);
    }, PAYOUT_INTERVAL);
    return () => {
      clearInterval(id);
      if (t) clearTimeout(t);
    };
  }, []);

  return (
    <main className="min-h-screen font-sans text-foreground mt-5">
      {/* Figma frame: 1440px centered, 80px side padding (px-6 mobile / lg:px-20) */}
      <section className="mx-auto flex w-full max-w-none flex-col items-center px-10 py-20 text-center lg:px-20">
        {/* ===== Funding diagram ===== */}
        <div className="flex w-full flex-col items-center">
          <h2 className="max-w-[650px] text-[40px] font-normal leading-[0.94] tracking-[-0.05em] text-white md:text-[56px]">
            Built For The Next Generation Of Perp Traders
          </h2>
          <p className="mt-5 max-w-[520px] text-[15px] leading-[21px] text-muted/80">
            Trade perpetual markets on-chain with transparent rules, reliable
            data, and the tools to track your performance from start to finish.
          </p>

          {/* ---- Desktop / tablet: Figma diagram ---- */}
          <div
            ref={diagramRef}
            data-on={seen}
            className="diagram relative mt-8 aspect-[1060/360] w-full max-w-[1060px] [container-type:inline-size] md:block"
            style={{ "--u": "calc(100cqw / 1060)" } as React.CSSProperties}
          >
            <style>{`
      .wire-draw { stroke-dasharray: 1; stroke-dashoffset: 1; }
.diagram[data-on="true"] .wire-draw { animation: wire-loop 1.2s ease-in-out forwards; }
@keyframes wire-loop {
  0%   { stroke-dashoffset: 1; }
  100% { stroke-dashoffset: 0; }
}
    `}</style>

            <svg viewBox="0 0 1060 360" className="absolute inset-0 h-full w-full overflow-visible" fill="none" aria-hidden>
              <defs>
                {LINES.map((l, i) => (
                  <linearGradient key={i} id={`wire-g-${i}`} gradientUnits="userSpaceOnUse" {...l.g}>
                    <stop offset="0" stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#99804A" />
                  </linearGradient>
                ))}
              </defs>
              {LINES.map((l, i) => (
                <path
                  key={i}
                  d={l.d}
                  pathLength={1}
                  className="wire-draw"
                  stroke={`url(#wire-g-${i})`}
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Ring: wires iske neeche se nikalti hain */}
            <div
              className="absolute z-[2]"
              style={{ left: "calc(529.5 / 1060 * 100%)", top: 0, width: "15.9%", transform: "translateX(-50%)" }}
            >
              <Image
                src="/images/explore/box/ringlogo.png"
                alt="Logo"
                width={156}
                height={156}
                priority
                className="h-auto w-full"
              />
            </div>

            {/* 4 cards: wire pahunchne par fade-in */}
            {CARDS.map((c, i) => (
              <div
                key={c.icon}
                className="absolute z-[1] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
                style={{
                  left: `${(c.left / 1060) * 100}%`,
                  top: `${(c.top / 360) * 100}%`,
                  width: `${(195 / 1060) * 100}%`,
                  height: `${(80 / 360) * 100}%`,
                  opacity: seen ? 1 : 0,
                  transform: seen ? "none" : "translateY(8px)",
                  transitionDelay: `${1.0 + i * 0.12}s`,
                }}
              >
                <StatCard {...c} />
              </div>
            ))}
          </div>

          {/* ---- Mobile: wires ki jagah simple stack (layout na toote) ---- */}
          <div
            className="mt-8 flex w-full flex-col items-center gap-8 md:hidden"
            style={{ "--u": "1px" } as React.CSSProperties}
          >
            <Image src="/images/explore/box/ringlogo.png" alt="Logo" width={156} height={156} className="h-auto w-[120px]" />
            <div className="grid w-full max-w-[440px] grid-cols-1 gap-3 sm:grid-cols-2">
              {CARDS.map((c) => (
                <div key={c.icon} className="h-[80px]">
                  <StatCard {...c} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Trade On Perpetual Markets ===== */}
        <div className="mt-48 flex w-full flex-col gap-12 text-left lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* Left: content */}
          <div className="w-full max-w-[470px]">
            <h2 className="text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-white md:text-[56px]">
              Trade On Perpetual Markets, 24/7
            </h2>
            <p className="mt-6 max-w-[430px] text-[15px] leading-relaxed text-muted/80">
              A powerful trading terminal with built-in analytics and risk
              tools. Trade crypto, equities, and commodities around the clock,
              with liquidity powered by Hyperliquid.
            </p>

            <div className="mt-8 flex max-w-[430px]  flex-wrap gap-3">
              {TAGS.map((t) => (
                <span
                  key={t}
                  className="border border-white/10 bg-white/[0.06] px-7 py-3 text-sm leading-none font-[50px] text-white/80"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="group mt-8 inline-flex items-center gap-2">
              <a
                href="#"
                className="text-sm text-muted/80 underline underline-offset-4 transition-colors group-hover:text-white"
              >
                Browse All Markets
              </a>
              <span
                aria-hidden
                className="text-sm text-muted/80 transition-colors group-hover:text-white"
              >
                ↗
              </span>
            </div>
          </div>

          {/* Right: rotating boxes */}
          <div className="flex w-full max-w-[680px] flex-col items-center lg:-mr-[20px]">
            <div
              className="relative w-full"
              style={{ aspectRatio: `${CW} / ${CH}` }}
            >
              {SLIDES.map((s, i) => {
                const offset = (i - active + n) % n;
                return (
                  <div
                    key={s.src}
                    className="absolute aspect-square transition-all duration-700 ease-in-out"
                    style={slideStyle(offset, n)}
                  >
                    <Image
                      src={s.src}
                      alt={s.alt}
                      fill
                      sizes="(min-width: 1024px) 305px, 45vw"
                      className="object-contain"
                      priority={i === 1}
                    />
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            <div className="mt-6 flex items-center gap-2">
              {SLIDES.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  aria-label={`Show ${s.alt}`}
                  onClick={() => setActive(i)}
                  className={`h-[3px] transition-all duration-500 ${i === active ? "w-8 bg-gold-accent" : "w-5 bg-white/15"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ===== Payouts section ===== */}
        <div className="mt-24 flex w-full flex-col gap-12 text-left lg:mt-[200px] lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* Left: payouts table */}
          <div className="w-full max-w-[455px] lg:shrink-0">
            {/* Legend: Figma mein table ke upar center */}
            <div className="mb-3 flex items-center justify-center gap-6 text-[12px] text-muted/80">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_2px_rgba(34,197,94,0.9),0_0_12px_4px_rgba(34,197,94,0.4)]" />
                Live Payouts
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#99804A] shadow-[0_0_6px_2px_rgba(153,128,74,0.7),0_0_12px_4px_rgba(153,128,74,0.3)]" />
                Perpetual Funding
              </span>
            </div>

            {/* Rotating rows: har row absolute hai, slot ke hisaab se move hoti hai */}
            <div className="relative w-full" style={{ height: TABLE_H }}>
              <div
                className="absolute border border-white/10 bg-white/[0.02]"
                style={{
                  left: 34,
                  right: 34,
                  top: 0,
                  height: TABLE_H,
                  clipPath: `polygon(0 0, 100% 0, 100% ${SLOT_TOP[1]}px, 0 ${SLOT_TOP[1]}px, 0 ${SLOT_TOP[1] + SLOT_H[1] + SLOT_H[2] + SLOT_H[3]}px, 100% ${SLOT_TOP[1] + SLOT_H[1] + SLOT_H[2] + SLOT_H[3]}px, 100% 100%, 0 100%)`,
                }}
              />
              <div
                className="absolute border border-white/10 bg-white/[0.03]"
                style={{ left: 17, right: 17, top: SLOT_TOP[1], height: SLOT_H[1] + SLOT_H[2] + SLOT_H[3] }}
              />

              {PAYOUTS.map((p, i) => {
                const rel = (((i - tick) % pn) + pn) % pn;
                const slot = rel === pn - 1 ? (settled ? pn - 1 : -1) : rel;
                const inView = slot >= 0 && slot < VISIBLE_ROWS;
                const inset = inView ? SLOT_INSET[slot] : 34;
                const opacity = inView ? SLOT_OPACITY[slot] : 0;
                const h = inView ? SLOT_H[slot] : SLOT_H[0];
                const top = slot < 0 ? -SLOT_H[0] : inView ? SLOT_TOP[slot] : TABLE_H;
                const isActive = slot === ACTIVE_SLOT;

                return (
                  <div
                    key={p.address}
                    className="absolute text-sm transition-[top,height,left,right,opacity] duration-700 ease-in-out motion-reduce:transition-none"
                    style={{ left: inset, right: inset, top, height: h, opacity }}
                  >
                    {/* active gold bg */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-[#99804A] to-white transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`}
                    />
                    <div className="relative flex h-full items-center justify-between px-[41px]">
                      <span className={`transition-colors duration-700 ${isActive ? "text-black" : "text-white/60"}`}>
                        {p.address}
                      </span>
                      <span className={`transition-colors duration-700 ${isActive ? "text-green-500" : "text-green-500"}`}>
                        {p.amount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: content */}
          <div className="w-full lg:w-[650px] lg:shrink-0">
            <h2 className="text-[40px] font-normal leading-[1] tracking-[-0.03em] text-white md:text-[53px]">
              Get Paid On-Chain In Seconds, Without Waiting For Approval
            </h2>
            <p className="mt-4 max-w-[540px] text-[15px] leading-relaxed text-muted/80">
              Trade, hit your targets, and get rewarded. Smart contracts handle
              the payouts, delivering a faster, transparent experience with no
              manual approvals.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {PILLS.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-[6.9px] border-[0.64px] border-white/20 bg-white/[0.06] px-[28.5px] py-[13.5px] text-[14px] font-[5px] leading-none text-white/80 backdrop-blur-[14px]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}