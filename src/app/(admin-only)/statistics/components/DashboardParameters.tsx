import {
  CHART_MODES,
  ChartMode,
} from "@/app/(admin-only)/statistics/components/EstimationDashboard";
import {
  MonthOrDayPickerPopover,
  MonthOrDayPickerValue,
  RangeMonthOrDayPickerPopover,
  RangeMonthOrDayPickerValue,
} from "@/app/(admin-only)/statistics/components/MonthOrDayPicker";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// ── Types ────────────────────────────────────────────────────────────────────
export const VIEW_MODES = ["months", "days"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export default function DashboardParameters({
  singleValue,
  setSingleValue,
  rangeValue,
  setRangeValue,
  mode,
  setMode,
}: {
  singleValue: MonthOrDayPickerValue;
  setSingleValue: React.Dispatch<React.SetStateAction<MonthOrDayPickerValue>>;
  rangeValue: RangeMonthOrDayPickerValue;
  setRangeValue: React.Dispatch<
    React.SetStateAction<RangeMonthOrDayPickerValue>
  >;
  mode: ChartMode;
  setMode: React.Dispatch<React.SetStateAction<ChartMode>>;
}) {
  const handleViewChange = (value: ViewMode) => {
    if (value === "months") {
      setSingleValue({ mode: "months", date: new Date() });
      setRangeValue({ mode: "months", periodA: new Date(), periodB: null });
      return;
    }

    setSingleValue({ mode: "days", date: new Date() });
    setRangeValue({ mode: "days", periodA: new Date(), periodB: null });
  };

  return (
    <Card className="shadow-card">
      <CardContent className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            variant="outline"
            type="single"
            value={singleValue.mode}
            onValueChange={(value) => {
              if (!value) return;
              handleViewChange(value as ViewMode);
            }}
          >
            {VIEW_MODES.map((v) => (
              <ToggleGroupItem key={v} value={v} aria-label={`Toggle ${v}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            variant="outline"
            type="single"
            value={mode}
            onValueChange={(value) => {
              if (!value) return;
              setMode(value as ChartMode);
            }}
          >
            {CHART_MODES.map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                aria-label={`Toggle ${m} mode`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        {mode === "compare" && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <p className="text-sm font-medium text-muted-foreground">
              Period A vs Period B
            </p>
            <RangeMonthOrDayPickerPopover
              value={rangeValue}
              onChange={setRangeValue}
            />
          </div>
        )}
        {mode === "single" && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <p className="text-sm font-medium text-muted-foreground">Period</p>
            <MonthOrDayPickerPopover
              value={singleValue}
              onChange={setSingleValue}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
