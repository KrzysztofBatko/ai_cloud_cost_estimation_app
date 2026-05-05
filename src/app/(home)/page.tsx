"use client";

import FeaturesSection from "@/app/(home)/components/landing/FeaturesSection";
import HeroSection from "@/app/(home)/components/landing/HeroSection";
import HowItWorksSection from "@/app/(home)/components/landing/HowItWorksSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </main>
  );
}
