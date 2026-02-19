import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold text-primary">DomestIQ</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-sm">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: February 2026</p>

        <h2 className="text-xl font-semibold mt-8">1. Platform Nature</h2>
        <p>DomestIQ is a matching and scheduling platform that connects households with independent domestic workers in South Africa. DomestIQ does <strong>not</strong> create, imply, or establish any employment relationship between clients and workers. Workers are independent service providers.</p>

        <h2 className="text-xl font-semibold mt-6">2. Eligibility</h2>
        <p>You must be at least 18 years old to use DomestIQ. By registering, you confirm that you are legally able to enter into agreements in South Africa.</p>

        <h2 className="text-xl font-semibold mt-6">3. User Accounts</h2>
        <p>You are responsible for maintaining the security of your account credentials. You must provide accurate information during registration. DomestIQ reserves the right to suspend accounts that provide false information.</p>

        <h2 className="text-xl font-semibold mt-6">4. Worker Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide accurate information about skills and experience</li>
          <li>Maintain current availability schedules</li>
          <li>Respond to booking requests in a timely manner</li>
          <li>Deliver services professionally and as described</li>
          <li>Comply with all applicable South African laws</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">5. Client Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide accurate address and contact information</li>
          <li>Ensure a safe working environment for workers</li>
          <li>Pay agreed-upon rates directly to workers</li>
          <li>Leave honest and fair reviews</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">6. Bookings & Payments</h2>
        <p>DomestIQ facilitates booking arrangements between clients and workers. All payments are made directly between the client and worker. DomestIQ does not process payments at this time.</p>

        <h2 className="text-xl font-semibold mt-6">7. Reviews & Content</h2>
        <p>Reviews must be honest, fair, and based on actual service experiences. DomestIQ reserves the right to remove reviews that are fraudulent, abusive, or violate these terms.</p>

        <h2 className="text-xl font-semibold mt-6">8. Verification</h2>
        <p>Identity and criminal record verification is optional. DomestIQ uses third-party services for verification and does not guarantee the accuracy or completeness of verification results.</p>

        <h2 className="text-xl font-semibold mt-6">9. Limitation of Liability</h2>
        <p>DomestIQ is not liable for any disputes, damages, or losses arising from interactions between clients and workers. Users engage with each other at their own risk.</p>

        <h2 className="text-xl font-semibold mt-6">10. Termination</h2>
        <p>DomestIQ may terminate or suspend accounts at any time for violation of these terms. Users may delete their accounts at any time through the profile settings.</p>

        <h2 className="text-xl font-semibold mt-6">11. Governing Law</h2>
        <p>These terms are governed by the laws of the Republic of South Africa.</p>

        <div className="mt-8 pt-4 border-t">
          <Link href="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </main>
    </div>
  )
}
