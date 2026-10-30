"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ────────────────────────────── TYPES ────────────────────────────── */

type Node =
  | { t: "h3"; x: string }
  | { t: "p"; x: string }
  | { t: "f"; x: string } // formula / highlighted line (white)
  | { t: "ul"; x: string[] }
  | { t: "ol"; x: string[] }
  | { t: "new"; x: string };

type Section = { n: string; title: string; nodes: Node[] };

type Item = { id: string; label: string; sections: Section[] };
type Group = { label: string; items: Item[] };

const h3 = (x: string): Node => ({ t: "h3", x });
const p = (x: string): Node => ({ t: "p", x });
const f = (x: string): Node => ({ t: "f", x });
const ul = (...x: string[]): Node => ({ t: "ul", x });
const ol = (...x: string[]): Node => ({ t: "ol", x });
const nw = (x: string): Node => ({ t: "new", x });

/* ────────────────────────── QUICK OVERVIEW ───────────────────────── */

const overviewRows = [
  ["Elite", "120×", "10%", "3%", "6%", "80%"],
  ["Breeze", "80×", "8%", "4%", "7%", "80%"],
  ["Instant", "40×", "None", "3%", "8%", "80%"],
  ["Capital Your Way", "40-220×", "8 / 10 / 12%", "2-5%", "3 / 5 / 6 / 7 / 8%", "80 / 85 / 90%"],
];
const overviewHead = ["Account", "Multiplier", "Target", "Daily Loss", "Static Drawdown", "Split"];

/* ────────────────────────────── CONTENT ──────────────────────────── */

