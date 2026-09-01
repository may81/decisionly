
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type QuickInputPayload = {
  inputDate?: unknown;
  revenue?: unknown;
  costOfSales?: unknown;
  operatingExpenses?: unknown;
  otherIncome?: unknown;
  otherExpenses?: unknown;

  cash?: unknown;
  accountsReceivable?: unknown;
  inventory?: unknown;
  otherCurrentAssets?: unknown;
  prepaidExpenses?: unknown;

  fixedAssets?: unknown;
  otherNonCurrentAssets?: unknown;

  accountsPayable?: unknown;
  shortTermDebt?: unknown;
  accruedLiabilities?: unknown;

  longTermDebt?: unknown;
  otherLiabilities?: unknown;

  shareCapital?: unknown;
  retainedEarnings?: unknown;
  otherEquity?: unknown;

  operatingCashFlow?: unknown;
  investingCashFlow?: unknown;
  financingCashFlow?: unknown;
};

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

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function n(value: unknown): number {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
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

/*
 * ============================================================
 * FINANCIAL CALCULATION
 * ============================================================
 */

function calculateFinancialData(
  row: QuickInputRow
) {
  const revenue = n(row.revenue);
  const costOfSales = n(row.cost_of_sales);
  const operatingExpenses = n(
    row.operating_expenses
  );
  const otherIncome = n(
    row.other_income
  );
  const otherExpenses = n(
    row.other_expenses
  );

  const cash = n(row.cash);
  const accountsReceivable = n(
    row.accounts_receivable
  );
  const inventory = n(row.inventory);
  const otherCurrentAssets = n(
    row.other_current_assets
  );
  const prepaidExpenses = n(
    row.prepaid_expenses
  );

  const fixedAssets = n(
    row.fixed_assets
  );
  const otherNonCurrentAssets = n(
    row.other_non_current_assets
  );

  const accountsPayable = n(
    row.accounts_payable
  );
  const shortTermDebt = n(
    row.short_term_debt
  );
  const accruedLiabilities = n(
    row.accrued_liabilities
  );

  const longTermDebt = n(
    row.long_term_debt
  );
  const otherLiabilities = n(
    row.other_liabilities
  );

  const shareCapital = n(
    row.share_capital
  );
  const retainedEarnings = n(
    row.retained_earnings
  );
  const otherEquity = n(
    row.other_equity
  );

  const operatingCashFlow = n(
    row.operating_cash_flow
  );
  const investingCashFlow = n(
    row.investing_cash_flow
  );
  const financingCashFlow = n(
    row.financing_cash_flow
  );

  /*
   * Income Statement
   */

  const grossProfit =
    revenue - costOfSales;

  const operatingProfit =
    grossProfit -
    operatingExpenses;

  const netIncome =
    operatingProfit +
    otherIncome -
    otherExpenses;

  /*
   * Balance Sheet
   */

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

  const currentLiabilities =
    accountsPayable +
    shortTermDebt +
    accruedLiabilities;

  const totalLiabilities =
    currentLiabilities +
    longTermDebt +
    otherLiabilities;

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
      : "not_balanced";

  /*
   * Cash Flow
   */

  const netCashChange =
    operatingCashFlow +
    investingCashFlow +
    financingCashFlow;

  /*
   * Ratios
   */

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

  /*
   * Margins
   */

  const grossMargin =
    revenue !== 0
      ? (grossProfit /
          revenue) *
        100
      : 0;

  const operatingMargin =
    revenue !== 0
      ? (operatingProfit /
          revenue) *
        100
      : 0;

  const netMargin =
    revenue !== 0
      ? (netIncome /
          revenue) *
        100
      : 0;

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

    revenue,
    costOfSales,
    operatingExpenses,
    otherIncome,
    otherExpenses,

    grossProfit,
    operatingProfit,
    netIncome,

    currentAssets,
    nonCurrentAssets,
    totalAssets,

    currentLiabilities,
    totalLiabilities,

    totalEquity,

    liabilitiesAndEquity,

    balanceDifference,
    balanceStatus,

    cash,

    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,

    netCashChange,

    workingCapital,
    currentRatio,
    quickRatio,

    debt,
    debtToEquity,
    debtToAssets,

    grossMargin,
    operatingMargin,
    netMargin,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/*
 * ============================================================
 * FINANCIAL HEALTH
 * ============================================================
 */

function calculateFinancialHealth(
  latest: ReturnType<
    typeof calculateFinancialData
  >
) {
  let score = 50;

  /*
   * Profitability
   */

  if (latest.netIncome > 0) {
    score += 15;
  } else if (
    latest.netIncome < 0
  ) {
    score -= 15;
  }

  /*
   * Operating Cash Flow
   */

  if (
    latest.operatingCashFlow > 0
  ) {
    score += 15;
  } else if (
    latest.operatingCashFlow < 0
  ) {
    score -= 15;
  }

  /*
   * Liquidity
   */

  if (
    latest.currentRatio !== null
  ) {
    if (
      latest.currentRatio >= 2
    ) {
      score += 10;
    } else if (
      latest.currentRatio >= 1
    ) {
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
    if (
      latest.debtToEquity <= 1
    ) {
      score += 10;
    } else if (
      latest.debtToEquity > 2
    ) {
      score -= 10;
    }
  }

  /*
   * Accounting Balance
   */

  if (
    latest.balanceStatus ===
    "balanced"
  ) {
    score += 5;
  } else {
    score -= 10;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score)
    )
  );
}

/*
 * ============================================================
 * AUTH + ACTIVE COMPANY
 * ============================================================
 */

async function getActiveCompany() {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: authError,
  } =
    await supabase.auth.getUser();

  if (authError) {
    console.error(
      "Quick Input auth error:",
      authError
    );

    return {
      supabase,
      user: null,
      companyId: null,
      error:
        "Unable to authenticate user.",
      status: 401,
    };
  }

  if (!user) {
    return {
      supabase,
      user: null,
      companyId: null,
      error: "Unauthorized",
      status: 401,
    };
  }

  const {
    data: membership,
    error: membershipError,
  } =
    await supabase
      .from("company_members")
      .select(
        "company_id, role"
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
      "Quick Input membership error:",
      membershipError
    );

    return {
      supabase,
      user,
      companyId: null,
      error:
        "Unable to determine company membership.",
      status: 500,
    };
  }

  if (!membership) {
    return {
      supabase,
      user,
      companyId: null,
      error:
        "Your account is not connected to an active company.",
      status: 403,
    };
  }

  return {
    supabase,
    user,
    companyId:
      membership.company_id,
    error: null,
    status: 200,
  };
}

