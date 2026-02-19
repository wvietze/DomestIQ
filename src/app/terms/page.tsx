import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ━━━ Navigation ━━━ */}
      <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              DomestIQ
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* ━━━ Content ━━━ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Title Block */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-2 text-muted-foreground">
            Effective Date: 19 February 2026 &middot; Last Updated: 19 February 2026
          </p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Please read these Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) carefully before
            using the DomestIQ platform. By accessing or using DomestIQ, you agree to be bound by
            these Terms. If you do not agree with any part of these Terms, you must not use the
            platform.
          </p>
        </div>

        {/* ─── Table of Contents ─── */}
        <nav className="mb-14 rounded-2xl border bg-gray-50/60 p-6 md:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Table of Contents
          </h2>
          <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm list-decimal list-inside">
            {[
              'Definitions',
              'Platform Nature & Relationship',
              'Eligibility',
              'Account Registration',
              'Worker Terms',
              'Client Terms',
              'Bookings & Cancellation',
              'Payments & Fees',
              'Commission Structure',
              'Verification & Trust',
              'Income Verification & Data Sharing',
              'Reviews & Ratings',
              'Messaging & Communication',
              'Intellectual Property',
              'Prohibited Conduct',
              'Dispute Resolution',
              'Limitation of Liability',
              'Indemnification',
              'Privacy',
              'Termination',
              'Modifications to Terms',
              'Governing Law & Jurisdiction',
              'Severability',
              'Contact Information',
            ].map((item, i) => (
              <li key={i}>
                <a
                  href={`#section-${i + 1}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ─── Legal Clauses ─── */}
        <div className="space-y-12 text-[15px] leading-relaxed text-foreground/90">

          {/* ━━━ 1. DEFINITIONS ━━━ */}
          <section id="section-1">
            <h2 className="text-xl font-bold text-foreground mb-4">1. Definitions</h2>
            <p className="mb-3">
              In these Terms, unless the context indicates otherwise, the following words and
              expressions shall have the meanings assigned to them below:
            </p>
            <ul className="space-y-2.5 ml-1">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Platform&quot;</span>
                <span>
                  means the DomestIQ website, mobile application, and all associated services,
                  APIs, and technology operated by DomestIQ (Pty) Ltd.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;DomestIQ&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;</span>
                <span>
                  means DomestIQ (Pty) Ltd, a company registered in the Republic of South Africa.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;User&quot;</span>
                <span>
                  means any person who accesses or uses the Platform, including both Workers and
                  Clients.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Worker&quot;</span>
                <span>
                  means an independent service provider who registers on the Platform to offer
                  domestic, maintenance, or trade services to Clients, including but not limited
                  to domestic workers, gardeners, painters, welders, electricians, plumbers,
                  carpenters, babysitters, and other skilled or semi-skilled tradespeople.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Client&quot;</span>
                <span>
                  means a person or household that registers on the Platform to search for, book,
                  and engage Workers to perform services.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Services&quot;</span>
                <span>
                  means the domestic, maintenance, trade, or other services offered by Workers
                  through the Platform.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Booking&quot;</span>
                <span>
                  means a confirmed arrangement between a Client and a Worker for the performance
                  of Services at an agreed date, time, and location, facilitated through the
                  Platform.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Booking Value&quot;</span>
                <span>
                  means the total amount payable by the Client for a Booking, being the Worker&apos;s
                  Rate plus the Platform Fee.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Worker&apos;s Rate&quot;</span>
                <span>
                  means the fee set by the Worker for the performance of their Services, which the
                  Worker receives in full.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Platform Fee&quot;</span>
                <span>
                  means the service fee charged by DomestIQ to the Client, calculated as a
                  percentage of the Worker&apos;s Rate and added on top of the Worker&apos;s Rate. The
                  Platform Fee is a non-refundable service charge for the use of the Platform.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Paystack&quot;</span>
                <span>
                  means Paystack Payments Limited, the third-party payment processor used by
                  DomestIQ to facilitate financial transactions on the Platform.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Verification&quot;</span>
                <span>
                  means the optional identity verification and/or criminal record clearance
                  processes available to Workers on the Platform.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;POPIA&quot;</span>
                <span>
                  means the Protection of Personal Information Act 4 of 2013, as amended, of the
                  Republic of South Africa.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground min-w-fit">&quot;Content&quot;</span>
                <span>
                  means any text, images, photographs, reviews, ratings, profile information, or
                  other material uploaded, posted, or transmitted by Users through the Platform.
                </span>
              </li>
            </ul>
          </section>

          {/* ━━━ 2. PLATFORM NATURE & RELATIONSHIP ━━━ */}
          <section id="section-2">
            <h2 className="text-xl font-bold text-foreground mb-4">
              2. Platform Nature & Relationship
            </h2>
            <p className="mb-3">
              2.1. DomestIQ is an online marketplace and matching platform that facilitates
              connections between Clients who seek domestic and trade services and Workers who
              offer such services. DomestIQ acts solely as an intermediary and technology
              provider.
            </p>
            <p className="mb-3">
              2.2. <strong>DomestIQ is not an employer.</strong> No employment, agency,
              partnership, joint venture, or franchise relationship is created between DomestIQ
              and any User, whether Worker or Client, by virtue of these Terms or the use of the
              Platform.
            </p>
            <p className="mb-3">
              2.3. Workers are independent contractors who operate their own businesses. DomestIQ
              does not control, direct, or supervise the manner, method, or means by which Workers
              perform their Services. DomestIQ does not set Workers&apos; rates, determine their
              schedules, prescribe their working methods, or guarantee the quality of their work.
            </p>
            <p className="mb-3">
              2.4. The relationship between a Client and a Worker is a direct contractual
              relationship between those two parties. DomestIQ is not a party to any agreement
              between a Client and a Worker for the provision of Services.
            </p>
            <p className="mb-3">
              2.5. DomestIQ does not employ, recommend, endorse, or guarantee any Worker or
              Client. Any verification badges or ratings displayed on the Platform are for
              informational purposes only and do not constitute an endorsement or guarantee by
              DomestIQ.
            </p>
            <p>
              2.6. Nothing in these Terms shall be construed as creating any obligation on the
              part of DomestIQ to ensure the availability of Workers, the completion of Bookings,
              or the satisfactory performance of Services.
            </p>
          </section>

          {/* ━━━ 3. ELIGIBILITY ━━━ */}
          <section id="section-3">
            <h2 className="text-xl font-bold text-foreground mb-4">3. Eligibility</h2>
            <p className="mb-3">
              3.1. You must be at least eighteen (18) years of age to register for and use the
              Platform. By registering, you represent and warrant that you are at least 18 years
              old and have the legal capacity to enter into a binding agreement under South
              African law.
            </p>
            <p className="mb-3">
              3.2. You must be a South African citizen, permanent resident, or otherwise legally
              entitled to work in the Republic of South Africa, or, in the case of Clients,
              legally present in South Africa.
            </p>
            <p className="mb-3">
              3.3. You represent and warrant that all information you provide during registration
              and throughout your use of the Platform is truthful, accurate, current, and
              complete.
            </p>
            <p>
              3.4. DomestIQ reserves the right to refuse registration, suspend, or terminate any
              account if we have reasonable grounds to believe that any information provided is
              inaccurate, false, misleading, or incomplete.
            </p>
          </section>

          {/* ━━━ 4. ACCOUNT REGISTRATION ━━━ */}
          <section id="section-4">
            <h2 className="text-xl font-bold text-foreground mb-4">4. Account Registration</h2>
            <p className="mb-3">
              4.1. To access most features of the Platform, you must create an account by
              providing accurate and complete registration information, including your name, phone
              number, and such other information as may be required.
            </p>
            <p className="mb-3">
              4.2. You are responsible for maintaining the confidentiality and security of your
              account credentials, including your password and any authentication codes. You agree
              to notify DomestIQ immediately of any unauthorised use of your account.
            </p>
            <p className="mb-3">
              4.3. You are solely responsible for all activities that occur under your account,
              whether or not you have authorised such activities.
            </p>
            <p className="mb-3">
              4.4. Each individual may maintain only one (1) account on the Platform. Creating
              multiple accounts is prohibited and may result in the suspension or termination of
              all associated accounts.
            </p>
            <p>
              4.5. DomestIQ reserves the right, in its sole discretion, to refuse registration,
              to suspend, or to terminate any account at any time, with or without cause, and
              with or without prior notice.
            </p>
          </section>

          {/* ━━━ 5. WORKER TERMS ━━━ */}
          <section id="section-5">
            <h2 className="text-xl font-bold text-foreground mb-4">5. Worker Terms</h2>
            <p className="mb-3">
              By registering as a Worker on the Platform, you agree to the following additional
              terms:
            </p>
            <p className="mb-3">
              5.1. <strong>Independent Contractor Status.</strong> You acknowledge and agree that
              you are an independent contractor and not an employee, agent, or representative of
              DomestIQ. You are solely responsible for determining the manner and means by which
              you perform your Services.
            </p>
            <p className="mb-3">
              5.2. <strong>Rate Setting.</strong> You are free to set your own rates for your
              Services. DomestIQ does not dictate, control, or cap the rates you charge. Your
              rates are displayed to Clients on your profile and at the time of Booking.
            </p>
            <p className="mb-3">
              5.3. <strong>Full Rate Retention.</strong> You receive 100% of your stated
              Worker&apos;s Rate. The Platform Fee is charged separately to the Client on top of your
              rate and does not reduce your earnings.
            </p>
            <p className="mb-3">
              5.4. <strong>Availability.</strong> You are responsible for maintaining an accurate
              and up-to-date availability schedule on the Platform. You must promptly respond to
              Booking requests and update your availability to reflect any changes.
            </p>
            <p className="mb-3">
              5.5. <strong>Professional Conduct.</strong> You agree to perform all Services in a
              professional, competent, and workmanlike manner, consistent with the description
              of Services provided on your profile and as agreed with the Client.
            </p>
            <p className="mb-3">
              5.6. <strong>Accurate Information.</strong> You must provide accurate information
              about your skills, qualifications, experience, and the Services you are capable of
              performing.
            </p>
            <p className="mb-3">
              5.7. <strong>Tax Responsibilities.</strong> As an independent contractor, you are
              solely responsible for all tax obligations arising from income earned through the
              Platform, including but not limited to income tax registration with the South
              African Revenue Service (SARS), filing of tax returns, and payment of any taxes,
              levies, or contributions due. DomestIQ does not withhold taxes on your behalf and
              will not issue IRP5 certificates.
            </p>
            <p className="mb-3">
              5.8. <strong>Legal Compliance.</strong> You must comply with all applicable South
              African laws, regulations, by-laws, and industry standards applicable to the
              Services you provide.
            </p>
            <p>
              5.9. <strong>Insurance.</strong> DomestIQ does not provide insurance coverage for
              Workers. You are encouraged to obtain appropriate insurance for your activities,
              including professional liability and personal accident cover.
            </p>
          </section>

          {/* ━━━ 6. CLIENT TERMS ━━━ */}
          <section id="section-6">
            <h2 className="text-xl font-bold text-foreground mb-4">6. Client Terms</h2>
            <p className="mb-3">
              By registering as a Client on the Platform, you agree to the following additional
              terms:
            </p>
            <p className="mb-3">
              6.1. <strong>Accurate Information.</strong> You must provide accurate service
              addresses, contact details, and descriptions of the Services required. Providing
              false or misleading information may result in account termination.
            </p>
            <p className="mb-3">
              6.2. <strong>Safe Working Environment.</strong> You are responsible for ensuring
              that the premises at which Services are to be performed provide a reasonably safe
              working environment for the Worker. This includes disclosing any known hazards,
              ensuring access to water and toilet facilities, and treating Workers with dignity
              and respect as required under the South African Constitution and applicable labour
              legislation.
            </p>
            <p className="mb-3">
              6.3. <strong>Timely Payment.</strong> You agree to pay the full Booking Value
              (Worker&apos;s Rate plus Platform Fee) through the Platform&apos;s designated payment system.
              Payment must be made at the time of Booking or as otherwise specified by the
              Platform. Payments outside the Platform for the initial engagement are prohibited.
            </p>
            <p className="mb-3">
              6.4. <strong>Honest Reviews.</strong> You agree to leave honest, fair, and
              accurate reviews based on your genuine experience with a Worker. Reviews must not
              be discriminatory, defamatory, or retaliatory.
            </p>
            <p className="mb-3">
              6.5. <strong>No Off-Platform Solicitation.</strong> You agree not to solicit or
              engage Workers outside of the Platform for the purpose of circumventing the
              Platform Fee during the initial engagement period. Once a Booking has been completed
              through the Platform and a direct working relationship has been established, ongoing
              direct arrangements between the Client and Worker are at their discretion, though
              the Platform&apos;s protections and dispute resolution mechanisms will not apply to such
              arrangements.
            </p>
            <p>
              6.6. <strong>No Employment Relationship.</strong> You acknowledge that engaging a
              Worker through the Platform does not create an employment relationship between you
              and the Worker. Should you wish to employ a Worker on a permanent or semi-permanent
              basis, you are responsible for complying with all applicable South African labour
              legislation, including the Basic Conditions of Employment Act 75 of 1997 and the
              Labour Relations Act 66 of 1995.
            </p>
          </section>

          {/* ━━━ 7. BOOKINGS & CANCELLATION ━━━ */}
          <section id="section-7">
            <h2 className="text-xl font-bold text-foreground mb-4">7. Bookings & Cancellation</h2>

            <h3 className="font-semibold text-foreground mt-5 mb-2">7.1. Booking Lifecycle</h3>
            <p className="mb-3">
              All Bookings on the Platform follow the following lifecycle:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>
                <strong>Pending:</strong> The Client has submitted a Booking request. The Worker
                has not yet responded.
              </li>
              <li>
                <strong>Accepted:</strong> The Worker has accepted the Booking request. Payment
                is initiated.
              </li>
              <li>
                <strong>Confirmed:</strong> Payment has been successfully processed. The Booking
                is confirmed and binding on both parties.
              </li>
              <li>
                <strong>In Progress:</strong> The Services are being performed.
              </li>
              <li>
                <strong>Completed:</strong> The Services have been performed, and both parties
                have confirmed completion, or the completion period has elapsed.
              </li>
              <li>
                <strong>Cancelled:</strong> The Booking has been cancelled by either party or by
                DomestIQ, subject to the cancellation policies below.
              </li>
              <li>
                <strong>Disputed:</strong> A dispute has been raised regarding the Booking and is
                under review.
              </li>
            </ul>

            <h3 className="font-semibold text-foreground mt-5 mb-2">
              7.2. Client Cancellation Policy
            </h3>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>
                Cancellation more than 24 hours before the scheduled Service: full refund of the
                Worker&apos;s Rate; Platform Fee is non-refundable.
              </li>
              <li>
                Cancellation between 12 and 24 hours before the scheduled Service: 50% refund of
                the Worker&apos;s Rate; Platform Fee is non-refundable.
              </li>
              <li>
                Cancellation less than 12 hours before the scheduled Service or failure to be
                available (no-show by Client): no refund. The Worker shall receive the full
                Worker&apos;s Rate.
              </li>
            </ul>

            <h3 className="font-semibold text-foreground mt-5 mb-2">
              7.3. Worker Cancellation Policy
            </h3>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>
                Workers may cancel a confirmed Booking, but repeated cancellations will
                negatively affect the Worker&apos;s reliability rating and may result in reduced
                visibility or account suspension.
              </li>
              <li>
                If a Worker cancels a confirmed Booking, the Client shall receive a full refund
                of all amounts paid, including the Platform Fee.
              </li>
              <li>
                Worker no-shows (failure to arrive for a confirmed Booking without prior
                cancellation) are treated as serious violations and may result in account
                suspension or termination.
              </li>
            </ul>

            <h3 className="font-semibold text-foreground mt-5 mb-2">7.4. No-Show Policies</h3>
            <p className="mb-3">
              A no-show occurs when either party fails to honour a confirmed Booking without
              cancelling in advance. DomestIQ reserves the right to impose penalties on Users who
              repeatedly no-show, including temporary or permanent suspension of their accounts.
            </p>

            <h3 className="font-semibold text-foreground mt-5 mb-2">7.5. Recurring Bookings</h3>
            <p>
              The Platform supports recurring Bookings (e.g., weekly or monthly arrangements).
              Each occurrence within a recurring Booking is treated as a separate Booking for the
              purposes of payment and cancellation. Either party may cancel future occurrences of
              a recurring Booking with reasonable notice, as specified in the Platform&apos;s
              interface.
            </p>
          </section>

          {/* ━━━ 8. PAYMENTS & FEES ━━━ */}
          <section id="section-8">
            <h2 className="text-xl font-bold text-foreground mb-4">8. Payments & Fees</h2>
            <p className="mb-3">
              8.1. <strong>Worker Sets Rate.</strong> Each Worker sets their own rate for the
              Services they provide. DomestIQ does not set, approve, or cap Worker rates.
            </p>
            <p className="mb-3">
              8.2. <strong>Client Pays Total.</strong> The Client pays the total Booking Value,
              which comprises the Worker&apos;s Rate plus the Platform Fee. The breakdown of the
              Worker&apos;s Rate and Platform Fee is displayed clearly to the Client before
              confirmation of each Booking.
            </p>
            <p className="mb-3">
              8.3. <strong>Platform Fee.</strong> The Platform Fee is a non-refundable service
              charge paid by the Client for the use of the Platform&apos;s matching, scheduling,
              communication, payment processing, verification, and dispute resolution
              infrastructure. The Platform Fee is not deducted from the Worker&apos;s Rate.
            </p>
            <p className="mb-3">
              8.4. <strong>Payment Processing.</strong> All payments on the Platform are processed
              through Paystack. By using the Platform, you agree to Paystack&apos;s terms of service
              and privacy policy. DomestIQ is not responsible for any errors, delays, or failures
              in payment processing caused by Paystack or your financial institution.
            </p>
            <p className="mb-3">
              8.5. <strong>Payout to Workers.</strong> Workers receive payouts of their Worker&apos;s
              Rate after the Booking has been marked as completed. Payouts are processed within
              the timeframes displayed on the Platform, which are typically one (1) to three (3)
              business days after completion, subject to Paystack&apos;s processing timelines.
            </p>
            <p className="mb-3">
              8.6. <strong>Refund Conditions.</strong> Refunds are issued in accordance with the
              cancellation policies set out in Section 7. In the event of a dispute, refunds may
              be withheld pending resolution as described in Section 16. The Platform Fee is
              non-refundable except where a Worker cancels or no-shows a confirmed Booking.
            </p>
            <p>
              8.7. <strong>Currency.</strong> All amounts on the Platform are quoted and payable
              in South African Rand (ZAR).
            </p>
          </section>

          {/* ━━━ 9. COMMISSION STRUCTURE ━━━ */}
          <section id="section-9">
            <h2 className="text-xl font-bold text-foreground mb-4">9. Commission Structure</h2>
            <p className="mb-3">
              9.1. DomestIQ charges Clients a Platform Fee (service fee) calculated as a
              percentage of the Worker&apos;s Rate for each Booking. The applicable percentage is
              displayed on the Platform and may be updated from time to time in accordance with
              Section 21 (Modifications to Terms).
            </p>
            <p className="mb-3">
              9.2. For the avoidance of doubt:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>
                The Worker receives 100% of their stated Worker&apos;s Rate. No commission, fee, or
                deduction is taken from the Worker&apos;s earnings by DomestIQ.
              </li>
              <li>
                The Platform Fee is charged to the Client on top of (in addition to) the
                Worker&apos;s Rate.
              </li>
              <li>
                The total amount the Client pays is: Worker&apos;s Rate + Platform Fee = Booking Value.
              </li>
            </ul>
            <p className="mb-3">
              9.3. The Platform Fee covers the costs of:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>Platform development, maintenance, and operation;</li>
              <li>Worker verification infrastructure (identity and criminal record checks);</li>
              <li>Secure payment processing;</li>
              <li>Dispute resolution services;</li>
              <li>Trust and safety features;</li>
              <li>Multi-language translation services;</li>
              <li>Customer support; and</li>
              <li>Ongoing platform improvements.</li>
            </ul>
            <p>
              9.4. DomestIQ may offer promotional rates, discounts, or fee waivers at its
              discretion. Such offers are temporary and do not create an entitlement to
              continued reduced fees.
            </p>
          </section>

          {/* ━━━ 10. VERIFICATION & TRUST ━━━ */}
          <section id="section-10">
            <h2 className="text-xl font-bold text-foreground mb-4">10. Verification & Trust</h2>
            <p className="mb-3">
              10.1. <strong>Optional Verification.</strong> Workers may voluntarily submit to
              identity verification (South African Identity Document) and criminal record
              clearance through the Platform. Verification is not mandatory but may increase a
              Worker&apos;s visibility and trustworthiness on the Platform.
            </p>
            <p className="mb-3">
              10.2. <strong>Verification Badges.</strong> Workers who successfully complete
              verification processes will receive corresponding badges on their profiles (e.g.,
              &quot;ID Verified&quot;, &quot;Criminal Clearance&quot;). These badges indicate that the Worker has
              submitted to a specific verification process and that the results were satisfactory
              at the time of verification.
            </p>
            <p className="mb-3">
              10.3. <strong>No Guarantee.</strong> DomestIQ does not guarantee the accuracy,
              completeness, or reliability of any verification results. Verification is conducted
              through third-party service providers, and DomestIQ relies on the information
              provided by these services. Verification results reflect a point-in-time assessment
              and may not account for subsequent changes in a Worker&apos;s circumstances.
            </p>
            <p className="mb-3">
              10.4. <strong>Limitation of Scope.</strong> Verification on the Platform is limited
              to the specific checks offered (identity and criminal record). It does not
              constitute a comprehensive background check and does not verify a Worker&apos;s skills,
              qualifications, competence, character, or fitness to perform any particular Service.
            </p>
            <p>
              10.5. <strong>Client Responsibility.</strong> Clients are encouraged to exercise
              their own judgement when engaging Workers. Verification badges should be considered
              as one factor among many, including reviews, ratings, profile completeness, and
              personal assessment.
            </p>
          </section>

          {/* ━━━ 11. INCOME VERIFICATION & DATA SHARING ━━━ */}
          <section id="section-11">
            <h2 className="text-xl font-bold text-foreground mb-4">
              11. Income Verification & Data Sharing
            </h2>
            <p className="mb-3">
              11.1. <strong>Income Statements.</strong> Workers who use the Platform to receive
              payments may generate verified income statements reflecting their earnings through
              the Platform over a specified period. These statements are based on actual
              transaction data recorded by the Platform.
            </p>
            <p className="mb-3">
              11.2. <strong>Opt-In Data Sharing.</strong> Workers may, at their sole discretion,
              opt in to share their verified income data with DomestIQ&apos;s approved financial
              partners, including but not limited to banks and financial institutions (such as
              Capitec Bank, TymeBank, and others), for the purpose of facilitating access to
              financial products and services such as loans, savings accounts, and insurance.
            </p>
            <p className="mb-3">
              11.3. <strong>Explicit Consent.</strong> Data sharing under this section requires
              the Worker&apos;s explicit, informed, and voluntary consent, obtained in compliance with
              POPIA. Consent is obtained through the Platform&apos;s interface and clearly specifies:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>What data will be shared;</li>
              <li>With whom the data will be shared;</li>
              <li>The purpose for which the data will be shared; and</li>
              <li>The Worker&apos;s right to withdraw consent at any time.</li>
            </ul>
            <p className="mb-3">
              11.4. <strong>Revocable Consent.</strong> Workers may withdraw their consent to data
              sharing at any time through the Platform&apos;s settings. Withdrawal of consent will
              take effect prospectively and will not affect data already shared prior to
              withdrawal.
            </p>
            <p className="mb-3">
              11.5. <strong>POPIA Compliance.</strong> All data sharing under this section is
              conducted in strict compliance with POPIA. DomestIQ acts as the responsible party
              and ensures that all financial partners who receive Worker data are bound by
              appropriate data processing agreements.
            </p>
            <p>
              11.6. <strong>No Obligation.</strong> Opting in to income data sharing is entirely
              voluntary. A Worker&apos;s decision not to opt in will not affect their access to the
              Platform, their visibility, or their ability to receive Bookings.
            </p>
          </section>

          {/* ━━━ 12. REVIEWS & RATINGS ━━━ */}
          <section id="section-12">
            <h2 className="text-xl font-bold text-foreground mb-4">12. Reviews & Ratings</h2>
            <p className="mb-3">
              12.1. After the completion of a Booking, both the Client and the Worker may leave
              reviews and ratings for each other through the Platform.
            </p>
            <p className="mb-3">
              12.2. Reviews must be honest, fair, and based on the genuine experience of the
              reviewer during the relevant Booking. Reviews must not contain defamatory,
              discriminatory, threatening, or obscene content.
            </p>
            <p className="mb-3">
              12.3. Users shall not manipulate, fabricate, or otherwise interfere with the
              review and rating system, including by:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>Posting fake reviews (positive or negative);</li>
              <li>Offering incentives in exchange for positive reviews;</li>
              <li>Threatening negative reviews as a means of coercion;</li>
              <li>Using multiple accounts to inflate or deflate ratings; or</li>
              <li>Posting reviews for Bookings that did not take place.</li>
            </ul>
            <p className="mb-3">
              12.4. DomestIQ reserves the right to remove or moderate reviews that violate these
              Terms, are flagged as fraudulent, or that we reasonably believe are not based on a
              genuine service experience. Removed reviews will not be counted toward a User&apos;s
              rating.
            </p>
            <p>
              12.5. Reviews and ratings may impact a Worker&apos;s visibility and ranking in search
              results on the Platform. DomestIQ&apos;s search ranking algorithm considers multiple
              factors, of which reviews and ratings are one component.
            </p>
          </section>

          {/* ━━━ 13. MESSAGING & COMMUNICATION ━━━ */}
          <section id="section-13">
            <h2 className="text-xl font-bold text-foreground mb-4">
              13. Messaging & Communication
            </h2>
            <p className="mb-3">
              13.1. The Platform provides an in-app messaging system to facilitate communication
              between Clients and Workers. Users must use the Platform&apos;s messaging system for
              all Booking-related communication prior to the confirmation of a Booking.
            </p>
            <p className="mb-3">
              13.2. <strong>Translation Services.</strong> The Platform offers AI-powered
              translation across all eleven (11) official South African languages to facilitate
              communication between Users who speak different languages. While we strive for
              accuracy, DomestIQ does not guarantee the accuracy of translations and is not
              liable for misunderstandings arising from translation errors.
            </p>
            <p className="mb-3">
              13.3. <strong>Contact Information Restriction.</strong> Users shall not share
              personal contact information (including phone numbers, email addresses, physical
              addresses, or social media profiles) through the Platform&apos;s messaging system
              before a Booking has been confirmed. Sharing of the Client&apos;s service address is
              automatically facilitated by the Platform upon Booking confirmation.
            </p>
            <p className="mb-3">
              13.4. <strong>Prohibited Content.</strong> Users shall not transmit through the
              Platform&apos;s messaging system any content that is:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>Illegal, threatening, abusive, harassing, or defamatory;</li>
              <li>Discriminatory on the basis of race, gender, religion, ethnicity, nationality, disability, sexual orientation, or any other protected ground;</li>
              <li>Sexually explicit or obscene;</li>
              <li>Spam, advertising, or unsolicited commercial messages; or</li>
              <li>Designed to solicit Users away from the Platform in circumvention of these Terms.</li>
            </ul>
            <p>
              13.5. DomestIQ reserves the right to monitor and moderate messages for compliance
              with these Terms and applicable law, subject to POPIA requirements.
            </p>
          </section>

          {/* ━━━ 14. INTELLECTUAL PROPERTY ━━━ */}
          <section id="section-14">
            <h2 className="text-xl font-bold text-foreground mb-4">14. Intellectual Property</h2>
            <p className="mb-3">
              14.1. <strong>Platform Ownership.</strong> The Platform, including all software,
              code, design, text, graphics, logos, trademarks, service marks, user interfaces,
              visual interfaces, algorithms, and data compilations (excluding User Content), is
              the exclusive property of DomestIQ (Pty) Ltd or its licensors and is protected by
              South African and international intellectual property laws.
            </p>
            <p className="mb-3">
              14.2. <strong>User Content.</strong> Users retain ownership of all Content they
              upload or post to the Platform, including profile information, photographs, and
              reviews.
            </p>
            <p className="mb-3">
              14.3. <strong>Licence Grant.</strong> By uploading or posting Content to the
              Platform, you grant DomestIQ a non-exclusive, royalty-free, worldwide, transferable,
              sublicensable licence to use, reproduce, modify, adapt, display, distribute, and
              translate your Content solely for the purposes of operating, promoting, and
              improving the Platform. This licence terminates when you delete your Content or
              your account, except where your Content has been shared with other Users or third
              parties as part of the normal operation of the Platform (e.g., reviews).
            </p>
            <p>
              14.4. <strong>Restrictions.</strong> You may not copy, reproduce, modify, reverse
              engineer, decompile, disassemble, distribute, sell, or exploit any part of the
              Platform without the prior written consent of DomestIQ.
            </p>
          </section>

          {/* ━━━ 15. PROHIBITED CONDUCT ━━━ */}
          <section id="section-15">
            <h2 className="text-xl font-bold text-foreground mb-4">15. Prohibited Conduct</h2>
            <p className="mb-3">
              Users shall not engage in any of the following conduct on or in connection with
              the Platform:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-3">
              <li>
                <strong>Fraud:</strong> Providing false information, impersonating another person,
                or engaging in any deceptive or fraudulent activity;
              </li>
              <li>
                <strong>Discrimination:</strong> Discriminating against any User on the basis of
                race, colour, ethnicity, national origin, religion, gender, sex, sexual
                orientation, gender identity, disability, age, or any other ground protected
                under the Promotion of Equality and Prevention of Unfair Discrimination Act 4 of
                2000 or the South African Constitution;
              </li>
              <li>
                <strong>Harassment:</strong> Engaging in harassment, bullying, intimidation,
                threats, or any conduct that creates a hostile or unsafe environment for other
                Users;
              </li>
              <li>
                <strong>Fee Circumvention:</strong> Attempting to circumvent, avoid, or reduce
                the Platform Fee through off-platform arrangements, direct solicitation prior to
                initial engagement, or any other means;
              </li>
              <li>
                <strong>Fake Reviews:</strong> Posting, soliciting, or purchasing fake reviews or
                ratings, or engaging in any manipulation of the review and rating system;
              </li>
              <li>
                <strong>Illegal Activity:</strong> Using the Platform for any illegal purpose or
                in violation of any applicable law or regulation;
              </li>
              <li>
                <strong>Data Harvesting:</strong> Scraping, mining, or collecting data from the
                Platform or other Users&apos; profiles without authorisation;
              </li>
              <li>
                <strong>Interference:</strong> Interfering with the proper functioning of the
                Platform, including through the use of viruses, bots, or automated tools;
              </li>
              <li>
                <strong>Misrepresentation:</strong> Misrepresenting qualifications, skills,
                experience, or verification status; or
              </li>
              <li>
                <strong>Exploitation:</strong> Exploiting, abusing, or taking advantage of other
                Users, including through unfair labour practices.
              </li>
            </ul>
            <p>
              DomestIQ reserves the right to investigate and take appropriate action against any
              User who engages in prohibited conduct, including issuing warnings, suspending or
              terminating accounts, withholding payments, and reporting conduct to relevant
              authorities.
            </p>
          </section>

          {/* ━━━ 16. DISPUTE RESOLUTION ━━━ */}
          <section id="section-16">
            <h2 className="text-xl font-bold text-foreground mb-4">16. Dispute Resolution</h2>
            <p className="mb-3">
              16.1. <strong>Internal Resolution.</strong> In the event of a dispute between a
              Client and a Worker arising from a Booking, the parties are encouraged to first
              attempt to resolve the dispute directly through the Platform&apos;s messaging system.
            </p>
            <p className="mb-3">
              16.2. <strong>Platform Mediation.</strong> If the parties are unable to resolve the
              dispute directly, either party may request DomestIQ to mediate the dispute through
              the Platform&apos;s dispute resolution process. DomestIQ will review the available
              evidence, including Booking details, messages, and any supporting documentation, and
              issue a non-binding recommendation. Both parties agree to participate in good faith
              in the mediation process.
            </p>
            <p className="mb-3">
              16.3. <strong>Formal Mediation.</strong> If the dispute is not resolved through
              Platform Mediation, either party may refer the dispute to formal mediation
              administered by the Arbitration Foundation of Southern Africa (AFSA) or another
              recognised mediation body, at the cost of the referring party.
            </p>
            <p className="mb-3">
              16.4. <strong>Arbitration.</strong> If mediation fails or is not pursued, either
              party may refer the dispute to binding arbitration administered by AFSA under its
              then-current arbitration rules. The arbitration shall be conducted in English, in
              the Republic of South Africa, by a single arbitrator appointed in accordance with
              AFSA&apos;s rules. The decision of the arbitrator shall be final and binding on both
              parties.
            </p>
            <p className="mb-3">
              16.5. <strong>Disputes with DomestIQ.</strong> Any dispute between a User and
              DomestIQ arising out of or in connection with these Terms shall be subject to the
              jurisdiction of the courts specified in Section 22.
            </p>
            <p>
              16.6. <strong>Urgent Relief.</strong> Nothing in this section prevents either party
              from seeking urgent interim relief from a court of competent jurisdiction where
              necessary to prevent irreparable harm.
            </p>
          </section>

          {/* ━━━ 17. LIMITATION OF LIABILITY ━━━ */}
          <section id="section-17">
            <h2 className="text-xl font-bold text-foreground mb-4">17. Limitation of Liability</h2>
            <p className="mb-3">
              17.1. The Platform is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of
              any kind, whether express, implied, or statutory, including but not limited to
              implied warranties of merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
            <p className="mb-3">
              17.2. DomestIQ does not warrant that the Platform will be uninterrupted,
              error-free, secure, or free from viruses or other harmful components.
            </p>
            <p className="mb-3">
              17.3. To the maximum extent permitted by South African law, DomestIQ, its
              directors, officers, employees, affiliates, and agents shall not be liable for any:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>Indirect, incidental, special, consequential, or punitive damages;</li>
              <li>Loss of profits, revenue, data, or business opportunities;</li>
              <li>Damages arising from the quality, safety, legality, or any other aspect of Services provided by Workers;</li>
              <li>Theft, damage to property, personal injury, or death arising from or in connection with Services;</li>
              <li>Disputes between Clients and Workers;</li>
              <li>Losses caused by the actions or omissions of Workers or Clients;</li>
              <li>Losses arising from unauthorised access to or alteration of User data; or</li>
              <li>Losses arising from payment processing errors or delays caused by Paystack or financial institutions.</li>
            </ul>
            <p className="mb-3">
              17.4. <strong>Liability Cap.</strong> To the maximum extent permitted by law,
              DomestIQ&apos;s total aggregate liability to any User for any claims arising out of or
              related to these Terms or the use of the Platform shall not exceed the total
              Platform Fees paid by or to that User in the twelve (12) months immediately
              preceding the event giving rise to the claim.
            </p>
            <p>
              17.5. The limitations of liability set out in this section apply to the fullest
              extent permitted by the Consumer Protection Act 68 of 2008 and other applicable
              South African legislation.
            </p>
          </section>

          {/* ━━━ 18. INDEMNIFICATION ━━━ */}
          <section id="section-18">
            <h2 className="text-xl font-bold text-foreground mb-4">18. Indemnification</h2>
            <p className="mb-3">
              18.1. You agree to indemnify, defend, and hold harmless DomestIQ, its directors,
              officers, employees, affiliates, agents, and licensors from and against any and all
              claims, demands, actions, liabilities, losses, damages, costs, and expenses
              (including reasonable legal fees) arising out of or in connection with:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>Your use of the Platform;</li>
              <li>Your violation of these Terms;</li>
              <li>Your violation of any applicable law or the rights of any third party;</li>
              <li>Any Content you upload or post to the Platform;</li>
              <li>Any Services you provide or receive through the Platform;</li>
              <li>Any dispute between you and another User; or</li>
              <li>Any tax liability arising from your earnings through the Platform.</li>
            </ul>
            <p>
              18.2. This indemnification obligation survives the termination of your account and
              these Terms.
            </p>
          </section>

          {/* ━━━ 19. PRIVACY ━━━ */}
          <section id="section-19">
            <h2 className="text-xl font-bold text-foreground mb-4">19. Privacy</h2>
            <p className="mb-3">
              19.1. Your use of the Platform is also governed by our{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. Please review the Privacy
              Policy carefully to understand how we collect, use, protect, and disclose your
              personal information.
            </p>
            <p className="mb-3">
              19.2. DomestIQ is committed to compliance with the Protection of Personal
              Information Act 4 of 2013 (POPIA). We process personal information lawfully and in
              a manner that does not infringe the privacy of data subjects, as required by POPIA.
            </p>
            <p className="mb-3">
              19.3. By using the Platform, you consent to the collection, processing, and
              storage of your personal information as described in our Privacy Policy and these
              Terms.
            </p>
            <p>
              19.4. You have the right to access, correct, and request deletion of your personal
              information in accordance with POPIA. Requests should be directed to our
              Information Officer as set out in Section 24.
            </p>
          </section>

          {/* ━━━ 20. TERMINATION ━━━ */}
          <section id="section-20">
            <h2 className="text-xl font-bold text-foreground mb-4">20. Termination</h2>
            <p className="mb-3">
              20.1. <strong>Termination by User.</strong> You may terminate your account at any
              time by using the account deletion feature in your profile settings or by
              contacting DomestIQ. Upon request, your account will enter a thirty (30) day
              soft-delete period, after which all personal information will be permanently
              deleted, subject to clause 20.4.
            </p>
            <p className="mb-3">
              20.2. <strong>Termination by DomestIQ.</strong> DomestIQ may suspend or terminate
              your account at any time, with or without cause, and with or without notice, for
              reasons including but not limited to:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>Violation of these Terms;</li>
              <li>Fraudulent, abusive, or illegal activity;</li>
              <li>Repeated no-shows or cancellations;</li>
              <li>Receipt of multiple negative reviews or complaints;</li>
              <li>Failure to maintain accurate account information;</li>
              <li>Inactivity for a period exceeding twelve (12) months; or</li>
              <li>Any conduct that DomestIQ reasonably believes is harmful to other Users, the Platform, or DomestIQ&apos;s business interests.</li>
            </ul>
            <p className="mb-3">
              20.3. <strong>Effect of Termination.</strong> Upon termination of your account:
            </p>
            <ul className="list-disc ml-6 space-y-1.5 mb-4">
              <li>Your right to access and use the Platform ceases immediately;</li>
              <li>Any pending Bookings may be cancelled, and applicable refund policies will apply;</li>
              <li>Any outstanding payments owed to you will be processed in accordance with the Platform&apos;s standard payout schedule;</li>
              <li>Any outstanding payments owed by you to DomestIQ remain due and payable; and</li>
              <li>Reviews you have left for other Users will remain on the Platform.</li>
            </ul>
            <p>
              20.4. <strong>Data Retention.</strong> Following termination, DomestIQ may retain
              certain data as required by applicable law, for the resolution of disputes, for
              the enforcement of these Terms, or for legitimate business purposes, in compliance
              with POPIA. Transaction records may be retained for a period of five (5) years in
              accordance with South African tax and financial legislation.
            </p>
          </section>

          {/* ━━━ 21. MODIFICATIONS TO TERMS ━━━ */}
          <section id="section-21">
            <h2 className="text-xl font-bold text-foreground mb-4">
              21. Modifications to Terms
            </h2>
            <p className="mb-3">
              21.1. DomestIQ reserves the right to modify, amend, or update these Terms at any
              time. Material changes will be communicated to Users through the Platform (via
              in-app notification, SMS, or email) at least fourteen (14) days before the changes
              take effect.
            </p>
            <p className="mb-3">
              21.2. The updated Terms will be posted on the Platform with a revised &quot;Last
              Updated&quot; date.
            </p>
            <p className="mb-3">
              21.3. Your continued use of the Platform after the effective date of the updated
              Terms constitutes your acceptance of the modified Terms. If you do not agree with
              the modified Terms, you must discontinue your use of the Platform and terminate
              your account.
            </p>
            <p>
              21.4. Non-material changes (such as typographical corrections, formatting updates,
              or clarifications that do not alter the substance of the Terms) may be made without
              prior notice.
            </p>
          </section>

          {/* ━━━ 22. GOVERNING LAW & JURISDICTION ━━━ */}
          <section id="section-22">
            <h2 className="text-xl font-bold text-foreground mb-4">
              22. Governing Law & Jurisdiction
            </h2>
            <p className="mb-3">
              22.1. These Terms shall be governed by and construed in accordance with the laws
              of the Republic of South Africa.
            </p>
            <p className="mb-3">
              22.2. Subject to the dispute resolution provisions in Section 16, the parties
              submit to the exclusive jurisdiction of the High Court of South Africa, Gauteng
              Division, Pretoria, or such other division as may be appropriate, for any disputes
              arising out of or in connection with these Terms that are not resolved through
              mediation or arbitration.
            </p>
            <p>
              22.3. These Terms are subject to the provisions of the Consumer Protection Act 68
              of 2008, the Electronic Communications and Transactions Act 25 of 2002, and POPIA,
              to the extent applicable.
            </p>
          </section>

          {/* ━━━ 23. SEVERABILITY ━━━ */}
          <section id="section-23">
            <h2 className="text-xl font-bold text-foreground mb-4">23. Severability</h2>
            <p className="mb-3">
              23.1. If any provision of these Terms is found by a court of competent jurisdiction
              to be invalid, illegal, or unenforceable, such invalidity, illegality, or
              unenforceability shall not affect the remaining provisions of these Terms, which
              shall continue in full force and effect.
            </p>
            <p>
              23.2. The invalid, illegal, or unenforceable provision shall be deemed modified to
              the minimum extent necessary to make it valid, legal, and enforceable while
              preserving the original intent of the provision. If such modification is not
              possible, the provision shall be deemed severed from these Terms.
            </p>
          </section>

          {/* ━━━ 24. CONTACT INFORMATION ━━━ */}
          <section id="section-24">
            <h2 className="text-xl font-bold text-foreground mb-4">24. Contact Information</h2>
            <p className="mb-3">
              If you have any questions, concerns, or requests regarding these Terms, please
              contact us:
            </p>
            <div className="rounded-xl border bg-gray-50/60 p-6 space-y-3">
              <p>
                <strong>DomestIQ (Pty) Ltd</strong>
              </p>
              <p>
                <strong>Information Officer (per POPIA):</strong><br />
                The Information Officer, DomestIQ (Pty) Ltd
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:legal@domestiq.co.za"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  legal@domestiq.co.za
                </a>
              </p>
              <p>
                <strong>POPIA Enquiries:</strong>{' '}
                <a
                  href="mailto:privacy@domestiq.co.za"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  privacy@domestiq.co.za
                </a>
              </p>
              <p>
                <strong>Platform Support:</strong> Available through the in-app messaging system
                or at{' '}
                <a
                  href="mailto:support@domestiq.co.za"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  support@domestiq.co.za
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                For complaints regarding the processing of personal information, you may also
                contact the Information Regulator of South Africa at{' '}
                <a
                  href="https://inforegulator.org.za"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  inforegulator.org.za
                </a>
                .
              </p>
            </div>
          </section>

          {/* ─── Closing ─── */}
          <div className="mt-16 pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-6">
              By using DomestIQ, you acknowledge that you have read, understood, and agree to be
              bound by these Terms of Service and our{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                &larr; Back to Home
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Privacy Policy &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ━━━ Footer ━━━ */}
      <footer className="border-t bg-gray-50/50 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              DomestIQ
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} DomestIQ (Pty) Ltd. All rights reserved.
            DomestIQ is a matching platform. No employment relationship is created between users.
          </p>
        </div>
      </footer>
    </div>
  )
}
