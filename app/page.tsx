"use client";

import Link from "next/link";

const plans = [
  {
    name: "Free",
    description: "Get started with essential financial insights.",
    price: "$0",
    period: "forever",
    features: [
      "1 company",
      "3 Quick Input data",
      "1 financial report",
      "Basic financial analysis",
      "Financial health overview",
    ],
    cta: "Get Started Free",
    href: "/register",
    featured: false,
  },
  {
    name: "Pro",
    description: "For growing businesses that need deeper visibility.",
    price: "$25",
    period: "per month",
    features: [
      "1 company",
      "30 Quick Input data",
      "15 financial reports",
      "Advanced financial analysis",
      "Financial trends & comparisons",
      "Business insights",
    ],
    cta: "Start Pro",
    href: "/register?plan=pro",
    featured: true,
  },
  {
    name: "Business",
    description: "For businesses managing multiple companies.",
    price: "$100",
    period: "per month",
    features: [
      "Up to 3 companies",
      "150 Quick Input data",
      "100 financial reports",
      "Advanced financial analysis",
      "Multi-company visibility",
      "Advanced reporting",
      "Priority support",
    ],
    cta: "Start Business",
    href: "/register?plan=business",
    featured: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              D
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                Decisionly
              </div>

              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Financial Intelligence
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#features"
              className="transition hover:text-indigo-600"
            >
              Features
            </a>

            <a
              href="#about"
              className="transition hover:text-indigo-600"
            >
              About Us
            </a>

            <a
              href="#pricing"
              className="transition hover:text-indigo-600"
            >
              Pricing
            </a>

            <a
              href="#contact"
              className="transition hover:text-indigo-600"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -right-40 top-10 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">

          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
              Financial intelligence for better decisions
            </div>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Understand your numbers.
              <span className="block text-indigo-600">
                Make better decisions.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Decisionly turns your financial data into clear reports,
              meaningful insights, and practical business decisions —
              without requiring you to be a financial expert.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                Start for Free
              </Link>

              <a
                href="#pricing"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                View Pricing
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
              <span>✓ No credit card required</span>
              <span>✓ Start with Free plan</span>
              <span>✓ Upgrade anytime</span>
            </div>
          </div>

          {/* HERO DASHBOARD PREVIEW */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-300/40">

              <div className="rounded-xl bg-slate-50 p-5">

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">
                      Financial Overview
                    </div>

                    <div className="mt-1 text-xl font-bold">
                      Business Performance
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    Healthy
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Revenue", "$128K"],
                    ["Net Income", "$24K"],
                    ["Cash", "$61K"],
                    ["Margin", "18.7%"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="text-[11px] text-slate-500">
                        {label}
                      </div>

                      <div className="mt-2 text-lg font-bold text-slate-900">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold">
                    Financial Trend
                  </div>

                  <div className="mt-6 flex h-32 items-end gap-3">
                    {[35, 48, 42, 65, 58, 78, 92].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md bg-indigo-500/80"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="text-xs font-semibold text-indigo-700">
                    Decisionly Insight
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Revenue is growing while operating cash flow remains
                    positive. Your current financial position appears stable.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-indigo-600">
            EVERYTHING IN ONE PLACE
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From financial data to better decisions
          </h2>

          <p className="mt-4 text-slate-600">
            Decisionly gives business owners a simple way to understand
            financial performance and identify what deserves attention.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Simple Financial Input",
              text: "Enter your core financial information without complicated accounting workflows.",
              icon: "01",
            },
            {
              title: "Clear Financial Reports",
              text: "Turn your data into structured income statements, balance sheets, cash flow and reports.",
              icon: "02",
            },
            {
              title: "Actionable Insights",
              text: "Understand profitability, liquidity, leverage, trends and areas requiring attention.",
              icon: "03",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-lg font-semibold">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="bg-slate-950 text-white"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-sm font-semibold text-indigo-400">
              ABOUT DECISIONLY
            </p>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Financial intelligence should be understandable.
            </h2>
          </div>

          <div className="text-slate-300">
            <p className="leading-8">
              Decisionly is built to bridge the gap between financial data
              and everyday business decisions. Instead of overwhelming
              business owners with complex accounting terminology, Decisionly
              focuses on the numbers that matter and explains what they mean.
            </p>

            <p className="mt-5 leading-8">
              Our goal is simple: help businesses understand where they are,
              identify potential risks, and make more confident decisions.
            </p>
          </div>

        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="bg-slate-50 px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-indigo-600">
              SIMPLE PRICING
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Start free. Upgrade when you grow.
            </h2>

            <p className="mt-4 text-slate-600">
              Choose the plan that fits the size and complexity of your
              business.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">

            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-white p-8 ${
                  plan.featured
                    ? "border-indigo-500 shadow-xl shadow-indigo-100"
                    : "border-slate-200"
                }`}
              >

                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-xl font-bold">
                  {plan.name}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                  {plan.description}
                </p>

                <div className="mt-7">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>

                  <span className="ml-2 text-sm text-slate-500">
                    {plan.period}
                  </span>
                </div>

                <Link
                  href={plan.href}
                  className={`mt-7 block rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
                    plan.featured
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {plan.cta}
                </Link>

                <div className="my-7 border-t border-slate-200" />

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 text-sm text-slate-600"
                    >
                      <span className="mt-0.5 text-emerald-500">
                        ✓
                      </span>

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

              </div>
            ))}

          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            All plans can be upgraded as your business grows.
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl bg-indigo-600 px-8 py-14 text-center text-white shadow-2xl shadow-indigo-200 sm:px-14">

          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to understand your business better?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
            Start with the Free plan and see how Decisionly can turn your
            financial data into clearer business decisions.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
          >
            Create Your Free Account
          </Link>

        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="border-t border-slate-200 bg-white px-6 py-20"
      >
        <div className="mx-auto max-w-7xl text-center">

          <p className="text-sm font-semibold text-indigo-600">
            CONTACT US
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Have questions about Decisionly?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Whether you are evaluating Decisionly for yourself or your
            organization, we would be happy to help.
          </p>

          <a
            href="mailto:maya@decisionly.online"
            className="mt-7 inline-block font-semibold text-indigo-600 hover:text-indigo-700"
          >
            maya@decisionly.online
          </a>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">

          <div>
            © {new Date().getFullYear()} Decisionly. All rights reserved.
          </div>

          <div className="flex gap-6">
            <Link
              href="/login"
              className="hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="hover:text-white"
            >
              Register
            </Link>

            <a
              href="#pricing"
              className="hover:text-white"
            >
              Pricing
            </a>
          </div>

        </div>
      </footer>

    </main>
  );
}