import Link from "next/link";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Last Updated: September 6, 2026
          </p>
        </div>

        <div className="space-y-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <section>
            <p className="leading-7 text-slate-600">
              Decisionly ("Decisionly", "we", "us", or "our") respects your
              privacy and is committed to protecting information that you
              provide when using our website, application, and services.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              This Privacy Policy explains what information we may collect,
              how we use it, how we protect it, and the choices available to
              you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              1. Information We Collect
            </h2>

            <h3 className="mt-6 font-semibold">Account Information</h3>

            <p className="mt-3 leading-7 text-slate-600">
              When you create an account, we may collect your name, email
              address, login and authentication information, company or
              organization information, and other information necessary to
              manage your account.
            </p>

            <h3 className="mt-6 font-semibold">
              Business and Financial Information
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Decisionly allows users to enter business and financial
              information for analysis. This may include revenue, expenses,
              assets, liabilities, equity, cash flow information, financial
              periods, and other information entered by the user.
            </p>

            <h3 className="mt-6 font-semibold">Payment Information</h3>

            <p className="mt-3 leading-7 text-slate-600">
              When you purchase a paid subscription, payment information may
              be processed by our third-party payment provider. We may receive
              transaction identifiers, subscription status, plan information,
              and billing status.
            </p>

            <h3 className="mt-6 font-semibold">
              Technical Information
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              We may automatically collect information such as IP address,
              browser type, device information, operating system, pages or
              features accessed, usage information, and security-related
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              2. How We Use Information
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-600">
              <li>Create and manage accounts.</li>
              <li>Provide Decisionly features.</li>
              <li>Process subscriptions and payments.</li>
              <li>Generate financial reports and analyses.</li>
              <li>Provide financial insights and metrics.</li>
              <li>Maintain and improve the Service.</li>
              <li>Respond to customer support requests.</li>
              <li>Detect and prevent fraud, abuse, and security incidents.</li>
              <li>Communicate with users about the Service.</li>
              <li>Comply with applicable legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold">3. Financial Data</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Financial information entered into Decisionly is used to provide
              the financial analysis and reporting functionality requested by
              the user.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              We do not sell your financial data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              4. How We Share Information
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We may share information with service providers that help us
              operate Decisionly, including providers for hosting,
              infrastructure, database services, authentication, payment
              processing, email, security, analytics, and customer support.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              We may also disclose information when required by law, legal
              process, or when reasonably necessary to protect the rights,
              safety, security, and property of Decisionly, our users, or
              others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              5. Payment Processing
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Payments for Decisionly subscriptions may be handled by
              third-party payment providers. Information necessary to process
              transactions may be shared with the applicable payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              6. Cookies and Similar Technologies
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly may use cookies or similar technologies to keep users
              signed in, maintain sessions, remember preferences, improve
              security, understand service usage, and improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">7. Data Security</h2>

            <p className="mt-4 leading-7 text-slate-600">
              We use reasonable technical and organizational measures designed
              to protect information against unauthorized access, loss,
              misuse, alteration, or disclosure.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              However, no internet-based service can guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">8. Data Retention</h2>

            <p className="mt-4 leading-7 text-slate-600">
              We retain information for as long as reasonably necessary to
              provide the Service, maintain business records, resolve
              disputes, enforce agreements, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              9. Your Rights and Choices
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Depending on your location and applicable law, you may have
              rights to request access, correction, deletion, restriction, or
              a copy of certain personal information, and to object to
              certain processing.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              To exercise applicable privacy rights, contact us using the
              information below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              10. Children's Privacy
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly is intended for businesses and general audiences. We
              do not knowingly collect personal information from children where
              prohibited by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              11. International Data Transfers
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Decisionly and its service providers may process information in
              countries other than the country where you live. Where required,
              we will take appropriate measures for applicable international
              data transfers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              12. Changes to This Privacy Policy
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We may update this Privacy Policy from time to time. If we make
              material changes, we may provide reasonable notice through the
              Service or other appropriate communication channels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">13. Contact Us</h2>

            <p className="mt-4 leading-7 text-slate-600">
              For privacy questions or privacy requests, contact:
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

          <Link href="/refund" className="hover:text-indigo-600">
            Refund Policy
          </Link>

          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}