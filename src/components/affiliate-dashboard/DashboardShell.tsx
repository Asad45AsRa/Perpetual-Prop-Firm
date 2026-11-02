"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Sidebar (256px, drawer below lg) + content column (36px / 38px gutters at 1440). */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-ink">
      {/* Soft gold light behind the header (approximation of the Figma ray group). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_640px_300px_at_32%_-60px,rgba(255,255,255,0.10),rgba(153,128,74,0.06)_45%,transparent_75%)]"
      />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="relative min-w-0 flex-1 px-4 pb-[46px] pt-6 sm:px-6 lg:pl-[36px] lg:pr-[38px] lg:pt-[37px]">
        <div className="mx-auto max-w-[1110px]">
          <Topbar onMenu={() => setMenuOpen(true)} />
          {children}
        </div>
      </div>
    </div>
  );
}
