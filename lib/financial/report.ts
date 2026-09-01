
/* ============================================================
 * FINANCIAL REPORT ENGINE
 *
 * SINGLE SOURCE OF TRUTH
 *
 * Semua perhitungan financial metrics berada di file ini.
 *
 * Dipakai oleh:
 *   /api/report
 *   /api/analysis
 *
 * Jangan menghitung ulang financial metrics di route.
 * ============================================================ */

export type QuickInputRow = {
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

export type RecommendationPriority =
  | "high"
  | "medium"
  | "low";

export type Recommendation = {
  priority: RecommendationPriority;
  title: string;
  message: string;
};

export type InsightType =
  | "positive"
  | "warning"
  | "attention";

export type Insight = {
  type: InsightType;
  title: string;
  message: string;
  priority: number;
};

export type FinancialRecord =
  ReturnType<typeof calculateFinancialData>;

export type ComparisonMetric = {
  current: number;
  previous: number;
  change: number;
  changePercent: number | null;
};

export type Comparison = {
  revenue: ComparisonMetric;
  grossProfit: ComparisonMetric;
  netIncome: ComparisonMetric;
  cash: ComparisonMetric;
  totalAssets: ComparisonMetric;
  totalLiabilities: ComparisonMetric;
  totalEquity: ComparisonMetric;
} | null;

/* ============================================================
 * HELPERS
 * ============================================================ */

export function numberValue(value: unknown): number {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function percentageChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) {
    return current === 0
      ? 0
      : null;
  }

  return (
    ((current - previous) /
      Math.abs(previous)) *
    100
  );
}

export function direction(
  current: number,
  previous?: number
): "up" | "down" | "flat" {
  if (previous === undefined) {
    return "flat";
  }

  if (current > previous) {
    return "up";
  }

  if (current < previous) {
    return "down";
  }

  return "flat";
}

/* ============================================================
 * FINANCIAL CALCULATION
 * ============================================================ */

