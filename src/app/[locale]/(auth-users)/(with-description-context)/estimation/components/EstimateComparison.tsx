"use client";

import type { EstimateResponse } from "@/app/api/estimation/route";
import { useTranslations } from "next-intl";
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
import { usageQuestions } from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/configuration";
import { GitCompareArrows, Trash2 } from "lucide-react";
import {
  formatCalculatedAt,
  formatCurrency,
} from "@/app/[locale]/(auth-users)/(with-description-context)/estimation/utils/commonFormats";
import type { EstimationCurrency } from "@/lib/estimation/currencies";

export type ComparisonInputs = {
  providers: string[];
  currency: EstimationCurrency;
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

type ComparisonLabels = {
  providers: string;
  currency: string;
  customInfrastructureNotes: string;
  notAvailable: string;
  defaultRegion: string;
  notSet: string;
  provided: string;
  regionLabel: (provider: string) => string;
};

const usageQuestionLabels = new Map(
  usageQuestions.map((question) => [question.id, question.label]),
);

function normalizeProvider(provider: string) {
  return provider.trim().toLowerCase();
}

function estimateExactKey(est: ProviderEstimate) {
  return `${normalizeProvider(est.provider)}:${est.region ?? "default"}`;
}

function estimateFallbackKey(est: ProviderEstimate) {
  return normalizeProvider(est.provider);
}

function describeRegion(
  est: ProviderEstimate | undefined,
  labels: Pick<ComparisonLabels, "defaultRegion" | "notAvailable">,
) {
  if (!est) {
    return labels.notAvailable;
  }

  return est.regionLabel ?? est.region ?? labels.defaultRegion;
}

function formatOptionalValue(value: string | undefined, notSet: string) {
  if (!value?.trim()) {
    return notSet;
  }

  if (value.length > 90) {
    return `${value.slice(0, 87)}...`;
  }

  return value;
}

function formatProviders(providers: string[], notSet: string) {
  return providers.length ? providers.join(", ") : notSet;
}

function formatNotesValue(notes: string, labels: ComparisonLabels) {
  return notes.trim() ? labels.provided : labels.notSet;
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
  labels: ComparisonLabels,
): ParameterChange[] {
  const changes: ParameterChange[] = [];

  const baselineProviders = [...baseline.providers].sort().join("|");
  const currentProviders = [...current.providers].sort().join("|");

  if (baselineProviders !== currentProviders) {
    changes.push({
      key: "providers",
      label: labels.providers,
      baseline: formatProviders(baseline.providers, labels.notSet),
      current: formatProviders(current.providers, labels.notSet),
    });
  }

  if (baseline.currency !== current.currency) {
    changes.push({
      key: "currency",
      label: labels.currency,
      baseline: baseline.currency,
      current: current.currency,
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
        label: labels.regionLabel(regionKey.toUpperCase()),
        baseline: formatOptionalValue(baselineRegion, labels.notSet),
        current: formatOptionalValue(currentRegion, labels.notSet),
      });
    }
  });

  const knownUsageIds = new Set(usageQuestions.map((question) => question.id));
  const usageIds = [
    ...usageQuestions.map((question) => question.id),
    ...Array.from(
      new Set([...Object.keys(baseline.usage), ...Object.keys(current.usage)]),
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
        baseline: formatOptionalValue(baselineValue, labels.notSet),
        current: formatOptionalValue(currentValue, labels.notSet),
      });
    }
  });

  if (baseline.notes.trim() !== current.notes.trim()) {
    changes.push({
      key: "notes",
      label: labels.customInfrastructureNotes,
      baseline: formatNotesValue(baseline.notes, labels),
      current: formatNotesValue(current.notes, labels),
    });
  }

  return changes;
}

