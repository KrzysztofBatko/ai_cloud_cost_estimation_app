"use client";
import AuthGuard from "../AuthGuard";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  RefreshCw,
  RotateCcw,
  Send,
  Printer,
  Mail,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Usage from "@/app/estimation/components/Usage";
import Results from "@/app/estimation/components/Result";
import Providers, { Provider } from "@/app/estimation/components/Providers";
import { useStatistics } from "@/app/estimation/hooks/useStatistics";
import { useSendToAI } from "@/app/estimation/hooks/useSendToAi";
import { ProviderKey } from "@/types/api";
import Link from "next/link";
import { SessionDescription } from "@/app/estimation/components/SessionDescription";

export default function EstimationPage() {
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
  const [providerRegions, setProviderRegions] = useState<
    Record<string, string>
  >({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const { saveStatistics } = useStatistics();
  const { sendToAI, loading, results, setResults } = useSendToAI();

  const sessionDescription = sessionStorage.getItem("descriptionInput");

  useEffect(() => {
    const storedPrefill = sessionStorage.getItem("descriptionPrefill");

    if (!storedPrefill) {
      return;
    }

    try {
      const prefill = JSON.parse(storedPrefill) as {
        usage?: Record<string, string>;
        notes?: string;
        sourceSummary?: string;
      };

      if (prefill.usage && typeof prefill.usage === "object") {
        setAnswers(prefill.usage);
      }

      const prefilledNotes = [prefill.notes, prefill.sourceSummary]
        .filter((value): value is string => Boolean(value?.trim()))
        .join("\n\n");

      if (prefilledNotes) {
        setNotes(prefilledNotes);
      }
    } catch (error) {
      console.error("Failed to load description prefill", error);
    } finally {
      sessionStorage.removeItem("descriptionPrefill");
    }
  }, []);

  const toggleProvider = (provider: Provider) => {
    setSelectedProviders((prev) => {
      const isSelected = prev.some((p) => p.id === provider.id);

      setProviderRegions((current) => {
        if (isSelected) {
          const next = { ...current };
          if (provider.providerKey) {
            delete next[provider.providerKey];
          }
          return next;
        }

        if (!provider.providerKey) {
          return current;
        }

        return {
          ...current,
          [provider.providerKey]:
            current[provider.providerKey] ?? provider.defaultRegion,
        };
      });

      return isSelected
        ? prev.filter((p) => p.id !== provider.id)
        : [...prev, provider];
    });
  };

  const handleProviderRegionChange = (
    providerKey: ProviderKey,
    region: string,
  ) => {
    setProviderRegions((prev) => ({ ...prev, [providerKey]: region }));
  };

  const handleEstimation = async () => {
    await Promise.allSettled([
      sendToAI(
        selectedProviders.map((p) => p.name),
        answers,
        notes,
        providerRegions,
      ),
      saveStatistics(selectedProviders),
    ]);
  };

  const restart = () => {
    setSelectedProviders([]);
    setProviderRegions({});
    setAnswers({});
    setNotes("");
    setResults(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!results) return;

    const lines: string[] = [];

    lines.push("Cloud cost estimate");
    lines.push(`Pricing snapshot: ${results.pricingAsOf}`);
    lines.push(`Calculated at: ${results.calculatedAt}`);
    lines.push("--------------------------------------------------");

    results.estimates.forEach((est) => {
      lines.push(`${est.provider} (${est.confidence.toUpperCase()})`);
      if (est.regionLabel || est.region) {
        lines.push(`  Region:  ${est.regionLabel ?? est.region}`);
      }
      lines.push(`  Monthly: ${est.monthlyTotal} ${est.currency}`);
      lines.push(`  Daily:   ${est.dailyTotal} ${est.currency}`);

      if (est.assumptions.length) {
        lines.push("  Assumptions:");
        est.assumptions.forEach((a) => lines.push(`    • ${a}`));
      }

      if (est.breakdown.length) {
        lines.push("  Breakdown:");
        est.breakdown.forEach((b) =>
          lines.push(
            `    • ${b.item}: ${b.monthly} ${est.currency} (${b.notes})`,
          ),
        );
      }

      if (est.pricingLinks.length) {
        lines.push("  Pricing links:");
        est.pricingLinks.forEach((link) => lines.push(`    • ${link}`));
      }

      lines.push("--------------------------------------------------");
    });

    if (notes) {
      lines.push("Notes:");
      lines.push(notes);
      lines.push("--------------------------------------------------");
    }

    lines.push("Generated by Cloud Cost Estimation");

    // Use CRLF to improve rendering in Outlook
    const body = encodeURIComponent(lines.join("\r\n"));
    window.location.href = `mailto:?subject=Cloud cost estimate&body=${body}`;
  };

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <h1>Cloud Cost Estimation</h1>
        <h3>Powered by AI for accurate cloud cost predictions</h3>

        {sessionDescription && (
          <SessionDescription sessionDescription={sessionDescription} />
        )}

        <div className="mt-5 space-y-4">
          {/* Section 1 - Providers */}
          <Providers
            selectedProviders={selectedProviders}
            selectedRegions={providerRegions}
            onToggleProvider={toggleProvider}
            onRegionChange={handleProviderRegionChange}
          />

          {/* Section 2 - Usage */}
          <Usage answers={answers} setAnswers={setAnswers} />

          {/* Section 3 - Notes */}
          <Card className="shadow-card gap-2">
            <CardHeader>
              <CardTitle>3. Custom Infrastructure Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add additional infrastructure details not covered above..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Section 4 - Submit */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => handleEstimation()}
              disabled={loading || selectedProviders.length === 0}
              className="px-8 py-6 text-base font-semibold rounded-xl"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              Get Estimates
            </Button>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {selectedProviders.map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          )}

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Section 5 - Results */}
                <div className="print-area">
                  <Results results={results} />
                </div>

                {/* Section 6 - Actions */}
                <div className="mt-6 flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    disabled={!results}
                  >
                    <Printer className="mr-2 h-4 w-4" /> Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEmail}
                    disabled={!results}
                  >
                    <Mail className="mr-2 h-4 w-4" /> Email me
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEstimation()}
                    disabled={loading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                  </Button>
                  <Button variant="outline" onClick={restart}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                  </Button>
                </div>

                {/* CTA Section */}
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Need a detailed quote or consultation?
                  </p>
                  <Button size="lg" className="px-6 py-3">
                    Contact Us for Custom Quote
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t bg-muted/50 py-8">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            © 2026 Cloud Cost Estimation. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>
            <a
              href="mailto:support@cloudcost.com"
              className="text-primary hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </AuthGuard>
  );
}
