// Pure maths for challenge plans, shared by the plan form checks and the plan calculator.
// Keeping it in one file means the admin console and the trader checkout can never disagree.
//
// Formulas (verified against the trader checkout: $5 payment x 105 = $525 account):
//   account size            = payment x multiplier
//   initial daily floor     = account size x (1 - daily loss %)       e.g. 525 x 0.96 = 504.00
//   static equity floor     = account size x (1 - max loss %)         e.g. 525 x 0.95 = 498.75
//   profit target amount    = account size x profit target %

export type Row = Record<string, unknown>;

export const round2 = (n: number) => Math.round(n * 100) / 100;

// "8, 10, 12" -> [8, 10, 12]. Anything that is not a positive number is ignored.
export function parseOptions(text: unknown): number[] {
  return String(text ?? "")
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export type PlanInput = {
  payment: number;
  multiplier: number;
  dailyLossPct: number;
  maxLossPct: number;
  profitTargetPct: number;
  profitSplitPct: number;
};

export type PlanPreview = {
  accountSize: number;
  initialDailyEquityFloor: number;
  staticEquityFloor: number;
  profitTargetAmount: number;
  dailyLossAmount: number;
  maxLossAmount: number;
};

export function previewPlan(i: PlanInput): PlanPreview {
  const accountSize = round2(i.payment * i.multiplier);
  return {
    accountSize,
    initialDailyEquityFloor: round2(accountSize * (1 - i.dailyLossPct / 100)),
    staticEquityFloor: round2(accountSize * (1 - i.maxLossPct / 100)),
    profitTargetAmount: round2((accountSize * i.profitTargetPct) / 100),
    dailyLossAmount: round2((accountSize * i.dailyLossPct) / 100),
    maxLossAmount: round2((accountSize * i.maxLossPct) / 100),
  };
}

// Returns a list of plain-English problems. An empty list means the choice is allowed for this plan.
// Only meaningful for "custom" plans (Capital Your Way); fixed plans always return an empty list.
export function checkCustomChoice(plan: Row, i: PlanInput): string[] {
  if (plan.planType !== "custom") return [];
  const problems: string[] = [];
  const inside = (value: number, min: unknown, max: unknown) => value >= Number(min) && value <= Number(max);

  if (!inside(i.payment, plan.paymentMin, plan.paymentMax)) problems.push(`Payment must be between $${plan.paymentMin} and $${plan.paymentMax}.`);
  if (!inside(i.multiplier, plan.multiplierMin, plan.multiplierMax)) problems.push(`Multiplier must be between ${plan.multiplierMin}x and ${plan.multiplierMax}x.`);

  const lists: [string, number, unknown][] = [
    ["Profit target", i.profitTargetPct, plan.profitTargetOptions],
    ["Daily loss", i.dailyLossPct, plan.dailyLossOptions],
    ["Max drawdown", i.maxLossPct, plan.maxLossOptions],
    ["Profit split", i.profitSplitPct, plan.profitSplitOptions],
  ];
  lists.forEach(([label, value, raw]) => {
    const allowed = parseOptions(raw);
    if (allowed.length > 0 && !allowed.includes(value)) problems.push(`${label} ${value}% is not an allowed choice (${allowed.join(", ")}).`);
  });

  if (i.dailyLossPct > i.maxLossPct) problems.push("Daily loss cannot be larger than the max drawdown.");
  return problems;
}

// Used by the mock backend and as a reference for the real one: checks a plan row before it is saved.
// Returns the first problem as text, or an empty string when the plan is valid.
export function validatePlanRow(plan: Row): string {
  const numbers = ["capital", "price", "profitTarget", "dailyLoss", "maxLoss", "profitSplit"];
  for (const key of numbers) {
    if (!(Number(plan[key]) > 0)) return `${key} must be a number above zero.`;
  }
  if (Number(plan.profitSplit) > 100) return "Profit split cannot be above 100%.";
  if (Number(plan.dailyLoss) > Number(plan.maxLoss)) return "Daily loss cannot be larger than the max drawdown.";

  // Per-plan overrides are text so that an empty box can mean "use the global value"
  for (const key of ["takerFeePct", "makerFeePct", "maxExposurePct", "holdHours"]) {
    const raw = String(plan[key] ?? "").trim();
    if (raw !== "" && !(Number.isFinite(Number(raw)) && Number(raw) >= 0)) return `${key} must be empty or a number of zero or more.`;
  }

  if (plan.planType === "custom") {
    if (!(Number(plan.multiplierMin) > 0) || Number(plan.multiplierMin) > Number(plan.multiplierMax)) return "Set a multiplier range, for example 40 to 220.";
    if (!(Number(plan.paymentMin) > 0) || Number(plan.paymentMin) > Number(plan.paymentMax)) return "Set a payment range, for example $5 to $1,500.";
    for (const key of ["profitTargetOptions", "dailyLossOptions", "maxLossOptions", "profitSplitOptions"]) {
      if (parseOptions(plan[key]).length === 0) return `${key} needs at least one number, for example 8, 10, 12.`;
    }
  }
  return "";
}
