'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, Database, Award, Megaphone, Shield, Lock,
  CheckCircle2, BarChart3, Users, Globe, TrendingUp,
  FileText, Eye, Handshake, Send, Loader2, ChevronLeft,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

/* ─── Animation Variants ─── */
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }

function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  )
}

/* ─── Data ─── */
const platformStats = [
  { value: '2,000+', label: 'Verified Workers', icon: Users },
  { value: '8,500+', label: 'Bookings Completed', icon: TrendingUp },
  { value: '6', label: 'Cities', icon: Globe },
  { value: '4.8', label: 'Average Rating', icon: Award },
]

const dataPreviewStats = [
  { label: 'Avg. Monthly Income (verified)', value: 'R 4,200', category: 'income' },
  { label: 'Workers with CV data', value: '1,200+', category: 'cv' },
  { label: 'Verification Rate', value: '68%', category: 'verification' },
  { label: 'Written References', value: '3,400+', category: 'references' },
  { label: 'Avg. Trait Score', value: '4.6/5', category: 'quality' },
  { label: 'Estate Registrations', value: '850+', category: 'geographic' },
]

const partnershipTypes = [
  {
    icon: Database,
    title: 'Data API Partners',
    desc: 'Access verified income and employment data through our consent-gated API. Perfect for banks, insurers, and micro-lenders.',
    color: 'emerald',
    features: ['Income verification API', 'Consent-gated access', 'POPIA compliant', 'Tamper-proof hashing'],
  },
  {
    icon: Award,
    title: 'Sponsors',
    desc: 'Align your brand with South Africa\'s most trusted domestic worker platform. Visible, impactful, community-driven.',
    color: 'amber',
    features: ['Dashboard placements', 'Verification page branding', 'Onboarding sponsorship', 'Community impact stories'],
  },
  {
    icon: Megaphone,
    title: 'Advertisers',
    desc: 'Reach a highly engaged audience of workers and households. Target by service type, location, and role.',
    color: 'violet',
    features: ['Service-based targeting', 'Role-based delivery', 'Impression & click tracking', 'Dashboard card placements'],
  },
]

