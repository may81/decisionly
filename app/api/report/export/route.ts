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

function n(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculate(row: QuickInputRow) {
  const revenue = n(row.revenue);
  const costOfSales = n(row.cost_of_sales);
  const operatingExpenses = n(row.operating_expenses);
  const otherIncome = n(row.other_income);
  const otherExpenses = n(row.other_expenses);

  const grossProfit =
    revenue - costOfSales;

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

  const cash = n(row.cash);
  const accountsReceivable =
    n(row.accounts_receivable);
  const inventory =
    n(row.inventory);
  const otherCurrentAssets =
    n(row.other_current_assets);
  const prepaidExpenses =
    n(row.prepaid_expenses);

  const fixedAssets =
    n(row.fixed_assets);
  const otherNonCurrentAssets =
    n(row.other_non_current_assets);

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
    n(row.accounts_payable);
  const shortTermDebt =
    n(row.short_term_debt);
  const accruedLiabilities =
    n(row.accrued_liabilities);
  const longTermDebt =
    n(row.long_term_debt);
  const otherLiabilities =
    n(row.other_liabilities);

  const currentLiabilities =
    accountsPayable +
    shortTermDebt +
    accruedLiabilities;

  const totalLiabilities =
    currentLiabilities +
    longTermDebt +
    otherLiabilities;

  const shareCapital =
    n(row.share_capital);
  const retainedEarnings =
    n(row.retained_earnings);
  const otherEquity =
    n(row.other_equity);

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

  const operatingCashFlow =
    n(row.operating_cash_flow);
  const investingCashFlow =
    n(row.investing_cash_flow);
  const financingCashFlow =
    n(row.financing_cash_flow);

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

    currentAssets,
    fixedAssets,
    otherNonCurrentAssets,
    nonCurrentAssets,
    totalAssets,

    accountsPayable,
    shortTermDebt,
    accruedLiabilities,
    currentLiabilities,
    longTermDebt,
    otherLiabilities,
    totalLiabilities,

    shareCapital,
    retainedEarnings,
    otherEquity,
    totalEquity,
    liabilitiesAndEquity,

    balanceDifference,

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

export async function GET() {
  try {
    const supabase = await createClient();

    // ==========================================================
    // AUTH
    // ==========================================================

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

    // ==========================================================
    // ACTIVE COMPANY
    // ==========================================================

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("company_members")
      .select("company_id, user_id, role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("joined_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "Excel export membership error:",
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

    // ==========================================================
    // LOAD QUICK INPUT HISTORY
    // ==========================================================

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
        "Excel export quick_inputs error:",
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
            "No financial data available for export.",
        },
        { status: 404 }
      );
    }

    // ==========================================================
    // CALCULATE
    // ==========================================================

    const history =
      quickInputs.map(calculate);

    const latest =
      history[history.length - 1];

    // ==========================================================
    // WORKBOOK
    // ==========================================================

    const workbook =
      XLSX.utils.book_new();

    // ==========================================================
    // SHEET 1 — EXECUTIVE SUMMARY
    // ==========================================================

    const summaryData = [
      ["DECISIONLY FINANCIAL REPORT"],
      [],
      ["Report Date", latest.inputDate],
      ["Quick Input", latest.quickInputCode],
      ["Record Count", history.length],
      [],
      ["KEY FINANCIAL METRICS", ""],
      ["Revenue", latest.revenue],
      ["Gross Profit", latest.grossProfit],
      ["Operating Profit", latest.operatingProfit],
      ["Net Income", latest.netIncome],
      ["Cash", latest.cash],
      ["Total Assets", latest.totalAssets],
      ["Total Liabilities", latest.totalLiabilities],
      ["Total Equity", latest.totalEquity],
      [],
      ["PROFITABILITY", ""],
      ["Gross Margin", latest.grossMargin / 100],
      ["Operating Margin", latest.operatingMargin / 100],
      ["Net Margin", latest.netMargin / 100],
      [],
      ["LIQUIDITY & LEVERAGE", ""],
      ["Working Capital", latest.workingCapital],
      ["Current Ratio", latest.currentRatio],
      ["Quick Ratio", latest.quickRatio],
      ["Debt to Equity", latest.debtToEquity],
      ["Debt to Assets", latest.debtToAssets],
      [],
      ["CASH FLOW", ""],
      ["Operating Cash Flow", latest.operatingCashFlow],
      ["Investing Cash Flow", latest.investingCashFlow],
      ["Financing Cash Flow", latest.financingCashFlow],
      ["Net Cash Change", latest.netCashChange],
      [],
      ["BALANCE SHEET CHECK", ""],
      ["Balance Difference", latest.balanceDifference],
      [
        "Balance Status",
        latest.balanceDifference === 0
          ? "Balanced"
          : "Unbalanced",
      ],
    ];

    const summarySheet =
      XLSX.utils.aoa_to_sheet(
        summaryData
      );

    summarySheet["!cols"] = [
      { wch: 30 },
      { wch: 24 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Summary"
    );

    // ==========================================================
    // SHEET 2 — INCOME STATEMENT
    // ==========================================================

    const incomeData = [
      ["INCOME STATEMENT"],
      [],
      ["Metric", "Amount"],
      ["Revenue", latest.revenue],
      ["Cost of Sales", latest.costOfSales],
      ["Gross Profit", latest.grossProfit],
      [
        "Gross Margin",
        latest.grossMargin / 100,
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
        "Operating Margin",
        latest.operatingMargin / 100,
      ],
      [
        "Other Income",
        latest.otherIncome,
      ],
      [
        "Other Expenses",
        latest.otherExpenses,
      ],
      ["Net Income", latest.netIncome],
      [
        "Net Margin",
        latest.netMargin / 100,
      ],
    ];

    const incomeSheet =
      XLSX.utils.aoa_to_sheet(
        incomeData
      );

    incomeSheet["!cols"] = [
      { wch: 30 },
      { wch: 24 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      incomeSheet,
      "Income Statement"
    );

    // ==========================================================
    // SHEET 3 — BALANCE SHEET
    // ==========================================================

    const balanceData = [
      ["BALANCE SHEET"],
      [],
      ["Metric", "Amount"],
      [],
      ["CURRENT ASSETS", ""],
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
      [
        "Total Current Assets",
        latest.currentAssets,
      ],
      [],
      ["NON-CURRENT ASSETS", ""],
      ["Fixed Assets", latest.fixedAssets],
      [
        "Other Non-Current Assets",
        latest.otherNonCurrentAssets,
      ],
      [
        "Total Non-Current Assets",
        latest.nonCurrentAssets,
      ],
      ["TOTAL ASSETS", latest.totalAssets],
      [],
      ["CURRENT LIABILITIES", ""],
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
        "Total Current Liabilities",
        latest.currentLiabilities,
      ],
      [],
      ["NON-CURRENT LIABILITIES", ""],
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
      ["EQUITY", ""],
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
      [
        "Balance Status",
        latest.balanceDifference === 0
          ? "Balanced"
          : "Unbalanced",
      ],
    ];

    const balanceSheet =
      XLSX.utils.aoa_to_sheet(
        balanceData
      );

    balanceSheet["!cols"] = [
      { wch: 32 },
      { wch: 24 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      balanceSheet,
      "Balance Sheet"
    );

    // ==========================================================
    // SHEET 4 — CASH FLOW
    // ==========================================================

    const cashFlowData = [
      ["CASH FLOW STATEMENT"],
      [],
      ["Metric", "Amount"],
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
      ["Cash Balance", latest.cash],
    ];

    const cashFlowSheet =
      XLSX.utils.aoa_to_sheet(
        cashFlowData
      );

    cashFlowSheet["!cols"] = [
      { wch: 30 },
      { wch: 24 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      cashFlowSheet,
      "Cash Flow"
    );

    // ==========================================================
    // SHEET 5 — RATIOS
    // ==========================================================

    const ratioData = [
      ["FINANCIAL RATIOS"],
      [],
      ["Ratio", "Value"],
      [
        "Current Ratio",
        latest.currentRatio,
      ],
      [
        "Quick Ratio",
        latest.quickRatio,
      ],
      [
        "Debt to Equity",
        latest.debtToEquity,
      ],
      [
        "Debt to Assets",
        latest.debtToAssets,
      ],
      [
        "Working Capital",
        latest.workingCapital,
      ],
      [
        "Gross Margin",
        latest.grossMargin / 100,
      ],
      [
        "Operating Margin",
        latest.operatingMargin / 100,
      ],
      [
        "Net Margin",
        latest.netMargin / 100,
      ],
    ];

    const ratioSheet =
      XLSX.utils.aoa_to_sheet(
        ratioData
      );

    ratioSheet["!cols"] = [
      { wch: 30 },
      { wch: 24 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      ratioSheet,
      "Ratios"
    );

    // ==========================================================
    // SHEET 6 — HISTORICAL TRENDS
    // ==========================================================

    const trendData = history.map(
      (item) => ({
        Date: item.inputDate,
        "Quick Input":
          item.quickInputCode,

        Revenue: item.revenue,
        "Gross Profit":
          item.grossProfit,
        "Operating Profit":
          item.operatingProfit,
        "Net Income":
          item.netIncome,

        Cash: item.cash,

        "Operating Cash Flow":
          item.operatingCashFlow,
        "Investing Cash Flow":
          item.investingCashFlow,
        "Financing Cash Flow":
          item.financingCashFlow,
        "Net Cash Change":
          item.netCashChange,

        "Total Assets":
          item.totalAssets,
        "Total Liabilities":
          item.totalLiabilities,
        "Total Equity":
          item.totalEquity,

        "Gross Margin":
          item.grossMargin / 100,
        "Operating Margin":
          item.operatingMargin / 100,
        "Net Margin":
          item.netMargin / 100,

        "Current Ratio":
          item.currentRatio,
        "Quick Ratio":
          item.quickRatio,
        "Debt to Equity":
          item.debtToEquity,
        "Debt to Assets":
          item.debtToAssets,
      })
    );

    const trendSheet =
      XLSX.utils.json_to_sheet(
        trendData
      );

    trendSheet["!cols"] = [
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 },
      { wch: 18 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      trendSheet,
      "Trends"
    );

    // ==========================================================
    // NUMBER FORMATTING
    // ==========================================================

    const moneySheets = [
      summarySheet,
      incomeSheet,
      balanceSheet,
      cashFlowSheet,
      ratioSheet,
      trendSheet,
    ];

    for (const sheet of moneySheets) {
      for (const cellAddress of Object.keys(
        sheet
      )) {
        if (
          cellAddress.startsWith("!")
        ) {
          continue;
        }

        const cell =
          sheet[cellAddress];

        if (
          cell &&
          cell.t === "n"
        ) {
          cell.z =
            '#,##0.00;[Red]-#,##0.00';
        }
      }
    }

    // ==========================================================
    // PERCENTAGE FORMATTING
    // ==========================================================

    const percentageCells = [
      "B18",
      "B19",
      "B20",
    ];

    for (const address of percentageCells) {
      if (summarySheet[address]) {
        summarySheet[address].z =
          "0.0%";
      }
    }

    // Income statement
    [
      "B7",
      "B10",
      "B14",
    ].forEach((address) => {
      if (incomeSheet[address]) {
        incomeSheet[address].z =
          "0.0%";
      }
    });

    // Ratios
    [
      "B9",
      "B10",
      "B11",
    ].forEach((address) => {
      if (ratioSheet[address]) {
        ratioSheet[address].z =
          "0.0%";
      }
    });

    // ==========================================================
    // EXPORT
    // ==========================================================

    const buffer =
      XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

    const filename =
      `decisionly-financial-report-${latest.inputDate}.xlsx`;

    return new NextResponse(
      buffer,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="${filename}"`,

          "Cache-Control":
            "no-store",
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
            : "Failed to generate Excel report.",
      },
      { status: 500 }
    );
  }
}