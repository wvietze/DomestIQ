import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | DomestIQ',
  description: 'DomestIQ Privacy Policy — POPIA-compliant privacy practices for our South African domestic worker platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Premium Header ─── */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-brand">DomestIQ</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Title Block */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground text-sm">Last updated: 19 February 2026</p>
          <p className="mt-1 text-muted-foreground text-sm">
            Effective date: 19 February 2026
          </p>
        </div>

        <article className="prose prose-sm prose-slate max-w-none
          prose-headings:text-foreground prose-p:text-muted-foreground
          prose-li:text-muted-foreground prose-strong:text-foreground
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">

          {/* ────────────────────────────────────────────────── */}
          {/* 1. INTRODUCTION */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mt-0 mb-4">1. Introduction</h2>
            <p>
              DomestIQ (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;the Platform&quot;) is a South African technology
              platform that connects households with trusted, verified domestic workers. We are committed
              to protecting the privacy and personal information of every person who uses our services.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, share, and protect your personal
              information when you access or use the DomestIQ platform, including our website and mobile
              applications.
            </p>
            <p>
              We process personal information in accordance with the{' '}
              <strong>Protection of Personal Information Act 4 of 2013 (&quot;POPIA&quot;)</strong> and all
              applicable South African data protection legislation. By using DomestIQ, you acknowledge
              that you have read and understood this Privacy Policy.
            </p>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 2. INFORMATION OFFICER */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">2. Information Officer</h2>
            <p>
              In compliance with Section 55 of POPIA, DomestIQ has appointed an Information Officer
              responsible for ensuring our processing of personal information complies with the Act.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 not-prose">
              <p className="text-sm font-semibold text-foreground mb-3">Information Officer Details</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Name:</strong> [Information Officer Name]</li>
                <li><strong className="text-foreground">Email:</strong> privacy@domestiq.co.za</li>
                <li><strong className="text-foreground">Postal Address:</strong> [Registered Business Address], South Africa</li>
                <li><strong className="text-foreground">Registration Number:</strong> [CIPC Registration Number]</li>
              </ul>
            </div>
            <p className="mt-4">
              The Information Officer is registered with the Information Regulator of South Africa as
              required by Section 55(2) of POPIA.
            </p>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 3. DEFINITIONS */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">3. Definitions</h2>
            <p>For the purposes of this Privacy Policy, the following terms have the meanings set out below, aligned with the definitions in POPIA:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>&quot;Personal Information&quot;</strong> means information relating to an identifiable,
                living, natural person and, where applicable, an identifiable, existing juristic person.
                This includes, but is not limited to, names, contact details, identification numbers,
                location data, biometric information, and online identifiers.
              </li>
              <li>
                <strong>&quot;Special Personal Information&quot;</strong> means personal information concerning
                a data subject&apos;s religious or philosophical beliefs, race or ethnic origin, trade union
                membership, political persuasion, health or sex life, biometric information, or criminal
                behaviour.
              </li>
              <li>
                <strong>&quot;Processing&quot;</strong> means any operation or activity, whether automated or
                not, concerning personal information, including collection, receipt, recording, organisation,
                collation, storage, updating, modification, retrieval, alteration, consultation, use,
                dissemination, distribution, merging, linking, restriction, degradation, erasure, or
                destruction.
              </li>
              <li>
                <strong>&quot;Data Subject&quot;</strong> means the person to whom personal information
                relates &mdash; in our context, any DomestIQ user, whether a client or a worker.
              </li>
              <li>
                <strong>&quot;Responsible Party&quot;</strong> means the person who, alone or in conjunction
                with others, determines the purpose of and means for processing personal information.
                DomestIQ is the Responsible Party for the purposes of this policy.
              </li>
              <li>
                <strong>&quot;Operator&quot;</strong> means a person who processes personal information on
                behalf of the Responsible Party in terms of a contract or mandate. Our Operators include
                Supabase, Paystack, and Google Cloud.
              </li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 4. WHAT WE COLLECT */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">4. What We Collect</h2>
            <p>
              We collect different categories of personal information depending on whether you use
              DomestIQ as a client or a worker, and based on the features you choose to use. We only
              collect information that is necessary for the purposes described in this policy.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.1 Registration Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name</li>
              <li>Phone number (primary identifier)</li>
              <li>Email address</li>
              <li>Account type (client or worker)</li>
              <li>Preferred language</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.2 Profile Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Profile photograph</li>
              <li>Biographical information and description</li>
              <li>Services offered and areas of expertise (workers)</li>
              <li>Hourly or daily rates (workers)</li>
              <li>Availability schedule (workers)</li>
              <li>Years of experience (workers)</li>
              <li>Languages spoken</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.3 Identity Verification Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>South African Identity Number (SA ID)</li>
              <li>Images of identity documents (processed via Google Cloud Vision OCR)</li>
              <li>Facial photographs for identity confirmation</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.4 Criminal Clearance Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Police clearance certificate or equivalent documentation</li>
              <li>Clearance status and date of issuance</li>
            </ul>
            <p className="text-sm mt-2">
              Criminal clearance data constitutes Special Personal Information under POPIA Section 26.
              We process this data only with your explicit, informed consent and solely for the purpose
              of trust and safety verification on the platform.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.5 Location Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>GPS coordinates (with your explicit permission)</li>
              <li>Residential or work address (clients)</li>
              <li>Service areas and suburbs (workers)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.6 Financial Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payment transaction records (amounts, dates, booking references)</li>
              <li>Earnings records and income history (workers)</li>
              <li>Paystack payment tokens (for recurring payment processing)</li>
              <li>Platform fee records</li>
            </ul>
            <p className="text-sm mt-2">
              <strong>Important:</strong> DomestIQ does not store your full credit or debit card numbers.
              Payment card information is processed and stored exclusively by our PCI DSS-compliant
              payment processor, Paystack. We retain only tokenised references and transaction records.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.7 Communication Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Messages exchanged between clients and workers on the platform</li>
              <li>Translation cache (when using multi-language translation features)</li>
              <li>Notification preferences and history</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.8 Usage Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Device information (type, operating system, browser)</li>
              <li>IP address</li>
              <li>Interaction patterns (pages viewed, features used, search queries)</li>
              <li>Session duration and frequency</li>
              <li>Referral source</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">4.9 Review Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Star ratings provided</li>
              <li>Written review comments</li>
              <li>Responses to reviews</li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 5. LEGAL BASIS */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">5. Legal Basis for Processing</h2>
            <p>
              We process your personal information in accordance with Section 11 of POPIA. We rely on
              one or more of the following lawful grounds for each processing activity:
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">5.1 Consent</h3>
            <p>
              Where you have given us voluntary, specific, and informed consent to process your personal
              information for a stated purpose. This applies to location tracking, identity verification,
              criminal clearance checks, income data sharing with financial partners, and profile photo
              uploads. You may withdraw your consent at any time.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">5.2 Contractual Necessity</h3>
            <p>
              Processing necessary to perform our contract with you &mdash; the DomestIQ Terms of Service.
              This includes maintaining your account, facilitating bookings between clients and workers,
              processing payments, and enabling platform communication.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">5.3 Legitimate Interest</h3>
            <p>
              Processing necessary for our legitimate interests, provided those interests are not overridden
              by your rights. This includes platform security, fraud prevention, service improvement,
              aggregate analytics, and ensuring the safety of our community.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">5.4 Legal Obligation</h3>
            <p>
              Processing required to comply with a legal obligation, including tax reporting requirements
              under the South African Revenue Service (SARS) regulations, responding to lawful requests
              from law enforcement, and complying with court orders.
            </p>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 6. HOW WE USE YOUR INFORMATION */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">6. How We Use Your Information</h2>
            <p>We use the personal information we collect for the following purposes:</p>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Worker-Client Matching:</strong> Using location data, service categories,
                availability, and ratings to connect clients with suitable domestic workers in their area.
              </li>
              <li>
                <strong>Booking Facilitation:</strong> Enabling the scheduling, confirmation, modification,
                and completion of service bookings between clients and workers.
              </li>
              <li>
                <strong>Payment Processing:</strong> Facilitating secure payments from clients to workers
                through Paystack, including the worker&apos;s service rate and the DomestIQ platform fee.
              </li>
              <li>
                <strong>Identity Verification:</strong> Confirming the identity of users through document
                OCR (via Google Cloud Vision) and facial image comparison to build trust and safety.
              </li>
              <li>
                <strong>Criminal Clearance Verification:</strong> Processing and displaying clearance
                status to help clients make informed decisions.
              </li>
              <li>
                <strong>Communication:</strong> Enabling in-app messaging between clients and workers,
                and sending platform notifications about bookings, messages, and account activity.
              </li>
              <li>
                <strong>Translation Services:</strong> Using AI-powered translation to enable communication
                across all 11 official South African languages, fostering accessibility and inclusion.
              </li>
              <li>
                <strong>Income Record Generation:</strong> Creating verified income records for workers
                based on completed bookings and payment history on the platform.
              </li>
              <li>
                <strong>Profile Generation:</strong> Using AI services to assist workers in creating
                professional profile descriptions based on their provided information.
              </li>
              <li>
                <strong>Platform Improvement:</strong> Analysing aggregate, anonymised usage data to
                improve features, fix issues, and enhance the overall user experience.
              </li>
              <li>
                <strong>Safety &amp; Fraud Prevention:</strong> Monitoring for suspicious activity,
                preventing fraudulent accounts, and maintaining a safe environment for all users.
              </li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 7. INCOME VERIFICATION & FINANCIAL DATA SHARING */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">7. Income Verification &amp; Financial Data Sharing</h2>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-900 not-prose mb-6">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Why this matters
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Many domestic workers in South Africa struggle to access financial services because they
                cannot provide formal proof of income. DomestIQ&apos;s income verification feature empowers
                workers to build a verifiable financial record and, if they choose, share it with financial
                institutions to access credit, banking products, and other financial services.
              </p>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">7.1 Income Record Generation</h3>
            <p>
              DomestIQ automatically generates income records based on completed bookings and payments
              processed through the platform. These records include the date of service, the amount
              earned, and the type of service performed. Workers can view and download their income
              history at any time from their profile.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">7.2 Verified Income Statements</h3>
            <p>
              Workers may request a verified income statement from DomestIQ. This statement is digitally
              signed by the platform and provides a summary of earnings over a specified period. Workers
              may use this statement independently for any purpose, including applications for financial
              services.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">7.3 Opt-In Financial Data Sharing</h3>
            <p>
              Workers may choose to <strong>opt in</strong> to sharing their verified income data with
              approved financial partners, such as banks (for example, Capitec, TymeBank) and other
              financial service providers. This is an entirely voluntary feature.
            </p>
            <p className="font-medium mt-3">The consent for financial data sharing is:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Granular:</strong> You choose exactly which partners may receive your data.</li>
              <li><strong>Specific:</strong> Consent is given per partner, per request &mdash; not as a blanket authorisation.</li>
              <li><strong>Informed:</strong> Before granting consent, you will see exactly what data will be shared and with whom.</li>
              <li><strong>Revocable:</strong> You may withdraw your consent at any time through your consent dashboard in your worker profile settings.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">7.4 What Financial Partners Receive</h3>
            <p>When you grant consent, approved financial partners receive <strong>only</strong> the following:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Verification of your income range (not exact amounts unless you consent)</li>
              <li>Employment consistency score (regularity of bookings over time)</li>
              <li>Platform tenure (how long you have been active on DomestIQ)</li>
              <li>Account standing (whether your account is in good standing)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">7.5 What Financial Partners Do NOT Receive</h3>
            <p>Financial partners will <strong>never</strong> receive the following, regardless of consent:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Personal messages or communication history</li>
              <li>Exact residential or work addresses</li>
              <li>Review content or individual ratings</li>
              <li>Identity documents or their images</li>
              <li>Criminal clearance documentation</li>
              <li>Names or details of clients you have worked for</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">7.6 Consent Dashboard</h3>
            <p>
              Your worker profile includes a dedicated <strong>Consent Dashboard</strong> where you can:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>View all approved financial partners</li>
              <li>See which partners have active data-sharing consent</li>
              <li>Review the history of data-sharing requests</li>
              <li>Grant or revoke consent at any time with a single action</li>
              <li>Download a record of all consent actions for your own records</li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 8. DATA SHARING & THIRD PARTIES */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">8. Data Sharing &amp; Third Parties</h2>
            <p>
              We share personal information only where necessary to provide our services, where we have
              a lawful basis to do so, or where required by law. We require all third parties to respect
              the security of your personal information and to treat it in accordance with the law.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">8.1 Paystack (Payment Processing)</h3>
            <p>
              Paystack processes all payments on the platform. Paystack receives the transaction amount,
              payment tokens, and necessary payer information to facilitate secure transactions. Paystack
              is PCI DSS-compliant and operates as an Operator under POPIA.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">8.2 Google Cloud Services</h3>
            <p>
              We use <strong>Google Cloud Vision API</strong> for optical character recognition (OCR) of
              identity documents during verification. We use <strong>Google Maps</strong> services for
              location-based features including distance calculations and address resolution. Document
              images are processed in real-time and are not retained by Google beyond processing.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">8.3 AI Service Providers</h3>
            <p>
              We use AI services for translation between South Africa&apos;s 11 official languages and for
              assisting workers with profile content generation. Data sent to AI providers is{' '}
              <strong>anonymised</strong> &mdash; personal identifiers are stripped before transmission.
              AI providers do not receive names, contact details, or other directly identifying information.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">8.4 Supabase (Data Storage &amp; Infrastructure)</h3>
            <p>
              Supabase serves as our primary database, authentication, and file storage provider. Supabase
              operates as an Operator under POPIA, processing data on our behalf and under our instructions.
              All data is encrypted at rest and in transit.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">8.5 Approved Financial Partners</h3>
            <p>
              As described in Section 7, verified income data may be shared with approved financial
              partners <strong>only</strong> when a worker has provided explicit, informed consent for
              each specific partner and each specific request. Financial partners are contractually
              bound to use this data solely for the purposes disclosed to the worker at the time of
              consent.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">8.6 Law Enforcement &amp; Legal Requirements</h3>
            <p>
              We may disclose personal information to law enforcement agencies, regulatory authorities,
              or courts only when legally compelled to do so by a valid subpoena, court order, or
              statutory requirement. We will make reasonable efforts to notify affected users unless
              prohibited by law.
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-900 not-prose mt-6">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                Our commitment
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                DomestIQ will <strong>never</strong> sell, rent, lease, or trade your personal information
                to advertisers, data brokers, or any third party for marketing purposes. This is a
                fundamental principle of our platform.
              </p>
            </div>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 9. DATA RETENTION */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
            <p>
              We retain personal information only for as long as necessary to fulfil the purposes for
              which it was collected, or as required by law. The specific retention periods are as
              follows:
            </p>

            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-slate-200 dark:border-slate-800">Data Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-slate-200 dark:border-slate-800">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-3">Active account data</td>
                    <td className="px-4 py-3">Retained for the duration of your active account</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Inactive accounts</td>
                    <td className="px-4 py-3">Notification sent after 12 months of inactivity; account and data deleted after 18 months of inactivity</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Deleted accounts</td>
                    <td className="px-4 py-3">30-day soft-delete period (recoverable), then permanent and irreversible deletion</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Financial &amp; transaction records</td>
                    <td className="px-4 py-3">5 years from the date of the transaction, as required by the Tax Administration Act and SARS regulations</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Verification documents (ID, clearance)</td>
                    <td className="px-4 py-3">Retained while the account is active; deleted within 30 days of account deletion</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Messages &amp; communication data</td>
                    <td className="px-4 py-3">2 years after the last message in a conversation thread</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Usage &amp; analytics data</td>
                    <td className="px-4 py-3">Anonymised and aggregated after 12 months; raw data deleted</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Translation cache</td>
                    <td className="px-4 py-3">90 days from last access</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              When personal information is deleted, we ensure it is destroyed in a manner that prevents
              reconstruction or recovery. Backups containing deleted data are purged within 30 days
              following the deletion date.
            </p>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 10. DATA SECURITY */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Data Security</h2>
            <p>
              We take the security of your personal information seriously and implement appropriate
              technical and organisational measures to protect it against unauthorised access, alteration,
              disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Encryption in Transit:</strong> All data transmitted between your device and our
                servers is encrypted using TLS 1.2 or higher.
              </li>
              <li>
                <strong>Encryption at Rest:</strong> All personal information stored in our database and
                file storage is encrypted at rest using AES-256 encryption.
              </li>
              <li>
                <strong>Access Controls:</strong> Strict role-based access controls ensure that only
                authorised personnel can access personal information, and only to the extent necessary
                for their role.
              </li>
              <li>
                <strong>Private Storage Buckets:</strong> Identity documents, criminal clearance
                certificates, and other sensitive files are stored in private, access-controlled storage
                buckets. These files are not publicly accessible and can only be retrieved through
                authenticated, authorised requests.
              </li>
              <li>
                <strong>Regular Security Audits:</strong> We conduct periodic security assessments and
                vulnerability testing to identify and address potential risks.
              </li>
              <li>
                <strong>Secure Authentication:</strong> User authentication is handled through Supabase
                Auth with industry-standard security practices, including secure session management.
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">10.1 Data Breach Notification</h3>
            <p>
              In the event of a security breach that compromises your personal information, we will:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Notify the Information Regulator within <strong>72 hours</strong> of becoming aware of the breach, as required by Section 22 of POPIA.</li>
              <li>Notify affected data subjects as soon as reasonably possible after the breach is discovered.</li>
              <li>Provide details of the nature of the breach, the information potentially affected, the measures we are taking, and recommendations for what you can do to protect yourself.</li>
              <li>Document the breach internally and take immediate steps to contain and remediate the incident.</li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 11. YOUR RIGHTS UNDER POPIA */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">11. Your Rights Under POPIA</h2>
            <p>
              As a data subject, you have the following rights under Sections 23 to 25 of POPIA. We are
              committed to facilitating the exercise of these rights in a timely and transparent manner.
            </p>

            <div className="space-y-4 mt-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-foreground text-sm">Right to Access (Section 23)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have the right to request confirmation of whether we hold personal information about
                  you and to request access to that information. We will provide a copy of your personal
                  information in a commonly used electronic format.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-foreground text-sm">Right to Correction (Section 24)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have the right to request that we correct or update any personal information that is
                  inaccurate, misleading, or incomplete. You can update most information directly through
                  your profile settings.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-foreground text-sm">Right to Deletion (Section 24)</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have the right to request the deletion or destruction of your personal information
                  where it is no longer necessary for the purpose for which it was collected, or where you
                  withdraw your consent. Deletion is subject to any legal retention obligations.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-foreground text-sm">Right to Object (Section 11(3)(a))</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have the right to object to the processing of your personal information on reasonable
                  grounds, unless legislation provides for such processing. You may also object to the
                  processing of your personal information for direct marketing purposes.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-foreground text-sm">Right to Data Portability</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have the right to request a copy of your personal information in a structured,
                  commonly used, machine-readable format. DomestIQ provides a data export feature in
                  your account settings that allows you to download your data, including your profile,
                  booking history, reviews, and income records.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-foreground text-sm">Right to Withdraw Consent</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Where we process your personal information based on your consent, you may withdraw that
                  consent at any time. Withdrawal of consent does not affect the lawfulness of processing
                  that took place before the withdrawal.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-foreground text-sm">Right to Lodge a Complaint</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have the right to lodge a complaint with the Information Regulator of South Africa
                  if you believe that your personal information has been processed in violation of POPIA.
                  See Section 17 of this policy for the Information Regulator&apos;s contact details.
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">How to Exercise Your Rights</h3>
            <p>You may exercise any of the above rights through the following channels:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>In-App:</strong> Navigate to Settings &gt; Privacy &amp; Data in the DomestIQ app to access self-service privacy controls, including data export, consent management, and account deletion.</li>
              <li><strong>Email:</strong> Send a request to our Information Officer at <strong>privacy@domestiq.co.za</strong>. We will verify your identity before processing any request.</li>
            </ul>
            <p className="mt-3">
              We will respond to all legitimate requests within <strong>30 days</strong>. In exceptional
              circumstances, we may take up to an additional 30 days, in which case we will notify you
              and explain the reason for the delay.
            </p>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 12. LOCATION PRIVACY */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">12. Location Privacy</h2>
            <p>
              We recognise the sensitivity of location data and have implemented strict controls to
              protect the physical safety of all users.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Before Booking Confirmation:</strong> Workers see only the suburb or general area
                of a client&apos;s location. Exact street addresses are never shown before a booking is
                confirmed.
              </li>
              <li>
                <strong>After Booking Confirmation:</strong> The client&apos;s full address is shared with
                the assigned worker only after the booking has been confirmed by both parties.
              </li>
              <li>
                <strong>Search Results:</strong> Workers see only the approximate distance to a client&apos;s
                location (for example, &quot;3.2 km away&quot;), never the exact coordinates or address.
              </li>
              <li>
                <strong>GPS Data:</strong> GPS coordinates are used solely for distance calculations and
                service area matching. GPS data is <strong>never</strong> displayed publicly on any profile
                or listing.
              </li>
              <li>
                <strong>Address Visibility:</strong> Client addresses are not visible to other clients,
                and worker home addresses are never shared with any other user.
              </li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 13. CHILDREN'S DATA */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">13. Children&apos;s Data</h2>
            <p>
              DomestIQ is not intended for use by persons under the age of 18. We do not knowingly
              collect personal information from children. If we become aware that we have inadvertently
              collected personal information from a person under the age of 18, we will take immediate
              steps to delete that information from our systems.
            </p>
            <p>
              If you are a parent or guardian and believe that your child has provided personal information
              to DomestIQ, please contact our Information Officer immediately at{' '}
              <strong>privacy@domestiq.co.za</strong>.
            </p>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 14. CROSS-BORDER DATA TRANSFERS */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">14. Cross-Border Data Transfers</h2>
            <p>
              DomestIQ&apos;s infrastructure relies on cloud services, including Supabase and Google Cloud,
              whose servers may be located outside the Republic of South Africa. Where your personal
              information is transferred to a jurisdiction outside South Africa, we ensure that adequate
              protections are in place in compliance with Section 72 of POPIA.
            </p>
            <p>Specifically, we ensure that:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                The recipient country has adequate data protection legislation, or the recipient is
                subject to binding rules or agreements that provide an adequate level of protection.
              </li>
              <li>
                The transfer is necessary for the performance of a contract between you and DomestIQ,
                or for the implementation of pre-contractual measures taken in response to your request.
              </li>
              <li>
                You have consented to the transfer after being informed of the possible risks.
              </li>
              <li>
                Our contracts with Operators require them to implement appropriate technical and
                organisational measures to safeguard your personal information.
              </li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 15. COOKIES & TRACKING */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">15. Cookies &amp; Tracking</h2>
            <p>
              DomestIQ uses a minimal and privacy-respecting approach to cookies and tracking technologies.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Essential Session Cookies:</strong> We use session cookies strictly for
                authentication and maintaining your logged-in state. These cookies are necessary for the
                platform to function and cannot be disabled.
              </li>
              <li>
                <strong>Security Cookies:</strong> We may use cookies to detect and prevent fraud,
                protect against cross-site request forgery (CSRF), and maintain platform security.
              </li>
              <li>
                <strong>No Third-Party Advertising Cookies:</strong> DomestIQ does <strong>not</strong>{' '}
                use third-party advertising cookies, tracking pixels, or any similar technology for the
                purpose of targeted advertising. We do not serve advertisements on the platform.
              </li>
              <li>
                <strong>No Cross-Site Tracking:</strong> We do not track your activity across other
                websites or services.
              </li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 16. CHANGES TO THIS POLICY */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">16. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, legal requirements, or for other operational reasons.
            </p>
            <p>When we make changes:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>We will update the &quot;Last updated&quot; date at the top of this page.</li>
              <li>We will notify you of material changes through an in-app notification and, where appropriate, via email or SMS.</li>
              <li>For significant changes that affect how we process your personal information, we will provide at least 30 days&apos; notice before the changes take effect.</li>
              <li>Your continued use of DomestIQ after the updated policy becomes effective constitutes your acceptance of the changes. If you do not agree with the updated policy, you should discontinue use and request account deletion.</li>
            </ul>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 17. INFORMATION REGULATOR */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">17. Information Regulator of South Africa</h2>
            <p>
              If you are not satisfied with how DomestIQ handles your personal information, or if you
              believe that your rights under POPIA have been infringed, you have the right to lodge a
              complaint with the Information Regulator of South Africa.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 not-prose mt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Information Regulator Contact Details</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Phone:</strong> 010 023 5207</li>
                <li><strong className="text-foreground">Email (General):</strong> enquiries@inforegulator.org.za</li>
                <li><strong className="text-foreground">Email (POPIA Complaints):</strong> POPIAComplaints@inforegulator.org.za</li>
                <li>
                  <strong className="text-foreground">Physical Address:</strong> JD House, 27 Stiemens Street,
                  Braamfontein, Johannesburg, 2001
                </li>
                <li>
                  <strong className="text-foreground">Postal Address:</strong> P.O. Box 31533,
                  Braamfontein, Johannesburg, 2017
                </li>
                <li>
                  <strong className="text-foreground">Website:</strong>{' '}
                  <a
                    href="https://inforegulator.org.za"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://inforegulator.org.za
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* ────────────────────────────────────────────────── */}
          {/* 18. CONTACT US */}
          {/* ────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">18. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data protection practices, please do not hesitate to contact us.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 not-prose mt-4">
              <p className="text-sm font-semibold text-foreground mb-3">DomestIQ Contact Details</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Information Officer:</strong> privacy@domestiq.co.za</li>
                <li><strong className="text-foreground">General Support:</strong> support@domestiq.co.za</li>
                <li><strong className="text-foreground">In-App:</strong> Settings &gt; Help &amp; Support &gt; Contact Us</li>
                <li><strong className="text-foreground">Postal Address:</strong> [Registered Business Address], South Africa</li>
              </ul>
            </div>
            <p className="mt-4">
              We aim to respond to all privacy-related enquiries within <strong>7 business days</strong>{' '}
              and to resolve all formal requests within <strong>30 days</strong> as required by POPIA.
            </p>
          </section>
        </article>

        {/* ─── Footer Navigation ─── */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline font-medium">
            &larr; Back to Home
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* ─── Legal Footer ─── */}
        <div className="mt-8 pb-12 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DomestIQ. All rights reserved. This Privacy Policy is governed
            by the laws of the Republic of South Africa.
          </p>
        </div>
      </main>
    </div>
  )
}
