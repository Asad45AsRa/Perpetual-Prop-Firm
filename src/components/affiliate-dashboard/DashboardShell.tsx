"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { DASH_ASSETS } from "./data";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Sidebar (256px, drawer below lg) + content column (36px / 38px gutters at 1440). */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-ink">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="relative min-w-0 flex-1 px-4 pb-[46px] pt-6 sm:px-6 lg:pl-[36px] lg:pr-[38px] lg:pt-[37px]">
        {/* Figma background: light ray in the top-left corner of the content area, behind the
            welcome header. Same base colour as the page, so it blends with no visible edge. */}
        <Image
          src={`${DASH_ASSETS}/bg-glow.png`}
          alt=""
          aria-hidden
          width={2880}
          height={1566}
          priority
          sizes="(min-width: 1024px) calc(100vw - 256px), 100vw"
          className="pointer-events-none absolute inset-x-0 top-0 h-auto w-full select-none"
        />
        <div className="relative mx-auto max-w-[1110px]">
          <Topbar onMenu={() => setMenuOpen(true)} />
          {children}
        </div>
      </div>
    </div>
  );
}
