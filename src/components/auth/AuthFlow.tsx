"use client";
/* eslint-disable @next/next/no-img-element -- decorative glow SVGs, no optimization needed */

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ASSET_DIR, AUTH_REDIRECT_ROUTE } from "./constants";
import type { AvatarValues, WelcomeValues } from "./schemas";
import { Stepper } from "./Stepper";
import { PromoPanel } from "./PromoPanel";
import { WelcomeStep } from "./steps/WelcomeStep";
import { EmailCodeStep } from "./steps/EmailCodeStep";
import { UsernameStep } from "./steps/UsernameStep";
import { AvatarStep } from "./steps/AvatarStep";

const TOTAL_STEPS = 4;

type Draft = Partial<WelcomeValues> & { username?: string; avatar?: string };

/** Full-screen backdrop: #0F0F0F with the two big gold glow sweeps from Figma. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src={`${ASSET_DIR}/waitlist.png`}
        alt=""
        className="block h-full w-full object-cover"
      />
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

  // Final step: same flow as affiliate join (avatar -> redirect), but lands on the trader dashboard.
  const onAvatar = useCallback(
    ({ avatar }: AvatarValues) => {
      // TODO(backend): submit { ...draft, avatar } to the auth API before redirecting.
      setDraft((d) => ({ ...d, avatar }));
      router.push(AUTH_REDIRECT_ROUTE);
    },
    [router],
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10">
      <Backdrop />

      {/*
        Responsive layout
        - mobile (< md):  promo on top, stepper + form card below (single column, full width)
        - tablet (md):    same stacked order, centered at a wider max width (560px)
        - desktop (lg+):  form on the left, promo flush on the right (original Figma layout)
      */}
      <div className="relative flex w-full flex-col items-center gap-[20px] lg:grid lg:w-auto lg:grid-cols-[459px_457px] lg:grid-rows-[auto_auto_auto] lg:justify-center lg:gap-0">
        {/* Promo: first on mobile/tablet; desktop: right column, same row as the form card */}
        <PromoPanel className="max-lg:hidden order-1 max-w-[459px] md:max-w-[560px] lg:order-none lg:col-start-2 lg:row-start-2 lg:-ml-px lg:mt-[16px] lg:max-w-none lg:self-start" />

        {/* Form column: on desktop its children are placed straight into the grid (lg:contents) */}
        <div className="order-2 w-full max-w-[459px] shrink-0 md:max-w-[560px] lg:contents">
          <div className="lg:col-start-1 lg:row-start-1">
            <Stepper total={TOTAL_STEPS} current={step} />
          </div>

          <div className="mt-[16px] px-px lg:col-start-1 lg:row-start-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="[&>section]:min-h-[425px] lg:[&>section]:h-[425px]"
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
                {step === 3 && <AvatarStep onSubmit={onAvatar} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <Disclaimer className="mt-[25px] lg:col-start-1 lg:row-start-3" />
        </div>
      </div>
    </main>
  );
}