'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Search, Shield, Star, MapPin, MessageSquare, Clock,
  ArrowRight, Phone, Globe, CheckCircle2,
  Heart, Users, Zap, Eye, Lock, ChevronRight,
  Briefcase, TrendingUp, Award,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { AnimatedCountersSection } from '@/components/landing/animated-counters-section'
import { TrustBadgesSection } from '@/components/landing/trust-badges-section'
import { CityCoverageSection } from '@/components/landing/city-coverage-section'
import { FaqSection } from '@/components/landing/faq-section'
import { PwaInstallSection } from '@/components/landing/pwa-install-section'

/* ─── Animation Variants ─── */

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }
const slideLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } }
const slideRight = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } }

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

const workerBenefits = [
  { icon: TrendingUp, title: 'Consistent Work', desc: 'No more weeks without income. Get bookings straight to your phone.' },
  { icon: Star, title: 'Build Your Reputation', desc: 'Every good job earns you ratings that follow you. Never start from zero.' },
  { icon: Shield, title: 'Work Safely', desc: 'Verified clients. Know who you\'re working for before you arrive.' },
  { icon: Phone, title: 'Phone-Only Registration', desc: 'No email needed. No typing. Just tap icons and take a selfie.' },
  { icon: Globe, title: 'Use Your Language', desc: 'Register and chat in Zulu, Xhosa, Sotho, Afrikaans — 11 SA languages.' },
  { icon: Heart, title: 'Always Free', desc: '100% free for workers. You keep every rand you earn. No commission taken from you.' },
]

const clientBenefits = [
  { icon: Shield, title: 'Verified Workers', desc: 'ID checked, criminal records screened. Know who enters your home.' },
  { icon: Star, title: 'Real Reviews', desc: 'Honest ratings from real households. No fake profiles.' },
  { icon: MapPin, title: 'Workers Near You', desc: 'GPS-powered search. See who\'s available in your area right now.' },
  { icon: Clock, title: 'Easy Scheduling', desc: 'Book one-time or recurring. Calendar sync. Automatic reminders.' },
]

const services = [
  { name: 'Domestic Worker', emoji: '🏠' }, { name: 'Gardener', emoji: '🌿' },
  { name: 'Painter', emoji: '🎨' }, { name: 'Welder', emoji: '🔧' },
  { name: 'Electrician', emoji: '⚡' }, { name: 'Plumber', emoji: '🔧' },
  { name: 'Carpenter', emoji: '🪚' }, { name: 'Handyman', emoji: '🛠️' },
  { name: 'Babysitter', emoji: '👶' }, { name: 'Pool Cleaner', emoji: '🏊' },
  { name: 'Tiler', emoji: '🧱' }, { name: 'Security Guard', emoji: '🛡️' },
]

