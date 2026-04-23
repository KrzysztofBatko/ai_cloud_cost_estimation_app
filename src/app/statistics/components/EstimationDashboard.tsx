"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import responseCompareMock from "../../data/statisticsResponseCompare.json";
import TopProviders from "@/app/statistics/components/TopProviders";
import { format } from "date-fns";
import { useProviders } from "@/app/admin/hooks/useProviders";
import DashboardParameters, {
  VIEW_MODES,
} from "@/app/statistics/components/DashboardParameters";
import Legend from "@/app/statistics/components/Legend";
import ProviderCharts from "@/app/statistics/components/ProviderCharts";
import SummaryTable from "@/app/statistics/components/SummaryTable";
import { useStatistics } from "@/app/statistics/hooks/useStatistics";

export const CHART_MODES = ["single", "compare"] as const;
export type ChartMode = (typeof CHART_MODES)[number];

function formatDate(date: Date | null, mode: (typeof VIEW_MODES)[number]) {
  if (!date) return "";
  return mode === "days"
    ? format(date, "dd LLL yyyy")
    : format(date, "LLL yyyy");
}

export default function EstimationDashboard() {
  const [mode, setMode] = useState<ChartMode>("single");
  const {
    singleValue,
    setSingleValue,
    rangeValue,
    setRangeValue,
    responseSingle,
  } = useStatistics();
  const { providers } = useProviders();

  return (
    <Card className="border border-white/15 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
      <CardHeader className="flex flex-col gap-0">
        <CardTitle className="text-lg font-semibold">Statistics</CardTitle>
        <CardDescription className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Explore your cloud cost estimations with our interactive 3D
              dashboard.
            </p>
            <Legend providers={providers.map((p) => p.name)} />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex-1 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <DashboardParameters
              singleValue={singleValue}
              setSingleValue={setSingleValue}
              rangeValue={rangeValue}
              setRangeValue={setRangeValue}
              mode={mode}
              setMode={setMode}
            />
            <>
              {mode === "single" && (
                <ProviderCharts
                  mode="single"
                  singleData={responseSingle ?? []}
                />
              )}
              {mode === "compare" && (
                <ProviderCharts
                  mode="compare"
                  compareData={responseCompareMock.data}
                  periodALabel={formatDate(rangeValue.periodA, rangeValue.mode)}
                  periodBLabel={formatDate(rangeValue.periodB, rangeValue.mode)}
                />
              )}
            </>
          </div>
          <div className="w-full lg:w-72 flex flex-col gap-4">
            {mode === "single" && (
              <>
                <SummaryTable
                  mode="single"
                  singleValueDate={formatDate(
                    singleValue.date,
                    singleValue.mode,
                  )}
                  statistics={responseSingle ?? []}
                  providers={providers.map((p) => p.name)}
                />
                <TopProviders mode="single" statistics={responseSingle ?? []} />
              </>
            )}
            {mode === "compare" && (
              <>
                <SummaryTable
                  mode="compare"
                  singleValueDate={formatDate(
                    singleValue.date,
                    singleValue.mode,
                  )}
                  statistics={responseCompareMock.data}
                  providers={providers.map((p) => p.name)}
                />
                <TopProviders
                  mode="compare"
                  statistics={responseCompareMock.data}
                />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
