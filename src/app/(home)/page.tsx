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
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 AI Cloud Cost Estimation. All rights reserved.
      </footer>
    </main>
  );
}
