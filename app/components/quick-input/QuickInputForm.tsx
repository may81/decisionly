
"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

type FormValues = {
  // Income Statement
  revenue: number;
  costOfSales: number;
  operatingExpenses: number;
  otherIncome: number;
  otherExpenses: number;

  // Current Assets
  cash: number;
  accountsReceivable: number;
  inventory: number;
  otherCurrentAssets: number;
  prepaidExpenses: number;

  // Non-current Assets
  fixedAssets: number;
  otherNonCurrentAssets: number;

  // Current Liabilities
  accountsPayable: number;
  shortTermDebt: number;
  accruedLiabilities: number;

  // Non-current Liabilities
  longTermDebt: number;
  otherLiabilities: number;

  // Equity
  shareCapital: number;
  retainedEarnings: number;
  otherEquity: number;

  // Cash Flow
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
};

/*
 * ============================================================
 * EMPTY FORM
 * ============================================================
 *
 * No pre-filled/demo financial values.
 *
 * All values start at zero and must be entered by the user.
 */
const EMPTY_VALUES: FormValues = {
  revenue: 0,
  costOfSales: 0,
  operatingExpenses: 0,
  otherIncome: 0,
  otherExpenses: 0,

  cash: 0,
  accountsReceivable: 0,
  inventory: 0,
  otherCurrentAssets: 0,
  prepaidExpenses: 0,

  fixedAssets: 0,
  otherNonCurrentAssets: 0,

  accountsPayable: 0,
  shortTermDebt: 0,
  accruedLiabilities: 0,

  longTermDebt: 0,
  otherLiabilities: 0,

  shareCapital: 0,
  retainedEarnings: 0,
  otherEquity: 0,

  operatingCashFlow: 0,
  investingCashFlow: 0,
  financingCashFlow: 0,
};

/*
 * ============================================================
 * FORMATTERS
 * ============================================================
 */

const moneyFormatter = new Intl.NumberFormat(
  "id-ID",
  {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }
);

function formatIDR(value: number) {
  return moneyFormatter.format(
    Number.isFinite(value) ? value : 0
  );
}

function formatCompactIDR(value: number) {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `${value < 0 ? "-" : ""}Rp ${(
      absolute / 1_000_000_000
    )
      .toFixed(1)
      .replace(".", ",")} M`;
  }

  if (absolute >= 1_000_000) {
    return `${value < 0 ? "-" : ""}Rp ${(
      absolute / 1_000_000
    )
      .toFixed(1)
      .replace(".", ",")} jt`;
  }

  if (absolute >= 1_000) {
    return `${value < 0 ? "-" : ""}Rp ${(
      absolute / 1_000
    ).toFixed(0)} rb`;
  }

  return formatIDR(value);
}

function parseNumber(value: string) {
  /*
   * Allow:
   * 150000000
   * 150.000.000
   * Rp 150.000.000
   *
   * Negative values are also supported for
   * cash flow outflows.
   */

  const normalized = value.replace(/[^\d-]/g, "");

  if (
    normalized === "" ||
    normalized === "-"
  ) {
    return 0;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

/*
 * ============================================================
 * INPUT FIELD
 * ============================================================
 */

function InputField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        {hint ? (
          <span className="text-xs text-slate-400">
            {hint}
          </span>
        ) : null}
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          Rp
        </span>

        <input
          type="text"
          inputMode="numeric"
          value={
            value === 0
              ? ""
              : value.toLocaleString("id-ID")
          }
          onChange={(event) =>
            onChange(
              parseNumber(
                event.target.value
              )
            )
          }
          placeholder="0"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-right text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>
    </label>
  );
}

/*
 * ============================================================
 * SECTION
 * ============================================================
 */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

/*
 * ============================================================
 * SUMMARY ROW
 * ============================================================
 */

