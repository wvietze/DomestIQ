'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Search, Shield, Star, MapPin, MessageSquare, Clock,
  ArrowRight, Phone, Globe, CheckCircle2, Sparkles,
  Heart, Users, Zap, Eye, Lock, ChevronRight,
} from 'lucide-react'

/* ─── Animation Variants ─── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

/* ─── Section Wrapper for scroll animations ─── */

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Data ─── */

const features = [
  {
    icon: Phone,
    title: 'Phone-First Design',
    description: 'No email required. Register with your phone number in under 2 minutes. Built for how South Africa actually works.',
    gradient: 'from-blue-500/10 to-blue-600/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Verified & Trusted',
    description: 'Progressive verification: selfie, SA ID, and criminal clearance. Clients filter by trust level.',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Star,
    title: 'Portable Reputation',
    description: 'Your ratings, reviews, and work history travel with you. Never start from zero again.',
    gradient: 'from-amber-500/10 to-amber-600/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
  },
  {
    icon: Globe,
    title: '11 SA Languages',
    description: 'Chat in Zulu, Xhosa, Sotho, Afrikaans, English and more. AI-powered translation built in.',
    gradient: 'from-violet-500/10 to-violet-600/5',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
  },
  {
    icon: MapPin,
    title: 'GPS-Powered Search',
    description: 'Find workers near you. No more word-of-mouth searching. See distance, availability, and rates instantly.',
    gradient: 'from-rose-500/10 to-rose-600/5',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Book one-time or recurring appointments. Calendar sync. Automatic reminders for both parties.',
    gradient: 'from-cyan-500/10 to-cyan-600/5',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-600',
  },
]

const services = [
  { name: 'Domestic Worker', emoji: '🏠' },
  { name: 'Gardener', emoji: '🌿' },
  { name: 'Painter', emoji: '🎨' },
  { name: 'Welder', emoji: '🔧' },
  { name: 'Electrician', emoji: '⚡' },
  { name: 'Plumber', emoji: '🔧' },
  { name: 'Carpenter', emoji: '🪚' },
  { name: 'Handyman', emoji: '🛠️' },
  { name: 'Babysitter', emoji: '👶' },
  { name: 'Pool Cleaner', emoji: '🏊' },
  { name: 'Tiler', emoji: '🧱' },
  { name: 'Security Guard', emoji: '🛡️' },
]

const testimonials = [
  {
    name: 'Thandi M.',
    role: 'Domestic Worker, Soweto',
    quote: 'I used to wait weeks between jobs. Now I get bookings every week. My children can eat properly.',
    avatar: 'TM',
  },
  {
    name: 'Sarah van der Berg',
    role: 'Client, Sandton',
    quote: 'Finding a trusted helper used to mean asking friends and hoping for the best. DomestIQ changed that completely.',
    avatar: 'SB',
  },
  {
    name: 'Sipho K.',
    role: 'Gardener, Pretoria',
    quote: 'I cannot read well but the pictures and icons make it easy. I registered by myself on my phone.',
    avatar: 'SK',
  },
]

const stats = [
  { value: '16+', label: 'Service Categories', icon: Zap },
  { value: '11', label: 'Languages Supported', icon: Globe },
  { value: '100%', label: 'Free for Workers', icon: Heart },
  { value: '2 min', label: 'To Register', icon: Clock },
]

