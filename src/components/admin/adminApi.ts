// The ONLY place that decides where admin data comes from.
// Every admin request goes through `adminApi`, so connecting the real backend later
// needs no page changes:  set NEXT_PUBLIC_ADMIN_MOCK=false in .env.local.
//
// Mock mode (default): in-memory demo data from ./mockApi, nothing leaves the browser.
// Real mode: requests go to NEXT_PUBLIC_API_URL through the shared `api` helper.
export const USE_MOCK = process.env.NEXT_PUBLIC_ADMIN_MOCK !== "false";

type Options = { method?: string; body?: unknown };

export async function adminApi<T>(path: string, options: Options = {}): Promise<T> {
  if (USE_MOCK) {
    const { mockRequest } = await import("./mockApi");
    return mockRequest<T>(path, options);
  }
  // Lazy import: the env variables are only validated when the real backend is used
  const { api } = await import("@/lib/api");
  return api<T>(path, options);
}
