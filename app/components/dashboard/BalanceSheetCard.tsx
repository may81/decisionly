"use client";

type BalanceSheetCardData = {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  workingCapital: number;

  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;
  debtToAssets: number | null;

  balanceDifference: number;
  balanceStatus: "balanced" | "unbalanced";
};

type BalanceSheetCardProps = {
  data: BalanceSheetCardData;
  onView: () => void;
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatRatio(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(2);
}

export default function BalanceSheetCard({
  data,
  onView,
}: BalanceSheetCardProps) {
  const isBalanced =
    data.balanceStatus === "balanced";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Financial Position
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Balance Sheet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest Quick Input financial position
          </p>
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-xs font-semibold ${
            isBalanced
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {isBalanced ? "Balanced" : "Review"}
        </div>
      </div>

      {/* PRIMARY METRICS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Metric
          label="Total Assets"
          value={formatIDR(data.totalAssets)}
          accent="indigo"
        />

        <Metric
          label="Total Liabilities"
          value={formatIDR(data.totalLiabilities)}
          accent="rose"
        />

        <Metric
          label="Shareholders' Equity"
          value={formatIDR(data.totalEquity)}
          accent="violet"
        />

        <Metric
          label="Working Capital"
          value={formatIDR(data.workingCapital)}
          accent={
            data.workingCapital >= 0
              ? "emerald"
              : "rose"
          }
        />
      </div>

      {/* RATIOS */}
      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Balance Sheet Indicators
        </p>

        <div className="grid grid-cols-2 gap-3">
          <RatioMetric
            label="Current Ratio"
            value={formatRatio(data.currentRatio)}
            status={
              data.currentRatio === null
                ? "neutral"
                : data.currentRatio >= 1
                  ? "positive"
                  : "negative"
            }
          />

          <RatioMetric
            label="Quick Ratio"
            value={formatRatio(data.quickRatio)}
            status={
              data.quickRatio === null
                ? "neutral"
                : data.quickRatio >= 1
                  ? "positive"
                  : "negative"
            }
          />

          <RatioMetric
            label="Debt / Equity"
            value={formatRatio(data.debtToEquity)}
            status={
              data.debtToEquity === null
                ? "neutral"
                : data.debtToEquity <= 2
                  ? "positive"
                  : "negative"
            }
          />

          <RatioMetric
            label="Debt / Assets"
            value={formatRatio(data.debtToAssets)}
            status={
              data.debtToAssets === null
                ? "neutral"
                : data.debtToAssets <= 0.6
                  ? "positive"
                  : "negative"
            }
          />
        </div>
      </div>

      {/* BALANCE CHECK */}
      <div
        className={`mt-5 rounded-xl border p-4 ${
          isBalanced
            ? "border-emerald-100 bg-emerald-50/60"
            : "border-rose-100 bg-rose-50/60"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wide ${
                isBalanced
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              Balance Check
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              Assets = Liabilities + Equity
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              isBalanced
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {isBalanced ? "OK" : "Check"}
          </span>
        </div>

        {!isBalanced ? (
          <p className="mt-3 text-xs leading-5 text-rose-700">
            Balance difference:{" "}
            <span className="font-semibold">
              {formatIDR(data.balanceDifference)}
            </span>
          </p>
        ) : (
          <p className="mt-3 text-xs leading-5 text-emerald-700">
            The latest financial snapshot is balanced.
          </p>
        )}
      </div>

      {/* ACTION */}
      <button
        type="button"
        onClick={onView}
        className="mt-6 w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
      >
        View Balance Sheet →
      </button>
    </section>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent:
    | "indigo"
    | "emerald"
    | "violet"
    | "rose";
}) {
  const dotClasses = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    violet: "bg-violet-500",
    rose: "bg-rose-500",
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${dotClasses[accent]}`}
        />

        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function RatioMetric({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "positive" | "negative" | "neutral";
}) {
  const valueClasses = {
    positive: "text-emerald-700",
    negative: "text-rose-700",
    neutral: "text-slate-700",
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-bold ${valueClasses[status]}`}
      >
        {value}
      </p>
    </div>
  );
}