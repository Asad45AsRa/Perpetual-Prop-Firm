import type { ReactNode } from "react";
import { TraderShell } from "@/components/trader-dashboard/TraderShell";

// Own route group: no marketing navbar/footer.
export default function TraderDashboardLayout({ children }: { children: ReactNode }) {
  return <TraderShell>{children}</TraderShell>;
}
