import type { ReactNode } from "react";
import { DashboardShell } from "@/components/affiliate-dashboard/DashboardShell";

// Own route group: no marketing navbar/footer.
export default function AffiliateDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
