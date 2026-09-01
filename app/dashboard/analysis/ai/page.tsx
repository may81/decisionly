"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

type AnyRecord = Record<string, any>;

type ApiResponse = {
  success?: boolean;
  hasFinancialData?: boolean;
  companyId?: string;
  userId?: string;
  recordCount?: number;
  latest?: AnyRecord | null;
  previous?: AnyRecord | null;
  trend?: AnyRecord[];
  analysis?: AnyRecord | string | null;
  generatedAt?: string;
  error?: string;
};

type MetricTone =
  | "positive"
  | "negative"
  | "neutral"
  | "warning";

function pick<T = any>(
  obj: AnyRecord | null | undefined,
  ...keys: string[]
): T | null {
  if (!obj) return null;

  for (const key of keys) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null
    ) {
      return obj[key] as T;
    }
  }

  return null;
}

function num(
  obj: AnyRecord | null | undefined,
  ...keys: string[]
): number {
  const value = pick(obj, ...keys);
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function nullableNum(
  obj: AnyRecord | null | undefined,
  ...keys: string[]
): number | null {
  const value = pick(obj, ...keys);

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function text(
  obj: AnyRecord | null | undefined,
  ...keys: string[]
): string {
  const value = pick(obj, ...keys);

  return value === null ||
    value === undefined
    ? ""
    : String(value);
}

function formatCurrency(
  value: number,
  currency = "IDR"
) {
  try {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(value);
  } catch {
    return new Intl.NumberFormat(
      "id-ID",
      {
        maximumFractionDigits: 0,
      }
    ).format(value);
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatPercent(
  value: number | null
) {
  if (value === null) return "—";

  return `${value.toFixed(1)}%`;
}

function formatRatio(
  value: number | null
) {
  if (value === null) return "—";

  return value.toFixed(2);
}

function formatDate(value: unknown) {
  if (!value) return "—";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function relativeChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null;

  return (
    ((current - previous) /
      Math.abs(previous)) *
    100
  );
}

function getTone(
  value: number | null,
  inverse = false
): MetricTone {
  if (value === null) return "neutral";

  if (inverse) {
    if (value < 0) return "positive";
    if (value > 0) return "negative";
    return "neutral";
  }

  if (value > 0) return "positive";
  if (value < 0) return "negative";

  return "neutral";
}

function toneClasses(
  tone: MetricTone
) {
  switch (tone) {
    case "positive":
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border:
          "border-emerald-100",
      };

    case "negative":
      return {
        text: "text-rose-600",
        bg: "bg-rose-50",
        border:
          "border-rose-100",
      };

    case "warning":
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border:
          "border-amber-100",
      };

    default:
      return {
        text: "text-slate-600",
        bg: "bg-slate-50",
        border:
          "border-slate-100",
      };
  }
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "spark"
    | "refresh"
    | "arrow"
    | "trend"
    | "cash"
    | "chart"
    | "shield"
    | "bolt"
    | "check"
    | "warning"
    | "info";
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />
          <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
          <path d="M21 19v-5h-5" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "trend":
      return (
        <svg {...common}>
          <path d="M4 17 9 12l4 3 7-8" />
          <path d="M16 7h4v4" />
        </svg>
      );

    case "cash":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="2"
          />
          <path d="M7 12h.01M17 12h.01" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-4 3 2 5-6" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.2 8.6-8 10-4.8-1.4-8-5-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "bolt":
      return (
        <svg {...common}>
          <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </svg>
      );
  }
}

function MetricCard({
  label,
  value,
  sublabel,
  tone = "neutral",
  icon,
  change,
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: MetricTone;
  icon: React.ReactNode;
  change?: number | null;
}) {
  const colors = toneClasses(tone);

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>

          {sublabel && (
            <p className="mt-1 text-xs text-slate-500">
              {sublabel}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}
        >
          {icon}
        </div>
      </div>

      {change !== undefined &&
        change !== null && (
          <div
            className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            <span>
              {change > 0
                ? "+"
                : ""}
              {change.toFixed(1)}%
            </span>

            <span className="text-slate-400">
              vs previous
            </span>
          </div>
        )}
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
            {icon}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {children}
      </div>
    </section>
  );
}

function BulletList({
  items,
  tone = "neutral",
}: {
  items: string[];
  tone?: MetricTone;
}) {
  if (!items.length) {
    return (
      <p className="text-sm text-slate-400">
        No additional observations available.
      </p>
    );
  }

  const colors = toneClasses(tone);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex gap-3"
        >
          <span
            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.text}`}
          >
            <Icon
              name={
                tone === "negative"
                  ? "warning"
                  : "check"
              }
              className="h-3.5 w-3.5"
            />
          </span>

          <p className="text-sm leading-6 text-slate-600">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

function normalizeItems(
  value: unknown
): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (
          typeof item === "string"
        ) {
          return item;
        }

        if (
          item &&
          typeof item === "object"
        ) {
          const obj =
            item as AnyRecord;

          return (
            obj.text ||
            obj.message ||
            obj.description ||
            obj.title ||
            ""
          );
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((item) =>
        item
          .replace(
            /^[-•*]\s*/,
            ""
          )
          .replace(
            /^\d+[.)]\s*/,
            ""
          )
          .trim()
      )
      .filter(Boolean);
  }

  return [];
}

function extractAnalysis(
  analysis: unknown
) {
  if (
    analysis &&
    typeof analysis === "object"
  ) {
    const a =
      analysis as AnyRecord;

    return {
      executiveSummary:
        normalizeItems(
          a.executiveSummary ??
            a.executive_summary ??
            a.summary
        ),

      financialPerformance:
        normalizeItems(
          a.financialPerformance ??
            a.financial_performance ??
            a.performance
        ),

      liquidity:
        normalizeItems(
          a.liquidity
        ),

      balanceSheet:
        normalizeItems(
          a.balanceSheet ??
            a.balance_sheet
        ),

      cashFlow:
        normalizeItems(
          a.cashFlow ??
            a.cash_flow
        ),

      trend:
        normalizeItems(
          a.trend
        ),

      risks:
        normalizeItems(
          a.risks ??
            a.keyRisks ??
            a.key_risks
        ),

      opportunities:
        normalizeItems(
          a.opportunities
        ),

      actions:
        normalizeItems(
          a.actions ??
            a.recommendedActions ??
            a.recommended_actions
        ),
    };
  }

  const raw =
    typeof analysis === "string"
      ? analysis
      : "";

  if (!raw) {
    return {
      executiveSummary: [],
      financialPerformance: [],
      liquidity: [],
      balanceSheet: [],
      cashFlow: [],
      trend: [],
      risks: [],
      opportunities: [],
      actions: [],
    };
  }

  const sections = {
    executiveSummary: [],
    financialPerformance: [],
    liquidity: [],
    balanceSheet: [],
    cashFlow: [],
    trend: [],
    risks: [],
    opportunities: [],
    actions: [],
  } as Record<
    string,
    string[]
  >;

  const mapping: Record<
    string,
    keyof typeof sections
  > = {
    "EXECUTIVE SUMMARY":
      "executiveSummary",
    "FINANCIAL PERFORMANCE":
      "financialPerformance",
    LIQUIDITY: "liquidity",
    "BALANCE SHEET":
      "balanceSheet",
    "CASH FLOW": "cashFlow",
    TREND: "trend",
    "KEY RISKS": "risks",
    OPPORTUNITIES:
      "opportunities",
    "RECOMMENDED ACTIONS":
      "actions",
  };

  let current:
    keyof typeof sections | null =
    null;

  for (const line of raw.split("\n")) {
    const trimmed = line
      .replace(/\r/g, "")
      .trim();

    const normalized =
      trimmed
        .replace(
          /^#+\s*/,
          ""
        )
        .replace(
          /\*\*/g,
          ""
        )
        .trim()
        .toUpperCase();

    if (mapping[normalized]) {
      current = mapping[normalized];
      continue;
    }

    if (current && trimmed) {
      const cleaned = trimmed
        .replace(
          /^[-•*]\s*/,
          ""
        )
        .replace(
          /^\d+[.)]\s*/,
          ""
        )
        .replace(
          /^\\-\s*/,
          ""
        )
        .trim();

      if (cleaned) {
        sections[current].push(
          cleaned
        );
      }
    }
  }

  return sections;
}

export default function AIAnalysisPage() {
  const [data, setData] =
    useState<ApiResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadAnalysis =
    useCallback(
      async (
        isRefresh = false
      ) => {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const response =
            await fetch(
              "/api/ai-analysis",
              {
                method: "GET",
                cache: "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const raw =
            await response.text();

          let payload:
            | ApiResponse
            | null = null;

          try {
            payload = raw
              ? JSON.parse(raw)
              : null;
          } catch {
            console.error(
              "Invalid JSON from /api/ai:",
              raw
            );

            throw new Error(
              `The analysis service returned invalid JSON (HTTP ${response.status}).`
            );
          }

          if (!response.ok) {
            throw new Error(
              payload?.error ||
                `Analysis service failed with HTTP ${response.status}.`
            );
          }

          if (
            !payload ||
            payload.success !== true
          ) {
            throw new Error(
              payload?.error ||
                "The analysis service returned an unsuccessful response."
            );
          }

          setData(payload);
        } catch (err) {
          console.error(
            "AI analysis load error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load financial analysis."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const latest =
    data?.latest ?? null;

  const previous =
    data?.previous ?? null;

  const recordCount =
    data?.recordCount ??
    data?.trend?.length ??
    0;

  const currency = "IDR";

  const revenue = num(
    latest,
    "revenue"
  );

  const grossProfit = num(
    latest,
    "grossProfit",
    "gross_profit"
  );

  const operatingProfit = num(
    latest,
    "operatingProfit",
    "operating_profit"
  );

  const netIncome = num(
    latest,
    "netIncome",
    "net_income"
  );

  const grossMargin =
    nullableNum(
      latest,
      "grossMargin",
      "gross_margin"
    ) ??
    (revenue
      ? (grossProfit /
          revenue) *
        100
      : 0);

  const operatingMargin =
    nullableNum(
      latest,
      "operatingMargin",
      "operating_margin"
    ) ??
    (revenue
      ? (operatingProfit /
          revenue) *
        100
      : 0);

  const netMargin =
    nullableNum(
      latest,
      "netMargin",
      "net_margin"
    ) ??
    (revenue
      ? (netIncome /
          revenue) *
        100
      : 0);

  const cash = num(
    latest,
    "cash",
    "cashBalance",
    "cash_balance"
  );

  const operatingCashFlow =
    num(
      latest,
      "operatingCashFlow",
      "operating_cash_flow"
    );

  const investingCashFlow =
    num(
      latest,
      "investingCashFlow",
      "investing_cash_flow"
    );

  const financingCashFlow =
    num(
      latest,
      "financingCashFlow",
      "financing_cash_flow"
    );

  const totalAssets = num(
    latest,
    "totalAssets",
    "total_assets"
  );

  const totalLiabilities =
    num(
      latest,
      "totalLiabilities",
      "total_liabilities"
    );

  const totalEquity = num(
    latest,
    "totalEquity",
    "total_equity"
  );

  const workingCapital =
    nullableNum(
      latest,
      "workingCapital",
      "working_capital"
    );

  const currentRatio =
    nullableNum(
      latest,
      "currentRatio",
      "current_ratio"
    );

  const quickRatio =
    nullableNum(
      latest,
      "quickRatio",
      "quick_ratio"
    );

  const debtToEquity =
    nullableNum(
      latest,
      "debtToEquity",
      "debt_to_equity"
    );

  const debtToAssets =
    nullableNum(
      latest,
      "debtToAssets",
      "debt_to_assets"
    );

  const balanceDifference =
    num(
      latest,
      "balanceDifference",
      "balance_difference"
    );

  const balanceStatus =
    text(
      latest,
      "balanceStatus",
      "balance_status"
    ).toLowerCase();

  const inputDate = text(
    latest,
    "inputDate",
    "input_date"
  );

  const inputCode = text(
    latest,
    "quickInputCode",
    "quick_input_code"
  );

  const revenueChange =
    previous
      ? relativeChange(
          revenue,
          num(
            previous,
            "revenue"
          )
        )
      : null;

  const profitChange =
    previous
      ? relativeChange(
          netIncome,
          num(
            previous,
            "netIncome",
            "net_income"
          )
        )
      : null;

  const cashChange =
    previous
      ? relativeChange(
          cash,
          num(
            previous,
            "cash",
            "cashBalance",
            "cash_balance"
          )
        )
      : null;

  const analysis =
    useMemo(
      () =>
        extractAnalysis(
          data?.analysis
        ),
      [data?.analysis]
    );

  const netCashChange =
    operatingCashFlow +
    investingCashFlow +
    financingCashFlow;

  const isBalanced =
    balanceStatus ===
      "balanced" ||
    Math.abs(
      balanceDifference
    ) < 0.01;

  const hasData =
    Boolean(
      data?.hasFinancialData &&
        latest
    );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-3xl bg-white" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-72 rounded-3xl bg-white" />
              <div className="h-72 rounded-3xl bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8 lg:py-9">

        {/* Header */}
        <header className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-300">
                <Icon
                  name="spark"
                  className="h-4 w-4"
                />

                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Decisionly Intelligence
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Financial Analysis
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                A decision-focused view of your
                latest financial position, performance,
                liquidity, cash flow, and key risks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Dashboard
                <Icon
                  name="arrow"
                  className="h-4 w-4"
                />
              </Link>

              <button
                type="button"
                onClick={() =>
                  loadAnalysis(true)
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon
                  name="refresh"
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />
                {refreshing
                  ? "Refreshing"
                  : "Refresh analysis"}
              </button>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600">
              <Icon
                name="warning"
                className="h-5 w-5"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Unable to load financial analysis
              </p>

              <p className="mt-1 text-sm leading-6">
                {error}
              </p>
            </div>

            <button
              onClick={() =>
                loadAnalysis(true)
              }
              className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm"
            >
              Try again
            </button>
          </div>
        )}

        {!error && !hasData && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Icon
                name="chart"
                className="h-7 w-7"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No financial data yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add a Quick Input first. Once financial
              data is available, Decisionly will show
              the analysis here.
            </p>

            <Link
              href="/dashboard/quick-input"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Add Quick Input
              <Icon
                name="arrow"
                className="h-4 w-4"
              />
            </Link>
          </div>
        )}

        {hasData && (
          <>
            {/* Snapshot */}
            <section className="mt-6">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-500">
                    Latest snapshot
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    {inputCode ||
                      "Latest financial input"}
                  </h2>
                </div>

                <div className="text-sm text-slate-500">
                  {formatDate(inputDate)}
                  <span className="mx-2 text-slate-300">
                    •
                  </span>
                  {recordCount}{" "}
                  {recordCount === 1
                    ? "record"
                    : "records"}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Revenue"
                  value={formatCurrency(
                    revenue,
                    currency
                  )}
                  sublabel="Latest period"
                  tone="neutral"
                  icon={
                    <Icon
                      name="chart"
                      className="h-5 w-5"
                    />
                  }
                  change={
                    revenueChange
                  }
                />

                <MetricCard
                  label="Net profit"
                  value={formatCurrency(
                    netIncome,
                    currency
                  )}
                  sublabel={`${formatPercent(
                    netMargin
                  )} net margin`}
                  tone={getTone(
                    netIncome
                  )}
                  icon={
                    <Icon
                      name="trend"
                      className="h-5 w-5"
                    />
                  }
                  change={
                    profitChange
                  }
                />

                <MetricCard
                  label="Operating cash"
                  value={formatCurrency(
                    operatingCashFlow,
                    currency
                  )}
                  sublabel="Cash generated from operations"
                  tone={getTone(
                    operatingCashFlow
                  )}
                  icon={
                    <Icon
                      name="cash"
                      className="h-5 w-5"
                    />
                  }
                  change={
                    cashChange
                  }
                />

                <MetricCard
                  label="Financial position"
                  value={
                    isBalanced
                      ? "Balanced"
                      : "Review"
                  }
                  sublabel={
                    isBalanced
                      ? "Assets = liabilities + equity"
                      : `Difference ${formatCurrency(
                          balanceDifference,
                          currency
                        )}`
                  }
                  tone={
                    isBalanced
                      ? "positive"
                      : "warning"
                  }
                  icon={
                    <Icon
                      name={
                        isBalanced
                          ? "shield"
                          : "warning"
                      }
                      className="h-5 w-5"
                    />
                  }
                />
              </div>
            </section>

            {/* Core metrics */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">

              {/* Profitability */}
              <SectionCard
                eyebrow="01 / Performance"
                title="Profitability"
                description="How efficiently revenue is converted into profit."
                icon={
                  <Icon
                    name="trend"
                    className="h-5 w-5"
                  />
                }
              >
                <div className="space-y-5">
                  <MetricRow
                    label="Gross profit"
                    value={formatCurrency(
                      grossProfit,
                      currency
                    )}
                  />

                  <MetricRow
                    label="Gross margin"
                    value={formatPercent(
                      grossMargin
                    )}
                    progress={grossMargin}
                  />

                  <MetricRow
                    label="Operating profit"
                    value={formatCurrency(
                      operatingProfit,
                      currency
                    )}
                  />

                  <MetricRow
                    label="Operating margin"
                    value={formatPercent(
                      operatingMargin
                    )}
                    progress={
                      operatingMargin
                    }
                  />

                  <MetricRow
                    label="Net margin"
                    value={formatPercent(
                      netMargin
                    )}
                    progress={
                      netMargin
                    }
                  />
                </div>
              </SectionCard>

              {/* Liquidity */}
              <SectionCard
                eyebrow="02 / Liquidity"
                title="Liquidity"
                description="Short-term capacity to meet operating obligations."
                icon={
                  <Icon
                    name="cash"
                    className="h-5 w-5"
                  />
                }
              >
                <div className="space-y-5">
                  <MetricRow
                    label="Cash"
                    value={formatCurrency(
                      cash,
                      currency
                    )}
                    emphasis
                  />

                  <MetricRow
                    label="Working capital"
                    value={
                      workingCapital ===
                      null
                        ? "—"
                        : formatCurrency(
                            workingCapital,
                            currency
                          )
                    }
                  />

                  <MetricRow
                    label="Current ratio"
                    value={formatRatio(
                      currentRatio
                    )}
                  />

                  <MetricRow
                    label="Quick ratio"
                    value={formatRatio(
                      quickRatio
                    )}
                  />

                  <MetricRow
                    label="Operating cash flow"
                    value={formatCurrency(
                      operatingCashFlow,
                      currency
                    )}
                    tone={getTone(
                      operatingCashFlow
                    )}
                  />
                </div>
              </SectionCard>

              {/* Leverage */}
              <SectionCard
                eyebrow="03 / Capital"
                title="Leverage"
                description="Capital structure and debt exposure."
                icon={
                  <Icon
                    name="shield"
                    className="h-5 w-5"
                  />
                }
              >
                <div className="space-y-5">
                  <MetricRow
                    label="Total liabilities"
                    value={formatCurrency(
                      totalLiabilities,
                      currency
                    )}
                  />

                  <MetricRow
                    label="Total equity"
                    value={formatCurrency(
                      totalEquity,
                      currency
                    )}
                  />

                  <MetricRow
                    label="Debt / equity"
                    value={formatRatio(
                      debtToEquity
                    )}
                  />

                  <MetricRow
                    label="Debt / assets"
                    value={
                      debtToAssets ===
                      null
                        ? "—"
                        : formatPercent(
                            debtToAssets *
                              100
                          )
                    }
                  />

                  <MetricRow
                    label="Total assets"
                    value={formatCurrency(
                      totalAssets,
                      currency
                    )}
                  />
                </div>
              </SectionCard>
            </div>

            {/* Cash flow + balance */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <SectionCard
                eyebrow="04 / Cash flow"
                title="Cash movement"
                description="Where cash was generated or consumed in the latest period."
                icon={
                  <Icon
                    name="cash"
                    className="h-5 w-5"
                  />
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <CashFlowCard
                    label="Operating"
                    value={
                      operatingCashFlow
                    }
                  />

                  <CashFlowCard
                    label="Investing"
                    value={
                      investingCashFlow
                    }
                  />

                  <CashFlowCard
                    label="Financing"
                    value={
                      financingCashFlow
                    }
                  />

                  <CashFlowCard
                    label="Net change"
                    value={
                      netCashChange
                    }
                    highlight
                  />
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="05 / Financial position"
                title="Balance sheet integrity"
                description="A concise view of the accounting equation."
                icon={
                  <Icon
                    name="shield"
                    className="h-5 w-5"
                  />
                }
              >
                <div className="space-y-5">
                  <BalanceLine
                    label="Total assets"
                    value={
                      totalAssets
                    }
                  />

                  <BalanceLine
                    label="Liabilities"
                    value={
                      totalLiabilities
                    }
                  />

                  <BalanceLine
                    label="Equity"
                    value={
                      totalEquity
                    }
                  />

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Balance status
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Difference:{" "}
                          {formatCurrency(
                            balanceDifference,
                            currency
                          )}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          isBalanced
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <Icon
                          name={
                            isBalanced
                              ? "check"
                              : "warning"
                          }
                          className="h-3.5 w-3.5"
                        />

                        {isBalanced
                          ? "Balanced"
                          : "Review"}
                      </span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Trend */}
            {data?.trend &&
              data.trend.length > 0 && (
                <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon
                          name="trend"
                          className="h-5 w-5"
                        />
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                          06 / Trend
                        </p>

                        <h2 className="mt-1 text-lg font-semibold">
                          Historical movement
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Period
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Net profit
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Cash
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Net margin
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.trend.map(
                          (
                            row,
                            index
                          ) => {
                            const rowRevenue =
                              num(
                                row,
                                "revenue"
                              );

                            const rowProfit =
                              num(
                                row,
                                "netIncome",
                                "net_income"
                              );

                            const rowCash =
                              num(
                                row,
                                "cash",
                                "cashBalance",
                                "cash_balance"
                              );

                            const rowMargin =
                              nullableNum(
                                row,
                                "netMargin",
                                "net_margin"
                              );

                            return (
                              <tr
                                key={`${text(
                                  row,
                                  "inputDate",
                                  "input_date"
                                )}-${index}`}
                                className="border-b border-slate-50 last:border-0"
                              >
                                <td className="px-6 py-4">
                                  <p className="text-sm font-medium text-slate-700">
                                    {formatDate(
                                      text(
                                        row,
                                        "inputDate",
                                        "input_date"
                                      )
                                    )}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {text(
                                      row,
                                      "quickInputCode",
                                      "quick_input_code"
                                    ) ||
                                      `Period ${
                                        index +
                                        1
                                      }`}
                                  </p>
                                </td>

                                <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                                  {formatCurrency(
                                    rowRevenue,
                                    currency
                                  )}
                                </td>

                                <td
                                  className={`px-6 py-4 text-right text-sm font-medium ${
                                    rowProfit >=
                                    0
                                      ? "text-emerald-600"
                                      : "text-rose-600"
                                  }`}
                                >
                                  {formatCurrency(
                                    rowProfit,
                                    currency
                                  )}
                                </td>

                                <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                                  {formatCurrency(
                                    rowCash,
                                    currency
                                  )}
                                </td>

                                <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                                  {formatPercent(
                                    rowMargin
                                  )}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

            {/* Decision intelligence */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              <SectionCard
                eyebrow="07 / Decision intelligence"
                title="Key risks"
                description="Signals that deserve management attention."
                icon={
                  <Icon
                    name="warning"
                    className="h-5 w-5"
                  />
                }
              >
                <BulletList
                  items={
                    analysis.risks
                  }
                  tone="negative"
                />
              </SectionCard>

              <SectionCard
                eyebrow="08 / Growth"
                title="Opportunities"
                description="Areas where the current financial position may support action."
                icon={
                  <Icon
                    name="bolt"
                    className="h-5 w-5"
                  />
                }
              >
                <BulletList
                  items={
                    analysis.opportunities
                  }
                  tone="positive"
                />
              </SectionCard>
            </div>

            {/* Narrative analysis */}
            <div className="mt-6">
              <SectionCard
                eyebrow="09 / Management view"
                title="Analysis & recommended actions"
                description="The analysis is presented as observations and actions rather than an opaque AI narrative."
                icon={
                  <Icon
                    name="spark"
                    className="h-5 w-5"
                  />
                }
              >
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      Executive summary
                    </h3>

                    <div className="mt-4">
                      <BulletList
                        items={
                          analysis.executiveSummary
                        }
                      />
                    </div>

                    {analysis.financialPerformance.length >
                      0 && (
                      <div className="mt-8">
                        <h3 className="text-sm font-semibold text-slate-950">
                          Financial performance
                        </h3>

                        <div className="mt-4">
                          <BulletList
                            items={
                              analysis.financialPerformance
                            }
                          />
                        </div>
                      </div>
                    )}

                    {analysis.liquidity.length >
                      0 && (
                      <div className="mt-8">
                        <h3 className="text-sm font-semibold text-slate-950">
                          Liquidity
                        </h3>

                        <div className="mt-4">
                          <BulletList
                            items={
                              analysis.liquidity
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                        <Icon
                          name="bolt"
                          className="h-4 w-4"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                          Recommended actions
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-slate-900">
                          What management should consider next
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <BulletList
                        items={
                          analysis.actions
                        }
                        tone="positive"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Footer metadata */}
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Latest input:{" "}
                <span className="font-medium text-slate-500">
                  {formatDate(
                    inputDate
                  )}
                </span>
              </div>

              <div>
                Analysis refreshed:{" "}
                <span className="font-medium text-slate-500">
                  {formatDateTime(
                    data?.generatedAt
                  )}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MetricRow({
  label,
  value,
  progress,
  emphasis = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  progress?: number;
  emphasis?: boolean;
  tone?: MetricTone;
}) {
  const colors =
    toneClasses(tone);

  const width =
    progress === undefined
      ? 0
      : Math.max(
          0,
          Math.min(
            Math.abs(progress),
            100
          )
        );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-500">
          {label}
        </span>

        <span
          className={`text-sm font-semibold ${
            emphasis
              ? "text-lg text-slate-950"
              : colors.text ===
                "text-slate-600"
              ? "text-slate-700"
              : colors.text
          }`}
        >
          {value}
        </span>
      </div>

      {progress !==
        undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{
              width: `${width}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function CashFlowCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  const positive =
    value >= 0;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-indigo-100 bg-indigo-50/60"
          : "border-slate-100 bg-slate-50/60"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-semibold ${
          positive
            ? "text-emerald-600"
            : "text-rose-600"
        }`}
      >
        {value > 0
          ? "+"
          : ""}
        {formatCurrency(
          value,
          "IDR"
        )}
      </p>
    </div>
  );
}

function BalanceLine({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-800">
        {formatCurrency(
          value,
          "IDR"
        )}
      </span>
    </div>
  );
}

function formatDateTime(
  value: unknown
) {
  if (!value) return "—";

  const date = new Date(
    String(value)
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}