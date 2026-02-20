'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, CalendarDays, MapPin, Star } from 'lucide-react'

const counters = [
  { icon: Users, value: 500, suffix: '+', label: 'Workers Registered', color: 'text-emerald-400' },
  { icon: CalendarDays, value: 1200, suffix: '+', label: 'Bookings Made', color: 'text-sky-400' },
  { icon: MapPin, value: 9, suffix: '', label: 'Cities Served', color: 'text-amber-400' },
  { icon: Star, value: 4.8, suffix: '', label: 'Average Rating', color: 'text-rose-400', decimal: true },
]

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

  return (
    <section ref={ref} className="relative border-y bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-10" />
      <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[80px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Growing every day across{' '}
            <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">Mzansi</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {counters.map((c, i) => {
            const Icon = c.icon
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <Icon className={`w-6 h-6 ${c.color} mx-auto mb-3`} />
                <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  <AnimatedCounter value={c.value} suffix={c.suffix} decimal={c.decimal} inView={inView} />
                </p>
                <p className="text-sm text-gray-400 mt-2">{c.label}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
