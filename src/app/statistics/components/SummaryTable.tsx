import { ProviderDot } from "@/app/statistics/components/Legend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoveUp, MoveDown } from "lucide-react";

const deltaColorClass = (delta: number) =>
  delta < 0
    ? "text-red-500" // Period B < Period A
    : delta > 0
      ? "text-green-500" // Period B > Period A
      : "text-muted-foreground";

const deltaLabel = (delta: number) => {
  if (delta === 0) return "-";

  const Icon = delta > 0 ? MoveUp : MoveDown;

  return (
    <>
      <Icon className="h-3 w-3 pb-0.5 inline-block" />
      {Math.abs(delta)}
    </>
  );
};

export type StatisticsSingle = {
  provider: string;
  count?: number;
  providers?: string[];
};

export type StatisticsCompare = {
  provider: string;
  countPeriodA?: number;
  countPeriodB?: number;
  providers?: string[];
};

type Props =
  | {
      mode: "single";
      statistics: StatisticsSingle[];
      singleValueDate: string;
      providers: string[];
    }
  | {
      mode: "compare";
      statistics: StatisticsCompare[];
      singleValueDate: string;
      providers: string[];
    };

export default function SummaryTable({
  mode,
  singleValueDate,
  statistics,
  providers,
}: Props) {
  const singleRows =
    mode === "single"
      ? providers.map((provider) => {
          const stat = statistics.find((item) => item.provider === provider);
          return { provider, count: stat?.count ?? 0 };
        })
      : [];

  const compareRows =
    mode === "compare"
      ? providers.map((provider) => {
          const stat = statistics.find((item) => item.provider === provider);
          return {
            provider,
            countPeriodA: stat?.countPeriodA ?? 0,
            countPeriodB: stat?.countPeriodB ?? 0,
          };
        })
      : [];

  const delta =
    mode === "compare"
      ? compareRows.reduce(
          (acc, stat) =>
            acc + ((stat.countPeriodB || 0) - (stat.countPeriodA || 0)),
          0,
        )
      : 0;

  return (
    <Card className="shadow-card gap-0 pb-2">
      <CardHeader>
        <CardTitle>Summary Table</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {mode === "single" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">
                  Provider
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  {singleValueDate}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {singleRows.map((stat) => (
                <TableRow key={stat.provider}>
                  <TableCell>
                    <ProviderDot provider={stat.provider} />
                    <span className="ml-2">{stat.provider}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {stat.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-white border-t-2">
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {singleRows.reduce((acc, stat) => acc + (stat.count || 0), 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
        {mode === "compare" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">
                  Provider
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Period A
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Period B
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compareRows.map((stat) => (
                <TableRow key={stat.provider}>
                  <TableCell>
                    <ProviderDot provider={stat.provider} />
                    <span className="ml-2">{stat.provider}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {stat.countPeriodA}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {stat.countPeriodB}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${deltaColorClass((stat.countPeriodB || 0) - (stat.countPeriodA || 0))}`}
                  >
                    {deltaLabel(
                      (stat.countPeriodB || 0) - (stat.countPeriodA || 0),
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-white border-t-2">
              {mode === "compare" && (
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {compareRows.reduce(
                      (acc, stat) => acc + (stat.countPeriodA || 0),
                      0,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {compareRows.reduce(
                      (acc, stat) => acc + (stat.countPeriodB || 0),
                      0,
                    )}
                  </TableCell>
                  <TableCell className={`text-right ${deltaColorClass(delta)}`}>
                    {deltaLabel(delta)}
                  </TableCell>
                </TableRow>
              )}
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