const groups: Group[] = [
  {
    label: "Getting started",
    items: [
      {
        id: "overview",
        label: "Overview",
        sections: [
          {
            n: "01",
            title: "Getting to Know Perpeye",
            nodes: [
              h3("What is Perpeye?"),
              p("Perpeye is a performance-based funded trading platform for perpetual markets."),
              p("Rather than selecting a fixed account size like $10,000, $25,000, or $100,000, traders choose a Deposit amount."),
              p("Perpeye then applies a multiplier to the selected Deposit."),
              f("Trading Power = Deposit × Multiplier"),
              p("For example, a $100 Deposit with a 120× Multiplier gives you $12,000 in Trading Power."),
              p("Your Trading Power sets your simulated balance and trading rule amounts."),
            ],
          },
        ],
      },
      {
        id: "definitions",
        label: "Definitions",
        sections: [
          {
            n: "02",
            title: "Key Account Terms",
            nodes: [
              h3("Deposit"),
              p("The amount selected when purchasing a Perpeye account. It determines your Trading Power."),
              p("Unless stated otherwise, this is an activation payment, not a personal brokerage deposit."),
              p("It is excluded from your withdrawable trading balance."),
              h3("Multiplier"),
              p("Sets your Trading Power based on your selected Deposit."),
              p("$100 × 120 = $12,000"),
              h3("Trading Power"),
              p("The simulated starting balance allocated to your Perpeye account."),
              p("It is neither customer-owned capital nor a custodial balance."),
              h3("Starting Trading Power"),
              p("Your account’s initial Trading Power, used to calculate most risk limits."),
              h3("Balance"),
              p("Account value after closed trades, fees, realised funding payments, and other realised adjustments."),
              p("Open positions are excluded."),
              h3("Equity"),
              p("Your account’s real-time value, including unrealised profit or loss."),
              f("Equity = Balance + Unrealised P&L"),
              p("Accrued costs may also affect equity."),
              h3("Realised P&L"),
              p("Profit or loss recorded after closing a position."),
              h3("Unrealised P&L"),
              p("Current profit or loss on your open positions."),
              h3("Closed Profit"),
              p("Net realised profit after fees, funding, and other applicable trading costs."),
              h3("Mark Price"),
              p("The reference price Perpeye uses to calculate unrealised P&L, margin, and risk."),
              p("Where supported, Perpeye uses the venue’s mark or risk reference price, rather than only its latest trade price."),
              h3("Breach"),
              p("Breaking a hard account rule, such as Daily Loss or Maximum Drawdown."),
              p("The account is disabled, and open positions may close automatically."),
              h3("Trading Day"),
              p("A Perpeye Trading Day runs from **00:00 UTC to 23:59:59 UTC.**"),
              p("Daily risk limits reset at 00:00 UTC."),
            ],
          },
        ],
      },
      {
        id: "account-configurations",
        label: "Account configurations",
        sections: [
          {
            n: "03",
            title: "Perpeye Plans",
            nodes: [
              h3("Elite"),
              p("Multiplier: 120×"),
              p("Built for traders seeking maximum Trading Power."),
              ul(
                "120× Deposit Multiplier",
                "10% evaluation profit target",
                "3% Daily Loss limit",
                "6% Static Maximum Drawdown",
                "80% initial profit split",
                "No minimum trading days",
                "Unlimited evaluation time",
                "No consistency requirement",
                "No minimum trade holding period",
                "On-demand funded payouts"
              ),
              h3("Example"),
              p("$100 Deposit × 120 = $12,000 Trading Power"),
              p("Profit Target: $1,200"),
              p("Daily Loss: 3%"),
              p("Maximum Drawdown: 6%"),
            ],
          },
          {
            n: "04",
            title: "Breeze",
            nodes: [
              p("Multiplier: 80×"),
              p("More room for risk with a lower Trading Power multiplier."),
              ul(
                "80× Deposit Multiplier",
                "8% evaluation profit target",
                "4% Daily Loss limit",
                "7% Static Maximum Drawdown",
                "80% initial profit split",
                "No minimum trading days",
                "Unlimited evaluation time",
                "No consistency requirement",
                "No minimum trade holding period",
                "On-demand funded payouts"
              ),
              h3("Example"),
              p("$100 Deposit × 80 = $8,000 Trading Power"),
              p("Profit Target: $640"),
              p("Daily Loss: 4%"),
              p("Maximum Drawdown: 7%"),
            ],
          },
          {
            n: "05",
            title: "Instant",
            nodes: [
              p("Multiplier: 40×"),
              p("Start directly with a funded account, without an evaluation."),
              ul(
                "40× Deposit Multiplier",
                "No evaluation stage",
                "No profit target",
                "3% Daily Loss limit",
                "6% Static Maximum Drawdown",
                "80% initial profit split",
                "No consistency requirement",
                "No minimum trading days",
                "No expiry while actively used",
                "First payout requires meeting Instant payout qualification rules"
              ),
              h3("Example"),
              p("$100 Deposit × 40 = $4,000 Funded Trading Power"),
              nw(
                "Instant purchases: Total open exposure is limited to 3× current equity, after payout reservations. All entries and markets share this cap; opposing positions do not offset exposure. Leveraged positions count at their current gross notional value. Other positions count at their stake amount. Additional entries, copy trades, and shared-account members all use the same account limit. A drop in equity does not trigger forced closure under this entry cap. Positions can still be closed or reduced. Daily Loss and Maximum Drawdown rules remain in effect. Existing accounts retain their previously saved trading limits."
              ),
            ],
          },
        ],
      },
      {
        id: "capital-your-way",
        label: "Capital Your Way",
        sections: [
          {
            n: "06",
            title: "Capital Your Way",
            nodes: [
              h3("What is Capital Your Way?"),
              p("Capital Your Way lets traders customise their challenge instead of selecting a preset Perpeye plan."),
              p("Choose your preferred:"),
              ul("Profit Target", "Daily Loss", "Maximum Drawdown", "Profit Split"),
              p("Perpeye calculates your account’s Multiplier based on these settings."),
            ],
          },
          {
            n: "07",
            title: "Capital Your Way Options",
            nodes: [
              h3("Profit Target"),
              p("Select: 8%, 10%, or 12%"),
              p("Multiplier adjustments"),
              ul("8% → −10×", "10% → 0×", "12% → +20×"),
              h3("Daily Loss"),
              p("Select: 2%, 3%, 4%, or 5%"),
              p("Multiplier adjustments"),
              ul("2% → +20×", "3% → 0×", "4% → −10×", "5% → −20×"),
              h3("Maximum Drawdown"),
              p("Select: 3%, 5%, 6%, 7%, or 8%"),
              p("Multiplier adjustments"),
              ul("3% → +80×", "5% → +25×", "6% → 0×", "7% → −20×", "8% → −35×"),
              h3("Starting Profit Split"),
              p("Select: 80%, 85%, or 90%"),
              p("Multiplier adjustments"),
              ul("80% → 0×", "85% → −10×", "90% → −20×"),
            ],
          },
          {
            n: "08",
            title: "Capital Your Way Multiplier Calculation",
            nodes: [
              p("Your Multiplier starts at 120× and adjusts according to your selected settings."),
              p("The final Multiplier is capped between 40× and 220×."),
              h3("Example"),
              p("Base Multiplier: 120×"),
              p("12% Profit Target: +20×"),
              p("2% Daily Loss: +20×"),
              p("3% Maximum Drawdown: +80×"),
              p("80% Profit Split: 0×"),
              p("The total is 240×, which exceeds the maximum allowed."),
              p("Your final Multiplier is therefore 220×."),
              f("$100 Deposit × 220 = $22,000 Trading Power"),
            ],
          },
          {
            n: "09",
            title: "Invalid Capital Your Way Combinations",
            nodes: [
              p("Daily Loss cannot be higher than Maximum Drawdown."),
              p("For example:"),
              p("Daily Loss: 5%"),
              p("Maximum Drawdown: 3%"),
              p("The account would breach the Maximum Drawdown limit before reaching its Daily Loss limit, making the extra daily allowance unusable."),
              p("Perpeye’s builder automatically blocks invalid combinations."),
            ],
          },
        ],
      },
      {
        id: "deposit-promotions",
        label: "Deposit & promotions",
        sections: [
          {
            n: "10",
            title: "Deposit Amounts",
            nodes: [
              p("Choose any Deposit from $5 to $1,500, unless a different range is shown."),
              p("You can enter a custom amount instead of selecting a preset value."),
              p("Examples: $50, $75, $100, $137, $250, $500, $1,000, or $1,500."),
            ],
          },
          {
            n: "11",
            title: "Discounts and Deposit Value",
            nodes: [
              p("Promotions lower your checkout payment without changing the Deposit used to calculate Trading Power, unless stated otherwise."),
              h3("Examples"),
              p("Selected Deposit: $100"),
              p("Promotional Discount: 20%"),
              p("Checkout Payment: $80"),
              p("Elite Multiplier: 120×"),
              p("Trading Power: $12,000"),
              p("Your Trading Power is still calculated using the selected $100 Deposit."),
            ],
          },
        ],
      },
      {
        id: "evaluation-activation",
        label: "Evaluation & activation",
        sections: [
          {
            n: "12",
            title: "Evaluation Profit Targets",
            nodes: [
              p("Elite, Breeze, and Capital Your Way evaluations require a profit target. Instant accounts have no profit target."),
              f("Target Equity = Starting Trading Power + Account Profit Target"),
              h3("Automatic Evaluation Completion"),
              p("Evaluations with open perpetual positions can pass automatically when fresh server prices confirm that closing all positions will meet the target. Perpeye closes all perpetual entries together, cancels pending orders, and marks the evaluation as passed. A funded account is then issued with the original Trading Power, subject to the maximum funded capital allocation."),
              h3("Passing Requirements"),
              p("This process applies to new and existing evaluations. Saved profit targets, minimum trading days (if applicable), and Daily Loss and Maximum Drawdown limits remain in effect."),
              p("A breach takes priority over a pass. The target must be reached after applicable costs and settlement rounding. Chart estimates or temporary prices without fresh server confirmation do not guarantee completion."),
              p("If other position types remain open, they must be closed or settled before automatic perpetual completion."),
              p("Accounts with no open positions also pass automatically once their closed Balance reaches the target and all account rules are met."),
              h3("Pass and Fail Lines"),
              p("The terminal’s Pass and Fail price lines estimate account-wide outcomes for the selected market."),
              p("They include current P&L from other markets, assuming those prices remain unchanged. Hedged positions may have no reachable trigger level."),
              p("The Fail line reflects whichever Daily Loss or Maximum Drawdown equity floor would be reached first."),
              h3("Dollar TP/SL"),
              p("Dollar TP/SL amounts define a price trigger for the selected order or grouped position."),
              p("Actual execution may differ from the chosen amount. Account protection rules may also close positions earlier."),
            ],
          },
          {
            n: "13",
            title: "What Happens After Passing?",
            nodes: [
              p("Your evaluation is marked as passed once you reach the profit target without breaking any account rules."),
              p("Funded activation requires no KYC or identity documents. Account security and applicable eligibility checks still apply."),
              p("You receive a new funded account with your original Trading Power. Evaluation profits do not transfer to it."),
              h3("Examples"),
              p("Starting Trading Power: $12,000"),
              p("Evaluation Target: 10%"),
              p("Final Evaluation Balance: $13,200"),
              p("Funded Starting Balance: $12,000"),
              p("The $1,200 evaluation profit cannot be withdrawn."),
            ],
          },
          {
            n: "14",
            title: "Minimum Trading Days",
            nodes: [
              p("No minimum trading days are required for:"),
              ul("Elite", "Breeze", "Capital Your Way", "Instant"),
              p("You can pass an evaluation as soon as you reach the profit target while following all account rules."),
            ],
          },
          {
            n: "15",
            title: "Challenge Time Limit",
            nodes: [
              p("Elite, Breeze, and Capital Your Way evaluations have no completion deadline."),
              p("Accounts remain active as long as they comply with Perpeye’s inactivity rule."),
            ],
          },
          {
            n: "16",
            title: "Account Inactivity",
            nodes: [
              p("Accounts may close automatically after 90 consecutive days without trading activity."),
              p("This applies to:"),
              ul("Evaluation accounts", "Funded accounts", "Instant accounts"),
              p("Artificial trades placed only to bypass inactivity checks may be considered system abuse."),
            ],
          },
          {
            n: "17",
            title: "Consistency Rule",
            nodes: [
              p("Perpeye has no consistency requirement."),
              p("Profits do not need to be spread evenly across trading days. A single day may account for a large share of your total profit."),
            ],
          },
          {
            n: "18",
            title: "Best-Day Rule",
            nodes: [
              p("Perpeye does not apply a Best-Day Rule."),
              p("There is no limit on how much of your total profit can come from a single trading day."),
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Risk management",
    items: [
      {
        id: "daily-loss",
        label: "Daily loss",
        sections: [
          {
            n: "19",
            title: "Daily Loss",
            nodes: [
              p("Daily Loss sets the maximum your account can lose in a single Trading Day."),
              ul("Elite: 3%", "Breeze: 4%", "Instant: 3%", "Capital Your Way: Chosen by the trader."),
            ],
          },
          {
            n: "20",
            title: "How Daily Loss Is Calculated",
            nodes: [
              p("At 00:00 UTC, Perpeye uses whichever is higher:"),
              ul("Starting Trading Power", "Start-of-Day Balance"),
              p("Your Daily Loss percentage is applied to this amount."),
              p("A higher Balance can increase your dollar allowance. A Balance below Starting Trading Power does not reduce it below the original allowance."),
              f("Daily Loss Allowance = Daily Loss % × Higher of Starting Trading Power or Start-of-Day Balance"),
              h3("After a Payout Reservation"),
              p("When gross profit moves to the payout vault, the remaining trading Balance resets the daily calculation basis for the rest of that UTC day."),
              p("Your saved Daily Loss percentage applies to whichever is higher: Starting Trading Power or remaining Balance."),
              p("The withdrawal itself does not consume your Daily Loss allowance."),
            ],
          },
          {
            n: "21",
            title: "Elite Daily Loss Example",
            nodes: [
              p("Starting Trading Power: $12,000"),
              p("Daily Loss: 3%"),
              p("Daily Loss Allowance: $360"),
              p("Daily Equity Floor: $11,640"),
              p("The account breaches if equity reaches $11,640 or lower during that Trading Day. If the Maximum Drawdown floor is higher, that limit triggers first."),
            ],
          },
          {
            n: "22",
            title: "Daily Loss After Profit",
            nodes: [
              p("Starting Trading Power: $12,000"),
              p("Start-of-Day Balance: $13,000"),
              p("Daily Loss: 3%"),
              p("Daily Loss Allowance: $390"),
              p("Daily Equity Floor: $12,610"),
              p("Since your Balance exceeds Starting Trading Power, the allowance is calculated as 3% of $13,000."),
            ],
          },
          {
            n: "23",
            title: "Daily Loss After Previous Losses",
            nodes: [
              p("Starting Trading Power: $12,000"),
              p("Start-of-Day Balance: $11,600"),
              p("Daily Loss: 3%"),
              p("Daily Loss Allowance: $360"),
              p("The allowance remains based on $12,000, since it exceeds the Start-of-Day Balance."),
              p("The Maximum Drawdown floor still applies and may leave less room for further losses."),
            ],
          },
          {
            n: "24",
            title: "Does Floating P&L Affect Daily Loss?",
            nodes: [
              p("Yes."),
              p("Daily Loss is measured using Equity, so unrealised losses on open positions count."),
              p("Your account can breach the Daily Loss limit even while a losing trade remains open."),
            ],
          },
          {
            n: "25",
            title: "What Else Affects Daily Loss?",
            nodes: [
              p("Daily account performance includes applicable:"),
              ul(
                "Losses from closed trades",
                "Floating losses on open positions",
                "Trading commissions",
                "Funding payments",
                "Execution costs",
                "Other market-related fees shown by Perpeye"
              ),
              p("Moving profit to the payout vault is a distribution, not a trading loss. It recalculates the daily allowance once using the remaining Balance and your saved Daily Loss percentage."),
              p("Payout approval and payment do not trigger another reset."),
            ],
          },
          {
            n: "26",
            title: "When Does Daily Loss Reset?",
            nodes: [
              p("Daily Loss resets at 00:00 UTC."),
              p("For new payout vault requests, it also resets when gross profit transfers from your trading Balance to the vault. The remaining Balance becomes the daily basis, using your saved Daily Loss percentage."),
              p("Approval and payment do not cause another reset. If a request is rejected, the reserved gross profit returns without changing the daily basis."),
              p("Maximum Drawdown still applies. A vault request cannot reverse an earlier breach, and further trading losses count against the new daily allowance."),
              p("Pre-vault requests keep their existing reset upon payment. Your dashboard shows the current daily equity floor."),
            ],
          },
        ],
      },
      {
        id: "static-drawdown",
        label: "Static drawdown",
        sections: [
          {
            n: "27",
            title: "Maximum Drawdown",
            nodes: [
              p("Maximum Drawdown sets the minimum Equity your account must maintain throughout its lifetime."),
              p("Perpeye applies Static Maximum Drawdown to Elite, Breeze, and Instant accounts."),
              p("Capital Your Way also uses Static Maximum Drawdown unless a different type is explicitly introduced in the future."),
            ],
          },
          {
            n: "28",
            title: "Static Maximum Drawdown",
            nodes: [
              p("Static drawdown is based on your Starting Trading Power. Its equity floor stays fixed as profits grow."),
              h3("Examples"),
              p("Starting Trading Power: $12,000"),
              p("Maximum Drawdown: 6%"),
              p("Maximum Loss: $720"),
              p("Fixed Equity Floor: $11,280"),
              p("Even if your account grows to $15,000, the Maximum Drawdown floor remains $11,280."),
            ],
          },
          {
            n: "29",
            title: "Does Floating P&L Affect Maximum Drawdown?",
            nodes: [
              p("Yes."),
              p("Maximum Drawdown is measured using Equity, which includes unrealised P&L."),
              p("Your account breaches if a floating loss brings Equity to or below the Maximum Drawdown floor."),
            ],
          },
          {
            n: "30",
            title: "Does Maximum Drawdown Reset Daily?",
            nodes: [
              p("No."),
              p("Daily Loss resets each day, while the Maximum Drawdown floor stays fixed."),
            ],
          },
          {
            n: "31",
            title: "Does a Payout Change Maximum Drawdown?",
            nodes: [
              p("No."),
              p("The static drawdown floor stays tied to your applicable Starting Trading Power."),
              p("A payout may reduce the profit buffer between your Balance and the floor, but it does not raise the floor itself."),
            ],
          },
          {
            n: "32",
            title: "Which Loss Limit Takes Priority?",
            nodes: [
              p("Both Daily Loss and Maximum Drawdown apply at the same time."),
              p("The higher Equity floor is the stricter limit at any given moment."),
            ],
          },
          {
            n: "33",
            title: "Breach Calculation Precision",
            nodes: [
              p("Perpeye’s backend calculates values at full numerical precision."),
              p("Dashboard figures may be rounded for easier reading. Breach decisions use the exact backend value."),
            ],
          },
        ],
      },
      {
        id: "breach-appeals",
        label: "Breach & appeals",
        sections: [
          {
            n: "34",
            title: "What Happens After a Breach?",
            nodes: [
              p("When an account breaks a hard risk limit:"),
              ol(
                "Open positions may close automatically.",
                "New trades are blocked.",
                "The account status changes to Breached.",
                "Further profits cannot qualify for payouts.",
                "Trading on the account is disabled."
              ),
            ],
          },
          {
            n: "35",
            title: "Can I Request a Breach Review?",
            nodes: [
              p("A correctly calculated breach cannot be reversed solely because you disagree with the rule."),
              p("Perpeye offers a Technical Breach Review if you believe the breach resulted from:"),
              ul(
                "Inaccurate market data",
                "A confirmed Perpeye platform outage",
                "Duplicate trade execution",
                "A software fault",
                "An incorrect risk calculation"
              ),
              p("Submit your request within 72 hours of the breach."),
              p("If Perpeye verifies a technical error, your account may be restored to its last reliable state."),
            ],
          },
          {
            n: "36",
            title: "Soft Breaches",
            nodes: [
              p("Perpeye applies no hidden soft-breach rules to normal trading performance."),
              p("For hard numerical rules, an account is either within the limits or in breach."),
              p("Conduct investigations follow the separate Prohibited Conduct section."),
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Funded trading",
    items: [
      {
        id: "funded-accounts",
        label: "Funded accounts",
        sections: [
          {
            n: "37",
            title: "Funded Accounts",
            nodes: [
              p("After passing an Elite, Breeze, or Capital Your Way evaluation, you receive a funded account, subject to the published total funded-capital limit. No KYC is required."),
              p("Funded accounts:"),
              ul(
                "Have no profit target",
                "Keep the applicable Daily Loss limit",
                "Keep the applicable Maximum Drawdown limit",
                "Keep the applicable starting profit split",
                "Support eligible payouts",
                "Follow all trading and conduct rules"
              ),
            ],
          },
          {
            n: "38",
            title: "Funded Account Profit Target",
            nodes: [
              p("Funded accounts have no profit target."),
              p("You can focus on earning profits while staying within your account’s risk limits."),
            ],
          },
          {
            n: "39",
            title: "Profit Split",
            nodes: [
              ul(
                "Elite: 80% Trader / 20% Perpeye",
                "Breeze: 80% Trader / 20% Perpeye",
                "Instant: 80% Trader / 20% Perpeye",
                "Capital Your Way: 80%, 85%, or 90% to the trader, based on the selected settings."
              ),
            ],
          },
        ],
      },
      {
        id: "payouts",
        label: "Payouts",
        sections: [
          {
            n: "40",
            title: "Payout Eligibility",
            nodes: [
              p("Funded Elite, Breeze, and Capital Your Way accounts can request payouts when:"),
              ul(
                "The account has funded status",
                "Net profit from closed trades is available",
                "The minimum payout amount is reached",
                "All positions are closed",
                "Account security checks are complete; no KYC is required",
                "The account is neither breached nor under a legitimate compliance review"
              ),
              p("There are no minimum funded trading days required."),
            ],
          },
          {
            n: "41",
            title: "Minimum Payout",
            nodes: [p("The minimum amount a trader can withdraw is $20 USDC.")],
          },
          {
            n: "42",
            title: "Payout Timing and Limits",
            nodes: [
              p("All funded accounts, including existing ones, can receive one payment every 24 hours. The next request can be submitted 24 hours after the account’s last completed payout."),
              h3("Trader-Wide Payout Cap"),
              p("20 October 2026 amendment: Each trader can receive up to $10,000 within any rolling 24-hour period, across all funded accounts combined."),
              p("This limit applies to the trader’s share after the profit split. Switching accounts or dividing requests does not increase it."),
              h3("Larger Payouts"),
              p("Eligible requests above $10,000 keep their full value and are paid in instalments of up to $10,000, spaced at least 24 hours apart."),
              p("The final instalment may fall below the usual minimum payout."),
              p("For new vault requests, the full gross distribution is removed from the trading Balance when submitted. The trader’s share remains in the vault, and trading can continue during review and payment."),
              h3("Instalment Approval"),
              p("Every instalment requires administrator approval and verification of its vault reservation before payment."),
              p("Payment is due within 24 hours of approval or its scheduled payment window, subject to the trader-wide rolling limit."),
              p("A request paid in instalments counts as one distribution for scaling."),
              h3("Pending Requests"),
              p("Only one payout request or instalment plan can be pending per account."),
              p("Rejected requests do not trigger the payment cooldown. Existing unpaid requests remain eligible for review and may be divided into instalments by finance. Completed payments remain unchanged."),
              p("There is no weekly cash cap. All other payout eligibility requirements still apply."),
            ],
          },
          {
            n: "43",
            title: "Partial Payouts",
            nodes: [
              p("Perpeye lets you withdraw a portion of your profits and keep the rest in your account."),
              h3("Example"),
              p("Starting Trading Power: $12,000"),
              p("Current Closed Balance: $13,000"),
              p("Gross Funded Profit: $1,000"),
              p("Selected Gross Distribution: $500"),
              p("With an 80% profit split:"),
              p("Trader Receives: $400"),
              p("Perpeye Receives: $100"),
              p("Balance Deduction: $500"),
              p("Remaining Balance: $12,500"),
              p("This leaves a $500 profit buffer in your account."),
              h3("Daily Loss After Withdrawal"),
              p("When profit moves into the vault, your daily allowance resets using the remaining $12,500 Balance and your saved Daily Loss percentage."),
              p("At 3%:"),
              p("New Daily Loss Allowance: $375"),
              p("Daily Equity Floor: $12,125"),
              p("The payout does not count as a trading loss, and the static Maximum Drawdown floor remains unchanged."),
              p("Both full and partial payouts trigger this daily reset. Your account must be within its risk limits when profit transfers to the vault."),
            ],
          },
          {
            n: "44",
            title: "Gross Profit Distribution",
            nodes: [
              p("Payouts are calculated from the total profit selected for distribution, before applying the profit split."),
              f("Trader Reward = Gross Profit Distribution × Trader Profit Split"),
              h3("Example"),
              p("Gross Distribution: $1,000"),
              p("Trader Profit Split: 80%"),
              p("Trader Receives: $800"),
              p("Perpeye Receives: $200"),
              p("Account Balance Deduction: $1,000"),
            ],
          },
          {
            n: "45",
            title: "Can I Withdraw My Starting Trading Power?",
            nodes: [
              p("No."),
              p("Trading Power represents a simulated account allocation and cannot be withdrawn."),
              p("Only eligible profits earned on a funded account qualify for payouts."),
            ],
          },
          {
            n: "46",
            title: "Can I Withdraw Evaluation Profits?",
            nodes: [
              p("No."),
              p("Evaluation profits are used only to confirm that you have passed the challenge and cannot be withdrawn."),
            ],
          },
          {
            n: "47",
            title: "Must I Close Positions Before a Payout?",
            nodes: [
              p("Yes."),
              p("Before requesting a payout, close all positions and cancel any open orders that could change your account’s exposure."),
            ],
          },
          {
            n: "48",
            title: "Trading During a Pending Payout",
            nodes: [
              p("New trading payout requests automatically enter the Payout Vault for review. The full gross distribution is immediately deducted from your trading Balance. Your share is held separately and cannot serve as margin."),
              p("You can continue trading with the remaining Balance under your usual account rules and any separate restrictions."),
              p("Further trading losses do not reduce your vaulted payout."),
              h3("Approval and Payment"),
              p("Each request requires administrator approval. Once approved, payment is due within 24 hours, subject to the rolling daily payout limit and displayed instalment schedule."),
              p("Approval does not mean payment is complete. A request is marked Paid only after payment confirmation."),
              h3("Rejected Requests"),
              p("If rejected, the gross profit returns to the same trading account, with an audit record."),
              p("Rejection does not reset Daily Loss or reactivate a breached or separately paused account."),
              h3("Earlier Requests"),
              p("Requests made before the vault launched retain their original reservation and settlement accounting."),
            ],
          },
        ],
      },
      {
        id: "instant-payouts",
        label: "Instant payouts",
        sections: [
          {
            n: "49",
            title: "First Instant Payout",
            nodes: [
              p("Instant accounts have a separate first-payout requirement because they skip the evaluation."),
              p("Your first payout becomes available after earning at least 1% closed net profit and meeting all other payout conditions."),
              p("There is no waiting period."),
              p("These terms apply to all new and existing Instant accounts, including those with older saved terms."),
              p("All other saved payout and risk rules remain unchanged."),
              p("No KYC is required."),
            ],
          },
          {
            n: "50",
            title: "First Instant Payout Limit",
            nodes: [
              p("Your first Instant gross profit distribution is capped at 5% of Starting Trading Power."),
              h3("Example"),
              p("Starting Trading Power: $4,000"),
              p("Maximum First Gross Distribution: $200"),
              p("Trader Profit Split: 80%"),
              p("Trader Receives: $160"),
            ],
          },
          {
            n: "51",
            title: "Instant Payout Interval",
            nodes: [
              p("Once an Instant payout is completed, the account can submit its next request 24 hours later, replacing the previous 48-hour cooldown."),
              p("The same payout interval applies to all new and existing funded accounts."),
              p("Your first Instant payout still requires 1% closed net profit, with no waiting period. The first-distribution cap and all other eligibility checks remain unchanged."),
            ],
          },
          {
            n: "52",
            title: "Instant Account Expiry",
            nodes: [
              p("Perpeye Instant accounts have no fixed 30-, 60-, or 90-day expiry."),
              p("They stay active as long as they comply with:"),
              ul("Risk limits", "Conduct requirements", "The 90-day inactivity rule"),
            ],
          },
        ],
      },
      {
        id: "wallets-payments",
        label: "Wallets & payments",
        sections: [
          {
            n: "53",
            title: "Payout Currency",
            nodes: [p("Perpeye pays out in USDC, unless another currency is explicitly offered in your dashboard.")],
          },
          {
            n: "54",
            title: "Blockchain Network",
            nodes: [
              p("Available networks appear when you submit a payout request. You must provide a compatible wallet address, as blockchain transfers may be irreversible."),
              p("New trading and affiliate payouts use USDC on BNB Smart Chain (BEP-20), listed as USDC_BSC."),
              p("Check that your wallet or exchange supports both the asset and network. Perpeye saves the destination with each request."),
              p("Earlier requests keep their originally submitted wallet and network."),
            ],
          },
          {
            n: "55",
            title: "Incorrect Payout Address",
            nodes: [
              p("Perpeye is not liable for cryptocurrency permanently lost due to an incorrect or incompatible wallet address supplied by the trader, provided the transfer was processed correctly."),
            ],
          },
          {
            n: "56",
            title: "Wallet Security",
            nodes: [
              p("Perpeye may request wallet verification or a signature confirmation before approving a new payout wallet."),
              p("Updating your payout wallet may result in a temporary security hold."),
              p("This protects your account and is not a trading restriction."),
            ],
          },
          {
            n: "57",
            title: "Network Fees",
            nodes: [
              p("Perpeye aims to cover standard transaction fees on supported payout networks where commercially practical."),
              p("Exceptional recovery or unsupported-network costs may be charged to the trader, with advance disclosure. There are no monthly fees, inactivity fees, data fees, platform fees, or withdrawal fees."),
            ],
          },
          {
            n: "58",
            title: "Stablecoin Disruption",
            nodes: [
              p("If USDC faces a significant technical issue, freeze, network outage, or market disruption, Perpeye may temporarily suspend payouts or offer an alternative supported asset."),
              p("Any valid payout obligation remains in place."),
            ],
          },
          {
            n: "59",
            title: "Payout Processing",
            nodes: [
              p("New trading payouts enter the vault under review and require administrator approval. Once approved, payment is due within 24 hours, subject to the published rolling daily limit and displayed instalment schedule."),
              p("Your dashboard displays the review status, approval, payment deadline, and confirmed payment. Overdue approved payments are flagged in the admin queue."),
              p("Security concerns, suspected prohibited conduct, payout destination problems, or provider outages may require additional investigation. Requests are marked Paid only after payment confirmation."),
              p("Perpeye will not reject a payout simply because a trader earns legitimate profits."),
            ],
          },
        ],
      },
      {
        id: "scaling",
        label: "Scaling",
        sections: [
          {
            n: "60",
            title: "Account Scaling",
            nodes: [
              p("Funded traders can grow their Trading Power through Perpeye’s scaling programme."),
              p("Scaling adds firm capital, which does not count as trading profit. The daily opening basis and account risk limits adjust to reflect the increase."),
              p("Your dashboard displays the updated Trading Power, equity floors, and profit split."),
              p("Scaling preserves any higher existing Capital Your Way profit split and remains subject to the total funded-capital cap."),
            ],
          },
          {
            n: "61",
            title: "Scaling Level 1",
            nodes: [
              p("Qualify by completing:"),
              ul("3 successful qualifying payouts", "At least 10% lifetime net funded trading profit"),
              p("Your Trading Power increases to 125% of your original funded allocation, with a profit split of up to 85%."),
            ],
          },
          {
            n: "62",
            title: "Scaling Level 2",
            nodes: [
              p("Qualify by completing:"),
              ul("6 successful qualifying payouts", "At least 20% lifetime net funded trading profit"),
              p("Your Trading Power increases to 150% of your original funded allocation, with a profit split of up to 90%."),
            ],
          },
          {
            n: "63",
            title: "Which Payouts Count Toward Scaling?",
            nodes: [
              p("Perpeye may require each qualifying payout to represent at least 1% of your account’s current Trading Power in gross distributed profit."),
              p("This prevents repeated small payout requests from artificially accelerating scaling."),
              p("Daily instalments from a single request count as one distribution, based on the gross profit actually paid."),
            ],
          },
          {
            n: "64",
            title: "Capital Your Way Scaling",
            nodes: [
              p("Traders who start with an 85% or 90% profit split cannot scale beyond the 90% split cap."),
              p("They can still qualify for higher Trading Power."),
            ],
          },
        ],
      },
      {
        id: "account-limits",
        label: "Account limits",
        sections: [
          {
            n: "65",
            title: "Maximum Funded Trading Power",
            nodes: [
              p("Each trader can hold up to $500,000 in total active funded Trading Power across all funded accounts, including Instant accounts, shared accounts, and scaling increases."),
              p("The cap applies to new and existing accounts. Evaluation capital is excluded."),
              p("Passing an evaluation does not override this limit. Funded activation waits until sufficient capacity becomes available."),
            ],
          },
          {
            n: "66",
            title: "Maximum Scaled Trading Power",
            nodes: [
              p("Scaling counts toward the same $500,000 total active funded Trading Power cap per trader. It provides no extra allowance."),
              p("A scaling increase is deferred if it would push the trader, or any active shared-account member, above this limit."),
            ],
          },
          {
            n: "67",
            title: "Evaluation Account Limit",
            nodes: [
              p("You can purchase and hold unlimited evaluation accounts, with no cap on active evaluations."),
              p("The $500,000 active funded-capital limit applies only when an evaluation moves to funded status, not at purchase."),
            ],
          },
          {
            n: "68",
            title: "Instant Account Limit",
            nodes: [
              p("You can purchase and hold unlimited Instant accounts, with no restriction on the number active."),
              p("Combined active funded Trading Power cannot exceed $500,000 per trader, including Instant accounts, other funded accounts, shared allocations, and scaling."),
              p("This replaces the previous two-Instant-account limit for new and existing traders."),
              p("Evaluation purchases and active evaluations remain unlimited. Their capital counts toward the funded cap only after they become funded."),
            ],
          },
          {
            n: "69",
            title: "Combining Accounts",
            nodes: [
              p("Separate Perpeye accounts generally cannot be merged."),
              p("Each account retains its own:"),
              ul("Original Deposit", "Multiplier", "Trading Power", "Risk settings", "Rule Version"),
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Trading",
    items: [
      {
        id: "leverage-position-size",
        label: "Leverage & position size",
        sections: [
          {
            n: "70",
            title: "Leverage",
            nodes: [
              p("Perpeye sets leverage limits for each market. The maximum is an available limit, not a requirement—you can use less."),
              h3("Indicative Launch Limits"),
              ul(
                "BTC: Up to 10×",
                "ETH: Up to 10×",
                "SOL: Up to 10×",
                "Other major crypto: Up to 5×",
                "Long-tail / higher-risk crypto: Up to 2–3×",
                "Equity, index, and commodity perpetuals: Generally up to 5×"
              ),
              p("Each market’s limit appears in the trading interface."),
              h3("PE-1.0 Market Limits"),
              p("The 5× major-crypto group includes HYPE, XRP, DOGE, BNB, ADA, AVAX, LINK, LTC, DOT, BCH, SUI, and TRX. Other crypto markets launch at 2×."),
              p("Available leverage is whichever is lower: your saved Perpeye limit or the market’s limit."),
              nw("Instant Accounts: Combined gross exposure is capped at 3× current equity. Individual market leverage settings do not override this account-wide limit."),
            ],
          },
          {
            n: "71",
            title: "Can Leverage Change?",
            nodes: [
              p("Perpeye may lower leverage for new exposure during unusually volatile or low-liquidity conditions."),
              p("A market leverage change does not retroactively alter your account’s Daily Loss or Maximum Drawdown percentages."),
              p("Open positions remain subject to applicable margin and market-risk requirements."),
              nw("Instant accounts also have a combined gross exposure cap of 3× current equity. Market leverage settings cannot override this account-wide limit."),
            ],
          },
          {
            n: "72",
            title: "Maximum Position Size",
            nodes: [
              p("Perpeye does not apply an arbitrary lot-size rule. Position size depends on:"),
              ul("Available margin", "Market leverage", "Market-specific notional limits", "Liquidity", "Risk-engine restrictions"),
              p("No Perpeye account has a per-position percentage margin cap. This applies to new and existing accounts. A perpetual position may use all available margin, subject to other account risk limits."),
              p("Available margin reflects open positions, unrealised losses, and reserved payouts. Unrealised profits do not provide extra margin for new trades."),
              p("Adding to a position uses your remaining available margin. Market orders, limit-order fills, and copied entries are rechecked at execution."),
              p("Account loss limits, leverage limits, and saved risk rules still apply. Margin allocated is not the same as the amount you could lose."),
              p("Applicable limits appear in the trading platform."),
              p("PE-1.0 supports up to 100 simultaneous open positions. Orders are checked again before execution."),
            ],
          },
          {
            n: "73",
            title: "Risk Per Trade",
            nodes: [
              p("Perpeye has no fixed risk-per-trade percentage."),
              p("You choose how much to risk on each position, provided your account complies with all other rules."),
            ],
          },
          {
            n: "74",
            title: "Stop-Loss Requirements",
            nodes: [
              p("You are not required to place stop-loss orders."),
              p("Managing trading risk remains your responsibility."),
            ],
          },
          {
            n: "75",
            title: "Margin",
            nodes: [
              p("Perpeye accounts follow the margin system shown in the trading platform."),
              p("With cross margin, available account equity supports positions across your portfolio."),
              p("With isolated margin, margin and liquidation are calculated separately for the relevant position or instrument."),
            ],
          },
          {
            n: "76",
            title: "Liquidation",
            nodes: [
              p("Position liquidation and a Perpeye account breach are separate events."),
              p("The platform’s margin engine may liquidate a leveraged position before your account reaches its Maximum Drawdown limit."),
              p("Liquidation alone does not terminate your Perpeye account. The account must also breach an applicable account rule."),
            ],
          },
        ],
      },
      {
        id: "fees-funding",
        label: "Fees & funding",
        sections: [
          {
            n: "77",
            title: "Funding Payments",
            nodes: [
              p("Perpetuals may involve periodic funding payments, which traders can either pay or receive."),
              p("Any funding charged or credited forms part of account P&L."),
              p("Current platform behaviour: Perpeye displays venue funding rates for reference only. Recurring funding payments are not currently deducted or credited."),
              p("A displayed funding estimate is not an account ledger transaction."),
            ],
          },
        ],
      },
      {
        id: "market-availability",
        label: "Market availability",
        sections: [
          {
            n: "78",
            title: "Tradable Markets",
            nodes: [
              p("Perpeye may offer perpetual markets across:"),
              ul("Cryptocurrencies", "Equities", "Indices", "Commodities", "Pre-IPO markets", "Other supported perpetual products"),
              p("Check the live Markets page for the products currently available to trade."),
            ],
          },
          {
            n: "79",
            title: "Market Availability",
            nodes: [
              p("Perpeye may add, suspend, restrict to reduce-only, or delist a market."),
              p("Availability depends on the underlying venue, price-data access, liquidity, and Perpeye’s risk controls."),
            ],
          },
        ],
      },
      {
        id: "what-is-not-restricted",
        label: "What is not restricted",
        sections: [
          {
            n: "80",
            title: "What Perpeye Does Not Restrict",
            nodes: [
              p("Perpeye does not enforce the following rules or limitations:"),
              h3("Consistency Rule"),
              p("None. No limit on a single day's profit relative to total profits."),
              h3("Minimum Trading Days"),
              p("None. You can pass the assessment in a single trade."),
              h3("Time Limit"),
              p("None. Complete the assessment at your own pace."),
              h3("Profit Cap"),
              p("None. There is no maximum earnings limit."),
              h3("News Trading Restrictions"),
              p("None. Trading during major market events is allowed."),
              h3("Weekend Holding Restrictions"),
              p("None. Positions can be held over weekends, as crypto markets operate 24/7."),
              h3("Risk-per-Trade Rule"),
              p("None. No additional maximum position-size restriction beyond leverage limits."),
              h3("Mandatory Stop-Loss"),
              p("None. Stop-loss orders are not required, though they are recommended."),
              h3("Strategy Restrictions"),
              p("None. Scalping, swing trading, grid trading, and other strategies are permitted."),
              h3("EA / Bot Restrictions"),
              p("None. Automated trading is allowed on your own account."),
            ],
          },
        ],
      },
      {
        id: "prohibited-conduct",
        label: "Prohibited conduct",
        sections: [
          {
            n: "81",
            title: "Prohibited Trading Practices",
            nodes: [
              p("Although Perpeye allows a wide range of trading strategies, the following activities are strictly prohibited and may result in immediate account termination and a permanent ban."),
              h3("1. Cross-Account Hedging and Arbitrage"),
              p("Taking opposite positions on the same instrument across multiple Perpeye accounts, or between a Perpeye account and an account at another firm, to ensure one account profits while another is deliberately sacrificed. Each account must be traded independently."),
              h3("2. Copy Trading, External Signals, and Third-Party Strategies"),
              p("Using third-party signals, copy trading services, or external sources to replicate trades in a Perpeye account is prohibited. This includes trade ideas obtained from trading communities, social media, research reports, and crowdsourced platforms. Strategies specifically designed or marketed to pass prop firm evaluations are also prohibited. Traders may use their own automated strategies when developed and operated independently on a single account."),
              h3("3. Account Sharing and Multi-Account Access"),
              p("Each account must belong to a single individual. Selling, transferring, or sharing account credentials is prohibited. Operating multiple accounts from the same household, device, or IP address without prior approval is also prohibited."),
              h3("4. Platform Exploits, Latency, and Pricing Errors"),
              p("Deliberately profiting from technical faults, execution delays, price feed anomalies, or other irregularities within the platform is prohibited."),
              h3("6. Insider Trading and Front-Running"),
              p("Trading based on confidential, non-public, or insider information is prohibited. Front-running orders placed on other trading venues or by other parties is also not allowed."),
              h3("7. Strategy Switching"),
              p("Passing an assessment using one trading approach and then switching to a substantially different strategy on the funded account is prohibited. Trading on the funded account should remain consistent with the strategy demonstrated during the assessment."),
              h3("8. Strategies Unsuitable for Live Market Execution"),
              p("Strategies that cannot reasonably be replicated in live markets, or that introduce excessive risks when executed live, are prohibited. This includes, but is not limited to, positions that risk automatic deleveraging due to margin requirements, trades causing excessive unrealised profit and loss fluctuations, and strategies that exploit the simulated trading environment."),
              h3("9. Conduct That Creates Regulatory Risk"),
              p("Trading activities that expose Perpeye to legal or regulatory risks, or violate the terms of its data and infrastructure providers, are prohibited."),
              h3("Detection and Enforcement"),
              p("Perpeye uses automated monitoring systems to identify prohibited trading activities. If a violation is detected, Perpeye may suspend trading or payouts, terminate the account permanently without a payout, and prohibit the trader from participating in future assessments. All enforcement decisions are final."),
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Account & execution",
    items: [
      {
        id: "identity-security",
        label: "Identity & security",
        sections: [
          {
            n: "82",
            title: "Identity & Security",
            nodes: [
              p("Perpeye maintains the following identity, account security, and eligibility requirements:"),
              h3("1. Identity Verification and Fraud"),
              p("Providing false identity details is prohibited. This includes:"),
              ul(
                "Using another person's identification",
                "Submitting forged documents",
                "Creating accounts under another person's identity",
                "Registering multiple accounts using deliberately false identities"
              ),
              h3("2. Multiple Account Profiles"),
              p("Each individual may maintain only one Perpeye profile unless explicit approval is granted. Multiple trading accounts may be held under the same profile."),
              h3("3. Age Requirement"),
              p("Traders must be at least 18 years old and legally eligible to enter into an agreement with Perpeye in their jurisdiction."),
              h3("4. KYC Requirements"),
              p("Perpeye does not require government-issued identification, selfies, or liveness checks to trade, activate a funded account, or request an instant payout."),
              h3("5. Restricted Jurisdictions"),
              p("Perpeye services are unavailable in jurisdictions where providing them would violate applicable laws or sanctions. Traders should consult the dedicated Eligibility page before purchasing an account."),
              h3("6. VPN Usage"),
              p("Using a VPN for normal security and privacy purposes is permitted. However, VPNs must not be used to bypass:"),
              ul("Restricted-jurisdiction requirements", "Sanctions controls", "Account security measures", "Account bans"),
              h3("7. IP Address Changes"),
              p("Changing an IP address does not automatically constitute a violation. Legitimate changes may occur due to travel, switching internet providers, or using mobile networks."),
              p("However, IP address information may be reviewed as part of a broader investigation into suspected fraud or unauthorised account sharing."),
              h3("8. Personal Devices and Shared Devices"),
              p("Traders may access Perpeye through multiple personal devices. Changing devices is not automatically prohibited."),
              p("However, shared-device activity may trigger a security review if there are reasonable indications of unauthorised account sharing."),
            ],
          },
        ],
      },
      {
        id: "checkout-refunds",
        label: "Checkout & refunds",
        sections: [
          {
            n: "83",
            title: "Payments, Checkout & Refunds",
            nodes: [
              h3("1. Payment Methods"),
              p("Perpeye primarily accepts supported cryptocurrency payments. Before completing checkout, the following details are displayed:"),
              ul("Selected Deposit", "Applicable Discount", "Total Amount Due", "Payment Asset", "Supported Network"),
              h3("2. Underpayments"),
              p("If a cryptocurrency payment is below the required amount, Perpeye may request payment of the remaining balance before activating the account."),
              h3("3. Overpayments"),
              p("Any accidental overpayment should be reported to Perpeye Support. Eligible refunds may be issued after accounting for applicable blockchain transaction fees."),
              h3("4. Refund Policy"),
              p("Once an account has been activated and trading has started, the deposit or payment is generally non-refundable. Refunds may still be provided in cases involving:"),
              ul("Duplicate charges", "Payment processing errors", "Failure to deliver an account", "Other circumstances required by applicable law"),
              h3("5. Refunds for Breached Accounts"),
              p("Violating a trading rule does not entitle a trader to a refund."),
              h3("6. Refunds for Failed Evaluations"),
              p("Failing an evaluation does not qualify a trader for a refund."),
              h3("7. Recurring Fees"),
              p("Standard, Flex, Instant, and Build Your Own accounts do not carry recurring subscription fees unless explicitly stated before purchase."),
            ],
          },
        ],
      },
      {
        id: "support-contact",
        label: "Support & contact",
        sections: [
          {
            n: "84",
            title: "Support & Contact",
            nodes: [
              h3("Discord Support Tickets"),
              p("All account-related issues must be submitted through the support ticket system on Discord. Account-related support requests via email are not permitted."),
              f("Discord: [Add Discord Invite Link]"),
              h3("Email Support"),
              p("For general information and inquiries related to Perpeye, please contact our email support team."),
              f("Email: [Add Support Email]"),
            ],
          },
        ],
      },
    ],
  },
];

/* ───────────────────────────── HELPERS ───────────────────────────── */

// **text** => white highlighted inline text
function Inline({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-white">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

function nodeText(n: Node): string {
  return Array.isArray(n.x) ? n.x.join(" ") : n.x;
}

function itemHaystack(item: Item) {
  return (
    item.label +
    " " +
    item.sections.map((s) => s.title + " " + s.nodes.map(nodeText).join(" ")).join(" ")
  ).toLowerCase();
}

function RenderNode({ node }: { node: Node }) {
  switch (node.t) {
    case "h3":
      return <h3 className="mt-9 text-[20px] font-normal leading-[1.2] text-white first:mt-0">{node.x}</h3>;
    case "p":
      return (
        <p className="mt-[22px] text-[15px] leading-[20px] text-muted/80 first:mt-0">
          <Inline text={node.x} />
        </p>
      );
    case "f":
      return <p className="mt-[22px] text-[15px] leading-[20px] text-white">{node.x}</p>;
    case "ul":
      return (
        <ul className="mt-[22px] space-y-[14px]">
          {node.x.map((li) => (
            <li key={li} className="flex gap-3 text-[15px] leading-[20px] text-muted/80">
              <span className="mt-[8px] h-[3px] w-[3px] shrink-0 bg-gold-accent" />
              <span>{li}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-[22px] space-y-[14px]">
          {node.x.map((li, i) => (
            <li key={li} className="flex gap-3 text-[15px] leading-[20px] text-muted/80">
              <span className="w-4 shrink-0 text-gold-accent">{i + 1}.</span>
              <span>{li}</span>
            </li>
          ))}
        </ol>
      );
    case "new":
      return (
        <div className="mt-[22px] border border-line border-l-gold-accent bg-white/[0.03] px-5 py-4 [border-left-width:2px]">
          <span className="mb-2 inline-block bg-gold-accent px-2 py-[2px] text-[10px] uppercase tracking-[0.08em] text-ink">
            New PE-1.1
          </span>
          <p className="text-[14px] leading-[20px] text-muted/80">{node.x}</p>
        </div>
      );
  }
}

/* ────────────────────────────── PAGE ─────────────────────────────── */

const allItems = groups.flatMap((g) => g.items);
const flatSections = allItems.flatMap((item) => item.sections.map((s) => ({ item, s })));
const ruleId = (n: string) => `rule-${parseInt(n, 10)}`;

export function RulesBook() {
  const [activeId, setActiveId] = useState(allItems[0].id);
  const [query, setQuery] = useState("");
  const navRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);

  const q = query.trim().toLowerCase();

  const filteredGroups = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          items: q ? g.items.filter((it) => itemHaystack(it).includes(q)) : g.items,
        }))
        .filter((g) => g.items.length > 0),
    [q]
  );

  /* sidebar item click => us rule tak smooth scroll */
  const goTo = (item: Item) => {
    // Overview ka item Quick Overview block par jaye, baqi apne pehle rule par
    const targetId =
      item.id === "overview" ? "quick-overview" : ruleId(item.sections[0].n);
    const el = document.getElementById(targetId);
    if (!el) return;
    setActiveId(item.id);
    lockRef.current = true;
    window.setTimeout(() => (lockRef.current = false), 900);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", item.id === "overview" ? "#overview" : `#${el.id}`);
  };

  /* scroll-spy: jo rule screen par hai uska item active */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (lockRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const els = Array.from(document.querySelectorAll<HTMLElement>("[data-rule-item]"));
        if (!els.length) return;
        let current = els[0];
        for (const el of els) {
          if (el.getBoundingClientRect().top <= 120) current = el;
        }
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom) current = els[els.length - 1];
        setActiveId(current.dataset.ruleItem as string);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* page load par #rule-N ho to wahan jao */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith("rule-") && hash !== "overview") return;
    const id = hash === "overview" ? "quick-overview" : hash;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  /* active item sidebar ke andar visible rakho */
  useEffect(() => {
    const nav = navRef.current;
    const btn = nav?.querySelector<HTMLElement>(`[data-nav-item="${activeId}"]`);
    if (!nav || !btn) return;
    const top = btn.offsetTop - nav.offsetTop;
    if (top < nav.scrollTop || top + btn.offsetHeight > nav.scrollTop + nav.clientHeight) {
      nav.scrollTo({ top: top - nav.clientHeight / 2, behavior: "smooth" });
    }
  }, [activeId]);

  return (
    <section className="relative w-full  px-6 pb-[120px] pt-[140px] md:px-20">
      {/* soft gold glow (design ke mutabiq) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/images/rules/Rulespage.png')" }}
      />

      {/* ───── HERO ───── */}
      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[48px] font-normal leading-[1] tracking-[-0.02em] text-white md:text-[64px]">
            Rulebook
          </h1>
          <p className="mt-6 max-w-[520px] text-[15px] leading-[20px] text-muted/80">
            Understand the rules. Trade with confidence.
            <br />
            Everything you need to know about your perpetual trading account.
          </p>
        </div>

        <div className="flex h-[33px] w-fit items-center border border-line text-[12px] text-muted">
          <span className="flex items-center gap-2 border-r border-line px-4">
            <span className="h-[5px] w-[5px] rounded-full bg-gold-accent" />
            PE-1.1
          </span>
          <span className="px-4 uppercase">24 - OCT - 2026</span>
        </div>
      </div>

      <div className="relative z-10 mt-[46px] border-t border-line" />

      {/* ───── BODY ───── */}
      <div className="relative z-10 mt-[58px] flex flex-col gap-10 lg:flex-row lg:gap-[54px]">
        {/* SIDEBAR */}
        <aside className="w-full shrink-0 lg:sticky lg:top-[110px] lg:w-[412px] lg:self-start">
          <div
            ref={navRef}
            className="relative flex flex-col border border-line bg-black/20 p-[22px] lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* search */}
            <label className="flex h-[41px] shrink-0 items-center gap-3 border border-line bg-white/[0.03] px-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a rule"
                className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-muted"
              />
            </label>

            {/* list: poori height, koi scroll nahi */}
            <nav ref={navRef} className="mt-6">
              {filteredGroups.map((g) => (
                <div key={g.label} className="mb-6 last:mb-0">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.04em] text-muted">{g.label}</p>
                  <ul className="space-y-[10px]">
                    {g.items.map((it) => {
                      const isActive = it.id === activeId;
                      return (
                        <li key={it.id}>
                          <button
                            type="button"
                            data-nav-item={it.id}
                            onClick={() => goTo(it)}
                            className={cn(
                              "flex h-[53px] w-full items-center justify-between border-l-2 px-[15px] text-left text-[13px] outline-none transition-colors focus:outline-none focus-visible:outline-none",
                              isActive
                                ? "border-gold-accent bg-white/[0.08] text-white"
                                : "border-[#333] bg-white/[0.04] text-muted hover:bg-white/[0.07] hover:text-white"
                            )}
                          >
                            <span>{it.label}</span>
                            <span
                              className={cn(
                                "text-[12px]",
                                isActive
                                  ? "flex h-[22px] w-[22px] items-center justify-center bg-gold-accent text-ink"
                                  : "text-muted"
                              )}
                            >
                              {it.sections[0].n}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {filteredGroups.length === 0 && <p className="text-[13px] text-muted">No rules found.</p>}
            </nav>
          </div>
        </aside>

        {/* CONTENT: 1 se end tak saare rules ek sath */}
        <div className="min-w-0 flex-1">
          <div id="quick-overview" className="scroll-mt-[96px]">
            <p className="text-[10px] uppercase tracking-[0.04em] text-muted">Quick Overview</p>
            <h2 className="mt-3 text-[28px] font-normal leading-[1.1] tracking-[-0.02em] text-white">
              Choose your rules.
            </h2>

            <div className="mt-[30px] overflow-x-auto">
              <table className="w-full min-w-[760px] border border-line text-left">
                <thead>
                  <tr className="h-[48px] bg-white/[0.05]">
                    {overviewHead.map((h) => (
                      <th key={h} className="px-[18px] text-[10px] font-normal uppercase tracking-[0.04em] text-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overviewRows.map((row) => (
                    <tr key={row[0]} className="h-[58px] border-t border-line">
                      {row.map((c, i) => (
                        <td key={i} className="px-[18px] text-[14px] text-muted/80 first:text-white/80">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-[22px] flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] text-muted/80">
                No minimum trading days, consistency requirements, or trade holding limits.
              </p>
              <button
                type="button"
                onClick={() => goTo(allItems.find((i) => i.id === "account-configurations")!)}
                className="text-[12px] text-muted underline underline-offset-2 outline-none hover:text-white focus:outline-none"
              >
                Your Path to Funding
              </button>
            </div>

            <div className="mt-[34px] border-t border-line" />
          </div>

          {flatSections.map(({ item, s }, idx) => (
            <article
              key={ruleId(s.n)}
              id={ruleId(s.n)}
              data-rule-item={item.id}
              className={cn("scroll-mt-[120px] py-[34px]", idx > 0 && "border-t border-line")}
            >
              <p className="text-[11px] text-muted">{s.n}</p>
              <h2 className="mt-3 text-[28px] font-normal leading-[1.1] tracking-[-0.02em] text-white">
                {s.title}
              </h2>
              <div className="mt-[26px]">
                {s.nodes.map((n, k) => (
                  <RenderNode key={k} node={n} />
                ))}
              </div>
            </article>
          ))}

          {/* Rules Version box */}
          <div className="mt-10 border-t border-line pt-10">
            <div className="border-l-2 border-[#22c55e] bg-[#22c55e]/[0.08] px-[22px] py-[18px]">
              <p className="text-[12px] text-white">Rules Version: PE-1.1</p>
              <p className="mt-3 text-[11px] leading-[16px] text-muted/80">
                PE-1.1 is the latest version of the Perpeye Rulebook, effective from 24 October 2026.
                <br />
                All rules outlined in this version are up to date and remain applicable until a new version is officially released.
                <br />
                Perpeye will continue to follow PE-1.1 until it is superseded by a revised version.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RulesBook;