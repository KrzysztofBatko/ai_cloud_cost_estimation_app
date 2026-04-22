import { Provider, ProviderRegion } from "@/types/api";

export type ProviderRegionRow = {
  id: string;
  provider_id: string;
  value: string;
  label: string;
  is_default?: boolean;
};

export type ProviderWithRegionRows = {
  id: string;
  name: string;
  is_active?: boolean;
  provider_regions?: ProviderRegionRow[] | null;
};

export type ProviderRow = {
  id: string;
  name: string;
  is_active?: boolean;
};

export function mapProviderRegionRow(
  region: ProviderRegionRow,
): ProviderRegion {
  return {
    id: region.id,
    value: region.value,
    label: region.label,
    isDefault: region.is_default ?? false,
  };
}

export function attachProviderRegions(
  providers: ProviderRow[],
  regions: ProviderRegionRow[],
): ProviderWithRegionRows[] {
  const regionsByProviderId = new Map<string, ProviderRegionRow[]>();

  for (const region of regions) {
    const current = regionsByProviderId.get(region.provider_id) ?? [];
    current.push(region);
    regionsByProviderId.set(region.provider_id, current);
  }

  return providers.map((provider) => ({
    ...provider,
    provider_regions: regionsByProviderId.get(provider.id) ?? [],
  }));
}

export function toProviderDto(provider: ProviderWithRegionRows): Provider {
  const dbRegions =
    provider.provider_regions?.map(mapProviderRegionRow).sort((left, right) => {
      if (left.isDefault === right.isDefault) {
        return left.label.localeCompare(right.label);
      }

      return left.isDefault ? -1 : 1;
    }) ?? [];
  const defaultRegion =
    dbRegions.find((region) => region.isDefault)?.value ?? null;

  return {
    id: provider.id,
    name: provider.name,
    isActive: provider.is_active ?? false,
    defaultRegion,
    regions: dbRegions,
  };
}