const stories = [
  { name: 'Thandi M.', role: 'Domestic Worker, Soweto', quote: 'I used to wait weeks between jobs, asking friends if they know anyone. Now I get bookings every week. My children can eat properly.', initials: 'TM', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Sipho K.', role: 'Gardener, Pretoria', quote: 'I cannot read well but the pictures and icons make it easy. I registered by myself on my phone. No help needed.', initials: 'SK', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Nomsa D.', role: 'Domestic Worker, Durban', quote: 'Before, I had no proof I am good at my work. Now my 47 five-star reviews speak for me. Clients trust me before I even arrive.', initials: 'ND', gradient: 'from-violet-500 to-purple-600' },
  { name: 'Sarah vd Berg', role: 'Client, Sandton', quote: 'Finding a trusted helper used to mean asking friends and hoping for the best. DomestIQ changed that completely.', initials: 'SB', gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Pieter J.', role: 'Client, Cape Town', quote: 'The verification badges give me peace of mind. I know who is coming to my house. That matters when you have kids.', initials: 'PJ', gradient: 'from-sky-500 to-cyan-600' },
  { name: 'Lerato M.', role: 'Painter, Johannesburg', quote: 'I set my own rates. Nobody takes a cut from me. I earned R8,000 last month through DomestIQ alone.', initials: 'LM', gradient: 'from-rose-500 to-pink-600' },
]

const stats = [
  { value: '16+', label: 'Service Categories', icon: Zap },
  { value: '11', label: 'SA Languages', icon: Globe },
  { value: '100%', label: 'Free for Workers', icon: Heart },
  { value: '0%', label: 'Commission on Worker Earnings', icon: Award },
]

/* ─── Page ─── */

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-background overflow-hidden">

      {/* ━━━ Navigation ━━━ */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#for-workers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For Workers</a>
            <a href="#for-households" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For Households</a>
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#stories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Stories</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />
            <Link href="/login" className="hidden sm:inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Log In</Link>
            <Link href="/register" className="inline-flex items-center justify-center text-sm font-semibold leading-none bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 h-9 sm:px-5 sm:h-10 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5">Get Started</Link>
          </div>
        </div>
      </motion.header>

      {/* ━━━ Hero ━━━ */}
      <section ref={heroRef} className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/8 blur-[120px]" />
        <div className="absolute inset-0 bg-dots opacity-30" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-50 to-emerald-50 text-emerald-800 border border-emerald-200/60 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Built for Mzansi. Built for us.
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
              A safer, smarter way for{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">workers</span>
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1 }}
                  className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full origin-left" />
              </span>
              {' '}and{' '}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">households</span>
              {' '}to connect
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              DomestIQ empowers domestic workers to find consistent, safe work — and helps households hire with confidence.
              Phone-first. All 11 SA languages. Always free for workers.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register/worker"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1">
                I&apos;m a Worker
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/register"
                className="group inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-foreground px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1">
                I Need a Worker
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-500" />POPI Act Compliant</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-500" />ID Verified Workers</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-amber-500" />Criminal Record Checks</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" />Zero Commission on Workers</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ━━━ Stats ━━━ */}
      <section className="relative border-y bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => {
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

      {/* ━━━ For Workers (FIRST - this is the priority) ━━━ */}
      <section id="for-workers" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-amber-50/30" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Section>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-6">
                  <Briefcase className="w-3.5 h-3.5" /> For Workers
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Your skills deserve{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">consistent work</span>
                </h2>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                  Millions of domestic workers across South Africa rely on word-of-mouth to find their next job.
                  When one employer cuts ties, it can mean weeks without income. DomestIQ changes that.
                  Build your profile once. Get found. Get booked. Get paid.
                </p>
                <div className="mt-8">
                  <Link href="/register/worker"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5">
                    Register Free — 2 Minutes
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Section>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={stagger}
              className="grid sm:grid-cols-2 gap-4">
              {workerBenefits.map((b) => {
                const Icon = b.icon
                return (
                  <motion.div key={b.title} variants={fadeUp} transition={{ duration: 0.5 }}
                    className="group p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-emerald-100/80 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ For Households ━━━ */}
      <section id="for-households" className="relative py-24 md:py-32 bg-gradient-to-b from-white to-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={stagger}
              className="grid sm:grid-cols-2 gap-4 order-2 lg:order-1">
              {clientBenefits.map((b) => {
                const Icon = b.icon
                return (
                  <motion.div key={b.title} variants={fadeUp} transition={{ duration: 0.5 }}
                    className="group p-5 rounded-2xl bg-white border border-blue-100/80 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-blue-700" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </motion.div>
                )
              })}
            </motion.div>

            <div className="order-1 lg:order-2">
              <Section>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200 mb-6">
                  <Users className="w-3.5 h-3.5" /> For Households
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Hire with{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">confidence</span>
                </h2>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                  No more relying on word-of-mouth and hoping for the best. Browse verified, rated professionals near you.
                  See their work history, read honest reviews, and book in minutes.
                </p>
                <div className="mt-8">
                  <Link href="/register"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5">
                    Find a Worker
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ How It Works — Split View ━━━ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-violet-100 text-violet-800 border border-violet-200 mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Simple for{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">everyone</span>
            </h2>
          </Section>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Worker side */}
            <Section>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" /> If you&apos;re a worker
                </h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: 'Register with your phone', desc: 'Tap icons to select your skills. No typing needed.' },
                    { step: '2', title: 'Get discovered', desc: 'Households near you see your profile, rating, and availability.' },
                    { step: '3', title: 'Accept bookings', desc: 'Choose the jobs you want. Set your own schedule and rates.' },
                    { step: '4', title: 'Build your reputation', desc: 'Every good job earns reviews that attract more work.' },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                      <div><h4 className="font-semibold text-sm">{s.title}</h4><p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Client side */}
            <Section delay={0.15}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> If you&apos;re a household
                </h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: 'Search your area', desc: 'Filter by service, distance, rating, and availability.' },
                    { step: '2', title: 'Review profiles', desc: 'Check ratings, reviews, and verification badges.' },
                    { step: '3', title: 'Book and pay', desc: 'Pick a date and time. Pay securely through the app.' },
                    { step: '4', title: 'Rate honestly', desc: 'Your review helps the community and rewards good workers.' },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                      <div><h4 className="font-semibold text-sm">{s.title}</h4><p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ━━━ Services ━━━ */}
      <section id="services" className="py-24 md:py-32 bg-gradient-to-b from-gray-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200 mb-4">
              Service Categories
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Every skill,{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">one platform</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From household help to skilled trades. Workers register their skills. Households find exactly what they need.
            </p>
          </Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {services.map((s) => (
              <motion.div key={s.name} variants={scaleIn} transition={{ duration: 0.4 }}
                className="group flex items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 cursor-default">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{s.emoji}</span>
                <span className="font-medium text-[15px]">{s.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ Stories ━━━ */}
      <section id="stories" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 border border-rose-200 mb-4">
              Real Stories
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Changing lives,{' '}
              <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">one booking at a time</span>
            </h2>
          </Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((t) => (
              <motion.div key={t.name} variants={fadeUp} transition={{ duration: 0.5 }}
                className="relative bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                <div className="text-5xl font-serif text-gray-100 leading-none mb-1">&ldquo;</div>
                <p className="text-foreground leading-relaxed mb-6 text-[15px]">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-xs`}>{t.initials}</div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ Animated Counters ━━━ */}
      <AnimatedCountersSection />

      {/* ━━━ Trust Badges ━━━ */}
      <TrustBadgesSection />

      {/* ━━━ City Coverage ━━━ */}
      <CityCoverageSection />

      {/* ━━━ FAQ ━━━ */}
      <FaqSection />

      {/* ━━━ Movement CTA ━━━ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950" />
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Section>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                This isn&apos;t just an app.{' '}
                <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                  It&apos;s a movement.
                </span>
              </h2>
              <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                Every worker who builds their profile creates opportunity.
                Every household that books through DomestIQ builds trust.
                Together, we&apos;re building something South Africa has never had — a trusted network for verified domestic work.
              </p>
            </Section>

            <Section delay={0.2}>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
                {[
                  { icon: Heart, text: 'Workers keep 100% of their earnings' },
                  { icon: Shield, text: 'Progressive trust verification' },
                  { icon: Globe, text: 'All 11 official SA languages' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <item.icon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-white">{item.text}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register/worker"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1">
                  Register as a Worker
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/register"
                  className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                  Find a Worker
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ━━━ PWA Install Prompt ━━━ */}
      <PwaInstallSection />

      {/* ━━━ Footer ━━━ */}
      <footer className="border-t bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo />
              <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                The trusted network for verified domestic workers and households in South Africa. Built for Mzansi, built for us.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">For Workers</h4>
              <ul className="space-y-3">
                <li><Link href="/register/worker" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Register Free</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Worker Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">For Households</h4>
              <ul className="space-y-3">
                <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Find Workers</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><span className="text-sm text-muted-foreground">POPI Act Compliant</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} DomestIQ. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">DomestIQ is a matching platform. No employment relationship is created between users.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
