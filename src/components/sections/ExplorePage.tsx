"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
  { d: "M 500 150 C 492 195, 440 200, 380 200 L 190 200 C 120 200, 97 215, 97 241", gold: true },
  { d: "M 515 156 C 512 200, 480 215, 440 220 C 370 225, 340 245, 340 280", gold: false },
  { d: "M 545 156 C 548 200, 580 215, 620 220 C 690 225, 720 245, 720 280", gold: false },
  { d: "M 560 150 C 568 195, 620 200, 680 200 L 870 200 C 940 200, 964 215, 964 241", gold: true },
];

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

  const size = isCenter ? 305 : 158;
  const left = isCenter ? 187 : isLeft ? 0 : 522;
  const top = isCenter ? 0 : 71;

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
// inset: Figma mein bahar ki rows narrow hoti hain, beech wali sabse wide
const ROWS = [
  { opacity: "opacity-20", active: false, inset: "mx-[34px]" },
  { opacity: "opacity-60", active: false, inset: "mx-[17px]" },
  { opacity: "opacity-100", active: true, inset: "mx-0" },
  { opacity: "opacity-60", active: false, inset: "mx-[17px]" },
  { opacity: "opacity-20", active: false, inset: "mx-[34px]" },
];

const PILLS = ["24/7 withdrawals", "Instant payouts Avg time 8.3s"];

