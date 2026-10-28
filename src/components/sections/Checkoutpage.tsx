"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LuArrowUpRight,
  LuCheck,
  LuChevronDown,
  LuInfo,
  LuWallet,
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
    logo: "/images/explore/logo1.png",
  },
  {
    id: "breeze",
    name: "Breeze",
    label: "80×",
    multiplier: 80,
    tag: "Trader favorite",
    logo: "/images/explore/logo2.png",
  },
  {
    id: "instant",
    name: "Instant",
    label: "40×",
    multiplier: 40,
    tag: "Immediate funding",
    logo: "/images/explore/logo3.png",
  },
  {
    id: "custom",
    name: "Capital Your Way",
    label: "40-220×",
    multiplier: CUSTOM_MULTIPLIER,
    tag: "Custom power range",
    logo: "/images/explore/logo4.png",
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
    <span className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] leading-none text-white/60">
      <Image
        src="/images/explore/ringlogo.png"
        alt=""
        width={14}
        height={14}
        className="h-3.5 w-3.5 rounded-full"
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
      <span className="mb-2 block text-[11px] text-white/60">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none border border-white/10 bg-white/[0.04] px-3 text-[12px] text-white outline-none focus:border-[#99804A]/60"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#111111]">
              {o}
            </option>
          ))}
        </select>
        <LuChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
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
      <span className="mb-2 block text-[11px] text-white/60">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full border border-white/10 bg-white/[0.04] px-3 text-[12px] text-white outline-none placeholder:text-white/30 focus:border-[#99804A]/60"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-white/40">{label}</span>
      <span className="text-white/70">{value}</span>
    </div>
  );
}