function SummaryRow({
  label,
  value,
  strong = false,
  negative = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-2.5 ${
        strong
          ? "border-t border-slate-200 pt-3"
          : ""
      }`}
    >
      <span
        className={
          strong
            ? "text-sm font-semibold text-slate-900"
            : "text-sm text-slate-600"
        }
      >
        {label}
      </span>

      <span
        className={`text-sm ${
          strong
            ? "font-semibold"
            : "font-medium"
        } ${
          negative
            ? "text-rose-600"
            : "text-slate-900"
        }`}
      >
        {formatIDR(value)}
      </span>
    </div>
  );
}

/*
 * ============================================================
 * QUICK INPUT FORM
 * ============================================================
 */

export default function QuickInputForm() {
  const [values, setValues] =
    useState<FormValues>(
      EMPTY_VALUES
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * ==========================================================
   * UPDATE VALUE
   * ==========================================================
   */

  function updateValue(
    key: keyof FormValues,
    value: number
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
    setSuccess("");
  }

  /*
   * ==========================================================
   * CALCULATIONS
   * ==========================================================
   */

  const calculated = useMemo(() => {
    /*
     * -----------------------------
     * INCOME STATEMENT
     * -----------------------------
     */

    const grossProfit =
      values.revenue -
      values.costOfSales;

    const operatingProfit =
      grossProfit -
      values.operatingExpenses;

    const netIncome =
      operatingProfit +
      values.otherIncome -
      values.otherExpenses;

    /*
     * -----------------------------
     * ASSETS
     * -----------------------------
     */

    const currentAssets =
      values.cash +
      values.accountsReceivable +
      values.inventory +
      values.otherCurrentAssets +
      values.prepaidExpenses;

    const nonCurrentAssets =
      values.fixedAssets +
      values.otherNonCurrentAssets;

    const totalAssets =
      currentAssets +
      nonCurrentAssets;

    /*
     * -----------------------------
     * LIABILITIES
     * -----------------------------
     */

    const currentLiabilities =
      values.accountsPayable +
      values.shortTermDebt +
      values.accruedLiabilities;

    const totalLiabilities =
      currentLiabilities +
      values.longTermDebt +
      values.otherLiabilities;

    /*
     * -----------------------------
     * EQUITY
     * -----------------------------
     */

    const totalEquity =
      values.shareCapital +
      values.retainedEarnings +
      values.otherEquity;

    const liabilitiesAndEquity =
      totalLiabilities +
      totalEquity;

    /*
     * -----------------------------
     * BALANCE CHECK
     * -----------------------------
     */

    const balanceDifference =
      totalAssets -
      liabilitiesAndEquity;

    const isBalanced =
      Math.abs(
        balanceDifference
      ) < 0.01;

    /*
     * -----------------------------
     * CASH FLOW
     * -----------------------------
     */

    const netCashChange =
      values.operatingCashFlow +
      values.investingCashFlow +
      values.financingCashFlow;

    /*
     * -----------------------------
     * RATIOS
     * -----------------------------
     */

    const netMargin =
      values.revenue !== 0
        ? (netIncome /
            values.revenue) *
          100
        : 0;

    const currentRatio =
      currentLiabilities !== 0
        ? currentAssets /
          currentLiabilities
        : null;

    /*
     * -----------------------------
     * DATA COMPLETENESS
     * -----------------------------
     */

    const hasAnyInput =
      Object.values(values).some(
        (value) => value !== 0
      );

    return {
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
      isBalanced,

      netCashChange,

      netMargin,
      currentRatio,

      hasAnyInput,
    };
  }, [values]);

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Do not allow completely empty submissions.
     */

    if (!calculated.hasAnyInput) {
      setError(
        "Please enter your financial data before saving."
      );

      return;
    }

    /*
     * Balance Sheet must balance.
     */

    if (!calculated.isBalanced) {
      setError(
        `Balance Sheet is not balanced. Difference: ${formatIDR(
          calculated.balanceDifference
        )}`
      );

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/quick-input",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            revenue:
              values.revenue,

            costOfSales:
              values.costOfSales,

            operatingExpenses:
              values.operatingExpenses,

            otherIncome:
              values.otherIncome,

            otherExpenses:
              values.otherExpenses,

            cash:
              values.cash,

            accountsReceivable:
              values.accountsReceivable,

            inventory:
              values.inventory,

            otherCurrentAssets:
              values.otherCurrentAssets,

            prepaidExpenses:
              values.prepaidExpenses,

            fixedAssets:
              values.fixedAssets,

            otherNonCurrentAssets:
              values.otherNonCurrentAssets,

            accountsPayable:
              values.accountsPayable,

            shortTermDebt:
              values.shortTermDebt,

            accruedLiabilities:
              values.accruedLiabilities,

            longTermDebt:
              values.longTermDebt,

            otherLiabilities:
              values.otherLiabilities,

            shareCapital:
              values.shareCapital,

            retainedEarnings:
              values.retainedEarnings,

            otherEquity:
              values.otherEquity,

            operatingCashFlow:
              values.operatingCashFlow,

            investingCashFlow:
              values.investingCashFlow,

            financingCashFlow:
              values.financingCashFlow,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to save financial data."
        );
      }

      const code =
        result?.quickInput
          ?.quick_input_code;

      setSuccess(
        code
          ? `Financial data saved successfully. Reference: ${code}`
          : "Financial data saved successfully."
      );

      /*
       * Give the user a moment to see
       * the success state, then return
       * to dashboard.
       */

      window.setTimeout(() => {
        window.location.href =
          "/dashboard";
      }, 700);
    } catch (err) {
      console.error(
        "Quick Input submit error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save financial data."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ==========================================================
   * CLEAR FORM
   * ==========================================================
   */

  function clearForm() {
    setValues(EMPTY_VALUES);
    setError("");
    setSuccess("");
  }

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-6xl space-y-6 pb-12"
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Financial Data
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Quick Input
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Enter your financial data once.
            Decisionly calculates profitability,
            financial position, cash flow, and
            balance status automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={clearForm}
          disabled={saving}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear Form
        </button>
      </div>

      {/* ====================================================
          INPUT DATE INFO
      ==================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              New Financial Submission
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The submission date, company, user,
              and Quick Input reference are
              generated automatically when you save.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-500">
            Date: automatic
          </div>
        </div>
      </section>

      {/* ====================================================
          MESSAGES
      ==================================================== */}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <p className="font-semibold">
            Unable to save
          </p>

          <p className="mt-1">
            {error}
          </p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          <p className="font-semibold">
            Saved successfully
          </p>

          <p className="mt-1">
            {success}
          </p>

          <p className="mt-1 text-xs text-emerald-600">
            Returning to dashboard...
          </p>
        </div>
      ) : null}

      {/* ====================================================
          INCOME STATEMENT
      ==================================================== */}

      <Section
        title="Income Statement"
        description="Enter revenue and expenses for this financial submission."
      >
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
          <InputField
            label="Revenue"
            value={values.revenue}
            onChange={(value) =>
              updateValue(
                "revenue",
                value
              )
            }
          />

          <InputField
            label="Cost of Goods Sold"
            value={values.costOfSales}
            onChange={(value) =>
              updateValue(
                "costOfSales",
                value
              )
            }
          />

          <InputField
            label="Operating Expenses"
            value={
              values.operatingExpenses
            }
            onChange={(value) =>
              updateValue(
                "operatingExpenses",
                value
              )
            }
          />

          <InputField
            label="Other Income"
            value={
              values.otherIncome
            }
            onChange={(value) =>
              updateValue(
                "otherIncome",
                value
              )
            }
          />

          <InputField
            label="Other Expenses"
            value={
              values.otherExpenses
            }
            onChange={(value) =>
              updateValue(
                "otherExpenses",
                value
              )
            }
          />
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <SummaryRow
            label="Gross Profit"
            value={
              calculated.grossProfit
            }
            strong
          />

          <SummaryRow
            label="Operating Profit"
            value={
              calculated.operatingProfit
            }
          />

          <SummaryRow
            label="Net Income"
            value={
              calculated.netIncome
            }
            strong
          />

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
            <span>
              Net Margin
            </span>

            <span className="font-semibold text-slate-700">
              {calculated.netMargin.toFixed(
                1
              )}
              %
            </span>
          </div>
        </div>
      </Section>

      {/* ====================================================
          BALANCE SHEET
      ==================================================== */}

      <Section
        title="Balance Sheet"
        description="Enter assets, liabilities, and equity. Decisionly checks the accounting equation in real time."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Assets */}

          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Assets
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                What the company owns or
                controls.
              </p>
            </div>

            <div className="space-y-5">
              <InputField
                label="Cash & Cash Equivalents"
                value={values.cash}
                onChange={(value) =>
                  updateValue(
                    "cash",
                    value
                  )
                }
              />

              <InputField
                label="Accounts Receivable"
                value={
                  values.accountsReceivable
                }
                onChange={(value) =>
                  updateValue(
                    "accountsReceivable",
                    value
                  )
                }
              />

              <InputField
                label="Inventory"
                value={
                  values.inventory
                }
                onChange={(value) =>
                  updateValue(
                    "inventory",
                    value
                  )
                }
              />

              <InputField
                label="Other Current Assets"
                value={
                  values.otherCurrentAssets
                }
                onChange={(value) =>
                  updateValue(
                    "otherCurrentAssets",
                    value
                  )
                }
              />

              <InputField
                label="Prepaid Expenses"
                value={
                  values.prepaidExpenses
                }
                onChange={(value) =>
                  updateValue(
                    "prepaidExpenses",
                    value
                  )
                }
              />

              <InputField
                label="Property, Plant & Equipment"
                value={
                  values.fixedAssets
                }
                onChange={(value) =>
                  updateValue(
                    "fixedAssets",
                    value
                  )
                }
              />

              <InputField
                label="Other Non-current Assets"
                value={
                  values.otherNonCurrentAssets
                }
                onChange={(value) =>
                  updateValue(
                    "otherNonCurrentAssets",
                    value
                  )
                }
              />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <SummaryRow
                label="Current Assets"
                value={
                  calculated.currentAssets
                }
              />

              <SummaryRow
                label="Non-current Assets"
                value={
                  calculated.nonCurrentAssets
                }
              />

              <SummaryRow
                label="Total Assets"
                value={
                  calculated.totalAssets
                }
                strong
              />
            </div>
          </div>

          {/* Liabilities & Equity */}

          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Liabilities & Equity
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                What the company owes and the
                owners&apos; residual interest.
              </p>
            </div>

            <div className="space-y-5">
              <InputField
                label="Accounts Payable"
                value={
                  values.accountsPayable
                }
                onChange={(value) =>
                  updateValue(
                    "accountsPayable",
                    value
                  )
                }
              />

              <InputField
                label="Short-term Debt"
                value={
                  values.shortTermDebt
                }
                onChange={(value) =>
                  updateValue(
                    "shortTermDebt",
                    value
                  )
                }
              />

              <InputField
                label="Accrued Liabilities"
                value={
                  values.accruedLiabilities
                }
                onChange={(value) =>
                  updateValue(
                    "accruedLiabilities",
                    value
                  )
                }
              />

              <InputField
                label="Long-term Debt"
                value={
                  values.longTermDebt
                }
                onChange={(value) =>
                  updateValue(
                    "longTermDebt",
                    value
                  )
                }
              />

              <InputField
                label="Other Liabilities"
                value={
                  values.otherLiabilities
                }
                onChange={(value) =>
                  updateValue(
                    "otherLiabilities",
                    value
                  )
                }
              />

              <InputField
                label="Share Capital"
                value={
                  values.shareCapital
                }
                onChange={(value) =>
                  updateValue(
                    "shareCapital",
                    value
                  )
                }
              />

              <InputField
                label="Retained Earnings"
                value={
                  values.retainedEarnings
                }
                onChange={(value) =>
                  updateValue(
                    "retainedEarnings",
                    value
                  )
                }
              />

              <InputField
                label="Other Equity"
                value={
                  values.otherEquity
                }
                onChange={(value) =>
                  updateValue(
                    "otherEquity",
                    value
                  )
                }
              />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <SummaryRow
                label="Current Liabilities"
                value={
                  calculated.currentLiabilities
                }
              />

              <SummaryRow
                label="Total Liabilities"
                value={
                  calculated.totalLiabilities
                }
              />

              <SummaryRow
                label="Total Equity"
                value={
                  calculated.totalEquity
                }
              />

              <SummaryRow
                label="Liabilities + Equity"
                value={
                  calculated.liabilitiesAndEquity
                }
                strong
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            BALANCE CHECK
        ================================================== */}

        <div
          className={`mt-8 rounded-2xl border p-5 ${
            calculated.isBalanced
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    calculated.isBalanced
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {calculated.isBalanced
                    ? "✓"
                    : "!"}
                </span>

                <h3
                  className={`text-sm font-semibold ${
                    calculated.isBalanced
                      ? "text-emerald-900"
                      : "text-rose-900"
                  }`}
                >
                  {calculated.isBalanced
                    ? "Balance Sheet Balanced"
                    : "Balance Sheet Not Balanced"}
                </h3>
              </div>

              <p
                className={`mt-2 text-sm ${
                  calculated.isBalanced
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {calculated.isBalanced
                  ? "Assets equal Liabilities + Equity."
                  : "Adjust the inputs until Assets equal Liabilities + Equity."}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-slate-500">
                Balance Difference
              </p>

              <p
                className={`mt-1 text-xl font-bold ${
                  calculated.isBalanced
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {formatIDR(
                  calculated.balanceDifference
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs text-slate-500">
                Total Assets
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCompactIDR(
                  calculated.totalAssets
                )}
              </p>
            </div>

            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs text-slate-500">
                Liabilities
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCompactIDR(
                  calculated.totalLiabilities
                )}
              </p>
            </div>

            <div className="rounded-xl bg-white/70 p-3">
              <p className="text-xs text-slate-500">
                Equity
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCompactIDR(
                  calculated.totalEquity
                )}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ====================================================
          CASH FLOW
      ==================================================== */}

      <Section
        title="Cash Flow"
        description="Enter cash movement from operating, investing, and financing activities."
      >
        <div className="grid gap-x-6 gap-y-5 md:grid-cols-3">
          <InputField
            label="Operating Cash Flow"
            value={
              values.operatingCashFlow
            }
            onChange={(value) =>
              updateValue(
                "operatingCashFlow",
                value
              )
            }
          />

          <InputField
            label="Investing Cash Flow"
            value={
              values.investingCashFlow
            }
            onChange={(value) =>
              updateValue(
                "investingCashFlow",
                value
              )
            }
            hint="Use negative for cash outflow"
          />

          <InputField
            label="Financing Cash Flow"
            value={
              values.financingCashFlow
            }
            onChange={(value) =>
              updateValue(
                "financingCashFlow",
                value
              )
            }
            hint="Use negative for repayment"
          />
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <SummaryRow
            label="Operating Cash Flow"
            value={
              values.operatingCashFlow
            }
          />

          <SummaryRow
            label="Investing Cash Flow"
            value={
              values.investingCashFlow
            }
            negative={
              values.investingCashFlow < 0
            }
          />

          <SummaryRow
            label="Financing Cash Flow"
            value={
              values.financingCashFlow
            }
            negative={
              values.financingCashFlow < 0
            }
          />

          <SummaryRow
            label="Net Cash Change"
            value={
              calculated.netCashChange
            }
            strong
          />
        </div>
      </Section>

      {/* ====================================================
          FINAL REVIEW
      ==================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Review & Calculate
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review the calculated figures before
              saving this financial submission.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Revenue
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCompactIDR(
                  values.revenue
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Net Profit
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCompactIDR(
                  calculated.netIncome
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Cash Change
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCompactIDR(
                  calculated.netCashChange
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">
                Balance
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${
                  calculated.isBalanced
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {calculated.isBalanced
                  ? "Balanced"
                  : "Not balanced"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={clearForm}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              !calculated.hasAnyInput ||
              !calculated.isBalanced
            }
            className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving
              ? "Saving..."
              : "Save & Calculate"}
          </button>
        </div>

        {!calculated.hasAnyInput ? (
          <p className="mt-3 text-right text-xs text-slate-400">
            Enter your financial data before
            saving.
          </p>
        ) : !calculated.isBalanced ? (
          <p className="mt-3 text-right text-xs text-rose-600">
            Save is disabled until the Balance
            Sheet balances.
          </p>
        ) : (
          <p className="mt-3 text-right text-xs text-emerald-600">
            Balance Sheet is ready to save.
          </p>
        )}
      </section>
    </form>
  );
}