export function calculateFinancialData(
  row: QuickInputRow
) {
  /* ----------------------------------------------------------
   * INCOME STATEMENT
   * ---------------------------------------------------------- */

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

  /* ----------------------------------------------------------
   * ASSETS
   * ---------------------------------------------------------- */

  const cash =
    numberValue(row.cash);

  const accountsReceivable =
    numberValue(
      row.accounts_receivable
    );

  const inventory =
    numberValue(row.inventory);

  const otherCurrentAssets =
    numberValue(
      row.other_current_assets
    );

  const prepaidExpenses =
    numberValue(
      row.prepaid_expenses
    );

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

  /* ----------------------------------------------------------
   * LIABILITIES
   * ---------------------------------------------------------- */

  const accountsPayable =
    numberValue(
      row.accounts_payable
    );

  const shortTermDebt =
    numberValue(
      row.short_term_debt
    );

  const accruedLiabilities =
    numberValue(
      row.accrued_liabilities
    );

  const longTermDebt =
    numberValue(
      row.long_term_debt
    );

  const otherLiabilities =
    numberValue(
      row.other_liabilities
    );

  const currentLiabilities =
    accountsPayable +
    shortTermDebt +
    accruedLiabilities;

  const totalLiabilities =
    currentLiabilities +
    longTermDebt +
    otherLiabilities;

  /* ----------------------------------------------------------
   * EQUITY
   * ---------------------------------------------------------- */

  const shareCapital =
    numberValue(
      row.share_capital
    );

  const retainedEarnings =
    numberValue(
      row.retained_earnings
    );

  const otherEquity =
    numberValue(
      row.other_equity
    );

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

  /* ----------------------------------------------------------
   * CASH FLOW
   * ---------------------------------------------------------- */

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

  /* ----------------------------------------------------------
   * RATIOS
   * ---------------------------------------------------------- */

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
 * FINANCIAL HEALTH
 * ============================================================ */

export function calculateFinancialHealth(
  latest: FinancialRecord
): number {
  let score = 50;

  /* Profitability */

  if (latest.netMargin >= 15) {
    score += 15;
  } else if (latest.netMargin > 5) {
    score += 10;
  } else if (latest.netMargin > 0) {
    score += 5;
  } else {
    score -= 15;
  }

  /* Operating cash flow */

  if (latest.operatingCashFlow > 0) {
    score += 12;
  } else if (
    latest.operatingCashFlow < 0
  ) {
    score -= 12;
  }

  /* Liquidity */

  if (latest.currentRatio !== null) {
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

  /* Leverage */

  if (latest.debtToEquity !== null) {
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

  /* Balance sheet */

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

export function getFinancialHealthLabel(
  score: number
) {
  if (score >= 80) {
    return {
      label: "Strong",
      status: "healthy" as const,
    };
  }

  if (score >= 65) {
    return {
      label: "Healthy",
      status: "healthy" as const,
    };
  }

  if (score >= 50) {
    return {
      label: "Watch",
      status: "watch" as const,
    };
  }

  return {
    label: "Needs Attention",
    status: "attention" as const,
  };
}

/* ============================================================
 * COMPARISON
 * ============================================================ */

export function buildComparison(
  current: FinancialRecord,
  previous: FinancialRecord | null
): Comparison {
  if (!previous) {
    return null;
  }

  function metric(
    currentValue: number,
    previousValue: number
  ): ComparisonMetric {
    return {
      current: currentValue,
      previous: previousValue,
      change:
        currentValue -
        previousValue,
      changePercent:
        percentageChange(
          currentValue,
          previousValue
        ),
    };
  }

  return {
    revenue: metric(
      current.revenue,
      previous.revenue
    ),

    grossProfit: metric(
      current.grossProfit,
      previous.grossProfit
    ),

    netIncome: metric(
      current.netIncome,
      previous.netIncome
    ),

    cash: metric(
      current.cash,
      previous.cash
    ),

    totalAssets: metric(
      current.totalAssets,
      previous.totalAssets
    ),

    totalLiabilities: metric(
      current.totalLiabilities,
      previous.totalLiabilities
    ),

    totalEquity: metric(
      current.totalEquity,
      previous.totalEquity
    ),
  };
}

/* ============================================================
 * TRENDS
 * ============================================================ */

export function buildTrends(
  rows: FinancialRecord[]
) {
  return rows.map(
    (current, index) => {
      const previous =
        index > 0
          ? rows[index - 1]
          : undefined;

      return {
        id: current.id,

        quickInputCode:
          current.quickInputCode,

        inputDate:
          current.inputDate,

        revenue:
          current.revenue,

        grossProfit:
          current.grossProfit,

        operatingProfit:
          current.operatingProfit,

        netIncome:
          current.netIncome,

        cash:
          current.cash,

        operatingCashFlow:
          current.operatingCashFlow,

        investingCashFlow:
          current.investingCashFlow,

        financingCashFlow:
          current.financingCashFlow,

        netCashChange:
          current.netCashChange,

        totalAssets:
          current.totalAssets,

        totalLiabilities:
          current.totalLiabilities,

        totalEquity:
          current.totalEquity,

        grossMargin:
          current.grossMargin,

        operatingMargin:
          current.operatingMargin,

        netMargin:
          current.netMargin,

        currentRatio:
          current.currentRatio,

        quickRatio:
          current.quickRatio,

        debtToEquity:
          current.debtToEquity,

        debtToAssets:
          current.debtToAssets,

        revenueDirection:
          direction(
            current.revenue,
            previous?.revenue
          ),

        profitDirection:
          direction(
            current.netIncome,
            previous?.netIncome
          ),

        cashDirection:
          direction(
            current.cash,
            previous?.cash
          ),
      };
    }
  );
}

/* ============================================================
 * INSIGHTS
 * ============================================================ */

export function buildInsights(
  latest: FinancialRecord,
  previous: FinancialRecord | null
): Insight[] {
  const insights: Insight[] = [];

  /* Balance sheet */

  if (
    latest.balanceStatus ===
    "unbalanced"
  ) {
    insights.push({
      type: "attention",
      title:
        "Balance sheet needs review",
      message:
        `Assets do not equal liabilities plus equity. ` +
        `The current difference is ${latest.balanceDifference.toLocaleString(
          "id-ID"
        )}. Review the latest balance-sheet input.`,
      priority: 100,
    });
  } else {
    insights.push({
      type: "positive",
      title:
        "Balance sheet is balanced",
      message:
        "Total assets reconcile with total liabilities and equity in the latest Quick Input.",
      priority: 20,
    });
  }

  /* Profitability */

  if (latest.netIncome < 0) {
    insights.push({
      type: "attention",
      title:
        "The business is currently loss-making",
      message:
        `Net income is negative at ${latest.netIncome.toLocaleString(
          "id-ID"
        )}. Review pricing, cost of sales, operating expenses, and other expenses.`,
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
        `The latest net margin is ${latest.netMargin.toFixed(
          1
        )}%.`,
      priority: 80,
    });
  } else if (
    latest.netMargin > 0
  ) {
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
  } else {
    insights.push({
      type: "warning",
      title:
        "Profitability is at break-even",
      message:
        "Net income is currently zero. Monitor revenue, gross margin, and operating expenses.",
      priority: 65,
    });
  }

  /* Operating cash flow */

  if (
    latest.operatingCashFlow < 0
  ) {
    insights.push({
      type: "attention",
      title:
        "Operating cash flow is negative",
      message:
        "The latest period generated negative operating cash flow. Monitor collections, working capital, and recurring operating costs.",
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
        `Operating cash flow is positive at ${latest.operatingCashFlow.toLocaleString(
          "id-ID"
        )}.`,
      priority: 70,
    });
  }

  /* Liquidity */

  if (
    latest.currentRatio !== null
  ) {
    if (
      latest.currentRatio < 1
    ) {
      insights.push({
        type: "attention",
        title:
          "Liquidity requires attention",
        message:
          `The current ratio is ${latest.currentRatio.toFixed(
            2
          )}, meaning current liabilities exceed current assets.`,
        priority: 88,
      });
    } else if (
      latest.currentRatio >= 2
    ) {
      insights.push({
        type: "positive",
        title:
          "Strong current liquidity",
        message:
          `The current ratio is ${latest.currentRatio.toFixed(
            2
          )}.`,
        priority: 55,
      });
    }
  }

  /* Leverage */

  if (
    latest.debtToEquity !== null
  ) {
    if (
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
    } else if (
      latest.debtToEquity <= 1
    ) {
      insights.push({
        type: "positive",
        title:
          "Leverage is moderate",
        message:
          `Debt-to-equity is ${latest.debtToEquity.toFixed(
            2
          )}.`,
        priority: 45,
      });
    }
  }

  /* Period comparison */

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
          )}% compared with the previous Quick Input.`,
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
          )}% compared with the previous Quick Input.`,
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
          "Net income declined from a positive result to a loss.",
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
          )}% compared with the previous Quick Input.`,
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
          )}% compared with the previous Quick Input.`,
        priority: 82,
      });
    }
  }

  return insights
    .sort(
      (a, b) =>
        b.priority -
        a.priority
    )
    .slice(0, 8);
}