function CoinStack({ small = false }: { small?: boolean }) {
  return (
    <Image
      src="/images/explore/cryptologos.png"
      alt="Crypto"
      width={small ? 80 : 110}
      height={small ? 16 : 22}
      className={small ? "h-4 w-auto" : "h-[22px] w-auto"}
    />
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
  const balance = amount * plan.multiplier;
  const discount = 0; // coupon logic yahan connect karna
  const total = Math.max(amount - discount, 0);

  const setClamped = (n: number) =>
    setAmount(Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, Math.round(n) || MIN_AMOUNT)));

  const sliderFill = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;

  return (
    <main className="min-h-screen pt-nav text-foreground">
      {/* Full width + Navbar jaisi padding (px-6 / lg:px-20) */}
      <section className="w-full px-6 pb-24 pt-10 lg:px-20">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">
          {/* ============================ LEFT ============================ */}
          <div className="min-w-0">
            <h1 className="max-w-[560px] text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-white md:text-[48px]">
              Crypto Payments. Greater Trading Potential.
            </h1>
            <p className="mt-6 max-w-[480px] text-[13px] leading-relaxed text-muted">
              Pick your account size, customize your payment amount, and check
              out with crypto in just a few steps. Your pricing stays protected
              throughout the checkout process.
            </p>

            {/* ---------- Choose Your Path ---------- */}
            <div className="mt-10">
              <SectionChip>Choose Your Path To Funding</SectionChip>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PLANS.map((p) => {
                  const selected = p.id === planId;
                  const price = amount * p.multiplier;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlanId(p.id)}
                      aria-pressed={selected}
                      className={cn(
                        "relative flex h-[111px] flex-col justify-between border p-3 text-left outline-none transition-colors",
                        selected
                          ? "border-[#99804A]/70 bg-gradient-to-br from-[#99804A]/30 via-[#99804A]/10 to-white/[0.03]"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20",
                      )}
                    >
                      <span className="flex items-start gap-3">
                        <Image
                          src={p.logo}
                          alt={p.name}
                          width={46}
                          height={46}
                          className="h-[46px] w-[46px] shrink-0"
                        />
                        <span>
                          <span
                            className={cn(
                              "block text-[11px]",
                              selected ? "text-[#E8D4A0]" : "text-white/60",
                            )}
                          >
                            {p.name}
                          </span>
                          <span
                            className={cn(
                              "mt-1 block text-[22px] leading-none",
                              selected ? "text-[#B8A06A]" : "text-white",
                            )}
                          >
                            {p.label}
                          </span>
                        </span>
                      </span>

                      {/* radio */}
                      <span
                        className={cn(
                          "absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full border",
                          selected ? "border-[#99804A]" : "border-white/40",
                        )}
                      >
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-[#99804A]" />
                        )}
                      </span>

                      <span className="flex items-center justify-between text-[10px] text-white/40">
                        <span className="flex items-center gap-1.5">
                          {p.tag}
                          <LuInfo className="h-3 w-3" />
                        </span>
                        <span className="text-[11px] text-white">
                          {money(price)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ---------- Build Your Rules ---------- */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <SectionChip>
                  Build Your Rules · {plan.multiplier}× Multiplier
                </SectionChip>
                <a
                  href="/rules"
                  className="inline-flex items-center gap-1.5 text-[11px] text-white/70 underline underline-offset-2 hover:text-white"
                >
                  Compare Account Rules
                  <LuArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              <Panel className="mt-4 grid gap-x-3 gap-y-4 p-3 sm:grid-cols-2">
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

            {/* ---------- Choose Payment Amount ---------- */}
            <div className="mt-8">
              <SectionChip>Choose Payment Amount</SectionChip>

              <Panel className="mt-4 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex h-8 items-center gap-2 border border-white/10 bg-white/[0.04] px-3">
                    <span className="text-[10px] text-white/50">USD:</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      value={amount}
                      onChange={(e) => setClamped(Number(e.target.value))}
                      className="w-14 bg-transparent text-[13px] font-medium text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </label>

                  {PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setClamped(v)}
                      className={cn(
                        "h-8 border px-3 text-[11px] outline-none transition-colors",
                        amount === v
                          ? "border-[#99804A]/70 bg-[#99804A]/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20",
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
                  className="mt-5 h-[3px] w-full cursor-pointer appearance-none rounded-full outline-none
                    [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                    [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
                />
                <div className="mt-2 flex justify-between text-[10px] text-white/40">
                  <span>${MIN_AMOUNT}</span>
                  <span>${MAX_AMOUNT.toLocaleString("en-US")}</span>
                </div>
              </Panel>
            </div>

            {/* ---------- Discounts ---------- */}
            <div className="mt-8">
              <SectionChip>Discounts &amp; Referral Bonus</SectionChip>

              <Panel className="mt-4 grid gap-3 p-3 sm:grid-cols-2">
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
          <aside className="min-w-0 lg:sticky lg:top-24">
            {/* Fee -> Balance */}
            <div className="flex items-start justify-end gap-6">
              <div>
                <p className="text-[10px] text-white/50">Challenge Fee</p>
                <p className="mt-1 text-[22px] leading-none text-white">
                  {money(amount)}
                </p>
              </div>
              <span className="mt-5 text-white/40">→</span>
              <div>
                <p className="text-[10px] text-white/50">Account Balance</p>
                <p className="mt-1 text-[22px] leading-none text-white">
                  {money(balance)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-4 text-[9px] text-white/50">
              <span className="flex items-center gap-1">
                <LuCheck className="h-3 w-3 text-green-500" /> No KYC required
              </span>
              <span className="flex items-center gap-1">
                <LuCheck className="h-3 w-3 text-green-500" />
                {plan.multiplier}× trading capital
              </span>
            </div>

            {/* Cryptocurrency picker */}
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-between border border-white/10 bg-white/[0.03] px-3 py-3 text-left outline-none hover:border-white/20"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/[0.06] text-white/60">
                  <LuWallet className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[11px] text-white">
                    Cryptocurrency
                  </span>
                  <span className="block text-[9px] text-white/40">
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

            <Panel className="mt-3">
              {/* You'll trade with */}
              <div className="bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] text-white/60">You&apos;ll Trade With</p>
                <p className="mt-1 text-[32px] leading-none text-white">
                  {money(balance)}
                </p>
                <p className="mt-2 text-[10px] text-white/50">
                  {plan.multiplier}× on your {money(amount)} payment · Capital
                  your way
                </p>
              </div>

              {/* Rules */}
              <div className="space-y-3 px-4 py-5">
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

              <div className="border-t border-white/10 px-4 py-5">
                <div className="space-y-3">
                  <SummaryRow label="Payment amount" value={money(amount)} />
                  <SummaryRow
                    label="Coupon discount"
                    value={`-${money(discount)}`}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 px-4 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50">You pay today</span>
                  <span className="text-[22px] leading-none text-white">
                    {money(total)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Funding account linked to:</span>
                  <span className="text-white">yourname@gmail.com</span>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 appearance-none border border-white/30 bg-transparent checked:border-[#99804A] checked:bg-[#99804A]"
                  />
                  <span className="text-[10px] leading-snug text-white/60">
                    I have read, understood, and agree to all rules and
                    conditions outlined above.
                  </span>
                </label>

                <button
                  type="button"
                  disabled={!agreed}
                  className="mt-5 flex h-10 w-full items-center justify-center rounded-[2px] bg-white text-[12px] text-black outline-none transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Get Funded
                </button>

                <div className="mt-5 flex items-center gap-2 text-[9px] text-white/40">
                  <CoinStack small />
                  Crypto Accepted
                </div>

                <p className="mt-4 text-[9px] leading-relaxed text-white/30">
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