import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Info, Lightbulb, Cloud } from "lucide-react";

import { EstimateResponse } from "@/app/api/estimation/route";
import {
  formatCalculatedAt,
  formatCurrency,
} from "@/app/(auth-users)/(with-description-context)/estimation/utils/commonFormats";
import { iconMap } from "@/app/(auth-users)/(with-description-context)/estimation/utils/providerHelpers";

const confidenceVariant = (c: string) => {
  if (c === "high") return "default" as const;
  if (c === "medium") return "warning" as const;
  return "destructive" as const;
};

type ProviderEstimate = EstimateResponse["estimates"][number];

const ProviderEstimateDetails = ({ est }: { est: ProviderEstimate }) => (
  <div className="w-full rounded-lg border bg-card p-4">
    <div className="flex flex-col gap-3">
      {est.regionLabel || est.region ? (
        <div>
          <h3 className="text-sm font-semibold">Region</h3>
          <p className="text-xs text-muted-foreground">
            {est.regionLabel ?? est.region}
            {est.regionLabel && est.region ? ` (${est.region})` : ""}
          </p>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold">Assumptions</h3>
        <ul className="list-disc pl-5 text-xs text-muted-foreground">
          {est.assumptions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Breakdown</h3>
        <div className="space-y-2">
          {est.breakdown.map((b, i) => (
            <div key={i} className="flex justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{b.item}</p>
                <p className="text-xs text-muted-foreground">{b.notes}</p>
              </div>
              <span className="text-sm font-mono whitespace-nowrap">
                {formatCurrency(b.monthly, est.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {est.recommendation && (
        <div className="flex flex-row items-center gap-2">
          <Lightbulb className="h-6 w-6 text-warning" />
          <p className="text-sm text-muted-foreground italic">
            {est.recommendation}
          </p>
        </div>
      )}

      {est.pricingLinks.length > 0 && (
        <div className="flex flex-col gap-2">
          {est.pricingLinks.map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 break-all text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              {link}
            </a>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ProvidersEstimatesRow = ({
  est,
  isOpen,
  onToggle,
}: {
  est: ProviderEstimate;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            {iconMap[est.provider.toLowerCase() as keyof typeof iconMap] ?? (
              <Cloud className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <div>{est.provider}</div>
              {est.regionLabel ? (
                <div className="text-xs text-muted-foreground">
                  {est.regionLabel}
                </div>
              ) : null}
            </div>
          </div>
        </TableCell>
        <TableCell className="font-mono">
          {formatCurrency(est.monthlyTotal, est.currency)}
        </TableCell>
        <TableCell className="font-mono">
          {formatCurrency(est.dailyTotal, est.currency)}
        </TableCell>
        <TableCell>
          <Badge variant={confidenceVariant(est.confidence)}>
            {est.confidence}
          </Badge>
        </TableCell>
        <TableCell>
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Info className="h-4 w-4" />
            {isOpen ? "Hide details" : "Show details"}
          </button>
        </TableCell>
      </TableRow>

      {isOpen && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className="px-0 py-4 whitespace-normal">
            <ProviderEstimateDetails est={est} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const ProvidersEstimatesTable = ({
  results,
  openProviders,
  toggle,
}: {
  results: EstimateResponse;
  openProviders: Record<string, boolean>;
  toggle: (provider: string) => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[25%]">Provider</TableHead>
        <TableHead className="w-[15%]">Monthly</TableHead>
        <TableHead className="w-[15%]">Daily</TableHead>
        <TableHead className="w-[20%]">Confidence</TableHead>
        <TableHead className="w-[25%]">Details</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {results.estimates.map((est) => (
        <ProvidersEstimatesRow
          key={`${est.provider}-${est.region ?? "default"}`}
          est={est}
          isOpen={
            openProviders[`${est.provider}:${est.region ?? "default"}`] ?? false
          }
          onToggle={() => toggle(`${est.provider}:${est.region ?? "default"}`)}
        />
      ))}
    </TableBody>
  </Table>
);

const ProviderEstimateMobileCard = ({
  est,
  isOpen,
  onToggle,
}: {
  est: ProviderEstimate;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="space-y-4">
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {iconMap[est.provider.toLowerCase() as keyof typeof iconMap] ?? (
            <Cloud className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <div className="font-semibold">{est.provider}</div>
            {est.regionLabel ? (
              <div className="text-xs text-muted-foreground">
                {est.regionLabel}
              </div>
            ) : null}
          </div>
        </div>
        <Badge variant={confidenceVariant(est.confidence)}>
          {est.confidence}
        </Badge>
      </div>

      <div className="flex gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Monthly</p>
          <p className="text-lg font-mono font-semibold">
            {formatCurrency(est.monthlyTotal, est.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Daily</p>
          <p className="text-lg font-mono">
            {formatCurrency(est.dailyTotal, est.currency)}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <Info className="h-4 w-4" />
        {isOpen ? "Hide details" : "Show details"}
      </button>
    </div>

    {isOpen && <ProviderEstimateDetails est={est} />}
  </div>
);

/* ── Main Results component ── */
const Results = ({ results }: { results: EstimateResponse }) => {
  const [openProviders, setOpenProviders] = useState<Record<string, boolean>>(
    {},
  );
  if (!results) return null;

  const toggle = (provider: string) =>
    setOpenProviders((prev) => ({ ...prev, [provider]: !prev[provider] }));

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span>Cost Estimates</span>
          <div className="text-right text-sm font-normal text-muted-foreground">
            <div>Pricing snapshot: {results.pricingAsOf}</div>
            <div>Calculated at: {formatCalculatedAt(results.calculatedAt)}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="hidden md:block">
          <ProvidersEstimatesTable
            results={results}
            openProviders={openProviders}
            toggle={toggle}
          />
        </div>
        <div className="space-y-4 md:hidden">
          {results.estimates.map((est) => (
            <ProviderEstimateMobileCard
              key={`${est.provider}-${est.region ?? "default"}`}
              est={est}
              isOpen={
                openProviders[`${est.provider}:${est.region ?? "default"}`] ??
                false
              }
              onToggle={() =>
                toggle(`${est.provider}:${est.region ?? "default"}`)
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Results;
