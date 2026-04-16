"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Cloud, Globe, Database, Triangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDefaultProviderRegion,
  getProviderRegionOptions,
  normalizeProviderKey,
  type ProviderKey,
} from "@/lib/pricing/catalog";

export interface Provider {
  id: string;
  name: string;
  providerKey: ProviderKey | null;
  icon: React.ReactNode;
}

interface Props {
  selectedProviders: Provider[];
  selectedRegions: Record<string, string>;
  onToggleProvider: (provider: Provider) => void;
  onRegionChange: (providerKey: ProviderKey, region: string) => void;
}

const iconMap = {
  aws: <Cloud className="w-6 h-6 text-orange-500" />,
  azure: <Cloud className="w-6 h-6 text-blue-500" />,
  gcp: <Globe className="w-6 h-6 text-blue-400" />,
  oracle: <Database className="w-6 h-6 text-red-500" />,
  vercel: <Triangle className="w-6 h-6 text-black" />,
};

export default function Providers({
  selectedProviders,
  selectedRegions,
  onToggleProvider,
  onRegionChange,
}: Props) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/providers");
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        setProviders(
          data.map((p: { id: string; name: string }) => {
            const providerKey = normalizeProviderKey(p.name);

            return {
              ...p,
              providerKey,
              icon:
                (providerKey ? iconMap[providerKey] : null) ?? (
                  <Cloud className="w-6 h-6 text-muted-foreground" />
                ),
            };
          }),
        );
      } catch (error) {
        console.error("Failed to load providers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return (
    <Card className="shadow-card gap-3">
      <CardHeader>
        <CardTitle className="text-lg">1. Cloud Providers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {loading ? (
          <div className="flex w-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          providers.map((p) => {
            const isSelected = selectedProviders.some((sp) => sp.id === p.id);
            const regionOptions = p.providerKey ? getProviderRegionOptions(p.providerKey) : [];
            const selectedRegion =
              p.providerKey
                ? (selectedRegions[p.providerKey] ?? getDefaultProviderRegion(p.providerKey))
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
                        p.providerKey && onRegionChange(p.providerKey, event.target.value)
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
