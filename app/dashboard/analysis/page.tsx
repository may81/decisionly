"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ============================================================
   TYPES
   ============================================================ */

type FinancialData = {
  id: string;
  quickInputCode: string;
  companyId: string;
  userId: string;

  inputDate: string;
  createdAt: string;
  updatedAt: string;

  revenue: number;
  costOfSales: number;
  operatingExpenses: number;
  otherIncome: number;
  otherExpenses: number;

  grossProfit: number;
  operatingProfit: number;
  netIncome: number;

  grossMargin: number;
  operatingMargin: number;
  netMargin: number;

  cash: number;
  accountsReceivable: number;
  inventory: number;
  otherCurrentAssets: number;
  prepaidExpenses: number;

  fixedAssets: number;
  otherNonCurrentAssets: number;

  currentAssets: number;
  nonCurrentAssets: number;
  totalAssets: number;

  accountsPayable: number;
  shortTermDebt: number;
  accruedLiabilities: number;
  longTermDebt: number;
  otherLiabilities: number;

  currentLiabilities: number;
  totalLiabilities: number;

  shareCapital: number;
  retainedEarnings: number;
  otherEquity: number;

  totalEquity: number;
  liabilitiesAndEquity: number;

  balanceDifference: number;
  balanceStatus:
    | "balanced"
    | "unbalanced";

  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashChange: number;

  workingCapital: number;

  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;
  debtToAssets: number | null;
};

type ComparisonMetric = {
  current: number;
  previous: number;
  change: number;
  changePercent: number | null;
};

type Comparison = {
  revenue: ComparisonMetric;
  grossProfit: ComparisonMetric;
  netIncome: ComparisonMetric;
  cash: ComparisonMetric;
  totalAssets: ComparisonMetric;
  totalLiabilities: ComparisonMetric;
  totalEquity: ComparisonMetric;
} | null;

type TrendPoint = {
  id: string;
  quickInputCode: string;
  inputDate: string;

  revenue: number;
  grossProfit: number;
  operatingProfit: number;
  netIncome: number;

  cash: number;

  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashChange: number;

  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;

  grossMargin: number;
  operatingMargin: number;
  netMargin: number;

  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;

  revenueDirection:
    | "up"
    | "down"
    | "flat";

  profitDirection:
    | "up"
    | "down"
    | "flat";

  cashDirection:
    | "up"
    | "down"
    | "flat";
};

type Insight = {
  type:
    | "positive"
    | "warning"
    | "attention";

  title: string;
  message: string;
  priority: number;
};

type AnalysisResponse = {
  success: boolean;
  hasFinancialData: boolean;

  companyId: string;
  userId: string;

  recordCount?: number;

  latest: FinancialData | null;
  previous: FinancialData | null;

  incomeStatement: {
    revenue: number;
    costOfSales: number;
    grossProfit: number;
    operatingExpenses: number;
    operatingProfit: number;
    otherIncome: number;
    otherExpenses: number;
    netIncome: number;

    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  } | null;

  balanceSheet: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    otherCurrentAssets: number;
    prepaidExpenses: number;

    currentAssets: number;

    fixedAssets: number;
    otherNonCurrentAssets: number;

    nonCurrentAssets: number;

    totalAssets: number;

    accountsPayable: number;
    shortTermDebt: number;
    accruedLiabilities: number;

    currentLiabilities: number;

    longTermDebt: number;
    otherLiabilities: number;

    totalLiabilities: number;

    shareCapital: number;
    retainedEarnings: number;
    otherEquity: number;

    totalEquity: number;
    liabilitiesAndEquity: number;

    balanceDifference: number;
    balanceStatus:
      | "balanced"
      | "unbalanced";

    workingCapital: number;

    currentRatio: number | null;
    quickRatio: number | null;
    debtToEquity: number | null;
    debtToAssets: number | null;
  } | null;

  cashFlow: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashChange: number;
    cashBalance: number;
  } | null;

  comparison: Comparison;

  trends: TrendPoint[];

  insights: Insight[];

  financialHealth: number | null;

  error?: string;
};

