'use client'

import { useRef, useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/hooks/use-translation'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Search, Shield, Star, MapPin, MessageSquare, Clock,
  ArrowRight, Phone, Globe, CheckCircle2,
  Heart, Users, Zap, Eye, Lock, ChevronRight,
  Briefcase, TrendingUp, Award, Gift, FileText, Download,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { MagneticButton } from '@/components/landing/magnetic-button'
import { TiltCard } from '@/components/landing/tilt-card'
import { AnimatedCountersSection } from '@/components/landing/animated-counters-section'
import { TrustBadgesSection } from '@/components/landing/trust-badges-section'
import { CityCoverageSection } from '@/components/landing/city-coverage-section'
import { FaqSection } from '@/components/landing/faq-section'
// PartnersSection hidden — not for public display yet
// import { PartnersSection } from '@/components/landing/partners-section'
import { PwaInstallSection } from '@/components/landing/pwa-install-section'

/* ─── Animation Variants ─── */

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }
const slideLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } }
const slideRight = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } }

/* ─── Hero Word Reveal Variants ─── */
const heroWordContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
}
const heroWord = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

/* ─── How It Works Step Visuals ─── */
const stepVisual = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

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

function HowItWorksStep({ children, step, onActivate }: { children: React.ReactNode; step: number; onActivate: (s: number) => void }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-40% 0px -40% 0px' })
  if (inView) onActivate(step)
  return (
    <motion.div ref={ref} initial={{ opacity: 0.3 }} animate={{ opacity: inView ? 1 : 0.3 }}
      transition={{ duration: 0.5 }} className="py-4">
      {children}
    </motion.div>
  )
}

/* ─── Data ─── */

/* Data arrays moved inside component to access useTranslation */

/* ─── Page ─── */

