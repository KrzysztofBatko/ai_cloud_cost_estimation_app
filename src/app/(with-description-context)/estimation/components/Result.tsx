import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Info, Lightbulb, Cloud, Globe, Database, Triangle } from "lucide-react";

import { EstimateResponse } from "@/app/api/estimation/route";

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

const confidenceVariant = (c: string) => {
  if (c === "high") return "default" as const;
  if (c === "medium") return "warning" as const;
  return "destructive" as const;
};

const iconMap = {
  aws: <Cloud className="w-5 h-5 text-orange-500" />,
  azure: <Cloud className="w-5 h-5 text-blue-500" />,
  gcp: <Globe className="w-5 h-5 text-blue-400" />,
  oracle: <Database className="w-5 h-5 text-red-500" />,
  vercel: <Triangle className="w-5 h-5 text-black" />,
};

const ProvidersEstimatesTable = ({
  est,
  isOpen,
  onToggle,
}: {
  est: EstimateResponse["estimates"][number];
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
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
            <TableRow>
              <TableCell className="flex items-center gap-2">
                {iconMap[est.provider.toLowerCase() as keyof typeof iconMap] ?? (
                  <Cloud className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <div>{est.provider}</div>
                  {est.regionLabel ? (
                    <div className="text-xs text-muted-foreground">{est.regionLabel}</div>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="font-mono">${est.monthlyTotal}</TableCell>
              <TableCell className="font-mono">${est.dailyTotal}</TableCell>
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
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {iconMap[est.provider.toLowerCase() as keyof typeof iconMap] ?? (
                <Cloud className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <div className="font-semibold">{est.provider}</div>
                {est.regionLabel ? (
                  <div className="text-xs text-muted-foreground">{est.regionLabel}</div>
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
              <p className="text-lg font-mono font-semibold">${est.monthlyTotal}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Daily</p>
              <p className="text-lg font-mono">${est.dailyTotal}</p>
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
      </div>

      {isOpen && (
        <div className="rounded-lg border bg-card p-4 mt-4">
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
                      ${b.monthly}
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
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

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
        {results.estimates.map((est) => (
          <ProvidersEstimatesTable
            key={`${est.provider}-${est.region ?? "default"}`}
            est={est}
            isOpen={openProviders[`${est.provider}:${est.region ?? "default"}`] ?? false}
            onToggle={() => toggle(`${est.provider}:${est.region ?? "default"}`)}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default Results;
