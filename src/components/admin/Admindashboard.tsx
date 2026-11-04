"use client";

import { useState, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminSession, type AdminRole } from "./Adminauth";

/* ───────────────────────── Roles + rights ───────────────────────── */

const ALL: AdminRole[] = ["admin", "moderator"];
const ADMIN: AdminRole[] = ["admin"];

// Action-level rights. Naya right chahiye to yahan ek line add karein.
export const PERMISSIONS: Record<string, { label: string; roles: AdminRole[] }> = {
  "traders.view":    { label: "View traders & accounts",   roles: ALL },
  "traders.suspend": { label: "Suspend / unsuspend trader", roles: ALL },
  "risk.review":     { label: "Review risk breaches",       roles: ALL },
  "tickets.reply":   { label: "Reply to support tickets",   roles: ALL },
  "finance.view":    { label: "View revenue & payments",    roles: ADMIN },
  "payout.approve":  { label: "Approve / reject payouts",   roles: ADMIN },
  "staff.manage":    { label: "Manage staff & roles",       roles: ADMIN },
  "settings.edit":   { label: "Edit platform settings",     roles: ADMIN },
};

export const can = (role: AdminRole | undefined, perm: string) =>
  !!role && !!PERMISSIONS[perm]?.roles.includes(role);

// Page-level access: sidebar sirf wohi dikhata hai jo role ko allowed hai.
const NAV: { group: string; items: { label: string; roles: AdminRole[] }[] }[] = [
  { group: "Workspace", items: [
    { label: "Overview", roles: ALL },
    { label: "Operations Performance", roles: ADMIN },
  ]},
  { group: "Traders & trading", items: [
    { label: "Trader Management", roles: ALL },
    { label: "Trading Accounts", roles: ALL },
    { label: "Trading Activity", roles: ALL },
    { label: "Risk Management", roles: ALL },
    { label: "Market Management", roles: ADMIN },
    { label: "Account Issuance", roles: ADMIN },
  ]},
  { group: "Finance & sales", items: [
    { label: "Challenge Plans", roles: ADMIN },
    { label: "Payment Management", roles: ADMIN },
    { label: "Trader Payouts", roles: ADMIN },
    { label: "Affiliate Management", roles: ADMIN },
    { label: "Affiliate Payouts", roles: ADMIN },
    { label: "Coupons", roles: ADMIN },
    { label: "Payout Reserves", roles: ADMIN },
  ]},
  { group: "Communication", items: [
    { label: "Support Tickets", roles: ALL },
    { label: "Announcements", roles: ALL },
    { label: "Email Management", roles: ADMIN },
    { label: "Website CMS", roles: ADMIN },
    { label: "Competitions", roles: ALL },
  ]},
  { group: "Platform control", items: [
    { label: "System Health", roles: ADMIN },
    { label: "Audit Logs", roles: ADMIN },
    { label: "Staff & Permissions", roles: ADMIN },
    { label: "Platform Settings", roles: ADMIN },
  ]},
];

/* ───────────────────────── Small UI helpers ───────────────────────── */

const box = "border-[0.7px] border-white/[0.08] bg-surface";

