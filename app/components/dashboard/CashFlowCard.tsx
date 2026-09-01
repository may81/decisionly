"use client";

type CashFlowCardData = {
  cash: number;

  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashChange: number;
};

type CashFlowCardProps = {
  data: CashFlowCardData;
  onView: () => void;
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function signedCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const sign = value >= 0 ? "+" : "-";

  return `${sign}${formatIDR(Math.abs(value))}`;
}

export default function CashFlowCard({
  data,
  onView,
}: CashFlowCardProps) {
  const operatingPositive =
    data.operatingCashFlow > 0;

  const operatingNegative =
    data.operatingCashFlow < 0;

  const cashPosition =
    operatingPositive
      ? "Strong"
      : operatingNegative
        ? "Needs Attention"
        : "Neutral";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Liquidity
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Cash Flow
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest Quick Input cash movement
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          Cash
        </div>
      </div>

      {/* CASH FLOW COMPONENTS */}
      <div className="mt-6 space-y-3">
        <CashRow
          label="Operating"
          value={data.operatingCashFlow}
        />

        <CashRow
          label="Investing"
          value={data.investingCashFlow}
        />

        <CashRow
          label="Financing"
          value={data.financingCashFlow}
        />

        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Net Change
            </span>

            <span
              className={`text-lg font-bold ${
                data.netCashChange >= 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {signedCurrency(
                data.netCashChange
              )}
            </span>
          </div>
        </div>
      </div>

      {/* CASH POSITION */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-500">
            Cash Position
          </span>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              operatingPositive
                ? "bg-emerald-50 text-emerald-700"
                : operatingNegative
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {cashPosition}
          </span>
        </div>

        <p className="mt-3 text-2xl font-bold text-slate-900">
          {formatIDR(data.cash)}
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {operatingPositive
            ? "Operating activities are generating positive cash."
            : operatingNegative
              ? "Operating activities are consuming cash."
              : "No operating cash flow has been recorded."}
        </p>
      </div>

      {/* INTERPRETATION */}
      <div
        className={`mt-4 rounded-xl border p-4 ${
          data.netCashChange >= 0
            ? "border-emerald-100 bg-emerald-50/50"
            : "border-rose-100 bg-rose-50/50"
        }`}
      >
        <p
          className={`text-xs font-bold uppercase tracking-wide ${
            data.netCashChange >= 0
              ? "text-emerald-700"
              : "text-rose-700"
          }`}
        >
          Cash Flow Direction
        </p>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {data.netCashChange > 0
            ? "Cash increased during the latest input period."
            : data.netCashChange < 0
              ? "Cash decreased during the latest input period."
              : "There was no net cash change during the latest input period."}
        </p>
      </div>

      {/* ACTION */}
      <button
        type="button"
        onClick={onView}
        className="mt-6 w-full rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        View Cash Flow →
      </button>
    </section>
  );
}

function CashRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const positive = value >= 0;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">
        {label}
      </span>

      <span
        className={`text-sm font-bold ${
          positive
            ? "text-emerald-600"
            : "text-rose-600"
        }`}
      >
        {signedCurrency(value)}
      </span>
    </div>
  );
}