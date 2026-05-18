import {
  CHART_MODES,
  ChartMode,
} from "@/app/[locale]/(admin-only)/statistics/components/EstimationDashboard";
import {
  MonthOrDayPickerPopover,
  MonthOrDayPickerValue,
  RangeMonthOrDayPickerPopover,
  RangeMonthOrDayPickerValue,
} from "@/app/[locale]/(admin-only)/statistics/components/MonthOrDayPicker";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslations } from "next-intl";

export const VIEW_MODES = ["months", "days"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

type DashboardParametersProps = {
  singleValue: MonthOrDayPickerValue;
  setSingleValue: React.Dispatch<React.SetStateAction<MonthOrDayPickerValue>>;
  rangeValue: RangeMonthOrDayPickerValue;
  setRangeValue: React.Dispatch<
    React.SetStateAction<RangeMonthOrDayPickerValue>
  >;
  mode: ChartMode;
  setMode: React.Dispatch<React.SetStateAction<ChartMode>>;
};

export default function DashboardParameters({
  singleValue,
  setSingleValue,
  rangeValue,
  setRangeValue,
  mode,
  setMode,
}: DashboardParametersProps) {
  const t = useTranslations("statistics.parameters");

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
            {VIEW_MODES.map((viewMode) => (
              <ToggleGroupItem
                key={viewMode}
                value={viewMode}
                aria-label={t("aria.toggleView", {
                  mode: t(`viewModes.${viewMode}`),
                })}
              >
                {t(`viewModes.${viewMode}`)}
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
            {CHART_MODES.map((chartMode) => (
              <ToggleGroupItem
                key={chartMode}
                value={chartMode}
                aria-label={t("aria.toggleChartMode", {
                  mode: t(`chartModes.${chartMode}`),
                })}
              >
                {t(`chartModes.${chartMode}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        {mode === "compare" && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <p className="text-sm font-medium text-muted-foreground">
              {t("comparePeriod")}
            </p>
            <RangeMonthOrDayPickerPopover
              value={rangeValue}
              onChange={setRangeValue}
            />
          </div>
        )}
        {mode === "single" && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <p className="text-sm font-medium text-muted-foreground">
              {t("period")}
            </p>
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
