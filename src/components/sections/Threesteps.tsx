import Image from "next/image";
import { cn } from "@/lib/utils";

const FLAME_SRC = "/images/checkout/check.png"; // flame icon
const COIN_SRC = "/images/checkout/dollers.png";
const CURSOR_SRC = "/images/checkout/cursor.svg";
const FUNDED_ICON_SRC = "/images/checkout/Vector.svg";

const ACCOUNTS = ["$25K Account Size", "$10K Account Size", "$5K Account Size"];

/* Figma gold: Linear Gradient #FFFFFF -> #99804A */
const GOLD_GRADIENT = "bg-[linear-gradient(90deg,#FFFFFF_0%,#99804A_100%)]";

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
                "flex flex-col items-center border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] px-6 pb-8 pt-[26px] text-center lg:h-[405px]",
                className,
            )}
        >
            <span className="border border-white/10 bg-white/[0.04] px-5 py-[9px] text-[11px] leading-none text-white/80">
                Step {step}
            </span>

            <div className="relative mt-[34px] h-[185px] w-full">{children}</div>

            <h3 className="mt-[26px] text-[24px] font-normal leading-none tracking-[-0.03em] text-white">
                {title}
            </h3>
            <p className="mt-4 max-w-[330px] text-[14px] leading-[18px] tracking-[-0.02em] text-muted">
                {description}
            </p>
        </article>
    );
}

/* Figma: 141.82 x 29.2, Neue Montreal 400, 12px, line-height 86% */
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
                "absolute flex h-[29.2px] min-w-[141.82px] items-center justify-center whitespace-nowrap px-[17.5px] text-[12px] font-normal leading-[86%] text-black shadow-[0_4px_14px_rgba(0,0,0,0.35)]",
                GOLD_GRADIENT,
                className,
            )}
        >
            {children}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Step 1                                                              */
/* ------------------------------------------------------------------ */

function StepOneVisual() {
    return (
        <div className="relative mx-auto h-full w-full max-w-[320px]">
            <div className="border-b border-white/15 px-2 pb-[5px] pt-0.5">
                <div className="space-y-[5px]">
                    {ACCOUNTS.map((label) => (
                        <div
                            key={label}
                            className="flex h-[57px] items-center gap-2 border-l-2 border-white/15 bg-white/[0.05] pl-2.5"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-white/[0.06]">
                                <Image
                                    src={FLAME_SRC}
                                    alt=""
                                    width={28}
                                    height={28}
                                    className="h-7 w-7"
                                />
                            </span>
                            <span className="text-left">
                                <span className="block text-[12px] leading-none tracking-[-0.01em] text-white/90">
                                    {label}
                                </span>
                                <span className="mt-1.5 block text-[7px] uppercase leading-none tracking-wide text-white/40">
                                    Challenge phase
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* cursor (cursor.svg) */}
            <Image
                src={CURSOR_SRC}
                alt=""
                aria-hidden
                width={45}
                height={42}
                className="pointer-events-none absolute -right-[19px] top-[46px] h-[42px] w-[45px]"
            />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Step 2: wave traced from Figma (viewBox 411 x 180)                  */
/* ------------------------------------------------------------------ */

const CHART_POINTS: [number, number][] = [
    [0, 73],
    [18, 76],
    [33, 100],
    [48, 115],
    [63, 118],
    [83, 108],
    [103, 101],
    [123, 98],
    [145, 95],
    [165, 80],
    [178, 52],
    [190, 30],
    [205, 20],
    [227, 26],
    [253, 31],
    [283, 43],
    [313, 61],
    [333, 73],
    [345, 67],
    [358, 73],
    [383, 93],
    [411, 100],
];

/* Catmull-Rom -> smooth cubic bezier */
function smoothPath(pts: [number, number][]) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? p2;
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return d;
}

const CHART_LINE = smoothPath(CHART_POINTS);

function StepTwoVisual() {
    return (
        <div className="absolute inset-x-[-24px] inset-y-0">
            <svg
                aria-hidden
                viewBox="0 0 411 185"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
            >
                <defs>
                    <linearGradient id="steps-stroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#99804A" />
                    </linearGradient>
                    <linearGradient id="steps-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#99804A" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#99804A" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${CHART_LINE} L411,185 L0,185 Z`} fill="url(#steps-fill)" />
                <path
                    d={CHART_LINE}
                    fill="none"
                    stroke="url(#steps-stroke)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* peak dot (227 / 411) */}
            <span
                className="absolute h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_16px_rgba(212,182,120,0.8)]"
                style={{
                    left: "55.2%",
                    top: "26px",
                    background:
                        "radial-gradient(circle at 35% 30%, #F2E3BC 0%, #C9AA6B 60%, #99804A 100%)",
                }}
            />

            <GoldLabel className="left-[32.54px] top-[18.02px]">
                Profit Target: $6,000
            </GoldLabel>

            <span className="absolute right-[39px] top-0 flex h-[29.2px] w-[113.46px] items-center justify-center whitespace-nowrap border-[0.7px] border-dashed border-[#99804A] text-[12px] font-normal leading-[86%] text-white/50">
                55.8% To Target
            </span>

            <GoldLabel className="right-[39px] top-[113px] w-[110px] min-w-0 px-0">
                Results: $3,348
            </GoldLabel>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Step 3                                                              */
/* ------------------------------------------------------------------ */

function StepThreeVisual() {
    return (
        <div className="relative mx-auto h-full w-full max-w-[340px]">
            {/* outer ring */}
            <span className="absolute left-1/2 top-[22px] h-[152px] w-[152px] -translate-x-1/2 rounded-full border border-white/10" />

            {/* coin */}
            <Image
                src={COIN_SRC}
                alt="USDC reward"
                width={126}
                height={126}
                className="absolute left-1/2 top-[35px] h-[126px] w-[126px] -translate-x-1/2 object-contain"
            />

            {/* Funded badge (Vector.svg) */}
            <span className="absolute left-1/2 top-[30px] ml-[52px] flex h-[28px] items-center gap-1.5 border border-white/10 bg-white/[0.08] px-2.5 text-[12px] leading-none text-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                <Image
                    src={FUNDED_ICON_SRC}
                    alt=""
                    aria-hidden
                    width={12}
                    height={12}
                    className="h-3 w-3"
                />
                Funded
            </span>

            {/* payout chip */}
            <span className="absolute left-1/2 top-[147px] ml-[-153px] flex h-[28px] items-center whitespace-nowrap border border-white/10 bg-white/[0.08] px-3 text-[12px] leading-none text-white/60 shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
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
        /* lg:px-20 = same side padding as navbar -> cards start at logo, end at Get Funded button */
        <section className="w-full px-6 pb-28 pt-[72px] lg:px-20">
            <div className="mx-auto max-w-[760px] text-center">
                <h2 className="text-[44px] font-normal leading-[1.05] tracking-[-0.05em] text-white md:whitespace-nowrap md:text-[56px]">
                    Three Steps. Get Funded.
                </h2>
                <p className="mx-auto mt-4 max-w-[500px] text-[16px] leading-[21px] tracking-[-0.01em] text-muted">
                    Trade perpetual markets on-chain with transparent rules, reliable
                    data, and the tools to track your performance from start to finish.
                </p>
            </div>

            <div className="mt-11 grid gap-6 md:grid-cols-3">
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