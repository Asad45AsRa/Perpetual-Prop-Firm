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
                // Once a pick exists, fade every other avatar; hover/focus restores full opacity.
                const dimmed = !!field.value && !selected;
                return (
                  <button
                    key={src}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Avatar ${i + 1}`}
                    onClick={() => field.onChange(src)}
                    className={cn(
                      "group relative aspect-square w-full overflow-hidden rounded-full outline-none",
                      "focus-visible:ring-2 focus-visible:ring-gold-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                    )}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      // Ask for ~3× the 46px slot so avatars stay sharp when the page is zoomed (2048px sources).
                      sizes="140px"
                      className={cn(
                        "rounded-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none",
                        dimmed && "opacity-40 group-hover:opacity-100 group-focus-visible:opacity-100",
                      )}
                    />
                    {/* 1.5px white border on the selected avatar */}
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