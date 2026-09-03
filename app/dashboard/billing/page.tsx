
"use client";

import { useEffect, useState } from "react";

import PaddleCheckout from "@/app/components/billing/paddle-checkout";

type Subscription = {
  id?: string;
  company_id?: string;

  plan: string;
  status: string;

  paddle_customer_id?: string | null;
  paddle_subscription_id?: string | null;
  paddle_price_id?: string | null;

  current_period_start?: string | null;
  current_period_end?: string | null;

  cancel_at_period_end?: boolean;

  created_at?: string | null;
  updated_at?: string | null;
};

type BillingResponse = {
  success: boolean;
  companyId: string;
  subscription: Subscription;
  error?: string;
};

const PRO_PRICE_ID =
  "pri_01m0784wpq5xjxyjg1a8f1kk3m";

const BUSINESS_PRICE_ID =
  "pri_01m078kjpwsq7pgxbxvsq362qm";

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function normalizePlan(plan?: string) {
  return (plan ?? "free").toLowerCase();
}

export default function BillingPage() {
  const [data, setData] =
    useState<BillingResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadBilling() {
      try {
        setLoading(true);

        const response =
          await fetch("/api/billing", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });

        const result =
          (await response.json()) as BillingResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to load billing information."
          );
        }

        setData(result);
      } catch (error) {
        console.error(
          "[Billing Page] Error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load billing information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBilling();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-slate-500">
            Loading billing...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Billing unavailable
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "Unable to load billing information."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const subscription =
    data.subscription;

  const currentPlan =
    normalizePlan(subscription.plan);

  const isPro =
    currentPlan === "pro";

  const isBusiness =
    currentPlan === "business";

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">
            Billing
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Plans & Billing
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage your Decisionly subscription and
            upgrade your plan when you need more
            financial analysis capacity.
          </p>
        </div>

        {/* Current subscription */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Current plan
              </p>

              <div className="mt-1 flex items-center gap-3">
                <h2 className="text-2xl font-bold capitalize text-slate-900">
                  {currentPlan}
                </h2>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                  {subscription.status}
                </span>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Your subscription is scheduled
                to cancel at the end of the
                current billing period.
              </div>
            )}
          </div>

          {subscription.current_period_end && (
            <p className="mt-4 text-sm text-slate-500">
              Current period ends on{" "}
              <span className="font-medium text-slate-700">
                {formatDate(
                  subscription.current_period_end
                )}
              </span>
            </p>
          )}
        </section>

        {/* Plans */}

        <section className="grid gap-6 lg:grid-cols-3">

          {/* FREE */}

          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              currentPlan === "free"
                ? "border-indigo-300 ring-2 ring-indigo-100"
                : "border-slate-200"
            }`}
          >
            <p className="text-sm font-semibold text-slate-500">
              FREE
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              $0
              <span className="text-sm font-normal text-slate-500">
                /month
              </span>
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Get started with essential
              financial analysis.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>✓ Quick Input</li>
              <li>✓ Basic financial analysis</li>
              <li>✓ Financial dashboard</li>
              <li>✓ 1 report per month</li>
            </ul>

            {currentPlan === "free" && (
              <div className="mt-8 rounded-lg bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                Current plan
              </div>
            )}
          </div>

          {/* PRO */}

          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              isPro
                ? "border-indigo-300 ring-2 ring-indigo-100"
                : "border-slate-200"
            }`}
          >
            <p className="text-sm font-semibold text-indigo-600">
              PRO
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              $25
              <span className="text-sm font-normal text-slate-500">
                /month
              </span>
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              More analysis and reporting
              capacity for growing businesses.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>✓ Everything in Free</li>
              <li>✓ Advanced analysis</li>
              <li>✓ More reports</li>
              <li>✓ Financial insights</li>
              <li>✓ AI analysis support</li>
            </ul>

            <div className="mt-8">
              {isPro ? (
                <div className="rounded-lg bg-indigo-50 px-4 py-3 text-center text-sm font-semibold text-indigo-700">
                  Current plan
                </div>
              ) : (
                <PaddleCheckout
                  priceId={PRO_PRICE_ID}
                  companyId={data.companyId}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Upgrade to Pro
                </PaddleCheckout>
              )}
            </div>
          </div>

          {/* BUSINESS */}

          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              isBusiness
                ? "border-emerald-300 ring-2 ring-emerald-100"
                : "border-slate-200"
            }`}
          >
            <p className="text-sm font-semibold text-emerald-600">
              BUSINESS
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              $100
              <span className="text-sm font-normal text-slate-500">
                /month
              </span>
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Full financial intelligence for
              businesses that need deeper insight.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li>✓ Everything in Pro</li>
              <li>✓ Advanced reporting</li>
              <li>✓ Higher usage limits</li>
              <li>✓ Advanced AI analysis</li>
              <li>✓ Business-level insights</li>
            </ul>

            <div className="mt-8">
              {isBusiness ? (
                <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                  Current plan
                </div>
              ) : (
                <PaddleCheckout
                  priceId={BUSINESS_PRICE_ID}
                  companyId={data.companyId}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Upgrade to Business
                </PaddleCheckout>
              )}
            </div>
          </div>

        </section>

        {/* Subscription details */}

        {subscription.paddle_subscription_id && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Subscription details
            </h2>

            <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">

              <div>
                <p className="text-slate-500">
                  Subscription ID
                </p>

                <p className="mt-1 break-all font-medium text-slate-800">
                  {subscription.paddle_subscription_id}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Current period
                </p>

                <p className="mt-1 font-medium text-slate-800">
                  {formatDate(
                    subscription.current_period_start
                  )}
                  {" — "}
                  {formatDate(
                    subscription.current_period_end
                  )}
                </p>
              </div>

            </div>
          </section>
        )}

      </div>
    </main>
  );
}

