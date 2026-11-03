"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AvatarPicker } from "@/components/affiliate-join/AvatarPicker";
import { AVATARS } from "@/components/affiliate-join/constants";
import { FieldError } from "@/components/affiliate-join/Field";
import { GoldButton } from "@/components/affiliate-join/GoldButton";
import { avatarSchema, usernameSchema } from "@/components/affiliate-join/schemas";
import { cn } from "@/lib/utils";
import { currentUser } from "../data";

const profileSchema = usernameSchema.merge(avatarSchema);
type ProfileValues = z.infer<typeof profileSchema>;

const input =
  "h-[40px] w-full border-[0.7px] bg-white/[0.06] px-[14px] text-[14px] leading-[1.3] text-white outline-none transition-colors focus:border-gold-accent";
const label = "mb-[8px] block text-[12px] leading-[1.3] text-white/50";
const hint = "mt-[8px] text-[12px] leading-[1.4] text-white/30";

export function ProfileForm() {
  const [saved, setSaved] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    // TODO(backend): load from the affiliate profile API; Figma shows the 10th avatar selected.
    defaultValues: { username: currentUser.name, avatar: AVATARS[9] },
  });

  const onSubmit = async (values: ProfileValues) => {
    // TODO(backend): PATCH the profile.
    reset(values);
    setSaved(true);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} onChange={() => setSaved(false)} className="px-[16px] pb-[20px] pt-[18px]">
      <div className="grid gap-[16px] sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="profile-username" className={label}>
            Username
          </label>
          <input
            id="profile-username"
            autoComplete="username"
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "profile-username-error" : "profile-username-hint"}
            className={cn(input, errors.username ? "border-red-500/60" : "border-white/[0.13]")}
            {...register("username")}
          />
          <FieldError id="profile-username-error" message={errors.username?.message} />
          <p id="profile-username-hint" className={hint}>
            Your unique username, visible on your profile, certificates, and leaderboard.
          </p>
        </div>

        <div className="min-w-0">
          <label htmlFor="profile-email" className={label}>
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={currentUser.email}
            readOnly
            aria-describedby="profile-email-hint"
            className={cn(input, "cursor-not-allowed border-white/[0.13] text-white/70 focus:border-white/[0.13]")}
          />
          <p id="profile-email-hint" className={hint}>
            This setting is controlled by your sign-in method and cannot be modified here.
          </p>
        </div>
      </div>

      <p className={cn(label, "mt-[20px]")} id="profile-avatar-label">
        Change Avatar
      </p>
      <Controller
        name="avatar"
        control={control}
        render={({ field }) => (
          <AvatarPicker
            value={field.value}
            onChange={(v) => {
              field.onChange(v);
              setSaved(false);
            }}
            size={40}
            describedBy={errors.avatar ? "profile-avatar-error" : undefined}
            className="grid-cols-7 gap-[8px] sm:grid-cols-[repeat(13,minmax(0,1fr))] sm:gap-[9px]"
          />
        )}
      />
      <FieldError id="profile-avatar-error" message={errors.avatar?.message} />

      <GoldButton type="submit" className="mt-[22px]" disabled={isSubmitting}>
        Save Changes
      </GoldButton>
      <p role="status" className="mt-[8px] min-h-[16px] text-center text-[12px] text-[#47a847]">
        {saved ? "Profile saved" : ""}
      </p>
    </form>
  );
}
