"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ASSET_DIR, OTP_LENGTH } from "../constants";
import { codeSchema, type CodeValues } from "../schemas";
import { OnboardingCard } from "../OnboardingCard";
import { FieldError } from "../Field";
import { OtpInput } from "../OtpInput";

const RESEND_COOLDOWN = 30;

type Props = {
  onSubmit: (values: CodeValues) => void;
  onResend: () => void;
  onBack: () => void;
};

/** No Continue button in the design: the step submits once all 6 digits are in. */
export function EmailCodeStep({ onSubmit, onResend, onBack }: Props) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CodeValues>({ resolver: zodResolver(codeSchema), defaultValues: { code: "" } });

  const code = watch("code");
  useEffect(() => {
    if (code.length === OTP_LENGTH) void handleSubmit(onSubmit)();
  }, [code, handleSubmit, onSubmit]);

  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = () => {
    onResend();
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <OnboardingCard title="Check Your Email" subtitle="Enter the 6-digit code sent to your inbox">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-[65px]">
        <p id="code-label" className="mb-[22px] text-[12px] leading-[1.3] text-white/30">
          Email code
        </p>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <OtpInput
              length={OTP_LENGTH}
              value={field.value}
              onChange={field.onChange}
              labelledBy="code-label"
              invalid={!!errors.code}
              describedBy={errors.code ? "code-error" : undefined}
            />
          )}
        />
        <FieldError id="code-error" message={errors.code?.message} />
        <button type="submit" className="sr-only">
          Verify code
        </button>
      </form>

      <div className="mt-[22px] flex items-center justify-between text-[14px] leading-[1.3] text-white">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="transition-opacity hover:opacity-80 disabled:cursor-default disabled:text-white/40"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-[6px] transition-opacity hover:opacity-80"
        >
          <Image
            src={`${ASSET_DIR}/chevron-back.svg`}
            alt=""
            width={16}
            height={16}
            unoptimized
            className="h-4 w-4 -rotate-90"
          />
          Back
        </button>
      </div>
    </OnboardingCard>
  );
}
