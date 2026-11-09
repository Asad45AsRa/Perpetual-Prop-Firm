"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LuArrowUpRight,
  LuChevronDown,
  LuChevronsUpDown,
} from "react-icons/lu";
import { LeftGlow } from "../../components/sections/LeftGlow";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const CUSTOM_MULTIPLIER = 115;

const PLANS = [
  {
    id: "elite",
    name: "Elite",
    label: "115×",
    multiplier: 115,
    challenge: true,
    rules: { profitTarget: "10%", maxLoss: "6%", dailyLoss: "3%", profitSplit: "80%" },
    tag: "Highest capital access",
    icon: "/images/checked/EliteDefaultIcon.svg",
    iconGolden: "/images/checked/EliteGoldenIcon.svg",
  },
  {
    id: "breeze",
    name: "Breeze",
    label: "75×",
    multiplier: 75,
    challenge: true,
    rules: { profitTarget: "10%", maxLoss: "6%", dailyLoss: "3%", profitSplit: "80%" }, // TODO: cashed Flex se confirm
    tag: "Trader favorite",
    icon: "/images/checked/BreezeDefaultIcon.svg",
    iconGolden: "/images/checked/BreezeGoldenIcon.svg",
  },
  {
    id: "instant",
    name: "Instant",
    label: "35×",
    multiplier: 35,
    challenge: false,
    rules: { profitTarget: "10%", maxLoss: "6%", dailyLoss: "3%", profitSplit: "80%" }, // TODO: cashed Instant se confirm
    tag: "Immediate funding",
    icon: "/images/checked/InstantDefaultIcon.svg", // file ka exact naam check karna
    iconGolden: "/images/checked/Instant Golden Icon.svg",
  },
  {
    id: "custom",
    name: "Capital Your Way",
    label: "35-215×",
    multiplier: CUSTOM_MULTIPLIER,
    challenge: true,
    rules: null,
    tag: "Custom power range",
    icon: "/images/checked/CapitalYouWayDefaultIcon.svg", // note: "YouWay" (r nahi hai, aapki file mein aise hi hai)
    iconGolden: "/images/checked/CapitalYourWayGoldenIcon.svg",
  },
] as const;

const PROFIT_TARGETS = ["6%", "8%", "10%", "12%"];
const DAILY_LOSS = ["3%", "4%", "5%", "6%"];
const DRAWDOWN = ["3%", "4%", "5%", "6%"];
const PROFIT_SPLITS = ["70%", "80%", "90%"];

const PRESETS = [5, 100, 1000, 1500];
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 1500;


const RULE_HASH = {
  elite: "#rule-3",   // Elite
  breeze: "#rule-4",  // Breeze (Flex)
  instant: "#rule-5", // Instant
  custom: "#rule-6",  // Capital Your Way (Build Your Own)
} as const;


/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const money = (n: number) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Cashed account balance / floors ko whole dollars mein dikhata hai
const moneyWhole = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

// integer percent se floor nikalta hai (float error se bachne ke liye)
const floorOf = (balance: number, s: string) =>
  Math.round((balance * (100 - parseFloat(s))) / 100);

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

function SectionChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[24px] items-center gap-2 text-[12px] leading-none text-white/50">
      <Image
        src="/images/explore/ringlogo.png"
        alt=""
        width={12}
        height={12}
        className="h-2.5 w-2.5 rounded-full"
      />
      {children}
    </span>
  );
}

function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("bg-white/[0.04]", className)}>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-[12px] leading-4 text-white/70">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none border-0 bg-white/[0.06] px-3 text-[13px] font-medium text-white outline-none focus:ring-1 focus:ring-[#99804A]/60"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#111111]">
              {o}
            </option>
          ))}
        </select>
        <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
      </span>
    </label>
  );
}

function TextField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-3 block text-[12px] leading-4 text-white/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full border-0 bg-white/[0.06] px-3 text-[13px] text-white outline-none placeholder:text-white/30 focus:ring-1 focus:ring-[#99804A]/60"
      />
    </label>
  );
}

/* Gold panel ka ek stat (label upar, value neeche, center aligned) */
const V =
  "after:absolute after:right-0 after:top-5 after:bottom-5 after:w-px after:bg-white/[0.07]";
const LV =
  "lg:after:absolute lg:after:right-0 lg:after:top-5 lg:after:bottom-5 lg:after:w-px lg:after:bg-white/[0.07]";
const H =
  "before:absolute before:bottom-0 before:left-5 before:right-5 before:h-px before:bg-white/[0.07] lg:before:hidden";

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2.5 px-3 py-5 text-center",
        className,
      )}
    >
      <span className="text-[12px] leading-4 text-white/60">{label}</span>
      <span className="text-[18px] leading-6 text-[#B79F68] lg:text-[20px]">{value}</span>
    </div>
  );
}


