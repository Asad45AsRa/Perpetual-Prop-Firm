"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa6";

const STATS = [
  { prefix: "$", value: 680.1, decimals: 1, suffix: "K", label: "Payout reserve" },
  { prefix: "$", value: 1.73, decimals: 2, suffix: "M", label: "Lifetime payouts" },
  { prefix: "", value: 8.3, decimals: 1, suffix: "s", label: "Avg payout time" },
  { prefix: "$", value: 5.18, decimals: 2, suffix: "M", label: "Funded trader AUM" },
  { prefix: "$", value: 10.84, decimals: 2, suffix: "B", label: "Traded volume" },
];

/* easeOutExpo count-up, starts after `delayMs` */
function useCountUp(target: number, delayMs: number, durationMs = 1800) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
    let raf = 0;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / durationMs, 1);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setVal(target * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, delayMs, durationMs]);

  return val;
}

function StatValue({
  prefix,
  value,
  decimals,
  suffix,
  delayMs,
}: {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
  delayMs: number;
}) {
  const current = useCountUp(value, delayMs);
  const final = `${prefix}${value.toFixed(decimals)}${suffix}`;
  const live = `${prefix}${current.toFixed(decimals)}${suffix}`;

  return (
    <span
      className="relative inline-block text-[1.714em] font-normal leading-none text-white transition-transform duration-300 ease-out group-hover:scale-110 mb-0 pb-0"
      aria-label={final}
    >
      {/* invisible final value reserves the width so nothing jumps while counting */}
      <span className="invisible" aria-hidden>
        {final}
      </span>
      <span className="absolute inset-0 text-center" aria-hidden>
        {live}
      </span>
    </span>
  );
}

export function HeroSection2() {
  return (
    <section
      className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-clip px-6 pb-1 mb-0 pt-0 mt-0 md:pt-[19.29em] lg:px-20 lg:pb-[6.857em]"
      style={{ fontSize: "clamp(14px, calc(100vw * 14 / 1440), 24px)" }}
    >
      <style>{`
        @keyframes heroIn {
          from { opacity: 0; filter: blur(14px); transform: scale(0.94); }
          to   { opacity: 1; filter: blur(0);    transform: scale(1); }
        }
        @keyframes heroGlow {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroBreathe {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.8; }
        }
        .hero-in {
          animation: heroIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: var(--d, 0s);
        }
        .hero-glow {
          animation:
            heroGlow 1.6s ease-out both,
            heroBreathe 7s ease-in-out 1.6s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-in, .hero-glow {
            animation: none !important;
          }
        }
      `}</style>

      <div className="relative flex w-full flex-col items-center text-center">
        {/* Glow layer 1: Figma gradient (#FFFFFF -> #99804A), brighter + less blur */}
        <div
          aria-hidden
          className="hero-glow pointer-events-none absolute left-1/2 top-[42%] z-0 h-[30em] w-[114.29em] -translate-x-1/2 -translate-y-1/2 blur-[9em]"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #927f56ff 100%)",
            opacity: 0.95,
          }}
        />
        {/* Glow layer 2: soft warm wash so edges fade to dark like Figma */}
        <div
          aria-hidden
          className="hero-glow pointer-events-none absolute -inset-x-[10em] top-[48%] z-0 h-[48em]"
          style={{
            background:
              "radial-gradient(ellipse 50% 100% at 50% 0%, rgba(163, 151, 126, 0.38) 0%, rgba(175, 167, 148, 0.2) 35%, rgba(131,116,85,0.06) 65%, transparent 90%)",
          }}
        />

        <div className="relative z-10 flex w-full flex-col items-center ">
          <h1
            className="hero-in w-full text-[3em]  leading-[0.86] text-white md:text-[4.5em] lg:text-[6.108em]"
            style={{ "--d": "0.1s" } as React.CSSProperties}
          >
            <span className="md:block">Trade Perpetual Markets. </span>
            <span className="md:block">Get Funded.</span>
          </h1>

          <p
            className="hero-in mt-[1.5em] max-w-[62em] text-[16px] text-white/70"
            style={{ "--d": "0.35s" } as React.CSSProperties}
          >
            <span className="md:block">
              Perpeye is a simulated on chain perpetual trading platform built
              for skilled traders. Access crypto and TradFi markets,{" "}
            </span>
            <span className="md:block">
              prove your trading skills through a one-step evaluation, and earn
              performance-based payouts with no{" "}
            </span>
            <span className="md:block">personal trading capital required.</span>
          </p>

          <div className="mt-[1.8em] flex flex-wrap items-center justify-center gap-[1.143em]">
            <Link
              href="/challenges"
              className="hero-in flex h-[2.857em] items-center justify-center bg-white px-[1.93em] text-[1em] font-normal leading-none text-black transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
              style={{ "--d": "0.6s" } as React.CSSProperties}
            >
              Get Funded
            </Link>

            <a
              href="#" /* TODO: Discord invite link */
              target="_blank"
              rel="noreferrer"
              className="hero-in group flex h-[2.857em] items-center justify-center gap-[0.571em] border border-white/10 bg-white/10 px-[1.86em] text-[1em] font-normal leading-none text-white transition-all duration-300 ease-out hover:scale-105 hover:bg-white/20 active:scale-95"
              style={{ "--d": "0.75s" } as React.CSSProperties}
            >
              Join Discord
              <FaDiscord
                className="h-[1.3em] w-[1.3em] transition-transform duration-300 group-hover:scale-125"
                aria-hidden
              />
            </a>
          </div>

          {/* Stats with count-up */}
          <div className="mt-[3.57em] grid w-full grid-cols-2 gap-y-8 lg:flex lg:w-auto lg:justify-center lg:gap-y-0">
            {STATS.map((s, i) => {
              const delay = 0.95 + i * 0.12;
              return (
                <div
                  key={s.label}
                  className="hero-in group flex flex-col items-center gap-[0.857em] py-[0.2em] lg:border-l lg:border-white/15 lg:px-[3.214em] lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
                  style={{ "--d": `${delay}s` } as React.CSSProperties}
                >
                  <StatValue
                    prefix={s.prefix}
                    value={s.value}
                    decimals={s.decimals}
                    suffix={s.suffix}
                    delayMs={delay * 1000}
                  />
                  <span className="text-[0.857em] font-normal leading-none text-white/50 transition-colors duration-300 group-hover:text-white/80">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}