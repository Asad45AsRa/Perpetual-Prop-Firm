"use client";

import { Card, Table } from "../ui";
import { ResourcePage, type PageConfig } from "../ResourcePage";
import type { AdminRole } from "../Adminauth";
import { ADMIN, PERMISSIONS } from "../permissions";
import type { AdminPage } from "../types";

// Staff list from GET /admin/staff with invite / edit / delete.
// The rights table uses the same config that hides actions in the UI.
const config: PageConfig = {
  resource: "staff",
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status", format: "status" },
  ],
  primary: { kind: "create", label: "Invite Staff" },
  fields: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "role", label: "Role", type: "select", options: ["admin", "moderator"] },
    { key: "status", label: "Status", type: "select", options: ["active", "suspended"] },
  ],
};

function StaffPermissions() {
  const roles: AdminRole[] = ["admin", "moderator"];

  return (
    <>
      <ResourcePage config={config} />
      <Card title="Role rights">
        <Table
          heads={["Right", ...roles.map((r) => r[0].toUpperCase() + r.slice(1))]}
          rows={Object.values(PERMISSIONS).map((p) => [
            p.label,
            ...roles.map((r) => (p.roles.includes(r) ? <span key={r} className="text-success">Yes</span> : <span key={r} className="text-white/25">No</span>)),
          ])}
        />
      </Card>
    </>
  );
}

export const page: AdminPage = { label: "Staff & Permissions", group: "Platform control", roles: ADMIN, component: StaffPermissions };
