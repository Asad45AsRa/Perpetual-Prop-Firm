import type { Metadata } from "next";
import { AccountView } from "@/components/trader-dashboard/account/AccountView";

export const metadata: Metadata = { title: "Account Dashboard" };

export default function TraderAccountsPage() {
  return <AccountView />;
}