/*
 * ============================================================
 * GET
 *
 * Reads the latest financial submissions.
 * ============================================================
 */

export async function GET() {
  try {
    const {
      supabase,
      user,
      companyId,
      error,
      status,
    } =
      await getActiveCompany();

    if (
      error ||
      !user ||
      !companyId
    ) {
      return jsonError(
        error ??
          "Unable to determine active company.",
        status
      );
    }

    const {
      data: rows,
      error:
        quickInputError,
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
            ascending: false,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(12);

    if (quickInputError) {
      console.error(
        "Quick Input GET database error:",
        quickInputError
      );

      return jsonError(
        quickInputError.message ||
          "Failed to load financial data.",
        500
      );
    }

    const quickInputRows =
      (rows ??
        []) as QuickInputRow[];

    /*
     * Empty state
     */

    if (
      quickInputRows.length ===
      0
    ) {
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
     * Calculate records
     */

    const calculatedRows =
      quickInputRows.map(
        calculateFinancialData
      );

    const latest =
      calculatedRows[0];

    const financialHealth =
      calculateFinancialHealth(
        latest
      );

    const performance =
      [...calculatedRows].reverse();

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
      "Quick Input GET unexpected error:",
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

/*
 * ============================================================
 * POST
 *
 * Creates a new financial submission.
 * ============================================================
 */

export async function POST(
  request: Request
) {
  try {
    /*
     * --------------------------------------------------------
     * AUTHENTICATION + COMPANY
     * --------------------------------------------------------
     */

    const {
      supabase,
      user,
      companyId,
      error,
      status,
    } =
      await getActiveCompany();

    if (
      error ||
      !user ||
      !companyId
    ) {
      return jsonError(
        error ??
          "Unable to determine active company.",
        status
      );
    }

    /*
     * --------------------------------------------------------
     * REQUEST BODY
     * --------------------------------------------------------
     */

   let body: QuickInputPayload;

try {
  body =
    (await request.json()) as QuickInputPayload;
} catch {
  return jsonError(
    "Invalid request body.",
    400
  );
}

const inputDate =
  typeof body.inputDate === "string"
    ? body.inputDate.trim()
    : "";

if (!inputDate) {
  return jsonError(
    "Please select the financial data date before saving.",
    400
  );
}

if (
  !/^\d{4}-\d{2}-\d{2}$/.test(inputDate)
) {
  return jsonError(
    "Invalid financial data date.",
    400
  );
}

    /*
     * --------------------------------------------------------
     * NORMALIZE INPUT
     * --------------------------------------------------------
     */

    const revenue =
      n(body.revenue);

    const costOfSales =
      n(body.costOfSales);

    const operatingExpenses =
      n(body.operatingExpenses);

    const otherIncome =
      n(body.otherIncome);

    const otherExpenses =
      n(body.otherExpenses);

    const cash =
      n(body.cash);

    const accountsReceivable =
      n(body.accountsReceivable);

    const inventory =
      n(body.inventory);

    const otherCurrentAssets =
      n(body.otherCurrentAssets);

    const prepaidExpenses =
      n(body.prepaidExpenses);

    const fixedAssets =
      n(body.fixedAssets);

    const otherNonCurrentAssets =
      n(body.otherNonCurrentAssets);

    const accountsPayable =
      n(body.accountsPayable);

    const shortTermDebt =
      n(body.shortTermDebt);

    const accruedLiabilities =
      n(body.accruedLiabilities);

    const longTermDebt =
      n(body.longTermDebt);

    const otherLiabilities =
      n(body.otherLiabilities);

    const shareCapital =
      n(body.shareCapital);

    const retainedEarnings =
      n(body.retainedEarnings);

    const otherEquity =
      n(body.otherEquity);

    const operatingCashFlow =
      n(body.operatingCashFlow);

    const investingCashFlow =
      n(body.investingCashFlow);

    const financingCashFlow =
      n(body.financingCashFlow);

    /*
     * --------------------------------------------------------
     * BASIC INPUT VALIDATION
     * --------------------------------------------------------
     */

    const hasAnyInput = [
      revenue,
      costOfSales,
      operatingExpenses,
      otherIncome,
      otherExpenses,

      cash,
      accountsReceivable,
      inventory,
      otherCurrentAssets,
      prepaidExpenses,

      fixedAssets,
      otherNonCurrentAssets,

      accountsPayable,
      shortTermDebt,
      accruedLiabilities,

      longTermDebt,
      otherLiabilities,

      shareCapital,
      retainedEarnings,
      otherEquity,

      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
    ].some(
      (value) => value !== 0
    );

    if (!hasAnyInput) {
      return jsonError(
        "Please enter your financial data before saving.",
        400
      );
    }

    /*
     * --------------------------------------------------------
     * BALANCE SHEET VALIDATION
     * --------------------------------------------------------
     */

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

    const currentLiabilities =
      accountsPayable +
      shortTermDebt +
      accruedLiabilities;

    const totalLiabilities =
      currentLiabilities +
      longTermDebt +
      otherLiabilities;

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

    const isBalanced =
      Math.abs(
        balanceDifference
      ) < 0.01;

    if (!isBalanced) {
      return jsonError(
        "Balance Sheet is not balanced.",
        400,
        {
          balanceDifference,
          totalAssets,
          totalLiabilities,
          totalEquity,
          liabilitiesAndEquity,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * CALCULATE DERIVED VALUES
     * --------------------------------------------------------
     */

    const grossProfit =
      revenue -
      costOfSales;

    const operatingProfit =
      grossProfit -
      operatingExpenses;

    const netIncome =
      operatingProfit +
      otherIncome -
      otherExpenses;

    const netCashChange =
      operatingCashFlow +
      investingCashFlow +
      financingCashFlow;

    /*
     * --------------------------------------------------------
     * QUICK INPUT CODE
     * --------------------------------------------------------
     */

    
    const now =
  new Date();

const datePart =
  inputDate.replace(
    /-/g,
    ""
  );

    const randomPart =
      Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase();

    const quickInputCode =
      `QI-${datePart}-${randomPart}`;

    /*
     * --------------------------------------------------------
     * INSERT
     * --------------------------------------------------------
     */

    const {
      data: inserted,
      error: insertError,
    } =
      await supabase
        .from("quick_inputs")
        .insert({
          quick_input_code:
            quickInputCode,

          company_id:
            companyId,

          user_id:
            user.id,

          input_date:
  inputDate,

          revenue,

          cost_of_sales:
            costOfSales,

          operating_expenses:
            operatingExpenses,

          other_income:
            otherIncome,

          other_expenses:
            otherExpenses,

          cash,

          accounts_receivable:
            accountsReceivable,

          inventory,

          other_current_assets:
            otherCurrentAssets,

          prepaid_expenses:
            prepaidExpenses,

          fixed_assets:
            fixedAssets,

          other_non_current_assets:
            otherNonCurrentAssets,

          accounts_payable:
            accountsPayable,

          short_term_debt:
            shortTermDebt,

          accrued_liabilities:
            accruedLiabilities,

          long_term_debt:
            longTermDebt,

          other_liabilities:
            otherLiabilities,

          share_capital:
            shareCapital,

          retained_earnings:
            retainedEarnings,

          other_equity:
            otherEquity,

          operating_cash_flow:
            operatingCashFlow,

          investing_cash_flow:
            investingCashFlow,

          financing_cash_flow:
            financingCashFlow,
        })
        .select("*")
        .single();

 if (insertError) {
  console.error(
    "Quick Input INSERT error:",
    insertError
  );

  /*
   * ========================================================
   * INPUT DATA LIMIT
   * ========================================================
   */

  if (
    insertError.message?.startsWith(
      "INPUT_DATA_LIMIT_REACHED:"
    )
  ) {
    const parts =
      insertError.message.split(":");

    const plan =
      parts[1] ?? "free";

    const used =
      Number(parts[2] ?? 0);

    const limit =
      Number(parts[3] ?? 0);

    return jsonError(
      "You have reached your Quick Input limit for this billing period.",
      403,
      {
        code:
          "INPUT_DATA_LIMIT_REACHED",

        plan,

        usage: {
          used,
          limit,
          remaining: Math.max(
            0,
            limit - used
          ),
        },

        upgradeRequired: true,
      }
    );
  }


  /*
   * ========================================================
   * NO LIMIT CONFIGURED
   * ========================================================
   */

  if (
    insertError.message?.startsWith(
      "NO_INPUT_DATA_LIMIT_CONFIGURED:"
    )
  ) {
    const plan =
      insertError.message.split(":")[1]
      ?? "unknown";

    return jsonError(
      "Your subscription plan is not configured correctly.",
      500,
      {
        code:
          "NO_INPUT_DATA_LIMIT_CONFIGURED",

        plan,
      }
    );
  }


  /*
   * ========================================================
   * NORMAL DATABASE ERROR
   * ========================================================
   */

  return jsonError(
    insertError.message ||
      "Failed to save financial data.",
    500
  );
}
    /*
     * --------------------------------------------------------
     * CALCULATE RESPONSE
     * --------------------------------------------------------
     */

    const calculated =
      calculateFinancialData(
        inserted as QuickInputRow
      );

    /*
     * --------------------------------------------------------
     * SUCCESS
     * --------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Financial data saved successfully.",

        quickInput:
          inserted,

        calculated,

        summary: {
          revenue,
          grossProfit,
          operatingProfit,
          netIncome,

          totalAssets,
          totalLiabilities,
          totalEquity,

          balanceDifference,

          operatingCashFlow,
          investingCashFlow,
          financingCashFlow,

          netCashChange,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Quick Input POST unexpected error:",
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