import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
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
    // Full-width section: koi max-w container nahi, taake left/right khali na rahe
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1560px] items-center gap-8 px-6 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-[clamp(24px,4vw,80px)] md:px-[clamp(32px,5.4vw,96px)] lg:py-[clamp(72px,8vw,120px)]">
        {/* LEFT */}
        <div>
          <h1 className="max-w-[clamp(420px,44vw,680px)] text-[clamp(40px,3.9vw,64px)] font-normal leading-[1.05] tracking-[-0.03em] text-white">
            Smarter Way To Trade Perps With Funding.
          </h1>

          <p className="mt-6 max-w-[clamp(380px,34vw,540px)] text-[clamp(13px,0.95vw,15px)] leading-relaxed text-muted">
            Trade perpetual markets on-chain with transparent rules, powerful tools,
            and performance-based rewards, all built around your trading skills.
          </p>

          <div className="mt-8 flex gap-3">
            <Button href={siteConfig.links.getFunded}>Get Funded</Button>
            <Button href={siteConfig.links.discord} variant="secondary">
              Join Discord
              <FaDiscord className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-12 w-fit">
            {rows.map((row, i) => (
              <dl
                key={i}
                className={cn("flex", i > 0 && "mt-6 border-t border-white/10 pt-6")}
              >
                {row.map((s, j) => (
                  <div
                    key={s.label}
                    className={cn("pr-8", j > 0 && "border-l border-white/10 pl-8")}
                  >
                    <dt className="text-[clamp(20px,1.6vw,26px)] leading-none text-gold">{s.value}</dt>
                    <dd className="mt-2 text-[clamp(10px,0.75vw,12px)] text-muted">{s.label}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        </div>

        {/* RIGHT: image bada aur right ki taraf */}
        <div className="relative flex justify-center md:justify-end">
          <Image
            src="/images/hero/Hero.png"
            alt="Perpeye trading coins"
            width={900}
            height={900}
            priority
            unoptimized
            className="h-auto w-full max-w-[clamp(420px,44vw,760px)] select-none"
          />
        </div>
      </div>
    </section>
  );
}