import type { Metadata } from "next";
import { DemoView } from "@/components/trader-dashboard/challenges/DemoView";

export const metadata: Metadata = { title: "Demo Account" };

export default function TraderDemoPage() {
  return <DemoView />;
}
