import {
  DEFAULT_PRICING_CATALOG,
  DEFAULT_SNAPSHOT_REGION,
  type PricingCatalog,
} from "@/lib/pricing/catalog";
import {
  createPricingSnapshot,
  getLatestPricingSnapshot,
  type PricingSnapshot,
} from "@/lib/pricing/snapshots";

export type RefreshPricingSnapshotResult = {
  snapshot: PricingSnapshot;
  skipped: boolean;
};

function buildCatalogFromCurrentSources(): PricingCatalog {
  return DEFAULT_PRICING_CATALOG;
}

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
    catalog: buildCatalogFromCurrentSources(),
    notes:
      "Automated multi-region snapshot based on the current curated pricing catalog. Ready to swap to provider API fetchers.",
    createdBy: input?.createdBy ?? null,
  });

  return {
    snapshot,
    skipped: false,
  } satisfies RefreshPricingSnapshotResult;
}
