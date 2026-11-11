"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Sidebar (256px, drawer below lg) + content column (36px / 38px gutters at 1440). */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-ink">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="relative min-w-0 flex-1 px-4 pb-[46px] pt-6 sm:px-6 lg:pl-[36px] lg:pr-[38px] lg:pt-[37px]">
        {/* Fixed to the viewport (right of the sidebar on lg) so it stays put while the panels scroll over it. */}
        <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 right-0 overflow-hidden lg:left-[256px]">
          {/* Same CSS glow as the trader dashboard: from the content's left edge, fading out above the first cards. */}
          <div className="h-[260px] w-full bg-[radial-gradient(ellipse_48%_100%_at_6%_0%,rgba(255,247,228,0.24)_0%,rgba(255,247,228,0.11)_40%,rgba(255,247,228,0)_100%)]" />
        </div>
        <div className="relative mx-auto max-w-[1110px]">
          <Topbar onMenu={() => setMenuOpen(true)} />
          {children}
        </div>
      </div>
    </div>
  );
}
