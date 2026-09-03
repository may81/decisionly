"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";

import { createClient } from "@/lib/supabase/client";

type UpgradePlan = "pro" | "business";

const PLAN_TO_PRICE: Record<
  UpgradePlan,
  string
> = {
  pro: "pri_01m0784wpq5xjxyjg1a8f1kk3m",
  business: "pri_01m078kjpwsq7pgxbxvsq362qm",
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [upgradePlan, setUpgradePlan] =
    useState<UpgradePlan | null>(null);

  /*
   * Detect whether the user is coming from
   * Pro / Business pricing.
   *
   * Supports:
   * /login
   * /login?upgrade=pro
   * /login?upgrade=business
   *
   * Also checks localStorage because a user may
   * have gone through email confirmation first.
   */
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const queryPlan = params.get("upgrade");

    if (
      queryPlan === "pro" ||
      queryPlan === "business"
    ) {
      setUpgradePlan(queryPlan);

      localStorage.setItem(
        "decisionly_selected_plan",
        queryPlan
      );

      return;
    }

    const savedPlan =
      localStorage.getItem(
        "decisionly_selected_plan"
      );

    if (
      savedPlan === "pro" ||
      savedPlan === "business"
    ) {
      setUpgradePlan(savedPlan);
    }
  }, []);

  /*
   * Open Paddle Checkout after the user
   * has successfully authenticated.
   */
  async function openPaddleCheckout(
    plan: UpgradePlan
  ) {
    try {
      setError("");

      const priceId = PLAN_TO_PRICE[plan];

      if (!priceId) {
        throw new Error(
          "Paddle price is not configured."
        );
      }

      /*
       * Ask our server to verify:
       * - authenticated user
       * - active company
       * - valid Paddle price
       *
       * The server returns the company ID.
       */
      const response = await fetch(
        "/api/paddle/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to prepare Paddle checkout."
        );
      }

      if (!data?.companyId) {
        throw new Error(
          "No company was found for this account."
        );
      }

      /*
       * Paddle client token must be public.
       * API key and webhook secret remain server-side.
       */
      const clientToken =
        process.env
          .NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

      if (!clientToken) {
        throw new Error(
          "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured."
        );
      }

     const environment = "production";

      const paddle: Paddle | undefined =
        await initializePaddle({
          token: clientToken,
          environment,
        });

      if (!paddle) {
        throw new Error(
          "Paddle could not be initialized."
        );
      }

      /*
       * Open Paddle overlay checkout.
       *
       * company_id is passed as custom data.
       * Paddle will carry this data to the recurring
       * subscription, allowing our webhook to identify
       * the Decisionly company.
       */
      paddle.Checkout.open({
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
        customData: {
          company_id: data.companyId,
        },
      });

      /*
       * The webhook is responsible for activating
       * the subscription in Supabase.
       *
       * We only remove the temporary selected-plan
       * flag after checkout has successfully opened.
       */
      localStorage.removeItem(
        "decisionly_selected_plan"
      );
    } catch (checkoutError) {
      console.error(
        "Paddle Checkout error:",
        checkoutError
      );

      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to open Paddle checkout."
      );
    }
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const {
        error: signInError,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      /*
       * Paid signup flow.
       *
       * Login first.
       * Then verify company through our server.
       * Then open Paddle Checkout.
       */
      if (upgradePlan) {
        await openPaddleCheckout(
          upgradePlan
        );

        setLoading(false);
        return;
      }

      /*
       * Normal Free login.
       */
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);
      setLoading(false);
    }
  }

  const upgradeLabel =
    upgradePlan === "pro"
      ? "Pro"
      : upgradePlan === "business"
      ? "Business"
      : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            Decisionly
          </div>

          <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Financial Intelligence
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-7">
            {upgradePlan && (
              <div className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {upgradeLabel} Plan
              </div>
            )}

            <h1 className="text-2xl font-bold text-slate-900">
              Welcome to Decisionly
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Financial Analysis & Decision
              Intelligence
            </p>

            {upgradePlan && (
              <p className="mt-3 text-sm text-indigo-600">
                Sign in to continue with your{" "}
                {upgradeLabel} subscription.
              </p>
            )}
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? upgradePlan
                  ? "Preparing checkout..."
                  : "Signing in..."
                : upgradePlan
                ? `Continue to ${upgradeLabel}`
                : "Sign in"}
            </button>
          </form>

          {/* Register */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href={
                upgradePlan
                  ? `/register?plan=${upgradePlan}`
                  : "/register"
              }
              className="font-semibold text-slate-900 hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Decisionly — Financial Intelligence for
          Better Decisions
        </p>
      </div>
    </main>
  );
}