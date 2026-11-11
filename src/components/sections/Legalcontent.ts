
export type LegalSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

export type LegalContent = {
  companyName: string;
  lastUpdated: string;
  email: string;
  sections: LegalSection[];
};

/* ───────────────────────── Privacy Policy ───────────────────────── */

export const DEFAULT_PRIVACY: LegalContent = {
  companyName: "[Company Legal Name]",
  lastUpdated: "[Month DD, YYYY]",
  email: "privacy@[yourdomain].com",
  sections: [
    {
      title: "Overview",
      paragraphs: [
        "This Privacy Policy explains what personal data Perpeye collects, why we collect it, how we use it, and the choices you have. By using the platform you agree to the practices described here.",
      ],
    },
    {
      title: "Data We Collect",
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
      title: "How We Use Your Data",
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
      title: "Who We Share Data With",
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
      title: "Public Payout Feed",
      paragraphs: [
        "Confirmed payouts may appear publicly with the date, asset, amount, status and blockchain explorer link. A privacy-safe identifier is shown instead of your name or contact details. Note that blockchain transactions are public and permanent by nature.",
      ],
    },
    {
      title: "Market Data",
      paragraphs: [
        "Live market information is received from a third-party data provider and does not contain your personal data. Your simulated orders and balances stay inside our own systems and are never sent to an external exchange.",
      ],
    },
    {
      title: "Cookies and Sessions",
      paragraphs: [
        "We use essential cookies and secure session storage to keep you signed in and protect your account. We may use limited analytics to understand how the site is used. You can control cookies through your browser settings, but disabling essential cookies may stop parts of the platform from working.",
      ],
    },
    {
      title: "Data Retention",
      paragraphs: [
        "We keep personal data only as long as needed for the purposes above, including legal, accounting and audit requirements. Financial and trading records may be kept for [retention period to be finalized] after account closure.",
      ],
    },
    {
      title: "Security",
      paragraphs: [
        "We protect your data with encrypted connections, hashed passwords, role-based access, MFA for administrators, encrypted secrets and regular backups. No system is completely secure, so please use a strong, unique password and keep your login details private.",
      ],
    },
    {
      title: "Your Rights",
      paragraphs: [
        "Depending on where you live, you may have the right to access, correct, export or delete your personal data, or to object to certain processing. To make a request, contact {email}. We may need to verify your identity first and may keep data we are legally required to retain.",
      ],
    },
    {
      title: "International Transfers",
      paragraphs: [
        "Our service providers may process data in countries other than your own. Where required, we use appropriate safeguards for these transfers.",
      ],
    },
    {
      title: "Children",
      paragraphs: [
        "The platform is intended for adults aged 18 or older. We do not knowingly collect data from minors, and will delete it if we learn that we have.",
      ],
    },
    {
      title: "Changes to This Policy",
      paragraphs: [
        "We may update this policy from time to time. The latest version and its date are always shown on this page, and continued use after an update means you accept it.",
      ],
    },
    {
      title: "Contact",
      paragraphs: ["For privacy questions or requests, contact {email}."],
    },
  ],
};

/* ───────────────────────── Terms of Use ───────────────────────── */

