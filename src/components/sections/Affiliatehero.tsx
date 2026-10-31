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

const glowMask =
  "linear-gradient(180deg, #000 0%, #000 78%, transparent 100%)"

export function AffiliateHero() {
  return (
    /*
      data-affiliate-page  -> globals.css isay dekh kar body ke side glows band kar deta hai
      bg-[#111]            -> section ka apna solid background, body ka rang andar nahi aata
    */
    <section
      data-affiliate-page
      className="relative flex w-full flex-col items-center overflow-hidden bg-[#111111] px-6 pb-[120px] pt-[184px] text-center md:min-h-[720px] md:px-20 "
    >
      {/*
        Figma glow: Ellipse 825 x 229, Layer blur 250 (~125px in CSS),
        Linear gradient #FFFFFF (alpha) -> #99804A.
        
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ WebkitMaskImage: glowMask, maskImage: glowMask }}
      >
        <div
          className="absolute left-1/2 top-[270px] h-[235px] w-[825px] -translate-x-1/2 rounded-[50%] blur-[125px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, #99804A 100%)",
          }}
        />
      </div>

      {/* Bottom fade:  */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-[160px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,17,17,0) 0%, rgba(17,17,17,0.15) 30%, rgba(17,17,17,0.5) 60%, rgba(17,17,17,0.85) 85%, #111111 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="max-w-[520px] text-[40px]  leading-[1]   md:max-w-[560px] md:text-[60px]">
          Turn Your Marketing Skills Into Income
        </h1>

        <p className="mt-6 max-w-[510px] text-[15px] font-normal leading-[20px] tracking-[-0.01em] text-white/50">
          Earn up to 20% commissions while unlocking exclusive perks like funded
          challenges, discount codes, and giveaways to elevate your trading
          journey!
        </p>

        <div className="mt-[30px] flex gap-[14px]">
          <Link
            href=''
            className="inline-flex h-[41px] items-center bg-white px-7 text-[14px] text-ink"
          >
            Join Affiliate
          </Link>
          <Link
            href=''
            className="inline-flex h-[41px] items-center border border-white/10 bg-white/[0.06] px-7 text-[14px] font-normal tracking-[-0.01em] text-white/70"
          >
            Affiliate Login
          </Link>
        </div>

        {/* Pe*/}
        <ul className="mt-[47px] flex max-w-[640px] flex-wrap justify-center gap-[14px]">
          {badges.map((text) => (
            <li
              key={text}
              className="inline-flex h-[34px] items-center gap-3 border border-white/10 bg-white/[0.02] px-4 text-[14px] leading-none text-[#A8A39A]"
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