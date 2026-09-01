import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type QuickInputRow = {
  id: string;
  quick_input_code: string;
  company_id: string;
  user_id: string;
  input_date: string;

  revenue: number;
  cost_of_sales: number;
  operating_expenses: number;
  other_income: number;
  other_expenses: number;

  cash: number;
  accounts_receivable: number;
  inventory: number;
  other_current_assets: number;
  prepaid_expenses: number;

  fixed_assets: number;
  other_non_current_assets: number;

  accounts_payable: number;
  short_term_debt: number;
  accrued_liabilities: number;

  long_term_debt: number;
  other_liabilities: number;

  share_capital: number;
  retained_earnings: number;
  other_equity: number;

  operating_cash_flow: number;
  investing_cash_flow: number;
  financing_cash_flow: number;

  created_at: string;
  updated_at: string;
};

function numberValue(value: unknown): number {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateFinancialData(row: QuickInputRow) {
  /*
   * ==========================================================
   * INCOME STATEMENT
   * ==========================================================
   */

  const grossProfit =
    numberValue(row.revenue) -
    numberValue(row.cost_of_sales);

  const operatingProfit =
    grossProfit -
    numberValue(row.operating_expenses);

  const netIncome =
    operatingProfit +
    numberValue(row.other_income) -
    numberValue(row.other_expenses);

  /*
   * ==========================================================
   * BALANCE SHEET
   *
   * These are SNAPSHOT values from this Quick Input.
   * They are NOT added to previous Quick Inputs.
   * ==========================================================
   */

  const currentAssets =
    numberValue(row.cash) +
    numberValue(row.accounts_receivable) +
    numberValue(row.inventory) +
    numberValue(row.other_current_assets) +
    numberValue(row.prepaid_expenses);

  const nonCurrentAssets =
    numberValue(row.fixed_assets) +
    numberValue(row.other_non_current_assets);

  const totalAssets =
    currentAssets +
    nonCurrentAssets;

  const currentLiabilities =
    numberValue(row.accounts_payable) +
    numberValue(row.short_term_debt) +
    numberValue(row.accrued_liabilities);

  const totalLiabilities =
    currentLiabilities +
    numberValue(row.long_term_debt) +
    numberValue(row.other_liabilities);

  const totalEquity =
    numberValue(row.share_capital) +
    numberValue(row.retained_earnings) +
    numberValue(row.other_equity);

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

  /*
   * ==========================================================
   * CASH FLOW
   * ==========================================================
   */

  const operatingCashFlow =
    numberValue(row.operating_cash_flow);

  const investingCashFlow =
    numberValue(row.investing_cash_flow);

  const financingCashFlow =
    numberValue(row.financing_cash_flow);

  const netCashChange =
    operatingCashFlow +
    investingCashFlow +
    financingCashFlow;

  /*
   * ==========================================================
   * RATIOS
   * ==========================================================
   */

  const workingCapital =
    currentAssets -
    currentLiabilities;

  const currentRatio =
    currentLiabilities !== 0
      ? currentAssets / currentLiabilities
      : null;

  /*
   * Quick Assets:
   *
   * Cash
   * + Accounts Receivable
   *
   * Inventory and prepaid expenses are excluded.
   */

  const quickAssets =
    numberValue(row.cash) +
    numberValue(row.accounts_receivable);

  const quickRatio =
    currentLiabilities !== 0
      ? quickAssets / currentLiabilities
      : null;

  const debt =
    numberValue(row.short_term_debt) +
    numberValue(row.long_term_debt);

  const debtToEquity =
    totalEquity !== 0
      ? debt / totalEquity
      : null;

  const debtToAssets =
    totalAssets !== 0
      ? debt / totalAssets
      : null;

  /*
   * ==========================================================
   * MARGINS
   * ==========================================================
   */

  const grossMargin =
    numberValue(row.revenue) !== 0
      ? (grossProfit / numberValue(row.revenue)) *
        100
      : 0;

  const netMargin =
    numberValue(row.revenue) !== 0
      ? (netIncome / numberValue(row.revenue)) *
        100
      : 0;

  return {
    id: row.id,
    quickInputCode: row.quick_input_code,
    companyId: row.company_id,
    userId: row.user_id,
    inputDate: row.input_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    revenue: numberValue(row.revenue),
    costOfSales: numberValue(row.cost_of_sales),
    operatingExpenses: numberValue(
      row.operating_expenses
    ),
    otherIncome: numberValue(row.other_income),
    otherExpenses: numberValue(
      row.other_expenses
    ),

    grossProfit,
    operatingProfit,
    netIncome,

    cash: numberValue(row.cash),
    accountsReceivable: numberValue(
      row.accounts_receivable
    ),
    inventory: numberValue(row.inventory),
    otherCurrentAssets: numberValue(
      row.other_current_assets
    ),
    prepaidExpenses: numberValue(
      row.prepaid_expenses
    ),

    fixedAssets: numberValue(row.fixed_assets),
    otherNonCurrentAssets: numberValue(
      row.other_non_current_assets
    ),

    currentAssets,
    nonCurrentAssets,
    totalAssets,

    accountsPayable: numberValue(
      row.accounts_payable
    ),
    shortTermDebt: numberValue(
      row.short_term_debt
    ),
    accruedLiabilities: numberValue(
      row.accrued_liabilities
    ),
    longTermDebt: numberValue(
      row.long_term_debt
    ),
    otherLiabilities: numberValue(
      row.other_liabilities
    ),

    currentLiabilities,
    totalLiabilities,

    shareCapital: numberValue(
      row.share_capital
    ),
    retainedEarnings: numberValue(
      row.retained_earnings
    ),
    otherEquity: numberValue(
      row.other_equity
    ),

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

    grossMargin,
    netMargin,
  };
}

/*
 * ============================================================
 * FINANCIAL HEALTH
 * ============================================================
 *
 * This is a deterministic dashboard score.
 *
 * It does NOT create financial data.
 * It only evaluates the latest Quick Input.
 * ============================================================
 */

function calculateFinancialHealth(
  latest: ReturnType<
    typeof calculateFinancialData
  >
): number {
  let score = 50;

  /*
   * Profitability
   */

  if (latest.netMargin > 10) {
    score += 15;
  } else if (latest.netMargin > 0) {
    score += 8;
  } else {
    score -= 12;
  }

  /*
   * Operating cash flow
   */

  if (latest.operatingCashFlow > 0) {
    score += 12;
  } else if (latest.operatingCashFlow < 0) {
    score -= 12;
  }

  /*
   * Liquidity
   */

  if (
    latest.currentRatio !== null
  ) {
    if (latest.currentRatio >= 2) {
      score += 10;
    } else if (latest.currentRatio >= 1) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  /*
   * Leverage
   */

  if (
    latest.debtToEquity !== null
  ) {
    if (latest.debtToEquity <= 1) {
      score += 8;
    } else if (latest.debtToEquity <= 2) {
      score += 2;
    } else {
      score -= 8;
    }
  }

  /*
   * Balance Sheet integrity
   */

  if (
    latest.balanceStatus === "balanced"
  ) {
    score += 5;
  } else {
    score -= 15;
  }

  /*
   * Clamp score
   */

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

export async function GET() {
  try {
    const supabase = await createClient();

    /*
     * ========================================================
     * AUTHENTICATED USER
     * ========================================================
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Dashboard auth error:",
        userError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to authenticate user.",
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

    /*
     * ========================================================
     * ACTIVE COMPANY
     * ========================================================
     */

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
        "Dashboard membership error:",
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
     * ========================================================
     * GET QUICK INPUT HISTORY
     *
     * IMPORTANT:
     * - company_id is mandatory filter
     * - periods is NOT used
     * - latest is determined by input_date
     * ========================================================
     */

    const {
      data: rows,
      error: quickInputError,
    } = await supabase
      .from("quick_inputs")
      .select("*")
      .eq("company_id", companyId)
      .order("input_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (quickInputError) {
      console.error(
        "Dashboard quick_inputs error:",
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

    /*
     * ========================================================
     * NO FINANCIAL DATA
     * ========================================================
     */

    if (quickInputs.length === 0) {
      return NextResponse.json({
        success: true,
        hasFinancialData: false,

        companyId,
        userId: user.id,

        latest: null,
        performance: [],

        financialHealth: null,
      });
    }

    /*
     * ========================================================
     * LATEST QUICK INPUT
     *
     * Because query is descending by input_date,
     * first record is the latest snapshot.
     * ========================================================
     */

    const latestRow =
      quickInputs[0];

    const latest =
      calculateFinancialData(
        latestRow
      );

    /*
     * ========================================================
     * PERFORMANCE HISTORY
     *
     * Reverse so chart goes oldest → newest.
     * ========================================================
     */

    const performance =
      [...quickInputs]
        .reverse()
        .map((row) =>
          calculateFinancialData(row)
        );

    /*
     * ========================================================
     * FINANCIAL HEALTH
     * ========================================================
     */

    const financialHealth =
      calculateFinancialHealth(
        latest
      );

    /*
     * ========================================================
     * FINAL RESPONSE
     * ========================================================
     */

    return NextResponse.json({
      success: true,

      hasFinancialData: true,

      companyId,
      userId: user.id,

      latest,

      performance,

      financialHealth,
    });
  } catch (error) {
    console.error(
      "Dashboard GET error:",
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