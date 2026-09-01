import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* ============================================================
 * TYPES
 * ============================================================ */

type QuickInputRow = {
  id: string;
  quick_input_code: string;
  company_id: string;
  user_id: string;
  input_date: string;

  revenue: number | null;
  cost_of_sales: number | null;
  operating_expenses: number | null;
  other_income: number | null;
  other_expenses: number | null;

  cash: number | null;
  accounts_receivable: number | null;
  inventory: number | null;
  other_current_assets: number | null;
  prepaid_expenses: number | null;

  fixed_assets: number | null;
  other_non_current_assets: number | null;

  accounts_payable: number | null;
  short_term_debt: number | null;
  accrued_liabilities: number | null;

  long_term_debt: number | null;
  other_liabilities: number | null;

  share_capital: number | null;
  retained_earnings: number | null;
  other_equity: number | null;

  operating_cash_flow: number | null;
  investing_cash_flow: number | null;
  financing_cash_flow: number | null;

  created_at: string;
  updated_at: string;
};

type RecommendationPriority =
  | "high"
  | "medium"
  | "low";

type Recommendation = {
  priority: RecommendationPriority;
  title: string;
  message: string;
};

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

type FinancialRecord = ReturnType<
  typeof calculateFinancialData
>;

type ReportLimitResult = {
  allowed: boolean;
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  period_start: string;
  period_end: string;
};

type UsageResult = {
  success: boolean;
  company_id: string;
  usage_id: string;
  report_count: number;
  period_start: string;
  period_end: string;
};

/* ============================================================
 * HELPERS
 * ============================================================ */

function numberValue(value: unknown): number {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function percentageChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return (
    ((current - previous) /
      Math.abs(previous)) *
    100
  );
}

function jsonError(
  error: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...extra,
    },
    { status }
  );
}

/* ============================================================
 * FINANCIAL CALCULATION
 * ============================================================ */

