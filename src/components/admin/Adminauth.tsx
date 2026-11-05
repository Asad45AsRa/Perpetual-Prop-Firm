"use client";

import { useEffect, useState, type FormEvent } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TextField } from "@/components/auth/Field";
import { OtpInput } from "@/components/auth/OtpInput";
import { GoldButton } from "@/components/auth/GoldButton";

/* ───────────────────────── Types + session store ───────────────────────── */

export type AdminRole = "admin" | "moderator";
export type AdminUser = { id: string; name: string; email: string; role: AdminRole };

type SessionState = {
    user: AdminUser | null;
    setUser: (user: AdminUser) => void;
    logout: () => void;
};

// Mock phase mein sessionStorage. Production mein httpOnly cookie + /admin/auth/me use karein.
export const useAdminSession = create<SessionState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),
        }),
        { name: "admin-session", storage: createJSONStorage(() => sessionStorage) },
    ),
);

/* ───────────────────────── Theme (Light / Dark) ───────────────────────── */

export type AdminTheme = "dark" | "light";

type ThemeState = { theme: AdminTheme; toggle: () => void };

export const useAdminTheme = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: "dark",
            toggle: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
        }),
        { name: "admin-theme", storage: createJSONStorage(() => localStorage) },
    ),
);

// Root element par yeh class lagayein. `mounted` hydration mismatch se bachata hai.
export function useThemeClass() {
    const theme = useAdminTheme((s) => s.theme);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted && theme === "light" ? "adm-light" : "adm-dark";
}

// Light mode ke overrides. Dark mode default design hai, us mein koi change nahi.
// Sirf `.adm-light` ke andar colors badalte hain, baqi design same rehta hai.
const LIGHT_CSS = String.raw`
.adm-light{color-scheme:light}
.adm-light.bg-ink,.adm-light .bg-ink{background-color:#f3f4f8}
.adm-light.text-white,.adm-light .text-white{color:#15151b}
.adm-light .bg-surface{background-color:#ffffff}
.adm-light .text-white\/80{color:rgba(21,21,27,.85)}
.adm-light .text-white\/70{color:rgba(21,21,27,.75)}
.adm-light .text-white\/60{color:rgba(21,21,27,.65)}
.adm-light .text-white\/55{color:rgba(21,21,27,.65)}
.adm-light .text-white\/50{color:rgba(21,21,27,.6)}
.adm-light .text-white\/40{color:rgba(21,21,27,.55)}
.adm-light .text-white\/30{color:rgba(21,21,27,.45)}
.adm-light .text-white\/25{color:rgba(21,21,27,.35)}
.adm-light .border-white\/\[0\.06\]{border-color:rgba(21,21,27,.07)}
.adm-light .border-white\/\[0\.08\]{border-color:rgba(21,21,27,.10)}
.adm-light .border-white\/\[0\.1\]{border-color:rgba(21,21,27,.16)}
.adm-light .border-white\/\[0\.13\]{border-color:rgba(21,21,27,.18)}
.adm-light .bg-white\/\[0\.03\]{background-color:#ffffff;box-shadow:0 10px 40px rgba(21,21,27,.08)}
.adm-light .bg-white\/10{background-color:rgba(21,21,27,.08)}
.adm-light .hover\:bg-white\/\[0\.04\]:hover{background-color:rgba(21,21,27,.05)}
.adm-light .hover\:text-white:hover{color:#15151b}
.adm-light .text-gold-light{color:#7a5d22}
.adm-light .text-red-400{color:#dc2626}
.adm-light .adm-logo{filter:brightness(0)}
`;

export function AdminThemeStyles() {
    return <style dangerouslySetInnerHTML={{ __html: LIGHT_CSS }} />;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
    const toggle = useAdminTheme((s) => s.toggle);
    return (
        <button
            type="button"
            onClick={toggle}
            className={`border-[0.7px] border-white/[0.13] px-4 py-2 text-[14px] text-white/80 transition-colors hover:border-gold-accent hover:text-white ${className}`}
        >
            Light / Dark
        </button>
    );
}

export function AdminLogo({ className = "h-9" }: { className?: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.svg" alt="Perpeye" className={`adm-logo w-auto ${className}`} />
    );
}

/* ───────────────────────── API layer (mock ↔ real) ───────────────────────── */

// Backend ready ho to false kar dein. Real endpoints:
//   POST /admin/auth/login      { email, password }        -> { challengeId }
//   POST /admin/auth/verify-2fa { challengeId, code }      -> { user: AdminUser }
const USE_MOCK = true;
const MOCK_CODE = "123456";
const MOCK_USERS: (AdminUser & { password: string })[] = [
    { id: "u1", name: "Hafiz", email: "admin@perpeye.com", password: "Admin@123", role: "admin" },
    { id: "u2", name: "Sara (Moderator)", email: "mod@perpeye.com", password: "Mod@123", role: "moderator" },
];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function loginRequest(email: string, password: string): Promise<{ challengeId: string }> {
    if (USE_MOCK) {
        await wait(500);
        const u = MOCK_USERS.find((x) => x.email === email.toLowerCase() && x.password === password);
        if (!u) throw new Error("Email ya password galat hai.");
        return { challengeId: u.id };
    }
    const { api } = await import("@/lib/api"); // lazy: env sirf real mode mein parse hoga
    return api("/admin/auth/login", { method: "POST", body: { email, password } });
}

