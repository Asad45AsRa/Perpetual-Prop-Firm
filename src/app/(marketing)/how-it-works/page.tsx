// how-it-works/page.tsx
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description: string;
};

type Stage = {
  id: string;
  label: string;
  heading: string;
  steps: Step[];
};

const STAGES: Stage[] = [
  {
    id: "challenge",
    label: "Stage 1",
    heading: "Take the Challenge",
    steps: [
      {
        title: "Create your account",
        description:
          "Sign up, verify your email and sign in to your trader dashboard.",
      },
      {
        title: "Choose a challenge",
        description:
          "Pick a virtual account size and challenge plan, then pay securely with crypto.",
      },
      {
        title: "Account activation",
        description:
          "Once your payment is confirmed, your challenge account is activated automatically.",
      },
      {
        title: "Trade the markets",
        description:
          "Open and close long and short positions on approved perpetual markets using live market prices.",
      },
      {
        title: "Meet the rules",
        description:
          "Reach the profit target while staying within the daily loss and maximum drawdown limits. Your progress is tracked in real time.",
      },
    ],
  },
  {
    id: "funded",
    label: "Stage 2",
    heading: "Get Funded",
    steps: [
      {
        title: "Funded account created",
        description:
          "After you pass the challenge and required checks, a new funded-stage account is created for you.",
      },
      {
        title: "Keep trading",
        description:
          "Trade under the same risk rules as the challenge. There is no profit target, only payout eligibility.",
      },
    ],
  },
  {
    id: "payout",
    label: "Stage 3",
    heading: "Get Paid",
    steps: [
      {
        title: "Request a payout",
        description:
          "When you are eligible, request a payout to your supported crypto wallet from the dashboard.",
      },
      {
        title: "Review and approval",
        description:
          "Our team reviews and approves your request before the payout is sent.",
      },
      {
        title: "Payout proof",
        description:
          "Your confirmed transaction ID and status appear in your dashboard and on the public payout feed.",
      },
    ],
  },
];

export default function HowItWorksPage() {
  // Running counter so step numbers continue across all stages
  let stepNumber = 0;

  return (
    <main className="relative w-full px-5 pb-24 pt-[96px] md:px-20 md:pt-[160px]">
      <div className="mx-auto w-full max-w-[960px]">
        {/* Page header */}
        <header className="border-b border-line pb-10">
          <h1 className="text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-white md:text-[60px] md:leading-[1]">
            How It Works
          </h1>
          <p className="mt-6 max-w-[480px] text-[15px] leading-[20px] text-muted/90">
            Prove your trading skills on a virtual account, move to a funded
            account, and request real crypto payouts.
          </p>
        </header>

        {/* Stages */}
        {STAGES.map((stage, stageIndex) => (
          <section
            key={stage.id}
            id={stage.id}
            className={cn(
              "grid gap-8 py-12 md:grid-cols-[260px_1fr] md:gap-16",
              stageIndex > 0 && "border-t border-line"
            )}
          >
            <div>
              <p className="text-[12px] uppercase leading-none tracking-[0.08em] text-gold-accent">
                {stage.label}
              </p>
              <h2 className="mt-4 text-[26px] font-normal leading-[1.1] tracking-[-0.02em] text-white md:text-[32px]">
                {stage.heading}
              </h2>
            </div>

            <ol>
              {stage.steps.map((step, i) => {
                stepNumber += 1;
                return (
                  <li
                    key={step.title}
                    className={cn(
                      "flex gap-5",
                      i > 0 && "mt-6 border-t border-line pt-6"
                    )}
                  >
                    <span className="w-8 shrink-0 text-[26px] leading-none text-gold-accent">
                      {String(stepNumber).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-[18px] font-normal leading-[1.2] text-white">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-[520px] text-[15px] leading-[22px] text-muted/90">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        {/* Call to action */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-12">
          <h2 className="text-[26px] font-normal leading-[1.1] tracking-[-0.02em] text-white md:text-[32px]">
            Ready to get funded?
          </h2>
          <div className="flex gap-[14px]">
            <Link
              href={siteConfig.links.getFunded}
              className="inline-flex h-[41px] items-center bg-white px-7 text-[14px] text-ink"
            >
              Get Funded
            </Link>
            <Link
              href={siteConfig.links.discord}
              className="inline-flex h-[41px] items-center border border-[#333] bg-[#1c1c1c] px-7 text-[14px] text-white"
            >
              Join Discord
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}