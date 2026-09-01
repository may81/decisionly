"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type SidebarProps = {
  userName: string;
  initials: string;
  companyName: string;
  role: string;
};

const navigation = [
  {
    section: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: "⌂",
      },
    ],
  },
  {
    section: "FINANCIAL",
    items: [
      {
        name: "Quick Input",
        href: "/dashboard/quickinput",
        icon: "✦",
      },
      {
        name: "Income Statement",
        href: "/dashboard/income-statement",
        icon: "▥",
      },
      {
        name: "Balance Sheet",
        href: "/dashboard/balance-sheet",
        icon: "◫",
      },
      {
        name: "Cash Flow",
        href: "/dashboard/cash-flow",
        icon: "↗",
      },
    ],
  },
  {
    section: "ANALYSIS",
    items: [
      {
        name: "Insights",
        href: "/dashboard/analysis",
        icon: "◆",
      },
      {
        name: "AI Analyst",
        href: "/dashboard/analysis/ai",
        icon: "✧",
      },
    ],
  },
  {
    section: "REPORTS",
    items: [
      {
        name: "Reports",
        href: "/dashboard/report",
        icon: "▤",
      },
    ],
  },
];

export default function Sidebar({
  userName,
  initials,
  companyName,
  role,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createClient();

  async function handleLogout() {
    try {
      await supabase.auth.signOut();

      localStorage.removeItem(
        "decisionly_active_company"
      );

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-indigo-950 text-white lg:flex">
      {/* Brand */}

      <div className="flex h-20 items-center border-b border-indigo-900/70 px-6">
        <div>
          <div className="text-xl font-bold tracking-tight">
            Decisionly
          </div>

          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-300">
            Financial Intelligence
          </div>
        </div>
      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <div
            key={group.section}
            className="mb-6"
          >
            <div className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-indigo-400">
              {group.section}
            </div>

            <div className="space-y-1">
              {group.items.map(
                (item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`
                    );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-indigo-100 hover:bg-indigo-900/70 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-sm ${
                          active
                            ? "bg-white/15 text-emerald-300"
                            : "text-indigo-300"
                        }`}
                      >
                        {item.icon}
                      </span>

                      {item.name}
                    </Link>
                  );
                }
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}

      <div className="border-t border-indigo-900/70 p-3">
        {/* Settings */}

        <Link
          href="/dashboard/settings"
          className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            pathname ===
            "/dashboard/settings"
              ? "bg-indigo-600 text-white"
              : "text-indigo-100 hover:bg-indigo-900/70 hover:text-white"
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center text-indigo-300">
            ⚙
          </span>

          Settings
        </Link>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-indigo-100 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <span className="flex h-6 w-6 items-center justify-center text-indigo-300">
            ↪
          </span>

          Logout
        </button>

        {/* User */}

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-indigo-900/60 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {userName}
            </div>

            <div className="truncate text-xs text-indigo-300">
              {companyName}
            </div>

            <div className="truncate text-[10px] capitalize text-indigo-400">
              {role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}