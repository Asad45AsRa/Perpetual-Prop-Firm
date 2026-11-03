"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldError } from "@/components/affiliate-join/Field";
import { GoldButton } from "@/components/affiliate-join/GoldButton";
import { cn } from "@/lib/utils";
import { REFERRAL_BASE, REFERRAL_CODE_PATTERN } from "../data";
import { Modal } from "../Modal";

const strip = (url: string) => url.replace(/^https?:\/\//, "");

const codeSchema = (currentCode: string) =>
  z.object({
    code: z
      .string()
      .trim()
      .regex(REFERRAL_CODE_PATTERN, "Use 3–20 letters, numbers, - or _")
      .refine((v) => v.toLowerCase() !== currentCode.toLowerCase(), "That’s already your code"),
  });
type Values = z.infer<ReturnType<typeof codeSchema>>;

type Props = {
  open: boolean;
  onClose: () => void;
  currentCode: string;
  onSave: (code: string) => void;
};

/** Figma "Edit referral Link code": current link (read-only) + new code input + Save. */
export function EditReferralLinkModal({ open, onClose, currentCode, onSave }: Props) {
  const schema = useMemo(() => codeSchema(currentCode), [currentCode]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { code: "" } });

  // Fresh, empty form every time the popup opens.
  useEffect(() => {
    if (open) reset({ code: "" });
  }, [open, reset]);

  const submit = (v: Values) => {
    // TODO(backend): check availability + save the code via the affiliate API.
    onSave(v.code);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      divided
      title="Edit Your Referral Link"
      description="Edit your referral code to update your link"
      className="max-w-[380px]"
    >
      <form noValidate onSubmit={handleSubmit(submit)}>
        <p className="mb-[6px] text-[11px] leading-[1.3] text-white/50">Your current referral link</p>
        <p className="flex h-[38px] items-center truncate border-[0.7px] border-white/[0.06] bg-white/[0.06] px-[12px] text-[13px] leading-normal text-white">
          {strip(REFERRAL_BASE)}
          {currentCode}
        </p>

        <label htmlFor="referral-code" className="mb-[6px] mt-[14px] block text-[11px] leading-[1.3] text-white/50">
          Edit your referral code
        </label>
        <input
          id="referral-code"
          autoComplete="off"
          spellCheck={false}
          placeholder={currentCode}
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? "referral-code-error" : undefined}
          className={cn(
            "h-[38px] w-full border border-dashed bg-white/[0.03] px-[12px] text-[13px] leading-normal text-white outline-none transition-colors placeholder:text-white/30",
            errors.code ? "border-red-500/70" : "border-gold-accent/60 focus:border-gold-accent",
          )}
          {...register("code")}
        />
        <FieldError id="referral-code-error" message={errors.code?.message} />

        <GoldButton type="submit" disabled={isSubmitting} className="mt-[18px]">
          Save
        </GoldButton>
      </form>
    </Modal>
  );
}
