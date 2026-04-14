'use client'

import { useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from '@/lib/hooks/use-translation'

const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

export function TrustBadgesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { t } = useTranslation()

  const badges = useMemo(() => [
    { icon: 'lock', title: t('landing.trust.t1_title', 'POPIA Compliant'), desc: t('landing.trust.t1_desc', 'Your data is protected under SA law'), color: 'text-[#005d42]', bg: 'bg-[#9ffdd3]/40' },
    { icon: 'verified_user', title: t('landing.trust.t2_title', 'ID Verified Workers'), desc: t('landing.trust.t2_desc', 'Document verification by our team'), color: 'text-[#005d42]', bg: 'bg-[#9ffdd3]/40' },
    { icon: 'chat', title: t('landing.trust.t3_title', 'Safe Messaging'), desc: t('landing.trust.t3_desc', 'Chat securely through the platform'), color: 'text-[#005d42]', bg: 'bg-[#9ffdd3]/40' },
    { icon: 'fingerprint', title: t('landing.trust.t4_title', 'Background Checks'), desc: t('landing.trust.t4_desc', 'Criminal clearance certificates'), color: 'text-[#904d00]', bg: 'bg-[#ffdcc3]/40' },
    { icon: 'group', title: t('landing.trust.t5_title', '500+ Workers'), desc: t('landing.trust.t5_desc', 'Growing network across SA'), color: 'text-[#904d00]', bg: 'bg-[#ffdcc3]/40' },
    { icon: 'star', title: t('landing.trust.t6_title', '4.8 Rating'), desc: t('landing.trust.t6_desc', 'Average worker satisfaction score'), color: 'text-[#904d00]', bg: 'bg-[#ffdcc3]/40' },
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-[#9ffdd3] text-[#005d42] border border-[#97f5cc] mb-4">
            {t('landing.trust.badge', 'Trust & Safety')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1b]">
            {t('landing.trust.heading_1', 'Built on')}{' '}
            <span className="text-[#005d42]">{t('landing.trust.heading_2', 'trust')}</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {badges.map((badge) => (
            <motion.div
              key={badge.title}
              variants={scaleIn}
              transition={{ duration: 0.4 }}
              className="group p-5 rounded-2xl bg-white border border-[#e8e8e6] hover:border-[#bdc9c1] hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className={`w-12 h-12 rounded-xl ${badge.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <span className={`material-symbols-outlined text-2xl ${badge.color}`}>{badge.icon}</span>
              </div>
              <h3 className="font-bold text-sm mb-1 text-[#1a1c1b]">{badge.title}</h3>
              <p className="text-xs text-[#3e4943]">{badge.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
