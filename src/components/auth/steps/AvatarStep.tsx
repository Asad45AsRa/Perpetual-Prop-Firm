"use client";

import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { AVATARS } from "../constants";
import { avatarSchema, type AvatarValues } from "../schemas";
import { OnboardingCard } from "../OnboardingCard";
import { GoldButton } from "../GoldButton";
import { FieldError } from "../Field";

type Props = {
  onSubmit: (values: AvatarValues) => void;
};

export function AvatarStep({ onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AvatarValues>({
    resolver: zodResolver(avatarSchema),
    // Figma shows the first avatar preselected.
    defaultValues: { avatar: AVATARS[0] },
  });

  return (
    <OnboardingCard title="Pick Your Avatar" subtitle="Choose how you’ll show up on the leaderboard">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-[25px]">
        <Controller
          name="avatar"
          control={control}
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label="Avatar"
              aria-describedby={errors.avatar ? "avatar-error" : undefined}
              className="mx-auto grid max-w-[376px] grid-cols-7 gap-[6px] sm:gap-[9px]"
            >
              {AVATARS.map((src, i) => {
                const selected = field.value === src;
                return (
                  <button
                    key={src}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Avatar ${i + 1}`}
                    onClick={() => field.onChange(src)}
                    className={cn(
                      "relative aspect-square w-full rounded-full outline-none transition-opacity",
                      "focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                      !selected && "hover:opacity-90",
                    )}
                  >
                    <Image src={src} alt="" fill sizes="46px" className="rounded-full object-cover" />
                    {/* Figma: 1.5px white border on the selected avatar */}
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full border-[1.5px] transition-colors",
                        selected ? "border-white" : "border-transparent",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          )}
        />
        <FieldError id="avatar-error" message={errors.avatar?.message} />

        <GoldButton type="submit" className="mt-[25px]" disabled={isSubmitting}>
          Continue
        </GoldButton>
      </form>
    </OnboardingCard>
  );
}