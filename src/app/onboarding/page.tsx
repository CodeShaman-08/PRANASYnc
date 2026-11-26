import type { Metadata } from "next";
import OnboardingFlow from "@/components/prana/OnboardingFlow";

export const metadata: Metadata = {
  title: "Prakriti Assessment — PranaSync",
  description: "Eight trait questions to build your Ayurvedic baseline constitution.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
