"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { BSC_ADDRESS_PATTERN } from "@/components/affiliate-dashboard/data";
import { NumberedPager, StatusChip, tabChip } from "@/components/affiliate-dashboard/Panel";
import { LifetimeStats } from "../LifetimeStats";
import { subAccounts } from "../data";
import { Card } from "../account/ui";
import {
  PAYOUT_FILTERS,
  payoutOverview,
  savedWallet,
  traderBalances,
  traderPayoutHistory,
  type TraderPayout,
  type TraderPayoutFilter,
} from "./data";

/** Figma gold-gradient icons, kept at their exported sizes. */
const OVERVIEW_ICONS = {
  reserve: { src: "/images/trader-dashboard/payout-reserve.svg", size: 18 },
  issued: { src: "/images/trader-dashboard/payouts-issued.svg", size: 20 },
  time: { src: "/images/trader-dashboard/payout-time.svg", size: 22 },
} as const;
const PAGE_SIZE = 5;
const money0 = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Figma stat card: gold-tinted gradient, label, big value, muted note, icon tile top-right. */
function OverviewCard({ label, value, note, icon }: (typeof payoutOverview)[number]) {
  const ico = OVERVIEW_ICONS[icon];
  return (
    <article className="relative min-h-[150px] border-[0.7px] border-white/[0.13] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(153,128,74,0.1))] px-[15px] pb-[16px] pt-[19px] backdrop-blur-[10px]">
      <p className="text-[12px] leading-[1.3] text-white/50">{label}</p>
      <p className="mt-[8px] text-[32px] leading-[1.3] tracking-[-0.7px] text-white sm:text-[35px]">{value}</p>
      <p className="mt-[22px] text-[12px] leading-normal text-white/50">{note}</p>
      <span className="absolute right-[17px] top-[19px] flex h-[34px] w-[34px] items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06]">
        <Image src={ico.src} alt="" width={ico.size} height={ico.size} unoptimized style={{ width: ico.size, height: ico.size }} />
      </span>
    </article>
  );
}

function BalanceCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <Card title={label} action={<Image src="/images/trader-dashboard/profit-coin.svg" alt="" width={35} height={35} unoptimized className="h-[35px] w-[35px]" />} bodyClassName="px-[16px] pb-[16px]">
      <p className="text-[36px] leading-[1.15] tracking-[-0.7px] text-white">{money0(value)}</p>
      <span className="mt-[18px] inline-flex h-[30px] items-center border-l-[1.5px] border-gold-accent bg-gold-accent/15 px-[11px] text-[12px] text-[#C9B27A]">{note}</span>
    </Card>
  );
}

const field = "flex min-h-[34px] items-center border-[0.57px] border-white/[0.06] bg-white/[0.06] px-[12px] text-[13px] text-white";