export function ExplorePage() {
  // BTC beech mein se start hota hai
  const [active, setActive] = useState(1);
  const n = SLIDES.length;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 3000);
    return () => clearInterval(id);
  }, [n]);

  return (
    <main className="min-h-screen pt-nav font-sans text-foreground">
      {/* Figma frame: 1440px centered, 80px side padding (px-6 mobile / lg:px-20) */}
      <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-6 py-20 text-center lg:px-20">
        {/* ===== Funding diagram ===== */}
        <div className="mt-12 flex w-full flex-col items-center">
          <h2 className="max-w-[800px] text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-white md:text-[56px]">
            Built For The Next Generation Of Perp Traders
          </h2>
          <p className="mt-6 max-w-[520px] text-base leading-relaxed text-white/60">
            Trade perpetual markets on-chain with transparent rules, reliable
            data, and the tools to track your performance from start to finish.
          </p>

          <div className="relative mt-10 aspect-[1060/360] w-full max-w-[1060px] [container-type:inline-size]">
            {/* Curved lines */}
            <svg
              viewBox="0 0 1060 360"
              className="absolute inset-0 h-full w-full"
              fill="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="goldLine" x1="0" x2="1">
                  <stop offset="0" stopColor="#99804A" />
                  <stop offset="1" stopColor="#99804A" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              <style>{`
    @keyframes wire-draw  { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
    @keyframes wire-pulse { from { stroke-dashoffset: 0.12; } to { stroke-dashoffset: -1; } }
    .wire-draw  { stroke-dasharray: 1; stroke-dashoffset: 1; animation: wire-draw 1.4s ease-out forwards; }
    .wire-pulse { stroke-dasharray: 0.12 1; stroke-dashoffset: 0.12; animation: wire-pulse 2.4s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .wire-draw  { animation: none; stroke-dashoffset: 0; }
      .wire-pulse { display: none; }
    }
  `}</style>

              {LINES.map((l, i) => (
                <g key={i}>
                  <path
                    d={l.d}
                    pathLength={1}
                    className="wire-draw"
                    stroke={l.gold ? "url(#goldLine)" : "rgba(255,255,255,0.85)"}
                    strokeWidth="1"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                  <path
                    d={l.d}
                    pathLength={1}
                    className="wire-pulse"
                    stroke={l.gold ? "#E8D39A" : "#FFFFFF"}
                    strokeWidth="1.8"
                    style={{ animationDelay: `${1.6 + i * 0.3}s` }}
                  />
                </g>
              ))}
            </svg>

            {/* Ring logo */}
            <div
              className="absolute"
              style={{
                left: "calc(530 / 1060 * 100%)",
                top: 0,
                width: "14.7%",
                transform: "translateX(-50%)",
              }}
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

            {/* 4 cards */}
            {CARDS.map((c) => (
              <div
                key={c.icon}
                className="absolute flex items-center gap-[1.1cqw] border-b border-[#99804A]/60 bg-[#1f1f1f] px-[1.7cqw] text-left"
                style={{
                  left: `${(c.left / 1060) * 100}%`,
                  top: `${(c.top / 360) * 100}%`,
                  width: `${(195 / 1060) * 100}%`,
                  height: `${(80 / 360) * 100}%`,
                }}
              >
                <div className="flex h-[4cqw] w-[4cqw] shrink-0 items-center justify-center bg-white/5">
                  <Image
                    src={`/images/explore/box/${c.icon}.png`}
                    alt=""
                    width={24}
                    height={24}
                    className="h-auto w-[58%]"
                  />
                </div>
                <div className="whitespace-nowrap leading-tight">
                  <div className="text-[2.1cqw] text-white">{c.value}</div>
                  <div className="text-[1.25cqw] text-white/60">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Trade On Perpetual Markets ===== */}
        <div className="mt-28 flex w-full flex-col gap-12 text-left lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* Left: content */}
          <div className="w-full max-w-[470px]">
            <h2 className="text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-white md:text-[56px]">
              Trade On Perpetual Markets, 24/7
            </h2>
            <p className="mt-6 max-w-[430px] text-base leading-relaxed text-white/60">
              A powerful trading terminal with built-in analytics and risk
              tools. Trade crypto, equities, and commodities around the clock,
              with liquidity powered by Hyperliquid.
            </p>

            <div className="mt-8 flex max-w-[430px] flex-wrap gap-3">
              {TAGS.map((t) => (
                <span
                  key={t}
                  className="border border-white/10 bg-white/[0.06] px-7 py-3 text-sm leading-none text-white"
                >
                  {t}
                </span>
              ))}
            </div>

            <a
              href="#"
              className="mt-8 inline-flex items-center gap-2 text-sm text-white/60 underline underline-offset-4 transition-colors hover:text-white"
            >
              Browse All Markets <span aria-hidden>↗</span>
            </a>
          </div>

          {/* Right: rotating boxes */}
          <div className="flex w-full max-w-[680px] flex-col items-center">
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
                  className={`h-[3px] transition-all duration-500 ${
                    i === active ? "w-8 bg-gold-accent" : "w-5 bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ===== Payouts section ===== */}
        <div className="mt-24 flex w-full flex-col gap-12 text-left lg:mt-[200px] lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* Left: payouts table */}
          <div className="w-full max-w-[455px]">
            {/* Legend: Figma mein table ke upar center */}
            <div className="mb-3 flex items-center justify-center gap-6 text-[11px] text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Live Payouts
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#99804A]" />
                Perpetual Funding
              </span>
            </div>

            <div className="flex flex-col">
              {ROWS.map((row, i) =>
                row.active ? (
                  <div
                    key={i}
                    className="flex h-[40.99px] w-full items-center justify-between border-l-2 border-[#99804A] bg-gradient-to-r from-[#99804A] to-white py-3 pl-[27.74px] pr-[27.74px] text-sm"
                  >
                    <span className="text-white">0x0b6a..861f</span>
                    <span className="text-green-600">+$1,789</span>
                  </div>
                ) : (
                  <div
                    key={i}
                    className={`flex h-[40.99px] items-center justify-between border-x border-white/10 bg-white/[0.03] py-3 pl-[27.74px] pr-[27.74px] text-sm ${row.inset} ${row.opacity}`}
                  >
                    <span className="text-white/60">0x0b6a..861f</span>
                    <span className="text-green-500">+$1,789</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Right: content */}
          <div className="w-full max-w-[680px]">
            <h2 className="text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-white md:text-[56px]">
              Get Paid On-Chain In Seconds, Without Waiting For Approval
            </h2>
            <p className="mt-4 max-w-[540px] text-base leading-relaxed text-white/60">
              Trade, hit your targets, and get rewarded. Smart contracts handle
              the payouts, delivering a faster, transparent experience with no
              manual approvals.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {PILLS.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-[6.9px] border-[0.64px] border-white/20 bg-white/[0.06] px-[25.53px] py-[11.04px] text-[14px] font-normal leading-none text-white backdrop-blur-[14px]"
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
//git 