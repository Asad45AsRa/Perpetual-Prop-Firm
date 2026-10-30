"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

const links = [
  { label: "Challenges", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Rules", href: "/rules" },
  { label: "Affiliates", href: "/affiliates" },
  { label: "FAQ", href: "/#faq" }, // ab Challenges page ke FAQ section par jayega
];

export function Navbar() {
  const pathname = usePathname();
  const [faqInView, setFaqInView] = useState(false);

  // Home page par FAQ section screen par aaye to FAQ active dikhao
  useEffect(() => {
    if (pathname !== "/") {
      setFaqInView(false);
      return;
    }

    const el = document.getElementById("faq");
    if (!el) return;



    const observer = new IntersectionObserver(
      ([entry]) => setFaqInView(entry.isIntersecting),
      { rootMargin: "-40% 0px -40% 0px" } // jab section screen ke beech mein ho
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/" || window.location.hash !== "#faq") return;

    const t = setTimeout(() => {
      document
        .getElementById("faq")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);

    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/5 bg-nav/60 backdrop-blur-nav">
      <div className="relative flex h-full w-full items-center justify-between px-6 lg:px-20">
        {/* Logo */}
        <Link href="/" className="flex items-center outline-none focus:outline-none">
          <Image
            src="/images/nav/nav.png"
            alt={siteConfig.name}
            width={114}
            height={29}
            priority
            unoptimized
            className="h-[29px] w-auto"
          />
        </Link>

        {/* Nav links */}
        <nav className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 items-center gap-10">
          {links.map((item) => {
            const isFaq = item.label === "FAQ";
            const isChallenges = item.label === "Challenges";

            let isActive = false;
            if (isFaq) {
              isActive = pathname === "/" && faqInView;
            } else if (isChallenges) {
              isActive = pathname === "/" && !faqInView;
            } else {
              isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  // Home page par ho to seedha FAQ tak scroll
                  if (isFaq && pathname === "/") {
                    e.preventDefault();
                    document
                      .getElementById("faq")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.history.pushState(null, "", "/#faq");
                  }
                  // Challenges par click: top par jao
                  if (isChallenges && pathname === "/") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    window.history.pushState(null, "", "/");
                  }
                }}
                className="relative flex h-full items-center text-[14px] font-[40px] leading-none tracking-normal text-white/70 outline-none transition-opacity hover:opacity-80"
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #FFFFFF 0%, #99804A 100%)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Get Funded */}
        <Link
          href={siteConfig.links.getFunded}
          className="flex h-[41px] w-[126px] items-center justify-center font-[50px] rounded-[2px] bg-white text-[14px] font-normal leading-none text-black outline-none"
        >
          Get Funded
        </Link>
      </div>
    </header>
  );
}