import Image from "next/image";
import { cn } from "@/lib/utils";

/*
  Assets (public/):
  - /images/checkout/check.png   -> flame icon (Step 1 rows + Funded badge)
  - /images/checkout/dollers.png -> $ coin ring (Step 3)
*/
const FLAME_SRC = "/images/checkout/check.png";
const COIN_SRC = "/images/checkout/dollers.png";
const CHECK_SRC = "/images/checkout/check.png";

const ACCOUNTS = ["$25K Account Size", "$10K Account Size", "$5K Account Size"];

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

function StepCard({
  step,
  title,
  description,
  children,
  className,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex min-h-[420px] flex-col items-center border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] px-6 pb-10 pt-9 text-center",
        className,
      )}
    >
      <span className="border border-white/10 bg-white/[0.06] px-5 py-2 text-[12px] leading-none text-white/80">
        Step {step}
      </span>

      <div className="relative mt-8 h-[210px] w-full">{children}</div>

      <h3 className="mt-8 text-[24px] font-normal leading-none text-white lg:text-[28px]">
        {title}
      </h3>
      <p className="mt-4 max-w-[360px] text-[14px] leading-relaxed text-muted lg:text-[15px]">
        {description}
      </p>
    </article>
  );
}

/* Gold gradient label (Figma: dark text on #FFFFFF -> #99804A) */
function GoldLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute whitespace-nowrap bg-gold-line px-3.5 py-2.5 text-[14px] leading-none text-black shadow-[0_4px_14px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1: account list                                                */
/* ------------------------------------------------------------------ */

function StepOneVisual() {
  return (
    <div className="relative mx-auto h-full w-full max-w-[340px]">
      <div className="border border-white/10 bg-white/[0.02] p-2">
        <div className="space-y-2">
          {ACCOUNTS.map((label) => (
            <div
              key={label}
              className="flex h-[52px] items-center gap-3 border-l-2 border-white/10 bg-white/[0.06] px-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.06]">
                <Image
                  src={FLAME_SRC}
                  alt=""
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px]"
                />
              </span>
              <span className="text-left">
                <span className="block text-[14px] leading-none text-white/90">
                  {label}
                </span>
                <span className="mt-1.5 block text-[8px] uppercase leading-none tracking-wide text-white/40">
                  Challenge phase
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* cursor */}
      <svg
        aria-hidden
        viewBox="0 0 36 34"
        className="absolute -right-6 top-[68px] h-10 w-11 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      >
        <path
          d="M2 3 L30 14 L18 18 L14 30 Z"
          fill="#E7E7E7"
          stroke="#0F0F0F"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2: chart (Figma: 2.02px gradient stroke #FFFFFF -> #99804A)    */
/* ------------------------------------------------------------------ */

const CHART_LINE =
  "M0,95 C14,95 20,132 40,132 C58,132 62,116 78,120 C92,124 96,136 112,132 C130,126 140,102 158,80 C168,64 176,60 184,62 C196,64 200,78 214,80 C226,82 232,74 246,78 C262,84 268,100 282,104 C298,106 310,110 330,120";

function StepTwoVisual() {
  return (
    <div className="absolute inset-x-[-24px] inset-y-0">
      <svg
        aria-hidden
        viewBox="0 0 330 210"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {/* line: white -> gold */}
          <linearGradient id="steps-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#99804A" />
          </linearGradient>
          {/* glow under the line */}
          <linearGradient id="steps-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#99804A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#99804A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${CHART_LINE} L330,210 L0,210 Z`} fill="url(#steps-fill)" />
        <path
          d={CHART_LINE}
          fill="none"
          stroke="url(#steps-stroke)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* peak dot */}
      <span className="absolute left-[55.8%] top-[29.5%] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-light shadow-[0_0_14px_rgba(212,182,120,0.8)]" />

      <GoldLabel className="left-6 top-[36px]">Profit Target: $6,000</GoldLabel>

      <span className="absolute right-6 top-[22px] whitespace-nowrap border border-dashed border-white/30 px-3.5 py-2.5 text-[14px] leading-none text-white/60">
        55.8% To Target
      </span>

      <GoldLabel className="right-6 top-[128px]">Results: $3,348</GoldLabel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3: coin                                                        */
/* ------------------------------------------------------------------ */

function StepThreeVisual() {
  return (
    <div className="relative mx-auto h-full w-full max-w-[340px]">
      {/* outer ring */}
      <span className="absolute left-1/2 top-[10px] h-[190px] w-[190px] -translate-x-1/2 rounded-full border border-white/10" />

      {/* coin */}
      <Image
        src={COIN_SRC}
        alt="USDC reward"
        width={140}
        height={140}
        className="absolute left-1/2 top-[35px] h-[140px] w-[140px] -translate-x-1/2 object-contain"
      />

      {/* Funded badge */}
      <span className="absolute right-0 top-[14px] flex items-center gap-2 border border-white/10 bg-white/[0.08] px-3 py-2 text-[13px] leading-none text-white/80">
        <Image src={CHECK_SRC} alt="" width={14} height={14} className="h-3.5 w-3.5" />
        Funded
      </span>

      {/* payout chip */}
      <span className="absolute bottom-[10px] left-0 whitespace-nowrap border border-white/10 bg-white/[0.08] px-3 py-2.5 text-[13px] leading-none text-white/60">
        +3,555.00 USDC
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function ThreeSteps() {
  return (
    <section className="w-full px-6 pb-28 pt-12 lg:px-20">
      <div className="mx-auto max-w-[680px] text-center">
        <h2 className="text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-white md:text-[48px]">
          Three Steps. Get Funded.
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-muted lg:text-[15px]">
          Trade perpetual markets on-chain with transparent rules, reliable
          data, and the tools to track your performance from start to finish.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        <StepCard
          step={1}
          title="Start Your Evaluation"
          description="Compare the live account options, see every rule before paying and complete one secure checkout."
        >
          <StepOneVisual />
        </StepCard>

        <StepCard
          step={2}
          title="Trade and Prove Yourself"
          description="Use live Hyperliquid reference data, precise order controls and continuous account-risk tracking."
          className="overflow-hidden"
        >
          <StepTwoVisual />
        </StepCard>

        <StepCard
          step={3}
          title="Get Rewarded. Get Funded"
          description="Pass within the published limits to progress to a funded account and become eligible for rewards."
        >
          <StepThreeVisual />
        </StepCard>
      </div>
    </section>
  );
}