/* Figma wala green circle-check (No KYC / trading capital) */
function CheckBadge() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="6" cy="6" r="5.5" fill="rgba(34,197,94,0.15)" stroke="#22C55E" />
      <path
        d="M3.6 6.2l1.6 1.6 3.2-3.4"
        stroke="#22C55E"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CoinStack({ small = false }: { small?: boolean }) {
  return (
    <Image
      src="/images/checked/cryptologos.png"
      alt="Crypto"
      width={small ? 84 : 112}
      height={small ? 20 : 26}
      className={small ? "h-5 w-auto" : "h-[26px] w-auto"}
    />
  );
}

function PlanIcon({
  icon,
  iconGolden,
  selected,
}: {
  icon: string;
  iconGolden: string;
  selected: boolean;
}) {
  return (
    <span
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center transition-colors",
        selected ? "bg-[#99804A]/25" : "bg-white/[0.06]"
      )}
    >
      <Image
        src={selected ? iconGolden : icon}
        alt=""
        width={40}
        height={40}
        className={cn("h-6 w-6 object-contain", icon.includes("Breeze") && "scale-[1.7]")}
      />
    </span>
  );
}


/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/**
 * Challenge configurator + checkout. `embedded` renders it inside the trader dashboard
 * (Figma "Challenges"): no marketing headline, page padding or side glow — the dashboard supplies those.
 */