const companyTypes = [
  { value: 'bank', label: 'Bank' },
  { value: 'insurer', label: 'Insurer' },
  { value: 'micro_lender', label: 'Micro-Lender' },
  { value: 'sponsor', label: 'Sponsor / Brand' },
  { value: 'advertiser', label: 'Advertiser' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
]

const interests = [
  { value: 'data_api', label: 'Data API Access' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'multiple', label: 'Multiple / Explore Options' },
]

export default function PartnersPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company_type: '',
    interest: '',
    message: '',
    website: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="shrink-0"><Logo /></Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden min-h-[70vh] flex items-center">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/8 blur-[120px]" />
        <div className="absolute inset-0 bg-dots opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-50 to-violet-50 text-emerald-800 border border-emerald-200/60 mb-8">
                <Handshake className="w-4 h-4" />
                Partner with DomestIQ
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
              Build on South Africa&apos;s{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                verified workforce
              </span>{' '}
              infrastructure
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              DomestIQ is building the identity and income verification layer for SA&apos;s informal workforce.
              Partner with us to access verified data, sponsor community growth, or reach an engaged audience.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#apply"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1">
                Apply to Partner
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#partnership-types"
                className="group inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-foreground px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1">
                Explore Options
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="relative border-y bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {platformStats.map((s) => {
              const Icon = s.icon
              return (
                <motion.div key={s.label} variants={scaleIn} transition={{ duration: 0.5 }} className="text-center">
                  <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">{s.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Three Partnership Types */}
      <section id="partnership-types" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-violet-100 text-violet-800 border border-violet-200 mb-4">
              Partnership Types
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Three ways to{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">partner</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you need data, brand visibility, or audience reach — we have the infrastructure.
            </p>
          </Section>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-6">
            {partnershipTypes.map((type) => {
              const Icon = type.icon
              const colorMap: Record<string, { bg: string; iconBg: string; iconColor: string; border: string }> = {
                emerald: { bg: 'from-emerald-50 to-teal-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', border: 'border-emerald-100' },
                amber: { bg: 'from-amber-50 to-orange-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', border: 'border-amber-100' },
                violet: { bg: 'from-violet-50 to-purple-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-700', border: 'border-violet-100' },
              }
              const colors = colorMap[type.color]
              return (
                <motion.div key={type.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                  <Card className={`h-full bg-gradient-to-br ${colors.bg} border ${colors.border} hover:shadow-lg transition-all duration-300`}>
                    <CardContent className="p-7">
                      <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${colors.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-5">{type.desc}</p>
                      <ul className="space-y-2">
                        {type.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* For Data Partners */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Section>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-6">
                <Database className="w-3.5 h-3.5" /> For Data Partners
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Income verification for the{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">unbanked workforce</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Millions of domestic workers have no payslips, no formal employment records. DomestIQ changes that.
                Our API provides verified income data with worker consent — enabling financial inclusion.
              </p>
            </Section>

            <Section delay={0.15}>
              <div className="space-y-4">
                {[
                  { icon: FileText, title: 'Income Verification API', desc: 'Monthly earnings, booking frequency, service types — all verified and hashed.' },
                  { icon: Shield, title: 'Consent Framework', desc: 'Workers explicitly grant consent per partner. Revocable at any time. POPIA compliant.' },
                  { icon: Lock, title: 'POPIA Compliance', desc: 'Full audit trail. Data minimization. Purpose limitation. Worker-controlled sharing.' },
                  { icon: BarChart3, title: 'Rich Data', desc: 'Up to 12 months of income history, service breakdowns, verification hashes.' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* Data Preview */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-sky-100 text-sky-800 border border-sky-200 mb-4">
              <BarChart3 className="w-3.5 h-3.5" /> Data Preview
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              See what our{' '}
              <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">API delivers</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Anonymized aggregate data available through our partner API. All individual data access requires explicit worker consent.
            </p>
          </Section>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {dataPreviewStats.map((stat) => (
              <motion.div key={stat.label} variants={scaleIn} transition={{ duration: 0.5 }}>
                <Card className="text-center hover:shadow-md transition-all border-gray-100">
                  <CardContent className="p-5">
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Section delay={0.2} className="mt-12">
            <Card className="max-w-3xl mx-auto bg-gray-900 text-gray-100 border-gray-800 overflow-hidden">
              <CardContent className="p-6">
                <p className="text-xs font-mono text-emerald-400 mb-3">// Sample API Response — GET /api/partners/analytics</p>
                <pre className="text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed">{`{
  "total_workers": 2047,
  "total_clients": 3891,
  "verification_rate": 0.68,
  "trait_distribution": {
    "professional": 1240,
    "reliable": 1180,
    "on-time": 1050,
    "friendly": 980
  },
  "growth_metrics": {
    "new_workers_last_30d": 142,
    "new_bookings_last_30d": 890
  }
}`}</pre>
              </CardContent>
            </Card>
          </Section>
        </div>
      </section>

      {/* For Sponsors */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Section delay={0.15} className="order-2 lg:order-1">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'Verification Page', desc: 'Brand alongside trust. Visible when workers verify identity.' },
                  { title: 'Onboarding Flow', desc: 'First touchpoint. Welcome workers & clients with your brand.' },
                  { title: 'Dashboard Cards', desc: 'Daily visibility. Workers & clients see your message every login.' },
                  { title: 'Search Results', desc: 'Premium placement. Visible during the hiring decision.' },
                ].map((p) => (
                  <div key={p.title} className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 hover:shadow-md transition-all">
                    <h4 className="font-bold text-sm mb-1">{p.title}</h4>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200 mb-6">
                <Award className="w-3.5 h-3.5" /> For Sponsors
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Align your brand with{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">community impact</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Sponsoring DomestIQ means supporting financial inclusion, worker dignity, and household safety.
                Your brand is visible where it matters — right alongside trust.
              </p>
            </Section>
          </div>
        </div>
      </section>

      {/* For Advertisers */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Section>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-violet-100 text-violet-800 border border-violet-200 mb-6">
                <Megaphone className="w-3.5 h-3.5" /> For Advertisers
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Reach an engaged audience of{' '}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">workers and households</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Target by service type (cleaning, gardening, painting...), user role (worker or client),
                and placement. Full impression and click tracking.
              </p>
            </Section>

            <Section delay={0.15}>
              <div className="space-y-4">
                {[
                  { icon: Eye, title: 'Dashboard Placements', desc: 'Native ad cards in worker & client dashboards. Seen daily.' },
                  { icon: Users, title: 'Role-Based Targeting', desc: 'Show different ads to workers vs. households. Or target both.' },
                  { icon: BarChart3, title: 'Service Targeting', desc: 'Target specific services: cleaning products to cleaners, tools to handymen.' },
                  { icon: TrendingUp, title: 'Performance Tracking', desc: 'Real-time impressions, clicks, and CTR. Optimize your campaigns.' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-4">
              <Send className="w-3.5 h-3.5" /> Apply Now
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Let&apos;s build{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">together</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tell us about your company and what you&apos;re looking for. We&apos;ll get back to you within 48 hours.
            </p>
          </Section>

          {submitted ? (
            <Section>
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground">
                    Thank you for your interest in partnering with DomestIQ. Our team will review your application and get back to you within 48 hours.
                  </p>
                  <Link href="/">
                    <Button variant="outline" className="mt-6">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Section>
          ) : (
            <Section>
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company_name">Company Name *</Label>
                        <Input
                          id="company_name"
                          required
                          value={formData.company_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                          placeholder="e.g. Capitec Bank"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_name">Contact Name *</Label>
                        <Input
                          id="contact_name"
                          required
                          value={formData.contact_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_email">Email *</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          required
                          value={formData.contact_email}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="contact_phone">Phone Number</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                        placeholder="+27..."
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company_type">Company Type *</Label>
                        <select
                          id="company_type"
                          required
                          value={formData.company_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, company_type: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select type...</option>
                          {companyTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="interest">Interest *</Label>
                        <select
                          id="interest"
                          required
                          value={formData.interest}
                          onChange={(e) => setFormData(prev => ({ ...prev, interest: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select interest...</option>
                          {interests.map(i => (
                            <option key={i.value} value={i.value}>{i.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Tell us about your use case or what you're looking for..."
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Section>
          )}
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 border-t bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">Trusted By Leading Organisations</p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4', 'Partner 5'].map((name) => (
                <div key={name} className="w-32 h-12 rounded-lg bg-gray-200/50 border border-gray-200 flex items-center justify-center text-xs text-muted-foreground font-medium">
                  Coming Soon
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} DomestIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