function calculateFinancialData(
  row: QuickInputRow
) {
  const revenue =
    numberValue(row.revenue);

  const costOfSales =
    numberValue(row.cost_of_sales);

  const operatingExpenses =
    numberValue(row.operating_expenses);

  const otherIncome =
    numberValue(row.other_income);

  const otherExpenses =
    numberValue(row.other_expenses);

  const grossProfit =
    revenue - costOfSales;

  const operatingProfit =
    grossProfit -
    operatingExpenses;

  const netIncome =
    operatingProfit +
    otherIncome -
    otherExpenses;

  const grossMargin =
    revenue !== 0
      ? (grossProfit / revenue) * 100
      : 0;

  const operatingMargin =
    revenue !== 0
      ? (operatingProfit / revenue) * 100
      : 0;

  const netMargin =
    revenue !== 0
      ? (netIncome / revenue) * 100
      : 0;

  /* Assets */

  const cash =
    numberValue(row.cash);

  const accountsReceivable =
    numberValue(row.accounts_receivable);

  const inventory =
    numberValue(row.inventory);

  const otherCurrentAssets =
    numberValue(row.other_current_assets);

  const prepaidExpenses =
    numberValue(row.prepaid_expenses);

  const fixedAssets =
    numberValue(row.fixed_assets);

  const otherNonCurrentAssets =
    numberValue(
      row.other_non_current_assets
    );

  const currentAssets =
    cash +
    accountsReceivable +
    inventory +
    otherCurrentAssets +
    prepaidExpenses;

  const nonCurrentAssets =
    fixedAssets +
    otherNonCurrentAssets;

  const totalAssets =
    currentAssets +
    nonCurrentAssets;

  /* Liabilities */

  const accountsPayable =
    numberValue(row.accounts_payable);

  const shortTermDebt =
    numberValue(row.short_term_debt);

  const accruedLiabilities =
    numberValue(
      row.accrued_liabilities
    );

  const longTermDebt =
    numberValue(row.long_term_debt);

  const otherLiabilities =
    numberValue(row.other_liabilities);

  const currentLiabilities =
    accountsPayable +
    shortTermDebt +
    accruedLiabilities;

  const totalLiabilities =
    currentLiabilities +
    longTermDebt +
    otherLiabilities;

  /* Equity */

  const shareCapital =
    numberValue(row.share_capital);

  const retainedEarnings =
    numberValue(row.retained_earnings);

  const otherEquity =
    numberValue(row.other_equity);

  const totalEquity =
    shareCapital +
    retainedEarnings +
    otherEquity;

  const liabilitiesAndEquity =
    totalLiabilities +
    totalEquity;

  const balanceDifference =
    totalAssets -
    liabilitiesAndEquity;

  const balanceStatus =
    Math.abs(balanceDifference) < 0.01
      ? "balanced"
      : "unbalanced";

  /* Cash Flow */

  const operatingCashFlow =
    numberValue(
      row.operating_cash_flow
    );

  const investingCashFlow =
    numberValue(
      row.investing_cash_flow
    );

  const financingCashFlow =
    numberValue(
      row.financing_cash_flow
    );

  const netCashChange =
    operatingCashFlow +
    investingCashFlow +
    financingCashFlow;

  /* Ratios */

  const workingCapital =
    currentAssets -
    currentLiabilities;

  const currentRatio =
    currentLiabilities !== 0
      ? currentAssets /
        currentLiabilities
      : null;

  const quickAssets =
    cash +
    accountsReceivable;

  const quickRatio =
    currentLiabilities !== 0
      ? quickAssets /
        currentLiabilities
      : null;

  const debt =
    shortTermDebt +
    longTermDebt;

  const debtToEquity =
    totalEquity !== 0
      ? debt / totalEquity
      : null;

  const debtToAssets =
    totalAssets !== 0
      ? debt / totalAssets
      : null;

  return {
    id: row.id,
    quickInputCode:
      row.quick_input_code,

    companyId:
      row.company_id,

    userId:
      row.user_id,

    inputDate:
      row.input_date,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    revenue,
    costOfSales,
    operatingExpenses,
    otherIncome,
    otherExpenses,

    grossProfit,
    operatingProfit,
    netIncome,

    grossMargin,
    operatingMargin,
    netMargin,

    cash,
    accountsReceivable,
    inventory,
    otherCurrentAssets,
    prepaidExpenses,

    fixedAssets,
    otherNonCurrentAssets,

    currentAssets,
    nonCurrentAssets,
    totalAssets,

    accountsPayable,
    shortTermDebt,
    accruedLiabilities,
    longTermDebt,
    otherLiabilities,

    currentLiabilities,
    totalLiabilities,

    shareCapital,
    retainedEarnings,
    otherEquity,

    totalEquity,
    liabilitiesAndEquity,

    balanceDifference,
    balanceStatus,

    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,

    netCashChange,

    workingCapital,
    currentRatio,
    quickRatio,
    debtToEquity,
    debtToAssets,
  };
}

/* ============================================================
 * HEALTH
 * ============================================================ */

function calculateFinancialHealth(
  latest: FinancialRecord
): number {
  let score = 50;

  if (latest.netMargin >= 15) {
    score += 15;
  } else if (latest.netMargin > 5) {
    score += 10;
  } else if (latest.netMargin > 0) {
    score += 5;
  } else {
    score -= 15;
  }

  if (
    latest.operatingCashFlow > 0
  ) {
    score += 12;
  } else if (
    latest.operatingCashFlow < 0
  ) {
    score -= 12;
  }

  if (
    latest.currentRatio !== null
  ) {
    if (latest.currentRatio >= 2) {
      score += 10;
    } else if (
      latest.currentRatio >= 1
    ) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  if (
    latest.debtToEquity !== null
  ) {
    if (
      latest.debtToEquity <= 1
    ) {
      score += 8;
    } else if (
      latest.debtToEquity <= 2
    ) {
      score += 2;
    } else {
      score -= 8;
    }
  }

  if (
    latest.balanceStatus ===
    "balanced"
  ) {
    score += 5;
  } else {
    score -= 15;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score)
    )
  );
}

function getFinancialHealthLabel(
  score: number
) {
  if (score >= 80) {
    return {
      label: "Strong",
      status: "healthy",
    };
  }

  if (score >= 65) {
    return {
      label: "Healthy",
      status: "healthy",
    };
  }

  if (score >= 50) {
    return {
      label: "Watch",
      status: "watch",
    };
  }

  return {
    label: "Needs Attention",
    status: "attention",
  };
}

