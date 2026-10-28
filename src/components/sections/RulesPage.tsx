"use client";

import { useState } from "react";
import Image from "next/image";

const FAQS = [
    {
        q: "What is Perpeye?",
        a: "Hypernova is an on-chain prop trading firm built on Hyperliquid. Pass a risk-managed assessment, receive a funded account and keep 80% of the profits — with every rule, payout and reserve anchored on-chain.",
    },
    {
        q: "Is Perpeye a prop firm?",
        a: "Yes. Perpeye is an on-chain prop firm. You trade a funded account after passing the assessment, and every rule is enforced transparently on-chain.",
    },
    {
        q: "Do I trade real money with Perpeye?",
        a: "Once you pass the assessment you trade a funded account backed by the firm's capital on Hyperliquid. This is dummy data and can be replaced.",
    },
    {
        q: "How fast are payouts?",
        a: "Payouts are processed on-chain and settle quickly after you request them. This is dummy data and can be replaced.",
    },
    {
        q: "How does scaling work?",
        a: "Hit your profit targets while respecting the risk rules and your account size scales up. This is dummy data and can be replaced.",
    },
    {
        q: "What markets can I trade?",
        a: "You can trade the perpetual markets listed on Hyperliquid. This is dummy data and can be replaced.",
    },
    {
        q: "How do I know the reserve is real?",
        a: "The reserve is held on-chain, so anyone can verify the balance at any time. This is dummy data and can be replaced.",
    },
];

export function RulesPage() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section
            className="relative w-full overflow-x-clip px-6 pb-40 pt-32 lg:px-20"
            /* Figma frame = 1440px, base text = 14px. Scales with the viewport
               but is capped at 16px so it doesn't look oversized on big screens. */
            style={{ fontSize: "clamp(14px, calc(100vw * 14 / 1440), 16px)" }}
        >
            <style>{`
                @keyframes rulesGlowIn {
                    from { opacity: 0; }
                    to   { opacity: 0.18; }
                }
                @keyframes rulesGlowBreathe {
                    0%, 100% { opacity: 0.18; }
                    50%      { opacity: 0.1; }
                }
                .rules-glow {
                    animation:
                        rulesGlowIn 1.6s ease-out both,
                        rulesGlowBreathe 7s ease-in-out 1.6s infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .rules-glow { animation: none !important; opacity: 0.18; }
                }
            `}</style>

            {/* Same glow as the hero section (#FFFFFF -> #99804A), kept very subtle.
                Sits at the bottom of the section so the colour rises from below. */}
            <div
                aria-hidden
                className="rules-glow pointer-events-none absolute bottom-0 left-1/2 h-[19.07em] w-[114.29em] -translate-x-1/2 translate-y-[110%] blur-[12.5em]"
                style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #99804A 100%)" }}
            />

            {/* Content is centered and limited in width, so it matches Figma on wide screens */}
            <div className="relative z-10 mx-auto w-full max-w-[90em]">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-0">
                    {/* LEFT */}
                    <div className="flex flex-col items-start gap-[2.857em]">
                        <h1 className="w-full max-w-[7.29em] text-[3.714em] font-normal leading-[100%] tracking-[-0.02em] text-white">
                            Frequently Asked Questions About Perpeye
                        </h1>

                        <a
                            href="mailto:support.perpeye@gmail.com"
                            className="inline-flex items-center gap-[0.571em] border border-white/10 bg-white/[0.03] p-[0.5em] pr-[1.43em]"
                        >
                            <span className="flex h-[2.4286em] w-[2.4286em] shrink-0 items-center justify-center bg-white/10">
                                <Image
                                    src="/images/rules/mail.svg"
                                    alt=""
                                    width={18}
                                    height={18}
                                    className="h-[1.3em] w-[1.3em] object-contain"
                                />
                            </span>
                            <span className="text-[1em] font-normal leading-[100%] tracking-[0] text-white/50">
                                support.perpeye@gmail.com
                            </span>
                        </a>
                    </div>

                    {/* RIGHT */}
                    <div className="w-full">
                        <ul className="border-t border-white/10">
                            {FAQS.map((item, i) => {
                                const isOpen = open === i;
                                return (
                                    <li key={item.q} className="border-b border-white/10">
                                        <button
                                            type="button"
                                            aria-expanded={isOpen}
                                            onClick={() => setOpen(isOpen ? null : i)}
                                            className={`flex w-full items-center justify-between gap-4 pt-[1.39em] text-left outline-none focus:outline-none ${
                                                isOpen ? "pb-[0.5em]" : "pb-[1.39em]"
                                            }`}
                                        >
                                            <span className="text-[1.143em] font-normal leading-[0.86] tracking-[-0.03em] text-white">
                                                {item.q}
                                            </span>

                                            {/* Plus has a box; minus is only a plain line (no box, no spot) */}
                                            <span
                                                className={`flex h-[2.4286em] w-[2.4286em] shrink-0 items-center justify-center ${
                                                    isOpen ? "" : "bg-white/10"
                                                }`}
                                            >
                                                {isOpen ? (
                                                    <span
                                                        aria-hidden
                                                        className="block h-px w-[1.143em] bg-white"
                                                    />
                                                ) : (
                                                    <Image
                                                        src="/images/rules/plus.svg"
                                                        alt=""
                                                        width={16}
                                                        height={16}
                                                        className="h-[1.143em] w-[1.143em] object-contain"
                                                    />
                                                )}
                                            </span>
                                        </button>

                                        <div
                                            className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                                                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="pb-[2em] pr-[4.375em] text-[1.0714em] font-normal leading-[1.3] text-white/50">
                                                    {item.a}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}