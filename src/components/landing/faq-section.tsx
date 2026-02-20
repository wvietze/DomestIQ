'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/hooks/use-translation'

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-gray-200 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-semibold text-[15px] pr-4 group-hover:text-emerald-700 transition-colors">{q}</span>
        <ChevronDown className={cn(
          'w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300',
          open && 'rotate-180 text-emerald-600'
        )} />
      </button>
      <div className={cn(
        'grid transition-all duration-300 ease-in-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}>
        <div className="overflow-hidden">
          <p className="pb-5 text-muted-foreground leading-relaxed text-sm">{a}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function FaqSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { t } = useTranslation()

  const faqs = useMemo(() => [
    { q: t('landing.faq.q1', 'Is DomestIQ really free for workers?'), a: t('landing.faq.a1', 'Yes, 100% free. Workers keep every rand they earn. We never take a commission from worker earnings. The platform is funded by a small service fee paid by households.') },
    { q: t('landing.faq.q2', 'Do I need a smartphone to use DomestIQ?'), a: t('landing.faq.a2', 'You need a phone that can access the internet. DomestIQ works on any smartphone browser — Android or iPhone. No app download needed. You can even add it to your home screen.') },
    { q: t('landing.faq.q3', 'How does worker verification work?'), a: t('landing.faq.a3', 'Workers can upload their SA ID and criminal clearance certificate. Our team verifies these documents and awards a gold shield badge to fully verified workers. Verified workers get more bookings.') },
    { q: t('landing.faq.q4', 'Is my personal information safe?'), a: t('landing.faq.a4', 'DomestIQ is fully compliant with the POPI Act. Your personal data is encrypted, never sold to third parties, and only shared with your explicit consent.') },
    { q: t('landing.faq.q5', 'Which areas does DomestIQ serve?'), a: t('landing.faq.a5', 'We currently serve major metros including Johannesburg, Cape Town, Durban, Pretoria, and Port Elizabeth. We are expanding to more cities. Register now even if your area is not yet listed.') },
    { q: t('landing.faq.q6', 'How does the booking process work?'), a: t('landing.faq.a6', 'Households search for workers by service type and location, view profiles and reviews, then book a date and time. Workers receive the request and can accept or decline. You can also message workers directly to discuss details before booking.') },
    { q: t('landing.faq.q7', 'Can I book a worker for a once-off job?'), a: t('landing.faq.a7', 'Absolutely. DomestIQ supports both once-off and recurring bookings. Whether you need a one-time deep clean or a weekly gardener, we have you covered.') },
    { q: t('landing.faq.q8', 'What languages does DomestIQ support?'), a: t('landing.faq.a8', 'DomestIQ supports all 11 official South African languages including English, isiZulu, isiXhosa, Afrikaans, Sesotho, and more. Workers can register and communicate in their preferred language.') },
  ], [t])

  return (
    <section id="faq" className="py-24 md:py-32 bg-gradient-to-b from-white to-gray-50/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200 mb-4">
            {t('landing.faq.badge', 'FAQ')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {t('landing.faq.heading_1', 'Got')}{' '}
            <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{t('landing.faq.heading_2', 'questions?')}</span>
          </h2>
        </motion.div>

        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-200 px-6">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
