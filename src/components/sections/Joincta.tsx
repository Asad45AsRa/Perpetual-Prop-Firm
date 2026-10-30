"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

const stats = [
  { value: "$680.1K", label: "Payout reserve" },
  { value: "$1.73M", label: "Lifetime payouts" },
  { value: "8.3s", label: "Avg payout time" },
  { value: "$5.18M", label: "Funded trader AUM" },
  { value: "$10.84B", label: "Traded volume" },
];

/* "$680.1K" -> prefix "$", number 680.1, suffix "K" */
function Counter({ value, duration = 2000 }: { value: string; duration?: number }) {
  const match = value.match(/^([^0-9]*)([\d.]+)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numStr = match?.[2] ?? "0";
  const suffix = match?.[3] ?? "";
  const target = parseFloat(numStr);
  const decimals = (numStr.split(".")[1] ?? "").length;

  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setN(target * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function JoinCta() {
  return (
    /*
      overflow-x-clip: 1600px glow se horizontal scroll na aaye (overflow-y visible, glow upar/neeche phailta hai).
      Section transparent hai: body ka bg globals.css ke :has rule se #111 ho jata hai.
    */
    <section
      data-affiliate-page
      className="relative w-full px-6 pb-[40px] pt-[84px] md:px-20"
    >
      {/*
        Figma: Rectangle 1600 x 267, left -80, Linear gradient #FFFFFF -> #99804A (top -> bottom),
        Layer blur 350 (= blur(175px) in CSS).
        Rectangle heading ki 1st line ke baseline se shuru hota hai (section top se 153px neeche).
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[153px] h-[267px] w-[1600px] -translate-x-1/2 blur-[175px]"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #99804A 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center text-center">
        <h2 className="text-[40px] font-normal leading-[1.05] tracking-[-0.02em] text-white md:text-[85px] md:leading-[75px]">
          Join Our Affiliate Program
          <br className="hidden md:block" /> And Earn Rewards
        </h2>

        <p className="mt-5 max-w-[640px] text-[14px] leading-[21px] text-white/60">
          Turn your network into earning opportunities by sharing your unique
          referral link and earning commissions on qualifying purchases. Track
          your referrals, monitor your performance, and manage your rewards from
          your dedicated affiliate dashboard.
        </p>

        <div className="mt-[26px] flex gap-4">
          <Link
            href=''
            className="inline-flex h-[41px] items-center bg-white px-7 text-[14px] text-ink"
          >
            Join Affiliate
          </Link>
          <Link
            href=''
            className="inline-flex h-[41px] items-center border border-white/15 bg-[#6B6558]/50 px-7 text-[14px] text-white/90"
          >
            Affiliate Login
          </Link>
        </div>

        {/* Stats: har column px-[45px], beech me 1px divider */}
        <dl className="mt-[55px] flex flex-wrap justify-center gap-y-6">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={
                "px-[45px] text-center" +
                (i > 0 ? " md:border-l md:border-white/10" : "")
              }
            >
              <dt className="text-[26px] leading-none text-white">
                <Counter value={s.value} />
              </dt>
              <dd className="mt-[11px] text-[12px] leading-none text-white/60">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}