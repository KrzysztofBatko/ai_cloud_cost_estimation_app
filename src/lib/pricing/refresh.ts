import {
  DEFAULT_PRICING_CATALOG,
  DEFAULT_SNAPSHOT_REGION,
} from "@/lib/pricing/catalog";
import {
  createPricingSnapshot,
  getLatestPricingSnapshot,
} from "@/lib/pricing/snapshots";
import { PricingSnapshot } from "@/types/api";

export type RefreshPricingSnapshotResult = {
  snapshot: PricingSnapshot;
  skipped: boolean;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function refreshPricingSnapshot(input?: {
  region?: string;
  createdBy?: string | null;
  force?: boolean;
}) {
  const region = input?.region ?? DEFAULT_SNAPSHOT_REGION;
  const pricingAsOf = todayIsoDate();
  const latestSnapshot = await getLatestPricingSnapshot(region);

  if (!input?.force && latestSnapshot?.pricingAsOf === pricingAsOf) {
    return {
      snapshot: latestSnapshot,
      skipped: true,
    } satisfies RefreshPricingSnapshotResult;
  }

  const snapshot = await createPricingSnapshot({
    region,
    pricingAsOf,
    source: "default-catalog-refresh-multi-region",
    catalog: DEFAULT_PRICING_CATALOG,
    notes:
      "Automated multi-region snapshot based on the current curated pricing catalog. Ready to swap to provider API fetchers.",
    createdBy: input?.createdBy ?? null,
  });

  return {
    snapshot,
    skipped: false,
  } satisfies RefreshPricingSnapshotResult;
}
