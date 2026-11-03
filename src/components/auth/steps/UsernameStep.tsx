"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameSchema, type UsernameValues } from "../schemas";
import { OnboardingCard } from "../OnboardingCard";
import { GoldButton } from "../GoldButton";
import { TextField } from "../Field";

type Props = {
  defaultValue?: string;
  onSubmit: (values: UsernameValues) => void;
};

export function UsernameStep({ defaultValue = "", onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernameValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: defaultValue },
  });

  return (
    // Figma reads "create and account" — typo fixed.
    <OnboardingCard title="Welcome to Perpeye" subtitle="Sign in or create an account below">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-[64px]">
        <TextField
          id="username"
          label="Username"
          placeholder="Enter username"
          autoComplete="username"
          autoFocus
          error={errors.username?.message}
          {...register("username")}
        />
        <GoldButton type="submit" className="mt-[32px]">
          Continue
        </GoldButton>
      </form>
    </OnboardingCard>
  );
}
