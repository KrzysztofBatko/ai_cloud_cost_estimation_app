"use client";

import DashboardParameters, {
  VIEW_MODES,
} from "@/app/admin/components/DashboardParameters";
import Legend from "@/app/admin/components/Legend";
import {
  MonthOrDayPickerValue,
  RangeMonthOrDayPickerValue,
} from "@/app/admin/components/MonthOrDayPicker";
import SummaryTable from "@/app/admin/components/SummaryTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import responseCompareMock from "../../data/statisticsResponseCompare.json";
import TopProviders from "@/app/admin/components/TopProviders";
import ProviderCharts from "@/app/admin/components/ProviderCharts";
import { format } from "date-fns";
import { useProviders } from "@/app/admin/hooks/useProviders";

interface SingleResponse {
  provider: string;
  count: number;
}

export const CHART_MODES = ["single", "compare"] as const;
export type ChartMode = (typeof CHART_MODES)[number];

function formatDate(date: Date | null, mode: (typeof VIEW_MODES)[number]) {
  if (!date) return "";
  return mode === "days"
    ? format(date, "dd LLL yyyy")
    : format(date, "LLL yyyy");
}

const currentDate = new Date();
const currentMonth = new Date();
const previousMonth = new Date(
  currentMonth.getFullYear(),
  currentMonth.getMonth() - 1,
  1,
);

export default function EstimationDashboard() {
  const [mode, setMode] = useState<ChartMode>("single");
  const [singleValue, setSingleValue] = useState<MonthOrDayPickerValue>({
    mode: "months",
    date: currentDate,
  });
  const [rangeValue, setRangeValue] = useState<RangeMonthOrDayPickerValue>({
    mode: "months",
    periodA: previousMonth,
    periodB: currentMonth,
  });

  const [fetching, setFetching] = useState(false);
  const [responseSingle, setResponseSingle] = useState<SingleResponse[]>();

  const { providers } = useProviders();

  async function getStatistics(singleValue: MonthOrDayPickerValue) {
    const date = format(
      singleValue.date,
      singleValue.mode === "months" ? "yyyy-MM" : "yyyy-MM-dd",
    );
    const queryKey = singleValue.mode === "months" ? "month" : "day";
    try {
      setFetching(true);
      const response = await fetch(
        `/api/estimations-statistics?${queryKey}=${date}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data) {
        setResponseSingle(result.data);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    getStatistics(singleValue);
  }, [singleValue]);

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
