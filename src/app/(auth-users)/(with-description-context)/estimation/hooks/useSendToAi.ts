import { EstimateResponse } from "@/app/api/estimation/route";
import { ENDPOINTS } from "@/lib/api/utils";
import { useState } from "react";

export function useSendToAI() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EstimateResponse | null>(null);

  const sendToAI = async (
    selectedProvidersNames: string[],
    answers: Record<string, string>,
    notes: string,
    providerRegions: Record<string, string>,
  ): Promise<EstimateResponse | null> => {
    const body = {
      providers: selectedProvidersNames,
      usage: answers,
      notes,
      providerRegions,
    };
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch(ENDPOINTS.ESTIMATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = (await res.json()) as EstimateResponse;
      setResults(data);
      return data;
    } catch (error) {
      console.error("Error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendToAI, loading, results, setResults };
}
