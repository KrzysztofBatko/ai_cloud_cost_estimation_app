"use client";

import type { EstimateResponse } from "@/app/api/estimation/route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usageQuestions } from "@/app/(auth-users)/(with-description-context)/estimation/configuration";
import { GitCompareArrows, Trash2 } from "lucide-react";

export type ComparisonInputs = {
  providers: string[];
  usage: Record<string, string>;
  providerRegions: Record<string, string>;
  notes: string;
};

export type SavedComparison = {
  savedAt: string;
  results: EstimateResponse;
  inputs: ComparisonInputs;
};

type ProviderEstimate = EstimateResponse["estimates"][number];

type ComparisonRow = {
  key: string;
  provider: string;
  baseline?: ProviderEstimate;
  current?: ProviderEstimate;
};

type ParameterChange = {
  key: string;
  label: string;
  baseline: string;
  current: string;
};

const usageQuestionLabels = new Map(
  usageQuestions.map((question) => [question.id, question.label]),
);

function formatCalculatedAt(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatCurrency(value: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function normalizeProvider(provider: string) {
  return provider.trim().toLowerCase();
}

function estimateExactKey(est: ProviderEstimate) {
  return `${normalizeProvider(est.provider)}:${est.region ?? "default"}`;
}

function estimateFallbackKey(est: ProviderEstimate) {
  return normalizeProvider(est.provider);
}

function describeRegion(est?: ProviderEstimate) {
  if (!est) {
    return "Not available";
  }

  return est.regionLabel ?? est.region ?? "Default region";
}

function formatOptionalValue(value?: string) {
  if (!value?.trim()) {
    return "Not set";
  }

  if (value.length > 90) {
    return `${value.slice(0, 87)}...`;
  }

  return value;
}

function formatProviders(providers: string[]) {
  return providers.length ? providers.join(", ") : "Not set";
}

function formatNotesValue(notes: string) {
  return notes.trim() ? "Provided" : "Not set";
}

function formatRegionLabel(regionKey: string) {
  return `${regionKey.toUpperCase()} region`;
}

function buildComparisonRows(
  baselineResults: EstimateResponse,
  currentResults: EstimateResponse,
): ComparisonRow[] {
  const usedCurrentIndexes = new Set<number>();

  const rows: ComparisonRow[] = baselineResults.estimates.map((baseline) => {
    let currentIndex = currentResults.estimates.findIndex(
      (current, index) =>
        !usedCurrentIndexes.has(index) &&
        estimateExactKey(current) === estimateExactKey(baseline),
    );

    if (currentIndex === -1) {
      currentIndex = currentResults.estimates.findIndex(
        (current, index) =>
          !usedCurrentIndexes.has(index) &&
          estimateFallbackKey(current) === estimateFallbackKey(baseline),
      );
    }

    const current =
      currentIndex === -1 ? undefined : currentResults.estimates[currentIndex];

    if (currentIndex !== -1) {
      usedCurrentIndexes.add(currentIndex);
    }

    return {
      key: estimateExactKey(baseline),
      provider: baseline.provider,
      baseline,
      current,
    };
  });

  currentResults.estimates.forEach((current, index) => {
    if (usedCurrentIndexes.has(index)) {
      return;
    }

    rows.push({
      key: `current:${estimateExactKey(current)}`,
      provider: current.provider,
      current,
    });
  });

  return rows;
}

function buildParameterChanges(
  baseline: ComparisonInputs,
  current: ComparisonInputs,
): ParameterChange[] {
  const changes: ParameterChange[] = [];

  const baselineProviders = [...baseline.providers].sort().join("|");
  const currentProviders = [...current.providers].sort().join("|");

  if (baselineProviders !== currentProviders) {
    changes.push({
      key: "providers",
      label: "Providers",
      baseline: formatProviders(baseline.providers),
      current: formatProviders(current.providers),
    });
  }

  const regionKeys = Array.from(
    new Set([
      ...Object.keys(baseline.providerRegions),
      ...Object.keys(current.providerRegions),
    ]),
  ).sort();

  regionKeys.forEach((regionKey) => {
    const baselineRegion = baseline.providerRegions[regionKey] ?? "";
    const currentRegion = current.providerRegions[regionKey] ?? "";

    if (baselineRegion !== currentRegion) {
      changes.push({
        key: `region:${regionKey}`,
        label: formatRegionLabel(regionKey),
        baseline: formatOptionalValue(baselineRegion),
        current: formatOptionalValue(currentRegion),
      });
    }
  });

  const knownUsageIds = new Set(usageQuestions.map((question) => question.id));
  const usageIds = [
    ...usageQuestions.map((question) => question.id),
    ...Array.from(
      new Set([
        ...Object.keys(baseline.usage),
        ...Object.keys(current.usage),
      ]),
    )
      .filter((id) => !knownUsageIds.has(id))
      .sort(),
  ];

  usageIds.forEach((usageId) => {
    const baselineValue = baseline.usage[usageId] ?? "";
    const currentValue = current.usage[usageId] ?? "";

    if (baselineValue !== currentValue) {
      changes.push({
        key: `usage:${usageId}`,
        label: usageQuestionLabels.get(usageId) ?? usageId,
        baseline: formatOptionalValue(baselineValue),
        current: formatOptionalValue(currentValue),
      });
    }
  });

  if (baseline.notes.trim() !== current.notes.trim()) {
    changes.push({
      key: "notes",
      label: "Custom infrastructure notes",
      baseline: formatNotesValue(baseline.notes),
      current: formatNotesValue(current.notes),
    });
  }

  return changes;
}

function formatDelta(
  baseline?: ProviderEstimate,
  current?: ProviderEstimate,
  field: "monthlyTotal" | "dailyTotal" = "monthlyTotal",
) {
  if (!baseline || !current) {
    return null;
  }

  const delta = current[field] - baseline[field];
  const currency = current.currency ?? baseline.currency;
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const absoluteDelta = formatCurrency(Math.abs(delta), currency);
  const percent =
    baseline[field] > 0 ? ` (${((delta / baseline[field]) * 100).toFixed(1)}%)` : "";

  return {
    value: `${sign}${absoluteDelta}${percent}`,
    delta,
  };
}

function deltaClass(delta?: number) {
  if (!delta) {
    return "text-muted-foreground";
  }

  return delta > 0 ? "text-destructive" : "text-emerald-600";
}

export default function EstimateComparison({
  baseline,
  currentResults,
  currentInputs,
  onClear,
}: {
  baseline: SavedComparison;
  currentResults: EstimateResponse;
  currentInputs: ComparisonInputs;
  onClear: () => void;
}) {
  const rows = buildComparisonRows(baseline.results, currentResults);
  const parameterChanges = buildParameterChanges(
    baseline.inputs,
    currentInputs,
  );

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4" />
          Comparison
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="print-hidden text-muted-foreground hover:text-foreground"
          aria-label="Clear saved comparison"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
          <div>
            <div className="text-sm font-medium">Saved baseline</div>
            <div className="text-xs text-muted-foreground">
              {formatCalculatedAt(baseline.savedAt)}
            </div>
          </div>
          <Badge variant="secondary">
            {baseline.results.estimates.length} provider
            {baseline.results.estimates.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[24%]">Provider</TableHead>
              <TableHead className="w-[19%]">Saved monthly</TableHead>
              <TableHead className="w-[19%]">Current monthly</TableHead>
              <TableHead className="w-[19%]">Monthly change</TableHead>
              <TableHead className="w-[19%]">Daily change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const monthlyDelta = formatDelta(row.baseline, row.current);
              const dailyDelta = formatDelta(
                row.baseline,
                row.current,
                "dailyTotal",
              );

              return (
                <TableRow key={row.key}>
                  <TableCell className="whitespace-normal">
                    <div className="font-medium">{row.provider}</div>
                    <div className="text-xs text-muted-foreground">
                      Saved: {describeRegion(row.baseline)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current: {describeRegion(row.current)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {row.baseline
                      ? formatCurrency(
                          row.baseline.monthlyTotal,
                          row.baseline.currency,
                        )
                      : "New"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {row.current
                      ? formatCurrency(row.current.monthlyTotal, row.current.currency)
                      : "Removed"}
                  </TableCell>
                  <TableCell
                    className={`font-mono ${deltaClass(monthlyDelta?.delta)}`}
                  >
                    {monthlyDelta?.value ?? "N/A"}
                  </TableCell>
                  <TableCell
                    className={`font-mono ${deltaClass(dailyDelta?.delta)}`}
                  >
                    {dailyDelta?.value ?? "N/A"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">
              Changed parameters
            </h3>
            <Badge variant="outline">{parameterChanges.length}</Badge>
          </div>

          {parameterChanges.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[34%]">Parameter</TableHead>
                    <TableHead className="w-[33%]">Saved</TableHead>
                    <TableHead className="w-[33%]">Current</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameterChanges.map((change) => (
                    <TableRow key={change.key}>
                      <TableCell className="whitespace-normal font-medium">
                        {change.label}
                      </TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">
                        {change.baseline}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {change.current}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No parameter differences captured for these result sets.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
