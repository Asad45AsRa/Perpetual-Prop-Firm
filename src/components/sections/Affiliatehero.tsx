import Link from "next/link";
import { siteConfig } from "@/config/site";

const badges = [
  "Over 6000 Affiliate Giveaway Accounts Issued",
  "Over $1Million Commissions Paid Out",
  "Personalized Discount Codes",
];

function GoldCheck() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id="gold-check" x1="0" y1="0" x2="16" y2="16">
          <stop offset="0" stopColor="#D2BA85" />
          <stop offset="1" stopColor="#99804A" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="8" r="8" fill="url(#gold-check)" />
      <path
        d="M4.6 8.2l2.2 2.2 4.6-4.8"
        stroke="#1c1c1c"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const animationCss = `
@keyframes aff-reveal {
  from { opacity: 0; filter: blur(10px); transform: scale(0.98); }
  to   { opacity: 1; filter: blur(0);    transform: scale(1); }
}
@keyframes aff-glow-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.aff-reveal {
  animation: aff-reveal 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
.aff-glow {
  animation: aff-glow-in 2s ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .aff-reveal, .aff-glow { animation: none; }
}
`;

const glowMask =
  "linear-gradient(180deg, #000 0%, #000 45%, transparent 80%)";

export function AffiliateHero() {
  return (
    /*
      data-affiliate-page  -> globals.css isay dekh kar body ke side glows band kar deta hai
      bg-[#111]            -> section ka apna solid background, body ka rang andar nahi aata
    */
    <section
      data-affiliate-page
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#111111] px-6 pb-[120px] pt-[184px] text-center md:min-h-[720px] md:px-20"
    >
      <style>{animationCss}</style>

      {/*
        Figma glow: Ellipse 825 x 229, Layer blur 250 (~125px in CSS),
        Linear gradient #FFFFFF (alpha) -> #99804A.
        Mask glow ko section ke end se pehle hi zero kar deta hai (seam khatam).
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ WebkitMaskImage: glowMask, maskImage: glowMask }}
      >
        <div
          className="aff-glow absolute left-1/2 top-[270px] h-[229px] w-[825px] -translate-x-1/2 rounded-[50%] blur-[140px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.45) 0%, #928160ff 100%)",
          }}
        />
      </div>

      {/* Bottom fade: eased, taake section ke end par koi edge na bache */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-[400px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,17,17,0) 0%, rgba(17,17,17,0.2) 25%, rgba(17,17,17,0.55) 50%, rgba(17,17,17,0.85) 75%, #111111 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="aff-reveal max-w-[520px] text-[40px]  leading-[1]   md:max-w-[560px] md:text-[60px]"
          style={{ animationDelay: "0.1s" }}
        >
          Turn Your Marketing Skills Into Income
        </h1>

        <p
          className="aff-reveal mt-6 max-w-[510px] text-[15px]  text-white/70"
          style={{ animationDelay: "0.35s" }}
        >
          Earn up to 20% commissions while unlocking exclusive perks like funded
          challenges, discount codes, and giveaways to elevate your trading
          journey!
        </p>

        <div
          className="aff-reveal mt-[30px] flex gap-[14px]"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            href=''
            className="inline-flex h-[41px] items-center bg-white px-7 text-[14px] text-ink"
          >
            Join Affiliate
          </Link>
          <Link
            href=''
            className="inline-flex h-[41px] items-center border border-white/15 bg-white/[0.12] px-7 text-[14px] text-white/90"
          >
            Affiliate Login
          </Link>
        </div>

        {/* Pehle 2 badges ek row me, 3rd neeche center me */}
        <ul className="mt-[47px] flex max-w-[640px] flex-wrap justify-center gap-[14px]">
          {badges.map((text, i) => (
            <li
              key={text}
              className="aff-reveal inline-flex h-[34px] items-center gap-3 border border-white/10 bg-white/[0.02] px-4 text-[14px] leading-none text-[#A8A39A]"
              style={{ animationDelay: `${0.85 + i * 0.15}s` }}
            >
              <GoldCheck />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}