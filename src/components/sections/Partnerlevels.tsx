import Image from "next/image";

const levels = [
  {
    tag: "AXIS",
    img: "/images/affiliate/Axis.svg",
    imgH: 121,
    glowX: 40,
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
    imgH: 122,
    glowX: 45,
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
    imgH: 141,
    glowX: 40,
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
    <section
      data-affiliate-page
      className="relative w-full bg-[#111111] px-6 pb-[120px] pt-[70px] md:px-20"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-center">
        <h2 className="text-center text-[32px] font-normal leading-none tracking-[-0.02em] text-white md:text-[52px]">
          Perpeye Partner Levels
        </h2>

        <p className="mt-[30px] max-w-[500px] text-center text-[16px] leading-[20px] text-[#8D8D8D]">
          Trade perpetual markets on-chain with transparent rules, reliable
          data, and the tools to track your performance from start to finish.
        </p>

        <div className="mt-[39px] grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {levels.map((l) => (
            <article
              key={l.tag}
              className="relative flex h-[458px] flex-col items-center overflow-hidden border border-[#2B2B2B] bg-[#111111]"
            >
              {/* 1) Main glow: upar se halki curved light, neeche smooth fade */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[300px]"
                style={{
                  background: `radial-gradient(ellipse 75% 90% at ${l.glowX}% 0%, rgba(122,111,86,0.72) 0%, rgba(96,87,67,0.45) 45%, rgba(17,17,17,0) 100%)`,
                  filter: "blur(10px)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, #000 0%, #000 30%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, #000 0%, #000 30%, transparent 100%)",
                }}
              />

              {/* 2) Left side ki halki grey band */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[260px]"
                style={{
                  background:
                    "radial-gradient(ellipse 38% 70% at 0% 15%, rgba(175,171,161,0.32) 0%, rgba(17,17,17,0) 100%)",
                  filter: "blur(10px)",
                }}
              />

              {/* Gem */}
              <div className="relative flex h-[209px] w-full shrink-0 items-center justify-center">
                <Image
                  src={l.img}
                  alt={`${l.tag} level`}
                  width={200}
                  height={200}
                  unoptimized
                  style={{ height: l.imgH }}
                  className="w-auto select-none object-contain [filter:none]"
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

              <div className="relative mt-[20px] flex w-full flex-wrap justify-center gap-3 px-4">
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