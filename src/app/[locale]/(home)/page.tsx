"use client";

import FeaturesSection from "@/app/[locale]/(home)/components/landing/FeaturesSection";
import HeroSection from "@/app/[locale]/(home)/components/landing/HeroSection";
import HowItWorksSection from "@/app/[locale]/(home)/components/landing/HowItWorksSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </main>
  );
}
