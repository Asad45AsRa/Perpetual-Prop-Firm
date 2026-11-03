"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AVATARS } from "../constants";
import { AvatarPicker } from "../AvatarPicker";
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
            <AvatarPicker
              value={field.value}
              onChange={field.onChange}
              describedBy={errors.avatar ? "avatar-error" : undefined}
              className="mx-auto max-w-[376px] grid-cols-7 gap-[9px]"
            />
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
