import Image from "next/image";

const levels = [
  {
    tag: "AXIS",
    img: "/images/affiliate/Axis.svg",
    title: "0–50 Referrals",
    chips: [
      "Commission: 15%",
      "Recurring Commissions: 10%",
      "3x 5K Giveaway for the partner’s community",
      "1x 10K Challenge Account",
    ],
  },
  {
    tag: "ONYX",
    img: "/images/affiliate/Onyx.svg",
    title: "51–250 Referrals",
    chips: [
      "Commission: 17%",
      "Recurring Commissions: 10%",
      "5x 5K Giveaway for the partner’s community",
      "1x 25K Challenge Account",
    ],
  },
  {
    tag: "APEX",
    img: "/images/affiliate/Apex.svg",
    title: "251+ Referrals",
    chips: [
      "Commission: 20%",
      "Recurring Commissions: 10%",
      "5x 10K Giveaway for the partner’s community",
      "1x 100K Challenge Account",
    ],
  },
];

export function PartnerLevels() {
  return (
    /* data-affiliate-page: globals.css body glow band karta hai; bg-[#111] section ko solid rakhta hai */
    <section
      data-affiliate-page
      className="relative w-full bg-[#111111] px-6 pb-[120px] pt-[70px] md:px-20"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-center">
        <h2 className="text-center text-[32px] font-normal leading-none tracking-[-0.02em] text-white md:text-[48px]">
          Perpeye Partner Levels
        </h2>

        <p className="mt-[30px] max-w-[500px] text-center text-[15px] leading-[20px] text-[#8C8C8C]">
          Trade perpetual markets on-chain with transparent rules, reliable
          data, and the tools to track your performance from start to finish.
        </p>

        <div className="mt-[39px] grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {levels.map((l) => (
            <article
              key={l.tag}
              className="relative flex min-h-[459px] flex-col items-center overflow-hidden border border-[#2B2B2B] bg-[#111111] pb-[27px]"
            >
              {/* Top glow (card ke andar, Figma jaisa) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[244px]"
                style={{
                  background:
                    "radial-gradient(ellipse 85% 100% at 50% 0%, rgba(158,148,122,0.55) 0%, rgba(120,108,82,0.30) 42%, rgba(17,17,17,0) 100%)",
                }}
              />

              {/* Gem */}
              <div className="relative flex h-[209px] w-full items-center justify-center">
                <Image
                  src={l.img}
                  alt={`${l.tag} level`}
                  width={200}
                  height={200}
                  unoptimized
                  className="h-[170px] w-auto translate-y-[4px] select-none object-contain"
                />
              </div>

              {/* Tag */}
              <span
                className="relative inline-flex h-[28px] items-center px-5 text-[11px] leading-none text-[#1a1a1a]"
                style={{
                  background: "linear-gradient(90deg, #FFFFFF 0%, #B9A06A 100%)",
                }}
              >
                {l.tag}
              </span>

              <h3 className="relative mt-[30px] text-[22px] font-normal leading-[28px] text-white">
                {l.title}
              </h3>

              <div className="relative mt-[20px] flex max-w-[355px] flex-wrap justify-center gap-3 px-4">
                {l.chips.map((c) => (
                  <span
                    key={c}
                    className="inline-flex h-[30px] items-center border border-[#2C2C2C] bg-[#1B1B1B] px-3 text-[13px] leading-none text-[#8D8D8D]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}