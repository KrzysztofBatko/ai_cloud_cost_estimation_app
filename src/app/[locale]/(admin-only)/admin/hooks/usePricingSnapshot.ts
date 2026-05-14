import { ENDPOINTS } from "@/lib/api/utils";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type PricingSnapshot = {
  id: string;
  region: string;
  pricingAsOf: string;
  source: string;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
};

export function usePricingSnapshot() {
  const t = useTranslations("admin.errors");
  const [pricingSnapshot, setPricingSnapshot] =
    useState<PricingSnapshot | null>(null);
  const [fetchingPricingSnapshot, setFetchingPricingSnapshot] = useState(false);
  const [refreshingPricingSnapshot, setRefreshingPricingSnapshot] =
    useState(false);
  const [pricingSnapshotError, setPricingSnapshotError] = useState<
    string | null
  >(null);

  const fetchPricingSnapshot = useCallback(
    async (isInitial?: boolean) => {
      try {
        setPricingSnapshotError(null);
        if (isInitial) {
          setFetchingPricingSnapshot(true);
        }

        const response = await fetch(ENDPOINTS.PRICING_REFRESH);
        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(
            errorBody?.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();
        setPricingSnapshot(result.data ?? null);
      } catch (error) {
        console.error("Error fetching pricing snapshot:", error);
        setPricingSnapshotError(t("pricingSnapshotLoad"));
      } finally {
        setFetchingPricingSnapshot(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchPricingSnapshot(true);
  }, [fetchPricingSnapshot]);

  const refreshSnapshot = useCallback(
    async (force = false) => {
      try {
        setPricingSnapshotError(null);
        setRefreshingPricingSnapshot(true);

        const response = await fetch(ENDPOINTS.PRICING_REFRESH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(
            errorBody?.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();
        setPricingSnapshot(result.data ?? null);
      } catch (error) {
        console.error("Error refreshing pricing snapshot:", error);
        setPricingSnapshotError(t("pricingSnapshotRefresh"));
      } finally {
        setRefreshingPricingSnapshot(false);
      }
    },
    [t],
  );

  return {
    pricingSnapshot,
    refreshingPricingSnapshot,
    pricingSnapshotError,
    refreshSnapshot,
    fetchPricingSnapshot,
    fetchingPricingSnapshot,
  };
}
