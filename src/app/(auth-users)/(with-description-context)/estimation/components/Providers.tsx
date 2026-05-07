"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useActiveProviders } from "@/app/(auth-users)/(with-description-context)/estimation/hooks/useActiveProviders";
import { ProviderKey, ProviderRegion } from "@/types/api";
import { iconMap } from "@/app/(auth-users)/(with-description-context)/estimation/utils/providerHelpers";

export interface Provider {
  id: string;
  name: string;
  providerKey: ProviderKey | null;
  icon: React.ReactNode;
  defaultRegion: string | null;
  regions: ProviderRegion[];
}

interface Props {
  selectedProviders: Provider[];
  selectedRegions: Record<string, string>;
  onToggleProvider: (provider: Provider) => void;
  onRegionChange: (providerKey: ProviderKey, region: string) => void;
}

export default function Providers({
  selectedProviders,
  selectedRegions,
  onToggleProvider,
  onRegionChange,
}: Props) {
  const { providers, loading, fetchProviders } = useActiveProviders();

  useEffect(() => {
    void fetchProviders(iconMap);
  }, [fetchProviders]);

  return (
    <Card className="shadow-card gap-3">
      <CardHeader>
        <CardTitle>1. Cloud Providers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {loading ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          providers.map((p) => {
            const isSelected = selectedProviders.some((sp) => sp.id === p.id);
            const regionOptions = p.providerKey
              ? p.regions.map((region) => ({
                  value: region.value,
                  label: region.label,
                }))
              : [];
            const selectedRegion = p.providerKey
              ? (selectedRegions[p.providerKey] ?? p.defaultRegion)
              : "";

            return (
              <div
                key={p.id}
                className="min-w-[240px] rounded-lg border border-border px-3 py-3 shadow-xs transition-colors hover:bg-muted data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                data-selected={isSelected}
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleProvider(p)}
                  />
                  {p.icon}
                  <span className="font-medium">{p.name}</span>
                </label>

                {isSelected && regionOptions.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Region
                    </div>
                    <select
                      value={selectedRegion}
                      onChange={(event) =>
                        p.providerKey &&
                        onRegionChange(p.providerKey, event.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {regionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
