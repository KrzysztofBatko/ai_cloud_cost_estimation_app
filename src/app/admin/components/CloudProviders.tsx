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
    setNewProvider,
  } = useProviders();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Cloud Providers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <span className="font-medium text-foreground">{p.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteProvider(p.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
