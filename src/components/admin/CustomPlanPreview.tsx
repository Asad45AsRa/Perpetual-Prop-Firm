"use client";

import { useState } from "react";
import { checkCustomChoice, parseOptions, previewPlan } from "./planMath";
import { formatMoney, FormField, SelectInput, TextInput } from "./ui";

type Row = Record<string, unknown>;

// Detail tab of the Challenge Plans page.
// Shows what a trader gets for a given choice: account size, the two equity floors and the money
// amounts behind each percentage. For a custom plan ("Capital Your Way") the person can try any
// choice and is told when it falls outside the ranges the plan allows.
export function CustomPlanPreview({ plan }: { plan: Row }) {
  const custom = plan.planType === "custom";

  const [payment, setPayment] = useState(String(plan.price));
  const [multiplier, setMultiplier] = useState(String(plan.multiplier || Number(plan.capital) / Number(plan.price)));
  const [dailyLoss, setDailyLoss] = useState(String(plan.dailyLoss));
  const [maxLoss, setMaxLoss] = useState(String(plan.maxLoss));
  const [target, setTarget] = useState(String(plan.profitTarget));
  const [split, setSplit] = useState(String(plan.profitSplit));

  const input = {
    payment: Number(payment) || 0,
    multiplier: Number(multiplier) || 0,
    dailyLossPct: Number(dailyLoss) || 0,
    maxLossPct: Number(maxLoss) || 0,
    profitTargetPct: Number(target) || 0,
    profitSplitPct: Number(split) || 0,
  };
  const result = previewPlan(input);
  const problems = checkCustomChoice(plan, input);

  // A fixed plan has one set of rules, so the inputs are read-only and only the results matter
  const optionsFor = (raw: unknown, current: string) => {
    const list = parseOptions(raw).map(String);
    return list.length > 0 ? (list.includes(current) ? list : [current, ...list]) : [current];
  };

  const rows: [string, string][] = [
    ["Account size", formatMoney(result.accountSize)],
    ["Initial daily equity floor", formatMoney(result.initialDailyEquityFloor)],
    ["Static equity floor", formatMoney(result.staticEquityFloor)],
    ["Profit target amount", formatMoney(result.profitTargetAmount)],
    ["Daily loss amount", formatMoney(result.dailyLossAmount)],
    ["Max drawdown amount", formatMoney(result.maxLossAmount)],
  ];

  return (
    <div className="grid gap-5">
      <p className="text-[14px] leading-relaxed text-white/50">
        {custom
          ? "Try any choice a trader could make on the checkout page. The numbers use the same formulas as the trader sees."
          : "This is what a trader gets on this fixed plan. The formulas are the same as on the checkout page."}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Payment ($)" htmlFor="pv-payment">
          <TextInput id="pv-payment" type="number" disabled={!custom} value={payment} onChange={(e) => setPayment(e.target.value)} />
        </FormField>
        <FormField label="Multiplier (x)" htmlFor="pv-mult">
          <TextInput id="pv-mult" type="number" disabled={!custom} value={multiplier} onChange={(e) => setMultiplier(e.target.value)} />
        </FormField>
        <FormField label="Daily loss (%)" htmlFor="pv-daily">
          {custom ? <SelectInput id="pv-daily" options={optionsFor(plan.dailyLossOptions, dailyLoss)} value={dailyLoss} onChange={(e) => setDailyLoss(e.target.value)} /> : <TextInput id="pv-daily" disabled value={dailyLoss} readOnly />}
        </FormField>
        <FormField label="Max drawdown (%)" htmlFor="pv-max">
          {custom ? <SelectInput id="pv-max" options={optionsFor(plan.maxLossOptions, maxLoss)} value={maxLoss} onChange={(e) => setMaxLoss(e.target.value)} /> : <TextInput id="pv-max" disabled value={maxLoss} readOnly />}
        </FormField>
        <FormField label="Profit target (%)" htmlFor="pv-target">
          {custom ? <SelectInput id="pv-target" options={optionsFor(plan.profitTargetOptions, target)} value={target} onChange={(e) => setTarget(e.target.value)} /> : <TextInput id="pv-target" disabled value={target} readOnly />}
        </FormField>
        <FormField label="Profit split (%)" htmlFor="pv-split">
          {custom ? <SelectInput id="pv-split" options={optionsFor(plan.profitSplitOptions, split)} value={split} onChange={(e) => setSplit(e.target.value)} /> : <TextInput id="pv-split" disabled value={split} readOnly />}
        </FormField>
      </div>

      {problems.length > 0 && (
        <ul role="alert" className="border-[0.7px] border-red-500/40 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}

      <ul>
        {rows.map(([label, value]) => (
          <li key={label} className="flex justify-between gap-4 border-b border-white/[0.06] py-3 text-[15px] text-white/50 last:border-0">
            <span>{label}</span>
            <b className="font-normal text-white">{value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
