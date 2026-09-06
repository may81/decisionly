import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              D
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                Decisionly
              </div>
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
          <p className="text-sm font-semibold text-indigo-600">
            LEGAL
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Last Updated: September 6, 2026
          </p>
        </div>

        <div className="space-y-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <section>
            <p className="leading-7 text-slate-600">
              Welcome to Decisionly.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              These Terms of Service ("Terms") govern your access to and use
              of the Decisionly website, application, software, and related
              services (collectively, the "Service").
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              By creating an account, accessing, or using Decisionly, you
              agree to these Terms. If you do not agree with these Terms,
              please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">1. About Decisionly</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly is a financial intelligence software service designed
              to help businesses organize financial information, generate
              financial reports, analyze financial performance, and identify
              potential areas requiring attention.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly is designed to support business decision-making. It
              is not a substitute for professional accounting, tax, legal,
              investment, or financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">2. Eligibility</h2>

            <p className="mt-4 leading-7 text-slate-600">
              You must be legally capable of entering into a binding agreement
              to use Decisionly.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              If you use Decisionly on behalf of a business or organization,
              you represent that you have authority to accept these Terms on
              behalf of that organization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Your Account</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Some features of Decisionly require you to create an account.
              You are responsible for providing accurate information,
              maintaining your login credentials, maintaining account
              security, and all activities performed through your account.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              You must notify us promptly if you believe your account has been
              accessed without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">4. Financial Data</h2>

            <p className="mt-4 leading-7 text-slate-600">
              You may enter or upload financial and business information into
              Decisionly ("Customer Data").
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              You retain ownership of your Customer Data. You are responsible
              for ensuring that you have the necessary rights and permissions
              to provide Customer Data to Decisionly.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              You should ensure that the information you provide is accurate
              and complete. Decisionly does not guarantee that financial
              calculations, reports, analyses, insights, or recommendations
              will be error-free or suitable for a particular business
              purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              5. Financial Analysis Disclaimer
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly provides software-generated financial calculations,
              reports, metrics, trends, and insights for informational and
              business-planning purposes only.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly does not provide accounting, tax, legal, investment,
              or audit services. Users are responsible for reviewing
              information generated by the Service and obtaining professional
              advice when appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">6. Plans and Subscriptions</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly may offer free and paid subscription plans, including
              Free, Pro, and Business plans.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Plan features, usage limits, pricing, and availability are
              displayed on the Decisionly website and may change from time to
              time.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Paid subscriptions may automatically renew according to the
              subscription terms presented at checkout.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Payments</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Payments for paid Decisionly subscriptions may be processed by a
              third-party payment service provider.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Payment processing is subject to the payment provider's
              applicable terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">8. Cancellation</h2>

            <p className="mt-4 leading-7 text-slate-600">
              You may cancel your paid subscription according to the
              cancellation functionality available through your account or by
              contacting us.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Cancellation generally prevents future subscription charges but
              does not automatically entitle you to a refund for a billing
              period that has already been charged, except as provided in our
              Refund Policy or where required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">9. Acceptable Use</h2>

            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-600">
              <li>Use Decisionly for unlawful purposes.</li>
              <li>
                Attempt to gain unauthorized access to the Service or another
                user's account.
              </li>
              <li>Interfere with the operation or security of the Service.</li>
              <li>
                Reverse engineer or attempt to extract source code except
                where permitted by applicable law.
              </li>
              <li>
                Copy, resell, sublicense, or commercially exploit the Service
                without permission.
              </li>
              <li>Upload malicious code, viruses, or harmful content.</li>
              <li>
                Attempt to circumvent usage limits or security controls.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">10. Intellectual Property</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly and its software, interface, design, branding,
              documentation, features, and underlying technology are owned by
              or licensed to Decisionly and are protected by applicable
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">11. Privacy</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Our handling of personal information is described in our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">12. Service Availability</h2>

            <p className="mt-4 leading-7 text-slate-600">
              We aim to keep Decisionly available and reliable, but we do not
              guarantee uninterrupted or error-free availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              13. Third-Party Services
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly may integrate with or depend on third-party services,
              including hosting, authentication, analytics, database, email,
              and payment providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              14. Suspension and Termination
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We may suspend or terminate access to an account if you
              materially violate these Terms, create a security risk, engage
              in fraudulent or unlawful activity, fail to meet payment
              obligations, or where suspension is reasonably necessary to
              protect the Service or other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              15. Disclaimer of Warranties
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              To the maximum extent permitted by applicable law, Decisionly is
              provided on an "as is" and "as available" basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              16. Limitation of Liability
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              To the maximum extent permitted by applicable law, Decisionly
              and its operators, employees, contractors, and service providers
              will not be liable for indirect, incidental, special,
              consequential, or punitive damages arising from your use of the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              17. Changes to These Terms
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We may update these Terms from time to time. When material
              changes are made, we may provide reasonable notice through the
              Service or other appropriate means.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">18. Governing Law</h2>

            <p className="mt-4 leading-7 text-slate-600">
              These Terms will be governed by the laws applicable to the legal
              entity operating Decisionly, subject to any mandatory consumer
              protection or other applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">19. Contact</h2>

            <p className="mt-4 leading-7 text-slate-600">
              If you have questions about these Terms, please contact:
            </p>

            <p className="mt-4 font-semibold text-slate-900">
              maya@decisionly.online
            </p>
          </section>
        </div>
      </article>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-5 px-6 py-8 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-indigo-600">
            Privacy Policy
          </Link>

          <Link href="/refund" className="hover:text-indigo-600">
            Refund Policy
          </Link>

          <Link href="/terms" className="hover:text-indigo-600">
            Terms of Service
          </Link>

          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}