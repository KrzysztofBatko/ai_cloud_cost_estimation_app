import { supabase } from "@/lib/supabase/server";
import {
  DEFAULT_CATALOG_AS_OF,
  DEFAULT_PRICING_CATALOG,
  DEFAULT_SNAPSHOT_REGION,
} from "@/lib/pricing/catalog";
import { PricingSnapshot, StoredPricingCatalog } from "@/types/api";

type PricingSnapshotRow = {
  id: string;
  region: string;
  pricing_as_of: string;
  source: string;
  catalog: StoredPricingCatalog;
  notes: string | null;
  created_at: string;
  created_by: string | null;
};

function mapSnapshotRow(row: PricingSnapshotRow): PricingSnapshot {
  return {
    id: row.id,
    region: row.region,
    pricingAsOf: row.pricing_as_of,
    source: row.source,
    catalog: row.catalog,
    notes: row.notes,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export function getDefaultPricingSnapshot(): PricingSnapshot {
  return {
    id: "default-catalog",
    region: DEFAULT_SNAPSHOT_REGION,
    pricingAsOf: DEFAULT_CATALOG_AS_OF,
    source: "default-catalog",
    catalog: DEFAULT_PRICING_CATALOG,
    notes: "Built-in pricing catalog fallback.",
    createdAt: `${DEFAULT_CATALOG_AS_OF}T00:00:00.000Z`,
    createdBy: null,
  };
}

export async function getLatestPricingSnapshot(
  region = DEFAULT_SNAPSHOT_REGION,
) {
  const { data, error } = await supabase
    .from("pricing_snapshots")
    .select(
      "id, region, pricing_as_of, source, catalog, notes, created_at, created_by",
    )
    .eq("region", region)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapSnapshotRow(data as PricingSnapshotRow) : null;
}

export async function createPricingSnapshot(input: {
  region?: string;
  pricingAsOf: string;
  source: string;
  catalog: StoredPricingCatalog;
  notes?: string | null;
  createdBy?: string | null;
}) {
  const { data, error } = await supabase
    .from("pricing_snapshots")
    .insert({
      region: input.region ?? DEFAULT_SNAPSHOT_REGION,
      pricing_as_of: input.pricingAsOf,
      source: input.source,
      catalog: input.catalog,
      notes: input.notes ?? null,
      created_by: input.createdBy ?? null,
    })
    .select(
      "id, region, pricing_as_of, source, catalog, notes, created_at, created_by",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapSnapshotRow(data as PricingSnapshotRow);
}
