import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  ResponsiveContainer,
} from "recharts";
import { DEFAULT_COLOR, PROVIDER_HEX } from "@/app/admin/components/Legend";

interface SingleData {
  provider: string;
  count: number;
}

interface CompareData {
  provider: string;
  countPeriodA: number;
  countPeriodB: number;
}

type SingleDataPoint = SingleData & {
  fill: string;
  gradientId: string;
};

type CompareDataPoint = CompareData & {
  fill: string;
  gradientId: string;
};

interface ProviderChartsProps {
  mode: "single" | "compare";
  singleData?: SingleData[];
  compareData?: CompareData[];
  periodALabel?: string;
  periodBLabel?: string;
}

const toId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const shadeHex = (hex: string, percent: number) => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return hex;
  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const target = percent < 0 ? 0 : 255;
  const p = Math.abs(percent);
  const nr = Math.round((target - r) * p + r);
  const ng = Math.round((target - g) * p + g);
  const nb = Math.round((target - b) * p + b);
  return `#${((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, "0")}`;
};

const CubeBar = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  fillOpacity?: string | number;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, fill = "#000" } = props;
  if (width <= 0 || height <= 0) return null;

  const dx = Math.min(15, Math.max(8, width * 0.45));
  const dy = Math.min(10, Math.max(2, height * 0.2));
  const topY = y - dy;
  const sideX = x + width + dx;
  const bottomY = y + height;

  const stroke = props.stroke ?? "rgba(0, 0, 0, 0.18)";
  const strokeWidth = props.strokeWidth ?? 0.6;
  const opacity = props.fillOpacity ?? 1;

  return (
    <g opacity={opacity}>
      <polygon
        points={`${x},${y} ${x + width},${y} ${sideX},${topY} ${x + dx},${topY}`}
        fill={shadeHex(fill, 0.18)}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <polygon
        points={`${x + width},${y} ${sideX},${topY} ${sideX},${topY + height} ${x + width},${bottomY}`}
        fill={shadeHex(fill, -0.18)}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};

const renderGradientDefs = (
  entries: { gradientId: string; fill: string }[],
) => (
  <defs>
    <filter id="depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow
        dx="0"
        dy="2"
        stdDeviation="1.5"
        floodColor="rgba(0, 0, 0, 0.35)"
      />
    </filter>
    {entries.map((entry) => (
      <linearGradient
        key={entry.gradientId}
        id={entry.gradientId}
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <stop offset="0%" stopColor={shadeHex(entry.fill, 0.25)} />
        <stop offset="55%" stopColor={entry.fill} />
        <stop offset="100%" stopColor={shadeHex(entry.fill, -0.2)} />
      </linearGradient>
    ))}
  </defs>
);

const ProviderCharts = ({
  mode,
  singleData = [],
  compareData = [],
  periodALabel,
  periodBLabel,
}: ProviderChartsProps) => {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  const singleDataWithColors: SingleDataPoint[] = singleData.map((entry) => ({
    ...entry,
    fill:
      PROVIDER_HEX[entry.provider as keyof typeof PROVIDER_HEX] ??
      DEFAULT_COLOR,
    gradientId: `provider-${toId(entry.provider)}`,
  }));

  const compareDataWithColors: CompareDataPoint[] = compareData.map(
    (entry) => ({
      ...entry,
      fill:
        PROVIDER_HEX[entry.provider as keyof typeof PROVIDER_HEX] ??
        DEFAULT_COLOR,
      gradientId: `provider-${toId(entry.provider)}`,
    }),
  );

  const renderSingleBar = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={singleDataWithColors}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" />
        <XAxis
          dataKey="provider"
          stroke="var(--muted-foreground)"
          fontSize={13}
        />
        <YAxis stroke="var(--muted-foreground)" fontSize={13} />
        <Tooltip
          cursor={false}
          contentStyle={{
            border: "unset",
            borderRadius: 8,
          }}
        />
        <Bar
          dataKey="count"
          shape={(props) => (
            <CubeBar {...props} fill={props.payload?.fill ?? "#000"} />
          )}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderCompareBar = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={compareDataWithColors}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" />
        <XAxis
          dataKey="provider"
          stroke="var(--muted-foreground)"
          fontSize={13}
        />
        <YAxis stroke="var(--muted-foreground)" fontSize={13} />
        <Tooltip
          cursor={false}
          contentStyle={{
            border: "unset",
            borderRadius: 8,
          }}
        />
        <Bar
          dataKey="countPeriodA"
          name={periodALabel}
          fill={
            PROVIDER_HEX[periodALabel as keyof typeof PROVIDER_HEX] ??
            DEFAULT_COLOR
          }
          fillOpacity={0.6}
          shape={<CubeBar />}
        />
        <Bar
          dataKey="countPeriodB"
          name={periodBLabel ?? ""}
          fill={
            PROVIDER_HEX[periodBLabel as keyof typeof PROVIDER_HEX] ??
            DEFAULT_COLOR
          }
          shape={<CubeBar />}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSinglePie = () => (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        {renderGradientDefs(singleDataWithColors)}
        <Pie
          data={singleDataWithColors.map((entry) => ({
            ...entry,
            fill: `url(#${entry.gradientId})`,
          }))}
          dataKey="count"
          nameKey="provider"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={60}
          paddingAngle={3}
          label={({ name, percent }) =>
            `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          stroke="rgba(0, 0, 0, 0.18)"
          strokeWidth={0.6}
        ></Pie>
        <Tooltip
          contentStyle={{
            border: "unset",
            borderRadius: 8,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          {mode === "single" ? "Provider Distribution" : "Period Comparison"}
        </CardTitle>
        {mode === "single" && (
          <Tabs
            value={chartType}
            onValueChange={(v) => setChartType(v as "bar" | "pie")}
          >
            <TabsList className="h-8">
              <TabsTrigger value="bar" className="text-xs px-3">
                Bar
              </TabsTrigger>
              <TabsTrigger value="pie" className="text-xs px-3">
                Pie
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      {singleData.length === 0 && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        </CardContent>
      )}
      {singleData.length !== 0 && (
        <CardContent>
          {mode === "single"
            ? chartType === "bar"
              ? renderSingleBar()
              : renderSinglePie()
            : renderCompareBar()}
        </CardContent>
      )}
    </Card>
  );
};

export default ProviderCharts;