async function verifyRequest(challengeId: string, code: string): Promise<{ user: AdminUser }> {
    if (USE_MOCK) {
        await wait(500);
        const u = MOCK_USERS.find((x) => x.id === challengeId);
        if (!u || code !== MOCK_CODE) throw new Error("Code galat hai. Authenticator app dobara check karein.");
        const { password: _pw, ...user } = u; // eslint-disable-line @typescript-eslint/no-unused-vars
        return { user };
    }
    const { api } = await import("@/lib/api");
    return api("/admin/auth/verify-2fa", { method: "POST", body: { challengeId, code } });
}

/* ───────────────────────── UI ───────────────────────── */

const MAX_ATTEMPTS = 5;

export function AdminAuth() {
    const setUser = useAdminSession((s) => s.setUser);
    const themeClass = useThemeClass();
    const [step, setStep] = useState<"credentials" | "otp">("credentials");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [challengeId, setChallengeId] = useState("");
    const [code, setCode] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const backToLogin = (msg = "") => {
        setStep("credentials");
        setCode("");
        setAttempts(0);
        setPassword("");
        setError(msg);
    };

    const submitCredentials = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { challengeId } = await loginRequest(email.trim(), password);
            setChallengeId(challengeId);
            setStep("otp");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login nahi ho saka.");
        } finally {
            setLoading(false);
        }
    };

    const submitCode = async (e: FormEvent) => {
        e.preventDefault();
        if (code.length !== 6 || loading) return;
        setError("");
        setLoading(true);
        try {
            const { user } = await verifyRequest(challengeId, code);
            setUser(user); // page.tsx session dekh kar dashboard khol deta hai
        } catch (err) {
            const used = attempts + 1;
            setAttempts(used);
            setCode("");
            if (used >= MAX_ATTEMPTS) backToLogin("Bohat zyada ghalat codes. Dobara sign in karein.");
            else setError(err instanceof Error ? err.message : "Verify nahi ho saka.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={`${themeClass} relative flex min-h-screen items-center justify-center bg-ink px-4 text-white`}>
            <AdminThemeStyles />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_320px_at_50%_-5%,rgba(153,128,74,0.28),transparent)]"
            />
            <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
                <ThemeToggle />
            </div>

            <div className="relative w-full max-w-[480px] border-[0.7px] border-white/[0.13] bg-white/[0.03] p-9">
                <div className="mb-8 flex items-center gap-3">
                    <AdminLogo className="h-10" />
                    <span className="border-l border-white/[0.13] pl-3 text-[16px] text-white/60">Admin</span>
                </div>

                {step === "credentials" ? (
                    <form onSubmit={submitCredentials} noValidate className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-[30px] text-white">Sign in</h1>
                            <p className="mt-2 text-[15px] text-white/40"></p>
                        </div>
                        <TextField
                            id="admin-email"
                            label="Email"
                            type="email"
                            autoComplete="username"
                            placeholder="you@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            id="admin-password"
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p role="alert" className="text-[14px] text-red-400">{error}</p>}
                        <GoldButton type="submit" disabled={loading || !email || !password}>
                            {loading ? "Checking…" : "Continue"}
                        </GoldButton>
                        {USE_MOCK && (
                            <p className="text-center text-[13px] text-white/30">
                                Demo: admin@perpeye.com / Admin@123 · mod@perpeye.com / Mod@123
                            </p>
                        )}
                    </form>
                ) : (
                    <form onSubmit={submitCode} noValidate className="flex flex-col gap-6">
                        <div>
                            <h1 id="otp-title" className="text-[30px] text-white">Two-step verification</h1>
                            <p className="mt-2 text-[15px] text-white/40">
                                Authenticator app mein <span className="text-white/70">{email}</span> ka 6-digit code enter karein.
                            </p>
                        </div>
                        <OtpInput value={code} onChange={setCode} length={6} invalid={!!error} labelledBy="otp-title" />
                        {error && <p role="alert" className="text-[14px] text-red-400">{error}</p>}
                        <GoldButton type="submit" disabled={loading || code.length !== 6}>
                            {loading ? "Verifying…" : "Verify and open dashboard"}
                        </GoldButton>
                        <button type="button" onClick={() => backToLogin()} className="text-[14px] text-white/40 hover:text-white">
                            Different account se sign in karein
                        </button>
                        {USE_MOCK && <p className="text-center text-[13px] text-white/30">Demo code: {MOCK_CODE}</p>}
                    </form>
                )}
            </div>
        </main>
    );
}