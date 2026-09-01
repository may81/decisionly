"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Company = {
  id: string;
  name: string;
  role: string;
  status: string;
};

type MembershipRow = {
  role: string;
  status: string;
  companies:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

export default function SettingsPage() {
  const supabase = createClient();

  const [companies, setCompanies] = useState<Company[]>(
    []
  );

  const [activeCompanyId, setActiveCompanyId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] =
    useState<string | null>(null);

  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be logged in.");
        return;
      }

      const {
        data: memberships,
        error: membershipError,
      } = await supabase
        .from("company_members")
        .select(
          `
            role,
            status,
            companies (
              id,
              name
            )
          `
        )
        .eq("user_id", user.id)
        .order("joined_at", {
          ascending: true,
        });

      if (membershipError) {
        console.error(
          "Settings membership error:",
          membershipError
        );

        setError(
          membershipError.message ||
            "Unable to load your companies."
        );

        return;
      }

      const normalized: Company[] =
        ((memberships ?? []) as MembershipRow[])
          .map((membership) => {
            const company = Array.isArray(
              membership.companies
            )
              ? membership.companies[0]
              : membership.companies;

            if (!company) {
              return null;
            }

            return {
              id: company.id,
              name: company.name,
              role: membership.role,
              status: membership.status,
            };
          })
          .filter(
            (company): company is Company =>
              company !== null
          );

      setCompanies(normalized);

      /*
       * ======================================================
       * ACTIVE COMPANY
       *
       * For now we keep the selected company in localStorage.
       * This can later be replaced with a server-side
       * active-company preference.
       * ======================================================
       */

      const storedCompany =
        window.localStorage.getItem(
          "decisionly_active_company"
        );

      if (
        storedCompany &&
        normalized.some(
          (company) =>
            company.id === storedCompany
        )
      ) {
        setActiveCompanyId(storedCompany);
      } else if (normalized.length > 0) {
        const firstCompany = normalized[0];

        setActiveCompanyId(
          firstCompany.id
        );

        window.localStorage.setItem(
          "decisionly_active_company",
          firstCompany.id
        );
      }
    } catch (err) {
      console.error(
        "Settings load error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchCompany(companyId: string) {
    try {
      setSwitching(companyId);

      window.localStorage.setItem(
        "decisionly_active_company",
        companyId
      );

      setActiveCompanyId(companyId);

      /*
       * Refresh the application so pages such as
       * Dashboard, Reports and Quick Input reload
       * using the selected company.
       */
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(
        "Company switch error:",
        err
      );

      setError(
        "Unable to switch company."
      );

      setSwitching(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 w-32 rounded bg-slate-200" />

          <div className="mt-2 h-4 w-80 rounded bg-slate-200" />

          <div className="mt-8 h-48 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />

          <div className="mt-6 h-64 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
        </div>
      </div>
    );
  }

  const activeCompany =
    companies.find(
      (company) =>
        company.id === activeCompanyId
    ) ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Settings
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Company & Account
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your companies, switch the active
              company, and configure your Decisionly
              workspace.
            </p>
          </div>

          <Link
            href="/company/setup"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            + Add Company
          </Link>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          ACTIVE COMPANY
      ====================================================== */}

      <section className="mb-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Active Company
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Current workspace
            </h2>
          </div>

          <div className="p-6">
            {activeCompany ? (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
                    {activeCompany.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {activeCompany.name}
                      </h3>

                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {activeCompany.role} ·{" "}
                      {activeCompany.status}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  All financial data currently belongs
                  to this company.
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="font-medium text-slate-900">
                  No company selected
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Create or join a company to start using
                  Decisionly.
                </p>

                <Link
                  href="/company/setup"
                  className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Create Company
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          COMPANIES
      ====================================================== */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Your Companies
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Companies connected to your account.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {companies.length}{" "}
            {companies.length === 1
              ? "company"
              : "companies"}
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
              +
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No companies yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first company to begin entering
              financial data and generating reports.
            </p>

            <Link
              href="/company/setup"
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create Your First Company
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {companies.map((company) => {
              const active =
                company.id === activeCompanyId;

              const initials = company.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) =>
                  word.charAt(0)
                )
                .join("")
                .toUpperCase();

              return (
                <div
                  key={company.id}
                  className={`rounded-2xl bg-white p-5 shadow-sm ring-1 transition ${
                    active
                      ? "ring-indigo-300"
                      : "ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {initials || "C"}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {company.name}
                          </h3>

                          {active && (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>
                            Role:{" "}
                            <span className="font-medium text-slate-700">
                              {company.role}
                            </span>
                          </span>

                          <span>
                            Status:{" "}
                            <span className="font-medium text-slate-700">
                              {company.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        active ||
                        switching !== null
                      }
                      onClick={() =>
                        switchCompany(
                          company.id
                        )
                      }
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "cursor-default bg-slate-100 text-slate-400"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      }`}
                    >
                      {switching === company.id
                        ? "Switching..."
                        : active
                        ? "Current Company"
                        : "Switch"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          COMPANY SETUP
      ====================================================== */}

      <section className="mt-8">
        <div className="rounded-2xl bg-indigo-950 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
                Workspace
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Need another company?
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-indigo-200">
                Add another company and manage its
                financial data separately from your
                existing workspace.
              </p>
            </div>

            <Link
              href="/company/setup"
              className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50"
            >
              Add New Company
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}