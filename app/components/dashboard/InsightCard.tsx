"use client";

type InsightCardData = {
  revenue: number;
  netIncome: number;
  operatingCashFlow: number;

  netMargin: number;

  currentRatio: number | null;
  debtToEquity: number | null;

  balanceStatus: "balanced" | "unbalanced";
};

type InsightCardProps = {
  data: InsightCardData;
  financialHealth: number | null;
  onView: () => void;
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export default function InsightCard({
  data,
  financialHealth,
  onView,
}: InsightCardProps) {
  const profitable =
    data.netIncome > 0;

  const positiveCashFlow =
    data.operatingCashFlow > 0;

  const weakLiquidity =
    data.currentRatio !== null &&
    data.currentRatio < 1;

  const highDebt =
    data.debtToEquity !== null &&
    data.debtToEquity > 2;

  const unbalanced =
    data.balanceStatus !== "balanced";

  /*
   * ==========================================================
   * PRIORITY OF INSIGHT
   * ==========================================================
   *
   * Balance integrity first.
   * Then cash flow.
   * Then profitability.
   * Then liquidity/leverage.
   */

  let headline =
    "Your financial position is stable";

  let sentiment:
    | "Positive"
    | "Attention"
    | "Review" = "Positive";

  let recommendation =
    "Continue monitoring revenue, profitability, liquidity, and operating cash flow.";

  if (unbalanced) {
    headline =
      "Your balance sheet needs review";

    sentiment = "Review";

    recommendation =
      "Review the latest asset, liability, and equity inputs so that the balance sheet remains properly balanced.";
  } else if (!positiveCashFlow) {
    headline =
      "Operating cash flow needs attention";

    sentiment = "Attention";

    recommendation =
      "Review operating expenses, collections, and working capital to protect operating cash flow.";
  } else if (!profitable) {
    headline =
      "Profitability needs attention";

    sentiment = "Attention";

    recommendation =
      "Focus on improving gross margin, controlling operating expenses, and reviewing other income and expenses.";
  } else if (weakLiquidity) {
    headline =
      "Short-term liquidity needs attention";

    sentiment = "Attention";

    recommendation =
      "Monitor current assets and short-term liabilities because current liabilities exceed current assets.";
  } else if (highDebt) {
    headline =
      "Debt levels need monitoring";

    sentiment = "Attention";

    recommendation =
      "Review debt levels and financing structure to reduce balance-sheet pressure.";
  } else if (
    profitable &&
    positiveCashFlow
  ) {
    headline =
      "Your financial position is healthy";

    sentiment = "Positive";

    recommendation =
      "Continue monitoring revenue growth, margins, liquidity, debt levels, and operating cash flow.";
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-white shadow-sm">
            ✦
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Decisionly Insight
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {headline}
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Analysis based on the latest Quick Input
          financial snapshot.
        </p>
      </div>

      <div className="p-6">
        {/* SENTIMENT */}
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
            sentiment === "Positive"
              ? "bg-emerald-50 text-emerald-700"
              : sentiment === "Review"
                ? "bg-rose-50 text-rose-700"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          {sentiment}
        </span>

        {/* KEY METRICS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <InsightMetric
            label="Revenue"
            value={formatIDR(data.revenue)}
            description="Latest input"
          />

          <InsightMetric
            label="Net Margin"
            value={`${data.netMargin.toFixed(1)}%`}
            description="Net profit / revenue"
          />

          <InsightMetric
            label="Operating Cash"
            value={formatIDR(
              data.operatingCashFlow
            )}
            description={
              positiveCashFlow
                ? "Positive cash generation"
                : data.operatingCashFlow < 0
                  ? "Cash outflow"
                  : "No operating cash flow"
            }
          />
        </div>

        {/* RECOMMENDATION */}
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
            Recommended Action
          </p>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
            {recommendation}
          </p>
        </div>

        {/* FINANCIAL HEALTH */}
        {financialHealth !== null ? (
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">
                Financial Health
              </span>

              <span className="text-sm font-bold text-indigo-600">
                {financialHealth} / 100
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      financialHealth
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-500">
              Financial Health
            </span>

            <span className="ml-2 text-sm font-bold text-slate-700">
              —
            </span>
          </div>
        )}

        {/* ACTION */}
        <button
          type="button"
          onClick={onView}
          className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          View Analysis →
        </button>
      </div>
    </section>
  );
}

function InsightMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}