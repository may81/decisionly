import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import { createClient } from "@/lib/supabase/server";

/* ============================================================
 * TYPES
 * ========================================================== */

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

type FinancialRecord = ReturnType<typeof calculateFinancials>;

type MetricRow = [string, number | null];

type ComparisonRow = [
  string,
  number | null,
  number | null,
];

/* ============================================================
 * CONSTANTS
 * ========================================================== */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const MARGIN_LEFT = 45;
const MARGIN_RIGHT = 45;

const CONTENT_TOP = 685;
const FOOTER_Y = 28;

const TEXT_COLOR = rgb(0.12, 0.12, 0.12);
const MUTED_COLOR = rgb(0.45, 0.45, 0.45);
const PRIMARY_COLOR = rgb(0.08, 0.22, 0.45);
const LINE_COLOR = rgb(0.82, 0.84, 0.88);

const SUCCESS_COLOR = rgb(0.1, 0.45, 0.25);
const WARNING_COLOR = rgb(0.75, 0.48, 0.05);
const DANGER_COLOR = rgb(0.7, 0.15, 0.15);

/* ============================================================
 * HELPERS
 * ========================================================== */

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return value.toLocaleString("id-ID", {
    maximumFractionDigits: 0,
  });
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return value.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toFixed(1)}%`;
}

/* ============================================================
 * FINANCIAL CALCULATION
 * ========================================================== */

function calculateFinancials(row: QuickInputRow) {
  /* -------------------------
   * Income Statement
   * ----------------------- */

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

  /* -------------------------
   * Assets
   * ----------------------- */

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

  /* -------------------------
   * Liabilities
   * ----------------------- */

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

  /* -------------------------
   * Equity
   * ----------------------- */

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

  /* -------------------------
   * Cash Flow
   * ----------------------- */

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

  /* -------------------------
   * Ratios
   * ----------------------- */

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

/* ============================================================
 * FINANCIAL HEALTH
 * ========================================================== */

function calculateHealth(
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

  /* Cash Flow */

  if (latest.operatingCashFlow > 0) {
    score += 12;
  } else if (latest.operatingCashFlow < 0) {
    score -= 12;
  }

  /* Liquidity */

  if (latest.currentRatio !== null) {
    if (latest.currentRatio >= 2) {
      score += 10;
    } else if (latest.currentRatio >= 1) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  /* Leverage */

  if (latest.debtToEquity !== null) {
    if (latest.debtToEquity <= 1) {
      score += 8;
    } else if (latest.debtToEquity <= 2) {
      score += 2;
    } else {
      score -= 8;
    }
  }

  /* Balance Sheet */

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

function getHealthLabel(score: number): string {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 65) {
    return "Healthy";
  }

  if (score >= 50) {
    return "Watch";
  }

  return "Needs Attention";
}

function getHealthColor(score: number) {
  if (score >= 65) {
    return SUCCESS_COLOR;
  }

  if (score >= 50) {
    return WARNING_COLOR;
  }

  return DANGER_COLOR;
}

/* ============================================================
 * RECOMMENDATIONS
 * ========================================================== */

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

  if (
    latest.balanceStatus !== "Balanced"
  ) {
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

/* ============================================================
 * PDF DRAWING HELPERS
 * ========================================================== */

function addText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = TEXT_COLOR
) {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color,
  });
}

function drawHeader(
  page: PDFPage,
  title: string,
  subtitle: string,
  boldFont: PDFFont,
  regularFont: PDFFont
) {
  const { width, height } =
    page.getSize();

  addText(
    page,
    "DECISIONLY",
    MARGIN_LEFT,
    height - 50,
    18,
    boldFont,
    PRIMARY_COLOR
  );

  addText(
    page,
    title,
    MARGIN_LEFT,
    height - 82,
    20,
    boldFont
  );

  if (subtitle) {
    addText(
      page,
      subtitle,
      MARGIN_LEFT,
      height - 102,
      9,
      regularFont,
      rgb(0.4, 0.4, 0.4)
    );
  }

  page.drawLine({
    start: {
      x: MARGIN_LEFT,
      y: height - 115,
    },
    end: {
      x: width - MARGIN_RIGHT,
      y: height - 115,
    },
    thickness: 1,
    color: LINE_COLOR,
  });
}

function drawFooter(
  page: PDFPage,
  pageNumber: number,
  regularFont: PDFFont
) {
  const { width } =
    page.getSize();

  addText(
    page,
    "Decisionly Financial Report",
    MARGIN_LEFT,
    FOOTER_Y,
    7,
    regularFont,
    MUTED_COLOR
  );

  addText(
    page,
    `Page ${pageNumber}`,
    width - 85,
    FOOTER_Y,
    7,
    regularFont,
    MUTED_COLOR
  );
}

function drawSectionTitle(
  page: PDFPage,
  title: string,
  y: number,
  boldFont: PDFFont
): number {
  addText(
    page,
    title,
    MARGIN_LEFT,
    y,
    13,
    boldFont,
    PRIMARY_COLOR
  );

  return y - 22;
}

function drawMetricRow(
  page: PDFPage,
  label: string,
  value: string,
  y: number,
  regularFont: PDFFont,
  boldFont: PDFFont
): number {
  addText(
    page,
    label,
    55,
    y,
    9,
    regularFont
  );

  addText(
    page,
    value,
    330,
    y,
    9,
    boldFont
  );

  return y - 18;
}

function drawBullet(
  page: PDFPage,
  text: string,
  y: number,
  regularFont: PDFFont,
  boldFont: PDFFont
): number {
  addText(
    page,
    "•",
    55,
    y,
    9,
    boldFont
  );

  addText(
    page,
    text,
    68,
    y,
    8,
    regularFont
  );

  return y - 28;
}

/* ============================================================
 * ROUTE
 * ========================================================== */

export async function GET() {
  try {
    const supabase =
      await createClient();

    /* ========================================================
     * AUTHENTICATION
     * ====================================================== */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        "PDF authentication error:",
        authError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed.",
        },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    /* ========================================================
     * ACTIVE COMPANY
     * ====================================================== */

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("company_members")
      .select(
        "company_id, user_id, role"
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("joined_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "PDF membership error:",
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

    /* ========================================================
     * LOAD QUICK INPUT DATA
     * ====================================================== */

    const {
      data: rows,
      error: quickInputError,
    } = await supabase
      .from("quick_inputs")
      .select("*")
      .eq("company_id", companyId)
      .order("input_date", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (quickInputError) {
      console.error(
        "PDF quick_inputs error:",
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
            "No financial data available for PDF export.",
        },
        { status: 404 }
      );
    }

    /* ========================================================
     * CALCULATE FINANCIAL HISTORY
     * ====================================================== */

    const history =
      quickInputs.map(
        calculateFinancials
      );

    const latest =
      history[history.length - 1];

    const previous =
      history.length > 1
        ? history[history.length - 2]
        : null;

    const health =
      calculateHealth(latest);

    const healthText =
      getHealthLabel(health);

    const healthColor =
      getHealthColor(health);

    const recommendations =
      buildRecommendations(latest);

    /* ========================================================
     * CREATE PDF
     * ====================================================== */

    const pdf =
      await PDFDocument.create();

    const regularFont =
      await pdf.embedFont(
        StandardFonts.Helvetica
      );

    const boldFont =
      await pdf.embedFont(
        StandardFonts.HelveticaBold
      );

    let pageNumber = 0;

    const createPage = (
      title: string,
      subtitle = ""
    ): PDFPage => {
      const page =
        pdf.addPage([
          PAGE_WIDTH,
          PAGE_HEIGHT,
        ]);

      pageNumber++;

      drawHeader(
        page,
        title,
        subtitle,
        boldFont,
        regularFont
      );

      drawFooter(
        page,
        pageNumber,
        regularFont
      );

      return page;
    };

    /* ========================================================
     * PAGE 1 — EXECUTIVE SUMMARY
     * ====================================================== */

    {
      const page = createPage(
        "Financial Report",
        `Reporting date: ${latest.inputDate}`
      );

      let y = CONTENT_TOP;

      y = drawSectionTitle(
        page,
        "Executive Summary",
        y,
        boldFont
      );

      addText(
        page,
        `Financial Health: ${healthText}`,
        55,
        y,
        14,
        boldFont,
        healthColor
      );

      addText(
        page,
        `${health}/100`,
        430,
        y,
        14,
        boldFont
      );

      y -= 40;

      let headline =
        "Financial position requires attention.";

      if (
        latest.netIncome > 0 &&
        latest.operatingCashFlow > 0 &&
        latest.balanceStatus === "Balanced"
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

      addText(
        page,
        headline,
        55,
        y,
        12,
        boldFont
      );

      y -= 35;

      const summaryMetrics: MetricRow[] = [
        ["Revenue", latest.revenue],
        ["Gross Profit", latest.grossProfit],
        ["Operating Profit", latest.operatingProfit],
        ["Net Income", latest.netIncome],
        ["Cash", latest.cash],
        [
          "Operating Cash Flow",
          latest.operatingCashFlow,
        ],
      ];

      for (const [label, value] of summaryMetrics) {
        y = drawMetricRow(
          page,
          label,
          formatMoney(value),
          y,
          regularFont,
          boldFont
        );
      }

      y -= 15;

      y = drawSectionTitle(
        page,
        "Key Ratios",
        y,
        boldFont
      );

      const ratioMetrics: Array<
        [string, string]
      > = [
        [
          "Gross Margin",
          formatPercent(
            latest.grossMargin
          ),
        ],
        [
          "Operating Margin",
          formatPercent(
            latest.operatingMargin
          ),
        ],
        [
          "Net Margin",
          formatPercent(
            latest.netMargin
          ),
        ],
        [
          "Current Ratio",
          formatNumber(
            latest.currentRatio
          ),
        ],
        [
          "Quick Ratio",
          formatNumber(
            latest.quickRatio
          ),
        ],
        [
          "Debt to Equity",
          formatNumber(
            latest.debtToEquity
          ),
        ],
      ];

      for (const [label, value] of ratioMetrics) {
        y = drawMetricRow(
          page,
          label,
          value,
          y,
          regularFont,
          boldFont
        );
      }

      y -= 15;

      y = drawSectionTitle(
        page,
        "Balance Sheet Integrity",
        y,
        boldFont
      );

      const balanceMetrics: Array<
        [string, string]
      > = [
        [
          "Total Assets",
          formatMoney(
            latest.totalAssets
          ),
        ],
        [
          "Liabilities + Equity",
          formatMoney(
            latest.liabilitiesAndEquity
          ),
        ],
        [
          "Balance Difference",
          formatMoney(
            latest.balanceDifference
          ),
        ],
        [
          "Status",
          latest.balanceStatus,
        ],
      ];

      for (const [label, value] of balanceMetrics) {
        y = drawMetricRow(
          page,
          label,
          value,
          y,
          regularFont,
          boldFont
        );
      }
    }

    /* ========================================================
     * PAGE 2 — INCOME STATEMENT
     * ====================================================== */

    {
      const page = createPage(
        "Income Statement",
        `Quick Input: ${latest.quickInputCode}`
      );

      let y = CONTENT_TOP;

      y = drawSectionTitle(
        page,
        "Income Statement",
        y,
        boldFont
      );

      const incomeRows: MetricRow[] = [
        ["Revenue", latest.revenue],
        [
          "Cost of Sales",
          latest.costOfSales,
        ],
        [
          "Gross Profit",
          latest.grossProfit,
        ],
        [
          "Operating Expenses",
          latest.operatingExpenses,
        ],
        [
          "Operating Profit",
          latest.operatingProfit,
        ],
        [
          "Other Income",
          latest.otherIncome,
        ],
        [
          "Other Expenses",
          latest.otherExpenses,
        ],
        [
          "Net Income",
          latest.netIncome,
        ],
      ];

      for (const [label, value] of incomeRows) {
        y = drawMetricRow(
          page,
          label,
          formatMoney(value),
          y,
          regularFont,
          boldFont
        );
      }

      y -= 20;

      y = drawSectionTitle(
        page,
        "Margins",
        y,
        boldFont
      );

      const marginRows: Array<
        [string, number]
      > = [
        [
          "Gross Margin",
          latest.grossMargin,
        ],
        [
          "Operating Margin",
          latest.operatingMargin,
        ],
        [
          "Net Margin",
          latest.netMargin,
        ],
      ];

      for (const [label, value] of marginRows) {
        y = drawMetricRow(
          page,
          label,
          formatPercent(value),
          y,
          regularFont,
          boldFont
        );
      }
    }

    /* ========================================================
     * PAGE 3 — BALANCE SHEET
     * ====================================================== */

    {
      const page = createPage(
        "Balance Sheet",
        `Reporting date: ${latest.inputDate}`
      );

      let y = CONTENT_TOP;

      y = drawSectionTitle(
        page,
        "Assets",
        y,
        boldFont
      );

      const assetRows: MetricRow[] = [
        ["Cash", latest.cash],
        [
          "Accounts Receivable",
          latest.accountsReceivable,
        ],
        [
          "Inventory",
          latest.inventory,
        ],
        [
          "Other Current Assets",
          latest.otherCurrentAssets,
        ],
        [
          "Prepaid Expenses",
          latest.prepaidExpenses,
        ],
        [
          "Current Assets",
          latest.currentAssets,
        ],
        [
          "Fixed Assets",
          latest.fixedAssets,
        ],
        [
          "Other Non-Current Assets",
          latest.otherNonCurrentAssets,
        ],
        [
          "Non-Current Assets",
          latest.nonCurrentAssets,
        ],
        [
          "Total Assets",
          latest.totalAssets,
        ],
      ];

      for (const [label, value] of assetRows) {
        y = drawMetricRow(
          page,
          label,
          formatMoney(value),
          y,
          regularFont,
          boldFont
        );
      }

      y -= 15;

      y = drawSectionTitle(
        page,
        "Liabilities",
        y,
        boldFont
      );

      const liabilityRows: MetricRow[] = [
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
      ];

      for (const [label, value] of liabilityRows) {
        y = drawMetricRow(
          page,
          label,
          formatMoney(value),
          y,
          regularFont,
          boldFont
        );
      }

      y -= 15;

      y = drawSectionTitle(
        page,
        "Equity",
        y,
        boldFont
      );

      const equityRows: MetricRow[] = [
        [
          "Share Capital",
          latest.shareCapital,
        ],
        [
          "Retained Earnings",
          latest.retainedEarnings,
        ],
        [
          "Other Equity",
          latest.otherEquity,
        ],
        [
          "Total Equity",
          latest.totalEquity,
        ],
      ];

      for (const [label, value] of equityRows) {
        y = drawMetricRow(
          page,
          label,
          formatMoney(value),
          y,
          regularFont,
          boldFont
        );
      }

      y -= 10;

      drawMetricRow(
        page,
        "Liabilities + Equity",
        formatMoney(
          latest.liabilitiesAndEquity
        ),
        y,
        regularFont,
        boldFont
      );
    }

    /* ========================================================
     * PAGE 4 — CASH FLOW & RATIOS
     * ====================================================== */

    {
      const page = createPage(
        "Cash Flow & Ratios",
        `Reporting date: ${latest.inputDate}`
      );

      let y = CONTENT_TOP;

      y = drawSectionTitle(
        page,
        "Cash Flow",
        y,
        boldFont
      );

      const cashFlowRows: MetricRow[] = [
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
      ];

      for (const [label, value] of cashFlowRows) {
        y = drawMetricRow(
          page,
          label,
          formatMoney(value),
          y,
          regularFont,
          boldFont
        );
      }

      y -= 20;

      y = drawSectionTitle(
        page,
        "Liquidity",
        y,
        boldFont
      );

      const liquidityRows: Array<
        [string, string]
      > = [
        [
          "Working Capital",
          formatMoney(
            latest.workingCapital
          ),
        ],
        [
          "Current Ratio",
          formatNumber(
            latest.currentRatio
          ),
        ],
        [
          "Quick Ratio",
          formatNumber(
            latest.quickRatio
          ),
        ],
      ];

      for (const [label, value] of liquidityRows) {
        y = drawMetricRow(
          page,
          label,
          value,
          y,
          regularFont,
          boldFont
        );
      }

      y -= 20;

      y = drawSectionTitle(
        page,
        "Leverage",
        y,
        boldFont
      );

      const leverageRows: Array<
        [string, string]
      > = [
        [
          "Debt to Equity",
          formatNumber(
            latest.debtToEquity
          ),
        ],
        [
          "Debt to Assets",
          formatNumber(
            latest.debtToAssets
          ),
        ],
      ];

      for (const [label, value] of leverageRows) {
        y = drawMetricRow(
          page,
          label,
          value,
          y,
          regularFont,
          boldFont
        );
      }
    }

    /* ========================================================
     * PAGE 5 — TRENDS
     * ====================================================== */

    {
      const page = createPage(
        "Financial Trends",
        `${history.length} reporting record(s)`
      );

      let y = CONTENT_TOP;

      y = drawSectionTitle(
        page,
        "Historical Financial Performance",
        y,
        boldFont
      );

      addText(
        page,
        "Date",
        50,
        y,
        8,
        boldFont
      );

      addText(
        page,
        "Revenue",
        130,
        y,
        8,
        boldFont
      );

      addText(
        page,
        "Gross Profit",
        225,
        y,
        8,
        boldFont
      );

      addText(
        page,
        "Net Income",
        325,
        y,
        8,
        boldFont
      );

      addText(
        page,
        "Cash",
        430,
        y,
        8,
        boldFont
      );

      y -= 18;

      for (const item of history) {
        if (y < 70) {
          break;
        }

        addText(
          page,
          item.inputDate,
          50,
          y,
          7,
          regularFont
        );

        addText(
          page,
          formatMoney(item.revenue),
          130,
          y,
          7,
          regularFont
        );

        addText(
          page,
          formatMoney(
            item.grossProfit
          ),
          225,
          y,
          7,
          regularFont
        );

        addText(
          page,
          formatMoney(
            item.netIncome
          ),
          325,
          y,
          7,
          regularFont
        );

        addText(
          page,
          formatMoney(item.cash),
          430,
          y,
          7,
          regularFont
        );

        y -= 16;
      }

      y -= 20;

      y = drawSectionTitle(
        page,
        "Latest Margins",
        y,
        boldFont
      );

      y = drawMetricRow(
        page,
        "Gross Margin",
        formatPercent(
          latest.grossMargin
        ),
        y,
        regularFont,
        boldFont
      );

      y = drawMetricRow(
        page,
        "Operating Margin",
        formatPercent(
          latest.operatingMargin
        ),
        y,
        regularFont,
        boldFont
      );

      drawMetricRow(
        page,
        "Net Margin",
        formatPercent(
          latest.netMargin
        ),
        y,
        regularFont,
        boldFont
      );
    }

    /* ========================================================
     * PAGE 6 — PERIOD COMPARISON
     * ====================================================== */

    if (previous) {
      const page = createPage(
        "Period Comparison",
        `Current: ${latest.inputDate} | Previous: ${previous.inputDate}`
      );

      let y = CONTENT_TOP;

      y = drawSectionTitle(
        page,
        "Current vs Previous",
        y,
        boldFont
      );

      const comparisons: ComparisonRow[] = [
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

      addText(
        page,
        "Metric",
        50,
        y,
        8,
        boldFont
      );

      addText(
        page,
        "Current",
        190,
        y,
        8,
        boldFont
      );

      addText(
        page,
        "Previous",
        290,
        y,
        8,
        boldFont
      );

      addText(
        page,
        "Change",
        390,
        y,
        8,
        boldFont
      );

      y -= 20;

      for (const [
        label,
        current,
        prior,
      ] of comparisons) {
        const currentValue =
          current ?? 0;

        const priorValue =
          prior ?? 0;

        const change =
          currentValue -
          priorValue;

        addText(
          page,
          label,
          50,
          y,
          8,
          regularFont
        );

        addText(
          page,
          formatMoney(current),
          190,
          y,
          8,
          regularFont
        );

        addText(
          page,
          formatMoney(prior),
          290,
          y,
          8,
          regularFont
        );

        addText(
          page,
          formatMoney(change),
          390,
          y,
          8,
          boldFont
        );

        y -= 20;
      }
    }

    /* ========================================================
     * PAGE 7 — INSIGHTS & RECOMMENDATIONS
     * ====================================================== */

    {
      const page = createPage(
        "Insights & Recommendations",
        "Decision support based on reported financial data"
      );

      let y = CONTENT_TOP;

      y = drawSectionTitle(
        page,
        "Key Insights",
        y,
        boldFont
      );

      const insights: string[] = [];

      if (latest.netIncome > 0) {
        insights.push(
          `The business is profitable with a net margin of ${formatPercent(
            latest.netMargin
          )}.`
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

      if (
        latest.balanceStatus !== "Balanced"
      ) {
        insights.push(
          `The balance sheet is not balanced by ${formatMoney(
            latest.balanceDifference
          )}.`
        );
      } else {
        insights.push(
          "The balance sheet is balanced."
        );
      }

      for (const insight of insights) {
        y = drawBullet(
          page,
          insight,
          y,
          regularFont,
          boldFont
        );
      }

      y -= 10;

      y = drawSectionTitle(
        page,
        "Recommendations",
        y,
        boldFont
      );

      for (const recommendation of recommendations) {
        y = drawBullet(
          page,
          recommendation,
          y,
          regularFont,
          boldFont
        );

        y -= 10;
      }

      y -= 5;

      y = drawSectionTitle(
        page,
        "Important Note",
        y,
        boldFont
      );

      addText(
        page,
        "This report is generated from Quick Input data.",
        55,
        y,
        8,
        regularFont
      );

      y -= 15;

      addText(
        page,
        "Financial figures are deterministic calculations and are not generated by AI.",
        55,
        y,
        8,
        regularFont
      );
    }

    /* ========================================================
     * SAVE PDF
     * ====================================================== */

    const pdfBytes =
      await pdf.save();

    const filename =
      `decisionly-financial-report-${latest.inputDate}.pdf`;

    return new NextResponse(
      Buffer.from(pdfBytes),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",

          Pragma: "no-cache",

          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "PDF export unexpected error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}