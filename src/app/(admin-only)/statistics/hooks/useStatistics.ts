import { useEffect, useState } from "react";
import { SingleStatistics } from "@/types/api";
import { ENDPOINTS } from "@/lib/api/utils";
import {
  MonthOrDayPickerValue,
  RangeMonthOrDayPickerValue,
} from "@/app/(admin-only)/statistics/components/MonthOrDayPicker";

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
  const [fetching, setFetching] = useState(false);
  const [responseSingle, setResponseSingle] = useState<SingleStatistics[]>();

  async function getStatistics(singleValue: MonthOrDayPickerValue) {
    const date = formatApiDate(singleValue.date, singleValue.mode);
    const queryKey = singleValue.mode === "months" ? "month" : "day";
    try {
      setFetching(true);
      const response = await fetch(
        `${ENDPOINTS.ESTIMATIONS_STATISTICS}?${queryKey}=${date}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data) {
        setResponseSingle(result.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    getStatistics(singleValue);
  }, [singleValue]);

  return {
    singleValue,
    setSingleValue,
    rangeValue,
    setRangeValue,
    fetching,
    responseSingle,
  };
}
