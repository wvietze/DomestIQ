'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from '@/lib/hooks/use-translation'

function AnimatedCounter({ value, suffix, decimal, inView }: { value: number; suffix: string; decimal?: boolean; inView: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    const duration = 2000
    const steps = 60
    const stepTime = duration / steps
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(increment * step, value)
      setCount(current)
      if (step >= steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span>
      {decimal ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  )
}

export function AnimatedCountersSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const { t } = useTranslation()

  const counters = useMemo(() => [
    { icon: 'group', value: 500, suffix: '+', label: t('landing.counters.c1', 'Workers Registered'), color: 'text-[#9ffdd3]' },
    { icon: 'event', value: 1200, suffix: '+', label: t('landing.counters.c2', 'Bookings Made'), color: 'text-[#97f5cc]' },
    { icon: 'location_on', value: 9, suffix: '', label: t('landing.counters.c3', 'Cities Served'), color: 'text-[#ffdcc3]' },
    { icon: 'star', value: 4.8, suffix: '', label: t('landing.counters.c4', 'Average Rating'), color: 'text-[#fe932c]', decimal: true },
  ], [t])

  return (
    <section ref={ref} className="relative border-y border-[#1a1c1b] bg-[#1a1c1b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-10" />
      <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-[#005d42]/20 blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-[#fe932c]/10 blur-[80px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {t('landing.counters.heading_1', 'Growing every day across')}{' '}
            <span className="text-[#9ffdd3]">{t('landing.counters.heading_2', 'Mzansi')}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {counters.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <span className={`material-symbols-outlined text-2xl ${c.color} mx-auto mb-3 block`}>{c.icon}</span>
              <p className="text-4xl md:text-5xl font-extrabold text-white">
                <AnimatedCounter value={c.value} suffix={c.suffix} decimal={c.decimal} inView={inView} />
              </p>
              <p className="text-sm text-[#bdc9c1] mt-2">{c.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
