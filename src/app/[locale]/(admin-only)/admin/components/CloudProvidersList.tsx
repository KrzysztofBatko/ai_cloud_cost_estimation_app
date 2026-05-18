import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProviders } from "@/app/[locale]/(admin-only)/admin/hooks/useProviders";
import CloudProvider from "@/app/[locale]/(admin-only)/admin/components/CloudProvider";

export default function CloudProvidersList() {
  const t = useTranslations("admin.providers");
  const {
    providers,
    newProvider,
    loading,
    fetchingProviders,
    addProvider,
    deleteProvider,
    setProviderActive,
    addRegion,
    deleteRegion,
    setDefaultRegion,
    setNewProvider,
    newRegionByProvider,
    setNewRegionDraft,
    providerError,
    canBeDeactivated,
  } = useProviders();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {providerError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {providerError}
            {canBeDeactivated && (
              <div className="mt-2 text-sm text-muted-foreground">
                {t("deactivateInstead")}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Input
            placeholder={t("newProviderPlaceholder")}
            value={newProvider}
            onChange={(e) => setNewProvider(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProvider()}
          />
          <Button
            onClick={addProvider}
            disabled={loading}
            className="w-24 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{t("add")}</span>
          </Button>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {providers.map((p) => (
            <CloudProvider
              key={p.id}
              provider={p}
              loading={loading}
              deleteProvider={deleteProvider}
              setProviderActive={setProviderActive}
              addRegion={addRegion}
              deleteRegion={deleteRegion}
              setDefaultRegion={setDefaultRegion}
              newRegionByProvider={newRegionByProvider}
              setNewRegionDraft={setNewRegionDraft}
            />
          ))}
          {fetchingProviders && (
            <div className="px-4 py-8 flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