/* ============================================================
 * EXECUTIVE SUMMARY
 * ============================================================ */

function buildExecutiveSummary(
  latest: FinancialRecord,
  previous: FinancialRecord | null
) {
  const positiveSignals: string[] = [];
  const attentionSignals: string[] = [];

  if (latest.netIncome > 0) {
    positiveSignals.push(
      `the business generated net income of ${latest.netIncome.toLocaleString(
        "id-ID"
      )}`
    );
  } else if (
    latest.netIncome === 0
  ) {
    attentionSignals.push(
      "the business is currently at break-even"
    );
  } else {
    attentionSignals.push(
      "the business is currently operating at a net loss"
    );
  }

  if (
    latest.operatingCashFlow > 0
  ) {
    positiveSignals.push(
      "operating activities are generating positive cash flow"
    );
  } else if (
    latest.operatingCashFlow < 0
  ) {
    attentionSignals.push(
      "operating activities are consuming cash"
    );
  }

  if (
    latest.balanceStatus ===
    "balanced"
  ) {
    positiveSignals.push(
      "the balance sheet is balanced"
    );
  } else {
    attentionSignals.push(
      "the balance sheet requires reconciliation"
    );
  }

  if (
    latest.currentRatio !== null &&
    latest.currentRatio < 1
  ) {
    attentionSignals.push(
      "current liabilities exceed current assets"
    );
  }

  if (
    latest.debtToEquity !== null &&
    latest.debtToEquity > 2
  ) {
    attentionSignals.push(
      "financial leverage is relatively high"
    );
  }

  let headline =
    "Financial position requires attention.";

  if (
    latest.netIncome > 0 &&
    latest.operatingCashFlow > 0 &&
    latest.balanceStatus ===
      "balanced"
  ) {
    headline =
      "Financial position is healthy.";
  } else if (
    latest.netIncome > 0 ||
    latest.operatingCashFlow > 0
  ) {
    headline =
      "Financial position is generally positive.";
  }

  const previousContext =
    previous
      ? " Performance can be evaluated further as more reporting periods are recorded."
      : " Add another Quick Input period to enable meaningful period-over-period trend analysis.";

  const signals =
    attentionSignals.length > 0
      ? attentionSignals
      : positiveSignals;

  const message =
    signals.length > 0
      ? `${signals.join(", ")}.${previousContext}`
      : `No major financial signals were identified.${previousContext}`;

  return {
    headline,
    message,
    positiveSignals,
    attentionSignals,
  };
}

/* ============================================================
 * RECOMMENDATIONS
 * ============================================================ */

function buildRecommendations(
  latest: FinancialRecord
): Recommendation[] {
  const recommendations: Recommendation[] =
    [];

  if (latest.netIncome <= 0) {
    recommendations.push({
      priority: "high",
      title:
        "Improve profitability",
      message:
        "Review pricing, gross margin, operating expenses, and other expenses.",
    });
  } else if (
    latest.netMargin < 5
  ) {
    recommendations.push({
      priority: "medium",
      title:
        "Protect profit margin",
      message:
        "Net margin is relatively thin. Review operating costs and pricing.",
    });
  } else if (
    latest.netMargin >= 15
  ) {
    recommendations.push({
      priority: "low",
      title:
        "Protect current profitability",
      message:
        "Profitability is strong. Focus on maintaining the current margin.",
    });
  }

  if (
    latest.currentRatio !== null &&
    latest.currentRatio < 1
  ) {
    recommendations.push({
      priority: "high",
      title:
        "Strengthen liquidity",
      message:
        "Current liabilities exceed current assets. Prioritize cash preservation and receivable collection.",
    });
  } else if (
    latest.currentRatio !== null &&
    latest.currentRatio < 1.5
  ) {
    recommendations.push({
      priority: "medium",
      title:
        "Monitor liquidity",
      message:
        "The short-term liquidity buffer is limited. Monitor upcoming obligations closely.",
    });
  }

  if (
    latest.operatingCashFlow < 0
  ) {
    recommendations.push({
      priority: "high",
      title:
        "Improve operating cash generation",
      message:
        "Review collection timing, operating costs, inventory, and working capital.",
    });
  }

  if (
    latest.debtToEquity !== null &&
    latest.debtToEquity > 2
  ) {
    recommendations.push({
      priority: "high",
      title:
        "Reduce leverage risk",
      message:
        "Debt is more than twice shareholders' equity. Avoid unnecessary additional borrowing.",
    });
  } else if (
    latest.debtToEquity !== null &&
    latest.debtToEquity > 1
  ) {
    recommendations.push({
      priority: "medium",
      title:
        "Monitor leverage",
      message:
        "Debt exceeds shareholders' equity. Monitor debt servicing capacity.",
    });
  }

  if (
    latest.balanceStatus !==
    "balanced"
  ) {
    recommendations.push({
      priority: "high",
      title:
        "Reconcile the balance sheet",
      message:
        "Assets do not equal liabilities plus equity. Review the latest balance-sheet inputs.",
    });
  }

  if (
    recommendations.length === 0
  ) {
    recommendations.push({
      priority: "low",
      title:
        "Maintain financial discipline",
      message:
        "Current indicators do not show a major immediate concern.",
    });
  }

  const priorityRank: Record<
    RecommendationPriority,
    number
  > = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return recommendations.sort(
    (a, b) =>
      priorityRank[a.priority] -
      priorityRank[b.priority]
  );
}

