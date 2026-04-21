import { DEFAULT_COLOR, PROVIDER_HEX } from "@/app/admin/components/Legend";
import {
  StatisticsCompare,
  StatisticsSingle,
} from "@/app/admin/components/SummaryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Stats({ stats, max }: { stats: StatisticsSingle[]; max: number }) {
  return (
    <div>
      {stats.map((p, i) => (
        <div key={p.provider} className="space-y-2 pb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground font-mono">#{i + 1}</span>
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{
                  background:
                    PROVIDER_HEX[p.provider as keyof typeof PROVIDER_HEX] ??
                    DEFAULT_COLOR,
                  border: "0.1px solid rgba(0, 0, 0, 0.18)",
                  boxShadow:
                    "inset 0 1px 1px rgba(255, 255, 255, 0.55), inset 0 -1px 2px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.35)",
                }}
              />
              <span className="font-medium">{p.provider}</span>
            </div>
            <span className="font-mono">{p.count}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((p.count || 0) / max) * 100}%`,
                background:
                  PROVIDER_HEX[p.provider as keyof typeof PROVIDER_HEX] ??
                  DEFAULT_COLOR,
                boxShadow:
                  "inset 0 1px 1px rgba(255, 255, 255, 0.55), inset 0 -1px 2px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.35)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

type Props =
  | {
      mode: "single";
      statistics: StatisticsSingle[];
    }
  | {
      mode: "compare";
      statistics: StatisticsCompare[];
    };

export default function TopProviders({ mode, statistics }: Props) {
  if (mode === "single") {
    const top3 = [...statistics]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 3);
    const max = top3[0]?.count || 1;

    return (
      <Card className="shadow-card gap-0 pb-2">
        <CardHeader>
          <CardTitle>Top 3 Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {statistics.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No data available for the selected period.
            </div>
          ) : (
            <Stats stats={top3} max={max} />
          )}
        </CardContent>
      </Card>
    );
  }

  const top3ComparePeriodA: StatisticsSingle[] = [...statistics]
    .sort((a, b) => (b.countPeriodA || 0) - (a.countPeriodA || 0))
    .slice(0, 3)
    .map((p) => ({
      provider: p.provider,
      count: p.countPeriodA,
    }));
  const maxComparePeriodA = top3ComparePeriodA[0]?.count || 1;

  const top3ComparePeriodB: StatisticsSingle[] = [...statistics]
    .sort((a, b) => (b.countPeriodB || 0) - (a.countPeriodB || 0))
    .slice(0, 3)
    .map((p) => ({
      provider: p.provider,
      count: p.countPeriodB,
    }));
  const maxComparePeriodB = top3ComparePeriodB[0]?.count || 1;

  return (
    <Card className="shadow-card gap-0 pb-2">
      <CardHeader>
        <CardTitle>Top 3 Providers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-muted-foreground text-sm">Period A</div>
            <div>
              <Stats stats={top3ComparePeriodA} max={maxComparePeriodA} />
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm">Period B</div>
            <div>
              <Stats stats={top3ComparePeriodB} max={maxComparePeriodB} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
