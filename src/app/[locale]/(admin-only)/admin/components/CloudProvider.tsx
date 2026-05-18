import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Provider } from "@/types/api";

type CloudProviderProps = {
  provider: Provider;
  loading: boolean;
  deleteProvider: (id: string) => Promise<void>;
  setProviderActive: (id: string, isActive: boolean) => Promise<void>;
  addRegion: (providerId: string) => Promise<void>;
  deleteRegion: (providerId: string, regionId: string) => Promise<void>;
  setDefaultRegion: (providerId: string, regionId: string) => Promise<void>;
  newRegionByProvider: Record<string, { value: string; label: string }>;
  setNewRegionDraft: (
    providerId: string,
    field: "value" | "label",
    value: string,
  ) => void;
};

export default function CloudProvider({
  provider,
  loading,
  deleteProvider,
  setProviderActive,
  addRegion,
  deleteRegion,
  setDefaultRegion,
  newRegionByProvider,
  setNewRegionDraft,
}: CloudProviderProps) {
  const t = useTranslations("admin.providers");
  const [openRegions, setOpenRegions] = useState(false);

  return (
    <div
      key={provider.id}
      className="space-y-4 px-4 py-4 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-foreground">
              {provider.name}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                provider.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {provider.isActive ? t("status.active") : t("status.inactive")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {provider.isActive
              ? t("visibility.active")
              : t("visibility.inactive")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setProviderActive(provider.id, !provider.isActive)}
            disabled={loading}
          >
            {provider.isActive
              ? t("actions.deactivate")
              : t("actions.activate")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteProvider(provider.id)}
            className="text-destructive hover:text-destructive"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Collapsible open={openRegions} onOpenChange={setOpenRegions}>
        <div className="space-y-3 rounded-lg border border-border/70 p-2">
          <div className="flex items-center justify-between gap-3 m-0">
            <div className="flex gap-2">
              <CollapsibleTrigger>
                <ChevronDown
                  className={
                    "h-4 w-4 text-muted-foreground transition-transform " +
                    (openRegions ? "" : "-rotate-90")
                  }
                />
              </CollapsibleTrigger>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {t("regions.title")}
                </div>
              </div>
            </div>

            {provider.defaultRegion ? (
              <span className="text-xs text-muted-foreground">
                {t("regions.defaultLabel")}{" "}
                <span className="font-medium font-semibold">
                  {provider.defaultRegion}
                </span>
              </span>
            ) : null}
          </div>
          <CollapsibleContent>
            <div className="space-y-2 mt-2">
              <div className="text-xs text-muted-foreground">
                {t("regions.helper")}
              </div>
              {(provider.regions ?? []).map((region) => (
                <div
                  key={region.id}
                  className="grid px-2 md:grid-cols-[1fr_1fr_0.3fr_auto] items-center"
                >
                  <div className="truncate text-left text-sm font-medium text-foreground">
                    {region.value}
                  </div>
                  <div className="truncate text-left text-sm font-medium text-foreground">
                    {region.label}
                  </div>
                  <Button
                    size="xs"
                    type="button"
                    variant={region.isDefault ? "default" : "outline"}
                    onClick={() => setDefaultRegion(provider.id, region.id)}
                    disabled={loading || region.isDefault}
                  >
                    {region.isDefault
                      ? t("actions.default")
                      : t("actions.setDefault")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => deleteRegion(provider.id, region.id)}
                    className="text-destructive hover:text-destructive"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(provider.regions ?? []).length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                  {t("regions.empty")}
                </div>
              ) : null}
            </div>

            <div className="grid gap-2 mt-2 md:grid-cols-[1fr_1fr_auto]">
              <Input
                placeholder={t("regions.codePlaceholder")}
                value={newRegionByProvider[provider.id]?.value ?? ""}
                onChange={(event) =>
                  setNewRegionDraft(provider.id, "value", event.target.value)
                }
                disabled={loading}
              />
              <Input
                placeholder={t("regions.labelPlaceholder")}
                value={newRegionByProvider[provider.id]?.label ?? ""}
                onChange={(event) =>
                  setNewRegionDraft(provider.id, "label", event.target.value)
                }
                disabled={loading}
              />
              <Button
                type="button"
                onClick={() => addRegion(provider.id)}
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("actions.addRegion")}
              </Button>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
