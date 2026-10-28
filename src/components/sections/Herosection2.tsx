import Link from "next/link";
import { FaDiscord } from "react-icons/fa6";

const STATS = [
  { value: "$680.1K", label: "Payout reserve" },
  { value: "$1.73M", label: "Lifetime payouts" },
  { value: "8.3s", label: "Avg payout time" },
  { value: "$5.18M", label: "Funded trader AUM" },
  { value: "$10.84B", label: "Traded volume" },
];

/*
  Figma frame = 1440px, base text = 14px.
  Every size below is in `em`, and the section's font-size scales with the
  viewport above 1440px, so the whole hero grows on bigger screens.

  Animations: only fade / blur / scale (no directional movement).
  Each element uses `.hero-in` with a per-element delay via `--d`.
*/
export function HeroSection2() {
  return (
    <section
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-clip px-6 pb-16 pt-28 lg:px-20"
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
          50%      { opacity: 0.7; }
        }
        @keyframes heroLine {
          from { opacity: 0; }
          to   { opacity: 1; }
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
        .hero-stat-line {
          animation: heroLine 1.2s ease-out both;
          animation-delay: var(--d, 0s);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-in, .hero-glow, .hero-stat-line {
            animation: none !important;
          }
        }
      `}</style>

      {/* Background glow: 1600x267 gradient (#FFFFFF -> #99804A), layer blur 350 */}
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute left-1/2 top-1/2 h-[19.07em] w-[114.29em] -translate-x-1/2 -translate-y-[40%] blur-[12.5em]"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #99804A 100%)" }}
      />

      <div className="relative z-10 flex w-full flex-col items-center text-center">
        {/* Heading: 85.51px / 86% / -3% / centered / 847px wide */}
        <h1
          className="hero-in w-full max-w-[60.5em] text-[3em] font-normal leading-[0.86] tracking-[-0.03em] text-white md:text-[4.5em] lg:text-[6.108em]"
          style={{ "--d": "0.1s" } as React.CSSProperties}
        >
          Trade Perpetual Markets.
          <br className="hidden md:block" /> Get Funded.
        </h1>

        {/* Paragraph */}
        <p
          className="hero-in mt-[1.714em] max-w-[57em] text-[1em] font-normal leading-[1.43] text-white/70"
          style={{ "--d": "0.35s" } as React.CSSProperties}
        >
          Perpeye is a simulated on chain perpetual trading platform built for
          skilled traders. Access crypto and TradFi markets,
          <br className="hidden md:block" /> prove your trading skills through a
          one-step evaluation, and earn performance-based payouts with no
          <br className="hidden md:block" /> personal trading capital required.
        </p>

        {/* Buttons */}
        <div className="mt-[2em] flex flex-wrap items-center justify-center gap-[1.143em]">
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

        {/* Stats */}
        <div className="mt-[3.857em] grid w-full max-w-[62.86em] grid-cols-2 gap-y-8 lg:grid-cols-5 lg:gap-y-0">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="hero-in group flex flex-col items-center gap-[0.857em] py-[0.2em] lg:border-l lg:border-white/15 lg:first:border-l-0"
              style={{ "--d": `${0.95 + i * 0.12}s` } as React.CSSProperties}
            >
              <span className="text-[1.714em] font-normal leading-none text-white transition-transform duration-300 ease-out group-hover:scale-110">
                {s.value}
              </span>
              <span className="text-[0.857em] font-normal leading-none text-white/50 transition-colors duration-300 group-hover:text-white/80">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}