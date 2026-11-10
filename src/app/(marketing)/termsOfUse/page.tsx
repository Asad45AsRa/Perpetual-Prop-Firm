import { cn } from "@/lib/utils";
type TermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

const LAST_UPDATED = "[Month DD, YYYY]";
const COMPANY_NAME = "[Company Legal Name]";
const SUPPORT_EMAIL = "support@[yourdomain].com";

const SECTIONS: TermsSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    paragraphs: [
      "By creating an account, purchasing a challenge, or using any part of the Perpeye platform, you agree to be bound by these Terms of Use. If you do not agree, you must not use the platform.",
      "You must be at least 18 years old and legally able to enter into a binding agreement in your jurisdiction.",
    ],
  },
  {
    id: "simulated-trading",
    title: "2. Simulated Trading Only",
    paragraphs: [
      "All trading on Perpeye takes place on virtual accounts. Orders, fills, positions, fees, funding and balances are calculated by our own simulation engine and do not represent real trades on any exchange.",
      "Live market data is provided for reference and simulation purposes only. We do not execute customer orders on any external exchange, and we never request or store your exchange private keys.",
      "Virtual fills may differ from real market execution because of configurable spread, slippage and data delays. Past simulated performance is not a guarantee of future results.",
    ],
  },
  {
    id: "accounts",
    title: "3. Accounts and Security",
    paragraphs: [
      "You must provide accurate information and verify your email address. You are responsible for keeping your login credentials secure and for all activity under your account.",
      "One person may not operate multiple accounts to circumvent rules, and accounts may not be shared, sold or transferred.",
    ],
  },
  {
    id: "challenges",
    title: "4. Challenges and Payments",
    paragraphs: [
      "A challenge is a paid evaluation on a virtual account. Challenge fees are paid in cryptocurrency through our payment provider, Plisio. A challenge account is activated only after the payment is confirmed.",
      "Challenge fees are for access to the evaluation service. Refunds are governed by our refund policy: [Refund Policy to be finalized].",
      "You are responsible for network fees and for sending the exact amount and asset shown on your invoice. Under- or over-payments, or payments sent to the wrong network, may delay or prevent activation.",
    ],
  },
  {
    id: "trading-rules",
    title: "5. Trading Rules",
    paragraphs: [
      "Challenge and funded accounts are subject to the daily loss limit, maximum drawdown, leverage and position limits, and any other rules shown on the Rules page and in your dashboard. These values may differ by plan and market.",
      "If a rule is breached, the account is locked immediately. A breached challenge account fails the evaluation, and a breached funded account is disabled.",
      "We may disable markets, adjust limits, halt trading on a symbol, or apply circuit breakers when market data is stale, unavailable or unreliable.",
    ],
  },
  {
    id: "prohibited",
    title: "6. Prohibited Conduct",
    paragraphs: [
      "You must not exploit pricing errors, data feed delays, platform bugs or simulation weaknesses; use bots or tools that abuse the simulation; engage in account sharing, copy-trading farms or coordinated trading across accounts; or provide false identity information.",
      "We may suspend or terminate accounts, void results and withhold payouts where we reasonably determine that prohibited conduct has occurred.",
    ],
  },
  {
    id: "funded-payouts",
    title: "7. Funded Stage and Payouts",
    paragraphs: [
      "Passing a challenge may lead to a funded-stage virtual account. Funded accounts are also simulated and do not hold real capital in your name.",
      "Payout requests are available only when eligibility requirements are met and are subject to review and approval. The profit split, minimum payout and payout schedule are: [to be finalized].",
      "Payouts are sent in supported cryptocurrency to the wallet address you provide. You are responsible for the accuracy of that address, and transfers cannot be reversed once confirmed on the blockchain.",
      "We may require identity verification and may restrict access from certain jurisdictions: [restricted jurisdictions to be finalized].",
    ],
  },
  {
    id: "affiliates",
    title: "8. Affiliate Program",
    paragraphs: [
      "Affiliate commissions are paid according to the current program terms. Self-referrals, fraudulent or misleading promotion, and artificial conversions are prohibited and may lead to forfeited commissions and account termination.",
    ],
  },
  {
    id: "public-payouts",
    title: "9. Public Payout Feed",
    paragraphs: [
      "Confirmed payouts may be displayed publicly with the date, asset, amount, status and blockchain explorer link. A privacy-safe identifier is used instead of your name or contact details.",
    ],
  },
  {
    id: "risk",
    title: "10. No Financial Advice and Risk Notice",
    paragraphs: [
      "Perpeye provides a simulated trading evaluation service. Nothing on the platform is investment, financial, legal or tax advice. Trading derivatives is high risk, and you are solely responsible for your own decisions and for any taxes on payouts you receive.",
    ],
  },
  {
    id: "availability",
    title: "11. Availability and Changes",
    paragraphs: [
      "We aim for reliable service but do not guarantee uninterrupted access. Maintenance, third-party outages or market data issues may affect the platform.",
      "We may update these Terms from time to time. Continued use after changes take effect means you accept the updated Terms.",
    ],
  },
  {
    id: "liability",
    title: "12. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, the platform is provided \"as is\" and we are not liable for indirect or consequential losses, data feed errors, or losses arising from third-party services. Our total liability is limited to the challenge fees you paid for the affected account.",
    ],
  },
  {
    id: "contact",
    title: "13. Contact",
    paragraphs: [
      `Questions about these Terms can be sent to ${SUPPORT_EMAIL}.`,
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <main className="relative w-full px-5 pb-24 pt-[96px] md:px-20 md:pt-[160px]">
      <div className="mx-auto w-full max-w-[860px]">
        <header className="border-b border-line pb-10">
          <h1 className="text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-white md:text-[60px] md:leading-[1]">
            Terms of Use
          </h1>
          <p className="mt-6 text-[15px] leading-[20px] text-muted/90">
            {COMPANY_NAME} &middot; Last updated{" "}
            <span className="text-gold-accent">{LAST_UPDATED}</span>
          </p>
        </header>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="border-b border-line py-8">
          <p className="mb-4 text-[12px] uppercase leading-none tracking-[0.08em] text-muted">
            Contents
          </p>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-[14px] leading-[20px] text-muted transition-colors hover:text-white"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div>
          {SECTIONS.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className={cn(
                "scroll-mt-24 py-8",
                i > 0 && "border-t border-line"
              )}
            >
              <h2 className="text-[22px] font-normal leading-[1.2] tracking-[-0.02em] text-white md:text-[26px]">
                {section.title}
              </h2>

              <div className="mt-4 space-y-4 text-[15px] leading-[24px] text-muted/90">
                {section.paragraphs.map((text, index) => (
                  <p key={index}>{text}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}