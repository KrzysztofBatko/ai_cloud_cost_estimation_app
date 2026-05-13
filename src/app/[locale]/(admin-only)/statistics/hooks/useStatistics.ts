import { useEffect, useState } from "react";
import { CompareStatistics, SingleStatistics } from "@/types/api";
import { ENDPOINTS } from "@/lib/api/utils";
import {
  MonthOrDayPickerValue,
  RangeMonthOrDayPickerValue,
} from "@/app/[locale]/(admin-only)/statistics/components/MonthOrDayPicker";

const currentDate = new Date();
const currentMonth = new Date();
const previousMonth = new Date(
  currentMonth.getFullYear(),
  currentMonth.getMonth() - 1,
  1,
);
const apiDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type StatisticsResponseRow = {
  provider: string;
  count: number | string;
};

function formatApiDate(date: Date, mode: MonthOrDayPickerValue["mode"]) {
  const dateParts = apiDateFormatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value ?? "";

  const year = getPart("year");
  const month = getPart("month");

  if (mode === "months") {
    return `${year}-${month}`;
  }

  return `${year}-${month}-${getPart("day")}`;
}

function isStatisticsRow(value: unknown): value is StatisticsResponseRow {
  if (!value || typeof value !== "object") return false;

  const row = value as { provider?: unknown; count?: unknown };

  return (
    typeof row.provider === "string" &&
    (typeof row.count === "number" || typeof row.count === "string")
  );
}

function parseStatisticsResponse(result: unknown): SingleStatistics[] {
  const data = (result as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];

  return data
    .filter(isStatisticsRow)
    .map((row) => ({
      provider: row.provider,
      count: Number(row.count),
    }))
    .filter((row) => row.provider && Number.isFinite(row.count));
}

async function fetchStatistics(
  value: MonthOrDayPickerValue,
  signal?: AbortSignal,
) {
  const date = formatApiDate(value.date, value.mode);
  const queryKey = value.mode === "months" ? "month" : "day";
  const response = await fetch(
    `${ENDPOINTS.ESTIMATIONS_STATISTICS}?${queryKey}=${date}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return parseStatisticsResponse(await response.json());
}

function mergeCompareStatistics(
  periodA: SingleStatistics[],
  periodB: SingleStatistics[],
): CompareStatistics[] {
  const periodACounts = new Map(
    periodA.map((item) => [item.provider, item.count]),
  );
  const periodBCounts = new Map(
    periodB.map((item) => [item.provider, item.count]),
  );
  const providers = Array.from(
    new Set([...periodACounts.keys(), ...periodBCounts.keys()]),
  ).sort((left, right) => left.localeCompare(right));

  return providers.map((provider) => ({
    provider,
    countPeriodA: periodACounts.get(provider) ?? 0,
    countPeriodB: periodBCounts.get(provider) ?? 0,
  }));
}

export function useStatistics() {
  const [singleValue, setSingleValue] = useState<MonthOrDayPickerValue>({
    mode: "months",
    date: currentDate,
  });
  const [rangeValue, setRangeValue] = useState<RangeMonthOrDayPickerValue>({
    mode: "months",
    periodA: previousMonth,
    periodB: currentMonth,
  });
  const [fetchingSingle, setFetchingSingle] = useState(false);
  const [fetchingCompare, setFetchingCompare] = useState(false);
  const [responseSingle, setResponseSingle] = useState<SingleStatistics[]>([]);
  const [responseCompare, setResponseCompare] = useState<CompareStatistics[]>(
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function getSingleStatistics() {
      try {
        setFetchingSingle(true);
        setResponseSingle(await fetchStatistics(singleValue, controller.signal));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching statistics:", error);
        setResponseSingle([]);
      } finally {
        setFetchingSingle(false);
      }
    }

    getSingleStatistics();

    return () => controller.abort();
  }, [singleValue]);

  useEffect(() => {
    if (!rangeValue.periodA || !rangeValue.periodB) {
      setFetchingCompare(false);
      setResponseCompare([]);
      return;
    }

    const { mode, periodA: periodADate, periodB: periodBDate } = rangeValue;
    const controller = new AbortController();

    async function getCompareStatistics() {
      try {
        setFetchingCompare(true);
        const [periodAStatistics, periodBStatistics] = await Promise.all([
          fetchStatistics(
            {
              mode,
              date: periodADate,
            },
            controller.signal,
          ),
          fetchStatistics(
            {
              mode,
              date: periodBDate,
            },
            controller.signal,
          ),
        ]);

        setResponseCompare(
          mergeCompareStatistics(periodAStatistics, periodBStatistics),
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching comparison statistics:", error);
        setResponseCompare([]);
      } finally {
        setFetchingCompare(false);
      }
    }

    getCompareStatistics();

    return () => controller.abort();
  }, [rangeValue]);

  return {
    singleValue,
    setSingleValue,
    rangeValue,
    setRangeValue,
    fetching: fetchingSingle || fetchingCompare,
    fetchingSingle,
    fetchingCompare,
    responseSingle,
    responseCompare,
  };
}
