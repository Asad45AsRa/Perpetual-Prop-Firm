import { env } from "@/lib/env";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

// Small wrapper around fetch for talking to the backend API
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...rest,
    credentials: "include", // send auth cookies to the backend
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
