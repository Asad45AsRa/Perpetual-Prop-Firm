import { env } from "@/lib/env";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

// Error thrown for every failed backend call.
// It keeps the HTTP status (the admin console signs out on 401) and the request id,
// so an admin can quote the id and a developer can find the matching server log line.
export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

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
    throw new ApiError(
      error.message ?? `Request failed with status ${res.status}`,
      res.status,
      error.code,
      error.requestId ?? res.headers.get("x-request-id") ?? undefined,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