/* ============================================================
 * INSIGHTS
 * ============================================================ */

function buildInsights(
  latest: FinancialRecord,
  previous: FinancialRecord | null
): Insight[] {
  const insights: Insight[] = [];

  if (
    latest.balanceStatus !==
    "balanced"
  ) {
    insights.push({
      type: "attention",
      title:
        "Balance sheet needs review",
      message:
        `Assets do not equal liabilities plus equity. Difference: ${latest.balanceDifference.toLocaleString(
          "id-ID"
        )}.`,
      priority: 100,
    });
  } else {
    insights.push({
      type: "positive",
      title:
        "Balance sheet is balanced",
      message:
        "Assets reconcile with liabilities and equity.",
      priority: 20,
    });
  }

  if (latest.netIncome < 0) {
    insights.push({
      type: "attention",
      title:
        "The business is currently loss-making",
      message:
        `Net income is negative at ${latest.netIncome.toLocaleString(
          "id-ID"
        )}.`,
      priority: 95,
    });
  } else if (
    latest.netMargin >= 10
  ) {
    insights.push({
      type: "positive",
      title:
        "Strong net profitability",
      message:
        `Net margin is ${latest.netMargin.toFixed(
          1
        )}%.`,
      priority: 80,
    });
  } else {
    insights.push({
      type: "warning",
      title:
        "Positive but modest profitability",
      message:
        `Net margin is ${latest.netMargin.toFixed(
          1
        )}%.`,
      priority: 60,
    });
  }

  if (
    latest.operatingCashFlow < 0
  ) {
    insights.push({
      type: "attention",
      title:
        "Operating cash flow is negative",
      message:
        "Operating activities are consuming cash.",
      priority: 90,
    });
  } else if (
    latest.operatingCashFlow > 0
  ) {
    insights.push({
      type: "positive",
      title:
        "Operations are generating cash",
      message:
        `Operating cash flow is ${latest.operatingCashFlow.toLocaleString(
          "id-ID"
        )}.`,
      priority: 70,
    });
  }

  if (
    latest.currentRatio !== null &&
    latest.currentRatio < 1
  ) {
    insights.push({
      type: "attention",
      title:
        "Liquidity requires attention",
      message:
        `Current ratio is ${latest.currentRatio.toFixed(
          2
        )}.`,
      priority: 88,
    });
  }

  if (
    latest.debtToEquity !== null &&
    latest.debtToEquity > 2
  ) {
    insights.push({
      type: "attention",
      title:
        "Leverage is elevated",
      message:
        `Debt-to-equity is ${latest.debtToEquity.toFixed(
          2
        )}.`,
      priority: 85,
    });
  }

  if (previous) {
    const revenueChange =
      percentageChange(
        latest.revenue,
        previous.revenue
      );

    const profitChange =
      percentageChange(
        latest.netIncome,
        previous.netIncome
      );

    if (
      revenueChange !== null &&
      revenueChange > 10
    ) {
      insights.push({
        type: "positive",
        title:
          "Revenue is growing",
        message:
          `Revenue increased ${revenueChange.toFixed(
            1
          )}% compared with the previous period.`,
        priority: 65,
      });
    } else if (
      revenueChange !== null &&
      revenueChange < -10
    ) {
      insights.push({
        type: "warning",
        title:
          "Revenue has declined",
        message:
          `Revenue decreased ${Math.abs(
            revenueChange
          ).toFixed(
            1
          )}% compared with the previous period.`,
        priority: 75,
      });
    }

    if (
      previous.netIncome < 0 &&
      latest.netIncome > 0
    ) {
      insights.push({
        type: "positive",
        title:
          "Business moved into profit",
        message:
          "Net income improved from a loss to a positive result.",
        priority: 90,
      });
    } else if (
      previous.netIncome > 0 &&
      latest.netIncome < 0
    ) {
      insights.push({
        type: "attention",
        title:
          "Profit turned into a loss",
        message:
          "Net income declined from positive to negative.",
        priority: 95,
      });
    } else if (
      profitChange !== null &&
      profitChange > 10
    ) {
      insights.push({
        type: "positive",
        title:
          "Profit is improving",
        message:
          `Net income increased ${profitChange.toFixed(
            1
          )}%.`,
        priority: 72,
      });
    } else if (
      profitChange !== null &&
      profitChange < -10
    ) {
      insights.push({
        type: "warning",
        title:
          "Profit has weakened",
        message:
          `Net income decreased ${Math.abs(
            profitChange
          ).toFixed(
            1
          )}%.`,
        priority: 82,
      });
    }
  }

  return insights
    .sort(
      (a, b) =>
        b.priority - a.priority
    )
    .slice(0, 8);
}

