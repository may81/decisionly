"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type InsightType =
  | "positive"
  | "warning"
  | "attention";

type Insight = {
  type: InsightType;
  title: string;
  message: string;
  priority: number;
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
  aiAnalysis: any;

  error?: string;
};

function money(value: number | null | undefined) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}

function number(value: number | null | undefined) {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function date(value: string | null | undefined) {
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

function percent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${number(value).toFixed(1)}%`;
}

function ratio(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return number(value).toFixed(2);
}

function changePercent(
  current: number | null | undefined,
  previous: number | null | undefined
) {
  const currentValue = number(current);
  const previousValue = number(previous);

  if (previousValue === 0) {
    return null;
  }

  return (
    ((currentValue - previousValue) /
      Math.abs(previousValue)) *
    100
  );
}

function changeLabel(
  current: number | null | undefined,
  previous: number | null | undefined
) {
  const change = changePercent(
    current,
    previous
  );

  if (change === null) {
    return "No prior period";
  }

  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

function getHealthStatus(
  type: "profitability" | "cash" | "liquidity" | "leverage" | "balance",
  latest: any
) {
  if (type === "profitability") {
    if (number(latest?.netMargin) >= 15) {
      return {
        label: "Strong",
        tone: "positive",
      };
    }

    if (number(latest?.netMargin) > 0) {
      return {
        label: "Positive",
        tone: "positive",
      };
    }

    return {
      label: "Needs attention",
      tone: "negative",
    };
  }

  if (type === "cash") {
    if (number(latest?.operatingCashFlow) > 0) {
      return {
        label: "Positive",
        tone: "positive",
      };
    }

    return {
      label: "Needs attention",
      tone: "negative",
    };
  }

  if (type === "liquidity") {
    const currentRatio = latest?.currentRatio;

    if (
      currentRatio !== null &&
      currentRatio !== undefined &&
      number(currentRatio) >= 2
    ) {
      return {
        label: "Strong",
        tone: "positive",
      };
    }

    if (
      currentRatio !== null &&
      currentRatio !== undefined &&
      number(currentRatio) >= 1
    ) {
      return {
        label: "Adequate",
        tone: "neutral",
      };
    }

    return {
      label: "Needs attention",
      tone: "negative",
    };
  }

  if (type === "leverage") {
    const debtToEquity = latest?.debtToEquity;

    if (
      debtToEquity !== null &&
      debtToEquity !== undefined &&
      number(debtToEquity) <= 1
    ) {
      return {
        label: "Healthy",
        tone: "positive",
      };
    }

    if (
      debtToEquity !== null &&
      debtToEquity !== undefined &&
      number(debtToEquity) <= 2
    ) {
      return {
        label: "Moderate",
        tone: "neutral",
      };
    }

    return {
      label: "High",
      tone: "negative",
    };
  }

  if (
    latest?.balanceStatus ===
    "balanced"
  ) {
    return {
      label: "Balanced",
      tone: "positive",
    };
  }

  return {
    label: "Requires review",
    tone: "negative",
  };
}

function toneClasses(
  tone: string
) {
  if (tone === "positive") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (tone === "negative") {
    return "bg-rose-50 text-rose-700 border-rose-100";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

function insightTone(type: InsightType) {
  if (type === "positive") {
    return {
      dot: "bg-emerald-500",
      border: "border-emerald-100",
      bg: "bg-emerald-50/60",
    };
  }

  if (type === "warning") {
    return {
      dot: "bg-amber-500",
      border: "border-amber-100",
      bg: "bg-amber-50/60",
    };
  }

  return {
    dot: "bg-rose-500",
    border: "border-rose-100",
    bg: "bg-rose-50/60",
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

        const response = await fetch(
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

  const commentary = useMemo(() => {
    if (!data?.latest) {
      return "";
    }

    const latest = data.latest;

    const revenue = money(
      latest.revenue
    );

    const netMargin = percent(
      latest.netMargin
    );

    const operatingCashFlow = money(
      latest.operatingCashFlow
    );

    const liquidity =
      latest.currentRatio !== null &&
      latest.currentRatio !== undefined
        ? ratio(latest.currentRatio)
        : "-";

    const balance =
      latest.balanceStatus ===
      "balanced"
        ? "The balance sheet is balanced."
        : "The balance sheet requires review.";

    if (
      number(latest.netIncome) > 0 &&
      number(latest.operatingCashFlow) > 0
    ) {
      return `The business generated ${revenue} of revenue with a ${netMargin} net margin. Operating activities generated ${operatingCashFlow} of cash, while the current ratio of ${liquidity} indicates adequate short-term liquidity. ${balance}`;
    }

    if (
      number(latest.netIncome) > 0
    ) {
      return `The business is currently profitable, generating ${revenue} of revenue and a ${netMargin} net margin. Liquidity and cash generation should continue to be monitored as additional reporting periods become available. ${balance}`;
    }

    return `The current reporting period shows areas that require management attention. Review profitability, operating cash flow, liquidity, and the underlying balance-sheet composition before making major financial decisions. ${balance}`;
  }, [data]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-72" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-rose-600">
            Report Error
          </p>

          <h1 className="mt-2 text-2xl font-bold text-rose-950">
            Unable to load report
          </h1>

          <p className="mt-2 text-sm leading-6 text-rose-700">
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
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ReportHeader />

        <EmptyReport
          onQuickInput={() =>
            router.push(
              "/dashboard/quickinput"
            )
          }
        />
      </main>
    );
  }

  const latest = data.latest;
  const income = data.incomeStatement;
  const balance = data.balanceSheet;
  const cashFlow = data.cashFlow;
  const previous = data.previous;

  const profitabilityStatus =
    getHealthStatus(
      "profitability",
      latest
    );

  const cashStatus =
    getHealthStatus(
      "cash",
      latest
    );

  const liquidityStatus =
    getHealthStatus(
      "liquidity",
      latest
    );

  const leverageStatus =
    getHealthStatus(
      "leverage",
      latest
    );

  const balanceStatus =
    getHealthStatus(
      "balance",
      latest
    );

  const hasHistory =
    data.recordCount > 1;

  const revenueChange =
    previous
      ? changePercent(
          latest.revenue,
          previous.revenue
        )
      : null;

  const netIncomeChange =
    previous
      ? changePercent(
          latest.netIncome,
          previous.netIncome
        )
      : null;

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

      {/* ======================================================
          COVER / EXECUTIVE SUMMARY
      ====================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_300px]">
          <div className="p-7 sm:p-9">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                Client Financial Report
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Financial Overview
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              A concise view of profitability,
              financial position, liquidity,
              cash flow, and key management
              considerations for the latest
              reporting period.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Reporting date
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {date(
                    data.reportDate
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Reporting records
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {data.recordCount} Quick Input{" "}
                  {data.recordCount === 1
                    ? "record"
                    : "records"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-slate-950 p-7 text-white sm:p-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Financial Health
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-tight">
                  {data.financialHealth ??
                    "-"}
                </span>

                <span className="pb-1 text-sm text-slate-400">
                  / 100
                </span>
              </div>
            </div>

            <div className="mt-8">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        number(
                          data.financialHealth
                        )
                      )
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                Current-position indicator based
                on profitability, cash generation,
                liquidity, leverage, and balance
                sheet integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          KPI GRID
      ====================================================== */}

      <section>
        <SectionHeading
          eyebrow="Executive Summary"
          title="Key financial indicators"
          subtitle="The numbers that matter most for the current reporting period."
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Revenue"
            value={money(
              latest.revenue
            )}
            change={
              previous
                ? changeLabel(
                    latest.revenue,
                    previous.revenue
                  )
                : undefined
            }
            changePositive={
              revenueChange !== null
                ? revenueChange >= 0
                : undefined
            }
          />

          <KpiCard
            label="Net Income"
            value={money(
              latest.netIncome
            )}
            change={
              previous
                ? changeLabel(
                    latest.netIncome,
                    previous.netIncome
                  )
                : undefined
            }
            changePositive={
              netIncomeChange !== null
                ? netIncomeChange >= 0
                : undefined
            }
          />

          <KpiCard
            label="Net Margin"
            value={percent(
              latest.netMargin
            )}
            helper="Profitability"
          />

          <KpiCard
            label="Operating Cash Flow"
            value={money(
              latest.operatingCashFlow
            )}
            helper={
              latest.operatingCashFlow >=
              0
                ? "Cash generated"
                : "Cash consumed"
            }
            valuePositive={
              latest.operatingCashFlow >=
              0
            }
          />
        </div>
      </section>

      {/* ======================================================
          EXECUTIVE COMMENTARY
      ====================================================== */}

      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <span className="text-lg font-bold">
              i
            </span>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
              Executive Commentary
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              What the current numbers indicate
            </h2>

            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              {commentary}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          PROFITABILITY
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <SectionHeading
          eyebrow="Profitability"
          title="Income statement"
          subtitle="How revenue converted into operating and net profit."
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
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
              negative
            />

            <FinancialRow
              label="Gross Profit"
              value={money(
                income.grossProfit
              )}
              strong
            />

            <FinancialRow
              label="Gross Margin"
              value={percent(
                income.grossMargin
              )}
            />

            <div className="my-3 border-t border-dashed border-slate-200" />

            <FinancialRow
              label="Operating Expenses"
              value={money(
                income.operatingExpenses
              )}
              negative
            />

            <FinancialRow
              label="Operating Profit"
              value={money(
                income.operatingProfit
              )}
              strong
            />

            <FinancialRow
              label="Operating Margin"
              value={percent(
                income.operatingMargin
              )}
            />

            <div className="my-3 border-t border-dashed border-slate-200" />

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
              negative
            />

            <FinancialRow
              label="Net Income"
              value={money(
                income.netIncome
              )}
              strong
              highlight
            />

            <FinancialRow
              label="Net Margin"
              value={percent(
                income.netMargin
              )}
              strong
            />
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Profitability assessment
            </p>

            <div className="mt-4">
              <StatusBadge
                label={
                  profitabilityStatus.label
                }
                tone={
                  profitabilityStatus.tone
                }
              />
            </div>

            <div className="mt-5 space-y-4">
              <MiniMetric
                label="Gross margin"
                value={percent(
                  income.grossMargin
                )}
              />

              <MiniMetric
                label="Operating margin"
                value={percent(
                  income.operatingMargin
                )}
              />

              <MiniMetric
                label="Net margin"
                value={percent(
                  income.netMargin
                )}
              />
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              Margins show how effectively
              revenue is converted into profit at
              each stage of the income statement.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINANCIAL POSITION
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <SectionHeading
          eyebrow="Financial Position"
          title="Balance sheet"
          subtitle="Current assets, liabilities, equity, and balance-sheet integrity."
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <ReportSubheading
              title="Assets"
              total={money(
                balance.totalAssets
              )}
            />

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
              label="Other Current Assets"
              value={money(
                balance.otherCurrentAssets
              )}
            />

            <FinancialRow
              label="Prepaid Expenses"
              value={money(
                balance.prepaidExpenses
              )}
            />

            <FinancialRow
              label="Current Assets"
              value={money(
                balance.currentAssets
              )}
              strong
            />

            <div className="my-3 border-t border-dashed border-slate-200" />

            <FinancialRow
              label="Fixed Assets"
              value={money(
                balance.fixedAssets
              )}
            />

            <FinancialRow
              label="Other Non-current Assets"
              value={money(
                balance.otherNonCurrentAssets
              )}
            />

            <FinancialRow
              label="Non-current Assets"
              value={money(
                balance.nonCurrentAssets
              )}
              strong
            />

            <FinancialRow
              label="Total Assets"
              value={money(
                balance.totalAssets
              )}
              strong
              highlight
            />
          </div>

          <div>
            <ReportSubheading
              title="Liabilities & Equity"
              total={money(
                balance.liabilitiesAndEquity
              )}
            />

            <FinancialRow
              label="Accounts Payable"
              value={money(
                balance.accountsPayable
              )}
            />

            <FinancialRow
              label="Short-term Debt"
              value={money(
                balance.shortTermDebt
              )}
            />

            <FinancialRow
              label="Accrued Liabilities"
              value={money(
                balance.accruedLiabilities
              )}
            />

            <FinancialRow
              label="Current Liabilities"
              value={money(
                balance.currentLiabilities
              )}
              strong
            />

            <div className="my-3 border-t border-dashed border-slate-200" />

            <FinancialRow
              label="Long-term Debt"
              value={money(
                balance.longTermDebt
              )}
            />

            <FinancialRow
              label="Other Liabilities"
              value={money(
                balance.otherLiabilities
              )}
            />

            <FinancialRow
              label="Total Liabilities"
              value={money(
                balance.totalLiabilities
              )}
              strong
            />

            <div className="my-3 border-t border-dashed border-slate-200" />

            <FinancialRow
              label="Share Capital"
              value={money(
                balance.shareCapital
              )}
            />

            <FinancialRow
              label="Retained Earnings"
              value={money(
                balance.retainedEarnings
              )}
            />

            <FinancialRow
              label="Other Equity"
              value={money(
                balance.otherEquity
              )}
            />

            <FinancialRow
              label="Total Equity"
              value={money(
                balance.totalEquity
              )}
              strong
            />

            <FinancialRow
              label="Liabilities + Equity"
              value={money(
                balance.liabilitiesAndEquity
              )}
              strong
              highlight
            />
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricBox
            label="Working Capital"
            value={money(
              balance.workingCapital
            )}
          />

          <MetricBox
            label="Current Ratio"
            value={`${ratio(
              balance.currentRatio
            )}x`}
          />

          <MetricBox
            label="Quick Ratio"
            value={`${ratio(
              balance.quickRatio
            )}x`}
          />

          <MetricBox
            label="Debt / Equity"
            value={`${ratio(
              balance.debtToEquity
            )}x`}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">
              Balance sheet integrity
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Assets should equal liabilities plus
              equity.
            </p>
          </div>

          <StatusBadge
            label={
              balance.balanceStatus ===
              "balanced"
                ? "Balance Sheet Balanced"
                : "Requires Review"
            }
            tone={
              balance.balanceStatus ===
              "balanced"
                ? "positive"
                : "negative"
            }
          />
        </div>
      </section>

      {/* ======================================================
          LIQUIDITY / LEVERAGE
      ====================================================== */}

      <section>
        <SectionHeading
          eyebrow="Financial Structure"
          title="Liquidity and leverage"
          subtitle="Indicators of short-term financial capacity and debt exposure."
        />

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <HealthMetricCard
            label="Liquidity"
            value={`${ratio(
              balance.currentRatio
            )}x`}
            status={
              liquidityStatus.label
            }
            tone={
              liquidityStatus.tone
            }
            description="Current assets relative to current liabilities."
          />

          <HealthMetricCard
            label="Quick Liquidity"
            value={`${ratio(
              balance.quickRatio
            )}x`}
            status="Quick measure"
            tone="neutral"
            description="Cash and receivables relative to current liabilities."
          />

          <HealthMetricCard
            label="Debt / Equity"
            value={`${ratio(
              balance.debtToEquity
            )}x`}
            status={
              leverageStatus.label
            }
            tone={
              leverageStatus.tone
            }
            description="Debt exposure relative to shareholders' equity."
          />

          <HealthMetricCard
            label="Debt / Assets"
            value={`${ratio(
              balance.debtToAssets
            )}x`}
            status="Capital structure"
            tone="neutral"
            description="Debt relative to the company's total asset base."
          />
        </div>
      </section>

      {/* ======================================================
          CASH FLOW
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <SectionHeading
          eyebrow="Cash Flow"
          title="Movement of cash"
          subtitle="Cash generated or consumed by operating, investing, and financing activities."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <CashFlowCard
            label="Operating Activities"
            value={money(
              cashFlow.operatingCashFlow
            )}
            positive={
              cashFlow.operatingCashFlow >=
              0
            }
            description="Cash generated from core operating activities."
          />

          <CashFlowCard
            label="Investing Activities"
            value={money(
              cashFlow.investingCashFlow
            )}
            positive={
              cashFlow.investingCashFlow >=
              0
            }
            description="Cash movement related to investments and assets."
          />

          <CashFlowCard
            label="Financing Activities"
            value={money(
              cashFlow.financingCashFlow
            )}
            positive={
              cashFlow.financingCashFlow >=
              0
            }
            description="Cash movement from debt and equity financing."
          />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Net cash change
              </p>

              <p
                className={`mt-2 text-3xl font-bold ${
                  cashFlow.netCashChange >=
                  0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {money(
                  cashFlow.netCashChange
                )}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-slate-400">
                Ending cash balance
              </p>

              <p className="mt-1 text-xl font-bold">
                {money(
                  cashFlow.cashBalance
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <StatusBadge
              label={cashStatus.label}
              tone={cashStatus.tone}
            />

            <p className="text-sm text-slate-600">
              {cashFlow.operatingCashFlow >=
              0
                ? "Core operations are generating cash."
                : "Core operations are consuming cash."}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINANCIAL HEALTH
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <SectionHeading
          eyebrow="Financial Health"
          title="Current-position assessment"
          subtitle="A transparent breakdown of the factors contributing to the overall score."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <HealthBreakdown
            label="Profitability"
            status={
              profitabilityStatus.label
            }
            tone={
              profitabilityStatus.tone
            }
            detail={`Net margin ${percent(
              latest.netMargin
            )}`}
          />

          <HealthBreakdown
            label="Cash Generation"
            status={cashStatus.label}
            tone={cashStatus.tone}
            detail={`OCF ${money(
              latest.operatingCashFlow
            )}`}
          />

          <HealthBreakdown
            label="Liquidity"
            status={
              liquidityStatus.label
            }
            tone={
              liquidityStatus.tone
            }
            detail={`Current ratio ${ratio(
              latest.currentRatio
            )}x`}
          />

          <HealthBreakdown
            label="Leverage"
            status={
              leverageStatus.label
            }
            tone={
              leverageStatus.tone
            }
            detail={`Debt / equity ${ratio(
              latest.debtToEquity
            )}x`}
          />

          <HealthBreakdown
            label="Balance Sheet"
            status={
              balanceStatus.label
            }
            tone={
              balanceStatus.tone
            }
            detail={
              latest.balanceStatus ===
              "balanced"
                ? "Assets = liabilities + equity"
                : "Difference requires review"
            }
          />
        </div>

        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
            Important context
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {data.recordCount === 1
              ? "The current health score reflects the latest financial position only. Additional reporting periods are required to assess the sustainability of trends over time."
              : "The health score reflects the latest financial position, while historical records provide additional context for performance trends."}
          </p>
        </div>
      </section>

      {/* ======================================================
          INSIGHTS
      ====================================================== */}

      <section>
        <SectionHeading
          eyebrow="Decision Support"
          title="Key insights"
          subtitle="Deterministic observations derived from the financial data."
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {data.insights
            .slice(0, 6)
            .map((insight) => {
              const tone =
                insightTone(
                  insight.type
                );

              return (
                <div
                  key={`${insight.title}-${insight.message}`}
                  className={`rounded-2xl border ${tone.border} ${tone.bg} p-5`}
                >
                  <div className="flex gap-4">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`}
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {insight.title}
                        </h3>

                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          {insight.type}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

          {data.insights.length ===
            0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 lg:col-span-2">
              No additional insights are
              available for this reporting period.
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          MANAGEMENT RECOMMENDATIONS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <SectionHeading
          eyebrow="Management Focus"
          title="Recommended actions"
          subtitle="Practical areas to monitor based on the current financial position."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Recommendation
            number="01"
            title="Protect profitability"
            message={`Maintain the current ${percent(
              latest.netMargin
            )} net margin by monitoring gross margin and operating expenses.`}
          />

          <Recommendation
            number="02"
            title="Monitor working capital"
            message={`Current liquidity is ${liquidityStatus.label.toLowerCase()} with a current ratio of ${ratio(
              latest.currentRatio
            )}x. Continue monitoring receivables, inventory, and short-term obligations.`}
          />

          <Recommendation
            number="03"
            title="Review cash allocation"
            message={`Operating cash flow is ${money(
              latest.operatingCashFlow
            )}. Review how investing and financing activities affect the overall cash position.`}
          />

          <Recommendation
            number="04"
            title="Build reporting history"
            message={
              hasHistory
                ? "Continue recording reporting periods so management can identify meaningful trends and changes."
                : "Add additional reporting periods before drawing conclusions about long-term financial trends."
            }
          />
        </div>
      </section>

      {/* ======================================================
          PERFORMANCE HISTORY
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <SectionHeading
          eyebrow="Performance History"
          title="Historical reporting periods"
          subtitle={
            hasHistory
              ? "Comparison of available Quick Input reporting periods."
              : "Additional periods are required to establish a meaningful performance trend."
          }
        />

        {!hasHistory ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm font-bold text-slate-700">
              Trend analysis is not available yet
            </p>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Decisionly currently has one
              reporting period. Add another Quick
              Input record to compare revenue,
              profit, cash, and financial ratios
              over time.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-400">
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
                    Net Margin
                  </th>

                  <th className="px-3 py-3">
                    Cash
                  </th>

                  <th className="px-3 py-3">
                    Current Ratio
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
                      <td className="px-3 py-3 font-semibold text-slate-700">
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

                      <td className="px-3 py-3 font-semibold text-slate-700">
                        {percent(
                          item.netMargin
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {money(
                          item.cash
                        )}
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {ratio(
                          item.currentRatio
                        )}
                        x
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ======================================================
          REPORT ACTIONS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <SectionHeading
          eyebrow="Report Actions"
          title="Review and export"
          subtitle="Continue reviewing the report or move to internal analysis."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton
            onClick={() =>
              window.print()
            }
            variant="primary"
          >
            Print Report
          </ActionButton>

          <ActionButton
            onClick={() =>
              router.push(
                "/api/report/export/pdf"
              )
            }
            variant="indigo"
          >
            Export pdf
          </ActionButton>

           <ActionButton
            onClick={() =>
              router.push(
                "/api/report/export/excel"
              )
            }
            variant="indigo"
          >
            Export Excel
          </ActionButton>

          <ActionButton
            onClick={() =>
              router.push(
                "/dashboard/report/internal"
              )
            }
            variant="indigo"
          >
            Internal Report →
          </ActionButton>
        </div>
      </section>

      <footer className="pb-6 text-center text-xs text-slate-400">
        Decisionly Financial Report ·
        Generated from Quick Input financial
        data · {date(data.reportDate)}
      </footer>
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
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Decisionly
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
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
              ? ` · ${recordCount} Quick Input ${
                  recordCount === 1
                    ? "record"
                    : "records"
                }`
              : ""}
          </p>
        ) : null}
      </div>

      {onInternal ? (
        <button
          type="button"
          onClick={onInternal}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Internal Report →
        </button>
      ) : null}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  change,
  changePositive,
  helper,
  valuePositive,
}: {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  helper?: string;
  valuePositive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold tracking-tight ${
          valuePositive === true
            ? "text-emerald-600"
            : valuePositive === false
            ? "text-rose-600"
            : "text-slate-950"
        }`}
      >
        {value}
      </p>

      {change ? (
        <p
          className={`mt-2 text-xs font-semibold ${
            changePositive
              ? "text-emerald-600"
              : "text-rose-600"
          }`}
        >
          {change} vs previous period
        </p>
      ) : helper ? (
        <p className="mt-2 text-xs text-slate-400">
          {helper}
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-400">
          Latest reporting period
        </p>
      )}
    </div>
  );
}

function FinancialRow({
  label,
  value,
  strong = false,
  negative = false,
  highlight = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0 ${
        highlight
          ? "rounded-lg bg-slate-50 px-3"
          : ""
      }`}
    >
      <span
        className={`text-sm ${
          strong
            ? "font-semibold text-slate-800"
            : "text-slate-500"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-sm ${
          strong
            ? "font-bold text-slate-950"
            : negative
            ? "font-medium text-rose-600"
            : "font-semibold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ReportSubheading({
  title,
  total,
}: {
  title: string;
  total: string;
}) {
  return (
    <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
        {title}
      </h3>

      <span className="text-sm font-bold text-slate-950">
        {total}
      </span>
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
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
    <div className="flex items-center justify-between border-b border-slate-200 pb-3 last:border-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-sm font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${toneClasses(
        tone
      )}`}
    >
      {label}
    </span>
  );
}

function HealthMetricCard({
  label,
  value,
  status,
  tone,
  description,
}: {
  label: string;
  value: string;
  status: string;
  tone: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-slate-950">
        {value}
      </p>

      <div className="mt-3">
        <StatusBadge
          label={status}
          tone={tone}
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function HealthBreakdown({
  label,
  status,
  tone,
  detail,
}: {
  label: string;
  status: string;
  tone: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-700">
        {label}
      </p>

      <div className="mt-3">
        <StatusBadge
          label={status}
          tone={tone}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function CashFlowCard({
  label,
  value,
  positive,
  description,
}: {
  label: string;
  value: string;
  positive: boolean;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${
          positive
            ? "text-emerald-600"
            : "text-rose-600"
        }`}
      >
        {value}
      </p>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Recommendation({
  number,
  title,
  message,
}: {
  number: string;
  title: string;
  message: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  variant,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant:
    | "primary"
    | "secondary"
    | "indigo";
}) {
  const classes =
    variant === "primary"
      ? "bg-slate-950 text-white hover:bg-slate-800"
      : variant === "indigo"
      ? "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
      : "border border-slate-200 bg-slate-100 text-slate-400";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${classes} ${
        disabled
          ? "cursor-not-allowed"
          : ""
      }`}
    >
      {children}
    </button>
  );
}

function EmptyReport({
  onQuickInput,
}: {
  onQuickInput: () => void;
}) {
  return (
    <div className="mt-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-10">
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
        Financial Report
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        No financial data yet
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
        Enter your first Quick Input before
        generating a financial report. Once
        financial data is available, Decisionly
        will calculate profitability, liquidity,
        cash flow, financial health, and
        management insights.
      </p>

      <button
        type="button"
        onClick={onQuickInput}
        className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Enter Quick Input →
      </button>
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