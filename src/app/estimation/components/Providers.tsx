"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Cloud, Globe, Database, Triangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface Provider {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Props {
  selectedProviders: Provider[];
  onToggleProvider: (provider: Provider) => void;
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
  onToggleProvider,
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
          data.map((p: { id: string; name: string }) => ({
            ...p,
            icon: iconMap[p.id] ?? <Cloud className="w-6 h-6 text-muted-foreground" />,
          })),
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
            return (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 shadow-xs transition-colors hover:bg-muted data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                data-selected={isSelected}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleProvider(p)}
                />
                {p.icon}
                <span className="font-medium">{p.name}</span>
              </label>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
