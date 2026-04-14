'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/hooks/use-translation'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Search, Shield, Star, MapPin, MessageSquare, Clock,
  ArrowRight, Phone, Globe, CheckCircle2,
  Heart, Users, Zap, ChevronRight,
  Briefcase, TrendingUp, Award, Gift, FileText, Download,
} from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { MagneticButton } from '@/components/landing/magnetic-button'
import { AnimatedCountersSection } from '@/components/landing/animated-counters-section'
import { TrustBadgesSection } from '@/components/landing/trust-badges-section'
import { CityCoverageSection } from '@/components/landing/city-coverage-section'
import { FaqSection } from '@/components/landing/faq-section'
import { PwaInstallSection } from '@/components/landing/pwa-install-section'

/* ─── Animation Variants ─── */

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const scaleIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }
const slideLeft = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } }
const slideRight = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } }

/* ─── Section Wrapper ─── */

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

/* ─── How It Works Step ─── */

const stepVisual = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

function HowItWorksStep({ children, step, isFirst, isLast, onActivate }: { children: React.ReactNode; step: number; isFirst?: boolean; isLast?: boolean; onActivate: (s: number) => void }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-35% 0px -35% 0px' })
  useEffect(() => { if (inView) onActivate(step) }, [inView, step, onActivate])
  return (
    <motion.div ref={ref} initial={{ opacity: 0.3 }} animate={{ opacity: inView ? 1 : 0.3 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center ${isFirst ? 'min-h-[40vh]' : isLast ? 'min-h-[50vh]' : 'min-h-[60vh]'}`}>
      <div className="w-full">{children}</div>
    </motion.div>
  )
}

/* ─── Page ─── */

export default function LandingPage() {
  const { t } = useTranslation()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Parallax image reveal between hero and problem section
  const revealRef = useRef(null)
  const { scrollYProgress: revealProgress } = useScroll({ target: revealRef, offset: ['start end', 'end start'] })
  const revealScale = useTransform(revealProgress, [0, 0.5], [1.15, 1])
  const revealY = useTransform(revealProgress, [0, 1], ['0%', '15%'])

  // How It Works active step
  const [activeStep, setActiveStep] = useState(0)

  const workerBenefits = useMemo(() => [
    { icon: TrendingUp, title: t('landing.worker.b1_title', 'Consistent Work'), desc: t('landing.worker.b1_desc', 'Bookings come straight to your phone. No more waiting at gates or asking around.') },
    { icon: Star, title: t('landing.worker.b2_title', 'Your Reputation Grows'), desc: t('landing.worker.b2_desc', 'Every good job earns a review. Every review brings the next job. You never start from zero again.') },
    { icon: Shield, title: t('landing.worker.b3_title', 'Know Who You Work For'), desc: t('landing.worker.b3_desc', 'Clients are verified too. See who you\'re going to before you arrive.') },
    { icon: Phone, title: t('landing.worker.b4_title', 'Phone-Only Registration'), desc: t('landing.worker.b4_desc', 'No email needed. Tap icons to pick your skills — no typing, no forms.') },
    { icon: Globe, title: t('landing.worker.b5_title', 'In Your Language'), desc: t('landing.worker.b5_desc', 'Use DomestIQ in Zulu, Xhosa, Sotho, Afrikaans — all 11 SA languages.') },
    { icon: Heart, title: t('landing.worker.b6_title', 'You Keep Every Rand'), desc: t('landing.worker.b6_desc', 'We never take a cut from what you earn. Not now, not ever.') },
    { icon: Gift, title: t('landing.worker.b7_title', 'Refer & Earn'), desc: t('landing.worker.b7_desc', 'Know someone good? Share your code. When they join, you both earn.') },
    { icon: FileText, title: t('landing.worker.b8_title', 'Free CV Builder'), desc: t('landing.worker.b8_desc', 'Build a professional CV from your profile. Download the PDF — it\'s yours to use anywhere.') },
  ], [t])

  const clientBenefits = useMemo(() => [
    { icon: Shield, title: t('landing.client.b1_title', 'ID Verified'), desc: t('landing.client.b1_desc', 'Every worker can verify their SA ID and criminal clearance. You see the badge before you book.') },
    { icon: Star, title: t('landing.client.b2_title', 'Real Reviews'), desc: t('landing.client.b2_desc', 'Ratings from actual households. Written references you can read before deciding.') },
    { icon: MapPin, title: t('landing.client.b3_title', 'Close to You'), desc: t('landing.client.b3_desc', 'See workers in your area, sorted by distance. Find someone around the corner.') },
    { icon: Clock, title: t('landing.client.b4_title', 'Book in Minutes'), desc: t('landing.client.b4_desc', 'Once-off or recurring. Pick a date, pick a time, send the request. Done.') },
  ], [t])

  const services = useMemo(() => [
    t('landing.svc.domestic', 'Domestic Worker'), t('landing.svc.gardener', 'Gardener'),
    t('landing.svc.painter', 'Painter'), t('landing.svc.welder', 'Welder'),
    t('landing.svc.electrician', 'Electrician'), t('landing.svc.plumber', 'Plumber'),
    t('landing.svc.carpenter', 'Carpenter'), t('landing.svc.handyman', 'Handyman'),
    t('landing.svc.babysitter', 'Babysitter'), t('landing.svc.pool_cleaner', 'Pool Cleaner'),
    t('landing.svc.tiler', 'Tiler'), t('landing.svc.security', 'Security Guard'),
  ], [t])

  const stories = useMemo(() => [
    { name: 'Thandi M.', role: t('landing.stories.s1_role', 'Domestic Worker, Soweto'), quote: t('landing.stories.s1_quote', 'I used to wait weeks between jobs. Now I get bookings every week. My children can eat properly.'), initials: 'TM', image: '/images/landing/rated-respected.png' },
    { name: 'Sipho K.', role: t('landing.stories.s2_role', 'Gardener, Pretoria'), quote: t('landing.stories.s2_quote', 'I cannot read well but the pictures make it easy. I registered by myself. No help needed.'), initials: 'SK', image: '/images/landing/phone-buzzes.png' },
    { name: 'Nomsa D.', role: t('landing.stories.s3_role', 'Domestic Worker, Durban'), quote: t('landing.stories.s3_quote', 'Before, I had no proof I\'m good at what I do. Now my reviews speak for me. Clients trust me before I arrive.'), initials: 'ND', image: '/images/landing/reputation.png' },
    { name: 'Sarah vd Berg', role: t('landing.stories.s4_role', 'Household, Sandton'), quote: t('landing.stories.s4_quote', 'Finding someone I trust used to mean asking friends and hoping for the best. Not anymore.'), initials: 'SB', image: '/images/landing/found-worker.png' },
    { name: 'Pieter J.', role: t('landing.stories.s5_role', 'Household, Cape Town'), quote: t('landing.stories.s5_quote', 'I know exactly who\'s coming to my house. When you have kids, that matters more than anything.'), initials: 'PJ', image: '/images/landing/trust-at-door.png' },
    { name: 'Lerato M.', role: t('landing.stories.s6_role', 'Painter, Johannesburg'), quote: t('landing.stories.s6_quote', 'I set my own rates. Nobody takes a cut. I earned R8,000 last month through DomestIQ alone.'), initials: 'LM', image: '/images/landing/braai-share.png' },
  ], [t])

  const stats = useMemo(() => [
    { value: '16+', label: t('landing.stats.services', 'Service Types'), icon: Zap },
    { value: '11', label: t('landing.stats.languages', 'SA Languages'), icon: Globe },
    { value: '100%', label: t('landing.stats.free', 'Free for Workers'), icon: Heart },
    { value: '0%', label: t('landing.stats.commission', 'Taken from Workers'), icon: Award },
  ], [t])

  return (
    <div className="min-h-[100dvh] bg-white">

      {/* ━━━ Navigation ━━━ */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#for-workers" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.nav.for_workers', 'For Workers')}</a>
            <a href="#for-households" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.nav.for_households', 'For Households')}</a>
            <a href="#services" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.nav.services', 'Services')}</a>
            <a href="#stories" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.nav.stories', 'Stories')}</a>
            <a href="#faq" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.nav.faq', 'FAQ')}</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />
            <Link href="/login" className="hidden sm:inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-2">{t('landing.nav.login', 'Log In')}</Link>
            <MagneticButton strength={0.2}>
              <Link href="/register" className="inline-flex items-center justify-center text-sm font-semibold leading-none bg-zinc-900 text-white px-4 h-9 sm:px-5 sm:h-10 rounded-full hover:bg-zinc-800 transition-colors">{t('landing.nav.get_started', 'Get Started')}</Link>
            </MagneticButton>
          </div>
        </div>
      </motion.header>

      {/* ━━━ Hero — Split Layout ━━━ */}
      <section ref={heroRef} className="relative pt-16 min-h-[100dvh] flex items-stretch">
        {/* Left: Copy */}
        <motion.div style={{ opacity: heroOpacity }} className="flex-1 flex items-center px-6 sm:px-10 lg:px-16 py-20 lg:py-0">
          <div className="max-w-xl">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('landing.hero.badge', 'Built for Mzansi. Built for us.')}
            </motion.span>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-zinc-900">
              {t('landing.hero.heading_1', 'Good work')}{' '}
              <span className="text-emerald-700">{t('landing.hero.heading_workers', 'deserves')}</span>{' '}
              {t('landing.hero.heading_and', 'to be')}<br />
              <span className="text-emerald-700">{t('landing.hero.heading_households', 'found')}</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 text-lg text-zinc-500 leading-relaxed max-w-[50ch]">
              {t('landing.hero.subtext', 'DomestIQ connects domestic workers and households across South Africa — with verified profiles, honest reviews, and real trust. Phone-first. All 11 languages. Always free for workers.')}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1 }}
              className="mt-10 flex flex-col sm:flex-row gap-3">
              <MagneticButton>
                <Link href="/register/worker"
                  className="group inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-zinc-800 transition-colors">
                  {t('landing.hero.cta_worker', "I'm a Worker")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/register"
                  className="group inline-flex items-center justify-center gap-2 border border-zinc-200 text-zinc-700 px-7 py-3.5 rounded-full text-base font-semibold hover:border-zinc-300 hover:bg-zinc-50 transition-all">
                  {t('landing.hero.cta_client', 'I Need Help at Home')}
                </Link>
              </MagneticButton>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.3 }}
              className="mt-10 flex flex-wrap gap-4 text-xs font-medium text-zinc-400">
              {[
                t('landing.hero.trust_popia', 'POPIA Compliant'),
                t('landing.hero.trust_verified', 'ID Verified'),
                t('landing.hero.trust_criminal', 'Background Checked'),
                t('landing.hero.trust_commission', 'Zero Commission'),
              ].map((label) => (
                <span key={label} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Hero Image */}
        <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}
          className="hidden lg:block w-[45%] relative">
          <Image
            src="/images/landing/phone-buzzes.png"
            alt="Worker checking phone with township rooftops behind him"
            fill
            className="object-cover"
            priority
            sizes="45vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent w-24" />
        </motion.div>
      </section>

      {/* ━━━ Stats Bar ━━━ */}
      <section className="border-y border-zinc-100 bg-zinc-950 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <motion.div key={s.label} variants={scaleIn} transition={{ duration: 0.5 }} className="text-center p-3">
                  <Icon className="w-4 h-4 text-emerald-400 mx-auto mb-2" />
                  <p className="text-3xl md:text-4xl font-extrabold text-white">{s.value}</p>
                  <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ━━━ Problem Section — "The Reality" with real photography ━━━ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Section className="mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 mb-6">
              {t('landing.problem.badge', 'The Reality')}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight max-w-2xl">
              {t('landing.problem.heading_1', 'We know')}{' '}
              <span className="text-zinc-400">{t('landing.problem.heading_2', 'the struggle')}</span>
            </h2>
          </Section>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                image: '/images/landing/waiting-for-work.png',
                alt: 'Worker sitting outside estate gate waiting for work',
                title: t('landing.problem.waiting_title', 'Waiting for a call that might not come'),
                desc: t('landing.problem.waiting_desc', 'Skilled workers sit outside estate gates for hours, hoping someone will need them today.'),
              },
              {
                image: '/images/landing/door-stranger.png',
                alt: 'Woman opening door to an unknown person',
                title: t('landing.problem.door_title', 'Opening the door to a stranger'),
                desc: t('landing.problem.door_desc', 'No ID, no reviews, no references. You just have to hope the person is who they say they are.'),
              },
              {
                image: '/images/landing/cash-short.png',
                alt: 'Worker counting cash payment that falls short',
                title: t('landing.problem.cash_title', 'Getting paid short — with no recourse'),
                desc: t('landing.problem.cash_desc', 'No paper trail. No proof of the job done. If the cash comes up short, that\'s that.'),
              },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp} transition={{ duration: 0.6, delay: i * 0.15 }}>
                <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                  <Image src={item.image} alt={item.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Parallax Image Reveal — Cinematic Transition ━━━ */}
      <section ref={revealRef} className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <motion.div style={{ scale: revealScale, y: revealY }} className="absolute inset-0">
          <Image
            src="/images/landing/waiting-for-work-alt.png"
            alt="Worker waiting for opportunity outside estate"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-zinc-900/40" />
        </motion.div>
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <Section>
            <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
              {t('landing.cta.heading_1', 'South Africa runs on domestic work.')}{' '}
              <span className="text-emerald-300">{t('landing.cta.heading_2', "It's time it worked for everyone.")}</span>
            </p>
          </Section>
        </div>
      </section>

      {/* ━━━ For Workers ━━━ */}
      <section id="for-workers" className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image — left on desktop */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={slideLeft}
              transition={{ duration: 0.7 }} className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image src="/images/landing/reputation.png" alt="Worker looking at phone with quiet pride" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </motion.div>

            {/* Copy — right */}
            <div>
              <Section>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-6">
                  <Briefcase className="w-3 h-3" /> {t('landing.nav.for_workers', 'For Workers')}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-zinc-900">
                  {t('landing.worker.heading_1', 'Your skills deserve')}<br />
                  <span className="text-emerald-700">{t('landing.worker.heading_2', 'consistent work')}</span>
                </h2>
                <p className="mt-5 text-lg text-zinc-500 leading-relaxed max-w-[50ch]">
                  {t('landing.worker.body', 'Millions of workers across SA rely on word-of-mouth. When one client falls away, it can mean weeks with nothing. DomestIQ changes that — build your profile once, and your reviews, references, and reputation follow you.')}
                </p>
                <div className="mt-8">
                  <Link href="/register/worker"
                    className="group inline-flex items-center gap-2 bg-zinc-900 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-zinc-800 transition-colors">
                    {t('landing.worker.cta', 'Register Free — Takes 2 Minutes')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Section>
            </div>
          </div>

          {/* Worker Benefits Grid */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={stagger}
            className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workerBenefits.map((b) => {
              const Icon = b.icon
              return (
                <motion.div key={b.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                  <div className="group p-5 rounded-2xl border border-zinc-100 hover:border-emerald-200 hover:shadow-sm transition-all duration-300 h-full">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                      <Icon className="w-4 h-4 text-emerald-700" />
                    </div>
                    <h3 className="font-semibold text-sm text-zinc-900 mb-1">{b.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* CV Builder Callout */}
          <Section delay={0.2}>
            <div className="mt-16 rounded-2xl border border-zinc-100 bg-zinc-50 p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-4">
                    <FileText className="w-3 h-3" /> {t('landing.cv.badge', 'Free for Every Worker')}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
                    {t('landing.cv.heading_1', 'A professional CV')}{' '}
                    <span className="text-emerald-700">{t('landing.cv.heading_2', 'in 3 taps')}</span>
                  </h3>
                  <p className="mt-3 text-zinc-500 leading-relaxed">
                    {t('landing.cv.body', 'Your skills, work history, and reviews — turned into a proper document you can hand to anyone. Not just for DomestIQ. It\'s yours.')}
                  </p>
                  <div className="mt-6 space-y-3">
                    {[
                      { step: '1', text: t('landing.cv.step1', 'We pull your details from your profile') },
                      { step: '2', text: t('landing.cv.step2', 'Preview it on your screen') },
                      { step: '3', text: t('landing.cv.step3', 'Download the PDF — free, always') },
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.step}</div>
                        <span className="text-sm font-medium text-zinc-700">{s.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs text-zinc-400">
                    {t('landing.cv.portable', 'Your CV works everywhere. Print it. Email it. Hand it over at the gate.')}
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-[220px] bg-white rounded-xl shadow-lg border border-zinc-200 p-5 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-100" />
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-20 bg-zinc-800 rounded-sm" />
                          <div className="h-2 w-14 bg-zinc-300 rounded-sm" />
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="h-2 w-10 bg-emerald-600 rounded-sm mb-2" />
                        <div className="flex flex-wrap gap-1">
                          {['Cleaning', 'Ironing', 'Cooking'].map((s) => (
                            <span key={s} className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[8px] text-emerald-700 font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="h-2 w-14 bg-emerald-600 rounded-sm mb-2" />
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-zinc-100 rounded-sm" />
                          <div className="h-1.5 w-4/5 bg-zinc-100 rounded-sm" />
                          <div className="h-1.5 w-3/5 bg-zinc-100 rounded-sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 mt-3 pt-2 border-t border-zinc-100">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-[9px] text-zinc-500 ml-1">4.9</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-zinc-900 text-white rounded-full p-2.5 shadow-lg">
                      <Download className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ━━━ For Households ━━━ */}
      <section id="for-households" className="py-20 md:py-28 bg-zinc-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Copy — left */}
            <div>
              <Section>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-6">
                  <Users className="w-3 h-3" /> {t('landing.nav.for_households', 'For Households')}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-zinc-900">
                  {t('landing.client.heading_1', 'Find help')}<br />
                  <span className="text-blue-700">{t('landing.client.heading_2', 'you can trust')}</span>
                </h2>
                <p className="mt-5 text-lg text-zinc-500 leading-relaxed max-w-[50ch]">
                  {t('landing.client.body', 'Verified IDs. Background checks. Honest reviews from households like yours. Browse rated professionals in your area, see their work history, and connect with confidence.')}
                </p>
                <div className="mt-8">
                  <Link href="/register"
                    className="group inline-flex items-center gap-2 bg-zinc-900 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-zinc-800 transition-colors">
                    {t('landing.client.cta', 'Find a Worker Near Me')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Section>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={stagger}
                className="mt-10 grid sm:grid-cols-2 gap-4">
                {clientBenefits.map((b) => {
                  const Icon = b.icon
                  return (
                    <motion.div key={b.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                      <div className="group p-4 rounded-xl border border-zinc-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-300 h-full">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                          <Icon className="w-4 h-4 text-blue-700" />
                        </div>
                        <h3 className="font-semibold text-sm text-zinc-900 mb-1">{b.title}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">{b.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>

            {/* Image — right */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={slideRight}
              transition={{ duration: 0.7 }} className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image src="/images/landing/trust-at-door.png" alt="Homeowner welcoming a trusted worker" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━ How It Works — Sticky Scroll ━━━ */}
      <section className="relative py-20 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Section className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 mb-4">
              {t('landing.how.badge', 'How It Works')}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
              {t('landing.how.heading_1', 'Simple for')}{' '}
              <span className="text-emerald-700">{t('landing.how.heading_2', 'everyone')}</span>
            </h2>
          </Section>

          {/* Desktop: Sticky scroll */}
          <div className="hidden lg:grid grid-cols-2 gap-16">
            <div className="relative">
              <div className="sticky top-[15vh] flex items-center justify-center">
                <div className="relative w-[280px] h-[480px] rounded-[2.5rem] bg-zinc-900 p-3 shadow-2xl shadow-black/20">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-2xl z-10" />
                  <div className="w-full h-full rounded-[2rem] bg-white overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      {activeStep === 0 && (
                        <motion.div key="step0" {...stepVisual} transition={{ duration: 0.4 }} className="absolute inset-0 p-5 flex flex-col">
                          <div className="text-center mt-8 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3"><Phone className="w-7 h-7 text-emerald-700" /></div>
                            <p className="font-bold text-sm text-zinc-900">{t('landing.how.ws1_title', 'Sign up with your phone')}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2.5 px-2">
                            {['Cleaning', 'Garden', 'Paint', 'Weld', 'Electric', 'Plumb', 'Build', 'Pool', 'Fix'].map((e, i) => (
                              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.06, type: 'spring', stiffness: 400 }}
                                className="aspect-square rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-[10px] font-medium text-zinc-600 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                                {e}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {activeStep === 1 && (
                        <motion.div key="step1" {...stepVisual} transition={{ duration: 0.4 }} className="absolute inset-0 p-4 flex flex-col">
                          <div className="flex items-center gap-2 mb-4 mt-6">
                            <div className="flex-1 h-9 rounded-full bg-zinc-100 flex items-center px-3"><Search className="w-4 h-4 text-zinc-400" /><span className="text-xs text-zinc-400 ml-2">Search workers...</span></div>
                          </div>
                          {[
                            { name: 'Thandi M.', role: 'Domestic Worker', rating: '4.9' },
                            { name: 'Sipho K.', role: 'Gardener', rating: '4.8' },
                            { name: 'Nomsa D.', role: 'Domestic Worker', rating: '5.0' },
                          ].map((w, i) => (
                            <motion.div key={i} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.15 }}
                              className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 mb-2">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-700">{w.name.split(' ').map(n => n[0]).join('')}</div>
                              <div className="flex-1 min-w-0"><p className="font-semibold text-xs truncate">{w.name}</p><p className="text-[10px] text-zinc-500">{w.role}</p></div>
                              <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-[10px] font-medium">{w.rating}</span></div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      {activeStep === 2 && (
                        <motion.div key="step2" {...stepVisual} transition={{ duration: 0.4 }} className="absolute inset-0 p-5 flex flex-col items-center justify-center">
                          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                            className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-9 h-9 text-emerald-700" />
                          </motion.div>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-bold text-base text-zinc-900 mb-1">Booking Sent</motion.p>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-xs text-zinc-500 text-center mb-6">Thandi will confirm shortly</motion.p>
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                            className="w-full rounded-xl bg-zinc-50 border border-zinc-100 p-3 space-y-2">
                            <div className="flex justify-between text-xs"><span className="text-zinc-500">Service</span><span className="font-medium">Deep Clean</span></div>
                            <div className="flex justify-between text-xs"><span className="text-zinc-500">Date</span><span className="font-medium">Mon, 10 Mar</span></div>
                            <div className="flex justify-between text-xs"><span className="text-zinc-500">Time</span><span className="font-medium">08:00 – 14:00</span></div>
                          </motion.div>
                        </motion.div>
                      )}
                      {activeStep === 3 && (
                        <motion.div key="step3" {...stepVisual} transition={{ duration: 0.4 }} className="absolute inset-0 p-5 flex flex-col items-center justify-center">
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-bold text-sm text-zinc-900 mb-3">How was Thandi?</motion.p>
                          <div className="flex gap-1.5 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <motion.div key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 400 }}>
                                <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                              </motion.div>
                            ))}
                          </div>
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-xs text-zinc-500 text-center mb-5">Your review helps Thandi find more work</motion.p>
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                            className="w-full h-20 rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                            <span className="text-xs text-zinc-400">Write a review...</span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-[10vh] pb-[20vh]">
              {[
                { step: 0, icon: Phone, title: t('landing.how.ws1_title', 'Sign up with your phone'), desc: t('landing.how.ws1_desc', 'Tap icons to pick your skills. No typing, no forms, no email needed.'), sub: t('landing.how.cs1_desc', 'Filter by what you need, how far away, and how well they\'re rated.') },
                { step: 1, icon: Search, title: t('landing.how.ws2_title', 'Get found by households nearby'), desc: t('landing.how.ws2_desc', 'Your profile, rating, and availability show up when people search your area.'), sub: t('landing.how.cs2_desc', 'Read reviews, see verification badges, look at their work history.') },
                { step: 2, icon: MessageSquare, title: t('landing.how.ws3_title', 'Choose the jobs you want'), desc: t('landing.how.ws3_desc', 'Accept or decline. Set your own rates and schedule. You\'re in charge.'), sub: t('landing.how.cs3_desc', 'Send a request or chat first. Sort out the details between you.') },
                { step: 3, icon: Star, title: t('landing.how.ws4_title', 'Grow with every job'), desc: t('landing.how.ws4_desc', 'Good work earns reviews. Reviews earn more bookings. It compounds.'), sub: t('landing.how.cs4_desc', 'Your rating helps good workers get seen. It keeps the whole community honest.') },
              ].map((s, i, arr) => {
                const StepIcon = s.icon
                return (
                  <HowItWorksStep key={s.step} step={s.step} isFirst={i === 0} isLast={i === arr.length - 1} onActivate={setActiveStep}>
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
                      <StepIcon className="w-5 h-5 text-zinc-700" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">{s.step + 1}</span>
                      <h4 className="text-xl font-bold text-zinc-900">{s.title}</h4>
                    </div>
                    <p className="text-zinc-500 leading-relaxed mb-3">{s.desc}</p>
                    <div className="flex items-start gap-2 text-sm text-zinc-500 bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                      <Users className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                      <span><span className="font-medium text-zinc-900">Households:</span> {s.sub}</span>
                    </div>
                  </HowItWorksStep>
                )
              })}
            </div>
          </div>

          {/* Mobile: Simple vertical cards */}
          <div className="lg:hidden grid md:grid-cols-2 gap-8">
            <Section>
              <div className="rounded-2xl p-8 border border-zinc-200 bg-white">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-zinc-900">
                  <Briefcase className="w-5 h-5 text-emerald-700" /> {t('landing.how.worker_title', "If you're a worker")}
                </h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: t('landing.how.ws1_title', 'Sign up with your phone'), desc: t('landing.how.ws1_desc', 'Tap icons to pick your skills. No typing, no forms, no email needed.') },
                    { step: '2', title: t('landing.how.ws2_title', 'Get found by households nearby'), desc: t('landing.how.ws2_desc', 'Your profile, rating, and availability show up when people search your area.') },
                    { step: '3', title: t('landing.how.ws3_title', 'Choose the jobs you want'), desc: t('landing.how.ws3_desc', 'Accept or decline. Set your own rates and schedule. You\'re in charge.') },
                    { step: '4', title: t('landing.how.ws4_title', 'Grow with every job'), desc: t('landing.how.ws4_desc', 'Good work earns reviews. Reviews earn more bookings. It compounds.') },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.step}</div>
                      <div><h4 className="font-semibold text-sm text-zinc-900">{s.title}</h4><p className="text-sm text-zinc-500 mt-0.5">{s.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section delay={0.15}>
              <div className="rounded-2xl p-8 border border-zinc-200 bg-white">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-zinc-900">
                  <Users className="w-5 h-5 text-blue-700" /> {t('landing.how.client_title', "If you need help at home")}
                </h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: t('landing.how.cs1_title', 'Search your area'), desc: t('landing.how.cs1_desc', 'Filter by what you need, how far away, and how well they\'re rated.') },
                    { step: '2', title: t('landing.how.cs2_title', 'Check their profile'), desc: t('landing.how.cs2_desc', 'Read reviews, see verification badges, look at their work history.') },
                    { step: '3', title: t('landing.how.cs3_title', 'Book or message directly'), desc: t('landing.how.cs3_desc', 'Send a request or chat first. Sort out the details between you.') },
                    { step: '4', title: t('landing.how.cs4_title', 'Leave an honest review'), desc: t('landing.how.cs4_desc', 'Your rating helps good workers get seen. It keeps the whole community honest.') },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.step}</div>
                      <div><h4 className="font-semibold text-sm text-zinc-900">{s.title}</h4><p className="text-sm text-zinc-500 mt-0.5">{s.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ━━━ Services — Clean Typography ━━━ */}
      <section id="services" className="py-20 md:py-28 bg-zinc-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Section className="mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 mb-6">
              {t('landing.services.badge', 'Services')}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
              {t('landing.services.heading_1', 'One platform.')}{' '}
              <span className="text-emerald-700">{t('landing.services.heading_2', 'Every skill you need.')}</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-500 max-w-xl">
              {t('landing.services.subtext', 'From daily household help to skilled trades. Workers list what they do. You find exactly who you need.')}
            </p>
          </Section>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {services.map((name) => (
              <motion.div key={name} variants={scaleIn} transition={{ duration: 0.4 }}
                className="px-4 py-3.5 rounded-xl bg-white border border-zinc-200 text-center font-medium text-sm text-zinc-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors cursor-default">
                {name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ Stories — Featured Layout ━━━ */}
      <section id="stories" className="py-20 md:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Section className="mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200 mb-6">
              {t('landing.stories.badge', 'From the Community')}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
              {t('landing.stories.heading_1', 'Real people.')}{' '}
              <span className="text-emerald-700">{t('landing.stories.heading_2', 'Real difference.')}</span>
            </h2>
          </Section>

          {/* Featured story + grid */}
          <div className="grid lg:grid-cols-5 gap-5">
            {/* Featured — large */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.6 }}
              className="lg:col-span-3 relative rounded-2xl overflow-hidden min-h-[320px] lg:min-h-[480px] flex items-end">
              <Image src={stories[0].image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative p-6 md:p-10">
                <p className="text-white text-lg md:text-xl font-medium leading-relaxed mb-4 max-w-lg">&ldquo;{stories[0].quote}&rdquo;</p>
                <p className="text-white/80 text-sm font-semibold">{stories[0].name}</p>
                <p className="text-white/60 text-xs">{stories[0].role}</p>
              </div>
            </motion.div>

            {/* Side stories */}
            <div className="lg:col-span-2 grid gap-5">
              {stories.slice(1, 4).map((story, i) => (
                <motion.div key={story.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-5 rounded-2xl border border-zinc-100 bg-white hover:shadow-sm transition-shadow">
                  <p className="text-zinc-700 leading-relaxed text-sm mb-4">&ldquo;{story.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-sm text-zinc-900">{story.name}</p>
                    <p className="text-xs text-zinc-500">{story.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Second row */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 gap-5 mt-5">
            {stories.slice(4).map((story) => (
              <motion.div key={story.name} variants={fadeUp} transition={{ duration: 0.5 }}
                className="p-5 rounded-2xl border border-zinc-100 bg-white hover:shadow-sm transition-shadow">
                <p className="text-zinc-700 leading-relaxed text-sm mb-4">&ldquo;{story.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm text-zinc-900">{story.name}</p>
                  <p className="text-xs text-zinc-500">{story.role}</p>
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

      {/* ━━━ CTA — Full-bleed Image Background ━━━ */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <Image src="/images/landing/braai-share.png" alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-zinc-900/75" />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <Section>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {t('landing.cta.heading_1', 'South Africa runs on domestic work.')}<br />
                <span className="text-emerald-300">{t('landing.cta.heading_2', "It's time it worked for everyone.")}</span>
              </h2>
              <p className="mt-6 text-lg text-zinc-300 leading-relaxed max-w-xl">
                {t('landing.cta.body', "Every worker who builds a profile creates proof of their skill. Every household that books builds trust in the community. Together, we're building something South Africa has never had.")}
              </p>
            </Section>

            <Section delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-zinc-300">
                {[
                  t('landing.cta.pill1', 'Workers keep 100% of earnings'),
                  t('landing.cta.pill2', 'ID and background verification'),
                  t('landing.cta.pill3', 'All 11 SA languages'),
                ].map((text) => (
                  <span key={text} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {text}
                  </span>
                ))}
              </div>
            </Section>

            <Section delay={0.3}>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <MagneticButton>
                  <Link href="/register/worker"
                    className="group inline-flex items-center justify-center gap-2 bg-white text-zinc-900 px-7 py-3.5 rounded-full text-base font-semibold hover:bg-zinc-100 transition-colors">
                    {t('landing.cta.register_worker', 'Register as a Worker')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link href="/register"
                    className="group inline-flex items-center justify-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-full text-base font-semibold hover:bg-white/10 transition-colors">
                    {t('landing.cta.find_worker', 'Find a Worker')}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
      <footer className="border-t border-zinc-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo />
              <p className="text-sm text-zinc-500 leading-relaxed mt-4 max-w-xs">
                The trusted network for verified domestic workers and households in South Africa.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-zinc-900">{t('landing.footer.for_workers', 'For Workers')}</h4>
              <ul className="space-y-3">
                <li><Link href="/register/worker" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.footer.register', 'Register')}</Link></li>
                <li><Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.nav.login', 'Log In')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-zinc-900">{t('landing.footer.for_households', 'For Households')}</h4>
              <ul className="space-y-3">
                <li><Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.footer.find_workers', 'Find Workers')}</Link></li>
                <li><Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.footer.sign_in', 'Sign In')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-zinc-900">{t('landing.footer.legal', 'Legal')}</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.footer.terms', 'Terms of Service')}</Link></li>
                <li><Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">{t('landing.footer.privacy', 'Privacy Policy')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} {t('landing.footer.copyright', 'DomestIQ. All rights reserved.')}</p>
            <p className="text-xs text-zinc-400">{t('landing.footer.disclaimer', 'DomestIQ is a matching platform. We do not create an employment relationship between users.')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
