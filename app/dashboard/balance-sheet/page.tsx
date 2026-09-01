"use client";

import { useEffect, useState } from "react";

type Report = {
inputDate: string;
balanceSheet: {
cash: number;
accountsReceivable: number;
inventory: number;
otherCurrentAssets: number;
prepaidExpenses: number;
currentAssets: number;


fixedAssets: number;
otherNonCurrentAssets: number;
nonCurrentAssets: number;
totalAssets: number;

accountsPayable: number;
shortTermDebt: number;
accruedLiabilities: number;
currentLiabilities: number;

longTermDebt: number;
otherLiabilities: number;
totalLiabilities: number;

shareCapital: number;
retainedEarnings: number;
otherEquity: number;
totalEquity: number;

liabilitiesAndEquity: number;
balanceDifference: number;
balanceStatus: string;

workingCapital: number;
currentRatio: number | null;
quickRatio: number | null;
debtToEquity: number | null;
debtToAssets: number | null;


};
};

function formatMoney(value: number) {
return new Intl.NumberFormat("id-ID", {
style: "currency",
currency: "IDR",
maximumFractionDigits: 0,
}).format(value);
}

function formatRatio(value: number | null) {
if (value === null) return "—";
return value.toFixed(2);
}

export default function BalanceSheetPage() {
const [report, setReport] = useState<Report | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
async function loadReport() {
try {
const response = await fetch("/api/report", {
cache: "no-store",
});


    const data = await response.json();

    if (data.success && data.hasFinancialData) {
      setReport(data);
    }
  } catch (error) {
    console.error(
      "Failed to load balance sheet:",
      error
    );
  } finally {
    setLoading(false);
  }
}

loadReport();


}, []);

if (loading) {
return ( <div className="p-6 text-sm text-slate-500">
Loading balance sheet... </div>
);
}

if (!report) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-8"> <h1 className="text-xl font-semibold text-slate-900">
Balance Sheet </h1>


    <p className="mt-2 text-sm text-slate-500">
      No financial data available yet.
    </p>
  </div>
);


}

const data = report.balanceSheet;

const balanced =
data.balanceStatus.toLowerCase() ===
"balanced";

