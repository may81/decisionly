
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { createClient } from "@/lib/supabase/server";

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

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function calculate(row: QuickInputRow) {
  const revenue = toNumber(row.revenue);
  const costOfSales = toNumber(row.cost_of_sales);
  const operatingExpenses = toNumber(row.operating_expenses);
  const otherIncome = toNumber(row.other_income);
  const otherExpenses = toNumber(row.other_expenses);

  const grossProfit = revenue - costOfSales;

  const operatingProfit =
    grossProfit - operatingExpenses;

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

  const cash = toNumber(row.cash);
  const accountsReceivable =
    toNumber(row.accounts_receivable);
  const inventory =
    toNumber(row.inventory);
  const otherCurrentAssets =
    toNumber(row.other_current_assets);
  const prepaidExpenses =
    toNumber(row.prepaid_expenses);

  const fixedAssets =
    toNumber(row.fixed_assets);

  const otherNonCurrentAssets =
    toNumber(row.other_non_current_assets);

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

  const accountsPayable =
    toNumber(row.accounts_payable);

  const shortTermDebt =
    toNumber(row.short_term_debt);

  const accruedLiabilities =
    toNumber(row.accrued_liabilities);

  const longTermDebt =
    toNumber(row.long_term_debt);

  const otherLiabilities =
    toNumber(row.other_liabilities);

  const currentLiabilities =
    accountsPayable +
    shortTermDebt +
    accruedLiabilities;

  const totalLiabilities =
    currentLiabilities +
    longTermDebt +
    otherLiabilities;

  const shareCapital =
    toNumber(row.share_capital);

  const retainedEarnings =
    toNumber(row.retained_earnings);

  const otherEquity =
    toNumber(row.other_equity);

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
      ? "Balanced"
      : "Unbalanced";

  const operatingCashFlow =
    toNumber(row.operating_cash_flow);

  const investingCashFlow =
    toNumber(row.investing_cash_flow);

  const financingCashFlow =
    toNumber(row.financing_cash_flow);

  const netCashChange =
    operatingCashFlow +
    investingCashFlow +
    financingCashFlow;

  const workingCapital =
    currentAssets -
    currentLiabilities;

  const currentRatio =
    currentLiabilities !== 0
      ? currentAssets / currentLiabilities
      : null;

  const quickRatio =
    currentLiabilities !== 0
      ? (cash + accountsReceivable) /
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
    quickInputCode: row.quick_input_code,
    inputDate: row.input_date,

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

type FinancialRecord = ReturnType<typeof calculate>;

function calculateHealth(
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

  if (latest.operatingCashFlow > 0) {
    score += 12;
  } else if (latest.operatingCashFlow < 0) {
    score -= 12;
  }

  if (latest.currentRatio !== null) {
    if (latest.currentRatio >= 2) {
      score += 10;
    } else if (latest.currentRatio >= 1) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  if (latest.debtToEquity !== null) {
    if (latest.debtToEquity <= 1) {
      score += 8;
    } else if (latest.debtToEquity <= 2) {
      score += 2;
    } else {
      score -= 8;
    }
  }

  if (latest.balanceStatus === "Balanced") {
    score += 5;
  } else {
    score -= 15;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function healthLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Healthy";
  if (score >= 50) return "Watch";

  return "Needs Attention";
}

function buildRecommendations(
  latest: FinancialRecord
): string[] {
  const recommendations: string[] = [];

  if (latest.netIncome <= 0) {
    recommendations.push(
      "Review pricing, gross margin, operating expenses, and other expenses to improve profitability."
    );
  }

  if (
    latest.currentRatio !== null &&
    latest.currentRatio < 1
  ) {
    recommendations.push(
      "Prioritize liquidity management, receivable collection, and short-term liability planning."
    );
  }

  if (latest.operatingCashFlow < 0) {
    recommendations.push(
      "Operating activities are consuming cash. Review collections, inventory, and operating costs."
    );
  }

  if (
    latest.debtToEquity !== null &&
    latest.debtToEquity > 2
  ) {
    recommendations.push(
      "Review debt repayment capacity and avoid unnecessary additional borrowing."
    );
  }

  if (latest.balanceStatus !== "Balanced") {
    recommendations.push(
      "Reconcile the balance sheet before relying on the report for financial decisions."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Current profitability, liquidity, leverage, cash flow, and balance-sheet indicators do not show a major immediate concern."
    );
  }

  return recommendations;
}

function autoWidth(
  worksheet: XLSX.WorkSheet
) {
  const range = worksheet["!ref"];

  if (!range) {
    return;
  }

  const decoded =
    XLSX.utils.decode_range(range);

  const widths: number[] = [];

  for (
    let column = decoded.s.c;
    column <= decoded.e.c;
    column++
  ) {
    let maxLength = 10;

    for (
      let row = decoded.s.r;
      row <= decoded.e.r;
      row++
    ) {
      const cell =
        worksheet[
          XLSX.utils.encode_cell({
            r: row,
            c: column,
          })
        ];

      if (!cell) {
        continue;
      }

      const value = String(cell.v ?? "");

      maxLength = Math.max(
        maxLength,
        value.length + 2
      );
    }

    widths[column] = Math.min(
      maxLength,
      45
    );
  }

  worksheet["!cols"] = widths.map(
    (width) => ({ width })
  );
}

function addTitle(
  worksheet: XLSX.WorkSheet,
  title: string,
  subtitle?: string
) {
  const rows: unknown[][] = [
    ["DECISIONLY"],
    [title],
  ];

  if (subtitle) {
    rows.push([subtitle]);
  }

  XLSX.utils.sheet_add_aoa(
    worksheet,
    rows,
    { origin: "A1" }
  );
}

function createSummarySheet(
  latest: FinancialRecord,
  health: number,
  healthText: string
): XLSX.WorkSheet {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  addTitle(
    worksheet,
    "Financial Report",
    `Reporting date: ${latest.inputDate}`
  );

  const rows: unknown[][] = [
    [],
    ["EXECUTIVE SUMMARY"],
    ["Financial Health", healthText],
    ["Health Score", health],
    [],
    ["Metric", "Value"],
    ["Revenue", latest.revenue],
    ["Gross Profit", latest.grossProfit],
    ["Operating Profit", latest.operatingProfit],
    ["Net Income", latest.netIncome],
    ["Cash", latest.cash],
    ["Operating Cash Flow", latest.operatingCashFlow],
    [],
    ["KEY RATIOS", ""],
    ["Gross Margin", latest.grossMargin],
    ["Operating Margin", latest.operatingMargin],
    ["Net Margin", latest.netMargin],
    ["Current Ratio", latest.currentRatio],
    ["Quick Ratio", latest.quickRatio],
    ["Debt to Equity", latest.debtToEquity],
    ["Debt to Assets", latest.debtToAssets],
    [],
    ["BALANCE SHEET INTEGRITY", ""],
    ["Total Assets", latest.totalAssets],
    [
      "Liabilities + Equity",
      latest.liabilitiesAndEquity,
    ],
    [
      "Balance Difference",
      latest.balanceDifference,
    ],
    ["Status", latest.balanceStatus],
  ];

  XLSX.utils.sheet_add_aoa(
    worksheet,
    rows,
    { origin: "A5" }
  );

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 5,
  };

  autoWidth(worksheet);

  return worksheet;
}

function createIncomeSheet(
  latest: FinancialRecord
): XLSX.WorkSheet {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  addTitle(
    worksheet,
    "Income Statement",
    `Quick Input: ${latest.quickInputCode}`
  );

  const rows: unknown[][] = [
    [],
    ["Metric", "Value"],
    ["Revenue", latest.revenue],
    ["Cost of Sales", latest.costOfSales],
    ["Gross Profit", latest.grossProfit],
    [
      "Operating Expenses",
      latest.operatingExpenses,
    ],
    [
      "Operating Profit",
      latest.operatingProfit,
    ],
    ["Other Income", latest.otherIncome],
    [
      "Other Expenses",
      latest.otherExpenses,
    ],
    ["Net Income", latest.netIncome],
    [],
    ["Margins", ""],
    ["Gross Margin", latest.grossMargin],
    [
      "Operating Margin",
      latest.operatingMargin,
    ],
    ["Net Margin", latest.netMargin],
  ];

  XLSX.utils.sheet_add_aoa(
    worksheet,
    rows,
    { origin: "A5" }
  );

  autoWidth(worksheet);

  return worksheet;
}

function createBalanceSheet(
  latest: FinancialRecord
): XLSX.WorkSheet {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  addTitle(
    worksheet,
    "Balance Sheet",
    `Reporting date: ${latest.inputDate}`
  );

  const rows: unknown[][] = [
    [],
    ["Assets", ""],
    ["Cash", latest.cash],
    [
      "Accounts Receivable",
      latest.accountsReceivable,
    ],
    ["Inventory", latest.inventory],
    [
      "Other Current Assets",
      latest.otherCurrentAssets,
    ],
    [
      "Prepaid Expenses",
      latest.prepaidExpenses,
    ],
    ["Current Assets", latest.currentAssets],
    ["Fixed Assets", latest.fixedAssets],
    [
      "Other Non-Current Assets",
      latest.otherNonCurrentAssets,
    ],
    [
      "Non-Current Assets",
      latest.nonCurrentAssets,
    ],
    ["Total Assets", latest.totalAssets],
    [],
    ["Liabilities", ""],
    [
      "Accounts Payable",
      latest.accountsPayable,
    ],
    [
      "Short-Term Debt",
      latest.shortTermDebt,
    ],
    [
      "Accrued Liabilities",
      latest.accruedLiabilities,
    ],
    [
      "Current Liabilities",
      latest.currentLiabilities,
    ],
    [
      "Long-Term Debt",
      latest.longTermDebt,
    ],
    [
      "Other Liabilities",
      latest.otherLiabilities,
    ],
    [
      "Total Liabilities",
      latest.totalLiabilities,
    ],
    [],
    ["Equity", ""],
    ["Share Capital", latest.shareCapital],
    [
      "Retained Earnings",
      latest.retainedEarnings,
    ],
    ["Other Equity", latest.otherEquity],
    ["Total Equity", latest.totalEquity],
    [],
    [
      "Liabilities + Equity",
      latest.liabilitiesAndEquity,
    ],
    [
      "Balance Difference",
      latest.balanceDifference,
    ],
    ["Balance Status", latest.balanceStatus],
  ];

  XLSX.utils.sheet_add_aoa(
    worksheet,
    rows,
    { origin: "A5" }
  );

  autoWidth(worksheet);

  return worksheet;
}

function createCashFlowSheet(
  latest: FinancialRecord
): XLSX.WorkSheet {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  addTitle(
    worksheet,
    "Cash Flow & Ratios",
    `Reporting date: ${latest.inputDate}`
  );

  const rows: unknown[][] = [
    [],
    ["Cash Flow", ""],
    [
      "Operating Cash Flow",
      latest.operatingCashFlow,
    ],
    [
      "Investing Cash Flow",
      latest.investingCashFlow,
    ],
    [
      "Financing Cash Flow",
      latest.financingCashFlow,
    ],
    [
      "Net Cash Change",
      latest.netCashChange,
    ],
    [
      "Ending Cash Balance",
      latest.cash,
    ],
    [],
    ["Liquidity", ""],
    [
      "Working Capital",
      latest.workingCapital,
    ],
    ["Current Ratio", latest.currentRatio],
    ["Quick Ratio", latest.quickRatio],
    [],
    ["Leverage", ""],
    [
      "Debt to Equity",
      latest.debtToEquity,
    ],
    [
      "Debt to Assets",
      latest.debtToAssets,
    ],
  ];

  XLSX.utils.sheet_add_aoa(
    worksheet,
    rows,
    { origin: "A5" }
  );

  autoWidth(worksheet);

  return worksheet;
}

function createTrendsSheet(
  history: FinancialRecord[]
): XLSX.WorkSheet {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  addTitle(
    worksheet,
    "Financial Trends",
    `${history.length} reporting record(s)`
  );

  const rows: unknown[][] = [
    [],
    [
      "Date",
      "Revenue",
      "Gross Profit",
      "Operating Profit",
      "Net Income",
      "Cash",
      "Operating Cash Flow",
      "Net Margin",
    ],
  ];

  for (const item of history) {
    rows.push([
      item.inputDate,
      item.revenue,
      item.grossProfit,
      item.operatingProfit,
      item.netIncome,
      item.cash,
      item.operatingCashFlow,
      item.netMargin,
    ]);
  }

  XLSX.utils.sheet_add_aoa(
    worksheet,
    rows,
    { origin: "A5" }
  );

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 6,
  };

  autoWidth(worksheet);

  return worksheet;
}

function createComparisonSheet(
  latest: FinancialRecord,
  previous: FinancialRecord | null
): XLSX.WorkSheet {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  addTitle(
    worksheet,
    "Period Comparison",
    previous
      ? `Current: ${latest.inputDate} | Previous: ${previous.inputDate}`
      : "No previous period available"
  );

  if (!previous) {
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [],
        [
          "There is not enough historical data for period comparison.",
        ],
      ],
      { origin: "A5" }
    );

    autoWidth(worksheet);

    return worksheet;
  }

  const comparisons: Array<
    [string, number, number]
  > = [
    [
      "Revenue",
      latest.revenue,
      previous.revenue,
    ],
    [
      "Gross Profit",
      latest.grossProfit,
      previous.grossProfit,
    ],
    [
      "Net Income",
      latest.netIncome,
      previous.netIncome,
    ],
    [
      "Cash",
      latest.cash,
      previous.cash,
    ],
    [
      "Total Assets",
      latest.totalAssets,
      previous.totalAssets,
    ],
    [
      "Total Liabilities",
      latest.totalLiabilities,
      previous.totalLiabilities,
    ],
    [
      "Total Equity",
      latest.totalEquity,
      previous.totalEquity,
    ],
  ];

  const rows: unknown[][] = [
    [],
    [
      "Metric",
      "Current",
      "Previous",
      "Change",
    ],
  ];

  for (const [
    label,
    current,
    prior,
  ] of comparisons) {
    rows.push([
      label,
      current,
      prior,
      current - prior,
    ]);
  }

  XLSX.utils.sheet_add_aoa(
    worksheet,
    rows,
    { origin: "A5" }
  );

  autoWidth(worksheet);

  return worksheet;
}

