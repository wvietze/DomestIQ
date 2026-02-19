import Link from 'next/link'
import { Search, Shield, Star, MapPin, MessageSquare, Clock, Users, CheckCircle2, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Find Workers Easily',
    description: 'Search by service type, location, availability, and ratings to find the perfect match.',
  },
  {
    icon: Shield,
    title: 'Verified & Trusted',
    description: 'Workers can verify their identity and criminal records for added trust.',
  },
  {
    icon: Star,
    title: 'Ratings & Reviews',
    description: 'Read honest reviews from other households before booking.',
  },
  {
    icon: MapPin,
    title: 'Location-Based',
    description: 'Find workers near you with GPS-powered search and distance filtering.',
  },
  {
    icon: MessageSquare,
    title: 'Built-in Messaging',
    description: 'Chat with workers directly, with automatic translation in 11 SA languages.',
  },
  {
    icon: Clock,
    title: 'Easy Scheduling',
    description: 'Book one-time or recurring appointments with calendar integration.',
  },
]

const serviceTypes = [
  'Domestic Worker', 'Gardener', 'Painter', 'Welder',
  'Electrician', 'Plumber', 'Carpenter', 'Handyman',
  'Babysitter', 'Pool Cleaner', 'Tiler', 'Security Guard',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            DomestIQ
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Find trusted workers
              <span className="text-primary"> near you</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              DomestIQ connects South African households with skilled domestic workers,
              gardeners, painters, and more. Verified profiles, real reviews, instant booking.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register/worker"
                className="inline-flex items-center justify-center gap-2 border border-primary text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/5 transition-colors"
              >
                Register as Worker
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10 hidden lg:block" />
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">16+</p>
              <p className="text-sm text-muted-foreground mt-1">Service Types</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">11</p>
              <p className="text-sm text-muted-foreground mt-1">Languages Supported</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground mt-1">Free for Workers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">
                <Users className="w-8 h-8 inline" />
              </p>
              <p className="text-sm text-muted-foreground mt-1">Growing Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center">Services Available</h2>
        <p className="text-center text-muted-foreground mt-2 mb-8">Find skilled workers across all categories</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {serviceTypes.map(service => (
            <div
              key={service}
              className="flex items-center gap-2 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-sm font-medium">{service}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center">Why DomestIQ?</h2>
          <p className="text-center text-muted-foreground mt-2 mb-12">Built for South Africa, designed for everyone</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-card rounded-xl p-6 border">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Search', desc: 'Browse workers by service, location, and availability' },
            { step: '2', title: 'Book', desc: 'Select a date and time that works for you' },
            { step: '3', title: 'Review', desc: 'Rate your experience to help the community' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                {item.step}
              </div>
              <h3 className="font-semibold text-xl mt-4">{item.title}</h3>
              <p className="text-muted-foreground mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA for Workers */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">Are You a Skilled Worker?</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">
            Join DomestIQ for free and reach households looking for your skills.
            Build your profile in minutes - no typing needed.
          </p>
          <Link
            href="/register/worker"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-lg text-lg font-medium mt-8 hover:bg-white/90 transition-colors"
          >
            Join as Worker <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-bold text-primary">DomestIQ</div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DomestIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
