"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompanySetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [industry, setIndustry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState("1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const { data: companyId, error: onboardingError } =
  await supabase.rpc("create_company_onboarding", {
    p_name: companyName.trim(),
    p_registration_number: registrationNumber.trim() || null,
    p_company_type: companyType || null,
    p_industry: industry.trim() || null,
    p_country_code: countryCode.trim().toUpperCase() || null,
    p_base_currency: currency,
    p_fiscal_year_start_month: Number(fiscalYearStartMonth),
    p_timezone: timezone,
  });

      if (onboardingError) {
        throw new Error(onboardingError.message);
      }

      if (!companyId) {
        throw new Error(
          "Company was created but no company ID was returned."
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your company.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg">
            D
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Welcome to Decisionly
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Set up your company to start using Decisionly.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Company Setup
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Company Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              These settings can be updated later.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Company Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company Name *
              </label>

              <input
                type="text"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(e.target.value)
                }
                placeholder="e.g. Decisionly Technologies"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Registration Number
              </label>

              <input
                type="text"
                value={registrationNumber}
                onChange={(e) =>
                  setRegistrationNumber(e.target.value)
                }
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* Company Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Company Type
              </label>

              <select
                value={companyType}
                onChange={(e) =>
                  setCompanyType(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="">
                  Select company type
                </option>
                <option value="sole_proprietorship">
                  Sole Proprietorship
                </option>
                <option value="partnership">
                  Partnership
                </option>
                <option value="private_company">
                  Private Company
                </option>
                <option value="public_company">
                  Public Company
                </option>
                <option value="non_profit">
                  Non-Profit
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Industry
              </label>

              <input
                type="text"
                value={industry}
                onChange={(e) =>
                  setIndustry(e.target.value)
                }
                placeholder="e.g. Technology, Retail, Manufacturing"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            {/* Country + Currency */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Country Code
                </label>

                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) =>
                    setCountryCode(
                      e.target.value
                        .toUpperCase()
                        .slice(0, 2)
                    )
                  }
                  placeholder="ID"
                  maxLength={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Base Currency *
                </label>

                <select
                  value={currency}
                  onChange={(e) =>
                    setCurrency(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="USD">
                    USD — US Dollar
                  </option>

                  <option value="EUR">
                    EUR — Euro
                  </option>

                  <option value="GBP">
                    GBP — British Pound
                  </option>

                  <option value="IDR">
                    IDR — Indonesian Rupiah
                  </option>

                  <option value="SGD">
                    SGD — Singapore Dollar
                  </option>

                  <option value="AUD">
                    AUD — Australian Dollar
                  </option>

                  <option value="JPY">
                    JPY — Japanese Yen
                  </option>

                  <option value="CAD">
                    CAD — Canadian Dollar
                  </option>
                </select>
              </div>

            </div>

            {/* Fiscal Year */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Fiscal Year Start
              </label>

              <select
                value={fiscalYearStartMonth}
                onChange={(e) =>
                  setFiscalYearStartMonth(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Timezone
              </label>

              <select
                value={timezone}
                onChange={(e) =>
                  setTimezone(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Jakarta">
                  Asia/Jakarta
                </option>
                <option value="Asia/Singapore">
                  Asia/Singapore
                </option>
                <option value="Asia/Tokyo">
                  Asia/Tokyo
                </option>
                <option value="Europe/London">
                  Europe/London
                </option>
                <option value="America/New_York">
                  America/New_York
                </option>
                <option value="America/Los_Angeles">
                  America/Los_Angeles
                </option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating your company..."
                : "Create Company & Continue"}
            </button>

          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Decisionly — Financial Intelligence for Better Decisions
        </p>
      </div>
    </main>
  );
}