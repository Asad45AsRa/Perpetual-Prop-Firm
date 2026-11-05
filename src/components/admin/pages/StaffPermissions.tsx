"use client";

import { Card, Pill, StateMessage, Table } from "../ui";
import { useAdminQuery } from "../adminData";
import type { AdminRole } from "../Adminauth";
import { ADMIN, PERMISSIONS } from "../permissions";
import type { AdminPage, ListResponse, StaffMember } from "../types";

// Staff list comes from GET /admin/staff. The rights table uses the same config that hides actions in the UI.
function StaffPermissions() {
  const roles: AdminRole[] = ["admin", "moderator"];
  const { data, isPending, error, refetch } = useAdminQuery<ListResponse<StaffMember>>("staff", "/admin/staff");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Staff">
        {isPending ? (
          <StateMessage>Loading…</StateMessage>
        ) : error ? (
          <StateMessage error onRetry={() => refetch()}>{error.message}</StateMessage>
        ) : data.items.length === 0 ? (
          <StateMessage>No staff accounts yet.</StateMessage>
        ) : (
          <Table
            heads={["Name", "Email", "Role"]}
            rows={data.items.map((m) => [
              m.name,
              m.email,
              <Pill key="r" tone={m.role === "admin" ? "gold" : "gray"}>{m.role === "admin" ? "Admin" : "Moderator"}</Pill>,
            ])}
          />
        )}
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

export const page: AdminPage = { label: "Staff & Permissions", group: "Platform control", roles: ADMIN, component: StaffPermissions };
