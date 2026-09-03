"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Plan = "free" | "pro" | "business";

const countries = [
  { code: "ID", name: "Indonesia", currency: "IDR" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "MY", name: "Malaysia", currency: "MYR" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "JP", name: "Japan", currency: "JPY" },
];

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [countryCode, setCountryCode] = useState("ID");
  const [currency, setCurrency] = useState("IDR");

  const [selectedPlan, setSelectedPlan] =
    useState<Plan>("free");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Read selected plan from the pricing page.
   *
   * Examples:
   * /register
   * /register?plan=pro
   * /register?plan=business
   */
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const queryPlan = params.get("plan");

    if (
      queryPlan === "pro" ||
      queryPlan === "business"
    ) {
      setSelectedPlan(queryPlan);

      localStorage.setItem(
        "decisionly_selected_plan",
        queryPlan
      );
    } else {
      const savedPlan =
        localStorage.getItem(
          "decisionly_selected_plan"
        );

      if (
        savedPlan === "pro" ||
        savedPlan === "business"
      ) {
        setSelectedPlan(savedPlan);
      }
    }
  }, []);

  function handleCountryChange(code: string) {
    setCountryCode(code);

    const country = countries.find(
      (item) => item.code === code
    );

    if (country) {
      setCurrency(country.currency);
    }
  }

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      /*
       * Save the selected plan before registration.
       *
       * This is important when Supabase requires
       * email confirmation.
       */
      if (
        selectedPlan === "pro" ||
        selectedPlan === "business"
      ) {
        localStorage.setItem(
          "decisionly_selected_plan",
          selectedPlan
        );
      } else {
        localStorage.removeItem(
          "decisionly_selected_plan"
        );
      }

      /*
       * Step 1:
       * Create the Supabase Auth user.
       */
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!user) {
        throw new Error(
          "Unable to create your account."
        );
      }

      /*
       * Supabase may require email confirmation.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setSuccess(
          "Account created successfully. Please check your email to confirm your account."
        );

        setLoading(false);
        return;
      }

      /*
       * Step 2:
       * Create Profile + Company + Owner Membership
       * + Company Settings through the secure RPC.
       */
      const {
        data: companyId,
        error: onboardingError,
      } = await supabase.rpc(
        "complete_company_onboarding",
        {
          p_full_name: fullName.trim(),
          p_company_name: companyName.trim(),
          p_country_code: countryCode,
          p_base_currency: currency,
          p_timezone: "UTC",
          p_fiscal_year_start_month: 1,
        }
      );

      if (onboardingError) {
        throw onboardingError;
      }

      if (!companyId) {
        throw new Error(
          "Company onboarding could not be completed."
        );
      }

      /*
       * Step 3:
       * Free → Dashboard
       *
       * Pro / Business → Login → Paddle Checkout
       *
       * We intentionally do not activate the paid plan
       * here. Paddle webhook will activate it after
       * successful payment/subscription creation.
       */
      if (
        selectedPlan === "pro" ||
        selectedPlan === "business"
      ) {
        router.push(
          `/login?upgrade=${selectedPlan}`
        );
      } else {
        router.push("/dashboard");
      }

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

  const planLabel =
    selectedPlan === "pro"
      ? "Pro"
      : selectedPlan === "business"
      ? "Business"
      : "Free";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-lg">
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
            <div className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {planLabel} Plan
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Start analyzing your business with
              Decisionly.
            </p>

            {selectedPlan === "pro" && (
              <p className="mt-3 text-sm text-indigo-600">
                You selected the Pro plan. After
                registration, you will continue to
                Paddle Checkout.
              </p>
            )}

            {selectedPlan === "business" && (
              <p className="mt-3 text-sm text-indigo-600">
                You selected the Business plan. After
                registration, you will continue to
                Paddle Checkout.
              </p>
            )}
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>

              <input
                type="text"
                required
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="John Smith"
                autoComplete="name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

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
                placeholder="john@company.com"
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
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Use at least 8 characters.
              </p>
            </div>

            <div className="my-6 border-t border-slate-100" />

            {/* Company Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company name
              </label>

              <input
                type="text"
                required
                value={companyName}
                onChange={(event) =>
                  setCompanyName(event.target.value)
                }
                placeholder="Acme Inc."
                autoComplete="organization"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>

            {/* Country */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Country
              </label>

              <select
                value={countryCode}
                onChange={(event) =>
                  handleCountryChange(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              >
                {countries.map((country) => (
                  <option
                    key={country.code}
                    value={country.code}
                  >
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Base currency
              </label>

              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              >
                <option value="IDR">
                  IDR — Indonesian Rupiah
                </option>

                <option value="USD">
                  USD — US Dollar
                </option>

                <option value="SGD">
                  SGD — Singapore Dollar
                </option>

                <option value="MYR">
                  MYR — Malaysian Ringgit
                </option>

                <option value="GBP">
                  GBP — British Pound
                </option>

                <option value="AUD">
                  AUD — Australian Dollar
                </option>

                <option value="JPY">
                  JPY — Japanese Yen
                </option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating your account..."
                : selectedPlan === "free"
                ? "Create account"
                : `Create account & continue to ${planLabel}`}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href={
                selectedPlan === "pro" ||
                selectedPlan === "business"
                  ? `/login?upgrade=${selectedPlan}`
                  : "/login"
              }
              className="font-semibold text-slate-900 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By creating an account, you agree to use
          Decisionly responsibly for your financial
          analysis.
        </p>
      </div>
    </main>
  );
}