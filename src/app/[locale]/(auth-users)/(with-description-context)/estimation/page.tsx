"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Printer,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/PageContainer";
import { useStatistics } from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/hooks/useStatistics";
import { useSendToAI } from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/hooks/useSendToAi";
import { useDescriptionContext } from "@/app/[locale]/(auth-users)/(with-description-context)/DescriptionProvider";
import { SessionDescription } from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/components/SessionDescription";
import Providers from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/components/Providers";
import Currency from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/components/Currency";
import Usage from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/components/Usage";
import Results from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/components/Result";
import EstimateComparison, {
  ComparisonInputs,
  SavedComparison,
} from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/components/EstimateComparison";
import { Provider } from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/hooks/useActiveProviders";
import { ProviderKey } from "@/types/api";
import { createEmailContent } from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/utils/emailConentHelpers";
import {
  DEFAULT_ESTIMATION_CURRENCY,
  type EstimationCurrency,
} from "@/lib/estimation/currencies";

export default function EstimationPage() {
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
  const [currency, setCurrency] = useState<EstimationCurrency>(
    DEFAULT_ESTIMATION_CURRENCY,
  );
  const [providerRegions, setProviderRegions] = useState<
    Record<string, string>
  >({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [resultInputs, setResultInputs] = useState<ComparisonInputs | null>(
    null,
  );
  const [savedComparison, setSavedComparison] =
    useState<SavedComparison | null>(null);

  const { saveStatistics } = useStatistics();
  const { sendToAI, loading, results, setResults } = useSendToAI();
  const { descriptionInput, descriptionPrefill, setDescriptionPrefill } =
    useDescriptionContext();

  useEffect(() => {
    if (!descriptionPrefill) {
      return;
    }

    try {
      if (
        descriptionPrefill.usage &&
        typeof descriptionPrefill.usage === "object"
      ) {
        setAnswers(descriptionPrefill.usage);
      }

      const prefilledNotes = [
        descriptionPrefill.notes,
        descriptionPrefill.sourceSummary,
      ]
        .filter((value): value is string => Boolean(value?.trim()))
        .join("\n\n");

      if (prefilledNotes) {
        setNotes(prefilledNotes);
      }
    } catch (error) {
      console.error("Failed to load description prefill", error);
    } finally {
      setDescriptionPrefill(null);
    }
  }, [descriptionPrefill, setDescriptionPrefill]);

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

  const createComparisonInputs = (): ComparisonInputs => ({
    providers: selectedProviders.map((p) => p.name),
    currency,
    usage: { ...answers },
    notes,
    providerRegions: { ...providerRegions },
  });

  const handleEstimation = async () => {
    const inputSnapshot = createComparisonInputs();
    setResultInputs(inputSnapshot);

    await Promise.allSettled([
      sendToAI(
        inputSnapshot.providers,
        inputSnapshot.usage,
        inputSnapshot.notes,
        inputSnapshot.providerRegions,
        inputSnapshot.currency,
      ),
      saveStatistics(selectedProviders),
    ]);
  };

  const restart = () => {
    setSelectedProviders([]);
    setCurrency(DEFAULT_ESTIMATION_CURRENCY);
    setProviderRegions({});
    setAnswers({});
    setNotes("");
    setResults(null);
    setResultInputs(null);
    setSavedComparison(null);
  };

  const saveCurrentForComparison = () => {
    if (!results) return;

    setSavedComparison({
      savedAt: new Date().toISOString(),
      results,
      inputs: resultInputs ?? createComparisonInputs(),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!results) return;

    const emailContent = createEmailContent(results, notes);
    // Use CRLF to improve rendering in Outlook
    const body = encodeURIComponent(emailContent);
    window.location.href = `mailto:?subject=Cloud cost estimate&body=${body}`;
  };

  return (
    <PageContainer
      pageTitle="Cloud Cost Estimation"
      pageDescription="Powered by AI for accurate cloud cost predictions"
    >
      {descriptionInput && (
        <div className="print-hidden">
          <SessionDescription sessionDescription={descriptionInput} />
        </div>
      )}

      <div className="mt-5 space-y-4">
        {/* Section 1 - Providers */}
        <div className="print-hidden">
          <Providers
            selectedProviders={selectedProviders}
            selectedRegions={providerRegions}
            onToggleProvider={toggleProvider}
            onRegionChange={handleProviderRegionChange}
          />
        </div>

        {/* Section 2 - Currency */}
        <div className="print-hidden">
          <Currency currency={currency} onCurrencyChange={setCurrency} />
        </div>

        {/* Section 3 - Usage */}
        <div className="print-hidden">
          <Usage answers={answers} setAnswers={setAnswers} />
        </div>

        {/* Section 4 - Notes */}
        <Card className="print-hidden shadow-card gap-2">
          <CardHeader>
            <CardTitle>4. Custom Infrastructure Notes</CardTitle>
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

        {/* Section 5 - Submit */}
        <div className="print-hidden flex justify-center">
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
          <div className="print-hidden space-y-3">
            {selectedProviders.map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
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
              {/* Section 6 - Results */}
              <div className="print-area space-y-4">
                <Results results={results} />
                {savedComparison ? (
                  <EstimateComparison
                    baseline={savedComparison}
                    currentResults={results}
                    currentInputs={resultInputs ?? createComparisonInputs()}
                    onClear={() => setSavedComparison(null)}
                  />
                ) : null}
              </div>

              {/* Section 7 - Actions */}
              <div className="print-hidden mt-6 flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={saveCurrentForComparison}
                  disabled={!results}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {savedComparison ? "Replace Comparison" : "Save Comparison"}
                </Button>
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
              <div className="print-hidden mt-8 text-center">
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
    </PageContainer>
  );
}
