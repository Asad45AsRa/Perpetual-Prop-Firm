"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LuArrowUpRight,
  LuChevronDown,
  LuChevronsUpDown,
  LuInfo,
} from "react-icons/lu";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const CUSTOM_MULTIPLIER = 105;

const PLANS = [
  {
    id: "elite",
    name: "Elite",
    label: "120×",
    multiplier: 120,
    tag: "Highest capital access",
    icon: "/images/checked/logo1.svg",
  },
  {
    id: "breeze",
    name: "Breeze",
    label: "80×",
    multiplier: 80,
    tag: "Trader favorite",
    icon: "/images/checked/logo2.png",
  },
  {
    id: "instant",
    name: "Instant",
    label: "40×",
    multiplier: 40,
    tag: "Immediate funding",
    icon: "/images/checked/logo3.png",
  },
  {
    id: "custom",
    name: "Capital Your Way",
    label: "40-220×",
    multiplier: CUSTOM_MULTIPLIER,
    tag: "Custom power range",
    icon: "/images/checked/logo4.png",
  },
] as const;

const PROFIT_TARGETS = ["6%", "8%", "10%", "12%"];
const DAILY_LOSS = ["3%", "4%", "5%", "6%"];
const DRAWDOWN = ["3%", "4%", "5%", "6%"];
const PROFIT_SPLITS = ["70%", "80%", "90%"];

const PRESETS = [5, 100, 1000, 1500];
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 1500;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const money = (n: number) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const pct = (s: string) => parseFloat(s) / 100;

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

function SectionChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[29px] items-center gap-1.5 border border-white/10 bg-white/[0.06] px-3 text-[11px] leading-none text-white/60">
      <Image
        src="/images/explore/ringlogo.png"
        alt=""
        width={12}
        height={12}
        className="h-3 w-3 rounded-full"
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
    <div className={cn("border border-white/10 bg-white/[0.03]", className)}>
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
      <span className="mb-2 block text-[12px] leading-4 text-white/70">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none border border-white/10 bg-white/[0.05] px-3 text-[12px] font-medium text-white outline-none focus:border-[#99804A]/60"
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
      <span className="mb-2 block text-[12px] leading-4 text-white/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full border border-white/10 bg-white/[0.05] px-3 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-[#99804A]/60"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-4 items-center justify-between text-[12px] leading-4">
      <span className="text-white/40">{label}</span>
      <span className="text-white/70">{value}</span>
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

function PlanIcon({ icon, selected }: { icon: string; selected: boolean }) {
  return (
    <span
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center border transition-colors",
        selected
          ? "border-[#99804A]/40 bg-[#99804A]/20"
          : "border-white/20 bg-white/[0.06]",
      )}
    >
      <Image
        src={icon}
        alt=""
        width={40}
        height={40}
        className="h-7 w-7 object-contain"
      />
    </span>
  );
}