/* ============================================================
 * RECOMMENDATIONS
 * ============================================================ */

export function buildRecommendations(
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
        "Review pricing, gross margin, operating expenses, and other expenses to identify the main drivers of the weak result.",
    });
  } else if (
    latest.netMargin < 5
  ) {
    recommendations.push({
      priority: "medium",
      title:
        "Protect profit margin",
      message:
        "Net margin is relatively thin. Review operating costs and pricing before increasing discretionary spending.",
    });
  } else if (
    latest.netMargin >= 15
  ) {
    recommendations.push({
      priority: "low",
      title:
        "Protect current profitability",
      message:
        "Profitability is strong. Focus on maintaining the current margin while scaling revenue sustainably.",
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
        "Current liabilities exceed current assets. Prioritize cash preservation, receivable collection, and short-term liability management.",
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
        "Liquidity is adequate but the short-term buffer is limited. Monitor cash availability and upcoming obligations closely.",
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
        "Core operations are consuming cash. Review collection timing, operating costs, inventory, and working-capital movements.",
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
        "Debt is more than twice shareholders' equity. Review debt repayment capacity and avoid unnecessary additional borrowing.",
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
        "Debt exceeds shareholders' equity. Monitor debt servicing capacity before taking on additional financing.",
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
        "Assets do not equal liabilities plus equity. Review the latest balance-sheet inputs before relying on the report for financial decisions.",
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
        "Current profitability, liquidity, leverage, cash flow, and balance-sheet indicators do not show a major immediate concern.",
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
 * EXECUTIVE SUMMARY
 * ============================================================ */

export function buildExecutiveSummary(
  latest: FinancialRecord,
  previous: FinancialRecord | null
) {
  const positiveSignals: string[] =
    [];

  const attentionSignals: string[] =
    [];

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
 * REPORT BUILDER
 * ============================================================ */

export function buildReportData(
  quickInputs: QuickInputRow[],
  companyId: string,
  userId: string
) {
  if (quickInputs.length === 0) {
    return {
      hasFinancialData: false as const,

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
    };
  }

  /*
   * Database is sorted oldest -> newest.
   * Therefore latest is the last record.
   */

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

  const comparison =
    buildComparison(
      latest,
      previous
    );

  const trends =
    buildTrends(history);

  const insights =
    buildInsights(
      latest,
      previous
    );

  const financialHealth =
    calculateFinancialHealth(
      latest
    );

  const health =
    getFinancialHealthLabel(
      financialHealth
    );

  const executiveSummary =
    buildExecutiveSummary(
      latest,
      previous
    );

  const recommendations =
    buildRecommendations(
      latest
    );

  return {
    hasFinancialData: true as const,

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
  };
}

