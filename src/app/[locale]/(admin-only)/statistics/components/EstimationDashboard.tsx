"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DashboardParameters, {
  VIEW_MODES,
} from "@/app/[locale]/(admin-only)/statistics/components/DashboardParameters";
import Legend from "@/app/[locale]/(admin-only)/statistics/components/Legend";
import ProviderCharts from "@/app/[locale]/(admin-only)/statistics/components/ProviderCharts";
import SummaryTable from "@/app/[locale]/(admin-only)/statistics/components/SummaryTable";
import TopProviders from "@/app/[locale]/(admin-only)/statistics/components/TopProviders";
import { useStatistics } from "@/app/[locale]/(admin-only)/statistics/hooks/useStatistics";
import { useProviders } from "@/app/[locale]/(admin-only)/admin/hooks/useProviders";

export const CHART_MODES = ["single", "compare"] as const;
export type ChartMode = (typeof CHART_MODES)[number];

function formatDate(
  date: Date | null,
  mode: (typeof VIEW_MODES)[number],
  locale: string,
) {
  if (!date) return "";

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    ...(mode === "days" ? { day: "2-digit" } : {}),
  }).format(date);
}

export default function EstimationDashboard() {
  const locale = useLocale();
  const t = useTranslations("statistics.dashboard");
  const [mode, setMode] = useState<ChartMode>("single");
  const {
    singleValue,
    setSingleValue,
    rangeValue,
    setRangeValue,
    responseSingle,
    responseCompare,
  } = useStatistics();
  const { providers } = useProviders();
  const providerNames = providers.map((provider) => provider.name);
  const periodALabel = formatDate(rangeValue.periodA, rangeValue.mode, locale);
  const periodBLabel = formatDate(rangeValue.periodB, rangeValue.mode, locale);

  return (
    <Card className="border border-white/15 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
      <CardHeader className="flex flex-col gap-0">
        <CardTitle className="text-lg font-semibold">{t("title")}</CardTitle>
        <CardDescription className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {t("description")}
            </p>
            <Legend providers={providerNames} />
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
                  compareData={responseCompare}
                  periodALabel={periodALabel}
                  periodBLabel={periodBLabel}
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
                    locale,
                  )}
                  statistics={responseSingle ?? []}
                  providers={providerNames}
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
                    locale,
                  )}
                  statistics={responseCompare}
                  providers={providerNames}
                />
                <TopProviders mode="compare" statistics={responseCompare} />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
