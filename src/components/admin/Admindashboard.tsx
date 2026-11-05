"use client";

import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminSession,
  useThemeClass,
  AdminThemeStyles,
  ThemeToggle,
  AdminLogo,
} from "./Adminauth";
import { AdminNavContext, AdminRealtime, LiveDot } from "./adminData";
import { PAGES, navForRole } from "./pages";
import { Card, Pill, StateMessage } from "./ui";

// Re-exported so existing imports of these from this file keep working
export { PERMISSIONS, can } from "./permissions";

/* ───────────────────────── Shell ───────────────────────── */

export function AdminDashboard() {
  const user = useAdminSession((s) => s.user);
  const logout = useAdminSession((s) => s.logout);
  const themeClass = useThemeClass();
  const [active, setActive] = useState("Overview");
  const [open, setOpen] = useState(false);

  if (!user) return null;
  // The sidebar is built from the files in ./pages and filtered by the signed-in role
  const groups = navForRole(user.role);
  const allowed = groups.some((g) => g.items.some((i) => i.label === active));
  const page = allowed ? active : "Overview";
  const ActivePage = PAGES.find((p) => p.label === page)?.component;

  return (
    <AdminRealtime>
    <AdminNavContext.Provider value={setActive}>
    <div className={cn(themeClass, "flex min-h-screen bg-ink text-white")}>
      <AdminThemeStyles />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[280px] overflow-y-auto border-r border-white/[0.08] bg-surface px-3 py-6 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-3">
          <AdminLogo className="h-9" />
          <span className="border-l border-white/[0.13] pl-3 text-[14px] text-white/60">Admin</span>
        </div>
        <nav className="mt-5">
          {groups.map((g) => (
            <div key={g.group} className="mt-6">
              <p className="px-3 pb-2 text-[13px] text-white/30">{g.group}</p>
              {g.items.map((i) => (
                <button
                  key={i.label}
                  onClick={() => { setActive(i.label); setOpen(false); }}
                  className={cn(
                    "block w-full px-3 py-2.5 text-left text-[15px] transition-colors",
                    page === i.label ? "bg-gold/15 text-gold-light" : "text-white/55 hover:bg-white/[0.04] hover:text-white",
                  )}
                >
                  {i.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}

      <div className="min-w-0 flex-1">
        <div className="bg-gold/10 px-4 py-2.5 text-center text-[14px] text-gold-light">
          Admin console: shows the same data as the Trader app. Actions here change what the trader sees.
        </div>
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 p-4 sm:p-6">
          <header className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button className="mt-2 md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={24} /></button>
              <div>
                <h1 className="text-[30px]">{page}</h1>
                <p className="mt-1 text-[15px] text-white/40">Live data from the platform, updated in real time.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LiveDot />
              <ThemeToggle />
              <div className="text-right text-[14px]">
                <p className="mb-1 text-white/80">{user.name}</p>
                <Pill tone={user.role === "admin" ? "gold" : "gray"}>{user.role === "admin" ? "Admin" : "Moderator"}</Pill>
              </div>
              <button onClick={logout} className="flex items-center gap-2 border-[0.7px] border-white/[0.13] px-4 py-2 text-[14px] hover:border-gold-accent">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </header>

          {ActivePage ? <ActivePage /> : <Card><StateMessage>This page is not available.</StateMessage></Card>}
        </div>
      </div>
    </div>
    </AdminNavContext.Provider>
    </AdminRealtime>
  );
}