/* ============================================================
 * AUTHENTICATION
 * ============================================================ */

async function getAuthenticatedContext(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >
) {
  const {
    data: { user },
    error: authError,
  } =
    await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      companyId: null,
      error: jsonError(
        "Unauthorized.",
        401
      ),
    };
  }

  const {
    data: membership,
    error: membershipError,
  } =
    await supabase
      .from("company_members")
      .select(
        "company_id, user_id, role"
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "status",
        "active"
      )
      .order(
        "joined_at",
        {
          ascending: true,
        }
      )
      .limit(1)
      .maybeSingle();

  if (membershipError) {
    console.error(
      "Report membership error:",
      membershipError
    );

    return {
      user: null,
      companyId: null,
      error: jsonError(
        membershipError.message ||
          "Unable to determine company membership.",
        500
      ),
    };
  }

  if (!membership) {
    return {
      user: null,
      companyId: null,
      error: jsonError(
        "Your account is not connected to an active company.",
        403
      ),
    };
  }

  return {
    user,
    companyId:
      membership.company_id as string,
    error: null,
  };
}

/* ============================================================
 * REPORT LIMIT
 * ============================================================ */

async function getReportLimit(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  companyId: string
): Promise<ReportLimitResult> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "enforce_report_limit",
      {
        p_company_id:
          companyId,
      }
    );

  if (error) {
    console.error(
      "Report limit RPC error:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to verify report usage limit."
    );
  }

  if (!data) {
    throw new Error(
      "Report usage limit returned no result."
    );
  }

  /*
   * Supabase RPC yang return TABLE kadang
   * memberikan array satu item.
   */

  const normalized =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!normalized) {
    throw new Error(
      "Report usage limit returned an empty result."
    );
  }

  return normalized as ReportLimitResult;
}

/* ============================================================
 * INCREMENT USAGE
 * ============================================================ */

async function incrementReportUsage(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  companyId: string
): Promise<UsageResult> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "increment_report_usage",
      {
        p_company_id:
          companyId,
      }
    );

  if (error) {
    console.error(
      "Report usage increment error:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to record report usage."
    );
  }

  if (!data) {
    throw new Error(
      "Report usage increment returned no result."
    );
  }

  const normalized =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!normalized) {
    throw new Error(
      "Report usage increment returned an empty result."
    );
  }

  return normalized as UsageResult;
}

