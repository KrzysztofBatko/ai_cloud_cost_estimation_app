import { normalizeProviderKey } from "@/lib/pricing/catalog";
import { ProviderKey, ProviderRegion } from "@/types/api";
import { useCallback, useState } from "react";

export interface Provider {
  id: string;
  name: string;
  providerKey: ProviderKey | null;
  icon: React.ReactNode;
  defaultRegion: string | null;
  regions: ProviderRegion[];
}

export function useActiveProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchProviders = useCallback(
    async (iconMap: Record<string, React.ReactNode>) => {
      setLoading(true);
      try {
        const response = await fetch("/api/providers");
        if (!response.ok) throw new Error("Fetch failed");
        const result = await response.json();
        const data = Array.isArray(result?.data) ? result.data : [];

        setProviders(
          data.map(
            (p: {
              id: string;
              name: string;
              defaultRegion?: string | null;
              regions?: ProviderRegion[];
            }) => {
              const providerKey = normalizeProviderKey(p.name);

              return {
                ...p,
                providerKey,
                icon: iconMap[providerKey ?? "default"] || iconMap["default"],
                defaultRegion: p.defaultRegion ?? null,
                regions: p.regions ?? [],
              };
            },
          ),
        );
      } catch (error) {
        console.error("Failed to load providers", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { providers, loading, fetchProviders };
}