/* ─── Page Component ─── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ━━━ Navigation ━━━ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-brand">DomestIQ</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Services
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ━━━ Hero Section ━━━ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="hero-orb-blue -top-40 -right-40" />
        <div className="hero-orb-green -bottom-40 -left-40" />
        <div className="hero-orb-amber top-1/2 right-1/4" />
        <div className="absolute inset-0 bg-dots" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Built for South Africa
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Find trusted workers{' '}
              <span className="text-gradient-hero">near you</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              DomestIQ connects South African households with verified domestic workers,
              gardeners, painters, and skilled tradespeople. Phone-first registration.
              No email needed. Real reviews. Instant booking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Find a Worker
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register/worker"
                className="group inline-flex items-center justify-center gap-2 glass border border-gray-200 text-foreground px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5" />
                Join as Worker
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-500" />
                POPI Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                ID Verified Workers
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" />
                Criminal Record Checks
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ Stats Bar ━━━ */}
      <section className="relative border-y bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 mb-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-gradient-brand">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ━━━ Features Grid ━━━ */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Designed for the{' '}
              <span className="text-gradient-brand">real South Africa</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Not another Silicon Valley clone. Built from the ground up for how things actually work here.
            </p>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className={`group relative bg-gradient-to-br ${feature.gradient} rounded-2xl p-8 border border-white/60 card-hover`}
                >
                  <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ━━━ Services Grid ━━━ */}
      <section id="services" className="py-24 md:py-32 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100 mb-4">
              Service Categories
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Every skill you need,{' '}
              <span className="text-gradient-brand">one platform</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From household help to skilled trades. Find the right person for any job.
            </p>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {services.map((service) => (
              <motion.div
                key={service.name}
                variants={scaleIn}
                transition={{ duration: 0.4 }}
                className="group flex items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 card-hover cursor-default"
              >
                <span className="text-2xl">{service.emoji}</span>
                <span className="font-medium text-[15px]">{service.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ How It Works ━━━ */}
      <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Three steps to{' '}
              <span className="text-gradient-brand">getting it done</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '01',
                title: 'Search',
                desc: 'Browse workers by service, location, and availability. Filter by ratings and verification level.',
                icon: Search,
                color: 'blue',
              },
              {
                step: '02',
                title: 'Book',
                desc: 'Pick your date and time. Add instructions. The worker confirms and you\'re set.',
                icon: MessageSquare,
                color: 'emerald',
              },
              {
                step: '03',
                title: 'Review',
                desc: 'Rate your experience honestly. Help build trust in the community. Workers build their reputation.',
                icon: Star,
                color: 'amber',
              },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 0.15}>
                <div className="relative text-center group">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl shadow-gray-900/20 mb-6 group-hover:scale-105 transition-transform duration-300">
                    <item.icon className="w-8 h-8" />
                  </div>

                  {/* Connector line (hidden on mobile, shown on md+) */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-10 left-[calc(50%+50px)] w-[calc(100%-60px)] border-t-2 border-dashed border-gray-200" />
                  )}

                  <div className="text-sm font-bold text-muted-foreground/60 mb-2 tracking-widest uppercase">
                    Step {item.step}
                  </div>
                  <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Testimonials ━━━ */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-white to-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-violet-50 text-violet-700 border border-violet-100 mb-4">
              Real Stories
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Changing lives,{' '}
              <span className="text-gradient-brand">one booking at a time</span>
            </h2>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="relative bg-white rounded-2xl p-8 border border-gray-100 card-hover"
              >
                {/* Quote marks */}
                <div className="text-6xl font-serif text-blue-100 leading-none mb-2">&ldquo;</div>
                <p className="text-foreground leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ Worker CTA Section ━━━ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950" />
        <div className="absolute inset-0 bg-dots opacity-10" />

        {/* Decorative orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white/90 border border-white/10 mb-6">
                For Workers
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Your skills deserve to be{' '}
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  seen
                </span>
              </h2>
              <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                Join DomestIQ for free. Build your verified profile in minutes using just your phone.
                No typing needed — just tap icons and take a selfie. Start getting bookings this week.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
                {[
                  { icon: Phone, text: 'Register with phone only' },
                  { icon: CheckCircle2, text: 'Build trust with verification' },
                  { icon: Heart, text: '100% free — always' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 glass-dark rounded-xl p-4">
                    <item.icon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-white">{item.text}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="mt-10">
                <Link
                  href="/register/worker"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Register as a Worker
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ━━━ Final CTA ━━━ */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Ready to find your next{' '}
              <span className="text-gradient-brand">trusted worker</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of South African households who&apos;ve made the switch from word-of-mouth to verified trust.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <footer className="border-t bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient-brand">DomestIQ</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connecting South African households with trusted, verified workers. Built with care, for everyone.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Workers</Link></li>
                <li><Link href="/register/worker" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Register as Worker</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><span className="text-sm text-muted-foreground">POPI Act Compliant</span></li>
              </ul>
            </div>

            {/* Languages */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Languages</h4>
              <ul className="space-y-3">
                <li><span className="text-sm text-muted-foreground">English</span></li>
                <li><span className="text-sm text-muted-foreground">Afrikaans</span></li>
                <li><span className="text-sm text-muted-foreground">isiZulu, isiXhosa & 7 more</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DomestIQ. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              DomestIQ is a matching platform. No employment relationship is created between users.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
