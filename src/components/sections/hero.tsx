import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { FaDiscord } from "react-icons/fa6";
import { LeftGlow } from "../../components/sections/LeftGlow";
import { GLOW_H, GLOW_IN_HERO } from "../../config/glowSeam";

const stats = [
  { value: "$680.1K", label: "Payout reserve" },
  { value: "$1.73M", label: "Lifetime payouts" },
  { value: "8.3s", label: "Avg payout time" },
  { value: "$5.18M", label: "Funded trader AUM" },
  { value: "$10.84B", label: "Traded volume" },
];

const rows = [stats.slice(0, 3), stats.slice(3)];

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-5 pb-0 pt-[96px] md:min-h-[720px] md:px-20 md:max-lg:!px-6 lg:pt-[184px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">

      </div>

      {/* BG (CSS, no image): #0F0F0F with the Figma top-right light beam; fades out at the bottom into the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#0F0F0F] [mask-image:linear-gradient(to_bottom,#000_80%,transparent_100%)]"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 40% 95% at 100% 0%, rgba(255,247,228,0.4) 0%, rgba(255,247,228,0.18) 45%, rgba(255,247,228,0) 100%)",
            "radial-gradient(ellipse 40% 28% at 70% 0%, rgba(255,247,228,0.3) 0%, rgba(255,247,228,0.12) 50%, rgba(255,247,228,0) 100%)",
          ].join(","),
        }}
      />


      {/* GIF: no visual effects applied.
          Mobile + tablet (below lg): in normal flow, centered, above the text.
          lg and up: absolutely positioned on the right (original desktop layout). */}
      <Image
        src="/images/hero/Final1080.gif"
        alt="Perpeye trading coins"
        width={1080}
        height={1080}
        unoptimized
        className="pointer-events-none relative mx-auto mb-16 block w-full max-w-[420px] select-none leading-[20px] max-md:-translate-x-[6%] md:max-lg:mb-10 md:max-lg:max-w-[480px] lg:absolute lg:right-[clamp(16px,calc((100vw_-_1168px)*1.3_+_16px),128px)] lg:top-[39px] lg:m-0 lg:w-[min(636px,calc((100vw_-_620px)*1.16))] lg:max-w-none lg:px-2"
      />


      <div className="relative z-10">
        <h1 className="text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-white md:text-[44px] md:leading-[1] lg:text-[length:clamp(50px,calc(4.37vw_+_5.2px),60px)]">
          Smarter Way To Trade
          <br className="max-lg:hidden" />
          {" "}Perps With Funding.
        </h1>

        <p className="mt-6 max-w-[480px] text-[15px] leading-[20px] text-muted/90">
          Trade perpetual markets on-chain with transparent rules, powerful tools,
          and performance-based rewards, all built around your trading skills.
        </p>

        <div className="mt-[30px] font-[50px] flex gap-[14px]">
          <Link
            href={siteConfig.links.getFunded}
            className="inline-flex h-[41px]  items-center bg-white px-7 text-[14px] text-ink"
          >
            Get Funded
          </Link>
          <Link
            href={siteConfig.links.discord}
            className="inline-flex h-[41px] items-center gap-2 border border-[#333] bg-[#1c1c1c]  px-7 text-[14px] text-white"
          >
            Join Discord
            <FaDiscord className="h-[18px] w-[18px]" />
          </Link>
        </div>

        {/* Stats: full width on small screens, shrink-to-fit on md and up */}
        <div className="mt-[47px] w-full md:w-fit">
          {rows.map((row, i) => (
            <dl
              key={i}
              className={cn(
                "grid grid-cols-3 md:flex",
                i > 0 && "mt-[25px] border-t border-line pt-[25px]"
              )}
            >
              {row.map((s, j) => (
                <div
                  key={s.label}
                  className={cn(
                    j > 0 && "border-l border-line pl-3 md:pl-[44px]",
                    j < row.length - 1 && "pr-2 md:pr-[45px]"
                  )}
                >
                  <dt className="text-[26px] leading-none text-gold-accent">{s.value}</dt>
                  <dd className="mt-[11px] text-[12px] leading-none text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      </div>
    </section>
  );
}