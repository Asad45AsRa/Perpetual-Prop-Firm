"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldError } from "@/components/affiliate-join/Field";
import { GoldButton } from "@/components/affiliate-join/GoldButton";
import { cn } from "@/lib/utils";
import { BSC_ADDRESS_PATTERN, DASH_ASSETS, formatUsd } from "../data";
import { Panel } from "../Panel";

const walletSchema = z.object({
  address: z.string().trim().regex(BSC_ADDRESS_PATTERN, "Enter a valid BSC address (0x followed by 40 characters)"),
});
type WalletValues = z.infer<typeof walletSchema>;

const shorten = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

type Props = {
  available: number;
  minimum: number;
  pendingApproval: number;
  paidToDate: number;
  wallet: string | null;
  onSaveWallet: (address: string) => void;
  onRequestWithdrawal: () => void;
};

/** Figma "Payouts" right card: balance, totals, payout wallet form, Request Withdrawal. */
export function WithdrawCard({ available, minimum, pendingApproval, paidToDate, wallet, onSaveWallet, onRequestWithdrawal }: Props) {
  const [open, setOpen] = useState(true); // Figma shows the wallet section expanded
  const [notice, setNotice] = useState("");
  const sectionId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WalletValues>({ resolver: zodResolver(walletSchema), defaultValues: { address: wallet ?? "" } });

  const saveWallet = (v: WalletValues) => {
    // TODO(backend): save the payout wallet.
    onSaveWallet(v.address);
    setOpen(false);
    setNotice("Payout wallet saved.");
  };

  const canWithdraw = !!wallet && available >= minimum;
  const requestWithdrawal = () => {
    // TODO(backend): create the withdrawal request.
    onRequestWithdrawal();
    setNotice(`Withdrawal of ${formatUsd(available)} requested. It’s now pending approval.`);
  };

  return (
    <Panel className="self-start px-[16px] pb-[16px] pt-[16px]">
      <p className="text-[12px] leading-[1.3] text-white">Ready to withdraw</p>
      <p className="mt-[6px] text-[35px] leading-[1.2] tracking-[-0.7px] text-white">{formatUsd(available)}</p>

      <div
        role="progressbar"
        aria-label="Available commission versus payout minimum"
        aria-valuemin={0}
        aria-valuemax={minimum}
        aria-valuenow={Math.min(available, minimum)}
        className="mt-[12px] h-[4px] w-full rounded-full bg-white/[0.06]"
      >
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#99804A,#FFFFFF)] transition-[width] duration-500"
          style={{ width: `${Math.min(available / minimum, 1) * 100}%` }}
        />
      </div>
      <div className="mt-[6px] flex justify-between text-[11px] leading-[1.3] text-white/30">
        <span>Available commission</span>
        <span>{formatUsd(minimum)} minimum</span>
      </div>

      <dl className="mt-[18px] flex flex-col gap-[8px] text-[12px] leading-[1.3]">
        <div className="flex justify-between">
          <dt className="text-white/50">Pending approval</dt>
          <dd className="text-white">{formatUsd(pendingApproval)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">Paid to date</dt>
          <dd className="text-white">{formatUsd(paidToDate)}</dd>
        </div>
      </dl>

      {/* Payout wallet (collapsible) */}
      <div className="mt-[18px] border-t-[0.7px] border-white/[0.06] pt-[14px]">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={sectionId}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-[10px] text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-accent"
        >
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06]">
            <Image src={`${DASH_ASSETS}/icons/wallet.svg`} alt="" width={18} height={18} unoptimized className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] leading-normal text-white">
            {wallet ? (
              <>
                Payout wallet <span className="text-white/50">· {shorten(wallet)}</span>
              </>
            ) : (
              "Add a payout wallet"
            )}
          </span>
          <Image
            src={`${DASH_ASSETS}/icons/chevron-down.svg`}
            alt=""
            width={23}
            height={23}
            unoptimized
            className={cn("h-[23px] w-[23px] opacity-60 transition-transform duration-200", open && "rotate-180")}
          />
        </button>

        <form id={sectionId} hidden={!open} noValidate onSubmit={handleSubmit(saveWallet)} className="mt-[12px]">
          <p className="text-[11px] leading-[1.4] text-white/30">Receive USDC on BNB Smart Chain (BEP-20)</p>
          <label htmlFor="payout-wallet" className="mt-[12px] block text-[11px] leading-[1.3] text-white/30">
            BNB Smart Chain wallet address
          </label>
          <input
            id="payout-wallet"
            autoComplete="off"
            spellCheck={false}
            placeholder="0x… address receiving USDC on BSC"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "payout-wallet-error" : "payout-wallet-hint"}
            className={cn(
              "mt-[6px] h-[38px] w-full border-[0.7px] bg-white/[0.03] px-[12px] text-[12px] leading-normal text-white outline-none transition-colors placeholder:text-white/30 focus:border-gold-accent",
              errors.address ? "border-red-500/60" : "border-white/[0.06]",
            )}
            {...register("address")}
          />
          <FieldError id="payout-wallet-error" message={errors.address?.message} />
          <p id="payout-wallet-hint" className="mt-[8px] text-[11px] leading-[1.4] text-gold-accent/80">
            Make sure your receiving wallet supports USDC on BNB Smart Chain (BEP-20)
          </p>
          <GoldButton type="submit" variant="white" disabled={isSubmitting} className="mt-[12px] h-[38px] text-[12px]">
            Save Payout Wallet
          </GoldButton>
        </form>
      </div>

      <GoldButton onClick={requestWithdrawal} disabled={!canWithdraw} className="mt-[20px] text-[13px]">
        Request Withdrawal
        <Image src={`${DASH_ASSETS}/icons/arrow-up-right.svg`} alt="" width={16} height={16} unoptimized className="h-[16px] w-[16px]" />
      </GoldButton>
      <p className="mt-[10px] text-[11px] leading-[1.4] text-white/30">
        {!wallet
          ? "Save your BNB Smart Chain USDC wallet address to receive commission payouts."
          : available < minimum
            ? `You can withdraw once you have at least ${formatUsd(minimum)} available.`
            : `Payouts are sent to ${shorten(wallet)} on BNB Smart Chain.`}
      </p>
      <p role="status" className="mt-[6px] min-h-[15px] text-[11px] leading-[1.4] text-[#47a847]">
        {notice}
      </p>
    </Panel>
  );
}