function RequestPayout({ available, onRequest }: { available: number; onRequest: (amount: number, account: string) => void }) {
  const funded = subAccounts.filter((a) => a.active && a.stage === "Funded Stage");
  const [account, setAccount] = useState(funded[0]?.id ?? "");
  const [address, setAddress] = useState(savedWallet);
  const [amount, setAmount] = useState("1500");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const step = (delta: number) => {
    const current = Number(amount.replace(/[$,]/g, "")) || 0;
    setAmount(String(Math.min(available, Math.max(0, Math.round(current + delta)))));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount.replace(/[$,]/g, ""));
    if (!BSC_ADDRESS_PATTERN.test(address.trim())) return setError("Enter a valid BSC address (0x followed by 40 characters).");
    if (!Number.isFinite(n) || n <= 0) return setError("Enter an amount greater than $0.");
    if (n > available) return setError(`You can request up to ${money0(available)}.`);
    setError("");
    // TODO(backend): create the payout request.
    onRequest(n, funded.find((a) => a.id === account)?.name ?? account);
    setNotice(`Payout of ${money0(n)} requested. It's now pending.`);
    setAmount("");
  };

  const acct = funded.find((a) => a.id === account);

  return (
    <Card title="Request Payout" className="h-full" bodyClassName="px-[16px] pb-[16px]">
      <form noValidate onSubmit={submit} className="grid grid-cols-[80px_1fr] items-center gap-x-[12px] gap-y-[10px] text-[12px]">
        <label htmlFor="payout-account" className="text-white/50">Account</label>
        <span className="relative">
          <select
            id="payout-account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className={cn(field, "w-full appearance-none pr-[34px] outline-none focus:border-gold-accent [&>option]:bg-ink")}
          >
            {funded.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.details}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-white/60" />
        </span>

        <span className="text-white/50">Available</span>
        <span className="w-fit bg-[#47a847]/[0.12] px-[10px] py-[7px] text-[13px] text-[#47a847]">{money0(available)}</span>

        <span className="text-white/50">Network</span>
        <span className={field}>
          <span aria-hidden className="mr-[8px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#2775CA] text-[9px] text-white">$</span>
          USDC · BNB Smart Chain (BEP-20)
        </span>

        <label htmlFor="payout-address" className="text-white/50">Address</label>
        <input
          id="payout-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          className={cn(field, "w-full min-w-0 text-[#C9B27A] outline-none focus:border-gold-accent")}
        />

        <label htmlFor="payout-amount" className="text-white/50">Amount</label>
        <span className={cn(field, "gap-[8px] pr-[8px] focus-within:border-gold-accent")}>
          <span className="text-white/60">$</span>
          <input
            id="payout-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            aria-invalid={!!error}
            aria-describedby={error ? "payout-error" : undefined}
            className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
          />
          <button type="button" onClick={() => setAmount(String(available))} className="px-[6px] text-[11px] text-white/60 hover:text-white">
            MAX
          </button>
          {/* Figma stepper: ±$100, clamped to 0…available */}
          <span className="flex flex-col">
            <button
              type="button"
              aria-label="Increase amount by $100"
              onClick={() => step(100)}
              className="flex h-[11px] w-[16px] items-center justify-center text-white/60 hover:text-white"
            >
              <ChevronUp aria-hidden className="h-[12px] w-[12px]" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Decrease amount by $100"
              onClick={() => step(-100)}
              className="flex h-[11px] w-[16px] items-center justify-center text-white/60 hover:text-white"
            >
              <ChevronDown aria-hidden className="h-[12px] w-[12px]" strokeWidth={2.5} />
            </button>
          </span>
        </span>

        <div className="col-span-2 mt-[6px]">
          {error && (
            <p id="payout-error" role="alert" className="mb-[8px] text-[11px] text-[#E5484D]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!acct || available <= 0}
            className="flex h-[41px] w-full items-center justify-center bg-[linear-gradient(90deg,#FFFFFF_6.863%,#99804A_88.235%)] text-[14px] text-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request Payout
          </button>
          <p role="status" className="mt-[8px] min-h-[15px] text-[11px] text-[#47a847]">
            {notice}
          </p>
        </div>
      </form>
    </Card>
  );
}

const COLS = "grid grid-cols-[70px_minmax(200px,1.6fr)_90px_80px_90px_90px_80px] items-center gap-x-[12px] px-[16px]";

function History({ rows }: { rows: TraderPayout[] }) {
  const [filter, setFilter] = useState<TraderPayoutFilter>("All");
  const [page, setPage] = useState(0);
  const filtered = filter === "All" ? rows : rows.filter((r) => r.status === filter);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  return (
    <Card
      title="Payout History"
      subtitle="View your previous payouts and pending payments."
      action={
        <div role="tablist" aria-label="Payout status" className="flex gap-[9px]">
          {PAYOUT_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => {
                setFilter(f);
                setPage(0);
              }}
              className={tabChip(filter === f)}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">Payout history</caption>
          <thead>
            <tr className={cn(COLS, "h-[47px] bg-white/[0.04] text-[12px] text-white/50")}>
              <th className="font-normal">Date</th>
              <th className="font-normal">Plan</th>
              <th className="font-normal">Amount</th>
              <th className="font-normal">Profit Split</th>
              <th className="font-normal">After Split</th>
              <th className="font-normal">Payment Method</th>
              <th className="text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className={cn(COLS, "h-[52px] border-t-[0.7px] border-white/[0.06] text-[13px] text-white")}>
                <td>{r.date}</td>
                <td className="text-white/80">{r.plan}</td>
                <td>{money0(r.amount)}</td>
                <td>{r.split}%</td>
                <td className="text-[#47a847]">{money0((r.amount * r.split) / 100)}</td>
                <td>{r.method}</td>
                <td className="text-right">
                  <StatusChip tone={r.status === "Pending" ? "amber" : "green"} className="h-[22px] text-[12px] leading-normal">
                    {r.status}
                  </StatusChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="border-t-[0.7px] border-white/[0.06] py-10 text-center text-[13px] text-white/50">No {filter.toLowerCase()} payouts.</p>}
      </div>

      <NumberedPager page={current} pages={pages} shown={shown.length} total={filtered.length} onPage={setPage} label="Payout pages" />
    </Card>
  );
}

/** Trader "Payouts" (Figma 1603:394): reserve stats, lifetime stats, balances, payout request form, payout history. */
export function PayoutsView() {
  // TODO(backend): replace with API data + mutation.
  const [available, setAvailable] = useState(traderBalances.withdrawable);
  const [history, setHistory] = useState(traderPayoutHistory);
  const fundedCount = subAccounts.filter((a) => a.active && a.stage === "Funded Stage").length;

  const request = (amount: number, account: string) => {
    setAvailable((a) => a - amount);
    setHistory((h) => [
      {
        id: `tp-${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        plan: account,
        amount,
        split: 80,
        method: "USDC",
        status: "Pending",
      },
      ...h,
    ]);
  };

  return (
    <div className="mt-[37px] flex flex-col gap-[16px]">
      <div className="grid gap-[16px] md:grid-cols-3">
        {payoutOverview.map((c) => (
          <OverviewCard key={c.label} {...c} />
        ))}
      </div>

      <LifetimeStats wide />

      <div className="grid gap-[16px] xl:grid-cols-[minmax(0,374fr)_minmax(0,720fr)]">
        <div className="flex flex-col gap-[16px]">
          <BalanceCard label="Withdrawable Profits" value={available} note="Available for payout request" />
          <BalanceCard
            label="Sub-Account Profit"
            value={traderBalances.subAccountProfit}
            note={`Across ${fundedCount} funded account${fundedCount === 1 ? "" : "s"}`}
          />
        </div>
        <RequestPayout available={available} onRequest={request} />
      </div>

      <History rows={history} />
    </div>
  );
}