/* ============================================================
 * LOAD QUICK INPUTS
 * ============================================================ */

async function loadQuickInputs(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  companyId: string
): Promise<QuickInputRow[]> {
  const {
    data,
    error,
  } =
    await supabase
      .from("quick_inputs")
      .select("*")
      .eq(
        "company_id",
        companyId
      )
      .order(
        "input_date",
        {
          ascending: true,
        }
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

  if (error) {
    console.error(
      "Report quick_inputs error:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to load financial data."
    );
  }

  return (
    (data ?? []) as QuickInputRow[]
  );
}

/* ============================================================
 * BUILD REPORT
 * ============================================================ */

function buildReport(
  quickInputs: QuickInputRow[],
  companyId: string,
  userId: string,
  usage: ReportLimitResult | null
) {
  if (quickInputs.length === 0) {
    return {
      success: true,

      hasFinancialData: false,

      companyId,
      userId,

      recordCount: 0,

      reportDate: null,

      latest: null,
      previous: null,

      incomeStatement: null,
      balanceSheet: null,
      cashFlow: null,

      comparison: null,
      trends: [],
      insights: [],

      financialHealth: null,
      financialHealthLabel: null,
      financialHealthStatus: null,

      executiveSummary: null,

      recommendations: [],

      aiAnalysis: null,

      usage: usage
        ? {
            plan: usage.plan,
            used: usage.used,
            limit: usage.limit,
            remaining:
              usage.remaining,
            periodStart:
              usage.period_start,
            periodEnd:
              usage.period_end,
          }
        : null,
    };
  }

  const history =
    quickInputs.map(
      calculateFinancialData
    );

  const latest =
    history[history.length - 1];

  const previous =
    history.length > 1
      ? history[history.length - 2]
      : null;

  /* Statements */

  const incomeStatement = {
    revenue: latest.revenue,
    costOfSales:
      latest.costOfSales,
    grossProfit:
      latest.grossProfit,
    operatingExpenses:
      latest.operatingExpenses,
    operatingProfit:
      latest.operatingProfit,
    otherIncome:
      latest.otherIncome,
    otherExpenses:
      latest.otherExpenses,
    netIncome:
      latest.netIncome,
    grossMargin:
      latest.grossMargin,
    operatingMargin:
      latest.operatingMargin,
    netMargin:
      latest.netMargin,
  };

  const balanceSheet = {
    cash: latest.cash,
    accountsReceivable:
      latest.accountsReceivable,
    inventory:
      latest.inventory,
    otherCurrentAssets:
      latest.otherCurrentAssets,
    prepaidExpenses:
      latest.prepaidExpenses,

    currentAssets:
      latest.currentAssets,

    fixedAssets:
      latest.fixedAssets,

    otherNonCurrentAssets:
      latest.otherNonCurrentAssets,

    nonCurrentAssets:
      latest.nonCurrentAssets,

    totalAssets:
      latest.totalAssets,

    accountsPayable:
      latest.accountsPayable,

    shortTermDebt:
      latest.shortTermDebt,

    accruedLiabilities:
      latest.accruedLiabilities,

    currentLiabilities:
      latest.currentLiabilities,

    longTermDebt:
      latest.longTermDebt,

    otherLiabilities:
      latest.otherLiabilities,

    totalLiabilities:
      latest.totalLiabilities,

    shareCapital:
      latest.shareCapital,

    retainedEarnings:
      latest.retainedEarnings,

    otherEquity:
      latest.otherEquity,

    totalEquity:
      latest.totalEquity,

    liabilitiesAndEquity:
      latest.liabilitiesAndEquity,

    balanceDifference:
      latest.balanceDifference,

    balanceStatus:
      latest.balanceStatus,

    workingCapital:
      latest.workingCapital,

    currentRatio:
      latest.currentRatio,

    quickRatio:
      latest.quickRatio,

    debtToEquity:
      latest.debtToEquity,

    debtToAssets:
      latest.debtToAssets,
  };

  const cashFlow = {
    operatingCashFlow:
      latest.operatingCashFlow,

    investingCashFlow:
      latest.investingCashFlow,

    financingCashFlow:
      latest.financingCashFlow,

    netCashChange:
      latest.netCashChange,

    cashBalance:
      latest.cash,
  };

  /* Trends */

  const trends =
    history.map(
      (item) => ({
        id: item.id,
        quickInputCode:
          item.quickInputCode,
        inputDate:
          item.inputDate,

        revenue:
          item.revenue,

        grossProfit:
          item.grossProfit,

        operatingProfit:
          item.operatingProfit,

        netIncome:
          item.netIncome,

        cash:
          item.cash,

        operatingCashFlow:
          item.operatingCashFlow,

        investingCashFlow:
          item.investingCashFlow,

        financingCashFlow:
          item.financingCashFlow,

        netCashChange:
          item.netCashChange,

        totalAssets:
          item.totalAssets,

        totalLiabilities:
          item.totalLiabilities,

        totalEquity:
          item.totalEquity,

        grossMargin:
          item.grossMargin,

        operatingMargin:
          item.operatingMargin,

        netMargin:
          item.netMargin,

        currentRatio:
          item.currentRatio,

        quickRatio:
          item.quickRatio,

        debtToEquity:
          item.debtToEquity,

        debtToAssets:
          item.debtToAssets,
      })
    );

  /* Comparison */

  const comparison =
    previous
      ? {
          revenue: {
            current:
              latest.revenue,
            previous:
              previous.revenue,
            change:
              latest.revenue -
              previous.revenue,
            changePercent:
              percentageChange(
                latest.revenue,
                previous.revenue
              ),
          },

          grossProfit: {
            current:
              latest.grossProfit,
            previous:
              previous.grossProfit,
            change:
              latest.grossProfit -
              previous.grossProfit,
            changePercent:
              percentageChange(
                latest.grossProfit,
                previous.grossProfit
              ),
          },

          netIncome: {
            current:
              latest.netIncome,
            previous:
              previous.netIncome,
            change:
              latest.netIncome -
              previous.netIncome,
            changePercent:
              percentageChange(
                latest.netIncome,
                previous.netIncome
              ),
          },

          cash: {
            current:
              latest.cash,
            previous:
              previous.cash,
            change:
              latest.cash -
              previous.cash,
            changePercent:
              percentageChange(
                latest.cash,
                previous.cash
              ),
          },

          totalAssets: {
            current:
              latest.totalAssets,
            previous:
              previous.totalAssets,
            change:
              latest.totalAssets -
              previous.totalAssets,
            changePercent:
              percentageChange(
                latest.totalAssets,
                previous.totalAssets
              ),
          },

          totalLiabilities: {
            current:
              latest.totalLiabilities,
            previous:
              previous.totalLiabilities,
            change:
              latest.totalLiabilities -
              previous.totalLiabilities,
            changePercent:
              percentageChange(
                latest.totalLiabilities,
                previous.totalLiabilities
              ),
          },

          totalEquity: {
            current:
              latest.totalEquity,
            previous:
              previous.totalEquity,
            change:
              latest.totalEquity -
              previous.totalEquity,
            changePercent:
              percentageChange(
                latest.totalEquity,
                previous.totalEquity
              ),
          },
        }
      : null;

  /* Health */

  const financialHealth =
    calculateFinancialHealth(
      latest
    );

  const health =
    getFinancialHealthLabel(
      financialHealth
    );

  /* Summary */

  const executiveSummary =
    buildExecutiveSummary(
      latest,
      previous
    );

  /* Recommendations */

  const recommendations =
    buildRecommendations(
      latest
    );

  /* Insights */

  const insights =
    buildInsights(
      latest,
      previous
    );

  return {
    success: true,

    hasFinancialData: true,

    companyId,
    userId,

    recordCount:
      history.length,

    reportDate:
      latest.inputDate,

    latest,
    previous,

    incomeStatement,
    balanceSheet,
    cashFlow,

    comparison,
    trends,
    insights,

    financialHealth,

    financialHealthLabel:
      health.label,

    financialHealthStatus:
      health.status,

    executiveSummary,

    recommendations,

    aiAnalysis: null,

    usage: usage
      ? {
          plan: usage.plan,
          used: usage.used,
          limit: usage.limit,
          remaining:
            usage.remaining,
          periodStart:
            usage.period_start,
          periodEnd:
            usage.period_end,
        }
      : null,
  };
}

/* ============================================================
 * GET /api/report
 *
 * READ ONLY
 * DOES NOT CONSUME QUOTA
 * DOES NOT REQUIRE REPORT RPC
 * ============================================================ */

export async function GET() {
  try {
    const supabase =
      await createClient();

    const {
      user,
      companyId,
      error,
    } =
      await getAuthenticatedContext(
        supabase
      );

    if (error) {
      return error;
    }

    if (
      !user ||
      !companyId
    ) {
      return jsonError(
        "Unable to determine authenticated company.",
        403
      );
    }

    const quickInputs =
      await loadQuickInputs(
        supabase,
        companyId
      );

    /*
     * GET tidak memanggil enforce_report_limit.
     * Ini membuat halaman report tetap bisa dibuka
     * walaupun RPC quota bermasalah.
     */

    const report =
      buildReport(
        quickInputs,
        companyId,
        user.id,
        null
      );

    return NextResponse.json(
      report
    );
  } catch (error) {
    console.error(
      "Report GET error:",
      error
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Unexpected server error.",
      500
    );
  }
}

/* ============================================================
 * POST /api/report
 *
 * GENERATE REPORT
 * CONSUMES ONE QUOTA
 * ============================================================ */

export async function POST() {
  try {
    const supabase =
      await createClient();

    const {
      user,
      companyId,
      error,
    } =
      await getAuthenticatedContext(
        supabase
      );

    if (error) {
      return error;
    }

    if (
      !user ||
      !companyId
    ) {
      return jsonError(
        "Unable to determine authenticated company.",
        403
      );
    }

    /*
     * LOAD DATA FIRST.
     *
     * Tidak ada gunanya mengurangi quota
     * kalau perusahaan belum punya Quick Input.
     */

    const quickInputs =
      await loadQuickInputs(
        supabase,
        companyId
      );

    if (quickInputs.length === 0) {
      return NextResponse.json({
        success: true,
        hasFinancialData: false,

        companyId,
        userId: user.id,

        recordCount: 0,

        reportDate: null,

        latest: null,
        previous: null,

        incomeStatement: null,
        balanceSheet: null,
        cashFlow: null,

        comparison: null,
        trends: [],
        insights: [],

        financialHealth: null,
        financialHealthLabel: null,
        financialHealthStatus: null,

        executiveSummary: null,

        recommendations: [],

        aiAnalysis: null,

        usage: null,
      });
    }

    /*
     * CHECK QUOTA
     */

    const reportLimit =
      await getReportLimit(
        supabase,
        companyId
      );

    if (
      !reportLimit.allowed
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "You have reached your report limit for this billing period.",

          code:
            "REPORT_LIMIT_REACHED",

          usage: {
            plan:
              reportLimit.plan,

            used:
              reportLimit.used,

            limit:
              reportLimit.limit,

            remaining:
              reportLimit.remaining,

            periodStart:
              reportLimit.period_start,

            periodEnd:
              reportLimit.period_end,
          },
        },
        {
          status: 403,
        }
      );
    }

    /*
     * BUILD REPORT
     */

    const report =
      buildReport(
        quickInputs,
        companyId,
        user.id,
        reportLimit
      );

    /*
     * INCREMENT QUOTA
     */

    const usage =
      await incrementReportUsage(
        supabase,
        companyId
      );

    /*
     * FINAL RESPONSE
     */

    return NextResponse.json({
      ...report,

      usage: {
        plan:
          reportLimit.plan,

        used:
          usage.report_count,

        limit:
          reportLimit.limit,

        remaining:
          Math.max(
            reportLimit.limit -
              usage.report_count,
            0
          ),

        periodStart:
          usage.period_start,

        periodEnd:
          usage.period_end,
      },
    });
  } catch (error) {
    console.error(
      "Report POST error:",
      error
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Unexpected server error.",
      500
    );
  }
}