function createInsightsSheet(
  latest: FinancialRecord,
  recommendations: string[]
): XLSX.WorkSheet {
  const worksheet =
    XLSX.utils.aoa_to_sheet([]);

  addTitle(
    worksheet,
    "Insights & Recommendations",
    "Decision support based on reported financial data"
  );

  const insights: string[] = [];

  if (latest.netIncome > 0) {
    insights.push(
      `The business is profitable with a net margin of ${latest.netMargin.toFixed(1)}%.`
    );
  } else {
    insights.push(
      "The business is currently not profitable and requires profitability improvement."
    );
  }

  if (latest.operatingCashFlow > 0) {
    insights.push(
      "Operating activities are generating positive cash flow."
    );
  } else {
    insights.push(
      "Operating activities are consuming cash."
    );
  }

  if (
    latest.currentRatio !== null &&
    latest.currentRatio < 1
  ) {
    insights.push(
      "Current liabilities exceed current assets, indicating liquidity pressure."
    );
  } else if (
    latest.currentRatio !== null &&
    latest.currentRatio >= 2
  ) {
    insights.push(
      "The business has a strong current liquidity position."
    );
  }

  if (
    latest.debtToEquity !== null &&
    latest.debtToEquity > 2
  ) {
    insights.push(
      "Financial leverage is relatively high compared with shareholders' equity."
    );
  }

  if (latest.balanceStatus !== "Balanced") {
    insights.push(
      `The balance sheet is not balanced by ${latest.balanceDifference.toLocaleString("id-ID")}.`
    );
  } else {
    insights.push(
      "The balance sheet is balanced."
    );
  }

  const rows: unknown[][] = [
    [],
    ["KEY INSIGHTS"],
  ];

  for (const insight of insights) {
    rows.push([insight]);
  }

  rows.push([]);
  rows.push(["RECOMMENDATIONS"]);

  for (const recommendation of recommendations) {
    rows.push([recommendation]);
  }

  rows.push([]);
  rows.push(["IMPORTANT NOTE"]);
  rows.push([
    "This report is generated from Quick Input data.",
  ]);
  rows.push([
    "Financial figures are deterministic calculations and are not generated by AI.",
  ]);

  XLSX.utils.sheet_add_aoa(
    worksheet,
    rows,
    { origin: "A5" }
  );

  worksheet["!cols"] = [
    { width: 100 },
  ];

  return worksheet;
}

