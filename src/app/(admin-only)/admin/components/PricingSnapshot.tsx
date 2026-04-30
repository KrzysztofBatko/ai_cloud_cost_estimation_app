"use client";
import { usePricingSnapshot } from "@/app/(admin-only)/admin/hooks/usePricingSnapshot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";

export default function PricingSnapshot() {
  const {
    pricingSnapshot,
    refreshingPricingSnapshot,
    pricingSnapshotError,
    refreshSnapshot,
    fetchPricingSnapshot,
    fetchingPricingSnapshot,
  } = usePricingSnapshot();

  return (
    <Card className="shadow-card mt-4">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Pricing Snapshot</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPricingSnapshot()}
            disabled={fetchingPricingSnapshot || refreshingPricingSnapshot}
            className="gap-2"
          >
            {(fetchingPricingSnapshot || refreshingPricingSnapshot) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Reload
          </Button>
          <Button
            size="sm"
            onClick={() => refreshSnapshot(true)}
            disabled={refreshingPricingSnapshot}
            className="gap-2"
          >
            {refreshingPricingSnapshot ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh snapshot
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pricingSnapshotError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {pricingSnapshotError}
          </div>
        )}

        {pricingSnapshot ? (
          <div className="grid gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Pricing snapshot</p>
              <p className="font-medium text-foreground">
                {pricingSnapshot.pricingAsOf}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Region</p>
              <p className="font-medium text-foreground">
                {pricingSnapshot.region}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Source</p>
              <p className="font-medium text-foreground">
                {pricingSnapshot.source}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created at</p>
              <p className="font-medium text-foreground">
                {new Date(pricingSnapshot.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created by</p>
              <p className="font-medium text-foreground">
                {pricingSnapshot.createdBy ?? "system"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium text-foreground">
                {pricingSnapshot.notes ?? "-"}
              </p>
            </div>
          </div>
        ) : fetchingPricingSnapshot ? (
          <div className="px-4 py-8 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
