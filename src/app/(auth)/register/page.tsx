'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Briefcase, Home, ArrowRight, Shield, Smartphone, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/hooks/use-translation'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }

const roles = [
  {
    href: '/register/worker',
    titleKey: 'auth.worker',
    titleFallback: "I'm a Worker",
    subtitle: 'Find consistent work near you',
    icon: Briefcase,
    gradient: 'from-amber-500 via-emerald-600 to-teal-600',
    hoverBg: 'hover:border-emerald-200 hover:bg-emerald-50/50',
    iconBg: 'bg-gradient-to-br from-amber-500/10 to-emerald-600/10',
    iconColor: 'text-emerald-600',
    badges: [
      { icon: Smartphone, label: 'Phone-friendly' },
      { icon: Shield, label: 'Keep 100% earnings' },
      { icon: Star, label: 'Build reputation' },
    ],
  },
  {
    href: '/register/client',
    titleKey: 'auth.client',
    titleFallback: "I'm looking for a Worker",
    subtitle: 'Find trusted workers near you',
    icon: Home,
    gradient: 'from-sky-500 to-blue-600',
    hoverBg: 'hover:border-blue-200 hover:bg-blue-50/50',
    iconBg: 'bg-gradient-to-br from-sky-500/10 to-blue-600/10',
    iconColor: 'text-blue-600',
    badges: [
      { icon: Shield, label: 'Verified workers' },
      { icon: Star, label: 'Rated & reviewed' },
    ],
  },
]

export default function RegisterPage() {
  const { t } = useTranslation()

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Join DomestIQ</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          How would you like to use DomestIQ?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <motion.div key={role.href} variants={fadeUp} transition={{ duration: 0.5 }}>
              <Link href={role.href} className="group block">
                <div className={cn(
                  'relative h-full rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-transparent p-6 text-center transition-all duration-300 overflow-hidden',
                  role.hoverBg,
                  'hover:shadow-lg hover:-translate-y-1'
                )}>
                  <div className="relative">
                    <div className={cn('mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl', role.iconBg)}>
                      <Icon className={cn('h-8 w-8', role.iconColor)} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t(role.titleKey, role.titleFallback)}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{role.subtitle}</p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {role.badges.map(badge => {
                        const BadgeIcon = badge.icon
                        return (
                          <span key={badge.label} className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-gray-100 rounded-full px-2.5 py-1">
                            <BadgeIcon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        )
                      })}
                    </div>

                    <div className={cn(
                      'mt-5 inline-flex items-center gap-1.5 text-sm font-semibold',
                      role.iconColor
                    )}>
                      Get started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-emerald-600 hover:underline">{t('auth.login', 'Log In')}</Link>
      </motion.p>
    </motion.div>
  )
}
