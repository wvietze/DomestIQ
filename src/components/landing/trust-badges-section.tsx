'use client'

import { useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { Lock, ShieldCheck, MessageSquare, Fingerprint, Users, Star } from 'lucide-react'
import { useTranslation } from '@/lib/hooks/use-translation'

const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

export function TrustBadgesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { t } = useTranslation()

  const badges = useMemo(() => [
    { icon: Lock, title: t('landing.trust.t1_title', 'POPIA Compliant'), desc: t('landing.trust.t1_desc', 'Your data is protected under SA law'), color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: ShieldCheck, title: t('landing.trust.t2_title', 'ID Verified Workers'), desc: t('landing.trust.t2_desc', 'Document verification by our team'), color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: MessageSquare, title: t('landing.trust.t3_title', 'Safe Messaging'), desc: t('landing.trust.t3_desc', 'Chat securely through the platform'), color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: Fingerprint, title: t('landing.trust.t4_title', 'Background Checks'), desc: t('landing.trust.t4_desc', 'Criminal clearance certificates'), color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Users, title: t('landing.trust.t5_title', '500+ Workers'), desc: t('landing.trust.t5_desc', 'Growing network across SA'), color: 'text-rose-600', bg: 'bg-rose-50' },
    { icon: Star, title: t('landing.trust.t6_title', '4.8 Rating'), desc: t('landing.trust.t6_desc', 'Average worker satisfaction score'), color: 'text-sky-600', bg: 'bg-sky-50' },
  ], [t])

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-4">
            {t('landing.trust.badge', 'Trust & Safety')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {t('landing.trust.heading_1', 'Built on')}{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t('landing.trust.heading_2', 'trust')}</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {badges.map((badge) => {
            const Icon = badge.icon
            return (
              <motion.div
                key={badge.title}
                variants={scaleIn}
                transition={{ duration: 0.4 }}
                className="group p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className={`w-12 h-12 rounded-xl ${badge.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${badge.color}`} />
                </div>
                <h3 className="font-bold text-sm mb-1">{badge.title}</h3>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
