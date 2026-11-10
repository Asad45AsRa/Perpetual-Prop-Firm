// One written definition for every number a trader sees on their dashboard.
// The backend must calculate each figure with exactly these formulas, so the admin console, the trader
// dashboard and a support answer can never disagree. To add a metric, add one object to METRICS.

export type MetricDefinition = {
  name: string;
  area: "Account" | "Trader home" | "Payouts" | "Leaderboard" | "Plan rules";
  seenOn: string; // where the trader sees it
  formula: string;
  note?: string;
};

export const METRICS: MetricDefinition[] = [
  // ----- Account dashboard -----
  { name: "Equity", area: "Account", seenOn: "Accounts > Equity & Live Positions", formula: "Realized balance + unrealized profit and loss of open positions.", note: "Realized balance already includes fees and funding." },
  { name: "Realized result", area: "Account", seenOn: "Accounts > Equity & Live Positions", formula: "Sum of the net result of all closed trades, after fees and funding." },
  { name: "Hit rate", area: "Account", seenOn: "Accounts > Equity & Live Positions", formula: "Winning closed trades / all closed trades x 100.", note: "A break-even trade counts in the total but not as a win. Example: 3 won, 2 lost = 60%." },
  { name: "Profit factor", area: "Account", seenOn: "Accounts > Equity & Live Positions", formula: "Sum of winning trades / absolute sum of losing trades, both after fees and funding.", note: "Shown as a dash when there is no losing trade yet." },
  { name: "Gross result", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Sum of trade profit and loss before fees and funding." },
  { name: "Trading fees", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Sum of maker and taker fees charged on every fill." },
  { name: "Funding paid", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Sum of funding payments on open positions. Positive means the account paid, negative means it received." },
  { name: "Net result", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Gross result - trading fees - funding paid." },
  { name: "Average winner / average loser", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Mean net result of the winning trades / of the losing trades." },
  { name: "Best trade / worst trade", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Highest and lowest net result of a single closed trade." },
  { name: "Expectancy", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Net result / number of closed trades. The average net result of one trade." },
  { name: "Average hold", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Mean of (close time - open time) over all closed trades." },
  { name: "Holding-time buckets", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Closed trades grouped by hold time: under 1m, 1-5m, 5-15m, 15m-1h, 1-4h, 4-24h, over 24h. The lower limit belongs to the bucket. Percent = bucket count / closed trades.", note: "The bucket with the most trades is shown as \"Most common\"." },
  { name: "Deepest pullback", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Largest fall of equity from a previous peak, as a percent of that peak." },
  { name: "Long side / short side", area: "Account", seenOn: "Accounts > Stats & Discipline", formula: "Closed trades split by direction. Each side shows its own net result, hit rate and average net result per trade." },
  { name: "Daily drawdown used", area: "Account", seenOn: "Accounts > Risk & Rules", formula: "Loss since the daily reset / daily loss limit amount x 100.", note: "Measured on balance or equity, as set in Risk rules or on the plan. The limit amount is account size x daily loss %." },
  { name: "Max drawdown used", area: "Account", seenOn: "Accounts > Risk & Rules", formula: "Static: (start balance - equity) / max loss amount x 100. Trailing: (high-water mark - equity) / max loss amount x 100.", note: "The max loss amount is account size x max loss %." },
  { name: "Profit target progress", area: "Account", seenOn: "Accounts > Risk & Rules", formula: "(equity - start balance) / (start balance x profit target %) x 100, held between 0 and 100." },

  // ----- Plan rules -----
  { name: "Initial daily equity floor", area: "Plan rules", seenOn: "Challenges > Your Challenge", formula: "Account size x (1 - daily loss %).", note: "Example: $525 account, 4% daily loss = $504.00." },
  { name: "Static equity floor", area: "Plan rules", seenOn: "Challenges > Your Challenge", formula: "Account size x (1 - max loss %).", note: "Example: $525 account, 5% max loss = $498.75." },
  { name: "Account size", area: "Plan rules", seenOn: "Challenges", formula: "Payment x multiplier. Example: $5 x 105 = $525." },

  // ----- Trader home -----
  { name: "Realized PnL", area: "Trader home", seenOn: "Home > Lifetime stats", formula: "Sum of the net result of closed trades on funded accounts in the chosen range." },
  { name: "Total ROI", area: "Trader home", seenOn: "Home > Lifetime stats", formula: "Realized PnL / total funded allocation x 100." },
  { name: "Win rate", area: "Trader home", seenOn: "Home > Lifetime stats", formula: "Winning closed trades / all closed trades on funded accounts x 100." },
  { name: "Trading days", area: "Trader home", seenOn: "Home > Lifetime stats", formula: "Number of days with at least one closed trade." },
  { name: "Avg profit / day", area: "Trader home", seenOn: "Home > Lifetime stats", formula: "Realized PnL / trading days." },
  { name: "Volume", area: "Trader home", seenOn: "Home > Lifetime stats", formula: "Sum of the notional value of every fill." },

  // ----- Leaderboard -----
  { name: "Rank", area: "Leaderboard", seenOn: "Home and Leaderboard", formula: "Position among eligible traders, sorted high to low by the metric chosen in Platform Settings > Leaderboard (Total PnL, ROI % or Win rate) over the chosen period.", note: "Ties are broken by the higher win rate, then by fewer trades." },
  { name: "Top %", area: "Leaderboard", seenOn: "Home", formula: "Rank / number of ranked traders x 100, rounded up." },
  { name: "Eligible trader", area: "Leaderboard", seenOn: "Leaderboard", formula: "Has at least the minimum number of closed trades, is not hidden by staff, is not flagged (when that setting is on). Demo accounts are never ranked." },

  // ----- Payouts -----
  { name: "Withdrawable profits", area: "Payouts", seenOn: "Payouts", formula: "Profit above the start balance on funded accounts that is not yet paid, times the profit split, once the hold period has passed." },
  { name: "Sub-account profit", area: "Payouts", seenOn: "Payouts", formula: "Sum of (equity - start balance) over the trader's funded accounts, before the profit split." },
  { name: "Payout Reserve", area: "Payouts", seenOn: "Payouts", formula: "Live balance of the reserve wallet, or the manual amount when Platform Settings > Reserve & public stats is set to manual." },
  { name: "Total Payouts Issued", area: "Payouts", seenOn: "Payouts", formula: "Sum of every paid payout plus the imported history from before this console." },
  { name: "Avg. Payout Time", area: "Payouts", seenOn: "Payouts", formula: "Median seconds between approval and on-chain confirmation over the last 30 days." },
];
