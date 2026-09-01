"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

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
   * ==========================================================
   * STEP 1
   * CREATE SUPABASE AUTH USER
   * ==========================================================
   */

  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
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
   * ==========================================================
   * STEP 2
   * CHECK SESSION
   * ==========================================================
   */

  const {
    data: { session },
  } = await supabase.auth.getSession();

  /*
   * Supabase email confirmation enabled.
   */

  if (!session) {
    setSuccess(
      "Your account has been created. Please check your email to confirm your account."
    );

    setLoading(false);
    return;
  }

  /*
   * ==========================================================
   * STEP 3
   * COMPANY ONBOARDING
   *
   * Creates:
   * - profile
   * - company
   * - owner membership
   * - company settings
   *
   * Free plan is currently the default onboarding plan.
   * ==========================================================
   */

  const {
    data: companyId,
    error: onboardingError,
  } = await supabase.rpc(
    "complete_company_onboarding",
    {
      p_full_name: fullName,
      p_company_name: companyName,
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
   * ==========================================================
   * STEP 4
   * DASHBOARD
   * ==========================================================
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

return ( <main className="min-h-screen bg-slate-950"> <div className="grid min-h-screen lg:grid-cols-2">

```
    {/* ======================================================
        LEFT BRAND PANEL
        ====================================================== */}

    <section className="relative hidden overflow-hidden lg:flex">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950" />

      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

        {/* Logo */}

        <div>
          <div className="text-2xl font-bold tracking-tight text-white">
            Decisionly
          </div>

          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-300">
            Financial Intelligence
          </div>
        </div>

        {/* Main message */}

        <div className="max-w-xl">

          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-indigo-200">
            Free to get started
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            Understand your numbers.
            <span className="block text-indigo-300">
              Make better decisions.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            Decisionly turns your financial data into
            clear insights, performance analysis and
            decision intelligence for your business.
          </p>

          <div className="mt-10 space-y-5">

            <Benefit
              title="Simple financial input"
              description="Enter your business numbers without complicated accounting software."
            />

            <Benefit
              title="Clear financial analysis"
              description="Understand profitability, liquidity, leverage and cash flow."
            />

            <Benefit
              title="Actionable insights"
              description="Turn financial information into practical business decisions."
            />

          </div>
        </div>

        {/* Footer */}

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} Decisionly.
          Financial intelligence for better decisions.
        </div>

      </div>
    </section>

    {/* ======================================================
        RIGHT REGISTER PANEL
        ====================================================== */}

    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">

      <div className="w-full max-w-xl">

        {/* Mobile logo */}

        <div className="mb-8 text-center lg:hidden">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            Decisionly
          </div>

          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Financial Intelligence
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-7">

            <div className="mb-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Free plan
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start analyzing your business with
              Decisionly. No credit card required.
            </p>

          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* Full name */}

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
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Work email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="john@company.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Use at least 8 characters.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-5">

              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-900">
                  Set up your business
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You can add more companies later from Settings.
                </p>
              </div>

              {/* Company */}

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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

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
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
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

              </div>

            </div>

            {/* Free plan summary */}

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Free
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Everything you need to get started.
                  </p>
                </div>

                <p className="text-sm font-bold text-indigo-700">
                  $0
                </p>

              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">

                <PlanLimit
                  value="1"
                  label="Company"
                />

                <PlanLimit
                  value="3"
                  label="Inputs"
                />

                <PlanLimit
                  value="1"
                  label="Report"
                />

              </div>

            </div>

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
                {success}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating your account..."
                : "Create free account"}
            </button>

          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Sign in
            </Link>
          </div>

        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          By creating an account, you agree to use
          Decisionly responsibly for financial analysis.
        </p>

      </div>

    </section>

  </div>
</main>


);
}

function Benefit({
title,
description,
}: {
title: string;
description: string;
}) {
return ( <div className="flex gap-4">


  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/10 text-sm text-indigo-300">
    ✓
  </div>

  <div>
    <p className="text-sm font-semibold text-white">
      {title}
    </p>

    <p className="mt-1 text-sm leading-6 text-slate-400">
      {description}
    </p>
  </div>

</div>


);
}

function PlanLimit({
value,
label,
}: {
value: string;
label: string;
}) {
return ( <div className="rounded-lg border border-indigo-100 bg-white px-2 py-2 text-center"> <p className="text-sm font-bold text-slate-900">
{value} </p>


  <p className="mt-0.5 text-[10px] text-slate-500">
    {label}
  </p>
</div>


);
}
