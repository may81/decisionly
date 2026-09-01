"use client";

import { useEffect, useState } from "react";

type Report = {
inputDate: string;
cashFlow: {
operatingCashFlow: number;
investingCashFlow: number;
financingCashFlow: number;
netCashChange: number;
cashBalance: number;
};
};

function formatMoney(value: number) {
return new Intl.NumberFormat("id-ID", {
style: "currency",
currency: "IDR",
maximumFractionDigits: 0,
}).format(value);
}

export default function CashFlowPage() {
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
      "Failed to load cash flow:",
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
Loading cash flow... </div>
);
}

if (!report) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-8"> <h1 className="text-xl font-semibold text-slate-900">
Cash Flow </h1>

    <p className="mt-2 text-sm text-slate-500">
      No financial data available yet.
    </p>
  </div>
);


}

const data = report.cashFlow;

return ( <div className="space-y-6">
{/* Header */} <div> <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
Cash Flow </h1>


    <p className="mt-1 text-sm text-slate-500">
      Cash movement for the latest reporting period.
    </p>
  </div>

  {/* Cash Summary */}
  <div className="grid gap-4 md:grid-cols-2">
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Net Cash Change
      </p>

      <p
        className={`mt-2 text-2xl font-bold tabular-nums ${
          data.netCashChange >= 0
            ? "text-emerald-600"
            : "text-red-600"
        }`}
      >
        {formatMoney(
          data.netCashChange
        )}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Operating + investing + financing activities
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Ending Cash Balance
      </p>

      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
        {formatMoney(
          data.cashBalance
        )}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Cash balance reported for this period
      </p>
    </div>
  </div>

  {/* Cash Flow Statement */}
  <div className="rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 px-6 py-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Cash Flow Statement
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Reporting date: {report.inputDate}
      </p>
    </div>

    <div className="divide-y divide-slate-100">
      <SectionTitle title="Operating Activities" />

      <Row
        label="Operating Cash Flow"
        value={data.operatingCashFlow}
      />

      <SectionTitle title="Investing Activities" />

      <Row
        label="Investing Cash Flow"
        value={data.investingCashFlow}
      />

      <SectionTitle title="Financing Activities" />

      <Row
        label="Financing Cash Flow"
        value={data.financingCashFlow}
      />

      <div className="bg-slate-50">
        <TotalRow
          label="Net Cash Change"
          value={data.netCashChange}
          strong
        />
      </div>

      <div className="bg-slate-900">
        <div className="flex items-center justify-between px-6 py-5">
          <span className="font-semibold text-white">
            Ending Cash Balance
          </span>

          <span className="text-lg font-bold tabular-nums text-white">
            {formatMoney(
              data.cashBalance
            )}
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Cash Flow Indicators */}
  <div>
    <h2 className="mb-4 text-sm font-semibold text-slate-900">
      Cash Flow Indicators
    </h2>

    <div className="grid gap-4 md:grid-cols-3">
      <CashIndicator
        title="Operating"
        value={data.operatingCashFlow}
        description="Cash generated or consumed by core operations."
      />

      <CashIndicator
        title="Investing"
        value={data.investingCashFlow}
        description="Cash related to investments and asset purchases."
      />

      <CashIndicator
        title="Financing"
        value={data.financingCashFlow}
        description="Cash related to debt and equity financing."
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


  <span
    className={`text-sm font-semibold tabular-nums ${
      value >= 0
        ? "text-slate-800"
        : "text-red-600"
    }`}
  >
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

function CashIndicator({
title,
value,
description,
}: {
title: string;
value: number;
description: string;
}) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-5"> <div className="flex items-center justify-between"> <p className="text-sm font-semibold text-slate-900">
{title} </p>


    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        value >= 0
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {value >= 0
        ? "Positive"
        : "Negative"}
    </span>
  </div>

  <p
    className={`mt-3 text-xl font-bold tabular-nums ${
      value >= 0
        ? "text-emerald-600"
        : "text-red-600"
    }`}
  >
    {formatMoney(value)}
  </p>

  <p className="mt-2 text-xs leading-5 text-slate-500">
    {description}
  </p>
</div>


);
}
