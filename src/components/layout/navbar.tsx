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
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const pathname = usePathname();
  const [faqInView, setFaqInView] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setFaqInView(false);
      return;
    }

    const el = document.getElementById("faq");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFaqInView(entry.isIntersecting),
      { rootMargin: "-40% 0px -40% 0px" }
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

  // Close the mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock page scroll while the mobile menu is open, close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // If the screen grows to desktop size, make sure the mobile menu is closed
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const getActive = (item: (typeof links)[number]) => {
    const isFaq = item.label === "FAQ";
    const isChallenges = item.label === "Challenges";
    if (isFaq) return pathname === "/" && faqInView;
    if (isChallenges) return pathname === "/" && !faqInView;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  // Mobile link click: close the menu first, then run the same scroll logic as desktop
  const handleMobileClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof links)[number]
  ) => {
    const isFaq = item.label === "FAQ";
    const isChallenges = item.label === "Challenges";
    setMenuOpen(false);

    if (isFaq && pathname === "/") {
      e.preventDefault();
      setTimeout(() => {
        document
          .getElementById("faq")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", "/#faq");
      }, 60);
    }
    if (isChallenges && pathname === "/") {
      e.preventDefault();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
      }, 60);
    }
  };

  return (
    <>
      {/* Desktop keeps the original blur (backdrop-blur-nav), mobile uses the new 18px blur */}
      <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/5 bg-nav/60 lg:backdrop-blur-nav max-lg:backdrop-blur-[18px] max-lg:[-webkit-backdrop-filter:blur(18px)]">
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

          {/* Nav links (desktop only: below lg the mobile menu is used) */}
          <nav className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 items-center gap-10 max-lg:hidden">
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
                    // Home page FAQ scroll
                    if (isFaq && pathname === "/") {
                      e.preventDefault();
                      document
                        .getElementById("faq")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      window.history.pushState(null, "", "/#faq");
                    }
                    // Challenges
                    if (isChallenges && pathname === "/") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      window.history.pushState(null, "", "/");
                    }
                  }}
                  className="relative flex h-full items-center text-[14px] leading-none tracking-normal text-white/70 outline-none transition-opacity hover:opacity-80"
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

          {/* Get Funded (desktop only: on mobile it lives inside the menu) */}
          <Link
            href={siteConfig.links.getFunded}
            className="flex h-[41px] w-[126px] items-center justify-center font-[50px] rounded-[2px] bg-white text-[14px] font-normal leading-none text-black outline-none max-lg:hidden"
          >
            Get Funded
          </Link>

          {/* Mobile menu button: only exists below lg */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 min-h-8 min-w-8 items-center justify-center p-0 text-white outline-none lg:hidden [-webkit-tap-highlight-color:transparent]"
          >
            <Image
              src={menuOpen ? "/images/nav/X.png" : "/images/nav/Manue.png"}
              alt=""
              aria-hidden
              width={32}
              height={32}
              unoptimized
              className="pointer-events-none h-8 w-8 object-contain"
            />
          </button>
        </div>
      </header>

      {/* Mobile menu panel: sits below the header (top-20), so logo and close button stay visible. */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-x-0 bottom-0 top-20 z-40 flex flex-col bg-nav/60 px-[14px] pb-[22px] pt-[18px] backdrop-blur-[18px] [-webkit-backdrop-filter:blur(18px)] lg:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-[10px] opacity-0"
        }`}
        style={{
          transition:
            "opacity .30s ease, transform .36s cubic-bezier(.22,.61,.36,1), visibility .30s ease",
        }}
      >
        <nav className="flex flex-col">
          {links.map((item) => {
            const isActive = getActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                tabIndex={menuOpen ? 0 : -1}
                onClick={(e) => handleMobileClick(e, item)}
                className={`flex items-center justify-between border-b border-white/10 py-5 text-[22px] leading-none outline-none ${
                  isActive ? "text-white" : "text-white/60"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="h-[2px] w-8"
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

        <Link
          href={siteConfig.links.getFunded}
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          className={`mt-8 flex h-[45px] w-full items-center justify-center rounded-[2px] bg-white text-[14px] font-normal leading-none text-black outline-none transition-all duration-500 ease-out ${
            menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: menuOpen ? `${80 + links.length * 50}ms` : "0ms" }}
        >
          Get Funded
        </Link>
      </div>
    </>
  );
}