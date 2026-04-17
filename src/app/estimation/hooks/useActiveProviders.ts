import { normalizeProviderKey, ProviderKey } from "@/lib/pricing/catalog";
import { useState } from "react";

export interface Provider {
  id: string;
  name: string;
  providerKey: ProviderKey | null;
  icon: React.ReactNode;
}

export function useActiveProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchProviders = async (iconMap: Record<string, React.ReactNode>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/providers");
      if (!response.ok) throw new Error("Fetch failed");
      const result = await response.json();
      const data = Array.isArray(result?.data) ? result.data : [];

      setProviders(
        data.map((p: { id: string; name: string }) => {
          const providerKey = normalizeProviderKey(p.name);

          return {
            ...p,
            providerKey,
            icon: iconMap[providerKey ?? "default"] || iconMap["default"],
          };
        }),
      );
    } catch (error) {
      console.error("Failed to load providers", error);
    } finally {
      setLoading(false);
    }
  };

  return { providers, loading, fetchProviders };
}
