// privacy-policy/page.tsx
import { cn } from "@/lib/utils";

type PolicySection = {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
};

const LAST_UPDATED = "[Month DD, YYYY]";
const COMPANY_NAME = "[Company Legal Name]";
const PRIVACY_EMAIL = "privacy@[yourdomain].com";

const SECTIONS: PolicySection[] = [
  {
    id: "overview",
    title: "1. Overview",
    paragraphs: [
      "This Privacy Policy explains what personal data Perpeye collects, why we collect it, how we use it, and the choices you have. By using the platform you agree to the practices described here.",
    ],
  },
  {
    id: "data-we-collect",
    title: "2. Data We Collect",
    paragraphs: ["Depending on how you use the platform, we may collect:"],
    items: [
      "Account data: name, email address, hashed password, and security settings such as MFA.",
      "Verification data: identity documents and review status, where verification is required.",
      "Payment data: invoice details, payment status, asset, network and transaction hash. We never receive or store your wallet private keys.",
      "Payout data: the wallet address and network you provide for payouts, and the related transaction records.",
      "Trading data: virtual orders, positions, fills, fees, balances, risk events and account history.",
      "Affiliate data: referral codes, conversions and commission balances.",
      "Technical data: IP address, device and browser information, and security and audit logs.",
    ],
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Data",
    paragraphs: ["We use your data to:"],
    items: [
      "Create and secure your account, and send transactional emails such as sign-up, password reset, purchase and payout notices.",
      "Process challenge payments, activate accounts, and review and send payouts.",
      "Run the simulated trading engine, evaluate challenge rules, and enforce account limits.",
      "Prevent fraud, abuse, multiple-account use and rule circumvention.",
      "Show privacy-safe confirmed payouts on the public payout feed.",
      "Meet legal, tax and compliance obligations.",
    ],
  },
  {
    id: "sharing",
    title: "4. Who We Share Data With",
    paragraphs: [
      "We do not sell your personal data. We share it only with service providers that help us operate the platform, under appropriate safeguards:",
    ],
    items: [
      "Payment processing: Plisio, for crypto invoices and payment confirmation.",
      "Email delivery: Resend, for transactional emails.",
      "Infrastructure: Vercel, Render and Neon, for hosting the website, backend and database.",
      "Legal and regulatory authorities, where we are required to disclose data by law.",
    ],
  },
  {
    id: "public-payouts",
    title: "5. Public Payout Feed",
    paragraphs: [
      "Confirmed payouts may appear publicly with the date, asset, amount, status and blockchain explorer link. A privacy-safe identifier is shown instead of your name or contact details. Note that blockchain transactions are public and permanent by nature.",
    ],
  },
  {
    id: "market-data",
    title: "6. Market Data",
    paragraphs: [
      "Live market information is received from a third-party data provider and does not contain your personal data. Your simulated orders and balances stay inside our own systems and are never sent to an external exchange.",
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies and Sessions",
    paragraphs: [
      "We use essential cookies and secure session storage to keep you signed in and protect your account. We may use limited analytics to understand how the site is used. You can control cookies through your browser settings, but disabling essential cookies may stop parts of the platform from working.",
    ],
  },
  {
    id: "retention",
    title: "8. Data Retention",
    paragraphs: [
      "We keep personal data only as long as needed for the purposes above, including legal, accounting and audit requirements. Financial and trading records may be kept for [retention period to be finalized] after account closure.",
    ],
  },
  {
    id: "security",
    title: "9. Security",
    paragraphs: [
      "We protect your data with encrypted connections, hashed passwords, role-based access, MFA for administrators, encrypted secrets and regular backups. No system is completely secure, so please use a strong, unique password and keep your login details private.",
    ],
  },
  {
    id: "rights",
    title: "10. Your Rights",
    paragraphs: [
      `Depending on where you live, you may have the right to access, correct, export or delete your personal data, or to object to certain processing. To make a request, contact ${PRIVACY_EMAIL}. We may need to verify your identity first and may keep data we are legally required to retain.`,
    ],
  },
  {
    id: "international",
    title: "11. International Transfers",
    paragraphs: [
      "Our service providers may process data in countries other than your own. Where required, we use appropriate safeguards for these transfers.",
    ],
  },
  {
    id: "children",
    title: "12. Children",
    paragraphs: [
      "The platform is intended for adults aged 18 or older. We do not knowingly collect data from minors, and will delete it if we learn that we have.",
    ],
  },
  {
    id: "changes",
    title: "13. Changes to This Policy",
    paragraphs: [
      "We may update this policy from time to time. The latest version and its date are always shown on this page, and continued use after an update means you accept it.",
    ],
  },
  {
    id: "contact",
    title: "14. Contact",
    paragraphs: [
      `For privacy questions or requests, contact ${PRIVACY_EMAIL}.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="relative w-full px-5 pb-24 pt-[96px] md:px-20 md:pt-[160px]">
      <div className="mx-auto w-full max-w-[860px]">
        <header className="border-b border-line pb-10">
          <h1 className="text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-white md:text-[60px] md:leading-[1]">
            Privacy Policy
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
                {section.paragraphs.map((text, idx) => (
                  <p key={idx}>{text}</p>
                ))}

                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-[10px] h-[5px] w-[5px] shrink-0 bg-gold-accent"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}