"use client";

import { useEffect, useState, type FormEvent } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { TextField } from "@/components/auth/Field";
import { OtpInput } from "@/components/auth/OtpInput";
import { GoldButton } from "@/components/auth/GoldButton";
import { adminApi, MOCK_BLOCKED, USE_MOCK } from "./adminApi";
import type { AccessLevel } from "./permissions";

/* ───────────────────────── Types + session store ───────────────────────── */

export type AdminRole = "super_admin" | "admin" | "moderator";
export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    grants: Record<string, AccessLevel>; // section access, keyed by the page key
    rights: string[]; // special rights (see permissions.ts)
    protected?: boolean; // true only for the super admin
};

type SessionState = {
    user: AdminUser | null;
    notice: string; // message shown on the sign-in screen after a forced sign-out
    setUser: (user: AdminUser) => void;
    logout: (notice?: string) => void;
};

// Only the display profile is kept in sessionStorage. The real session is the httpOnly cookie
// set by the backend, and every API call is checked by the server (a 401 signs the user out).
export const useAdminSession = create<SessionState>()(
    persist(
        (set) => ({
            user: null,
            notice: "",
            setUser: (user) => set({ user, notice: "" }),
            logout: (notice = "") => set({ user: null, notice }),
        }),
        { name: "admin-session", storage: createJSONStorage(() => sessionStorage), partialize: (s) => ({ user: s.user }) },
    ),
);

// Ends the server session first, then clears the local profile
export async function signOut(notice = "") {
    try {
        await adminApi("/admin/auth/logout", { method: "POST" });
    } catch {
        // The local sign-out below must happen even when the server cannot be reached
    }
    useAdminSession.getState().logout(notice);
}

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

// Put this class on the root element. `mounted` avoids a hydration mismatch.
export function useThemeClass() {
    const theme = useAdminTheme((s) => s.theme);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return mounted && theme === "light" ? "adm-light" : "adm-dark";
}

// Light mode overrides. Dark is the default design and is left untouched.
// Only colors inside `.adm-light` change, the layout stays the same.
const LIGHT_CSS = String.raw`
.adm-dark{color-scheme:dark}
.adm-light{color-scheme:light}
.adm-dark select{color-scheme:dark}
.adm-dark select option,.adm-dark select optgroup{background-color:#1a1a1a;color:#ffffff}
.adm-light select option,.adm-light select optgroup{background-color:#ffffff;color:#15151b}
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
.adm-light .text-success{color:#16a34a}
.adm-light .bg-success\/15{background-color:rgba(22,163,74,.12)}
.adm-light .bg-red-500\/15{background-color:rgba(220,38,38,.10)}
.adm-light .bg-gold\/15{background-color:rgba(153,128,74,.16)}
.adm-light .bg-gold\/10{background-color:rgba(153,128,74,.12)}
.adm-light .text-gold-light{color:#7a5d22}
.adm-light .bg-white\/\[0\.06\]{background-color:rgba(21,21,27,.04)}
.adm-light .placeholder\:text-white\/30::placeholder{color:rgba(21,21,27,.35)}
.adm-light .border-white\/\[0\.13\]:focus,.adm-light .focus\:border-gold-accent:focus{border-color:#99804a}
.adm-light aside{box-shadow:1px 0 0 rgba(21,21,27,.06)}
.adm-light .text-ink{color:#15151b}
.adm-light .bg-black\/60{background-color:rgba(21,21,27,.35)}
.adm-light .bg-black\/40{background-color:rgba(21,21,27,.25)}
.adm-light .bg-white\/5{background-color:rgba(21,21,27,.05)}
.adm-light .bg-white\/\[0\.02\]{background-color:rgba(21,21,27,.03)}
.adm-light .border-white\/\[0\.04\]{border-color:rgba(21,21,27,.06)}
.adm-light .text-amber-400{color:#b45309}
.adm-light .bg-amber-500\/15{background-color:rgba(217,119,6,.12)}
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

/* ───────────────────────── API layer ───────────────────────── */

// Endpoints (served by ./mockApi in demo mode, by the real backend otherwise):
//   POST /admin/auth/login      { email, password }        -> { challengeId }
//   POST /admin/auth/verify-2fa { challengeId, code }      -> { user: AdminUser }  (sets the httpOnly cookie)
function loginRequest(email: string, password: string): Promise<{ challengeId: string }> {
    return adminApi("/admin/auth/login", { method: "POST", body: { email, password } });
}

function verifyRequest(challengeId: string, code: string): Promise<{ user: AdminUser }> {
    return adminApi("/admin/auth/verify-2fa", { method: "POST", body: { challengeId, code } });
}

/* ───────────────────────── UI ───────────────────────── */

const MAX_ATTEMPTS = 5;

export function AdminAuth() {
    const setUser = useAdminSession((s) => s.setUser);
    const notice = useAdminSession((s) => s.notice);
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
            setError(err instanceof Error ? err.message : "Could not sign in.");
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
            setUser(user); // page.tsx sees the session and opens the dashboard
        } catch (err) {
            const used = attempts + 1;
            setAttempts(used);
            setCode("");
            if (used >= MAX_ATTEMPTS) backToLogin("Too many wrong codes. Please sign in again.");
            else setError(err instanceof Error ? err.message : "Could not verify the code.");
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
                            {notice && <p role="status" className="mt-2 text-[15px] text-gold-light">{notice}</p>}
                        </div>
                        <TextField
                            id="admin-email"
                            label="Email"
                            type="email"
                            autoComplete="username"
                            placeholder="you@company.com"
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
                        {MOCK_BLOCKED && (
                            <p role="alert" className="text-[14px] text-red-400">
                                Demo data is switched on in a production build. Set NEXT_PUBLIC_ADMIN_MOCK=false and connect the backend.
                            </p>
                        )}
                        {error && <p role="alert" className="text-[14px] text-red-400">{error}</p>}
                        <GoldButton type="submit" disabled={loading || !email || !password || MOCK_BLOCKED}>
                            {loading ? "Checking…" : "Continue"}
                        </GoldButton>
                        {USE_MOCK && (
                            <p className="text-center text-[13px] text-white/30">
                                Demo super admin: admin@perpeye.com / Admin@123 · moderator: mod@perpeye.com / Mod@123
                            </p>
                        )}
                    </form>
                ) : (
                    <form onSubmit={submitCode} noValidate className="flex flex-col gap-6">
                        <div>
                            <h1 id="otp-title" className="text-[30px] text-white">Two-step verification</h1>
                            <p className="mt-2 text-[15px] text-white/40">
                                Enter the 6-digit code from your authenticator app for <span className="text-white/70">{email}</span>.
                            </p>
                        </div>
                        <OtpInput value={code} onChange={setCode} length={6} invalid={!!error} labelledBy="otp-title" />
                        {error && <p role="alert" className="text-[14px] text-red-400">{error}</p>}
                        <GoldButton type="submit" disabled={loading || code.length !== 6}>
                            {loading ? "Verifying…" : "Verify and open dashboard"}
                        </GoldButton>
                        <button type="button" onClick={() => backToLogin()} className="text-[14px] text-white/40 hover:text-white">
                            Sign in with a different account
                        </button>
                        {USE_MOCK && <p className="text-center text-[13px] text-white/30">Demo code: 123456</p>}
                    </form>
                )}
            </div>
        </main>
    );
}