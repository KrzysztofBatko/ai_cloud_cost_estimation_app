import {
  MonthOrDayPickerValue,
  RangeMonthOrDayPickerValue,
} from "@/app/statistics/components/MonthOrDayPicker";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { SingleStatistics } from "@/types/api";

const currentDate = new Date();
const currentMonth = new Date();
const previousMonth = new Date(
  currentMonth.getFullYear(),
  currentMonth.getMonth() - 1,
  1,
);

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

  return {
    singleValue,
    setSingleValue,
    rangeValue,
    setRangeValue,
    responseSingle,
  };
}