function formatDelta(
  baseline?: ProviderEstimate,
  current?: ProviderEstimate,
  field: "monthlyTotal" | "dailyTotal" = "monthlyTotal",
  canCompareCurrencies = true,
) {
  if (!baseline || !current) {
    return null;
  }

  if (!canCompareCurrencies || baseline.currency !== current.currency) {
    return {
      value: "0",
      delta: 0,
    };
  }

  const delta = current[field] - baseline[field];
  const currency = current.currency ?? baseline.currency;
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const absoluteDelta = formatCurrency(Math.abs(delta), currency);
  const percent =
    baseline[field] > 0
      ? ` (${((delta / baseline[field]) * 100).toFixed(1)}%)`
      : "";

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
  const t = useTranslations("estimation.comparison");
  const labels: ComparisonLabels = {
    providers: t("providers"),
    currency: t("currency"),
    customInfrastructureNotes: t("customInfrastructureNotes"),
    notAvailable: t("notAvailable"),
    defaultRegion: t("defaultRegion"),
    notSet: t("notSet"),
    provided: t("provided"),
    regionLabel: (provider) => t("regionLabel", { provider }),
  };
  const rows = buildComparisonRows(baseline.results, currentResults);
  const parameterChanges = buildParameterChanges(
    baseline.inputs,
    currentInputs,
    labels,
  );
  const canCompareCurrencies =
    baseline.inputs.currency === currentInputs.currency;

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4" />
          {t("title")}
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="print-hidden text-muted-foreground hover:text-foreground"
          aria-label={t("clearSavedComparison")}
        >
          <Trash2 className="h-4 w-4" />
          {t("clear")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
          <div>
            <div className="text-sm font-medium">{t("savedBaseline")}</div>
            <div className="text-xs text-muted-foreground">
              {formatCalculatedAt(baseline.savedAt)}
            </div>
          </div>
          <Badge variant="secondary">
            {t("providerCount", {
              count: baseline.results.estimates.length,
            })}
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[24%]">{t("provider")}</TableHead>
              <TableHead className="w-[19%]">{t("savedMonthly")}</TableHead>
              <TableHead className="w-[19%]">{t("currentMonthly")}</TableHead>
              <TableHead className="w-[19%]">{t("monthlyChange")}</TableHead>
              <TableHead className="w-[19%]">{t("dailyChange")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const monthlyDelta = formatDelta(
                row.baseline,
                row.current,
                "monthlyTotal",
                canCompareCurrencies,
              );
              const dailyDelta = formatDelta(
                row.baseline,
                row.current,
                "dailyTotal",
                canCompareCurrencies,
              );

              return (
                <TableRow key={row.key}>
                  <TableCell className="whitespace-normal">
                    <div className="font-medium">{row.provider}</div>
                    <div className="text-xs text-muted-foreground">
                      {t("saved")}: {describeRegion(row.baseline, labels)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("current")}: {describeRegion(row.current, labels)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {row.baseline
                      ? formatCurrency(
                          row.baseline.monthlyTotal,
                          row.baseline.currency,
                        )
                      : t("new")}
                  </TableCell>
                  <TableCell className="font-mono">
                    {row.current
                      ? formatCurrency(
                          row.current.monthlyTotal,
                          row.current.currency,
                        )
                      : t("removed")}
                  </TableCell>
                  <TableCell
                    className={`font-mono ${deltaClass(monthlyDelta?.delta)}`}
                  >
                    {monthlyDelta?.value ?? t("notApplicable")}
                  </TableCell>
                  <TableCell
                    className={`font-mono ${deltaClass(dailyDelta?.delta)}`}
                  >
                    {dailyDelta?.value ?? t("notApplicable")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">
              {t("changedParameters")}
            </h3>
            <Badge variant="outline">{parameterChanges.length}</Badge>
          </div>

          {parameterChanges.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[34%]">{t("parameter")}</TableHead>
                    <TableHead className="w-[33%]">{t("saved")}</TableHead>
                    <TableHead className="w-[33%]">{t("current")}</TableHead>
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
              {t("noParameterDifferences")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
