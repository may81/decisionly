"use client";

import { useEffect, useState } from "react";

import Sidebar from "./sidebar";
import Header from "./header";

import { createClient } from "@/lib/supabase/client";

type AppShellProps = {
  children: React.ReactNode;
};

type CompanyData = {
  name: string;
  role: string;
};

export default function AppShell({
  children,
}: AppShellProps) {
  const supabase = createClient();

  const [userName, setUserName] =
    useState("User");

  const [initials, setInitials] =
    useState("U");

  const [company, setCompany] =
    useState<CompanyData>({
      name: "No Company",
      role: "Member",
    });

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      setUserName(name);

      const calculatedInitials =
        name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map(
            (part: string) =>
              part.charAt(0).toUpperCase()
          )
          .join("") || "U";

      setInitials(
        calculatedInitials
      );

      /*
       * Determine active company.
       */

      const savedCompanyId =
        localStorage.getItem(
          "decisionly_active_company"
        );

      let membershipQuery =
        supabase
          .from("company_members")
          .select(
            `
              company_id,
              role,
              companies (
                id,
                name
              )
            `
          )
          .eq("user_id", user.id)
          .eq("status", "active");

      if (savedCompanyId) {
        membershipQuery =
          membershipQuery.eq(
            "company_id",
            savedCompanyId
          );
      }

      const {
        data: membership,
      } =
        await membershipQuery
          .limit(1)
          .maybeSingle();

      if (
        membership &&
        membership.companies
      ) {
        const companyData =
          membership.companies as unknown as {
            id: string;
            name: string;
          };

        setCompany({
          name: companyData.name,
          role: membership.role,
        });

        if (!savedCompanyId) {
          localStorage.setItem(
            "decisionly_active_company",
            companyData.id
          );
        }
      }
    } catch (error) {
      console.error(
        "AppShell user loading error:",
        error
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        userName={userName}
        initials={initials}
        companyName={
          company.name || "No Company"
        }
        role={company.role}
      />

      <div className="min-h-screen lg:pl-64">
        <Header
          userName={userName}
          initials={initials}
          companyName={
            company.name || "No Company"
          }
        />

        <main className="min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}