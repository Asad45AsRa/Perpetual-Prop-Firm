import Image from "next/image";

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

export function ExploreHero() {
  return (
    <section
      data-affiliate-page
      className="relative w-full overflow-hidden bg-[#111111] bg-cover bg-left-top bg-no-repeat px-6 pb-[120px] pt-[184px] md:min-h-[720px] md:bg-[length:100%_100%] md:px-20 md:max-lg:px-6"
      style={{ backgroundImage: "url('/images/explore/Explore.png')" }}
    >
      {/* Bottom fade: image ka glow section ke edge par katne ke bajaye #111 mein ghul jaye,
          taake Live Market ke saath koi line/seam na bane */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[260px] bg-gradient-to-b from-transparent via-[#111111]/70 to-[#111111]"
      />

      <div className="relative z-10">
        <h1 className="text-[40px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[60px] md:max-xl:text-[48px]">
          Every Metric That Matters.
        </h1>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[610px] text-[16px] leading-[22px] tracking-normal text-muted/90">
            Growth, trader outcomes, execution quality, payouts, and the
            on-chain reserve that backs all of it with every on-chain figure
            reproducible by anyone.
          </p>

          <div className="flex items-center gap-[8px] text-[14px] leading-none tracking-normal text-[#76736D]">
           
            
            <Image
            width={20}
            height={20}
              src="/images/explore/hypernova.svg"
              alt="Market data on Hyperliquid"
              className="h-[20px] w-auto shrink-0 md:h-[22px]"
            />
          </div>
        </div>

        {/* 4 x 2 stats grid — card 307 x 106, bottom border 2px #99804A */}
        <dl className="mt-[70px] grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex h-[106px] flex-col items-center justify-center border-b-2 border-[#99804A] bg-[#1D1D1D]"
            >
              <dt className="text-[26px] leading-none text-[#A88B50]">
                {s.value}
              </dt>
              <dd className="mt-[11px] text-[12px] leading-none tracking-normal text-muted/80">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}