export default function LandingPage() {
  const { t } = useTranslation()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Horizontal scroll services
  const servicesScrollRef = useRef(null)
  const { scrollYProgress: servicesProgress } = useScroll({ target: servicesScrollRef, offset: ['start start', 'end end'] })
  const servicesX = useTransform(servicesProgress, [0, 1], ['5%', '-60%'])

  // How It Works active step
  const [activeStep, setActiveStep] = useState(0)

  const workerBenefits = useMemo(() => [
    { icon: TrendingUp, title: t('landing.worker.b1_title', 'Consistent Work'), desc: t('landing.worker.b1_desc', 'No more weeks without income. Get bookings straight to your phone.') },
    { icon: Star, title: t('landing.worker.b2_title', 'Build Your Reputation'), desc: t('landing.worker.b2_desc', 'Reviews, references, and a professional CV that grows with every job. Never start from zero again.') },
    { icon: Shield, title: t('landing.worker.b3_title', 'Work Safely'), desc: t('landing.worker.b3_desc', 'Verified clients. Know who you\'re working for before you arrive.') },
    { icon: Phone, title: t('landing.worker.b4_title', 'Phone-Only Registration'), desc: t('landing.worker.b4_desc', 'No email needed. No typing. Just tap icons and take a selfie.') },
    { icon: Globe, title: t('landing.worker.b5_title', 'Use Your Language'), desc: t('landing.worker.b5_desc', 'Register and chat in Zulu, Xhosa, Sotho, Afrikaans — 11 SA languages.') },
    { icon: Heart, title: t('landing.worker.b6_title', 'Always Free'), desc: t('landing.worker.b6_desc', '100% free for workers. You keep every rand you earn. No commission taken from you.') },
    { icon: Gift, title: t('landing.worker.b7_title', 'Refer & Earn'), desc: t('landing.worker.b7_desc', 'Know someone looking for work? Share your code. When they sign up, you earn cash. Grow your community and your pocket.') },
    { icon: FileText, title: t('landing.worker.b8_title', 'Free CV Builder'), desc: t('landing.worker.b8_desc', 'Build a professional CV in a few taps. Download it as a PDF and use it for any job — not just DomestIQ.') },
  ], [t])

  const clientBenefits = useMemo(() => [
    { icon: Shield, title: t('landing.client.b1_title', 'Verified Workers'), desc: t('landing.client.b1_desc', 'ID checked, criminal records screened. Know who enters your home.') },
    { icon: Star, title: t('landing.client.b2_title', 'Reviews & References'), desc: t('landing.client.b2_desc', 'Honest ratings from real households, plus written references you can trust.') },
    { icon: MapPin, title: t('landing.client.b3_title', 'Workers Near You'), desc: t('landing.client.b3_desc', 'GPS-powered search. See who\'s available in your area right now.') },
    { icon: Clock, title: t('landing.client.b4_title', 'Easy Scheduling'), desc: t('landing.client.b4_desc', 'Book one-time or recurring. Calendar sync. Automatic reminders.') },
  ], [t])

  const services = useMemo(() => [
    { name: t('landing.svc.domestic', 'Domestic Worker'), emoji: '🏠' }, { name: t('landing.svc.gardener', 'Gardener'), emoji: '🌿' },
    { name: t('landing.svc.painter', 'Painter'), emoji: '🎨' }, { name: t('landing.svc.welder', 'Welder'), emoji: '🔧' },
    { name: t('landing.svc.electrician', 'Electrician'), emoji: '⚡' }, { name: t('landing.svc.plumber', 'Plumber'), emoji: '🔧' },
    { name: t('landing.svc.carpenter', 'Carpenter'), emoji: '🪚' }, { name: t('landing.svc.handyman', 'Handyman'), emoji: '🛠️' },
    { name: t('landing.svc.babysitter', 'Babysitter'), emoji: '👶' }, { name: t('landing.svc.pool_cleaner', 'Pool Cleaner'), emoji: '🏊' },
    { name: t('landing.svc.tiler', 'Tiler'), emoji: '🧱' }, { name: t('landing.svc.security', 'Security Guard'), emoji: '🛡️' },
  ], [t])

  const stories = useMemo(() => [
    { name: 'Thandi M.', role: t('landing.stories.s1_role', 'Domestic Worker, Soweto'), quote: t('landing.stories.s1_quote', 'I used to wait weeks between jobs, asking friends if they know anyone. Now I get bookings every week. My children can eat properly.'), initials: 'TM', gradient: 'from-amber-500 to-orange-600' },
    { name: 'Sipho K.', role: t('landing.stories.s2_role', 'Gardener, Pretoria'), quote: t('landing.stories.s2_quote', 'I cannot read well but the pictures and icons make it easy. I registered by myself on my phone. No help needed.'), initials: 'SK', gradient: 'from-emerald-500 to-teal-600' },
    { name: 'Nomsa D.', role: t('landing.stories.s3_role', 'Domestic Worker, Durban'), quote: t('landing.stories.s3_quote', 'Before, I had no proof I am good at my work. Now my 47 five-star reviews speak for me. Clients trust me before I even arrive.'), initials: 'ND', gradient: 'from-violet-500 to-purple-600' },
    { name: 'Sarah vd Berg', role: t('landing.stories.s4_role', 'Client, Sandton'), quote: t('landing.stories.s4_quote', 'Finding a trusted helper used to mean asking friends and hoping for the best. DomestIQ changed that completely.'), initials: 'SB', gradient: 'from-blue-500 to-indigo-600' },
    { name: 'Pieter J.', role: t('landing.stories.s5_role', 'Client, Cape Town'), quote: t('landing.stories.s5_quote', 'The verification badges give me peace of mind. I know who is coming to my house. That matters when you have kids.'), initials: 'PJ', gradient: 'from-sky-500 to-cyan-600' },
    { name: 'Lerato M.', role: t('landing.stories.s6_role', 'Painter, Johannesburg'), quote: t('landing.stories.s6_quote', 'I set my own rates. Nobody takes a cut from me. I earned R8,000 last month through DomestIQ alone.'), initials: 'LM', gradient: 'from-rose-500 to-pink-600' },
  ], [t])

  const stats = useMemo(() => [
    { value: '16+', label: t('landing.stats.services', 'Service Categories'), icon: Zap },
    { value: '11', label: t('landing.stats.languages', 'SA Languages'), icon: Globe },
    { value: '100%', label: t('landing.stats.free', 'Free for Workers'), icon: Heart },
    { value: '0%', label: t('landing.stats.commission', 'Commission on Worker Earnings'), icon: Award },
  ], [t])

  return (
    <div className="min-h-screen bg-background overflow-hidden">

      {/* ━━━ Navigation ━━━ */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#for-workers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.for_workers', 'For Workers')}</a>
            <a href="#for-households" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.for_households', 'For Households')}</a>
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.services', 'Services')}</a>
            <a href="#stories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.stories', 'Stories')}</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.faq', 'FAQ')}</a>
{/* Partners link hidden — not for public display yet */}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />
            <Link href="/login" className="hidden sm:inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">{t('landing.nav.login', 'Log In')}</Link>
            <MagneticButton strength={0.2}>
              <Link href="/register" className="inline-flex items-center justify-center text-sm font-semibold leading-none bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 h-9 sm:px-5 sm:h-10 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5">{t('landing.nav.get_started', 'Get Started')}</Link>
            </MagneticButton>
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
                {t('landing.hero.badge', 'Built for Mzansi. Built for us.')}
              </span>
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" variants={heroWordContainer}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-gray-900">
              {t('landing.hero.heading_1', 'A safer, smarter way for').split(' ').map((word, i) => (
                <motion.span key={i} variants={heroWord} className="inline-block mr-[0.25em]">{word}</motion.span>
              ))}{' '}
              <motion.span variants={heroWord} className="relative inline-block mr-[0.25em]">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">{t('landing.hero.heading_workers', 'workers')}</span>
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.5 }}
                  className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full origin-left" />
              </motion.span>
              <motion.span variants={heroWord} className="inline-block mr-[0.25em]">{t('landing.hero.heading_and', 'and')}</motion.span>{' '}
              <motion.span variants={heroWord} className="inline-block mr-[0.25em]">
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">{t('landing.hero.heading_households', 'households')}</span>
              </motion.span>
              {t('landing.hero.heading_2', 'to connect').split(' ').map((word, i) => (
                <motion.span key={`end-${i}`} variants={heroWord} className="inline-block mr-[0.25em]">{word}</motion.span>
              ))}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.subtext', 'DomestIQ empowers domestic workers to find consistent, safe work — and helps households find help with confidence. Phone-first. All 11 SA languages. Always free for workers.')}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.5 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <Link href="/register/worker"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1">
                  {t('landing.hero.cta_worker', "I'm a Worker")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/register"
                  className="group inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-foreground px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1">
                  {t('landing.hero.cta_client', 'I Need a Worker')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.8 }}
              className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-500" />{t('landing.hero.trust_popia', 'POPI Act Compliant')}</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-500" />{t('landing.hero.trust_verified', 'ID Verified Workers')}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-amber-500" />{t('landing.hero.trust_criminal', 'Criminal Record Checks')}</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" />{t('landing.hero.trust_commission', 'Zero Commission on Workers')}</span>
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
                  <Briefcase className="w-3.5 h-3.5" /> {t('landing.nav.for_workers', 'For Workers')}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {t('landing.worker.heading_1', 'Your skills deserve')}{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t('landing.worker.heading_2', 'consistent work')}</span>
                </h2>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                  {t('landing.worker.body', 'Millions of domestic workers across South Africa rely on word-of-mouth to find their next job. When one employer cuts ties, it can mean weeks without income. DomestIQ changes that. Build your profile once. Get found. Get booked. Get reviewed.')}
                </p>
                <div className="mt-8">
                  <Link href="/register/worker"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5">
                    {t('landing.worker.cta', 'Register Free — 2 Minutes')}
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
                  <motion.div key={b.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                    <TiltCard className="group p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-emerald-100/80 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 h-full">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-emerald-700" />
                      </div>
                      <h3 className="font-bold text-sm mb-1">{b.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                    </TiltCard>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>

          {/* ── CV Builder Visual Callout ── */}
          <Section delay={0.2}>
            <div className="mt-16 rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/50 p-8 md:p-10 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* Steps */}
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-4">
                    <FileText className="w-3 h-3" /> {t('landing.cv.badge', 'Free for Every Worker')}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {t('landing.cv.heading_1', 'Build a CV in')}{' '}
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t('landing.cv.heading_2', '3 easy steps')}</span>
                  </h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {t('landing.cv.body', 'Your work history, skills, and reviews — packed into one professional document. Download it. Print it. Hand it to anyone.')}
                  </p>
                  <div className="mt-6 space-y-4">
                    {[
                      { step: '1', text: t('landing.cv.step1', 'Fill in your details — we pre-fill what we can') },
                      { step: '2', text: t('landing.cv.step2', 'Preview your CV on screen') },
                      { step: '3', text: t('landing.cv.step3', 'Download your PDF — free, forever') },
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.step}</div>
                        <span className="text-sm font-medium">{s.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs text-muted-foreground italic">
                    {t('landing.cv.portable', 'Not locked to DomestIQ. Your CV is yours to use everywhere.')}
                  </p>
                </div>

                {/* Mini CV Mockup Graphic */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-[240px] bg-white rounded-xl shadow-xl border border-gray-200 p-5 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                      {/* CV Header */}
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-20 bg-gray-800 rounded-sm" />
                          <div className="h-2 w-14 bg-gray-300 rounded-sm" />
                        </div>
                      </div>
                      {/* Skills */}
                      <div className="mb-3">
                        <div className="h-2 w-10 bg-emerald-600 rounded-sm mb-2" />
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[8px] text-emerald-700 font-medium">Cleaning</span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[8px] text-emerald-700 font-medium">Ironing</span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[8px] text-emerald-700 font-medium">Cooking</span>
                        </div>
                      </div>
                      {/* Experience lines */}
                      <div className="mb-3">
                        <div className="h-2 w-14 bg-emerald-600 rounded-sm mb-2" />
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-gray-100 rounded-sm" />
                          <div className="h-1.5 w-4/5 bg-gray-100 rounded-sm" />
                          <div className="h-1.5 w-3/5 bg-gray-100 rounded-sm" />
                        </div>
                      </div>
                      {/* Rating */}
                      <div className="flex items-center gap-0.5 mt-3 pt-2 border-t border-gray-100">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-[9px] text-muted-foreground ml-1">4.9</span>
                      </div>
                    </div>

                    {/* Download badge */}
                    <div className="absolute -bottom-3 -right-3 bg-emerald-600 text-white rounded-full p-2.5 shadow-lg shadow-emerald-500/30">
                      <Download className="w-4 h-4" />
                    </div>

                    {/* "Use Anywhere" floating tag */}
                    <div className="absolute -top-3 -left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/30 -rotate-6">
                      {t('landing.cv.tag', 'Use Anywhere!')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

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
                  <motion.div key={b.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                    <TiltCard className="group p-5 rounded-2xl bg-white border border-blue-100/80 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 h-full">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-blue-700" />
                      </div>
                      <h3 className="font-bold text-sm mb-1">{b.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                    </TiltCard>
                  </motion.div>
                )
              })}
            </motion.div>

            <div className="order-1 lg:order-2">
              <Section>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200 mb-6">
                  <Users className="w-3.5 h-3.5" /> {t('landing.nav.for_households', 'For Households')}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {t('landing.client.heading_1', 'Find help with')}{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('landing.client.heading_2', 'confidence')}</span>
                </h2>
                <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                  {t('landing.client.body', 'No more relying on word-of-mouth and hoping for the best. Browse verified, rated professionals near you. See their work history, read honest reviews, and connect in minutes.')}
                </p>
                <div className="mt-8">
                  <Link href="/register"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5">
                    {t('landing.client.cta', 'Find a Worker')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Section>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ How It Works — Sticky Scroll Storytelling ━━━ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-violet-100 text-violet-800 border border-violet-200 mb-4">
              {t('landing.how.badge', 'How It Works')}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t('landing.how.heading_1', 'Simple for')}{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t('landing.how.heading_2', 'everyone')}</span>
            </h2>
          </Section>

          {/* Desktop: Sticky scroll storytelling */}
          <div className="hidden lg:grid grid-cols-2 gap-16">
            {/* Left: Sticky visual */}
            <div className="relative">
              <div className="sticky top-24 flex items-center justify-center h-[60vh]">
                <div className="relative w-[280px] h-[480px] rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-gray-800 p-3 shadow-2xl shadow-black/20">
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
                  {/* Phone screen */}
                  <div className="w-full h-full rounded-[2rem] bg-white overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      {activeStep === 0 && (
                        <motion.div key="step0" {...stepVisual} transition={{ duration: 0.4 }} className="absolute inset-0 p-5 flex flex-col">
                          <div className="text-center mt-8 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3"><Phone className="w-7 h-7 text-emerald-600" /></div>
                            <p className="font-bold text-sm text-gray-900">{t('landing.how.ws1_title', 'Register with your phone')}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2.5 px-2">
                            {['🏠', '🌿', '🎨', '🔧', '⚡', '🪚', '👶', '🏊', '🛠️'].map((e, i) => (
                              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.06, type: 'spring', stiffness: 400 }}
                                className="aspect-square rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                                {e}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {activeStep === 1 && (
                        <motion.div key="step1" {...stepVisual} transition={{ duration: 0.4 }} className="absolute inset-0 p-4 flex flex-col">
                          <div className="flex items-center gap-2 mb-4 mt-6">
                            <div className="flex-1 h-9 rounded-full bg-gray-100 flex items-center px-3"><Search className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-400 ml-2">Search workers...</span></div>
                          </div>
                          {[
                            { name: 'Thandi M.', role: 'Domestic Worker', rating: '4.9', color: 'emerald' },
                            { name: 'Sipho K.', role: 'Gardener', rating: '4.8', color: 'teal' },
                            { name: 'Nomsa D.', role: 'Domestic Worker', rating: '5.0', color: 'emerald' },
                          ].map((w, i) => (
                            <motion.div key={i} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.15 }}
                              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 mb-2">
                              <div className={`w-10 h-10 rounded-full bg-${w.color}-100 flex items-center justify-center text-xs font-bold text-${w.color}-700`}>{w.name.split(' ').map(n => n[0]).join('')}</div>
                              <div className="flex-1 min-w-0"><p className="font-semibold text-xs truncate">{w.name}</p><p className="text-[10px] text-gray-500">{w.role}</p></div>
                              <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-[10px] font-medium">{w.rating}</span></div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      {activeStep === 2 && (
                        <motion.div key="step2" {...stepVisual} transition={{ duration: 0.4 }} className="absolute inset-0 p-5 flex flex-col items-center justify-center">
                          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                            className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                          </motion.div>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-bold text-base text-gray-900 mb-1">Booking Sent!</motion.p>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-xs text-gray-500 text-center mb-6">Thandi will confirm shortly</motion.p>
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                            className="w-full rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Service</span><span className="font-medium">Deep Clean</span></div>
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Date</span><span className="font-medium">Mon, 10 Mar</span></div>
                            <div className="flex justify-between text-xs"><span className="text-gray-500">Time</span><span className="font-medium">08:00 – 14:00</span></div>
                          </motion.div>
                        </motion.div>
                      )}
                      {activeStep === 3 && (
                        <motion.div key="step3" {...stepVisual} transition={{ duration: 0.4 }} className="absolute inset-0 p-5 flex flex-col items-center justify-center">
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-bold text-sm text-gray-900 mb-3">How was Thandi?</motion.p>
                          <div className="flex gap-1.5 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <motion.div key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 400 }}>
                                <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                              </motion.div>
                            ))}
                          </div>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-xs text-gray-500 text-center mb-5">Your review helps Thandi find more work</motion.p>
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                            className="w-full h-20 rounded-xl bg-gray-50 border border-gray-100 p-3">
                            <span className="text-xs text-gray-400">Write a review...</span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Scrolling steps */}
            <div className="space-y-[40vh] py-[10vh]">
              {[
                { step: 0, icon: Phone, color: 'emerald', title: t('landing.how.ws1_title', 'Register with your phone'), desc: t('landing.how.ws1_desc', 'Tap icons to select your skills. No typing needed.'), sub: t('landing.how.cs1_desc', 'Filter by service, distance, rating, and availability.') },
                { step: 1, icon: Search, color: 'teal', title: t('landing.how.ws2_title', 'Get discovered'), desc: t('landing.how.ws2_desc', 'Households near you see your profile, rating, and availability.'), sub: t('landing.how.cs2_desc', 'Check ratings, reviews, and verification badges.') },
                { step: 2, icon: MessageSquare, color: 'blue', title: t('landing.how.ws3_title', 'Accept bookings'), desc: t('landing.how.ws3_desc', 'Choose the jobs you want. Set your own schedule and rates.'), sub: t('landing.how.cs3_desc', 'Send a message or request a booking. Arrange the details directly.') },
                { step: 3, icon: Star, color: 'amber', title: t('landing.how.ws4_title', 'Build your reputation'), desc: t('landing.how.ws4_desc', 'Every good job earns reviews that attract more work.'), sub: t('landing.how.cs4_desc', 'Your review helps the community and rewards good workers.') },
              ].map((s) => {
                const StepIcon = s.icon
                return (
                  <HowItWorksStep key={s.step} step={s.step} onActivate={setActiveStep}>
                    <div className={`w-12 h-12 rounded-2xl bg-${s.color}-100 flex items-center justify-center mb-4`}>
                      <StepIcon className={`w-6 h-6 text-${s.color}-600`} />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-8 h-8 rounded-full bg-${s.color}-600 text-white flex items-center justify-center text-sm font-bold`}>{s.step + 1}</span>
                      <h4 className="text-xl font-bold">{s.title}</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <Users className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                      <span><span className="font-medium text-foreground">Households:</span> {s.sub}</span>
                    </div>
                  </HowItWorksStep>
                )
              })}
            </div>
          </div>

          {/* Mobile: Simple vertical cards */}
          <div className="lg:hidden grid md:grid-cols-2 gap-8">
            <Section>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" /> {t('landing.how.worker_title', "If you're a worker")}
                </h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: t('landing.how.ws1_title', 'Register with your phone'), desc: t('landing.how.ws1_desc', 'Tap icons to select your skills. No typing needed.') },
                    { step: '2', title: t('landing.how.ws2_title', 'Get discovered'), desc: t('landing.how.ws2_desc', 'Households near you see your profile, rating, and availability.') },
                    { step: '3', title: t('landing.how.ws3_title', 'Accept bookings'), desc: t('landing.how.ws3_desc', 'Choose the jobs you want. Set your own schedule and rates.') },
                    { step: '4', title: t('landing.how.ws4_title', 'Build your reputation'), desc: t('landing.how.ws4_desc', 'Every good job earns reviews that attract more work.') },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                      <div><h4 className="font-semibold text-sm">{s.title}</h4><p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section delay={0.15}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" /> {t('landing.how.client_title', "If you're a household")}
                </h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: t('landing.how.cs1_title', 'Search your area'), desc: t('landing.how.cs1_desc', 'Filter by service, distance, rating, and availability.') },
                    { step: '2', title: t('landing.how.cs2_title', 'Review profiles'), desc: t('landing.how.cs2_desc', 'Check ratings, reviews, and verification badges.') },
                    { step: '3', title: t('landing.how.cs3_title', 'Connect & schedule'), desc: t('landing.how.cs3_desc', 'Send a message or request a booking. Arrange the details directly.') },
                    { step: '4', title: t('landing.how.cs4_title', 'Rate honestly'), desc: t('landing.how.cs4_desc', 'Your review helps the community and rewards good workers.') },
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

      {/* ━━━ Services — Horizontal Scroll (desktop) / Grid (mobile) ━━━ */}
      <section id="services" className="bg-gradient-to-b from-gray-50/80 to-white">
        {/* Mobile: vertical grid */}
        <div className="md:hidden py-24 px-4 sm:px-6">
          <Section className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200 mb-4">
              {t('landing.services.badge', 'Service Categories')}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {t('landing.services.heading_1', 'Every skill,')}{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{t('landing.services.heading_2', 'one platform')}</span>
            </h2>
          </Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            {services.map((s) => (
              <motion.div key={s.name} variants={scaleIn} transition={{ duration: 0.4 }}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                <span className="text-2xl">{s.emoji}</span>
                <span className="font-medium text-sm">{s.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Desktop: horizontal scroll driven by vertical scroll */}
        <div ref={servicesScrollRef} className="hidden md:block relative h-[250vh]">
          <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
            <div className="text-center mb-10 px-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200 mb-4">
                {t('landing.services.badge', 'Service Categories')}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                {t('landing.services.heading_1', 'Every skill,')}{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{t('landing.services.heading_2', 'one platform')}</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('landing.services.subtext', 'From household help to skilled trades. Workers register their skills. Households find exactly what they need.')}
              </p>
            </div>
            <div className="overflow-hidden">
              <motion.div style={{ x: servicesX }} className="flex gap-6 pl-[10%]">
                {services.map((s) => (
                  <TiltCard key={s.name} maxTilt={6} className="shrink-0 w-56 p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-default">
                    <span className="text-4xl block mb-3">{s.emoji}</span>
                    <span className="font-semibold text-base">{s.name}</span>
                  </TiltCard>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Stories ━━━ */}
      <section id="stories" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Section className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 border border-rose-200 mb-4">
              {t('landing.stories.badge', 'Real Stories')}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {t('landing.stories.heading_1', 'Changing lives,')}{' '}
              <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">{t('landing.stories.heading_2', 'one booking at a time')}</span>
            </h2>
          </Section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <motion.div key={story.name} variants={fadeUp} transition={{ duration: 0.5 }}>
                <TiltCard className="relative bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full">
                  <div className="text-5xl font-serif text-gray-100 leading-none mb-1">&ldquo;</div>
                  <p className="text-foreground leading-relaxed mb-6 text-[15px]">{story.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${story.gradient} flex items-center justify-center text-white font-bold text-xs`}>{story.initials}</div>
                    <div>
                      <p className="font-semibold text-sm">{story.name}</p>
                      <p className="text-xs text-muted-foreground">{story.role}</p>
                    </div>
                  </div>
                </TiltCard>
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

      {/* Partners section hidden — not for public display yet */}

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
                {t('landing.cta.heading_1', "This isn't just an app.")}{' '}
                <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                  {t('landing.cta.heading_2', "It's a movement.")}
                </span>
              </h2>
              <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                {t('landing.cta.body', "Every worker who builds their profile creates opportunity. Every household that books through DomestIQ builds trust. Together, we're building something South Africa has never had — a trusted network for verified domestic work.")}
              </p>
            </Section>

            <Section delay={0.2}>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
                {[
                  { icon: Heart, text: t('landing.cta.pill1', 'Workers keep 100% of their earnings') },
                  { icon: Shield, text: t('landing.cta.pill2', 'Progressive trust verification') },
                  { icon: Globe, text: t('landing.cta.pill3', 'All 11 official SA languages') },
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
                <MagneticButton>
                  <Link href="/register/worker"
                    className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1">
                    {t('landing.cta.register_worker', 'Register as a Worker')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link href="/register"
                    className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                    {t('landing.cta.find_worker', 'Find a Worker')}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
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
              <h4 className="font-semibold mb-4 text-sm">{t('landing.footer.for_workers', 'For Workers')}</h4>
              <ul className="space-y-3">
                <li><Link href="/register/worker" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.register', 'Register')}</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('landing.nav.login', 'Log In')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">{t('landing.footer.for_households', 'For Households')}</h4>
              <ul className="space-y-3">
                <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.find_workers', 'Find Workers')}</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.sign_in', 'Sign In')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">{t('landing.footer.legal', 'Legal')}</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.terms', 'Terms of Service')}</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.privacy', 'Privacy Policy')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {t('landing.footer.copyright', 'DomestIQ. All rights reserved.')}</p>
            <p className="text-xs text-muted-foreground">{t('landing.footer.disclaimer', 'DomestIQ is a matching platform. No employment relationship is created between users.')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