/* ============================================================
   FORMATTERS
   ============================================================ */

function formatIDR(value: number) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number.isFinite(value)
      ? value
      : 0
  );
}

function formatCompactIDR(
  value: number
) {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `${value < 0 ? "-" : ""}Rp ${(
      absolute / 1_000_000_000
    )
      .toFixed(1)
      .replace(".", ",")} M`;
  }

  if (absolute >= 1_000_000) {
    return `${value < 0 ? "-" : ""}Rp ${(
      absolute / 1_000_000
    )
      .toFixed(1)
      .replace(".", ",")} jt`;
  }

  if (absolute >= 1_000) {
    return `${value < 0 ? "-" : ""}Rp ${(
      absolute / 1_000
    )
      .toFixed(0)} rb`;
  }

  return formatIDR(value);
}

function formatDate(
  value: string
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "-";
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

function signedCurrency(
  value: number
) {
  return `${
    value >= 0 ? "+" : "-"
  }${formatIDR(
    Math.abs(value)
  )}`;
}

function formatPercent(
  value: number | null
) {
  if (value === null) {
    return "-";
  }

  return `${
    value >= 0 ? "+" : ""
  }${value.toFixed(1)}%`;
}

/* ============================================================
   PAGE
   ============================================================ */

export default function AnalysisPage() {
  const router = useRouter();

  const [data, setData] =
    useState<AnalysisResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/analysis",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const result =
          (await response.json()) as AnalysisResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load analysis."
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Analysis loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load analysis."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, []);

  const latest =
    data?.latest ?? null;

  const previous =
    data?.previous ?? null;

  const trendData = useMemo(() => {
    if (!data?.trends) {
      return [];
    }

    return data.trends.map(
      (item) => ({
        ...item,
        label: formatDate(
          item.inputDate
        ),
      })
    );
  }, [data]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-32" />

          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>

          <Skeleton className="h-[420px]" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-sm font-semibold text-rose-900">
            Unable to load analysis
          </p>

          <p className="mt-2 text-sm text-rose-700">
            {error}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/analysis/ai"
                )
              }
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              ✦ Ask Decisionly AI →
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (
    !data?.hasFinancialData ||
    !latest ||
    !data.incomeStatement ||
    !data.balanceSheet ||
    !data.cashFlow
  ) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnalysisHeader />

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-emerald-50 p-8">
          <div className="max-w-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
              ✦
            </div>

            <p className="mt-5 text-sm font-semibold text-indigo-600">
              Decisionly Analysis
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              No financial data to analyze yet.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter your first Quick Input
              to generate profitability,
              liquidity, balance sheet,
              cash flow, trend, and
              financial health analysis.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/quickinput"
                )
              }
              className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Enter Quick Input →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <AnalysisHeader
        latest={latest}
        recordCount={
          data.recordCount ??
          data.trends.length
        }
        onBack={() =>
          router.push(
            "/dashboard"
          )
        }
        onNew={() =>
          router.push(
            "/dashboard/quickinput"
          )
        }
      />

      <FinancialHealthCard
        score={
          data.financialHealth
        }
        latest={latest}
      />

      <ExecutiveInsight
        latest={latest}
        previous={previous}
        insights={data.insights}
      />

      <IncomeStatementSection
        data={
          data.incomeStatement
        }
        comparison={
          data.comparison
        }
      />

      <BalanceSheetSection
        data={data.balanceSheet}
        previous={previous}
        comparison={
          data.comparison
        }
      />

      <CashFlowSection
        data={data.cashFlow}
        previous={previous}
      />

      <ComparisonSection
        comparison={
          data.comparison
        }
      />

      <TrendSection
        data={trendData}
      />

      <InsightsSection
        insights={data.insights}
      />
    </main>
  );
}

/* ============================================================
   HEADER
   ============================================================ */

