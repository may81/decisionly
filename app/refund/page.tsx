import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              D
            </div>

            <div>
              <div className="text-lg font-bold">Decisionly</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Financial Intelligence
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <p className="text-sm font-semibold text-indigo-600">LEGAL</p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Refund Policy
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Last Updated: September 6, 2026
          </p>
        </div>

        <div className="space-y-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <section>
            <p className="leading-7 text-slate-600">
              This Refund Policy explains how refunds and subscription
              cancellations work for Decisionly paid plans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">1. Free Plan</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly may offer a Free plan at no charge. Because the Free
              plan does not require payment, there is no payment to refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Paid Subscriptions</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly currently offers paid subscription plans, which may
              include Pro and Business plans. Paid subscriptions are billed
              according to the pricing and billing frequency shown at
              checkout.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Cancellation</h2>

            <p className="mt-4 leading-7 text-slate-600">
              You may cancel your paid subscription through the available
              account or subscription management functionality, or by
              contacting us at:
            </p>

            <p className="mt-4 font-semibold">
              maya@decisionly.online
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Cancellation generally stops future recurring charges. Unless
              otherwise required by applicable law or stated below,
              cancellation does not automatically result in a refund for a
              billing period that has already been charged.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              4. Refund Requests
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              If you believe you were charged incorrectly, experienced a
              duplicate charge, or have another billing issue, please contact
              us as soon as possible.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Please include your account email address, relevant subscription
              or transaction information, and a brief explanation of the
              issue.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              We will review the request and determine whether a refund is
              appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              5. Duplicate or Incorrect Charges
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              If you were charged more than once for the same subscription
              period due to a billing error, we will review the transaction
              and, where appropriate, refund the duplicate charge.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Service Issues</h2>

            <p className="mt-4 leading-7 text-slate-600">
              If Decisionly experiences a significant technical issue that
              materially prevents you from using a paid service, please
              contact us.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Depending on the circumstances, we may provide a refund, credit,
              or other reasonable resolution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              7. Refund Processing
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Approved refunds will generally be returned through the original
              payment method used for the transaction.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              The time required for the refund to appear may depend on the
              payment provider and financial institution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              8. Changes to Subscription Plans
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              If you change your subscription plan, billing adjustments may be
              handled according to the applicable subscription and payment
              terms presented at the time of the change.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              9. Consumer Rights
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Nothing in this Refund Policy limits any mandatory refund,
              cancellation, or consumer rights that apply to you under
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">10. Contact</h2>

            <p className="mt-4 leading-7 text-slate-600">
              For refund and billing questions, contact:
            </p>

            <p className="mt-4 font-semibold">
              maya@decisionly.online
            </p>
          </section>
        </div>
      </article>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-5 px-6 py-8 text-sm text-slate-500">
          <Link href="/terms" className="hover:text-indigo-600">
            Terms of Service
          </Link>

          <Link href="/privacy" className="hover:text-indigo-600">
            Privacy Policy
          </Link>

          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}