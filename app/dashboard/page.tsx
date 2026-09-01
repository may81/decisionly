"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type InsightType =
  | "positive"
  | "warning"
  | "attention";

type RecommendationPriority =
  | "high"
  | "medium"
  | "low";

type Insight = {
  type: InsightType;
  title: string;
  message: string;
  priority: number;
};

type Recommendation = {
  priority: RecommendationPriority;
  title: string;
  message: string;
};

type ReportResponse = {
  success: boolean;
  hasFinancialData: boolean;
  companyId: string;
  userId: string;
  recordCount: number;
  reportDate: string;

  latest: any;
  previous: any;

  incomeStatement: any;
  balanceSheet: any;
  cashFlow: any;

  comparison: any;
  trends: any[];

  insights: Insight[];

  financialHealth: number | null;
  financialHealthLabel?: string;
  financialHealthStatus?:
    | "healthy"
    | "watch"
    | "attention";

  executiveSummary?: {
    headline: string;
    message: string;
    positiveSignals: string[];
    attentionSignals: string[];
  };

  recommendations?: Recommendation[];

  aiAnalysis: any;

  error?: string;
};

function money(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(
    Number.isFinite(Number(value))
      ? Number(value)
      : 0
  );
}

function date(value: string) {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function percent(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${Number(value).toFixed(1)}%`;
}

function ratio(value: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return Number(value).toFixed(2);
}

function healthStatusClasses(
  status?: ReportResponse["financialHealthStatus"]
) {
  if (status === "healthy") {
    return {
      wrapper:
        "border-emerald-200 bg-emerald-50",
      label: "text-emerald-700",
      score: "text-emerald-900",
      badge:
        "bg-emerald-100 text-emerald-700",
    };
  }

  if (status === "watch") {
    return {
      wrapper:
        "border-amber-200 bg-amber-50",
      label: "text-amber-700",
      score: "text-amber-900",
      badge:
        "bg-amber-100 text-amber-700",
    };
  }

  return {
    wrapper:
      "border-rose-200 bg-rose-50",
    label: "text-rose-700",
    score: "text-rose-900",
    badge:
      "bg-rose-100 text-rose-700",
  };
}

function priorityClasses(
  priority: RecommendationPriority
) {
  if (priority === "high") {
    return {
      badge:
        "bg-rose-50 text-rose-700",
      border:
        "border-rose-100",
    };
  }

  if (priority === "medium") {
    return {
      badge:
        "bg-amber-50 text-amber-700",
      border:
        "border-amber-100",
    };
  }

  return {
    badge:
      "bg-emerald-50 text-emerald-700",
    border:
      "border-emerald-100",
  };
}

export default function ReportPage() {
  const router = useRouter();

  const [data, setData] =
    useState<ReportResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch("/api/report", {
            cache: "no-store",
          });

        const result =
          (await response.json()) as ReportResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load report."
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load report."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-5">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
            Financial Report
          </p>

          <h1 className="mt-1 text-xl font-bold text-rose-900">
            Unable to load report
          </h1>

          <p className="mt-2 text-sm text-rose-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (
    !data?.hasFinancialData ||
    !data.latest
  ) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <ReportHeader />

        <EmptyReport />
      </main>
    );
  }

  const income =
    data.incomeStatement;

  const balance =
    data.balanceSheet;

  const cashFlow =
    data.cashFlow;

  const healthClasses =
    healthStatusClasses(
      data.financialHealthStatus
    );

  const recommendations =
    data.recommendations ?? [];

  const executiveSummary =
    data.executiveSummary;

  return (
    <main className="report-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <ReportHeader
        reportDate={data.reportDate}
        recordCount={data.recordCount}
        onInternal={() =>
          router.push(
            "/dashboard/report/internal"
          )
        }
      />

      {/* =====================================================
          REPORT COVER / OVERVIEW
          ===================================================== */}

      <section className="report-section overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_280px]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Client Financial Report
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Financial Overview
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              A decision-oriented overview of the
              latest financial position, profitability,
              liquidity, leverage, and cash flow.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <InfoPill
                label="Reporting date"
                value={date(
                  data.reportDate
                )}
              />

              <InfoPill
                label="Quick Inputs"
                value={String(
                  data.recordCount
                )}
              />
            </div>
          </div>

          <div
            className={`border-t p-6 lg:border-l lg:border-t-0 ${healthClasses.wrapper}`}
          >
            <p
              className={`text-xs font-bold uppercase tracking-wide ${healthClasses.label}`}
            >
              Financial Health
            </p>

            <div className="mt-3 flex items-end gap-2">
              <span
                className={`text-5xl font-black tracking-tight ${healthClasses.score}`}
              >
                {data.financialHealth ??
                  "-"}
              </span>

              <span className="mb-1 text-sm font-semibold text-slate-500">
                / 100
              </span>
            </div>

            <div className="mt-4">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${healthClasses.badge}`}
              >
                {data.financialHealthLabel ??
                  "Financial Health"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXECUTIVE SUMMARY
          ===================================================== */}

      {executiveSummary ? (
        <section className="report-section rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8">
          <SectionTitle
            title="Executive Summary"
            subtitle="What the current financial data means"
          />

          <div className="mt-6">
            <h2 className="text-xl font-bold text-slate-950">
              {executiveSummary.headline}
            </h2>

            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              {executiveSummary.message}
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {executiveSummary
              .positiveSignals.length >
            0 ? (
              <SignalPanel
                title="Positive signals"
                type="positive"
                items={
                  executiveSummary.positiveSignals
                }
              />
            ) : null}

            {executiveSummary
              .attentionSignals.length >
            0 ? (
              <SignalPanel
                title="Areas to monitor"
                type="attention"
                items={
                  executiveSummary.attentionSignals
                }
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* =====================================================
          KEY METRICS
          ===================================================== */}

      <section className="report-section">
        <SectionTitle
          title="Key Financial Metrics"
          subtitle="Latest reporting period"
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Revenue"
            value={money(
              income.revenue
            )}
          />

          <MetricCard
            label="Net Income"
            value={money(
              income.netIncome
            )}
            tone={
              income.netIncome >= 0
                ? "positive"
                : "negative"
            }
          />

          <MetricCard
            label="Operating Cash Flow"
            value={money(
              cashFlow.operatingCashFlow
            )}
            tone={
              cashFlow.operatingCashFlow >= 0
                ? "positive"
                : "negative"
            }
          />

          <MetricCard
            label="Working Capital"
            value={money(
              balance.workingCapital
            )}
            tone={
              balance.workingCapital >= 0
                ? "positive"
                : "negative"
            }
          />
        </div>
      </section>

      {/* =====================================================
          INCOME + BALANCE
          ===================================================== */}

      <section className="report-section grid gap-6 lg:grid-cols-2">
        <SummaryCard
          title="Income Statement"
          subtitle="Latest reporting period"
        >
          <FinancialRow
            label="Revenue"
            value={money(
              income.revenue
            )}
          />

          <FinancialRow
            label="Cost of Sales"
            value={money(
              income.costOfSales
            )}
          />

          <FinancialRow
            label="Gross Profit"
            value={money(
              income.grossProfit
            )}
            strong
          />

          <FinancialRow
            label="Operating Expenses"
            value={money(
              income.operatingExpenses
            )}
          />

          <FinancialRow
            label="Operating Profit"
            value={money(
              income.operatingProfit
            )}
            strong
          />

          <FinancialRow
            label="Other Income"
            value={money(
              income.otherIncome
            )}
          />

          <FinancialRow
            label="Other Expenses"
            value={money(
              income.otherExpenses
            )}
          />

          <FinancialRow
            label="Net Income"
            value={money(
              income.netIncome
            )}
            strong
          />

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniMetric
              label="Gross Margin"
              value={percent(
                income.grossMargin
              )}
            />

            <MiniMetric
              label="Operating Margin"
              value={percent(
                income.operatingMargin
              )}
            />

            <MiniMetric
              label="Net Margin"
              value={percent(
                income.netMargin
              )}
            />
          </div>
        </SummaryCard>

        <SummaryCard
          title="Balance Sheet"
          subtitle="Latest financial position"
        >
          <FinancialRow
            label="Cash"
            value={money(
              balance.cash
            )}
          />

          <FinancialRow
            label="Accounts Receivable"
            value={money(
              balance.accountsReceivable
            )}
          />

          <FinancialRow
            label="Inventory"
            value={money(
              balance.inventory
            )}
          />

          <FinancialRow
            label="Current Assets"
            value={money(
              balance.currentAssets
            )}
          />

          <FinancialRow
            label="Non-current Assets"
            value={money(
              balance.nonCurrentAssets
            )}
          />

          <FinancialRow
            label="Total Assets"
            value={money(
              balance.totalAssets
            )}
            strong
          />

          <FinancialRow
            label="Current Liabilities"
            value={money(
              balance.currentLiabilities
            )}
          />

          <FinancialRow
            label="Total Liabilities"
            value={money(
              balance.totalLiabilities
            )}
          />

          <FinancialRow
            label="Total Equity"
            value={money(
              balance.totalEquity
            )}
            strong
          />

          <div className="mt-4">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                balance.balanceStatus ===
                "balanced"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {balance.balanceStatus ===
              "balanced"
                ? "Balance Sheet Balanced"
                : "Balance Sheet Requires Review"}
            </span>
          </div>
        </SummaryCard>
      </section>

      {/* =====================================================
          CASH FLOW
          ===================================================== */}

      <section className="report-section rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionTitle
          title="Cash Flow"
          subtitle="Latest cash movement"
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Operating"
            value={money(
              cashFlow.operatingCashFlow
            )}
            positive={
              cashFlow.operatingCashFlow >=
              0
            }
          />

          <StatCard
            label="Investing"
            value={money(
              cashFlow.investingCashFlow
            )}
          />

          <StatCard
            label="Financing"
            value={money(
              cashFlow.financingCashFlow
            )}
          />

          <StatCard
            label="Cash Balance"
            value={money(
              cashFlow.cashBalance
            )}
          />
        </div>

        <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Net Cash Change
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Operating + investing + financing
              cash flows
            </p>
          </div>

          <span
            className={`text-2xl font-black ${
              cashFlow.netCashChange >= 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {money(
              cashFlow.netCashChange
            )}
          </span>
        </div>
      </section>

      {/* =====================================================
          RATIOS
          ===================================================== */}

      <section className="report-section rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionTitle
          title="Key Financial Ratios"
          subtitle="Indicators of liquidity and leverage"
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RatioCard
            label="Current Ratio"
            value={ratio(
              balance.currentRatio
            )}
            description="Short-term liquidity"
          />

          <RatioCard
            label="Quick Ratio"
            value={ratio(
              balance.quickRatio
            )}
            description="Liquid asset coverage"
          />

          <RatioCard
            label="Debt / Equity"
            value={ratio(
              balance.debtToEquity
            )}
            description="Financial leverage"
          />

          <RatioCard
            label="Debt / Assets"
            value={ratio(
              balance.debtToAssets
            )}
            description="Asset financing by debt"
          />
        </div>
      </section>

      {/* =====================================================
          PERFORMANCE
          ===================================================== */}

      <section className="report-section rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionTitle
          title="Performance"
          subtitle="Historical Quick Input records"
        />

        {data.trends.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">
                    Date
                  </th>

                  <th className="px-3 py-3">
                    Revenue
                  </th>

                  <th className="px-3 py-3">
                    Gross Profit
                  </th>

                  <th className="px-3 py-3">
                    Net Income
                  </th>

                  <th className="px-3 py-3">
                    Cash
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.trends.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-3 font-medium text-slate-700">
                        {date(
                          item.inputDate
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {money(
                          item.revenue
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {money(
                          item.grossProfit
                        )}
                      </td>

                      <td
                        className={`px-3 py-3 font-semibold ${
                          item.netIncome >=
                          0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {money(
                          item.netIncome
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {money(
                          item.cash
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            No historical performance data is
            available yet.
          </p>
        )}
      </section>

      {/* =====================================================
          INSIGHTS
          ===================================================== */}

      <section className="report-section rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-6 shadow-sm sm:p-8">
        <SectionTitle
          title="Key Insights"
          subtitle="Deterministic analysis based on financial data"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.insights
            .slice(0, 6)
            .map((insight) => (
              <InsightCard
                key={`${insight.title}-${insight.message}`}
                insight={insight}
              />
            ))}
        </div>
      </section>

      {/* =====================================================
          RECOMMENDATIONS
          ===================================================== */}

      <section className="report-section rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionTitle
          title="Recommended Actions"
          subtitle="Practical actions based on the current financial position"
        />

        <div className="mt-6 space-y-4">
          {recommendations.map(
            (recommendation, index) => {
              const classes =
                priorityClasses(
                  recommendation.priority
                );

              return (
                <div
                  key={`${recommendation.title}-${index}`}
                  className={`rounded-2xl border p-5 ${classes.border}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {recommendation.title}
                      </h3>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {recommendation.message}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${classes.badge}`}
                    >
                      {recommendation.priority}
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* =====================================================
          ACTIONS
          ===================================================== */}

      <section className="report-section rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionTitle
          title="Report Actions"
          subtitle="Export and review options"
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Print Report
          </button>

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
          >
            PDF — Coming Next
          </button>

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
          >
            Excel — Coming Next
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/report/internal"
              )
            }
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Internal Report →
          </button>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function ReportHeader({
  reportDate,
  recordCount,
  onInternal,
}: {
  reportDate?: string;
  recordCount?: number;
  onInternal?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-slate-500">
          Decisionly
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Financial Report
        </h1>

        {reportDate ? (
          <p className="mt-2 text-sm text-slate-500">
            Latest reporting date:{" "}
            <span className="font-semibold text-slate-700">
              {date(reportDate)}
            </span>

            {typeof recordCount ===
            "number"
              ? ` · ${recordCount} Quick Input record${
                  recordCount === 1
                    ? ""
                    : "s"
                }`
              : ""}
          </p>
        ) : null}
      </div>

      {onInternal ? (
        <button
          type="button"
          onClick={onInternal}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Internal Report →
        </button>
      ) : null}
    </div>
  );
}

function InfoPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?:
    | "neutral"
    | "positive"
    | "negative";
}) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
      ? "text-rose-600"
      : "text-slate-950";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-3 text-xl font-black tracking-tight ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <SectionTitle
        title={title}
        subtitle={subtitle}
      />

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}

function FinancialRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span
        className={`text-sm ${
          strong
            ? "font-semibold text-slate-700"
            : "text-slate-500"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-sm ${
          strong
            ? "font-bold text-slate-950"
            : "font-semibold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-3 text-lg font-black ${
          positive === true
            ? "text-emerald-600"
            : positive === false
            ? "text-rose-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function RatioCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-indigo-600">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InsightCard({
  insight,
}: {
  insight: Insight;
}) {
  const positive =
    insight.type === "positive";

  const warning =
    insight.type === "warning";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        positive
          ? "border-emerald-100 bg-emerald-50/50"
          : warning
          ? "border-amber-100 bg-amber-50/50"
          : "border-rose-100 bg-rose-50/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
            positive
              ? "bg-emerald-500"
              : warning
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
        />

        <div>
          <p className="text-sm font-bold text-slate-900">
            {insight.title}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}

function SignalPanel({
  title,
  type,
  items,
}: {
  title: string;
  type: "positive" | "attention";
  items: string[];
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        type === "positive"
          ? "border-emerald-100 bg-white"
          : "border-amber-100 bg-white"
      }`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-wide ${
          type === "positive"
            ? "text-emerald-600"
            : "text-amber-600"
        }`}
      >
        {title}
      </p>

      <ul className="mt-3 space-y-2">
        {items.map(
          (item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-2 text-sm leading-6 text-slate-600"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />

              <span>{item}</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function EmptyReport() {
  return (
    <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
        Financial Report
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        No financial data yet
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
        Enter your first Quick Input before
        generating a financial report.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="h-48 animate-pulse rounded-3xl bg-slate-100" />
  );
}