function AnalysisHeader({
  latest,
  recordCount,
  onBack,
  onNew,
}: {
  latest?: FinancialData;
  recordCount?: number;
  onBack?: () => void;
  onNew?: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Decisionly Analysis
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Financial Analysis
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          A complete analysis of
          profitability, financial
          position, cash flow,
          liquidity, leverage, and
          financial trends based on
          your Quick Input history.
        </p>

        {latest ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>
              Latest input:
            </span>

            <span className="font-semibold text-slate-600">
              {formatDate(
                latest.inputDate
              )}
            </span>

            <span>·</span>

            <span>
              {latest.quickInputCode}
            </span>

            {recordCount !==
            undefined ? (
              <>
                <span>·</span>

                <span>
                  {recordCount} input
                  {recordCount === 1
                    ? ""
                    : "s"}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Dashboard
          </button>
        ) : null}

        {onNew ? (
          <button
            type="button"
            onClick={onNew}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            New Quick Input
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ============================================================
   FINANCIAL HEALTH
   ============================================================ */

function FinancialHealthCard({
  score,
  latest,
}: {
  score: number | null;
  latest: FinancialData;
}) {
  const safeScore =
    score === null ? null : score;

  const label =
    safeScore === null
      ? "Not available"
      : safeScore >= 80
        ? "Strong"
        : safeScore >= 60
          ? "Healthy"
          : safeScore >= 40
            ? "Moderate"
            : "Needs Attention";

  const description =
    safeScore === null
      ? "There is not enough financial information to calculate a health score."
      : safeScore >= 80
        ? "The latest financial position shows strong overall fundamentals."
        : safeScore >= 60
          ? "The business shows generally healthy financial fundamentals with areas to monitor."
          : safeScore >= 40
            ? "The business has mixed financial signals and should be monitored closely."
            : "Several financial indicators require management attention.";

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
              Financial Health
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {label}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>

          <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-indigo-100 bg-white">
            <span className="text-3xl font-bold text-indigo-600">
              {safeScore ?? "-"}
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <HealthMini
          label="Net Margin"
          value={`${latest.netMargin.toFixed(
            1
          )}%`}
        />

        <HealthMini
          label="Current Ratio"
          value={
            latest.currentRatio ===
            null
              ? "-"
              : latest.currentRatio.toFixed(
                  2
                )
          }
        />

        <HealthMini
          label="Debt / Equity"
          value={
            latest.debtToEquity ===
            null
              ? "-"
              : latest.debtToEquity.toFixed(
                  2
                )
          }
        />
      </div>
    </section>
  );
}

function HealthMini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   EXECUTIVE INSIGHT
   ============================================================ */

function ExecutiveInsight({
  latest,
  previous,
  insights,
}: {
  latest: FinancialData;
  previous: FinancialData | null;
  insights: Insight[];
}) {
  const primary =
    insights.length > 0
      ? insights[0]
      : null;

  const revenueGrowth =
    previous
      ? percentageChange(
          latest.revenue,
          previous.revenue
        )
      : null;

  const profitGrowth =
    previous
      ? percentageChange(
          latest.netIncome,
          previous.netIncome
        )
      : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-lg text-white">
          ✦
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-indigo-600">
            Decisionly Insight
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {primary?.title ??
              "Financial analysis available"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {primary?.message ??
              "Review the detailed financial indicators below."}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ExecutiveMetric
          label="Revenue"
          value={formatIDR(
            latest.revenue
          )}
          change={formatPercent(
            revenueGrowth
          )}
        />

        <ExecutiveMetric
          label="Net Income"
          value={formatIDR(
            latest.netIncome
          )}
          change={formatPercent(
            profitGrowth
          )}
        />

        <ExecutiveMetric
          label="Operating Cash"
          value={formatIDR(
            latest.operatingCashFlow
          )}
          change={
            latest.operatingCashFlow >=
            0
              ? "Positive"
              : "Negative"
          }
        />

        <ExecutiveMetric
          label="Balance Status"
          value={
            latest.balanceStatus ===
            "balanced"
              ? "Balanced"
              : "Review"
          }
          change=""
        />
      </div>
    </section>
  );
}

function ExecutiveMetric({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-bold text-slate-900">
        {value}
      </p>

      {change ? (
        <p className="mt-1 text-xs font-semibold text-indigo-600">
          {change}
        </p>
      ) : (
        <p className="mt-1 text-xs text-transparent">
          -
        </p>
      )}
    </div>
  );
}

/* ============================================================
   INCOME STATEMENT
   ============================================================ */

function IncomeStatementSection({
  data,
  comparison,
}: {
  data: NonNullable<
    AnalysisResponse["incomeStatement"]
  >;

  comparison: Comparison;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader
        eyebrow="Profitability"
        title="Income Statement Analysis"
        description="Performance for the latest Quick Input period."
      />

      <div className="mt-6 grid gap-3">
        <FinancialRow
          label="Revenue"
          value={data.revenue}
          comparison={
            comparison?.revenue
          }
          positiveWhen="up"
        />

        <FinancialRow
          label="Cost of Sales"
          value={data.costOfSales}
        />

        <FinancialRow
          label="Gross Profit"
          value={data.grossProfit}
          comparison={
            comparison?.grossProfit
          }
          positiveWhen="up"
          strong
        />

        <FinancialRow
          label="Operating Expenses"
          value={
            data.operatingExpenses
          }
        />

        <FinancialRow
          label="Operating Profit"
          value={
            data.operatingProfit
          }
          strong
        />

        <FinancialRow
          label="Other Income"
          value={data.otherIncome}
        />

        <FinancialRow
          label="Other Expenses"
          value={
            data.otherExpenses
          }
        />

        <FinancialRow
          label="Net Income"
          value={data.netIncome}
          comparison={
            comparison?.netIncome
          }
          positiveWhen="up"
          strong
          highlight
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <RatioCard
          label="Gross Margin"
          value={`${data.grossMargin.toFixed(
            1
          )}%`}
        />

        <RatioCard
          label="Operating Margin"
          value={`${data.operatingMargin.toFixed(
            1
          )}%`}
        />

        <RatioCard
          label="Net Margin"
          value={`${data.netMargin.toFixed(
            1
          )}%`}
        />
      </div>
    </section>
  );
}

/* ============================================================
   BALANCE SHEET
   ============================================================ */

function BalanceSheetSection({
  data,
  previous,
  comparison,
}: {
  data: NonNullable<
    AnalysisResponse["balanceSheet"]
  >;

  previous: FinancialData | null;

  comparison: Comparison;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          eyebrow="Financial Position"
          title="Balance Sheet Analysis"
          description="Latest balance-sheet snapshot. Values are not cumulatively added across Quick Inputs."
        />

        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
            data.balanceStatus ===
            "balanced"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {data.balanceStatus ===
          "balanced"
            ? "Balanced"
            : "Needs Review"}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BalanceGroup
          title="Assets"
          rows={[
            [
              "Cash",
              data.cash,
            ],
            [
              "Accounts Receivable",
              data.accountsReceivable,
            ],
            [
              "Inventory",
              data.inventory,
            ],
            [
              "Other Current Assets",
              data.otherCurrentAssets,
            ],
            [
              "Prepaid Expenses",
              data.prepaidExpenses,
            ],
            [
              "Current Assets",
              data.currentAssets,
            ],
            [
              "Fixed Assets",
              data.fixedAssets,
            ],
            [
              "Other Non-current Assets",
              data.otherNonCurrentAssets,
            ],
            [
              "Non-current Assets",
              data.nonCurrentAssets,
            ],
            [
              "Total Assets",
              data.totalAssets,
            ],
          ]}
        />

        <BalanceGroup
          title="Liabilities & Equity"
          rows={[
            [
              "Accounts Payable",
              data.accountsPayable,
            ],
            [
              "Short-term Debt",
              data.shortTermDebt,
            ],
            [
              "Accrued Liabilities",
              data.accruedLiabilities,
            ],
            [
              "Current Liabilities",
              data.currentLiabilities,
            ],
            [
              "Long-term Debt",
              data.longTermDebt,
            ],
            [
              "Other Liabilities",
              data.otherLiabilities,
            ],
            [
              "Total Liabilities",
              data.totalLiabilities,
            ],
            [
              "Share Capital",
              data.shareCapital,
            ],
            [
              "Retained Earnings",
              data.retainedEarnings,
            ],
            [
              "Other Equity",
              data.otherEquity,
            ],
            [
              "Total Equity",
              data.totalEquity,
            ],
            [
              "Liabilities + Equity",
              data.liabilitiesAndEquity,
            ],
          ]}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RatioCard
          label="Working Capital"
          value={formatIDR(
            data.workingCapital
          )}
        />

        <RatioCard
          label="Current Ratio"
          value={
            data.currentRatio ===
            null
              ? "-"
              : data.currentRatio.toFixed(
                  2
                )
          }
        />

        <RatioCard
          label="Quick Ratio"
          value={
            data.quickRatio === null
              ? "-"
              : data.quickRatio.toFixed(
                  2
                )
          }
        />

        <RatioCard
          label="Debt / Equity"
          value={
            data.debtToEquity ===
            null
              ? "-"
              : data.debtToEquity.toFixed(
                  2
                )
          }
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ComparisonNote
          label="Total Assets"
          current={data.totalAssets}
          previous={
            previous?.totalAssets ??
            null
          }
          comparison={
            comparison?.totalAssets
          }
        />

        <ComparisonNote
          label="Total Equity"
          current={data.totalEquity}
          previous={
            previous?.totalEquity ??
            null
          }
          comparison={
            comparison?.totalEquity
          }
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Balance Check
        </p>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-600">
            Assets − Liabilities −
            Equity
          </span>

          <span
            className={`font-bold ${
              data.balanceStatus ===
              "balanced"
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {formatIDR(
              data.balanceDifference
            )}
          </span>
        </div>
      </div>
    </section>
  );
}

function BalanceGroup({
  title,
  rows,
}: {
  title: string;
  rows: Array<
    [string, number]
  >;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <div className="space-y-2">
        {rows.map(
          ([label, value]) => {
            const emphasized =
              label ===
                "Total Assets" ||
              label ===
                "Total Liabilities" ||
              label ===
                "Total Equity" ||
              label ===
                "Liabilities + Equity" ||
              label ===
                "Current Assets" ||
              label ===
                "Current Liabilities";

            return (
              <div
                key={label}
                className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2 ${
                  emphasized
                    ? "bg-slate-50"
                    : ""
                }`}
              >
                <span
                  className={`text-sm ${
                    emphasized
                      ? "font-semibold text-slate-700"
                      : "text-slate-500"
                  }`}
                >
                  {label}
                </span>

                <span
                  className={`text-sm ${
                    emphasized
                      ? "font-bold text-slate-900"
                      : "font-medium text-slate-700"
                  }`}
                >
                  {formatIDR(value)}
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CASH FLOW
   ============================================================ */

function CashFlowSection({
  data,
  previous,
}: {
  data: NonNullable<
    AnalysisResponse["cashFlow"]
  >;

  previous: FinancialData | null;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader
        eyebrow="Liquidity"
        title="Cash Flow Analysis"
        description="Cash movement and latest cash balance."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CashMetric
          label="Operating"
          value={
            data.operatingCashFlow
          }
        />

        <CashMetric
          label="Investing"
          value={
            data.investingCashFlow
          }
        />

        <CashMetric
          label="Financing"
          value={
            data.financingCashFlow
          }
        />

        <CashMetric
          label="Net Cash Change"
          value={
            data.netCashChange
          }
        />
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Cash Balance
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {formatIDR(
                data.cashBalance
              )}
            </p>
          </div>

          {previous ? (
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">
                Previous
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-600">
                {formatIDR(
                  previous.cash
                )}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CashMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          value >= 0
            ? "text-emerald-600"
            : "text-rose-600"
        }`}
      >
        {signedCurrency(value)}
      </p>
    </div>
  );
}

/* ============================================================
   COMPARISON
   ============================================================ */

function ComparisonSection({
  comparison,
}: {
  comparison: Comparison;
}) {
  if (!comparison) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          eyebrow="Period Comparison"
          title="Comparison"
          description="A comparison becomes available after at least two Quick Input records."
        />

        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-600">
            Add another Quick Input
            to compare financial
            changes over time.
          </p>
        </div>
      </section>
    );
  }

  const items = [
    [
      "Revenue",
      comparison.revenue,
    ],
    [
      "Gross Profit",
      comparison.grossProfit,
    ],
    [
      "Net Income",
      comparison.netIncome,
    ],
    [
      "Cash",
      comparison.cash,
    ],
    [
      "Total Assets",
      comparison.totalAssets,
    ],
    [
      "Total Liabilities",
      comparison.totalLiabilities,
    ],
    [
      "Total Equity",
      comparison.totalEquity,
    ],
  ] as const;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader
        eyebrow="Period Comparison"
        title="Latest vs Previous"
        description="Changes compare the latest Quick Input with the immediately preceding input."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(
          ([label, metric]) => (
            <ComparisonCard
              key={label}
              label={label}
              metric={metric}
            />
          )
        )}
      </div>
    </section>
  );
}

function ComparisonCard({
  label,
  metric,
}: {
  label: string;
  metric: ComparisonMetric;
}) {
  const positive =
    metric.change > 0;

  const negative =
    metric.change < 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">
            Previous
          </p>

          <p className="font-semibold text-slate-700">
            {formatCompactIDR(
              metric.previous
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-400">
            Current
          </p>

          <p className="font-bold text-slate-900">
            {formatCompactIDR(
              metric.current
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Change
          </span>

          <span
            className={`text-sm font-bold ${
              positive
                ? "text-emerald-600"
                : negative
                  ? "text-rose-600"
                  : "text-slate-500"
            }`}
          >
            {signedCurrency(
              metric.change
            )}
          </span>
        </div>

        <p
          className={`mt-1 text-xs font-semibold ${
            positive
              ? "text-emerald-600"
              : negative
                ? "text-rose-600"
                : "text-slate-400"
          }`}
        >
          {metric.changePercent ===
          null
            ? "Percentage change unavailable"
            : `${
                metric.changePercent >=
                0
                  ? "+"
                  : ""
              }${metric.changePercent.toFixed(
                1
              )}%`}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   TREND
   ============================================================ */

function TrendSection({
  data,
}: {
  data: Array<
    TrendPoint & {
      label: string;
    }
  >;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <SectionHeader
          eyebrow="Historical Performance"
          title="Financial Trends"
          description="Historical Quick Input records are shown chronologically."
        />

        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          {data.length} input
          {data.length === 1
            ? ""
            : "s"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-5 text-xs">
        <Legend
          label="Revenue"
          className="bg-indigo-500"
        />

        <Legend
          label="Net Income"
          className="bg-emerald-500"
        />

        <Legend
          label="Cash"
          className="bg-violet-500"
        />
      </div>

      <div className="mt-6 h-[340px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
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
            />

            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#6366f1"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="netIncome"
              name="Net Income"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="cash"
              name="Cash"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.length === 1 ? (
        <p className="mt-3 text-xs text-slate-400">
          Add more Quick Input
          records to develop the
          financial trend.
        </p>
      ) : null}
    </section>
  );
}

/* ============================================================
   INSIGHTS
   ============================================================ */

function InsightsSection({
  insights,
}: {
  insights: Insight[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <SectionHeader
        eyebrow="Decision Support"
        title="Financial Insights"
        description="Automated observations based on the latest financial position and recent changes."
      />

      {insights.length === 0 ? (
        <div className="mt-5 rounded-xl bg-slate-50 p-5">
          <p className="text-sm text-slate-600">
            No specific insights
            were generated from the
            available data.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {insights.map(
            (
              insight,
              index
            ) => (
              <InsightItem
                key={`${insight.title}-${index}`}
                insight={insight}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}

function InsightItem({
  insight,
}: {
  insight: Insight;
}) {
  const classes =
    insight.type ===
    "positive"
      ? {
          wrapper:
            "border-emerald-100 bg-emerald-50/60",
          icon:
            "bg-emerald-100 text-emerald-700",
          title:
            "text-emerald-900",
        }
      : insight.type ===
          "warning"
        ? {
            wrapper:
              "border-amber-100 bg-amber-50/60",
            icon:
              "bg-amber-100 text-amber-700",
            title:
              "text-amber-900",
          }
        : {
            wrapper:
              "border-rose-100 bg-rose-50/60",
            icon:
              "bg-rose-100 text-rose-700",
            title:
              "text-rose-900",
          };

  return (
    <div
      className={`rounded-xl border p-5 ${classes.wrapper}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${classes.icon}`}
        >
          {insight.type ===
          "positive"
            ? "✓"
            : insight.type ===
                "warning"
              ? "!"
              : "•"}
        </div>

        <div>
          <h3
            className={`text-sm font-bold ${classes.title}`}
          >
            {insight.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {insight.message}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   REUSABLE COMPONENTS
   ============================================================ */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function FinancialRow({
  label,
  value,
  comparison,
  positiveWhen,
  strong = false,
  highlight = false,
}: {
  label: string;
  value: number;
  comparison?: ComparisonMetric;
  positiveWhen?:
    | "up"
    | "down";
  strong?: boolean;
  highlight?: boolean;
}) {
  const positive =
    comparison &&
    comparison.change > 0;

  const negative =
    comparison &&
    comparison.change < 0;

  let changeClass =
    "text-slate-400";

  if (comparison) {
    if (
      positiveWhen === "up"
    ) {
      changeClass = positive
        ? "text-emerald-600"
        : negative
          ? "text-rose-600"
          : "text-slate-400";
    } else if (
      positiveWhen === "down"
    ) {
      changeClass = negative
        ? "text-emerald-600"
        : positive
          ? "text-rose-600"
          : "text-slate-400";
    }
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        highlight
          ? "bg-indigo-50"
          : strong
            ? "bg-slate-50"
            : "border-b border-slate-100"
      }`}
    >
      <span
        className={`text-sm ${
          strong || highlight
            ? "font-bold text-slate-800"
            : "font-medium text-slate-600"
        }`}
      >
        {label}
      </span>

      <div className="flex items-center gap-4">
        {comparison ? (
          <span
            className={`text-xs font-semibold ${changeClass}`}
          >
            {comparison.changePercent ===
            null
              ? "—"
              : `${
                  comparison.changePercent >=
                  0
                    ? "+"
                    : ""
                }${comparison.changePercent.toFixed(
                  1
                )}%`}
          </span>
        ) : null}

        <span
          className={`text-sm ${
            strong || highlight
              ? "font-bold text-slate-900"
              : "font-semibold text-slate-700"
          }`}
        >
          {formatIDR(value)}
        </span>
      </div>
    </div>
  );
}

function RatioCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ComparisonNote({
  label,
  current,
  previous,
  comparison,
}: {
  label: string;
  current: number;
  previous: number | null;
  comparison?: ComparisonMetric;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>

        {comparison ? (
          <span
            className={`text-xs font-bold ${
              comparison.change >= 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {comparison.changePercent ===
            null
              ? "—"
              : `${
                  comparison.changePercent >=
                  0
                    ? "+"
                    : ""
                }${comparison.changePercent.toFixed(
                  1
                )}%`}
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-slate-400">
            Current
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatCompactIDR(
              current
            )}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-slate-400">
            Previous
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {previous === null
              ? "-"
              : formatCompactIDR(
                  previous
                )}
          </p>
        </div>
      </div>
    </div>
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

function Skeleton({
  className,
}: {
  className: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-100 ${className}`}
    />
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function percentageChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) {
    return null;
  }

  return (
    ((current - previous) /
      Math.abs(previous)) *
    100
  );
}