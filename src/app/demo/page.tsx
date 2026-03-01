'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Logo } from '@/components/shared/logo'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import {
  Briefcase, Home, Search, CalendarDays, MessageSquare,
  Star, User, Settings, Bell, Wallet, ShieldCheck,
  UserCheck, LayoutDashboard, ArrowRight, Loader, Eye
} from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }

const workerPages = [
  { href: '/worker-dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'emerald' },
  { href: '/worker-profile', label: 'My Profile', icon: User, color: 'emerald' },
  { href: '/worker-profile/edit', label: 'Edit Profile', icon: Settings, color: 'emerald' },
  { href: '/worker-bookings', label: 'Bookings', icon: CalendarDays, color: 'emerald' },
  { href: '/worker-calendar', label: 'Calendar', icon: CalendarDays, color: 'sky' },
  { href: '/worker-messages', label: 'Messages', icon: MessageSquare, color: 'violet' },
  { href: '/worker-reviews', label: 'Reviews', icon: Star, color: 'amber' },
  { href: '/worker-earnings', label: 'Earnings', icon: Wallet, color: 'emerald' },
  { href: '/worker-notifications', label: 'Notifications', icon: Bell, color: 'amber' },
  { href: '/worker-settings', label: 'Settings', icon: Settings, color: 'gray' },
]

const clientPages = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'blue' },
  { href: '/search', label: 'Find Workers', icon: Search, color: 'emerald' },
  { href: '/bookings', label: 'My Bookings', icon: CalendarDays, color: 'blue' },
  { href: '/bookings/new', label: 'New Booking', icon: CalendarDays, color: 'emerald' },
  { href: '/messages', label: 'Messages', icon: MessageSquare, color: 'violet' },
  { href: '/reviews', label: 'Reviews', icon: Star, color: 'amber' },
  { href: '/profile', label: 'Profile', icon: User, color: 'blue' },
  { href: '/notifications', label: 'Notifications', icon: Bell, color: 'amber' },
]

const adminPages = [
  { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, color: 'red' },
  { href: '/admin/users', label: 'User Management', icon: UserCheck, color: 'blue' },
  { href: '/admin/verifications', label: 'Verifications', icon: ShieldCheck, color: 'emerald' },
  { href: '/admin/moderation', label: 'Moderation', icon: ShieldCheck, color: 'amber' },
]

const demoPages = [
  { href: '/demo/worker-profile', label: 'Worker Profile Demo', icon: Eye, color: 'emerald' },
  { href: '/demo/loading-animations', label: 'Loading Animations', icon: Loader, color: 'amber' },
]

const otherPages = [
  { href: '/', label: 'Landing Page', icon: Home, color: 'emerald' },
  { href: '/login', label: 'Login', icon: User, color: 'blue' },
  { href: '/register', label: 'Register', icon: User, color: 'emerald' },
  { href: '/register/worker', label: 'Worker Registration', icon: Briefcase, color: 'emerald' },
  { href: '/register/client', label: 'Client Registration', icon: Home, color: 'blue' },
  { href: '/terms', label: 'Terms of Service', icon: ShieldCheck, color: 'gray' },
  { href: '/privacy', label: 'Privacy Policy', icon: ShieldCheck, color: 'gray' },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100',
  blue: 'bg-blue-50 text-blue-700 group-hover:bg-blue-100',
  sky: 'bg-sky-50 text-sky-700 group-hover:bg-sky-100',
  amber: 'bg-amber-50 text-amber-700 group-hover:bg-amber-100',
  violet: 'bg-violet-50 text-violet-700 group-hover:bg-violet-100',
  red: 'bg-red-50 text-red-700 group-hover:bg-red-100',
  gray: 'bg-gray-100 text-gray-700 group-hover:bg-gray-200',
}

function PageSection({ title, description, pages }: { title: string; description: string; pages: typeof workerPages }) {
  return (
    <motion.div variants={fadeUp}>
      <h2 className="text-lg font-bold mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pages.map(page => {
          const Icon = page.icon
          return (
            <Link
              key={page.href}
              href={page.href}
              className="group flex items-center gap-3 rounded-xl border p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${colorMap[page.color]}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{page.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{page.href}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function DemoPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 pb-12"
    >
      <motion.div variants={fadeUp} className="text-center space-y-3 pt-6">
        <div className="flex items-center justify-center gap-4">
          <Logo size="large" />
          <LanguageSwitcher />
        </div>
        <h1 className="text-2xl font-bold">Demo Navigator</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Browse all pages in the app. DEV_MODE is on - no login required.
          Pages show empty states since there is no real database data.
        </p>
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Development Mode Active
        </div>
      </motion.div>

      <PageSection
        title="Worker Views"
        description="The mobile-first worker experience - bottom nav, large tap targets"
        pages={workerPages}
      />

      <PageSection
        title="Client / Household Views"
        description="The client dashboard with sidebar navigation"
        pages={clientPages}
      />

      <PageSection
        title="Admin Panel"
        description="Platform management and moderation tools"
        pages={adminPages}
      />

      <PageSection
        title="Component Demos"
        description="Interactive demos with mock data — no auth required"
        pages={demoPages}
      />

      <PageSection
        title="Public & Auth Pages"
        description="Landing page, login, registration, and legal pages"
        pages={otherPages}
      />
    </motion.div>
  )
}
