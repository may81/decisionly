import QuickInputForm from "@/app/components/quick-input/QuickInputForm";

export default function QuickInputPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <section>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
            Decisionly
          </span>

          <span className="text-xs text-slate-400">
            Financial Input
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Quick Input
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Enter your latest financial numbers. Decisionly will
          calculate your financial metrics and update your
          dashboard automatically.
        </p>
      </section>

      <QuickInputForm />
    </main>
  );
}