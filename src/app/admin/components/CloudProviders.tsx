import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useProviders } from "@/app/admin/hooks/useProviders";

export default function CloudProviders() {
  const {
    providers,
    newProvider,
    loading,
    fetchingProviders,
    addProvider,
    deleteProvider,
    setProviderActive,
    setNewProvider,
    providerError,
    canBeDeactivated,
  } = useProviders();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Cloud Providers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {providerError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {providerError}
            {canBeDeactivated && (
              <div className="mt-2 text-sm text-muted-foreground">
                You can deactivate the provider instead.
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Input
            placeholder="New provider name..."
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
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {providers.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-foreground">
                    {p.name}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {p.isActive
                    ? "Visible in the estimation experience"
                    : "Hidden from active selection"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setProviderActive(p.id, !p.isActive)}
                  disabled={loading}
                >
                  {p.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteProvider(p.id)}
                  className="text-destructive hover:text-destructive"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
