import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ReportResponse = {
  success: boolean;
  hasFinancialData: boolean;

  companyId: string;
  userId: string;

  recordCount: number;
  reportDate: string;

  latest: any;
  previous: any;

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
  };

  balanceSheet: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    currentAssets: number;
    nonCurrentAssets: number;
    totalAssets: number;

    accountsPayable: number;
    currentLiabilities: number;
    totalLiabilities: number;

    totalEquity: number;
    workingCapital: number;

    currentRatio: number | null;
    quickRatio: number | null;
    debtToEquity: number | null;
    debtToAssets: number | null;

    balanceDifference: number;
    balanceStatus: "balanced" | "unbalanced";
  };

  cashFlow: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashChange: number;
    cashBalance: number;
  };

  comparison: any;
  trends: any[];

  insights: any[];

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

  recommendations?: {
    priority: "high" | "medium" | "low";
    title: string;
    message: string;
  }[];

  error?: string;
};

function json(
  body: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function money(value: unknown) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "Rp 0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function percent(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "-";
  }

  return `${parsed.toFixed(1)}%`;
}

function ratio(value: unknown) {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "-";
  }

  return parsed.toFixed(2);
}

function change(
  current: unknown,
  previous: unknown
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

function changeText(
  current: unknown,
  previous: unknown,
  label: string
) {
  const value = change(
    current,
    previous
  );

  if (value === null) {
    return `${label} belum dapat dibandingkan karena nilai periode sebelumnya adalah nol.`;
  }

  if (value > 0) {
    return `${label} meningkat ${value.toFixed(
      1
    )}% dibanding periode sebelumnya.`;
  }

  if (value < 0) {
    return `${label} menurun ${Math.abs(
      value
    ).toFixed(
      1
    )}% dibanding periode sebelumnya.`;
  }

  return `${label} tidak berubah dibanding periode sebelumnya.`;
}

/*
|--------------------------------------------------------------------------
| Fetch /api/report
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| /api/report adalah SINGLE SOURCE OF TRUTH untuk financial metrics.
|
| Route AI TIDAK menghitung ulang:
|
| - Revenue
| - Gross Profit
| - Net Income
| - Working Capital
| - Current Ratio
| - Quick Ratio
| - Debt / Equity
| - Debt / Assets
| - Cash Flow
| - Financial Health
|
| Semua metric tersebut langsung berasal dari /api/report.
|
*/

async function getReport(
  request: NextRequest
): Promise<ReportResponse> {
  const origin =
    request.nextUrl.origin;

  const response =
    await fetch(
      `${origin}/api/report`,
      {
        method: "GET",

        headers: {
          cookie:
            request.headers.get(
              "cookie"
            ) ?? "",
        },

        cache: "no-store",
      }
    );

  const data =
    (await response.json()) as ReportResponse;

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to load financial report."
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Generate deterministic business analysis
|--------------------------------------------------------------------------
|
| Tidak menggunakan OpenAI.
|
| Analysis menggunakan metric yang langsung
| berasal dari /api/report.
|
*/

function generateAnalysis(
  report: ReportResponse
) {
  if (
    !report.hasFinancialData ||
    !report.latest
  ) {
    return null;
  }

  const income =
    report.incomeStatement;

  const balance =
    report.balanceSheet;

  const cashFlow =
    report.cashFlow;

  const previous =
    report.previous;

  const sections: string[] = [];

  /*
  |--------------------------------------------------------------------------
  | EXECUTIVE SUMMARY
  |--------------------------------------------------------------------------
  */

  const headline =
    income.netIncome >= 0
      ? "The latest financial period shows positive profitability."
      : "The latest financial period shows a net loss.";

  const summary = [
    `Revenue is ${money(
      income.revenue
    )} with net income of ${money(
      income.netIncome
    )}.`,

    `Net margin is ${percent(
      income.netMargin
    )}.`,

    `Operating cash flow is ${money(
      cashFlow.operatingCashFlow
    )}.`,

    balance.balanceStatus ===
    "balanced"
      ? "The balance sheet is mathematically balanced based on the supplied financial data."
      : "The balance sheet is not mathematically balanced and requires review.",

    report.recordCount === 1
      ? "Only one Quick Input record is available, so historical trend analysis is limited."
      : `${report.recordCount} Quick Input records are available for historical analysis.`,
  ].join(" ");

  sections.push(
    [
      "## EXECUTIVE SUMMARY",
      "",
      headline,
      "",
      summary,
    ].join("\n")
  );

  /*
  |--------------------------------------------------------------------------
  | FINANCIAL PERFORMANCE
  |--------------------------------------------------------------------------
  */

  const performanceLines = [
    `Revenue: ${money(
      income.revenue
    )}.`,
    `Cost of Sales: ${money(
      income.costOfSales
    )}.`,
    `Gross Profit: ${money(
      income.grossProfit
    )}.`,
    `Gross Margin: ${percent(
      income.grossMargin
    )}.`,
    `Operating Expenses: ${money(
      income.operatingExpenses
    )}.`,
    `Operating Profit: ${money(
      income.operatingProfit
    )}.`,
    `Operating Margin: ${percent(
      income.operatingMargin
    )}.`,
    `Net Income: ${money(
      income.netIncome
    )}.`,
    `Net Margin: ${percent(
      income.netMargin
    )}.`,
  ];

  if (previous) {
    performanceLines.push(
      changeText(
        income.revenue,
        report.previous?.revenue,
        "Revenue"
      )
    );

    performanceLines.push(
      changeText(
        income.netIncome,
        report.previous?.netIncome,
        "Net income"
      )
    );
  }

  sections.push(
    [
      "## FINANCIAL PERFORMANCE",
      "",
      ...performanceLines,
    ].join("\n")
  );

  /*
  |--------------------------------------------------------------------------
  | LIQUIDITY
  |--------------------------------------------------------------------------
  */

  const liquidityLines = [
    `Cash: ${money(
      balance.cash
    )}.`,

    `Working Capital: ${money(
      balance.workingCapital
    )}.`,

    `Current Ratio: ${ratio(
      balance.currentRatio
    )}.`,

    `Quick Ratio: ${ratio(
      balance.quickRatio
    )}.`,
  ];

  if (
    balance.workingCapital >= 0
  ) {
    liquidityLines.push(
      "Current assets exceed current liabilities based on the latest reporting data."
    );
  } else {
    liquidityLines.push(
      "Current liabilities exceed current assets based on the latest reporting data and liquidity should be reviewed."
    );
  }

  sections.push(
    [
      "## LIQUIDITY",
      "",
      ...liquidityLines,
    ].join("\n")
  );

  /*
  |--------------------------------------------------------------------------
  | BALANCE SHEET
  |--------------------------------------------------------------------------
  */

  const balanceLines = [
    `Total Assets: ${money(
      balance.totalAssets
    )}.`,

    `Total Liabilities: ${money(
      balance.totalLiabilities
    )}.`,

    `Total Equity: ${money(
      balance.totalEquity
    )}.`,

    `Debt / Equity: ${ratio(
      balance.debtToEquity
    )}.`,

    `Debt / Assets: ${ratio(
      balance.debtToAssets
    )}.`,

    balance.balanceStatus ===
    "balanced"
      ? "Balance sheet status: Balanced."
      : `Balance sheet status: Unbalanced. Difference: ${money(
          balance.balanceDifference
        )}.`,
  ];

  sections.push(
    [
      "## BALANCE SHEET",
      "",
      ...balanceLines,
    ].join("\n")
  );

  /*
  |--------------------------------------------------------------------------
  | CASH FLOW
  |--------------------------------------------------------------------------
  */

  const cashFlowLines = [
    `Operating Cash Flow: ${money(
      cashFlow.operatingCashFlow
    )}.`,

    `Investing Cash Flow: ${money(
      cashFlow.investingCashFlow
    )}.`,

    `Financing Cash Flow: ${money(
      cashFlow.financingCashFlow
    )}.`,

    `Net Cash Change: ${money(
      cashFlow.netCashChange
    )}.`,

    `Cash Balance: ${money(
      cashFlow.cashBalance
    )}.`,
  ];

  if (
    cashFlow.operatingCashFlow >
    0
  ) {
    cashFlowLines.push(
      "Operating activities generated positive cash during the latest period."
    );
  } else if (
    cashFlow.operatingCashFlow <
    0
  ) {
    cashFlowLines.push(
      "Operating activities consumed cash during the latest period and should be reviewed."
    );
  } else {
    cashFlowLines.push(
      "Operating cash flow was neutral during the latest period."
    );
  }

  sections.push(
    [
      "## CASH FLOW",
      "",
      ...cashFlowLines,
    ].join("\n")
  );

  /*
  |--------------------------------------------------------------------------
  | TREND
  |--------------------------------------------------------------------------
  */

  const trendLines: string[] = [];

  if (report.recordCount <= 1) {
    trendLines.push(
      "Historical trend analysis is limited because only one Quick Input record is available."
    );
  } else if (previous) {
    trendLines.push(
      changeText(
        income.revenue,
        report.previous?.revenue,
        "Revenue"
      )
    );

    trendLines.push(
      changeText(
        income.netIncome,
        report.previous?.netIncome,
        "Net income"
      )
    );

    trendLines.push(
      changeText(
        balance.cash,
        report.previous?.cash,
        "Cash"
      )
    );
  }

  sections.push(
    [
      "## TREND",
      "",
      ...trendLines,
    ].join("\n")
  );

  /*
  |--------------------------------------------------------------------------
  | KEY RISKS
  |--------------------------------------------------------------------------
  */

  const risks: string[] = [];

  if (
    balance.balanceStatus !==
    "balanced"
  ) {
    risks.push(
      `Balance sheet difference of ${money(
        balance.balanceDifference
      )} requires review.`
    );
  }

  if (
    income.netIncome < 0
  ) {
    risks.push(
      "The latest reporting period generated a net loss."
    );
  }

  if (
    cashFlow.operatingCashFlow <
    0
  ) {
    risks.push(
      "Operating activities generated negative cash flow."
    );
  }

  if (
    balance.workingCapital < 0
  ) {
    risks.push(
      "Working capital is negative, indicating pressure on short-term financial resources."
    );
  }

  if (
    risks.length === 0
  ) {
    risks.push(
      "No major red flag was identified from the available rule-based financial checks."
    );
  }

  sections.push(
    [
      "## KEY RISKS",
      "",
      ...risks.map(
        (item) => `- ${item}`
      ),
    ].join("\n")
  );

  /*
  |--------------------------------------------------------------------------
  | OPPORTUNITIES
  |--------------------------------------------------------------------------
  */

  const opportunities: string[] =
    [];

  if (
    income.grossMargin > 0
  ) {
    opportunities.push(
      "Maintain or improve gross margin through pricing discipline, product mix, and cost-of-sales control."
    );
  }

  if (
    income.operatingProfit >
    0
  ) {
    opportunities.push(
      "Review operating expenses to identify opportunities for more efficient allocation of resources."
    );
  }

  if (
    cashFlow.operatingCashFlow >
    0
  ) {
    opportunities.push(
      "Use positive operating cash generation to strengthen liquidity and support operating needs."
    );
  }

  if (
    opportunities.length === 0
  ) {
    opportunities.push(
      "Additional financial periods are needed to identify stronger evidence-based opportunities."
    );
  }

  sections.push(
    [
      "## OPPORTUNITIES",
      "",
      ...opportunities.map(
        (item) => `- ${item}`
      ),
    ].join("\n")
  );

  /*
  |--------------------------------------------------------------------------
  | RECOMMENDED ACTIONS
  |--------------------------------------------------------------------------
  */

  const actions: string[] = [];

  if (
    balance.accountsReceivable >
    0
  ) {
    actions.push(
      "Review accounts receivable aging and collection timing to improve conversion of revenue into cash."
    );
  }

  if (
    balance.workingCapital <
    0
  ) {
    actions.push(
      "Prioritize short-term liquidity management and review upcoming current liabilities."
    );
  }

  if (
    cashFlow.operatingCashFlow <
    0
  ) {
    actions.push(
      "Review the main operating cash outflows and identify actions to improve operating cash generation."
    );
  }

  if (
    income.operatingExpenses >
    0
  ) {
    actions.push(
      "Review operating expenses regularly and distinguish growth-supporting costs from discretionary spending."
    );
  }

  if (
    actions.length === 0
  ) {
    actions.push(
      "Continue monitoring profitability, liquidity, cash flow, and balance sheet movements in the next Quick Input."
    );
  }

  sections.push(
    [
      "## RECOMMENDED ACTIONS",
      "",
      ...actions.map(
        (item, index) =>
          `${index + 1}. ${item}`
      ),
    ].join("\n")
  );

  return sections.join(
    "\n\n"
  );
}

/*
|--------------------------------------------------------------------------
| Main handler
|--------------------------------------------------------------------------
*/

async function handleAIRequest(
  request: NextRequest
) {
  try {
    /*
     * Verify user session before accessing report.
     */

    const supabase =
      await createClient();

    const {
      data: { user },
      error,
    } =
      await supabase.auth.getUser();

    if (error || !user) {
      return json(
        {
          success: false,
          error: "Unauthorized.",
        },
        401
      );
    }

    /*
     * Get financial metrics from /api/report.
     */

    const report =
      await getReport(request);

    if (
      !report.success
    ) {
      return json(
        {
          success: false,
          error:
            report.error ||
            "Unable to load financial report.",
        },
        500
      );
    }

    /*
     * No financial data.
     */

    if (
      !report.hasFinancialData
    ) {
      return json({
        success: true,
        hasFinancialData: false,

        companyId:
          report.companyId,

        userId:
          user.id,

        recordCount: 0,

        analysis: null,

        generatedAt:
          new Date().toISOString(),
      });
    }

    /*
     * Generate analysis directly from
     * /api/report metrics.
     */

    const analysis =
      generateAnalysis(report);

    if (!analysis) {
      return json(
        {
          success: false,
          error:
            "Unable to generate financial analysis.",
        },
        500
      );
    }

    /*
     * Return the same financial structures
     * used by /api/report.
     */

    return json({
      success: true,

      hasFinancialData: true,

      companyId:
        report.companyId,

      userId:
        user.id,

      recordCount:
        report.recordCount,

      reportDate:
        report.reportDate,

      latest:
        report.latest,

      previous:
        report.previous,

      incomeStatement:
        report.incomeStatement,

      balanceSheet:
        report.balanceSheet,

      cashFlow:
        report.cashFlow,

      comparison:
        report.comparison,

      trends:
        report.trends,

      insights:
        report.insights,

      financialHealth:
        report.financialHealth,

      financialHealthLabel:
        report.financialHealthLabel,

      financialHealthStatus:
        report.financialHealthStatus,

      executiveSummary:
        report.executiveSummary,

      recommendations:
        report.recommendations,

      analysis,

      generatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "AI route error:",
      error
    );

    return json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      500
    );
  }
}

export async function GET(
  request: NextRequest
) {
  return handleAIRequest(
    request
  );
}

export async function POST(
  request: NextRequest
) {
  return handleAIRequest(
    request
  );
}