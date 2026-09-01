"use client";

import { useEffect, useState } from "react";

type Report = {
inputDate: string;
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
};

function formatMoney(value: number) {
return new Intl.NumberFormat("id-ID", {
style: "currency",
currency: "IDR",
maximumFractionDigits: 0,
}).format(value);
}

export default function IncomeStatementPage() {
const [report, setReport] = useState<Report | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
async function loadReport() {
try {
const response = await fetch("/api/report");
const data = await response.json();

    if (data.success) {
      setReport(data);
    }
  } finally {
    setLoading(false);
  }
}

loadReport();

}, []);

if (loading) {
return ( <div className="p-6 text-sm text-slate-500">
Loading income statement... </div>
);
}

if (!report) {
return ( <div className="rounded-xl border border-slate-200 bg-white p-8"> <h1 className="text-lg font-semibold text-slate-900">
Income Statement </h1>

    <p className="mt-2 text-sm text-slate-500">
      No financial data available yet.
    </p>
  </div>
);


}

const data = report.incomeStatement;

return ( <div className="space-y-6"> <div> <h1 className="text-2xl font-semibold text-slate-900">
Income Statement </h1>


    <p className="mt-1 text-sm text-slate-500">
      Profitability for the latest reporting period.
    </p>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white">
    <div className="border-b border-slate-200 px-6 py-5">
      <div className="text-sm font-semibold text-slate-900">
        Statement of Income
      </div>

      <div className="mt-1 text-xs text-slate-500">
        Reporting date: {report.inputDate}
      </div>
    </div>

    <div className="divide-y divide-slate-100">
      <Row label="Revenue" value={data.revenue} />
      <Row label="Cost of Sales" value={-data.costOfSales} />

      <Row
        label="Gross Profit"
        value={data.grossProfit}
        strong
      />

      <Row
        label="Operating Expenses"
        value={-data.operatingExpenses}
      />

      <Row
        label="Operating Profit"
        value={data.operatingProfit}
        strong
      />

      <Row
        label="Other Income"
        value={data.otherIncome}
      />

      <Row
        label="Other Expenses"
        value={-data.otherExpenses}
      />

      <Row
        label="Net Income"
        value={data.netIncome}
        strong
        highlight
      />
    </div>
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <Metric
      label="Gross Margin"
      value={`${data.grossMargin.toFixed(1)}%`}
    />

    <Metric
      label="Operating Margin"
      value={`${data.operatingMargin.toFixed(1)}%`}
    />

    <Metric
      label="Net Margin"
      value={`${data.netMargin.toFixed(1)}%`}
    />
  </div>
</div>


);
}

function Row({
label,
value,
strong = false,
highlight = false,
}: {
label: string;
value: number;
strong?: boolean;
highlight?: boolean;
}) {
return (
<div
className={`flex items-center justify-between px-6 py-4 ${
        highlight ? "bg-slate-50" : ""
      }`}
>
<span
className={
strong
? "font-semibold text-slate-900"
: "text-sm text-slate-600"
}
>
{label} </span>

  <span
    className={
      strong
        ? "font-semibold text-slate-900"
        : "text-sm text-slate-700"
    }
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


  <p className="mt-2 text-xl font-semibold text-slate-900">
    {value}
  </p>
</div>


);
}
