"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PerformancePoint = {
  inputDate: string;
  createdAt: string;

  revenue: number;
  netIncome: number;
  cash: number;
};

type PerformanceChartProps = {
  data: PerformancePoint[];
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(
    Number.isFinite(value)
      ? value
      : 0
  );
}

function formatCompactIDR(value: number) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Rp 0";
  }

  const absolute = Math.abs(number);
  const sign = number < 0 ? "-" : "";

  if (absolute >= 1_000_000_000) {
    return `${sign}Rp ${(
      absolute / 1_000_000_000
    )
      .toFixed(1)
      .replace(".", ",")} M`;
  }

  if (absolute >= 1_000_000) {
    return `${sign}Rp ${(
      absolute / 1_000_000
    )
      .toFixed(1)
      .replace(".", ",")} jt`;
  }

  if (absolute >= 1_000) {
    return `${sign}Rp ${(
      absolute / 1_000
    ).toFixed(0)} rb`;
  }

  return formatIDR(number);
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

export default function PerformanceChart({
  data,
}: PerformanceChartProps) {
  const chartData = data.map(
    (item) => ({
      ...item,
      label: formatDate(
        item.inputDate
      ),
    })
  );

  const hasData =
    chartData.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Performance
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Financial Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Revenue, profit and cash trend from Quick Input history
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          {chartData.length}{" "}
          {chartData.length === 1
            ? "input"
            : "inputs"}
        </div>
      </div>

      {/* LEGEND */}
      <div className="mt-6 flex flex-wrap gap-5 text-xs">
        <Legend
          label="Revenue"
          className="bg-indigo-500"
        />

        <Legend
          label="Profit"
          className="bg-emerald-500"
        />

        <Legend
          label="Cash"
          className="bg-violet-400"
        />
      </div>

      {/* NO DATA */}
      {!hasData ? (
        <div className="mt-6 flex h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              No performance data
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Enter a Quick Input to begin tracking financial performance.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 h-[320px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                }}
                tickFormatter={(value) =>
                  formatCompactIDR(
                    Number(value)
                  )
                }
              />

              <Tooltip
                formatter={(
                  value,
                  name
                ) => [
                  formatIDR(
                    Number(value)
                  ),
                  String(name),
                ]}
                labelFormatter={(label) =>
                  `Input: ${label}`
                }
              />

              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
              />

              <Line
                type="monotone"
                dataKey="netIncome"
                name="Profit"
                stroke="#10b981"
                strokeWidth={3}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
              />

              <Line
                type="monotone"
                dataKey="cash"
                name="Cash"
                stroke="#a78bfa"
                strokeWidth={3}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* HISTORY EXPLANATION */}
      {chartData.length === 1 ? (
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Only one Quick Input record is available.
          Add another Quick Input to see the financial trend develop.
        </p>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Each point represents one Quick Input financial snapshot,
          ordered from the oldest input to the newest input.
        </p>
      )}
    </section>
  );
}

function Legend({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${className}`}
      />

      <span className="text-slate-600">
        {label}
      </span>
    </div>
  );
}