import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold text-primary">DomestIQ</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-sm">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: February 2026</p>
        <p>This Privacy Policy complies with the Protection of Personal Information Act (POPIA) of South Africa.</p>

        <h2 className="text-xl font-semibold mt-8">1. Information We Collect</h2>
        <p>We collect the following personal information:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Account Information:</strong> Name, email, phone number, profile photo</li>
          <li><strong>Worker Information:</strong> Services offered, availability, rates, work experience</li>
          <li><strong>Location Data:</strong> GPS coordinates (with consent) for matching with nearby workers/clients</li>
          <li><strong>Verification Documents:</strong> ID documents and criminal record checks (optional)</li>
          <li><strong>Usage Data:</strong> How you interact with the platform</li>
          <li><strong>Communication Data:</strong> Messages sent through the platform</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To match workers with clients based on location, services, and availability</li>
          <li>To facilitate bookings and communications</li>
          <li>To verify identity and background (when voluntarily provided)</li>
          <li>To improve our services and user experience</li>
          <li>To send notifications about bookings, messages, and reviews</li>
          <li>To translate content between South African languages</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">3. Data Protection (POPI Act)</h2>
        <p>In accordance with the Protection of Personal Information Act (POPIA):</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>We process personal information only with your consent</li>
          <li>We collect only information necessary for the service</li>
          <li>We protect your information with industry-standard security measures</li>
          <li>We do not sell your personal information to third parties</li>
          <li>You may request access to, correction of, or deletion of your personal information</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">4. Location Privacy</h2>
        <p>For the protection of our users:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Client exact addresses are only shared with workers after a booking is confirmed</li>
          <li>Before confirmation, workers see only the suburb/area</li>
          <li>Location data is used for distance calculations and never shared publicly</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">5. Data Storage</h2>
        <p>Your data is stored securely using Supabase (cloud infrastructure). Verification documents are stored in private, encrypted storage buckets accessible only to you and authorized administrators.</p>

        <h2 className="text-xl font-semibold mt-6">6. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Supabase (database, authentication, storage)</li>
          <li>Google Maps (location services)</li>
          <li>Google Cloud Vision (document scanning)</li>
          <li>AI services for translation and content generation</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">7. Your Rights</h2>
        <p>Under POPIA, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access your personal information</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account and data</li>
          <li>Object to processing of your information</li>
          <li>Lodge a complaint with the Information Regulator</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">8. Account Deletion</h2>
        <p>You may request account deletion through your profile settings. Upon deletion request, your data enters a 30-day soft-delete period during which it can be recovered. After 30 days, all personal information is permanently deleted.</p>

        <h2 className="text-xl font-semibold mt-6">9. Contact</h2>
        <p>For privacy-related inquiries or to exercise your rights, contact us through the platform.</p>

        <div className="mt-8 pt-4 border-t">
          <Link href="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  )
}
