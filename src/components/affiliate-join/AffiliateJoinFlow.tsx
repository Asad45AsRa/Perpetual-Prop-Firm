"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AFFILIATE_DASHBOARD_ROUTE, ASSET_DIR } from "./constants";
import type { WelcomeValues } from "./schemas";
import { Stepper } from "./Stepper";
import { PromoPanel } from "./PromoPanel";
import { WelcomeStep } from "./steps/WelcomeStep";
import { EmailCodeStep } from "./steps/EmailCodeStep";
import { UsernameStep } from "./steps/UsernameStep";
import { AvatarStep } from "./steps/AvatarStep";

const TOTAL_STEPS = 4;

type Draft = Partial<WelcomeValues> & { username?: string };

/** Full-screen backdrop: the Figma page background (dark with soft gold glows in the corners), cover-fitted. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-ink">
      <Image src={`${ASSET_DIR}/bg.webp`} alt="" fill priority sizes="100vw" className="object-cover object-center select-none" />
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

export function AffiliateJoinFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});

  const next = useCallback((patch: Partial<Draft> = {}) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  // TODO(backend): wire these stubs to the auth API.
  const onGoogle = () => console.info("[affiliate-join] Google sign-in not implemented yet");
  const onResend = () => console.info("[affiliate-join] resend code to", draft.email);
  const onCode = useCallback(() => next(), [next]);

  const withPromo = step > 0;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10">
      <Backdrop />

      <div className="relative flex w-full items-start justify-center">
        {/* Left column: stepper (459) + card (457) + disclaimer */}
        <div className="w-full max-w-[459px]">
          <Stepper total={TOTAL_STEPS} current={step} />

          <div className="mt-[16px] px-px">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(withPromo && "lg:[&>section]:h-[425px]")}
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
                {step === 3 && (
                  <AvatarStep onSubmit={() => router.push(AFFILIATE_DASHBOARD_ROUTE)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <Disclaimer className={withPromo ? "mt-[25px]" : "mt-[14px]"} />
        </div>

        {/* Right promo card, flush against the form card; needs ~916px, so hidden below lg */}
        {withPromo && <PromoPanel className="-ml-px mt-[38px] hidden lg:block" />}
      </div>
    </main>
  );
}
