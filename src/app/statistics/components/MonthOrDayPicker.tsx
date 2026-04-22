"use client";

import * as React from "react";
import {
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  startOfMonth,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ViewMode } from "@/app/admin/components/DashboardParameters";

export type MonthOrDayPickerValue = { mode: ViewMode; date: Date };
export type RangeMonthOrDayPickerValue = {
  mode: ViewMode;
  periodA: Date | null;
  periodB: Date | null;
};

type Props = {
  value: MonthOrDayPickerValue;
  onChange: (value: MonthOrDayPickerValue) => void;
};

type RangeProps = {
  value: RangeMonthOrDayPickerValue;
  onChange: (value: RangeMonthOrDayPickerValue) => void;
};

function clampToMonth(d: Date) {
  return startOfMonth(d);
}

function isFutureMonth(month: Date, now: Date) {
  return isAfter(startOfMonth(month), endOfMonth(now));
}

export function MonthOrDayPickerPopover({ value, onChange }: Props) {
  const selectedLabel = React.useMemo(() => {
    return value.mode === "months"
      ? format(value.date, "LLL yyyy")
      : format(value.date, "dd LLL yyyy");
  }, [value]);

  // Year cursor (internal UI state)
  const derivedCursor = React.useMemo(() => {
    if (value.mode === "months") return clampToMonth(value.date);
    if (value.mode === "days") return clampToMonth(value.date);
    return clampToMonth(new Date());
  }, [value]);

  const [cursor, setCursor] = React.useState<Date>(derivedCursor);
  React.useEffect(() => setCursor(derivedCursor), [derivedCursor]);

  const monthsInYear = React.useMemo(() => {
    const y = cursor.getFullYear();
    return Array.from({ length: 12 }, (_, i) => new Date(y, i, 1));
  }, [cursor]);

  const canGoNextYear = React.useMemo(() => {
    const nextYearStart = new Date(cursor.getFullYear() + 1, 0, 1);
    return !isAfter(nextYearStart, endOfMonth(new Date()));
  }, [cursor]);

  const goPrevYear = () =>
    setCursor((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1));
  const goNextYear = () => {
    if (!canGoNextYear) return;
    setCursor((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1));
  };

  const selectMonth = (m: Date) => {
    if (isFutureMonth(m, new Date())) return;
    const month = clampToMonth(m);

    if (value.mode === "months") {
      onChange({ mode: "months", date: month });
      return;
    }

    // days mode: move to month; keep day if still in same month, else first day
    const currentDay = value.date;
    const nextDay =
      currentDay && isSameMonth(currentDay, month)
        ? currentDay
        : startOfMonth(month);
    const day = isAfter(nextDay, new Date()) ? new Date() : nextDay;

    onChange({ mode: "days", date: day });
  };

  return (
    <div className={"inline-flex"}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={"justify-between gap-2"}
          >
            <span
              className={cn(
                !selectedLabel ||
                  selectedLabel === "Select month" ||
                  selectedLabel === "Select day"
                  ? "text-muted-foreground"
                  : "",
              )}
            >
              {selectedLabel}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          {/* CONTENT */}
          {value.mode === "months" ? (
            <div className="rounded-lg border p-3">
              <div className="mb-3 flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={goPrevYear}>
                  {cursor.getFullYear() - 1}
                </Button>

                <div className="font-medium">{cursor.getFullYear()}</div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNextYear}
                  disabled={!canGoNextYear}
                >
                  {cursor.getFullYear() + 1}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {monthsInYear.map((m) => {
                  const selected = value.date
                    ? isSameMonth(value.date, m)
                    : false;
                  const disabled = isFutureMonth(m, new Date());

                  return (
                    <Button
                      key={m.toISOString()}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "justify-center",
                        disabled && "pointer-events-none opacity-50",
                      )}
                      onClick={() => {
                        selectMonth(m);
                      }}
                      disabled={disabled}
                    >
                      {format(m, "LLL")}
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-3">
              <Calendar
                mode="single"
                selected={value.date ?? undefined}
                onSelect={(day) => {
                  if (!day) return;
                  if (isAfter(day, new Date())) return;
                  onChange({ mode: "days", date: day });
                }}
                disabled={(date) => isAfter(date, new Date())}
                initialFocus
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function formatRangeLabel(value: RangeMonthOrDayPickerValue) {
  if (value.mode === "months") {
    if (value.periodA && value.periodB) {
      return `${format(value.periodA, "LLL yyyy")} vs ${format(
        value.periodB,
        "LLL yyyy",
      )}`;
    }
    if (value.periodA) return `${format(value.periodA, "LLL yyyy")} vs`;
    return "Select months";
  }

  if (value.periodA && value.periodB) {
    return `${format(value.periodA, "dd LLL yyyy")} vs ${format(value.periodB, "dd LLL yyyy")}`;
  }
  if (value.periodA) return `${format(value.periodA, "dd LLL yyyy")} vs`;
  return "Select days";
}

export function RangeMonthOrDayPickerPopover({ value, onChange }: RangeProps) {
  const selectedLabel = React.useMemo(() => formatRangeLabel(value), [value]);

  const derivedFromCursor = React.useMemo(() => {
    if (value.periodA) return clampToMonth(value.periodA);
    return clampToMonth(new Date());
  }, [value.periodA]);

  const derivedToCursor = React.useMemo(() => {
    if (value.periodB) return clampToMonth(value.periodB);
    if (value.periodA) return clampToMonth(value.periodA);
    return clampToMonth(new Date());
  }, [value.periodA, value.periodB]);

  const [fromCursor, setFromCursor] = React.useState<Date>(derivedFromCursor);
  const [toCursor, setToCursor] = React.useState<Date>(derivedToCursor);

  React.useEffect(() => setFromCursor(derivedFromCursor), [derivedFromCursor]);
  React.useEffect(() => setToCursor(derivedToCursor), [derivedToCursor]);

  const monthsInYear = (cursor: Date) => {
    const y = cursor.getFullYear();
    return Array.from({ length: 12 }, (_, i) => new Date(y, i, 1));
  };

  const canGoNextYear = (cursor: Date) => {
    const nextYearStart = new Date(cursor.getFullYear() + 1, 0, 1);
    return !isAfter(nextYearStart, endOfMonth(new Date()));
  };

  const goPrevYear = (setter: React.Dispatch<React.SetStateAction<Date>>) =>
    setter((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1));

  const goNextYear = (
    cursor: Date,
    setter: React.Dispatch<React.SetStateAction<Date>>,
  ) => {
    if (!canGoNextYear(cursor)) return;
    setter((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1));
  };

  const selectFromMonth = (m: Date) => {
    if (isFutureMonth(m, new Date())) return;

    const month = clampToMonth(m);
    let nextTo = value.periodB ? clampToMonth(value.periodB) : null;

    if (nextTo && isBefore(nextTo, month)) nextTo = month;

    onChange({ mode: "months", periodA: month, periodB: nextTo });
  };

  const selectToMonth = (m: Date) => {
    if (isFutureMonth(m, new Date())) return;

    const month = clampToMonth(m);
    let nextFrom = value.periodA ? clampToMonth(value.periodA) : null;

    if (!nextFrom) nextFrom = month;
    if (nextFrom && isBefore(month, nextFrom)) nextFrom = month;

    onChange({ mode: "months", periodA: nextFrom, periodB: month });
  };

  const selectFromDay = (day?: Date) => {
    if (!day) return;
    if (isAfter(day, new Date())) return;

    let nextTo = value.periodB;
    if (nextTo && isBefore(nextTo, day)) nextTo = day;

    onChange({ mode: "days", periodA: day, periodB: nextTo ?? null });
  };

  const selectToDay = (day?: Date) => {
    if (!day) return;
    if (isAfter(day, new Date())) return;

    let nextFrom = value.periodA;
    if (!nextFrom) nextFrom = day;
    if (nextFrom && isBefore(day, nextFrom)) nextFrom = day;

    onChange({ mode: "days", periodA: nextFrom ?? null, periodB: day });
  };

  return (
    <div className="inline-flex">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="justify-between gap-2"
          >
            <span
              className={cn(
                selectedLabel === "Select months" ||
                  selectedLabel === "Select days"
                  ? "text-muted-foreground"
                  : "",
              )}
            >
              {selectedLabel}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[640px] max-w-[95vw]">
          {value.mode === "months" ? (
            <div className="grid gap-4 rounded-lg border p-3 sm:grid-cols-2 ">
              <div>
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  Period A
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goPrevYear(setFromCursor)}
                  >
                    {fromCursor.getFullYear() - 1}
                  </Button>

                  <div className="font-medium">{fromCursor.getFullYear()}</div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goNextYear(fromCursor, setFromCursor)}
                    disabled={!canGoNextYear(fromCursor)}
                  >
                    {fromCursor.getFullYear() + 1}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {monthsInYear(fromCursor).map((m) => {
                    const selected = value.periodA
                      ? isSameMonth(value.periodA, m)
                      : false;
                    const disabled = isFutureMonth(m, new Date());

                    return (
                      <Button
                        key={`from-${m.toISOString()}`}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "justify-center",
                          disabled && "pointer-events-none opacity-50",
                        )}
                        onClick={() => selectFromMonth(m)}
                        disabled={disabled}
                      >
                        {format(m, "LLL")}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  Period B
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goPrevYear(setToCursor)}
                  >
                    {toCursor.getFullYear() - 1}
                  </Button>

                  <div className="font-medium">{toCursor.getFullYear()}</div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goNextYear(toCursor, setToCursor)}
                    disabled={!canGoNextYear(toCursor)}
                  >
                    {toCursor.getFullYear() + 1}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {monthsInYear(toCursor).map((m) => {
                    const selected = value.periodB
                      ? isSameMonth(value.periodB, m)
                      : false;
                    const disabled = isFutureMonth(m, new Date());

                    return (
                      <Button
                        key={`to-${m.toISOString()}`}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "justify-center",
                          disabled && "pointer-events-none opacity-50",
                        )}
                        onClick={() => selectToMonth(m)}
                        disabled={disabled}
                      >
                        {format(m, "LLL")}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 rounded-lg border p-3 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  Period A
                </div>
                <Calendar
                  mode="single"
                  selected={value.periodA ?? undefined}
                  onSelect={selectFromDay}
                  disabled={(date) => isAfter(date, new Date())}
                  initialFocus
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-muted-foreground">
                  Period B
                </div>
                <Calendar
                  mode="single"
                  selected={value.periodB ?? undefined}
                  onSelect={selectToDay}
                  disabled={(date) => isAfter(date, new Date())}
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
