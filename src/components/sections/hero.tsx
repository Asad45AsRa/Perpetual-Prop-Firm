import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { FaDiscord } from "react-icons/fa6";

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
    <section className="relative w-full overflow-hidden px-6 pb-0 pt-[184px] md:min-h-[720px] md:px-20">
      {/* BG: header.png sirf top par, neeche se fade taake hard edge na aaye */}
      <Image
        src="/images/header.png"
        alt=""
        width={1920}
        height={670}
        priority
        unoptimized
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[670px] w-full select-none object-cover object-right [mask-image:linear-gradient(to_bottom,#000_40%,transparent_100%),linear-gradient(to_right,transparent_0%,#000_35%,#000_100%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]" />

      {/* GIF: bilkul plain, koi CSS nahi */}
      <Image
        src="/images/hero/Final1080.gif"
        alt="Perpeye trading coins"
        width={1080}
        height={1080}
        unoptimized
        className="pointer-events-none absolute right-32 top-[39px] w-[636px] leading-[20px] select-none md:block"
      />


      <div className="relative z-10">
        <h1 className="text-[40px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[60px]">
          Smarter Way To Trade
          <br />
          Perps With Funding.
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

        <div className="mt-[47px] w-fit">
          {rows.map((row, i) => (
            <dl
              key={i}
              className={cn("flex", i > 0 && "mt-[25px] border-t border-line pt-[25px]")}
            >
              {row.map((s, j) => (
                <div
                  key={s.label}
                  className={cn(
                    j > 0 && "border-l border-line pl-[44px]",
                    j < row.length - 1 && "pr-[45px]"
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