export const DEFAULT_TERMS: LegalContent = {
  companyName: "[Company Legal Name]",
  lastUpdated: "[Month DD, YYYY]",
  email: "support@[yourdomain].com",
  sections: [
    {
      title: "Acceptance of Terms",
      paragraphs: [
        "By creating an account, purchasing a challenge, or using any part of the Perpeye platform, you agree to be bound by these Terms of Use. If you do not agree, you must not use the platform.",
        "You must be at least 18 years old and legally able to enter into a binding agreement in your jurisdiction.",
      ],
    },
    {
      title: "Simulated Trading Only",
      paragraphs: [
        "All trading on Perpeye takes place on virtual accounts. Orders, fills, positions, fees, funding and balances are calculated by our own simulation engine and do not represent real trades on any exchange.",
        "Live market data is provided for reference and simulation purposes only. We do not execute customer orders on any external exchange, and we never request or store your exchange private keys.",
        "Virtual fills may differ from real market execution because of configurable spread, slippage and data delays. Past simulated performance is not a guarantee of future results.",
      ],
    },
    {
      title: "Accounts and Security",
      paragraphs: [
        "You must provide accurate information and verify your email address. You are responsible for keeping your login credentials secure and for all activity under your account.",
        "One person may not operate multiple accounts to circumvent rules, and accounts may not be shared, sold or transferred.",
      ],
    },
    {
      title: "Challenges and Payments",
      paragraphs: [
        "A challenge is a paid evaluation on a virtual account. Challenge fees are paid in cryptocurrency through our payment provider, Plisio. A challenge account is activated only after the payment is confirmed.",
        "Challenge fees are for access to the evaluation service. Refunds are governed by our refund policy: [Refund Policy to be finalized].",
        "You are responsible for network fees and for sending the exact amount and asset shown on your invoice. Under- or over-payments, or payments sent to the wrong network, may delay or prevent activation.",
      ],
    },
    {
      title: "Trading Rules",
      paragraphs: [
        "Challenge and funded accounts are subject to the daily loss limit, maximum drawdown, leverage and position limits, and any other rules shown on the Rules page and in your dashboard. These values may differ by plan and market.",
        "If a rule is breached, the account is locked immediately. A breached challenge account fails the evaluation, and a breached funded account is disabled.",
        "We may disable markets, adjust limits, halt trading on a symbol, or apply circuit breakers when market data is stale, unavailable or unreliable.",
      ],
    },
    {
      title: "Prohibited Conduct",
      paragraphs: [
        "You must not exploit pricing errors, data feed delays, platform bugs or simulation weaknesses; use bots or tools that abuse the simulation; engage in account sharing, copy-trading farms or coordinated trading across accounts; or provide false identity information.",
        "We may suspend or terminate accounts, void results and withhold payouts where we reasonably determine that prohibited conduct has occurred.",
      ],
    },
    {
      title: "Funded Stage and Payouts",
      paragraphs: [
        "Passing a challenge may lead to a funded-stage virtual account. Funded accounts are also simulated and do not hold real capital in your name.",
        "Payout requests are available only when eligibility requirements are met and are subject to review and approval. The profit split, minimum payout and payout schedule are: [to be finalized].",
        "Payouts are sent in supported cryptocurrency to the wallet address you provide. You are responsible for the accuracy of that address, and transfers cannot be reversed once confirmed on the blockchain.",
        "We may require identity verification and may restrict access from certain jurisdictions: [restricted jurisdictions to be finalized].",
      ],
    },
    {
      title: "Affiliate Program",
      paragraphs: [
        "Affiliate commissions are paid according to the current program terms. Self-referrals, fraudulent or misleading promotion, and artificial conversions are prohibited and may lead to forfeited commissions and account termination.",
      ],
    },
    {
      title: "Public Payout Feed",
      paragraphs: [
        "Confirmed payouts may be displayed publicly with the date, asset, amount, status and blockchain explorer link. A privacy-safe identifier is used instead of your name or contact details.",
      ],
    },
    {
      title: "No Financial Advice and Risk Notice",
      paragraphs: [
        "Perpeye provides a simulated trading evaluation service. Nothing on the platform is investment, financial, legal or tax advice. Trading derivatives is high risk, and you are solely responsible for your own decisions and for any taxes on payouts you receive.",
      ],
    },
    {
      title: "Availability and Changes",
      paragraphs: [
        "We aim for reliable service but do not guarantee uninterrupted access. Maintenance, third-party outages or market data issues may affect the platform.",
        "We may update these Terms from time to time. Continued use after changes take effect means you accept the updated Terms.",
      ],
    },
    {
      title: "Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by law, the platform is provided \"as is\" and we are not liable for indirect or consequential losses, data feed errors, or losses arising from third-party services. Our total liability is limited to the challenge fees you paid for the affected account.",
      ],
    },
    {
      title: "Contact",
      paragraphs: ["Questions about these Terms can be sent to {email}."],
    },
  ],
};