export function CheckoutPage({ embedded = false }: { embedded?: boolean } = {}) {
  const [planId, setPlanId] = useState<(typeof PLANS)[number]["id"]>("custom");
  const [amount, setAmount] = useState(5);

  const [profitTarget, setProfitTarget] = useState("8%");
  const [dailyLoss, setDailyLoss] = useState("5%");
  const [drawdown, setDrawdown] = useState("4%");
  const [profitSplit, setProfitSplit] = useState("90%");

  const plan = PLANS.find((p) => p.id === planId)!;
  const isCustom = planId === "custom";
  // Custom par dropdowns ki values, baqi plans par un ki apni fixed rules
  const r: {
    profitTarget: string;
    maxLoss: string;
    dailyLoss: string;
    profitSplit: string;
  } = isCustom
      ? { profitTarget, maxLoss: drawdown, dailyLoss, profitSplit }
      : plan.rules!;
  const balance = amount * plan.multiplier;
  const discount = 0; // coupon logic yahan connect karna
  const total = Math.max(amount - discount, 0);

  const STEP = 5;

  const setClamped = (n: number) => {
    const snapped = Math.round(n / STEP) * STEP; // nearest multiple of 5
    setAmount(Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, snapped || MIN_AMOUNT)));
  };

  // Preset buttons add karte hain: $5 x3 = 15, $100 x2 = 200
  const addAmount = (n: number) => setClamped(amount + n);

  const sliderFill = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;

  const Root = embedded ? "div" : "main";

  return (
    <Root className={embedded ? "text-foreground" : "min-h-screen pt-[120px] text-foreground max-md:mt-2 "}>
      {/* Figma: 1440 frame, 80px side padding */}
      <section className={cn("relative isolate w-full", embedded ? "" : "px-6 pb-24 pt-11 sm:px-6 lg:px-20")}>
        {!embedded && (
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-x-clip">
            <LeftGlow
              width={690}
              trim={0}
              height={800}
              opacity={0.24}
              className="left-[-320px] bottom-[-220px]"
            />
          </div>
        )}

        {/* ============================ TOP: heading + fee summary ============================ */}
        {/* Embedded (dashboard): no headline, so the fee summary sits right and the crypto bar spans the full width (Figma). */}
        <div className={cn("grid items-start gap-8 lg:gap-10", !embedded && "lg:grid-cols-[minmax(0,1fr)_440px]")}>
          {embedded ? null : (
            <div className="min-w-0">
              <h1 className="text-[36px] font-normal leading-[1.1] tracking-[-0.03em] text-white md:text-[48px]">
                Crypto Payments.
                <br />
                Greater Trading Potential.
              </h1>
              <p className="mt-5 max-w-[560px] text-[14px] leading-[20px] text-muted/90 md:text-[16px]">
                Pick your account size, customize your payment amount, and check
                out with crypto in just a few steps. Your pricing stays protected
                throughout the checkout process.
              </p>
            </div>
          )}

          <aside className="flex min-w-0 flex-col lg:pt-1">
            {/* Fee -> Balance */}
            <div className={cn("flex items-start gap-6", embedded ? "justify-end" : "lg:justify-end")}>
              <div>
                <p className="text-[11px] leading-4 text-white/30">Challenge Fee</p>
                <p className="mt-1.5 text-[26px] leading-[28px] text-white">
                  {money(amount)}
                </p>
              </div>
              <span className="mt-6 text-white/40">→</span>
              <div>
                <p className="text-[11px] leading-4 text-white/30">Account Balance</p>
                <p className="mt-1.5 text-[26px] leading-[28px] text-white">
                  {moneyWhole(balance)}
                </p>
              </div>
            </div>
            <div className={cn("mt-4 flex flex-wrap items-center gap-4 text-[11px] leading-4 text-white/30", embedded ? "justify-end" : "lg:justify-end")}>
              <span className="flex items-center gap-1.5">
                <CheckBadge /> No KYC required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckBadge />
                {plan.multiplier}× trading capital
              </span>
            </div>

            {/* Cryptocurrency picker */}
            <button
              type="button"
              className="mt-4 flex h-[64px] w-full items-center justify-between border border-white/10 bg-white/[0.03] px-3.5 text-left outline-none hover:border-white/20"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center bg-white/[0.06]">
                  <Image
                    src="/images/checked/btc.svg"
                    alt="Bitcoin"
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                </span>
                <span>
                  <span className="block text-[12px] leading-4 text-white/80">
                    Cryptocurrency
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-3 text-white/30">
                    Choose your coin and network at checkout
                  </span>
                </span>
              </span>
              <CoinStack />
            </button>
          </aside>
        </div>

        {/* ============================ MAIN PANEL (full width) ============================ */}
        <div className="mt-8 border border-white/10 bg-white/[0.02] p-4 sm:p-6">
          {/* ---------- Choose Your Path ---------- */}
          <div>
            <SectionChip>Choose Your Path To Funding</SectionChip>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((p) => {
                const selected = p.id === planId;
                const price = amount * p.multiplier;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    aria-pressed={selected}
                    ref={(el) => {
                      if (!el) return;
                      el.style.setProperty(
                        "background",
                        selected
                          ? "linear-gradient(rgba(153,128,74,0.22), rgba(153,128,74,0.22)), #1E1B15"
                          : "#232323",
                      );
                      el.style.setProperty("border-width", "1px", "important");
                    }}
                    className={cn(
                      "relative isolate flex h-[84px] w-full items-center overflow-hidden border-solid px-3 text-left transition-colors",
                      "outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:shadow-none",
                      "[box-shadow:none!important] [filter:none!important] [-webkit-tap-highlight-color:transparent]",
                      "before:!hidden after:!hidden",
                      selected
                        ? "border-[#99804A]/60"
                        : "border-white/[0.06] hover:border-white/20",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <PlanIcon icon={p.icon} iconGolden={p.iconGolden} selected={selected} />
                      <span>
                        <span className="block text-[13px] leading-4 text-white/80">
                          {p.name}
                        </span>
                        <span
                          className={cn(
                            "mt-1 block text-[24px] leading-[28px]",
                            selected ? "text-[#B79F68]" : "text-white",
                          )}
                        >
                          {p.label}
                        </span>
                      </span>
                    </span>

                    {/* radio */}
                    <span
                      className={cn(
                        "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-[1.5px]",
                        selected ? "border-[#C9B27C]" : "border-white/60",
                      )}
                    >
                      {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#C9B27C]" />}
                    </span>

                    {/* price */}
                    <span className="absolute bottom-3 right-3 text-[15px] leading-none text-white">
                      {moneyWhole(price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---------- Build Your Rules: sirf "Capital Your Way" par ---------- */}
          {isCustom && (
            <div className="mt-7">
              <SectionChip>Capital Your Way</SectionChip>

              {/* Dropdowns: sirf "Capital Your Way" par */}
              <Panel className="mt-4 grid gap-x-4 gap-y-5 px-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Profit Target"
                  value={profitTarget}
                  options={PROFIT_TARGETS}
                  onChange={setProfitTarget}
                />
                <SelectField
                  label="Daily Loss"
                  value={dailyLoss}
                  options={DAILY_LOSS}
                  onChange={setDailyLoss}
                />
                <SelectField
                  label="Static Max Drawdown"
                  value={drawdown}
                  options={DRAWDOWN}
                  onChange={setDrawdown}
                />
                <SelectField
                  label="Starting Profit Split"
                  value={profitSplit}
                  options={PROFIT_SPLITS}
                  onChange={setProfitSplit}
                />
              </Panel>
            </div>
          )}

          {/* ---------- Choose Payment Amount: hamesha dikhega ---------- */}
          <div className="mt-7">
            <SectionChip>Choose Payment Amount</SectionChip>

            <Panel className="mt-4 flex flex-col gap-6 px-4 py-5 lg:flex-row lg:items-center lg:gap-10">
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="flex h-[34px] items-center gap-2 bg-white/[0.06] px-3">
                  <span className="text-[10px] text-white/50">USD:</span>
                  <span className="text-[14px] text-white">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    step={STEP}
                    value={amount}
                    onChange={(e) => setClamped(Number(e.target.value))}
                    className="-ml-1.5 w-12 bg-transparent text-[14px] text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <LuChevronsUpDown className="pointer-events-none h-3.5 w-3.5 text-white/60" />
                </label>

                {PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => addAmount(v)}
                    className={cn(
                      "h-[34px] border bg-transparent px-3 text-[12px] font-normal outline-none transition-colors",
                      amount === v
                        ? "border-[#99804A]/70 text-white/70"
                        : "border-white/[0.06] text-white/50 hover:border-white/15",
                    )}
                  >
                    ${v.toLocaleString("en-US")}
                  </button>
                ))}
              </div>

              <div className="min-w-0 flex-1">
                <input
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={STEP}
                  value={amount}
                  onChange={(e) => setClamped(Number(e.target.value))}
                  aria-label="Payment amount"
                  style={{
                    background: `linear-gradient(90deg, #FFFFFF 0%, #99804A ${sliderFill}%, rgba(255,255,255,0.08) ${sliderFill}%, rgba(255,255,255,0.08) 100%)`,
                  }}
                  className="h-[6px] w-full cursor-pointer appearance-none rounded-full outline-none
    [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
    [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
                />
                <div className="mt-3 flex justify-between text-[10px] leading-3 text-white/40">
                  <span>${MIN_AMOUNT}</span>
                  <span>${MAX_AMOUNT.toLocaleString("en-US")}</span>
                </div>
              </div>
            </Panel>
          </div>

          {/* ---------- Discounts (hamesha dikhta hai) ---------- */}

          {/* ---------- Your Challenge ---------- */}
          <div className="mt-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionChip>Your Challenge</SectionChip>
              <a
                href={`/rules${RULE_HASH[planId]}`}
                className="group ml-auto inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] text-white/80 hover:text-white"
              >
                <span className="underline underline-offset-2">
                  Compare Account Rules
                </span>
                <LuArrowUpRight className="h-3 w-3" />
              </a>
            </div>

            {/* Gold gradient panel: 10px left/right gold border, horizontal gradient fill */}
            <div
              className="mt-4 border-x-[10px] border-solid border-[#99804A] py-2"
              style={{
                background:
                  "linear-gradient(90deg, rgba(153,128,74,0) 0%, rgba(153,128,74,0.32) 55%, rgba(153,128,74,0.1) 100%)",
              }}
            >
              <div className="mx-auto w-full max-w-[1000px]">
                {/* row 1 */}
                <div className="grid grid-cols-2 lg:grid-cols-5">
                  <Stat label="Challenge phase" value={plan.challenge ? "Yes" : "No"} className={cn(V, H)} />
                  <Stat label="Profit target" value={r.profitTarget} className={cn(H, LV)} />
                  <Stat label="Max loss" value={r.maxLoss} className={cn(V, H)} />
                  <Stat label="Daily loss limit" value={r.dailyLoss} className={cn(H, LV)} />
                  <Stat
                    label="Initial daily equity floor"
                    value={moneyWhole(floorOf(balance, r.dailyLoss))}
                    className="max-lg:hidden"
                  />
                </div>

                {/* desktop par dono rows ke darmiyan line (sides se gap ke saath) */}
                <div className="mx-8 max-lg:hidden" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

                {/* row 2 */}
                <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
                  <Stat
                    label="Static equity floor"
                    value={moneyWhole(floorOf(balance, r.maxLoss))}
                    className={cn(V, H)}
                  />
                  <Stat label="Minimum days" value="0" className={cn(H, LV)} />
                  <Stat
                    label="Payout split"
                    value={r.profitSplit}
                    className={cn(H, LV, "max-lg:col-span-2 max-lg:before:left-16 max-lg:before:right-16")}
                  />
                  <Stat
                    label="Payout frequency"
                    value="One per account every 24 hours"
                    className="max-lg:col-span-2 max-lg:[&>span:last-child]:text-[15px]"
                  />
                </div>
              </div>
            </div>

            {/* Payment summary strip */}

            {/* Agreement */}

            {/* Get Funded: full width, white -> gold gradient */}
            <button
              type="button"
              style={{
                background: "linear-gradient(90deg, #FFFFFF 0%, #99804A 100%)",
              }}
              className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 text-black outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-[14px]">Get Funded</span>
              <span className="text-[22px] leading-none">{money(total)}</span>
            </button>

          </div>
        </div>
      </section>
    </Root>
  );
}