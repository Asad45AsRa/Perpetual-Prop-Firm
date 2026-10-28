import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Challenges", href: "/challenges" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Rulebook", href: "/rules" },
    ],
  },
  {
    title: "Insights",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Affiliates", href: "/affiliates" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Term Of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const SOCIALS = [
  { label: "Discord", href: "#", Icon: FaDiscord }, // TODO: Discord invite link
  { label: "X", href: "#", Icon: FaXTwitter }, // TODO: X profile link
];

/*
  Figma frame = 1440px, base text = 14px.
  All sizes are in `em` and the footer's font-size scales up with the
  viewport above 1440px (same as the Hero / Rules pages).
  Background is transparent so the page background shows through.
*/
export function Footer() {
  return (
    <footer
      className="w-full border-t border-white/10 bg-transparent px-6 lg:px-20"
      style={{ fontSize: "clamp(14px, calc(100vw * 14 / 1440), 24px)" }}
    >
      <div className="flex flex-col gap-12 pt-[4.8em] lg:flex-row lg:items-start lg:gap-0">
        {/* Brand */}
        <div className="flex flex-col items-start lg:w-[30em]">
          <Image
            src="/images/nav/nav.png"
            alt="Perpeye"
            width={116}
            height={29}
            className="h-[2.07em] w-auto"
          />

          <p className="mt-[1.43em] text-[0.929em] font-normal leading-[1.43] text-white/40">
            The Next Generation Trading Platform.
            <br /> Built For Ambitious Traders With Transparency,
            <br /> Security, And Long-Term Growth In Mind.
          </p>

          <div className="mt-[1.43em] flex items-center gap-[1em]">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="flex h-[2.714em] w-[2.714em] items-center justify-center bg-white/10 text-white/60 transition-colors hover:text-white"
              >
                <Icon className="h-[1.2em] w-[1.2em]" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:flex lg:gap-[8em]">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-[1.714em]">
              <span className="text-[0.857em] font-normal leading-none text-white/30">
                {col.title}
              </span>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="whitespace-nowrap text-[1em] font-normal leading-none text-white/80 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Built on Hyperliquid (swap for the real logo asset if you have one) */}
        <div className="flex items-center gap-[0.6em] lg:ml-auto lg:self-end">
          <span className="text-[0.786em] font-normal leading-none text-white/40">
            Built on
          </span>
          <span className="text-[1.1em] font-normal leading-none tracking-[-0.02em] text-white">
            Hyper<em className="font-serif italic">liquid</em>
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-[4.57em] border-t border-white/10 pb-[1.5em] pt-[1.57em]">
        <p className="text-[0.857em] font-normal leading-none text-white/30">
          © 2026 Perpeye · Perpetual Trading
        </p>
      </div>
    </footer>
  );
}