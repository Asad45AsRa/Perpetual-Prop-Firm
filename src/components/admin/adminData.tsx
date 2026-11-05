"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, USE_MOCK } from "./adminApi";
import { useAdminSession } from "./Adminauth";

/* ───────────────────────── Realtime (WebSocket) ───────────────────────── */

export type RealtimeStatus = "connecting" | "live" | "offline";

const StatusContext = createContext<RealtimeStatus>("connecting");
export const useRealtimeStatus = () => useContext(StatusContext);

const MAX_RETRY_DELAY_MS = 30_000;
const FALLBACK_POLL_MS = 15_000;

// One WebSocket for the whole console (in demo mode a built-in simulator plays the server). The server sends a tiny message when data changes:
//   { "topic": "payouts" }  -> refetch queries of the "payouts" resource
//   { }  (no topic)         -> refetch everything
// The topic equals the endpoint segment (GET /admin/payouts -> "payouts").
// No data travels over the socket, so the REST API stays the only place that checks permissions.
export function AdminRealtime({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("connecting");

  useEffect(() => {
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let stopped = false;

    const refetch = (topic?: string) =>
      queryClient.invalidateQueries({
        predicate: (q) => {
          const [scope, resource] = q.queryKey as [string, string];
          if (scope !== "admin") return false;
          // The overview aggregates everything, so it refreshes on every event
          return !topic || resource === topic || resource === "overview";
        },
      });

    // Demo mode: no server, so listen to the mock backend instead of a WebSocket
    if (USE_MOCK) {
      setStatus("live");
      let stopSimulation = () => {};
      let unsubscribe = () => {};
      import("./mockApi").then((mock) => {
        if (stopped) return;
        unsubscribe = mock.subscribeMock(refetch);
        stopSimulation = mock.startMockSimulation();
      });
      return () => {
        stopped = true;
        unsubscribe();
        stopSimulation();
      };
    }

    const connect = () => {
      socket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/admin/ws`);
      socket.onopen = () => {
        attempts = 0;
        setStatus("live");
        refetch(); // catch up on anything missed while disconnected
      };
      socket.onmessage = (event) => {
        try {
          refetch((JSON.parse(String(event.data)) as { topic?: string }).topic);
        } catch {
          // Ignore messages that are not valid JSON
        }
      };
      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        if (stopped) return;
        setStatus("offline");
        // Exponential backoff: 1s, 2s, 4s ... up to 30s
        timer = setTimeout(connect, Math.min(MAX_RETRY_DELAY_MS, 1000 * 2 ** attempts++));
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [queryClient]);

  return <StatusContext.Provider value={status}>{children}</StatusContext.Provider>;
}

// Small header badge showing whether live updates are flowing
export function LiveDot() {
  const status = useRealtimeStatus();
  const label = status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Reconnecting";
  return (
    <span className="flex items-center gap-2 text-[13px] text-white/60" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${status === "live" ? "bg-success" : "animate-pulse bg-gold"}`} />
      {label}
    </span>
  );
}

/* ───────────────────────── Data hooks ───────────────────────── */

// Loads one admin resource. `resource` must match the realtime topic name.
export function useAdminQuery<T>(resource: string, path: string) {
  const status = useRealtimeStatus();
  const logout = useAdminSession((s) => s.logout);

  const query = useQuery({
    queryKey: ["admin", resource, path],
    queryFn: () => adminApi<T>(path),
    // While the socket is down, poll so the data never goes stale
    refetchInterval: status === "live" ? false : FALLBACK_POLL_MS,
    retry: (count, err) => (err as { status?: number }).status !== 401 && count < 2,
  });

  // An expired or invalid session signs the user out
  const unauthorized = (query.error as { status?: number } | null)?.status === 401;
  useEffect(() => {
    if (unauthorized) logout();
  }, [unauthorized, logout]);

  return query;
}

// Runs a POST action and refreshes the affected resources
export function useAdminAction(resources: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ path, body }: { path: string; body?: unknown }) => adminApi<unknown>(path, { method: "POST", body }),
    onSuccess: () => {
      [...resources, "overview"].forEach((r) => queryClient.invalidateQueries({ queryKey: ["admin", r] }));
    },
  });
}

// Runs any write request (POST / PATCH / DELETE) and refreshes every admin query,
// because one change (e.g. approving a payout) can affect the overview and the audit log too.
export function useAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ path, method = "POST", body }: { path: string; method?: "POST" | "PATCH" | "DELETE"; body?: unknown }) =>
      adminApi<unknown>(path, { method, body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin"] }),
  });
}

// Approve or reject one trader payout: POST /admin/payouts/:id/approve | reject
export function usePayoutAction() {
  const action = useAdminAction(["payouts"]);
  return {
    isPending: action.isPending,
    error: action.error as Error | null,
    run: (id: string, decision: "approve" | "reject") =>
      action.mutate({ path: `/admin/payouts/${encodeURIComponent(id)}/${decision}` }),
  };
}

/* ───────────────────────── In-console navigation ───────────────────────── */

// Lets a page open another sidebar page by its label (e.g. the "Accounts" button on Overview)
export const AdminNavContext = createContext<(label: string) => void>(() => {});
export const useAdminNavigate = () => useContext(AdminNavContext);