function Card({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn(box, "p-5", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-[15px] text-white">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const tones = {
  gold: "bg-gold/15 text-gold-light",
  green: "bg-success/15 text-success",
  red: "bg-red-500/15 text-red-400",
  gray: "bg-white/10 text-white/60",
} as const;

function Pill({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return <span className={cn("px-2.5 py-0.5 text-[11px]", tones[tone])}>{children}</span>;
}

function Btn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="border-[0.7px] border-white/[0.13] px-3 py-1.5 text-[12px] text-white/80 transition-colors hover:border-gold-accent hover:text-white">
      {children}
    </button>
  );
}

function Table({ heads, rows }: { heads: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-white/[0.08] text-white/40">
            {heads.map((h) => <th key={h} className="px-2 py-2.5 font-normal">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/[0.06] last:border-0 text-white/80">
              {r.map((c, j) => <td key={j} className="px-2 py-3">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────────────────────── Pages ───────────────────────── */

const payoutTone = { Pending: "gold", Approved: "green", Paid: "green" } as const;

function Overview({ role }: { role: AdminRole }) {
  const finance = can(role, "finance.view");
  const stats = [
    { label: "Traders", value: "4", note: "Live and sample" },
    { label: "Active accounts", value: "3", note: "Challenge and funded" },
    ...(finance ? [{ label: "Pending payouts", value: "1", note: "Need review" }] : [{ label: "Open tickets", value: "2", note: "Waiting for reply" }]),
    ...(finance ? [{ label: "Challenge revenue", value: "$158", note: "From paid checkouts" }] : [{ label: "Risk breaches", value: "1", note: "Need review" }]),
  ];
  const attention: [string, number, boolean][] = [
    ["Payouts to review", 1, can(role, "payout.approve")],
    ["Open tickets", 2, can(role, "tickets.reply")],
    ["Risk breaches", 1, can(role, "risk.review")],
    ["Pending affiliate payouts", 1, finance],
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-[12px] text-white/40">{s.label}</p>
            <p className="my-1.5 text-[30px] leading-none text-white">{s.value}</p>
            <p className="text-[12px] text-white/40">{s.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card title="Live trader" action={<div className="flex gap-2"><Btn>Accounts</Btn>{finance && <Btn>Payouts</Btn>}</div>}>
          <div className="flex flex-col items-center gap-3 border border-dashed border-white/[0.1] px-6 py-8 text-center text-[13px] text-white/40">
            No live trader yet. Log in and buy a challenge in the Trader app, then come back here.
            <Btn>Open Trader app</Btn>
          </div>
        </Card>
        <Card title="Needs attention">
          <ul>
            {attention.filter(([, , show]) => show).map(([label, n]) => (
              <li key={label} className="flex justify-between border-b border-white/[0.06] py-3 text-[13px] text-white/50 last:border-0">
                {label}<b className="font-normal text-white">{n}</b>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {finance ? (
          <Card title="Recent payout requests" action={<Btn>View all</Btn>}>
            <Table
              heads={["ID", "Trader", "Amount", "Status", ""]}
              rows={[
                ["PO-501", "Sarah Miller", "$1,080", <Pill key="a" tone={payoutTone.Pending}>Pending</Pill>,
                  can(role, "payout.approve") ? <Btn key="b">Approve</Btn> : null],
                ["PO-502", "Daniel Lee", "$552", <Pill key="a" tone={payoutTone.Approved}>Approved</Pill>, null],
                ["PO-503", "Ahmed Raza", "$432", <Pill key="a" tone={payoutTone.Paid}>Paid</Pill>, null],
              ]}
            />
          </Card>
        ) : (
          <Card title="Recent support tickets" action={<Btn>View all</Btn>}>
            <Table
              heads={["ID", "Trader", "Subject", "Status"]}
              rows={[
                ["TK-210", "Sarah Miller", "Cannot see account", <Pill key="a" tone="gold">Open</Pill>],
                ["TK-211", "Ahmed Raza", "Rule question", <Pill key="a" tone="gold">Open</Pill>],
                ["TK-207", "Daniel Lee", "Login issue", <Pill key="a" tone="green">Solved</Pill>],
              ]}
            />
          </Card>
        )}
        <Card title="Recent trading activity" action={<Btn>View all</Btn>}>
          <Table
            heads={["Trader", "Market", "Side", "P&L"]}
            rows={[
              ["Ahmed Raza", "BTC-PERP", <Pill key="a" tone="green">Long</Pill>, <span key="p" className="text-success">+$84</span>],
              ["Sarah Miller", "ETH-PERP", <Pill key="a" tone="red">Short</Pill>, <span key="p" className="text-success">+$135</span>],
              ["Daniel Lee", "SOL-PERP", <Pill key="a" tone="green">Long</Pill>, <span key="p" className="text-red-400">-$38</span>],
            ]}
          />
        </Card>
      </div>
    </>
  );
}

function StaffPermissions() {
  const roles: AdminRole[] = ["admin", "moderator"];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Staff">
        <Table
          heads={["Name", "Email", "Role"]}
          rows={[
            ["Hafiz Hassan", "admin@perpeye.com", <Pill key="r" tone="gold">Admin</Pill>],
            ["Sara", "mod@perpeye.com", <Pill key="r" tone="gray">Moderator</Pill>],
          ]}
        />
        <p className="mt-3 text-[12px] text-white/30">Role assign/change backend API se hoga (/admin/staff).</p>
      </Card>
      <Card title="Role rights">
        <Table
          heads={["Right", ...roles.map((r) => r[0].toUpperCase() + r.slice(1))]}
          rows={Object.values(PERMISSIONS).map((p) => [
            p.label,
            ...roles.map((r) => (p.roles.includes(r) ? <span key={r} className="text-success">Yes</span> : <span key={r} className="text-white/25">No</span>)),
          ])}
        />
      </Card>
    </div>
  );
}

/* ───────────────────────── Shell ───────────────────────── */

export function AdminDashboard() {
  const user = useAdminSession((s) => s.user);
  const logout = useAdminSession((s) => s.logout);
  const [active, setActive] = useState("Overview");
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const groups = NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(user.role)) })).filter((g) => g.items.length);
  const allowed = groups.some((g) => g.items.some((i) => i.label === active));
  const page = allowed ? active : "Overview";

  return (
    <div className="flex min-h-screen bg-ink text-white">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[250px] overflow-y-auto border-r border-white/[0.08] bg-surface px-3 py-5 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-3 text-[17px] font-medium">Perpeye Admin</div>
        <nav className="mt-4">
          {groups.map((g) => (
            <div key={g.group} className="mt-5">
              <p className="px-3 pb-1.5 text-[11px] text-white/30">{g.group}</p>
              {g.items.map((i) => (
                <button
                  key={i.label}
                  onClick={() => { setActive(i.label); setOpen(false); }}
                  className={cn(
                    "block w-full px-3 py-2 text-left text-[13px] transition-colors",
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
        <div className="bg-gold/10 px-4 py-2 text-center text-[12px] text-gold-light">
          Admin console: shows the same data as the Trader app. Actions here change what the trader sees.
        </div>
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 p-4 sm:p-6">
          <header className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button className="mt-1 md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
              <div>
                <h1 className="text-[24px]">{page}</h1>
                <p className="mt-1 text-[13px] text-white/40">Live data from the Trader app together with sample platform data.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-[12px]">
                <p className="text-white/80">{user.name}</p>
                <Pill tone={user.role === "admin" ? "gold" : "gray"}>{user.role === "admin" ? "Admin" : "Moderator"}</Pill>
              </div>
              <button onClick={logout} className="flex items-center gap-1.5 border-[0.7px] border-white/[0.13] px-3 py-2 text-[12px] hover:border-gold-accent">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </header>

          {page === "Overview" && <Overview role={user.role} />}
          {page === "Staff & Permissions" && can(user.role, "staff.manage") && <StaffPermissions />}
          {page !== "Overview" && page !== "Staff & Permissions" && (
            <Card title={page}><p className="text-[13px] text-white/40">Yeh page abhi banna hai.</p></Card>
          )}
        </div>
      </div>
    </div>
  );
}