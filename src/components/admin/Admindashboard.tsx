"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminSession, useThemeClass, AdminThemeStyles, ThemeToggle, AdminLogo, signOut, type AdminUser } from "./Adminauth";
import { AdminNavContext, AdminNavParamsContext, AdminRealtime, LiveDot, useAdminQuery, type NavParams } from "./adminData";
import { PAGES, navForUser } from "./pages";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationBell } from "./Notifications";
import { Card, Pill, StateMessage, ToastProvider } from "./ui";

const IDLE_LIMIT_MIN = 30; // signed out after this many minutes without any mouse or keyboard use
const IDLE_WARN_MIN = 25;

const KILL_LABELS: Record<string, string> = {
  pauseTrading: "Trading is paused",
  pausePurchases: "New purchases are paused",
  pausePayouts: "Payouts are paused",
  maintenanceMode: "Maintenance mode is on",
};

// Which environment this console talks to. A wrong-environment mistake is the most expensive one.
function EnvBadge() {
  const env = process.env.NEXT_PUBLIC_ADMIN_MOCK !== "false" ? "DEMO DATA" : (process.env.NEXT_PUBLIC_APP_ENV ?? "production").toUpperCase();
  const tone = env === "PRODUCTION" ? "bg-red-500/15 text-red-400" : "bg-gold/15 text-gold-light";
  return <span className={cn("px-2.5 py-1 text-[12px] tracking-wide", tone)}>{env}</span>;
}

// Keeps the signed-in person's access fresh and signs them out when they are removed.
// GET /admin/auth/me -> { user, killSwitches }. A 401 here is handled by useAdminQuery (it signs out).
function SessionSync({ onKillSwitches }: { onKillSwitches: (k: Record<string, boolean>) => void }) {
  const user = useAdminSession((s) => s.user);
  const setUser = useAdminSession((s) => s.setUser);
  const { data, refetch } = useAdminQuery<{ user: AdminUser; killSwitches: Record<string, boolean> }>("me", "/admin/auth/me");

  useEffect(() => {
    const t = setInterval(() => refetch(), 15_000);
    return () => clearInterval(t);
  }, [refetch]);

  useEffect(() => {
    if (!data) return;
    onKillSwitches(data.killSwitches ?? {});
    // The super admin changed this person's access: apply it without a new sign-in
    if (user && JSON.stringify(data.user) !== JSON.stringify(user)) setUser(data.user);
  }, [data, user, setUser, onKillSwitches]);

  return null;
}

// Signs out after a quiet period and warns a few minutes before
function useIdleSignOut() {
  const [warn, setWarn] = useState(false);
  useEffect(() => {
    let last = Date.now();
    const touch = () => { last = Date.now(); setWarn(false); };
    const events = ["mousemove", "keydown", "click", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const timer = setInterval(() => {
      const idleMin = (Date.now() - last) / 60_000;
      if (idleMin >= IDLE_LIMIT_MIN) signOut(`You were signed out after ${IDLE_LIMIT_MIN} minutes of inactivity.`);
      else setWarn(idleMin >= IDLE_WARN_MIN);
    }, 15_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      clearInterval(timer);
    };
  }, []);
  return warn;
}

/* ───────────────────────── Shell ───────────────────────── */

export function AdminDashboard() {
  const user = useAdminSession((s) => s.user);
  const themeClass = useThemeClass();
  const [active, setActive] = useState("overview");
  const [navParams, setNavParams] = useState<NavParams | null>(null);
  const [navNonce, setNavNonce] = useState(0);
  const [open, setOpen] = useState(false);
  const [kill, setKill] = useState<Record<string, boolean>>({});
  const idleWarn = useIdleSignOut();

  // Pages can be opened by key or by label; `params.q` pre-fills the list search
  const go = useCallback((target: string, params?: { q?: string }) => {
    const page = PAGES.find((p) => p.key === target || p.label === target);
    if (!page) return;
    setActive(page.key);
    setNavParams(params?.q ? { label: page.label, q: params.q } : null);
    setNavNonce((n) => n + 1);
  }, []);

  if (!user) return null;
  // The sidebar is built from the files in ./pages and filtered by what this person was granted
  const groups = navForUser(user);
  const allowedKeys = groups.flatMap((g) => g.items.map((i) => i.key));
  const pageKey = allowedKeys.includes(active) ? active : allowedKeys[0];
  const page = PAGES.find((p) => p.key === pageKey);
  const ActivePage = page?.component;
  const activeSwitches = Object.keys(kill).filter((k) => kill[k]);
  const roleLabel = user.role === "super_admin" ? "Super admin" : user.role === "admin" ? "Admin" : "Moderator";

  return (
    <AdminRealtime>
      <ToastProvider>
        <AdminNavContext.Provider value={go}>
          <AdminNavParamsContext.Provider value={navParams}>
            <SessionSync onKillSwitches={setKill} />
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
                          key={i.key}
                          onClick={() => { go(i.key); setOpen(false); }}
                          className={cn(
                            "block w-full px-3 py-2.5 text-left text-[15px] transition-colors",
                            pageKey === i.key ? "bg-gold/15 text-gold-light" : "text-white/55 hover:bg-white/[0.04] hover:text-white",
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
                {activeSwitches.length > 0 && (
                  <div role="alert" className="bg-red-500/15 px-6 py-2.5 text-center text-[14px] text-red-400">
                    Emergency switch is ON: {activeSwitches.map((k) => KILL_LABELS[k] ?? k).join(" · ")}
                  </div>
                )}
                {idleWarn && (
                  <div role="status" className="bg-gold/15 px-6 py-2.5 text-center text-[14px] text-gold-light">
                    You will be signed out soon because of inactivity. Move the mouse to stay signed in.
                  </div>
                )}
                <div className="mx-auto flex max-w-[1500px] flex-col gap-4 p-4 sm:p-6">
                  <header className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button className="mt-2 md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={24} /></button>
                      <div>
                        <h1 className="text-[30px]">{page?.label ?? "Admin"}</h1>
                        <p className="mt-1 text-[15px] text-white/40">Live data from the platform, updated in real time.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <GlobalSearch />
                      <EnvBadge />
                      <LiveDot />
                      <NotificationBell />
                      <ThemeToggle />
                      <div className="text-right text-[14px]">
                        <p className="mb-1 text-white/80">{user.name}</p>
                        <Pill tone={user.role === "moderator" ? "gray" : "gold"}>{roleLabel}</Pill>
                      </div>
                      <button onClick={() => signOut()} className="flex items-center gap-2 border-[0.7px] border-white/[0.13] px-4 py-2 text-[14px] hover:border-gold-accent">
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </header>

                  {ActivePage ? (
                    <ActivePage key={`${pageKey}-${navNonce}`} />
                  ) : (
                    <Card><StateMessage>No sections have been granted to you yet. Ask the super admin for access.</StateMessage></Card>
                  )}
                </div>
              </div>
            </div>
          </AdminNavParamsContext.Provider>
        </AdminNavContext.Provider>
      </ToastProvider>
    </AdminRealtime>
  );
}