return ( <div className="space-y-6">
{/* Header */} <div> <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
Balance Sheet </h1>


    <p className="mt-1 text-sm text-slate-500">
      Financial position as of {report.inputDate}.
    </p>
  </div>

  {/* Balance Status */}
  <div
    className={`rounded-2xl border p-5 ${
      balanced
        ? "border-emerald-200 bg-emerald-50"
        : "border-red-200 bg-red-50"
    }`}
  >
    <div className="flex items-center justify-between gap-4">
      <div>
        <p
          className={`text-sm font-semibold ${
            balanced
              ? "text-emerald-800"
              : "text-red-800"
          }`}
        >
          {balanced
            ? "Balance Sheet Balanced"
            : "Balance Sheet Requires Reconciliation"}
        </p>

        <p
          className={`mt-1 text-xs ${
            balanced
              ? "text-emerald-700"
              : "text-red-700"
          }`}
        >
          Difference:{" "}
          {formatMoney(
            data.balanceDifference
          )}
        </p>
      </div>

      <div
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          balanced
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {data.balanceStatus}
      </div>
    </div>
  </div>

  {/* Main Statement */}
  <div className="rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 px-6 py-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Statement of Financial Position
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Reporting date: {report.inputDate}
      </p>
    </div>

    <div className="divide-y divide-slate-100">
      {/* Assets */}
      <SectionTitle title="Assets" />

      <Row
        label="Cash"
        value={data.cash}
      />

      <Row
        label="Accounts Receivable"
        value={data.accountsReceivable}
      />

      <Row
        label="Inventory"
        value={data.inventory}
      />

      <Row
        label="Other Current Assets"
        value={data.otherCurrentAssets}
      />

      <Row
        label="Prepaid Expenses"
        value={data.prepaidExpenses}
      />

      <TotalRow
        label="Current Assets"
        value={data.currentAssets}
      />

      <div className="h-2 bg-slate-50" />

      <Row
        label="Fixed Assets"
        value={data.fixedAssets}
      />

      <Row
        label="Other Non-Current Assets"
        value={data.otherNonCurrentAssets}
      />

      <TotalRow
        label="Non-Current Assets"
        value={data.nonCurrentAssets}
      />

      <TotalRow
        label="Total Assets"
        value={data.totalAssets}
        strong
      />

      {/* Liabilities */}
      <SectionTitle title="Liabilities" />

      <Row
        label="Accounts Payable"
        value={data.accountsPayable}
      />

      <Row
        label="Short-Term Debt"
        value={data.shortTermDebt}
      />

      <Row
        label="Accrued Liabilities"
        value={data.accruedLiabilities}
      />

      <TotalRow
        label="Current Liabilities"
        value={data.currentLiabilities}
      />

      <div className="h-2 bg-slate-50" />

      <Row
        label="Long-Term Debt"
        value={data.longTermDebt}
      />

      <Row
        label="Other Liabilities"
        value={data.otherLiabilities}
      />

      <TotalRow
        label="Total Liabilities"
        value={data.totalLiabilities}
        strong
      />

      {/* Equity */}
      <SectionTitle title="Equity" />

      <Row
        label="Share Capital"
        value={data.shareCapital}
      />

      <Row
        label="Retained Earnings"
        value={data.retainedEarnings}
      />

      <Row
        label="Other Equity"
        value={data.otherEquity}
      />

      <TotalRow
        label="Total Equity"
        value={data.totalEquity}
        strong
      />

      {/* Final */}
      <div className="bg-slate-50">
        <TotalRow
          label="Liabilities + Equity"
          value={data.liabilitiesAndEquity}
          strong
        />
      </div>
    </div>
  </div>

  {/* Ratios */}
  <div>
    <h2 className="mb-4 text-sm font-semibold text-slate-900">
      Financial Position Indicators
    </h2>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Metric
        label="Working Capital"
        value={formatMoney(
          data.workingCapital
        )}
      />

      <Metric
        label="Current Ratio"
        value={formatRatio(
          data.currentRatio
        )}
      />

      <Metric
        label="Quick Ratio"
        value={formatRatio(
          data.quickRatio
        )}
      />

      <Metric
        label="Debt to Equity"
        value={formatRatio(
          data.debtToEquity
        )}
      />

      <Metric
        label="Debt to Assets"
        value={
          data.debtToAssets === null
            ? "—"
            : `${(
                data.debtToAssets * 100
              ).toFixed(1)}%`
        }
      />
    </div>
  </div>
</div>


);
}

function SectionTitle({
title,
}: {
title: string;
}) {
return ( <div className="bg-slate-50 px-6 py-3"> <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
{title} </p> </div>
);
}

function Row({
label,
value,
}: {
label: string;
value: number;
}) {
return ( <div className="flex items-center justify-between px-6 py-4"> <span className="text-sm text-slate-600">
{label} </span>


  <span className="text-sm font-medium tabular-nums text-slate-800">
    {formatMoney(value)}
  </span>
</div>


);
}

function TotalRow({
label,
value,
strong = false,
}: {
label: string;
value: number;
strong?: boolean;
}) {
return ( <div className="flex items-center justify-between px-6 py-4">
<span
className={
strong
? "font-semibold text-slate-900"
: "font-medium text-slate-700"
}
>
{label} </span>


  <span
    className={`tabular-nums ${
      strong
        ? "font-bold text-slate-900"
        : "font-semibold text-slate-800"
    }`}
  >
    {formatMoney(value)}
  </span>
</div>


);
}

function Metric({
label,
value,
}: {
label: string;
value: string;
}) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-5"> <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
{label} </p>


  <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">
    {value}
  </p>
</div>


);
}
