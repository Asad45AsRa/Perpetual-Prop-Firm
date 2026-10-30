const steps = [
  { n: "01", title: "Signup Affiliate Account", line: "#A88B45" },
  { n: "02", title: "Copy your Referral Link", line: "#A88B45" },
  { n: "03", title: "Share Your Link and Start Earning", line: "#A88B45" },
];

const animationCss = `
@keyframes how-reveal {
  from { opacity: 0; filter: blur(10px); transform: scale(0.98); }
  to   { opacity: 1; filter: blur(0);    transform: scale(1); }
}
.how-reveal {
  animation: how-reveal 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  .how-reveal { animation: none; }
}
`;

export function HowToJoin() {
  return (
    /* PartnerLevels jaisi hi width (max 1280), side padding, heading/subtitle/cards spacing */
    <section
      data-affiliate-page
      className="relative w-full bg-[#111111] px-6 pb-[120px] pt-[84px] md:px-20"
    >
      <style>{animationCss}</style>

      <div className="mx-auto flex max-w-[1280px] flex-col items-center">
        <h2
          className="how-reveal text-center text-[32px] font-normal leading-none tracking-[-0.02em] text-white md:text-[48px]"
          style={{ animationDelay: "0.1s" }}
        >
          How To Join Program?
        </h2>

        <p
          className="how-reveal mt-[30px] max-w-[480px] text-center text-[15px] leading-[20px] text-white/30"
          style={{ animationDelay: "0.3s" }}
        >
          Join our affiliate program in three simple steps—create your account,
          share your referral link, and earn commissions.
        </p>

        <div className="mt-[39px] grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="how-reveal relative flex h-[94px] items-center gap-4 bg-[#1E1E1E] px-8"
              style={{ animationDelay: `${0.5 + i * 0.15}s` }}
            >
              <span className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center border border-[#333333] bg-[#2A2A2A] text-[13px] leading-none text-[#8D8D8D]">
                {s.n}
              </span>
              <span className="text-[18px] leading-[24px] text-white">
                {s.title}
              </span>

              {/* Bottom line (3rd card gold) */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px"
                style={{ background: s.line }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}