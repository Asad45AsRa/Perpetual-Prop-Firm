"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

const links = [
  { label: "Challenges", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Rules", href: "/rules" },
  { label: "Affiliates", href: "/affiliates" },
  { label: "FAQ", href: "/faq" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    // Figma: fill #111111 @ 60%, bottom border 1px #FFFFFF @ 5%, background blur 37.49
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/5 bg-nav/60 backdrop-blur-nav">
      {/* Full width: logo left se 80px, button right se 80px (Figma ke mutabiq) */}
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

        {/* Nav links: page ke exact center mein */}
        <nav className="absolute left-1/2 top-0 flex h-full -translate-x-1/2 items-center gap-10">
          {links.map((item, i) => {
            const isActive =
              pathname === "/"
                ? i === 0
                : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex h-full items-center text-[14px] font-normal leading-none tracking-normal text-white/80 outline-none transition-opacity hover:opacity-80"
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
          className="flex h-[41px] w-[126px] items-center justify-center rounded-[2px] bg-white text-[14px] font-normal leading-none text-black outline-none"
        >
          Get Funded
        </Link>
      </div>
    </header>
  );
}