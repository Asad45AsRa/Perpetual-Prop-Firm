"use client";
/* eslint-disable @next/next/no-img-element -- decorative glow SVGs, no optimization needed */

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {  ASSET_DIR } from "./constants";
import type { WelcomeValues } from "./schemas";
import { Stepper } from "./Stepper";
import { PromoPanel } from "./PromoPanel";
import { WelcomeStep } from "./steps/WelcomeStep";
import { EmailCodeStep } from "./steps/EmailCodeStep";
import { UsernameStep } from "./steps/UsernameStep";
import { AvatarStep } from "./steps/AvatarStep";

const TOTAL_STEPS = 4;

type Draft = Partial<WelcomeValues> & { username?: string };

/** Full-screen backdrop: #0F0F0F with the two big gold glow sweeps from Figma. */
function Backdrop() {
  const glow = "absolute left-[calc(50%-1012px)] h-[897.88px] w-[2081.76px]";
  const inset = "absolute inset-[-12.41%_-5.71%_-11.67%_-5.71%]";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={cn(glow, "top-[-588px]")}>
        <div className={inset}>
          <img src={`${ASSET_DIR}/bg-glow-top.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>
      <div className={cn(glow, "bottom-[-588px] rotate-180")}>
        <div className={inset}>
          <img src={`${ASSET_DIR}/bg-glow-bottom.svg`} alt="" className="block h-full w-full max-w-none" />
        </div>
      </div>
    </div>
  );
}

function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-[12px] leading-[1.3] text-[#606060]", className)}>
      Perpeye offers trading evaluations in a simulated environment. By proceeding,
      <br className="hidden sm:block" /> you accept our{" "}
      <Link href="/terms" className="text-[#888] underline hover:text-white">
        Terms
      </Link>{" "}
      and acknowledge our{" "}
      <Link href="/privacy" className="text-[#888] underline hover:text-white">
        Privacy Policy
      </Link>
      .
    </p>
  );
}

export function AuthFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});

  const next = useCallback((patch: Partial<Draft> = {}) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  // TODO(backend): wire these stubs to the auth API.
  const onGoogle = () => console.info("[auth] Google sign-in not implemented yet");
  const onResend = () => console.info("[auth] resend code to", draft.email);
  const onCode = useCallback(() => next(), [next]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10">
      <Backdrop />

      <div className="relative flex w-full items-start justify-center">
        {/* Left column: stepper (459) + card (457, 425 tall) + disclaimer */}
        <div className="w-full max-w-[459px] shrink-0">
          <Stepper total={TOTAL_STEPS} current={step} />

          <div className="mt-[16px] px-px">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="[&>section]:h-[425px]"
              >
                {step === 0 && (
                  <WelcomeStep defaultValues={draft} onSubmit={(v) => next(v)} onGoogle={onGoogle} />
                )}
                {step === 1 && (
                  <EmailCodeStep onSubmit={onCode} onResend={onResend} onBack={() => setStep(0)} />
                )}
                {step === 2 && (
                  <UsernameStep defaultValue={draft.username} onSubmit={(v) => next(v)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <Disclaimer className="mt-[25px]" />
        </div>

        {/* Right promo card, flush against the form card, always visible */}
        <PromoPanel className="-ml-px mt-[38px]" />
      </div>
    </main>
  );
}
//coments