"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ASSET_DIR, PLATFORMS } from "../constants";
import { welcomeSchema, type WelcomeValues } from "../schemas";
import { OnboardingCard } from "../OnboardingCard";
import { GoldButton } from "../GoldButton";
import { SelectField, TextField } from "../Field";

const PERKS = ["Sign up with your email and username", "No verification calls required"];

type Props = {
  defaultValues?: Partial<WelcomeValues>;
  onSubmit: (values: WelcomeValues) => void;
  onGoogle: () => void;
};

export function WelcomeStep({ defaultValues, onSubmit, onGoogle }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WelcomeValues>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: { email: "", platform: "", handle: "", ...defaultValues },
  });

  return (
    <OnboardingCard title="Welcome to Perpeye" subtitle="Sign in or create an account below">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-[23px]">
        <div className="grid gap-[17px] sm:grid-cols-[1fr_150px] sm:gap-x-[16px]">
          <TextField
            id="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <SelectField
            id="platform"
            label="Select your platform"
            placeholder="Select here"
            options={PLATFORMS}
            isEmpty={!watch("platform")}
            error={errors.platform?.message}
            {...register("platform")}
          />
        </div>
        <TextField
          id="handle"
          label="Enter your username for the selected platform"
          placeholder="Enter your username"
          autoComplete="off"
          className="mt-[17px]"
          error={errors.handle?.message}
          {...register("handle")}
        />

        <GoldButton type="submit" className="mt-[19px]">
          Continue
        </GoldButton>
        <GoldButton variant="white" onClick={onGoogle} className="mt-[16px]">
          <Image src={`${ASSET_DIR}/google.svg`} alt="" width={16} height={16} unoptimized className="h-4 w-4" />
          Continue with Google
        </GoldButton>
      </form>

      <ul className="mt-[22px] flex flex-wrap justify-center gap-x-[16px] gap-y-2">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-[4px] text-[12px] leading-none text-white/50">
            <Image
              src={`${ASSET_DIR}/check-green.svg`}
              alt=""
              width={12}
              height={12}
              unoptimized
              className="h-[11.883px] w-[11.883px]"
            />
            {perk}
          </li>
        ))}
      </ul>
    </OnboardingCard>
  );
}
