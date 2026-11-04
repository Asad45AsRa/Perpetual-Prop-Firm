"use client";

import { useState, type FormEvent } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ShieldCheck } from "lucide-react";
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

/* ───────────────────────── API layer (mock ↔ real) ───────────────────────── */

// Backend ready ho to false kar dein. Real endpoints:
//   POST /admin/auth/login      { email, password }        -> { challengeId }
//   POST /admin/auth/verify-2fa { challengeId, code }      -> { user: AdminUser }
const USE_MOCK = true;
const MOCK_CODE = "123456";
const MOCK_USERS: (AdminUser & { password: string })[] = [
  { id: "u1", name: "Asad", email: "admin@perpeye.com", password: "Admin@123", role: "admin" },
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
    <main className="relative flex min-h-screen items-center justify-center bg-ink px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_320px_at_50%_-5%,rgba(153,128,74,0.28),transparent)]"
      />
      <div className="relative w-full max-w-[420px] border-[0.7px] border-white/[0.13] bg-white/[0.03] p-8">
        <div className="mb-6 flex items-center gap-2.5 text-[17px] font-medium text-white">
          <span className="grid h-8 w-8 place-items-center bg-[linear-gradient(90deg,#FFFFFF_6.863%,#99804A_88.235%)] text-ink">
            <ShieldCheck size={18} />
          </span>
          Perpeye Admin
        </div>

        {step === "credentials" ? (
          <form onSubmit={submitCredentials} noValidate className="flex flex-col gap-5">
            <div>
              <h1 className="text-[24px] text-white">Sign in</h1>
              <p className="mt-1.5 text-[13px] text-white/40">Sirf admin aur moderator accounts ke liye.</p>
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
            {error && <p role="alert" className="text-[12px] text-red-400">{error}</p>}
            <GoldButton type="submit" disabled={loading || !email || !password}>
              {loading ? "Checking…" : "Continue"}
            </GoldButton>
            {USE_MOCK && (
              <p className="text-center text-[11px] text-white/30">
                Demo: admin@perpeye.com / Admin@123 · mod@perpeye.com / Mod@123
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={submitCode} noValidate className="flex flex-col gap-5">
            <div>
              <h1 id="otp-title" className="text-[24px] text-white">Two-step verification</h1>
              <p className="mt-1.5 text-[13px] text-white/40">
                Authenticator app mein <span className="text-white/70">{email}</span> ka 6-digit code enter karein.
              </p>
            </div>
            <OtpInput value={code} onChange={setCode} length={6} invalid={!!error} labelledBy="otp-title" />
            {error && <p role="alert" className="text-[12px] text-red-400">{error}</p>}
            <GoldButton type="submit" disabled={loading || code.length !== 6}>
              {loading ? "Verifying…" : "Verify and open dashboard"}
            </GoldButton>
            <button type="button" onClick={() => backToLogin()} className="text-[12px] text-white/40 hover:text-white">
              Different account se sign in karein
            </button>
            {USE_MOCK && <p className="text-center text-[11px] text-white/30">Demo code: {MOCK_CODE}</p>}
          </form>
        )}
      </div>
    </main>
  );
}