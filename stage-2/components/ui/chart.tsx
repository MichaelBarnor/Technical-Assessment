"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { TooltipContentProps } from "recharts";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorEntries = Object.entries(config).filter(([, item]) => item.color);

  if (!colorEntries.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart="${id}"] {
${colorEntries
  .map(([key, item]) => `  --color-${key}: ${item.color};`)
  .join("\n")}
}
`
      }}
    />
  );
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn("chart-container", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          height="100%"
          initialDimension={{ height: 180, width: 640 }}
          minHeight={0}
          minWidth={0}
          width="100%"
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipContentProps = React.ComponentProps<"div"> &
  Partial<TooltipContentProps> & {
    hideLabel?: boolean;
  };

function getPayloadKey(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function formatTooltipValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(" - ");
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      notation: Math.abs(value) >= 10000 ? "compact" : "standard"
    }).format(value);
  }

  return value == null ? "" : String(value);
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, className, hideLabel = false, label, payload, ...props }, ref) => {
    const { config } = useChart();

    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div ref={ref} className={cn("chart-tooltip", className)} {...props}>
        {!hideLabel && label ? (
          <div className="chart-tooltip-label">{label}</div>
        ) : null}
        <div className="chart-tooltip-list">
          {payload.map((item, index) => {
            const dataKey = getPayloadKey(item.dataKey);
            const nameKey = getPayloadKey(item.name);
            const itemConfig = config[dataKey] ?? config[nameKey];
            const indicatorColor =
              item.color ?? item.stroke ?? item.fill ?? `var(--color-${dataKey})`;

            return (
              <div className="chart-tooltip-item" key={`${dataKey || nameKey}-${index}`}>
                <span
                  aria-hidden="true"
                  className="chart-tooltip-indicator"
                  style={{ backgroundColor: indicatorColor }}
                />
                <span className="chart-tooltip-name">
                  {itemConfig?.label ?? item.name ?? dataKey}
                </span>
                <span className="chart-tooltip-value">
                  {formatTooltipValue(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
