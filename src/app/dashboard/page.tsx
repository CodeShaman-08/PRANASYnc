import type { Metadata } from "next";
import DashboardView from "@/components/prana/DashboardView";

export const metadata: Metadata = {
  title: "Command Dashboard — PranaSync",
  description: "Live Vikriti, harmony index, bio-environment simulator and Ayurvedic protocol deck.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
