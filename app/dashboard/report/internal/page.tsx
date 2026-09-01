"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ReportResponse = {
  success: boolean;
  hasFinancialData: boolean;
  recordCount: number;
  reportDate: string;

  latest: any;
  previous: any;

  incomeStatement: any;
  balanceSheet: any;
  cashFlow: any;

  comparison: any;
  trends: any[];

  insights: Array<{
    type:
      | "positive"
      | "warning"
      | "attention";
    title: string;
    message: string;
    priority: number;
  }>;

  financialHealth: number | null;
  error?: string;
};

function money(value: number) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(Number(value) || 0);
}

function date(value: string) {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(parsed);
}

function pct(value: number | null) {
  return value === null
    ? "-"
    : `${Number(value).toFixed(2)}%`;
}

function ratio(value: number | null) {
  return value === null
    ? "-"
    : Number(value).toFixed(2);
}

export default function InternalReportPage() {
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
        const response =
          await fetch(
            "/api/report",
            {
              cache: "no-store",
            }
          );

        const result =
          (await response.json()) as ReportResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load internal report."
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
            : "Failed to load internal report."
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
          <h1 className="font-bold text-rose-900">
            Unable to load internal report
          </h1>

          <p className="mt-2 text-sm text-rose-700">
            {error}
          </p>
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
        <Header />

        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-bold">
            No financial data yet
          </h2>
        </div>
      </main>
    );
  }

  const income =
    data.incomeStatement;

  const balance =
    data.balanceSheet;

  const cash =
    data.cashFlow;

  return (
    <main className="report-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Header
        reportDate={data.reportDate}
        recordCount={
          data.recordCount
        }
      />

      <section className="report-section rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 sm:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
              Internal Report
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Detailed Financial Review
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Latest input:{" "}
              <span className="font-semibold text-slate-700">
                {date(
                  data.reportDate
                )}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-6 py-4">
            <p className="text-xs font-semibold text-indigo-600">
              Financial Health
            </p>

            <p className="mt-1 text-3xl font-bold text-indigo-700">
              {data.financialHealth ??
                "-"}
              <span className="text-sm text-indigo-400">
                {" "}
                / 100
              </span>
            </p>
          </div>
        </div>
      </section>

      <Section
        title="Income Statement"
        subtitle="Latest reporting period"
      >
        <Table
          rows={[
            [
              "Revenue",
              money(income.revenue),
            ],
            [
              "Cost of Sales",
              money(
                income.costOfSales
              ),
            ],
            [
              "Gross Profit",
              money(
                income.grossProfit
              ),
            ],
            [
              "Operating Expenses",
              money(
                income.operatingExpenses
              ),
            ],
            [
              "Operating Profit",
              money(
                income.operatingProfit
              ),
            ],
            [
              "Other Income",
              money(
                income.otherIncome
              ),
            ],
            [
              "Other Expenses",
              money(
                income.otherExpenses
              ),
            ],
            [
              "Net Income",
              money(
                income.netIncome
              ),
            ],
            [
              "Gross Margin",
              pct(
                income.grossMargin
              ),
            ],
            [
              "Operating Margin",
              pct(
                income.operatingMargin
              ),
            ],
            [
              "Net Margin",
              pct(
                income.netMargin
              ),
            ],
          ]}
        />
      </Section>

      <Section
        title="Balance Sheet"
        subtitle="Latest snapshot — not cumulative"
      >
        <Table
          rows={[
            [
              "Cash",
              money(balance.cash),
            ],
            [
              "Accounts Receivable",
              money(
                balance.accountsReceivable
              ),
            ],
            [
              "Inventory",
              money(
                balance.inventory
              ),
            ],
            [
              "Other Current Assets",
              money(
                balance.otherCurrentAssets
              ),
            ],
            [
              "Prepaid Expenses",
              money(
                balance.prepaidExpenses
              ),
            ],
            [
              "Current Assets",
              money(
                balance.currentAssets
              ),
            ],
            [
              "Fixed Assets",
              money(
                balance.fixedAssets
              ),
            ],
            [
              "Other Non-current Assets",
              money(
                balance.otherNonCurrentAssets
              ),
            ],
            [
              "Non-current Assets",
              money(
                balance.nonCurrentAssets
              ),
            ],
            [
              "Total Assets",
              money(
                balance.totalAssets
              ),
            ],
            [
              "Accounts Payable",
              money(
                balance.accountsPayable
              ),
            ],
            [
              "Short-term Debt",
              money(
                balance.shortTermDebt
              ),
            ],
            [
              "Accrued Liabilities",
              money(
                balance.accruedLiabilities
              ),
            ],
            [
              "Current Liabilities",
              money(
                balance.currentLiabilities
              ),
            ],
            [
              "Long-term Debt",
              money(
                balance.longTermDebt
              ),
            ],
            [
              "Other Liabilities",
              money(
                balance.otherLiabilities
              ),
            ],
            [
              "Total Liabilities",
              money(
                balance.totalLiabilities
              ),
            ],
            [
              "Share Capital",
              money(
                balance.shareCapital
              ),
            ],
            [
              "Retained Earnings",
              money(
                balance.retainedEarnings
              ),
            ],
            [
              "Other Equity",
              money(
                balance.otherEquity
              ),
            ],
            [
              "Total Equity",
              money(
                balance.totalEquity
              ),
            ],
            [
              "Liabilities + Equity",
              money(
                balance.liabilitiesAndEquity
              ),
            ],
            [
              "Balance Difference",
              money(
                balance.balanceDifference
              ),
            ],
          ]}
        />

        <div className="mt-5">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              balance.balanceStatus ===
              "balanced"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {balance.balanceStatus ===
            "balanced"
              ? "Balanced"
              : "Unbalanced"}
          </span>
        </div>
      </Section>

      <Section
        title="Cash Flow"
        subtitle="Latest cash movement"
      >
        <Table
          rows={[
            [
              "Operating Cash Flow",
              money(
                cash.operatingCashFlow
              ),
            ],
            [
              "Investing Cash Flow",
              money(
                cash.investingCashFlow
              ),
            ],
            [
              "Financing Cash Flow",
              money(
                cash.financingCashFlow
              ),
            ],
            [
              "Net Cash Change",
              money(
                cash.netCashChange
              ),
            ],
            [
              "Cash Balance",
              money(
                cash.cashBalance
              ),
            ],
          ]}
        />
      </Section>

      <Section
        title="Financial Ratios"
        subtitle="Latest calculated ratios"
      >
        <Table
          rows={[
            [
              "Working Capital",
              money(
                balance.workingCapital
              ),
            ],
            [
              "Current Ratio",
              ratio(
                balance.currentRatio
              ),
            ],
            [
              "Quick Ratio",
              ratio(
                balance.quickRatio
              ),
            ],
            [
              "Debt / Equity",
              ratio(
                balance.debtToEquity
              ),
            ],
            [
              "Debt / Assets",
              ratio(
                balance.debtToAssets
              ),
            ],
          ]}
        />
      </Section>

      <Section
        title="Current vs Previous"
        subtitle="Comparison with the previous Quick Input"
      >
        {data.comparison ? (
          <Table
            rows={[
              [
                "Revenue",
                comparisonText(
                  data.comparison.revenue
                ),
              ],
              [
                "Gross Profit",
                comparisonText(
                  data.comparison
                    .grossProfit
                ),
              ],
              [
                "Net Income",
                comparisonText(
                  data.comparison
                    .netIncome
                ),
              ],
              [
                "Cash",
                comparisonText(
                  data.comparison.cash
                ),
              ],
              [
                "Total Assets",
                comparisonText(
                  data.comparison
                    .totalAssets
                ),
              ],
              [
                "Total Liabilities",
                comparisonText(
                  data.comparison
                    .totalLiabilities
                ),
              ],
              [
                "Total Equity",
                comparisonText(
                  data.comparison
                    .totalEquity
                ),
              ],
            ]}
          />
        ) : (
          <p className="text-sm text-slate-500">
            A previous Quick Input is
            required for comparison.
          </p>
        )}
      </Section>

      <Section
        title="Historical Performance"
        subtitle={`${data.trends.length} Quick Input records`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
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
                  Operating Profit
                </th>
                <th className="px-3 py-3">
                  Net Income
                </th>
                <th className="px-3 py-3">
                  Cash
                </th>
                <th className="px-3 py-3">
                  Assets
                </th>
                <th className="px-3 py-3">
                  Liabilities
                </th>
                <th className="px-3 py-3">
                  Equity
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
                    <td className="px-3 py-3 font-medium">
                      {date(
                        item.inputDate
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {money(
                        item.revenue
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {money(
                        item.grossProfit
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {money(
                        item.operatingProfit
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {money(
                        item.netIncome
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {money(
                        item.cash
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {money(
                        item.totalAssets
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {money(
                        item.totalLiabilities
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {money(
                        item.totalEquity
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Insights"
        subtitle="Deterministic financial observations"
      >
        <div className="space-y-3">
          {data.insights.map(
            (item) => (
              <div
                key={`${item.title}-${item.message}`}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-sm font-bold text-slate-800">
                  {item.title}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.message}
                </p>
              </div>
            )
          )}
        </div>
      </Section>

      <section className="report-section rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/report"
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Client Report
          </button>

          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Print Internal Report
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
        </div>
      </section>
    </main>
  );
}

function Header({
  reportDate,
  recordCount,
}: {
  reportDate?: string;
  recordCount?: number;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-slate-500">
        Decisionly
      </p>

      <h1 className="mt-1 text-3xl font-bold text-slate-950">
        Internal Financial Report
      </h1>

      {reportDate ? (
        <p className="mt-2 text-sm text-slate-500">
          Latest reporting date:{" "}
          <span className="font-semibold text-slate-700">
            {date(reportDate)}
          </span>
          {recordCount
            ? ` · ${recordCount} records`
            : ""}
        </p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="report-section rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {subtitle}
      </p>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function Table({
  rows,
}: {
  rows: Array<
    [string, string]
  >;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      {rows.map(
        ([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-6 border-b border-slate-100 px-4 py-3 last:border-0"
          >
            <span className="text-sm text-slate-500">
              {label}
            </span>

            <span className="text-right text-sm font-semibold text-slate-800">
              {value}
            </span>
          </div>
        )
      )}
    </div>
  );
}

function comparisonText(
  item: {
    current: number;
    previous: number;
    change: number;
    changePercent:
      | number
      | null;
  }
) {
  const direction =
    item.change > 0
      ? "↑"
      : item.change < 0
        ? "↓"
        : "→";

  const change =
    item.changePercent ===
    null
      ? "-"
      : `${Math.abs(
          item.changePercent
        ).toFixed(
          1
        )}%`;

  return `${direction} ${money(
    item.change
  )} (${change})`;
}

function Skeleton() {
  return (
    <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
  );
}