/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function CheckoutPage() {
  const [planId, setPlanId] = useState<(typeof PLANS)[number]["id"]>("custom");
  const [amount, setAmount] = useState(5);

  const [profitTarget, setProfitTarget] = useState("8%");
  const [dailyLoss, setDailyLoss] = useState("5%");
  const [drawdown, setDrawdown] = useState("4%");
  const [profitSplit, setProfitSplit] = useState("90%");

  const [coupon, setCoupon] = useState("");
  const [referral, setReferral] = useState("");
  const [agreed, setAgreed] = useState(false);

  const plan = PLANS.find((p) => p.id === planId)!;
  const isCustom = planId === "custom";
  const balance = amount * plan.multiplier;
  const discount = 0; // coupon logic yahan connect karna
  const total = Math.max(amount - discount, 0);

  const setClamped = (n: number) =>
    setAmount(Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, Math.round(n) || MIN_AMOUNT)));

  // Preset buttons add karte hain: $5 x3 = 15, $100 x2 = 200
  const addAmount = (n: number) => setClamped(amount + n);

  const sliderFill = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;

  return (
    <main className="min-h-screen pt-[78px] text-foreground">
      {/* Figma: 1440 frame, 80px side padding */}
      <section className="w-full px-6 pb-24 pt-11 lg:px-20">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_466px] lg:items-stretch lg:gap-6">
          {/* ============================ LEFT ============================ */}
          <div className="min-w-0">
            <h1 className="text-[40px] font-normal leading-[1.1] tracking-[-0.03em] text-white md:text-[48px]">
              Crypto Payments.
              <br />
              Greater Trading Potential.
            </h1>
            <p className="mt-5 max-w-[560px] text-[15px] leading-[20px] text-muted">
              Pick your account size, customize your payment amount, and check
              out with crypto in just a few steps. Your pricing stays protected
              throughout the checkout process.
            </p>

            {/* ---------- Choose Your Path ---------- */}
            <div className="mt-9">
              <SectionChip>Choose Your Path To Funding</SectionChip>

              <div className="mt-6 grid gap-[14px] sm:grid-cols-2">
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
                            ? "radial-gradient(32% 75% at 88% 105%, rgba(195,176,128,0.50) 0%, rgba(153,128,74,0.20) 55%, rgba(153,128,74,0) 100%), linear-gradient(180deg, rgba(153,128,74,0.16) 0%, rgba(153,128,74,0) 30%, rgba(153,128,74,0) 60%, rgba(153,128,74,0.14) 100%), linear-gradient(120deg, #26221A 0%, #1B1813 50%, #231F17 100%)"
                            : "linear-gradient(135deg, #1C1C1C 0%, #141414 100%)",
                          "important",
                        );
                        el.style.setProperty("border-width", "0.7px", "important");
                      }}
                      className={cn(
                        "relative isolate flex h-[148px] w-full flex-col justify-between overflow-hidden border-solid p-4 text-left transition-colors",
                        "outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:shadow-none",
                        "[box-shadow:none!important] [filter:none!important] [-webkit-tap-highlight-color:transparent]",
                        "before:!hidden after:!hidden",
                        selected
                          ? "border-[#99804A]/20"
                          : "border-white/[0.15] hover:border-white/30",
                      )}
                    >
                      <span className="flex items-center gap-3.5">
                        <PlanIcon icon={p.icon} selected={selected} />
                        <span>
                          <span
                            className={cn(
                              "block text-[12px] leading-4",
                              selected ? "text-[#E3D3A6]" : "text-white/70",
                            )}
                          >
                            {p.name}
                          </span>
                          <span
                            className={cn(
                              "mt-1 block text-[28px] leading-[32px]",
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
                          "absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-[1.5px]",
                          selected ? "border-[#C9B27C]" : "border-white/60",
                        )}
                      >
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#C9B27C]" />}
                      </span>

                      {/* bottom row + divider */}
                      <span className="flex items-center justify-between border-t border-white/10 pt-3.5">
                        <span className="flex items-center gap-1.5 text-[12px] uppercase leading-none tracking-wide text-muted/80">
                          {p.tag}
                          <LuInfo className="h-3 w-3" />
                        </span>
                        <span className="text-[12px]  leading-none text-white">
                          {money(price)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---------- Build Your Rules: sirf "Capital Your Way" par ---------- */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {isCustom ? (
                  <SectionChip>
                    Build Your Rules · {plan.multiplier}× Multiplier
                  </SectionChip>
                ) : (
                  <SectionChip>Account Rules</SectionChip>
                )}
                <a
                  href="/rules"
                  className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] text-white/80 hover:text-white"
                >
                  <span className="underline underline-offset-2">
                    Compare Account Rules
                  </span>
                  <LuArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              {/* Dropdowns: sirf "Capital Your Way" par */}
              {isCustom && (
                <Panel className="mt-6 grid gap-x-4 gap-y-5 px-4 py-5 sm:grid-cols-2 text-[10px] font-muted/80">
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
              )}
            </div>
            {/* ---------- Choose Payment Amount: hamesha dikhega ---------- */}
            <div className="mt-6">
              <SectionChip>Choose Payment Amount</SectionChip>

              <Panel className="mt-6 px-4 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex h-[34px] items-center gap-2 border border-white/10 bg-white/[0.05] px-3">
                    <span className="text-[10px] text-white/50">USD:</span>
                    <span className="text-[13px] font-medium text-white">$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      value={amount}
                      onChange={(e) => setClamped(Number(e.target.value))}
                      className="-ml-1.5 w-12 bg-transparent text-[13px] font-medium text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <LuChevronsUpDown className="pointer-events-none h-3.5 w-3.5 text-white/60" />
                  </label>

                  {PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => addAmount(v)}
                      className={cn(
                        "h-[34px] border px-3 text-[12px] font-medium outline-none transition-colors",
                        amount === v
                          ? "border-[#99804A] bg-[#99804A]/15 text-white"
                          : "border-white/10 bg-white/[0.05] text-white/80 hover:border-white/20",
                      )}
                    >
                      ${v.toLocaleString("en-US")}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={1}
                  value={amount}
                  onChange={(e) => setClamped(Number(e.target.value))}
                  aria-label="Payment amount"
                  style={{
                    background: `linear-gradient(90deg, #99804A ${sliderFill}%, rgba(255,255,255,0.12) ${sliderFill}%)`,
                  }}
                  className="mt-6 h-[3px] w-full cursor-pointer appearance-none rounded-full outline-none
                    [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                    [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
                />
                <div className="mt-3 flex justify-between text-[10px] leading-3 text-white/40">
                  <span>${MIN_AMOUNT}</span>
                  <span>${MAX_AMOUNT.toLocaleString("en-US")}</span>
                </div>
              </Panel>
            </div>

            {/* ---------- Discounts (hamesha dikhta hai) ---------- */}
            <div className="mt-6">
              <SectionChip>Discounts &amp; Referral Bonus</SectionChip>

              <Panel className="mt-6 grid gap-x-4 gap-y-5 px-4 py-5 sm:grid-cols-2">
                <TextField
                  label="Coupon Code"
                  placeholder="Enter coupon"
                  value={coupon}
                  onChange={setCoupon}
                />
                <TextField
                  label="Affiliate Referral Code"
                  placeholder="Enter referral code"
                  value={referral}
                  onChange={setReferral}
                />
              </Panel>
            </div>
          </div>

          {/* ============================ RIGHT ============================ */}
          <aside className="flex min-w-0 flex-col lg:pt-3">            {/* Fee -> Balance */}
            <div className="flex items-start justify-end gap-6">
              <div>
                <p className="text-[10px] leading-4 text-white/50">Challenge Fee</p>
                <p className="mt-1.5 text-[26px] leading-[28px] text-white">
                  {money(amount)}
                </p>
              </div>
              <span className="mt-6 text-white/40">→</span>
              <div>
                <p className="text-[10px] leading-4 text-white/50">Account Balance</p>
                <p className="mt-1.5 text-[26px] leading-[28px] text-white">
                  {money(balance)}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-4 text-[10px] leading-4 text-white/50">
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
                <span className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.06]">
                  <Image
                    src="/images/checked/btc.png"
                    alt="Bitcoin"
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                </span>
                <span>
                  <span className="block text-[12px] leading-4 text-white">
                    Cryptocurrency
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-3 text-white/40">
                    Choose your coin and network at checkout
                  </span>
                </span>
              </span>
              <CoinStack />
            </button>

            {/* Your Challenge */}
            <div className="mt-6">
              <SectionChip>Your Challenge</SectionChip>
            </div>

            <Panel className="mt-6 flex flex-1 flex-col">
              {/* You'll trade with */}
              <div className="bg-white/[0.05] px-6 pb-3 pt-3">
                <p className="text-[12px] leading-4 text-white/60">You&apos;ll Trade With</p>
                <p className="mt-2 text-[36px] leading-[36px] text-white">
                  {money(balance)}
                </p>
                <p className="mt-2 text-[10px] leading-[14px] text-white/50">
                  {plan.multiplier}× on your {money(amount)} payment · Capital
                  your way
                </p>
              </div>

              {/* Rules */}
              <div className="space-y-4 px-6 py-7 text-muted/90 font-light">
                <SummaryRow label="Challenge phase" value="Yes" />
                <SummaryRow label="Profit target" value={profitTarget} />
                <SummaryRow label="Max loss" value={dailyLoss} />
                <SummaryRow label="Daily loss limit" value={drawdown} />
                <SummaryRow label="Account access" value="Personal" />
                <SummaryRow
                  label="Initial daily equity floor"
                  value={money(balance * (1 - pct(drawdown)))}
                />
                <SummaryRow
                  label="Static equity floor"
                  value={money(balance * (1 - pct(dailyLoss)))}
                />
                <SummaryRow label="Minimum days" value="0" />
                <SummaryRow label="Payout split" value={profitSplit} />
                <SummaryRow
                  label="Payout frequency"
                  value="One per account every 24 hours"
                />
              </div>

              <div className="border-t border-white/10 px-6 py-7">
                <div className="space-y-4">
                  <SummaryRow label="Payment amount" value={money(amount)} />
                  <SummaryRow
                    label="Coupon discount"
                    value={`-${money(discount)}`}
                  />
                </div>
              </div>

              <div className="flex-1 border-t border-white/10 px-6 py-7">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] leading-4 text-white/50">You pay today</span>
                  <span className="text-[26px] leading-[28px] text-white">
                    {money(total)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] leading-4">
                  <span className="text-white/40">Funding account linked to:</span>
                  <span className="text-white">yourname@gmail.com</span>
                </div>

                <label className="group mt-6 flex cursor-pointer items-start gap-3">
                  <span className="relative mt-px h-[18px] w-[18px] shrink-0">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[4px] border border-white/25 bg-white/[0.04] outline-none transition-all duration-200 group-hover:border-[#B79F68]/70 checked:border-[#C9B27C] checked:bg-[linear-gradient(135deg,#D9C58F_0%,#A38A52_100%)] checked:shadow-[0_0_10px_rgba(183,159,104,0.45)] focus-visible:ring-2 focus-visible:ring-[#B79F68]/50"
                    />
                    <svg
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden
                      className="pointer-events-none absolute inset-0 h-[18px] w-[18px] scale-50 opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100"
                    >
                      <path
                        d="M4.5 9.3l3 3 6-6.4"
                        stroke="#1A150B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[12px] leading-[18px] text-white/60 transition-colors group-hover:text-white/80">
                    I have read, understood, and agree to all rules and
                    conditions outlined above.
                  </span>
                </label>

                <button
                  type="button"
                  disabled={!agreed}
                  className="mt-7 flex h-10 w-full items-center justify-center rounded-[2px] bg-white text-[12px] text-black outline-none disabled:cursor-not-allowed"
                >
                  Get Funded
                </button>

                <div className="mt-6 flex items-center gap-2 text-[10px] leading-3 text-white/40">
                  <CoinStack small />
                  Crypto Accepted
                </div>

                <p className="mt-4 text-[10px] leading-4 text-white/40">
                  Your plan determines your trading power and account size.
                  Discounts apply only to the activation fee and do not change
                  your selected account size. The activation fee covers access
                  to your chosen plan; it is not a trading deposit or an amount
                  added to your trading balance. Review your account size,
                  applicable fee, trading rules, and additional conditions
                  before completing your purchase. All account settings,
                  pricing, and plan conditions are finalized at checkout.
                </p>
              </div>
            </Panel>
          </aside>
        </div>
      </section>
    </main>
  );
}