export async function GET() {
  try {
    const supabase =
      await createClient();

    /*
     * ==========================================================
     * AUTHENTICATION
     * ==========================================================
     */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    /*
     * ==========================================================
     * ACTIVE COMPANY
     * ==========================================================
     */

    const {
      data: membership,
      error: membershipError,
    } = await supabase
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
        "Excel membership error:",
        membershipError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to determine company membership.",
        },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your account is not connected to an active company.",
        },
        { status: 403 }
      );
    }

    const companyId =
      membership.company_id;

    /*
     * ==========================================================
     * LOAD FINANCIAL DATA
     * ==========================================================
     */

    const {
      data: rows,
      error: quickInputError,
    } = await supabase
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

    if (quickInputError) {
      console.error(
        "Excel quick_inputs error:",
        quickInputError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            quickInputError.message ||
            "Failed to load financial data.",
        },
        { status: 500 }
      );
    }

    const quickInputs =
      (rows ?? []) as QuickInputRow[];

    if (quickInputs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No financial data available for Excel export.",
        },
        { status: 404 }
      );
    }

    /*
     * ==========================================================
     * CALCULATE
     * ==========================================================
     */

    const history =
      quickInputs.map(calculate);

    const latest =
      history[history.length - 1];

    const previous =
      history.length > 1
        ? history[history.length - 2]
        : null;

    const health =
      calculateHealth(latest);

    const healthText =
      healthLabel(health);

    const recommendations =
      buildRecommendations(latest);

    /*
     * ==========================================================
     * CREATE WORKBOOK
     * ==========================================================
     */

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      createSummarySheet(
        latest,
        health,
        healthText
      ),
      "Executive Summary"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      createIncomeSheet(latest),
      "Income Statement"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      createBalanceSheet(latest),
      "Balance Sheet"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      createCashFlowSheet(latest),
      "Cash Flow & Ratios"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      createTrendsSheet(history),
      "Financial Trends"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      createComparisonSheet(
        latest,
        previous
      ),
      "Period Comparison"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      createInsightsSheet(
        latest,
        recommendations
      ),
      "Insights"
    );

    /*
     * ==========================================================
     * WRITE XLSX
     * ==========================================================
     */

    const workbookBuffer =
      XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

    const filename =
      `decisionly-financial-report-${latest.inputDate}.xlsx`;

    return new NextResponse(
      workbookBuffer,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Excel export error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}

