const stats = [
  { value: "106", label: "Available Markets" },
  { value: "44%", label: "Net Long Traders" },
  { value: "$1.59B", label: "Weekly Trading Volume" },
  { value: "$3.67M", label: "Total Open Interest" },
  { value: "5,233", label: "Active Traders" },
  { value: "$1.73M", label: "Total Payouts" },
  { value: "3,200", label: "Funded Accounts" },
  { value: "850K", label: "Trades Executed" },
];

const animationCss = `
@keyframes exp-reveal {
  from { opacity: 0; filter: blur(10px); transform: translateY(8px); }
  to   { opacity: 1; filter: blur(0);    transform: translateY(0); }
}
@keyframes exp-glow-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.exp-reveal {
  animation: exp-reveal 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
.exp-glow {
  animation: exp-glow-in 2s ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .exp-reveal, .exp-glow { animation: none; }
}
`;

export function ExploreHero() {
  return (
    /*
      data-affiliate-page -> globals.css isay dekh kar body ke side glows band kar deta hai
      bg-[#111]           -> section ka apna solid background
    */
    <section
      data-affiliate-page
      className="relative w-full overflow-hidden bg-[#111111] px-6 pb-[120px] pt-[184px] md:min-h-[720px] md:px-20"
    >
      <style>{animationCss}</style>

      {/* Top-left grey/warm glow (Figma jaisa), neeche se fade */}
      <div
        aria-hidden
        className="exp-glow pointer-events-none absolute inset-x-0 top-0 h-[670px]"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 0% 0%, rgba(176,171,161,0.42) 0%, rgba(120,112,98,0.18) 45%, transparent 100%)",
        }}
      />

      <div className="relative z-10">
        <h1
          className="exp-reveal text-[40px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[60px]"
          style={{ animationDelay: "0.1s" }}
        >
          Every Metric That Matters.
        </h1>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p
            className="exp-reveal max-w-[610px] text-[15px] leading-[20px] text-[#B0ABA1]"
            style={{ animationDelay: "0.35s" }}
          >
            Growth, trader outcomes, execution quality, payouts, and the
            on-chain reserve that backs all of it — with every on-chain figure
            reproducible by anyone.
          </p>

          <div
            className="exp-reveal flex items-center gap-[6px] text-[12px] leading-none text-[#8C887F]"
            style={{ animationDelay: "0.5s" }}
          >
            <span
              aria-hidden
              className="h-[5px] w-[5px] rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]"
            />
            <span>Market Data on</span>
            <span className="text-[14px] italic tracking-[-0.02em] text-white">
              Hyperliquid
            </span>
          </div>
        </div>

        {/* 4 x 2 stats grid — card 307 x 106, bottom border 2px #99804A */}
        <dl className="mt-[70px] grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="exp-reveal flex h-[106px] flex-col items-center justify-center border-b-2 border-[#99804A] bg-white/[0.06] backdrop-blur-[20px]"
              style={{ animationDelay: `${0.6 + i * 0.08}s` }}
            >
              <dt className="text-[26px] leading-none text-[#A88B50]">
                {s.value}
              </dt>
              <dd className="mt-[11px] text-[12px] leading-none text-[#A8A39A]">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}