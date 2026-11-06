// The ONLY place that decides where admin data comes from.
// Every admin request goes through `adminApi`, so connecting the real backend later
// needs no page changes:  set NEXT_PUBLIC_ADMIN_MOCK=false in .env.local.
//
// Mock mode (default): in-memory demo data from ./mockApi, nothing leaves the browser.
// Real mode: requests go to NEXT_PUBLIC_API_URL through the shared `api` helper.
export const USE_MOCK = process.env.NEXT_PUBLIC_ADMIN_MOCK !== "false";

// Safety net: a production build must never run on demo data by accident.
// A deliberate public demo can opt in with NEXT_PUBLIC_ALLOW_ADMIN_MOCK=true.
export const MOCK_BLOCKED =
  USE_MOCK && process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ALLOW_ADMIN_MOCK !== "true";

type Options = { method?: string; body?: unknown };

export async function adminApi<T>(path: string, options: Options = {}): Promise<T> {
  if (MOCK_BLOCKED) {
    throw new Error("The admin console is in demo mode on a production build. Set NEXT_PUBLIC_ADMIN_MOCK=false.");
  }
  if (USE_MOCK) {
    const { mockRequest } = await import("./mockApi");
    return mockRequest<T>(path, options);
  }
  // Lazy import: the env variables are only validated when the real backend is used
  const { api } = await import("@/lib/api");
  const method = (options.method ?? "GET").toUpperCase();
  // Every write carries a unique key, so a repeated request can never run twice on the server
  const headers: Record<string, string> = method === "GET" ? {} : { "Idempotency-Key": crypto.randomUUID() };
  return api<T>(path, { ...options, headers });
}
